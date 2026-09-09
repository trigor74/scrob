// Scrob sync — playback progress: push (session start/heartbeat/complete)
// AND pull (server → Lampa.Timeline). See SYNC-ARCHITECTURE-PLAN.md §5.1/§5.2.
//
// ─── Push ───────────────────────────────────────────────────
// Ports the proven session model from the old standalone scrob.js plugin,
// against the same backend session endpoints this plugin's api.js now wraps
// (POST /history/session/start, PATCH /history/session/{key},
// POST .../complete, DELETE .../{key}).
//
// Design points carried over deliberately (see the old scrob.js, function
// onPlayerStart() onward, for the original reasoning and live-tested fixes):
// - "Watched" is decided ONLY on player destroy (real exit), never mid-
//   playback — otherwise a title reads as watched on the server while the
//   user is still actually watching (e.g. sitting through end credits).
// - A generation counter (session.gen) guards against a slow /session/start
//   response landing AFTER a newer video has already started — the stale
//   response just deletes its own orphaned server-side session instead of
//   overwriting the new one's key.
// - heartbeatInFlight coalesces rapid pause/resume into the LATEST position
//   only (network delivery order between two independent PATCH requests is
//   not guaranteed) instead of firing one PATCH per event.
// - completeSession() defers behind an in-flight heartbeat rather than racing
//   it — an out-of-order "playing" heartbeat arriving after /complete would
//   silently reopen the session on the server.
//
// ─── Pull ───────────────────────────────────────────────────
// On-demand (this file): a movie/show's own full card opening triggers
// GET /history/watch-status, written into Timeline via pullWriteTimeline().
// Bulk (continue-watching, at login/profile-switch/start) is a separate,
// later addition reusing the same pullWriteTimeline()/buildHash()/
// resolveDuration() helpers.
// - LWW against the local Timeline entry's own `updated` timestamp — never
//   blindly overwrites a possibly-newer local value (§5.2.3).
// - `syncingFromServer` guards onTimelineUpdate() against mistaking a pull's
//   own Timeline.update() echo for real local playback, and pullWriteTimeline()
//   additionally refuses to touch the hash of whatever is actively playing
//   right now — both needed because the active session's own local
//   `road.updated` only refreshes every ~2min (Lampa's natural cycle), not
//   every heartbeat, so LWW alone doesn't protect it.
// - "Watched" with no real progress writes percent:100 (matching how Lampa's
//   own "Просмотрено" menu action marks a file watched, not a Favorite('viewed')
//   toggle — that's a different, whole-card status, see §5.2.4/§5.3).
//
// Deliberately NOT ported (out of scope for this module):
// - Manual watched-mark clicks outside the player (Lampa.Timeline updates
//   with no active session) — that is the "viewed" Favorite-mark sync,
//   a separate later phase (SYNC-ARCHITECTURE-PLAN.md §5.3).
// - Grace-period undo window and a persisted offline queue — failed
//   heartbeat/complete calls are retried via this plugin's own list-sync
//   retry queue (engine.js's enqueueRetry) instead of a second, separate
//   Lampa.Storage-backed queue.

import * as api from '../api'
import { enqueueRetry } from './engine'
import { KEYS, hasSession } from '../storage'

var WATCHED_THRESHOLD_PERCENT = 90
var HEARTBEAT_THROTTLE_MS = 15000   // periodic heartbeat driven by Timeline updates
var SAME_STATE_GUARD_MS = 3000      // native pause/playing: ignore immediate repeats
var SEEK_GUARD_MS = 1500            // native seeked: ignore right after another heartbeat

var running = false
var listenersBound = false
var profileListener = null // Profile change listener reference (engine.js has the same field, same reason)

// Set only while pull-code (below) is writing a server-sourced value into
// Lampa.Timeline — guards onTimelineUpdate() against mistaking that echo
// for real local playback (SYNC-ARCHITECTURE-PLAN.md §5.2.3). Same pattern
// as engine.js's own `received` flag for Favorite writes, and the old
// scrob.js's `isSyncingNow`.
var syncingFromServer = false

// Single persistent session slot — mutated in place, never reassigned, so a
// stray closure holding a reference to `session` always sees the latest
// state (matches the original plugin's module-level `session` object).
// `session.card` falsy means "no active player session" everywhere below.
var session = {
    card: null,
    isSeries: false,
    season: null,
    episode: null,
    expectedHash: null,
    duration: 0,
    lastPercent: 0,
    lastTimeSeconds: 0,
    expectedStartPercent: 0,
    lastUpdateTime: 0,
    completed: false,
    lastReportedState: null,
    playbackErrored: false,
    heartbeatInFlight: false,
    pendingHeartbeat: null,
    key: null,
    started: false,
    destroyedBeforeStart: false,
    gen: 0
}

// Set only while completeSession() is deferred behind an in-flight
// heartbeat — module-level (not session.*) because it must still resolve
// correctly even if resetSessionState() runs before that heartbeat returns.
var pendingCompleteAfterHeartbeat = null

function resetSessionState() {
    session.key = null
    session.card = null
    session.season = null
    session.episode = null
    session.expectedHash = null
    session.duration = 0
    session.lastPercent = 0
    session.lastTimeSeconds = 0
    session.expectedStartPercent = 0
    session.completed = false
    session.lastReportedState = null
    session.playbackErrored = false
    session.heartbeatInFlight = false
    session.pendingHeartbeat = null
    session.started = false
    session.destroyedBeforeStart = false
}

// ─── Identification ────────────────────────────────────────

// Direct season/episode fields on the Player 'start' event data, when the
// source already provides them (the common case).
function extractSeasonEpisode(obj) {
    if (!obj) return {}
    var season = obj.season_number || obj.season || obj.seasonNumber || obj.s
    var episode = obj.episode_number || obj.episode || obj.episodeNumber || obj.e
    return { season: season, episode: episode }
}

// Fallback when the source gives no direct season/episode fields: brute-
// force the same hash formula Lampa's own Lampa.Timeline uses internally
// (Utils.hash on [season, separator, episode, originalName]) against the
// hash Lampa already computed for this file — this only has to search,
// never guess the formula itself. Same technique the old scrob.js and the
// third-party TraktTV plugin both independently arrived at (see
// LAMPA-TRACKING-REFERENCE.md §4.1.3/§4.2.3).
function resolveSeasonEpisode(hash, originalName) {
    if (!hash || !originalName) return {}
    for (var s = 1; s <= 40; s++) {
        var sep = s > 10 ? ':' : ''
        for (var e = 1; e <= 1500; e++) {
            if (String(Lampa.Utils.hash([s, sep, e, originalName].join(''))) === String(hash)) {
                return { season: s, episode: e }
            }
        }
    }
    return {}
}

// Best-effort runtime guess for the /session/start payload — corrected
// later from the real file duration via heartbeat's `runtime` field
// (backend/routers/history.py update_manual_session()) once the native
// 'durationchange' event or a Timeline tick reveals it.
function resolveRuntimeMinutes(card, timeline, isSeries) {
    if (timeline && timeline.duration > 0) return Math.round(timeline.duration / 60)
    if (timeline && timeline.time > 0 && timeline.percent > 0) {
        return Math.max(1, Math.round((timeline.time / (timeline.percent / 100)) / 60))
    }
    if (card && card.runtime) return card.runtime
    if (card && card.episode_run_time && card.episode_run_time.length) return card.episode_run_time[0]
    return isSeries ? 45 : 90
}

// ─── Pull: server → Lampa.Timeline (SYNC-ARCHITECTURE-PLAN.md §5.2) ────────

// Forward direction of resolveSeasonEpisode() above — same hash formula,
// building it from known identity instead of searching for one.
function buildHash(isSeries, originalName, season, episode) {
    if (!originalName) return null
    if (!isSeries) return Lampa.Utils.hash(originalName)
    var sep = season > 10 ? ':' : ''
    return Lampa.Utils.hash([season, sep, episode, originalName].join(''))
}

// Duration fallback chain for a pulled item — a manual "watched" mark can
// leave both the real playback duration AND the TMDB runtime unknown
// (§5.2.4). Same 45/90-minute constants as resolveRuntimeMinutes() above,
// for symmetry between push and pull.
function resolveDuration(item) {
    if (item.duration) return item.duration
    if (item.runtime_minutes) return item.runtime_minutes * 60
    return item.media_type === 'episode' ? 2700 : 5400
}

// Single write path for both pull triggers (on-demand and bulk) — LWW
// against the local Timeline entry, guarded against corrupting whatever
// title is actively playing right now (§5.2.3). `item` is the normalized
// shape both callers build from their own source's response fields:
// { isSeries, originalName, season, episode, watched, percent, time,
//   duration, runtimeMinutes, updatedAt }
function pullWriteTimeline(item) {
    var hash = buildHash(item.isSeries, item.originalName, item.season, item.episode)
    if (!hash) return
    if (session.card && String(hash) === String(session.expectedHash)) return // never clobber the active session

    var local = Lampa.Timeline.view(hash)
    var localTime = (local && local.updated) || 0
    var serverTime = item.updatedAt ? new Date(item.updatedAt).getTime() : 0
    if (localTime && serverTime <= localTime) return // local is not older — nothing to do

    var duration = resolveDuration({
        duration: item.duration,
        runtime_minutes: item.runtimeMinutes,
        media_type: item.isSeries ? 'episode' : 'movie'
    })
    var percent = item.watched ? 100 : (item.percent || 0)
    var time = item.watched ? duration : (item.time || 0)

    console.log('ScrobTimeline', 'pull write', { hash: hash, percent: percent, watched: item.watched })

    syncingFromServer = true
    Lampa.Timeline.update({
        hash: hash,
        percent: percent,
        time: time,
        duration: duration,
        received: true,
        updated: serverTime || Date.now()
    })
    syncingFromServer = false
}

// ─── Player lifecycle ──────────────────────────────────────

function onPlayerStart(data) {
    if (!running) return

    var card = (data && data.card) ||
        (Lampa.Activity.active() && (Lampa.Activity.active().card_data || Lampa.Activity.active().card || Lampa.Activity.active().movie))
    if (!card) {
        console.warn('ScrobTimeline', 'player start: no card found, skipping', data)
        return
    }

    var se = extractSeasonEpisode(data)
    var timeline = data && data.timeline
    var hash = timeline && timeline.hash

    if (hash && (!se.season || !se.episode)) {
        var origName = card.original_name || card.original_title || card.title || card.name
        if (origName) se = resolveSeasonEpisode(hash, origName)
    }

    var isSeries = !!(card.number_of_seasons || card.first_air_date || card.type === 'tv' || (se && se.season > 0))

    var gen = (session.gen || 0) + 1
    resetSessionState()
    session.gen = gen
    session.card = card
    session.isSeries = isSeries
    session.season = isSeries ? (se.season || 1) : null
    session.episode = isSeries ? (se.episode || 1) : null
    session.expectedHash = hash || null
    session.duration = (timeline && timeline.duration) || 0
    session.lastPercent = (timeline && timeline.percent) || 0
    session.expectedStartPercent = (timeline && timeline.percent) || 0
    session.lastUpdateTime = Date.now()

    console.log('ScrobTimeline', 'player start', {
        id: card.id, isSeries: isSeries, season: session.season, episode: session.episode,
        title: card.title || card.name, hash: session.expectedHash, gen: session.gen
    })

    startScrobSession()
}

function onTimelineUpdate(e) {
    if (!running || syncingFromServer) return
    if (!e || !e.data) return
    if (!session.card) return // no active player session — a manual click elsewhere, handled by a separate module

    var origName = session.card.original_name || session.card.original_title || session.card.title || session.card.name
    var isSeries = !!(session.card.original_name || session.season || session.episode)

    if (isSeries) {
        if (session.expectedHash) {
            if (e.data.hash !== session.expectedHash) return
        } else {
            var se = resolveSeasonEpisode(e.data.hash, origName)
            if (!se.season || !se.episode || se.season !== session.season || se.episode !== session.episode) return
        }
    } else {
        var expectedHash = Lampa.Utils.hash(session.card.original_title || session.card.title)
        if (String(expectedHash) !== String(e.data.hash)) return
    }

    var road = e.data.road || {}
    var percent = parseFloat(road.percent || 0)
    var time = parseFloat(road.time || 0)
    if (road.duration && !session.duration) session.duration = road.duration

    session.lastPercent = percent
    session.lastTimeSeconds = time

    if (!session.started || !session.key || session.completed) return

    // Threshold is deliberately NOT checked here — see module header.
    if (Date.now() - session.lastUpdateTime > HEARTBEAT_THROTTLE_MS && !session.playbackErrored) {
        sendSessionHeartbeat(time, 'playing')
    }
}

function onPlayerDestroy() {
    if (!running) return
    if (!session.card) return
    if (!hasSession()) { resetSessionState(); return }

    if (!session.key) {
        // /session/start hasn't resolved yet — startScrobSession()'s own
        // response handler will discard the session once it arrives.
        session.destroyedBeforeStart = true
        return
    }
    if (session.completed) {
        resetSessionState()
        return
    }

    console.log('ScrobTimeline', 'player destroy, final percent: ' + session.lastPercent + '%')

    if (session.lastPercent >= WATCHED_THRESHOLD_PERCENT) {
        completeScrobSession()
        resetSessionState()
    } else if (session.lastPercent < 1.5) {
        console.log('ScrobTimeline', 'exited early (<1.5%), deleting session', session.key)
        api.deleteSession(session.key, function () {}, function (err) {
            console.warn('ScrobTimeline', 'failed to delete session', err)
        })
        resetSessionState()
    } else {
        sendSessionHeartbeat(session.lastTimeSeconds, 'paused', function () {
            resetSessionState()
        })
    }
}

// ─── Native <video> events — immediate reaction, not waiting for the next
// rare Timeline update (same technique used by the old scrob.js and the
// third-party TraktTV plugin, LAMPA-TRACKING-REFERENCE.md §4.1.1/§4.2.1).

function onNativeVideoStateChange(e, state) {
    if (!running) return
    if (!session.card || !session.key || session.completed) return
    var target = e && e.target
    if (!target || target.tagName !== 'VIDEO') return

    var sameStateRecently = session.lastReportedState === state && (Date.now() - session.lastUpdateTime < SAME_STATE_GUARD_MS)
    if (sameStateRecently) return

    var currentTime = typeof target.currentTime === 'number' ? target.currentTime : session.lastTimeSeconds
    // A resumed position hasn't caught up to Lampa's own expected resume point
    // yet — a bare 0 here would otherwise erase the already-saved progress.
    if (currentTime === 0 && session.expectedStartPercent > 1.5) return

    session.lastTimeSeconds = currentTime
    session.lastReportedState = state
    trackNativePositionAndHeartbeat(currentTime, state)
}

function trackNativePositionAndHeartbeat(currentTime, state) {
    if (session.duration > 0) session.lastPercent = currentTime / session.duration * 100
    sendSessionHeartbeat(currentTime, state)
}

function onNativeVideoPause(e) { onNativeVideoStateChange(e, 'paused') }
function onNativeVideoPlaying(e) { session.playbackErrored = false; onNativeVideoStateChange(e, 'playing') }

function onNativeVideoSeeked(e) {
    if (!running) return
    if (!session.card || !session.key || session.completed) return
    if (Date.now() - session.lastUpdateTime < SEEK_GUARD_MS) return
    var target = e && e.target
    if (!target || target.tagName !== 'VIDEO' || typeof target.currentTime !== 'number') return
    var currentTime = target.currentTime
    if (currentTime === 0 && session.expectedStartPercent > 1.5) return
    var state = target.paused ? 'paused' : 'playing'
    session.lastTimeSeconds = currentTime
    session.lastReportedState = state
    trackNativePositionAndHeartbeat(currentTime, state)
}

function onNativeVideoError(e) {
    if (!running) return
    var target = e && e.target
    if (!target || target.tagName !== 'VIDEO') return
    if (!session.card || !session.key || session.completed) return
    session.playbackErrored = true
    onNativeVideoStateChange(e, 'paused')
}

function onNativeVideoDurationChange(e) {
    if (!running) return
    var target = e && e.target
    if (!target || target.tagName !== 'VIDEO') return
    if (!session.card || !session.key || session.completed) return
    if (session.duration > 0) return
    var duration = target.duration
    if (!duration || !isFinite(duration) || duration <= 0) return
    session.duration = duration
    var currentTime = typeof target.currentTime === 'number' ? target.currentTime : session.lastTimeSeconds
    trackNativePositionAndHeartbeat(currentTime, target.paused ? 'paused' : 'playing')
}

// ─── Server calls ──────────────────────────────────────────

function startScrobSession() {
    var startGen = session.gen
    var isSeries = session.isSeries
    var runtimeMinutes = resolveRuntimeMinutes(
        session.card,
        { duration: session.duration, time: session.lastTimeSeconds, percent: session.lastPercent },
        isSeries
    )

    var payload = {
        tmdb_id: isSeries ? null : session.card.id,
        media_type: isSeries ? 'episode' : 'movie',
        title: session.card.title || session.card.name || 'Unknown',
        runtime: runtimeMinutes,
        reset: false
    }
    if (isSeries) {
        payload.show_tmdb_id = session.card.id
        payload.season_number = session.season
        payload.episode_number = session.episode
    }

    console.log('ScrobTimeline', 'sending session start', payload)

    api.startSession(payload, function (res) {
        if (session.gen !== startGen) {
            // A newer video already started while this was in flight — this
            // response belongs to nobody now, just clean up its orphan.
            console.log('ScrobTimeline', 'stale session/start response (gen mismatch), discarding', res)
            if (res && res.session_key) api.deleteSession(res.session_key, function () {}, function () {})
            return
        }
        if (!res || !res.session_key) {
            console.warn('ScrobTimeline', 'session/start response had no session_key', res)
            return
        }
        if (session.destroyedBeforeStart) {
            console.log('ScrobTimeline', 'player destroyed before session_key arrived, discarding', res.session_key)
            api.deleteSession(res.session_key, function () {}, function () {})
            resetSessionState()
            return
        }
        session.key = res.session_key
        session.started = true
        console.log('ScrobTimeline', 'session started, key: ' + session.key)
    }, function (err) {
        console.warn('ScrobTimeline', 'session/start request failed', err)
        if (session.gen === startGen) resetSessionState()
    })
}

// Called ONLY from onPlayerDestroy (a real exit) — see module header.
function completeScrobSession() {
    if (!session.key || session.completed) return
    session.completed = true
    var key = session.key

    if (session.heartbeatInFlight) {
        pendingCompleteAfterHeartbeat = key
        return
    }
    fireCompleteRequest(key)
}

function fireCompleteRequest(key) {
    console.log('ScrobTimeline', 'completing session', key)
    api.completeSession(key, function () {
        console.log('ScrobTimeline', 'session completed successfully', key)
    }, function (err, status) {
        // The server's own background auto-completer (90%+, independent of
        // this client) may have already completed & removed the session.
        if (status === 404) {
            console.log('ScrobTimeline', 'session already completed server-side (404)', key)
            return
        }
        console.warn('ScrobTimeline', 'failed to complete session, queued for retry', err)
        enqueueRetry({
            type: 'custom',
            run: function (done, fail) {
                api.completeSession(key, done, function (e2, s2) {
                    if (s2 === 404) { done(); return }
                    fail()
                })
            }
        })
    })
}

function sendSessionHeartbeat(timeSeconds, state, callback) {
    if (!session.key) return

    // Strict in-order delivery: two independent parallel PATCH requests are
    // not guaranteed to arrive in the order they were sent (long buffering
    // often makes the player emit pause/playing back-to-back). Coalesce into
    // the LATEST known position/state instead of firing one per event.
    if (session.heartbeatInFlight) {
        session.pendingHeartbeat = { timeSeconds: timeSeconds, state: state, callback: callback, sessionKey: session.key }
        return
    }
    session.heartbeatInFlight = true
    session.lastUpdateTime = Date.now()
    session.lastReportedState = state || 'playing'

    var key = session.key
    var payload = { progress_seconds: Math.round(timeSeconds), state: state || 'playing' }
    // The real file duration, once known — corrects the server-side percent
    // calculation away from whatever guess was sent at session start.
    if (session.duration > 0) payload.runtime = Math.round(session.duration / 60)

    function afterSettled() {
        session.heartbeatInFlight = false
        var pending = session.pendingHeartbeat
        session.pendingHeartbeat = null

        // A /complete deferred because THIS heartbeat was in flight takes
        // priority — the session is already done, a stale pending
        // intermediate heartbeat no longer means anything.
        if (pendingCompleteAfterHeartbeat && pendingCompleteAfterHeartbeat === key) {
            var completeKey = pendingCompleteAfterHeartbeat
            pendingCompleteAfterHeartbeat = null
            fireCompleteRequest(completeKey)
            return
        }
        // sessionKey may have changed (a new session started) while this was
        // in flight — a stale pending call from the PREVIOUS session is
        // simply dropped.
        if (pending && pending.sessionKey === session.key) {
            sendSessionHeartbeat(pending.timeSeconds, pending.state, pending.callback)
        }
    }

    console.log('ScrobTimeline', 'sending heartbeat', key, payload)

    api.updateSession(key, payload, function () {
        console.log('ScrobTimeline', 'heartbeat sent successfully')
        if (callback) callback()
        afterSettled()
    }, function (err, status) {
        if (status === 404) {
            // Already gone server-side (likely the same background auto-
            // completer) — mark completed locally so further pause/playing/
            // seeked don't keep hitting the same 404 through end credits.
            console.log('ScrobTimeline', 'session already gone server-side (404), marking completed locally')
            if (session.key === key) session.completed = true
            if (callback) callback()
            afterSettled()
            return
        }
        console.warn('ScrobTimeline', 'failed to send heartbeat, queued for retry', err)
        enqueueRetry({
            type: 'custom',
            run: function (done, fail) {
                api.updateSession(key, payload, done, function (e2, s2) {
                    if (s2 === 404) { done(); return }
                    fail()
                })
            }
        })
        if (callback) callback()
        afterSettled()
    })
}

// Normalizes one GET /history/watch-status item into pullWriteTimeline()'s
// shape — kept separate so the bulk pull (continue-watching, different
// field names) can build the same shape from its own response later.
function applyWatchStatusItem(item) {
    pullWriteTimeline({
        isSeries: item.media_type === 'episode',
        originalName: item.original_name,
        season: item.season_number,
        episode: item.episode_number,
        watched: !!item.watched,
        percent: item.percent,
        time: item.time,
        duration: item.duration,
        runtimeMinutes: item.runtime_minutes,
        updatedAt: item.updated_at
    })
}

// Normalizes one GET /history/continue-watching item (format_event() shape:
// nested `media`, progress fields at the top level) into
// pullWriteTimeline()'s shape. Always partial progress, never "watched" —
// /continue-watching is sourced from PlaybackProgress alone, which only
// ever holds the 5%-90% in-progress window (backend/routers/history.py).
function applyContinueWatchingItem(item) {
    var media = item.media || {}
    var isSeries = media.type === 'episode'
    pullWriteTimeline({
        isSeries: isSeries,
        originalName: isSeries ? media.show_original_title : media.original_title,
        season: media.season_number,
        episode: media.episode_number,
        watched: false,
        // format_event() passes PlaybackProgress.progress_percent through as
        // a 0-1 fraction, unlike /history/watch-status's own 0-100 `percent`.
        percent: (item.progress_percent || 0) * 100,
        time: item.progress_seconds,
        duration: null,
        runtimeMinutes: media.runtime,
        updatedAt: item.watched_at // aliases PlaybackProgress.updated_at, see format_event()
    })
}

// Bulk pull: everything currently in progress, at login/profile-switch/app
// start — so the "continue watching" row is already correct without
// waiting for the user to open each card individually (on-demand pull
// above only fires per-card). Exported for main.js to call alongside its
// existing Lampa.Timeline.read()/Lampa.Favorite.read() calls.
export function pullContinueWatching() {
    if (!running) return
    api.getContinueWatching(function (items) {
        for (var i = 0; i < items.length; i++) applyContinueWatchingItem(items[i])
    }, function (err) {
        console.warn('ScrobTimeline', 'continue-watching pull failed', err)
    })
}

// Point-in-time pull: fires when a movie/show's own full card opens (not
// episode lists, search, settings, or any other screen — 'activity' fires
// for ALL of those). Exact filter/field path ported from the old scrob.js,
// already proven against this same event (lines 677-679).
function onActivityStart(e) {
    if (!running) return
    if (!e || e.type !== 'start' || e.component !== 'full') return
    var card = e.object && (e.object.card || (e.object.data && e.object.data.movie) || e.object.movie)
    if (!card || !card.id) return

    var isSeries = !!(card.number_of_seasons || card.first_air_date || card.type === 'tv')
    api.getWatchStatus(card.id, isSeries ? 'tv' : 'movie', function (items) {
        for (var i = 0; i < items.length; i++) applyWatchStatusItem(items[i])
    }, function (err) {
        console.warn('ScrobTimeline', 'watch-status request failed', err)
    })
}

// ─── Profile switch ─────────────────────────────────────────
// switchProfile() (utils/profiles.js) never calls start()/stop() directly —
// it (like engine.js's own list-sync) just sets KEYS.ACTIVE_PROFILE_ID and
// relies on whoever cares about that to notice. engine.js has always had
// this listener (setupProfileListener() there); porting the exact same
// pattern here — a previously-missing gap, this module ran unrestarted
// across a profile switch until now.
function setupProfileListener() {
    var lastProfileId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)

    profileListener = function (e) {
        if (e.name === KEYS.ACTIVE_PROFILE_ID) {
            var newId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)
            if (newId !== lastProfileId) {
                lastProfileId = newId
                stop()
                start()
            }
        }
    }

    Lampa.Storage.listener.follow('change', profileListener)
}

// ─── Lifecycle ──────────────────────────────────────────────

export function start() {
    if (running) return
    if (!hasSession()) {
        console.warn('ScrobTimeline', 'start skipped: no session')
        return
    }
    if (!Lampa.Storage.get(KEYS.SYNC_ENABLED)) {
        console.warn('ScrobTimeline', 'start skipped: sync disabled')
        return
    }

    running = true

    if (!listenersBound) {
        Lampa.Player.listener.follow('start', onPlayerStart)
        Lampa.Player.listener.follow('destroy', onPlayerDestroy)
        Lampa.Timeline.listener.follow('update', onTimelineUpdate)
        Lampa.Listener.follow('activity', onActivityStart)
        document.addEventListener('pause', onNativeVideoPause, true)
        document.addEventListener('playing', onNativeVideoPlaying, true)
        document.addEventListener('seeked', onNativeVideoSeeked, true)
        document.addEventListener('error', onNativeVideoError, true)
        document.addEventListener('durationchange', onNativeVideoDurationChange, true)
        listenersBound = true
    }
    setupProfileListener()
    console.log('ScrobTimeline', 'started')
    // Bulk pull once per start() — covers login, the sync toggle,
    // restoreSession() on app launch, AND now a profile switch (via
    // setupProfileListener() above), without needing a separate hook at
    // each call site.
    pullContinueWatching()
}

export function stop() {
    running = false
    console.log('ScrobTimeline', 'stopped')
    // Listeners stay bound intentionally: Lampa.Player/Timeline's global
    // listener buses have no targeted unfollow-by-reference API worth
    // relying on here, and every handler above already checks `running`
    // first, making this a clean no-op while stopped.

    if (profileListener) {
        Lampa.Storage.listener.remove('change', profileListener)
        profileListener = null
    }

    resetSessionState()
}
