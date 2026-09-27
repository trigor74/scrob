// lampac: one-time manual export of accumulated bookmark/timecode data into
// Scrob (SYNC-ARCHITECTURE-PLAN.md §5.6, Варіант A). Live-verified against
// the real lampac source (Modules/Sync/Sync + Modules/Sync/TimeCode) and the
// real Lampa client (app.min.js) during design, 2026-09-16/17 — see §5.6 for
// the full trail. Summary of what that verification settled:
//
// - Lists (book/like/wath/history/look/viewed/scheduled/continued): NO
//   remote call needed. lampac's own bookmark.js already keeps
//   Lampa.Storage 'favorite' as a live mirror of the server (pullFromServer()
//   on every page load, unconditionally, when no CUB *account* login is
//   active) - the exact same data a GET /bookmark/list from here would
//   return. And engine.js's own convergeOneList() ALREADY has a "local but
//   missing on server" push step (mapping.js's localElementSet() diffed
//   against scrobElementSet()) - so any long-accumulated local Favorite
//   entries get pushed automatically by the regular sync cycle, no new code
//   needed at all. forceSync() below just makes that happen immediately
//   instead of waiting for the next poll.
// - `thrown` is the one exception: pullDropped() (engine.js) only pulls
//   server→local and prunes stale local marks, it never pushes a pre-
//   existing local-only `thrown` entry up - unlike the generic categories.
//   Re-firing Lampa.Favorite.add('thrown', card) for each already-local
//   `thrown` card is what's needed (triggers engine.js's onFavoriteAdd()
//   → pushDrop(), same as a fresh manual mark would).
// - Timecodes: GET /timecode/all requires `card_id` - lampac's own official
//   client can't bulk-fetch these either (Sync/TimeCode/plugin.js only ever
//   pulls for whatever card is CURRENTLY open, via Lampa.Storage's real
//   navigation-state 'activity' key) - so a real per-card request from here
//   is unavoidable for a genuine historical import ON AN OLDER lampac.
//   lampac 95b3a03+ (2026-09-21) adds GET /timecode/dump (whole area in one
//   response, with native identity movie-<id>/tv-<id>-s<S>e<E> per row) -
//   detected via /api/capabilities (features.timecode >= 3) and preferred
//   when present: no dependence on the local `favorite.card` pool (Lampa's
//   own history cap evicted older titles, silently dropping their
//   timecodes) and one request instead of hundreds. Any failure there
//   falls back to the per-card path, which is also all an older lampac
//   (no /api/capabilities) ever gets.
// - Host: no Lampa.Storage key holds it (`lampac_host` doesn't exist
//   anywhere in the real client - confirmed by full-repo grep; it's
//   server-side-only config for an unrelated module). bookmark.js/
//   plugin.js's own `{localhost}`/`{token}` are baked in at file-serve time,
//   not persisted. Recovered instead from the DOM: both scripts are loaded
//   via Lampa.Utils.putScriptAsync(["{localhost}/bookmark.js", ...]) (or the
//   /js/{token} form) - so an already-loaded lampac client leaves a real
//   <script src> behind carrying the exact origin (and token, if any) this
//   plugin can read directly. window.location.origin is the last-resort
//   fallback for the (rarer) case where lampac itself serves the Lampa
//   client page (self-hosted single-origin deployment) - covers most
//   remaining real setups without asking the user anything.
// - Auth params: `uid` (Lampa.Storage 'lampac_unic_id', auto-generated for
//   every lampac install, confirmed independent of any account login) and
//   `account_email` (flat Storage key, NOT nested under `account` as an
//   earlier draft of this section wrongly assumed) - both sent together
//   since lampac's own auth middleware picks whichever identity is actually
//   in use (RequestInfo.cs: token > account_email > uid > box_mac, first
//   present wins) - sending only one risks resolving the WRONG bucket for a
//   CUB-account user. `token` is included when the DOM scan recovers one,
//   but never required - `uid` alone is enough for the common anonymous-
//   device setup this was verified against live. lampac 95b3a03+ can hand
//   out the identity itself (/api/capabilities assignedUid, no accsdb
//   users): its timecode.js then writes with that uid and WITHOUT
//   account_email, so this export does the same (applyCapabilities()).

import * as api from '../api'
import * as engine from './engine'
import { resolveSeasonEpisode } from './timeline'

var WATCHED_THRESHOLD_PERCENT = 90
var PROGRESS_FLOOR_PERCENT = 1.5   // same "meaningful progress" floor used elsewhere (timeline.js)
var TIMECODE_POOL_SIZE = 5          // concurrent GET /timecode/all requests
var PUSH_PAUSE_MS = 50              // pause between sequential Scrob writes (§5.6.3 п.6)

var running = false // guards against a second export overlapping the first

// ─── Host/auth discovery (§5.6.3 п.1, revised) ─────────────

function findLampacScriptUrl() {
    var scripts = document.querySelectorAll('script[src]')
    for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src
        if (src && /\/(bookmark|timecode)(\.js|\/js\/)/.test(src)) return src
    }
    return null
}

function buildLampacAuth() {
    var scriptUrl = findLampacScriptUrl()
    var host = null
    var token = ''

    if (scriptUrl) {
        try {
            var parsed = new URL(scriptUrl)
            host = parsed.origin
            var m = parsed.pathname.match(/\/(?:bookmark|timecode)\/js\/([^/]+)/)
            if (m) token = m[1]
        } catch (e) { /* malformed src - fall through to origin fallback below */ }
    }
    if (!host) host = window.location.origin

    return {
        host: host,
        token: token,
        uid: Lampa.Storage.get('lampac_unic_id', ''),
        accountEmail: Lampa.Storage.get('account_email', ''),
        profileId: Lampa.Storage.get('lampac_profile_id', '')
    }
}

function appendParam(url, key, value) {
    if (!value) return url
    return url + (url.indexOf('?') === -1 ? '?' : '&') + key + '=' + encodeURIComponent(value)
}

// `method` - 'all' (per-card, both lampac generations) or 'dump' (whole
// area, lampac 95b3a03+); defaults to 'all'.
function buildTimecodeUrl(auth, cardId, method) {
    var url = auth.host + '/timecode/' + (method || 'all')
    url = appendParam(url, 'token', auth.token)
    url = appendParam(url, 'account_email', auth.accountEmail)
    url = appendParam(url, 'uid', auth.uid)
    url = appendParam(url, 'profile_id', auth.profileId)
    url = appendParam(url, 'card_id', cardId)
    return url
}

// ─── Local card pool (§5.6.3 п.2, revised — local only, no remote /bookmark/list) ───

function readFavoriteRaw() {
    var favorite = Lampa.Storage.get('favorite', {})
    if (typeof favorite === 'string') {
        try { favorite = JSON.parse(favorite) } catch (e) { favorite = {} }
    }
    if (!favorite || typeof favorite !== 'object') favorite = {}
    if (!Array.isArray(favorite.card)) favorite.card = []
    return favorite
}

// ─── Step: dropped titles (`thrown`) — re-fire Favorite.add so engine.js's
// own onFavoriteAdd()/pushDrop() (already live, §5.3.2) picks each one up.
// See module header for why this is the one category needing an explicit
// push instead of just forceSync().
function exportThrownList(favorite) {
    var ids = Array.isArray(favorite.thrown) ? favorite.thrown : []
    var pushed = 0
    for (var i = 0; i < ids.length; i++) {
        var card = null
        for (var c = 0; c < favorite.card.length; c++) {
            if (favorite.card[c].id == ids[i]) { card = favorite.card[c]; break }
        }
        if (!card) continue
        Lampa.Favorite.add('thrown', card)
        pushed++
    }
    return pushed
}

// ─── Timecodes (§5.6.3 п.3-4, revised) ─────────────────────

function parseTimecodeResponse(raw) {
    var out = {}
    if (!raw || typeof raw !== 'object') return out
    // accsdb marks an access-control rejection body (Core/Middlewares/
    // Accsdb.cs), not real timecode data - the whole response is invalid,
    // same as plugin.js's own update() (`if (result.accsdb) return`).
    if (raw.accsdb) return out
    for (var hash in raw) {
        var entry
        try { entry = JSON.parse(raw[hash]) } catch (e) { continue }
        if (!entry || typeof entry !== 'object') continue
        out[hash] = {
            duration: parseFloat(entry.duration) || 0,
            time: parseFloat(entry.time) || 0,
            percent: parseFloat(entry.percent) || 0,
            // Lampa.Timeline.update()'s own `updated` field (ms since epoch,
            // Date.now() on the client that wrote it) - lampac stores it
            // verbatim as SqlModel.watched_at and echoes it back here
            // unchanged (TimeCode/Controller.cs's RoadJson()/Write()) - never
            // a lampac invention, just never read here before. 0 means it was
            // never actually set (legacy row/no native write yet); addHistoryEvent's
            // own `if (watchedAt)` check already treats that as "unknown date"
            // and omits the field, so no extra handling is needed for it here.
            updated: parseFloat(entry.updated) || 0
        }
    }
    return out
}

// One card's timecode fetch → a list of {identity, percent, time, duration,
// updated} candidates. `identity` matches pushExternalWatchedMark()'s own
// shape (timeline.js) so the same downstream push helpers can be reused
// untouched.
function resolveCardTimecodes(card, raw) {
    return resolveParsedTimecodes(card, parseTimecodeResponse(raw))
}

// Same, from an already-parsed { hash: {duration, time, percent, updated} }
// map - shared with the /timecode/dump path below (its hash-only rows).
function resolveParsedTimecodes(card, timecodes) {
    var hashes = Object.keys(timecodes)
    if (!hashes.length) return []

    var isSeries = !!card.name
    var results = []

    if (!isSeries) {
        // Movie: card_id already scopes the response to this one title - if
        // several hash variants exist (different encodes), take the one with
        // the most progress rather than guessing which hash "is" the movie.
        var best = null
        for (var h = 0; h < hashes.length; h++) {
            var tc = timecodes[hashes[h]]
            if (!best || tc.percent > best.percent) best = tc
        }
        if (best) results.push({ identity: { isSeries: false, tmdbId: card.id }, percent: best.percent, time: best.time, duration: best.duration, updated: best.updated })
        return results
    }

    // Same fallback chain used elsewhere for this exact hash-matching search
    // (timeline.js's resolveManualIdentity()/onExternalPlayerStart()) - needs
    // to land on whichever name Lampa itself used when the hash now being
    // searched for was originally computed.
    var originalName = card.original_name || card.original_title || card.title || card.name
    for (var i = 0; i < hashes.length; i++) {
        var se = resolveSeasonEpisode(hashes[i], originalName)
        if (!se.season || !se.episode) continue
        var t = timecodes[hashes[i]]
        results.push({
            identity: { isSeries: true, seriesTmdbId: card.id, season: se.season, episode: se.episode },
            percent: t.percent, time: t.time, duration: t.duration, updated: t.updated
        })
    }
    return results
}

// Small fixed-size concurrency pool - mirrors the external-player batch's
// own "don't hammer the network" reasoning (§5.1.1), here against lampac's
// server instead of Scrob's. `onProgress(done, total)` - optional - fires
// after each item settles, regardless of order (concurrency 5, so item 3
// can finish before item 1) - only the running count is meaningful here,
// not which specific item just completed.
function runPool(items, size, worker, onDone, onProgress) {
    var index = 0
    var active = 0
    var done = 0
    var results = new Array(items.length)

    function launchNext() {
        if (index >= items.length) {
            if (active === 0) onDone(results)
            return
        }
        var i = index++
        active++
        worker(items[i], function (result) {
            results[i] = result
            active--
            done++
            if (onProgress) onProgress(done, items.length)
            launchNext()
        })
    }

    if (!items.length) { onDone(results); return }
    for (var k = 0; k < Math.min(size, items.length); k++) launchNext()
}

function fetchCardTimecodes(auth, card, callback) {
    var cardId = card.id + '_' + (card.name ? 'tv' : 'movie')
    var url = buildTimecodeUrl(auth, cardId)

    var network = new Lampa.Reguest()
    network.timeout(15000)
    network.native(url, function (data) {
        network.clear()
        var raw = typeof data === 'string' ? (function () { try { return JSON.parse(data) } catch (e) { return null } })() : data
        callback(resolveCardTimecodes(card, raw))
    }, function () {
        network.clear()
        callback([])
    }, false, {})
}

// ─── lampac generation + whole-area dump (lampac 95b3a03+) ───
// An older lampac has neither /api/capabilities nor /timecode/dump - any
// failure here just means "old server", and the per-card /timecode/all path
// above runs exactly as before.

// ModuleCapabilities "timecode" contract version that introduced
// /timecode/dump (Modules/Sync/TimeCode/ModInit.cs).
var TIMECODE_DUMP_FEATURE = 3
// Native identity written by lampac's timecode.js / the tvOS client
// (TimeCode/plugin.js identify()).
var IDENTITY_MOVIE = /^movie-(\d+)$/
var IDENTITY_EPISODE = /^tv-(\d+)-s(\d+)e(\d+)$/

function requestJson(url, timeout, onSuccess, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(timeout)
    network.native(url, function (data) {
        network.clear()
        onSuccess(typeof data === 'string' ? (function () { try { return JSON.parse(data) } catch (e) { return null } })() : data)
    }, function () {
        network.clear()
        onFail()
    }, false, {})
}

// null for an older lampac (404) or anything that isn't lampac's own answer.
function fetchCapabilities(auth, callback) {
    requestJson(appendParam(auth.host + '/api/capabilities', 'token', auth.token), 10000, function (caps) {
        callback(caps && caps.lampac ? caps : null)
    }, function () { callback(null) })
}

// Same identity rule as lampac's own timecode.js: when the server hands out
// the identity (assignedUid - no accsdb users), it writes with uid=<that>
// and deliberately WITHOUT account_email (account_email outranks uid in
// lampac's identity resolution, so sending it would read another area).
function applyCapabilities(auth, caps) {
    if (!caps || !caps.assignedUid) return
    auth.uid = caps.assignedUid
    auth.accountEmail = ''
}

function supportsTimecodeDump(caps) {
    var version = caps && caps.features ? parseInt(caps.features.timecode, 10) : 0
    return version >= TIMECODE_DUMP_FEATURE
}

function parseDumpIdentity(id) {
    var m = IDENTITY_MOVIE.exec(id || '')
    if (m) return { isSeries: false, tmdbId: parseInt(m[1], 10) }
    m = IDENTITY_EPISODE.exec(id || '')
    if (m) return { isSeries: true, seriesTmdbId: parseInt(m[1], 10), season: parseInt(m[2], 10), episode: parseInt(m[3], 10) }
    return null
}

// lampac card_id ('674_movie' / '1851_tv') → the local Favorite card, the
// only place a hash-only row's original name (needed to match the hash)
// can come from.
function findFavoriteCard(favorite, cardId) {
    var parts = String(cardId).split('_')
    for (var i = 0; i < favorite.card.length; i++) {
        var card = favorite.card[i]
        if (card && card.id == parts[0] && (card.name ? 'tv' : 'movie') === parts[1]) return card
    }
    return null
}

// One candidate per title/episode - several rows can describe the same one
// (a hash-only row next to an identified one, or two encodes' hashes);
// keep the most progressed, same rule as resolveParsedTimecodes()' movies.
function keepBest(byKey, candidate) {
    var key = dedupKey(candidate.identity)
    if (!byKey[key] || candidate.percent > byKey[key].percent) byKey[key] = candidate
}

function dumpRowsToCandidates(rows, favorite) {
    var byKey = {}
    var hashOnly = {}
    var titles = {}
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        if (!row || row.deleted) continue
        if (row.card) titles[row.card] = true
        var tc = {
            duration: parseFloat(row.duration) || 0,
            time: parseFloat(row.position) || 0,
            percent: parseFloat(row.percent) || 0,
            // Same value /timecode/all returns as road.updated (ms since epoch).
            updated: parseFloat(row.watched_at) || 0
        }
        var identity = parseDumpIdentity(row.id)
        if (identity) {
            keepBest(byKey, { identity: identity, percent: tc.percent, time: tc.time, duration: tc.duration, updated: tc.updated })
            continue
        }
        if (row.card && row.hash) {
            if (!hashOnly[row.card]) hashOnly[row.card] = {}
            hashOnly[row.card][row.hash] = tc
        }
    }
    for (var cardId in hashOnly) {
        var card = findFavoriteCard(favorite, cardId)
        if (!card) continue
        var resolved = resolveParsedTimecodes(card, hashOnly[cardId])
        for (var r = 0; r < resolved.length; r++) keepBest(byKey, resolved[r])
    }
    var candidates = []
    for (var k in byKey) candidates.push(byKey[k])
    return { candidates: candidates, titles: Object.keys(titles).length }
}

// callback(null) on any failure - the caller falls back to the per-card path.
function fetchDumpCandidates(auth, favorite, callback) {
    requestJson(buildTimecodeUrl(auth, null, 'dump'), 30000, function (data) {
        if (!data || data.accsdb || !Array.isArray(data.rows)) { callback(null); return }
        callback(dumpRowsToCandidates(data.rows, favorite))
    }, function () { callback(null) })
}

// The original per-card path (both lampac generations): one /timecode/all
// per local Favorite card.
function fetchLegacyCandidates(auth, cards, onProgress, callback) {
    runPool(cards, TIMECODE_POOL_SIZE, function (card, done) {
        fetchCardTimecodes(auth, card, done)
    }, function (perCardResults) {
        var candidates = []
        for (var i = 0; i < perCardResults.length; i++) {
            var list = perCardResults[i] || []
            for (var j = 0; j < list.length; j++) candidates.push(list[j])
        }
        callback({ candidates: candidates, titles: cards.length })
    }, function (done, total) {
        if (onProgress) onProgress('timecodes', done, total)
    })
}

// ─── Dedup against Scrob (§5.6.3 п.5) ──────────────────────

function dedupKey(identity) {
    return identity.isSeries
        ? 'episode:' + identity.seriesTmdbId + ':' + identity.season + ':' + identity.episode
        : 'movie:' + identity.tmdbId
}

// Batch-status is per SHOW/MOVIE (not per episode) - one request per unique
// title covers every episode candidate belonging to it in one response.
function buildBatchStatusPool(candidates) {
    var seen = {}
    var items = []
    for (var i = 0; i < candidates.length; i++) {
        var id = candidates[i].identity
        var tmdbId = id.isSeries ? id.seriesTmdbId : id.tmdbId
        var type = id.isSeries ? 'tv' : 'movie'
        var key = type + ':' + tmdbId
        if (seen[key]) continue
        seen[key] = true
        items.push({ tmdbId: tmdbId, type: type })
    }
    return items
}

// Server rows → lookup keyed the same way as dedupKey() above.
function buildKnownStatusLookup(rows) {
    var lookup = {}
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        var key
        if (row.media_type === 'episode') {
            key = 'episode:' + row.series_tmdb_id + ':' + row.season_number + ':' + row.episode_number
        } else {
            key = 'movie:' + row.tmdb_id
        }
        lookup[key] = row
    }
    return lookup
}

function isAlreadyCovered(row, candidatePercent) {
    if (!row) return false
    if (row.watched) return true
    return (row.percent || 0) >= candidatePercent
}

// ─── Push to Scrob (§5.6.3 п.6) ────────────────────────────

function pushWatched(identity, watchedAt, callback) {
    var tmdbId = identity.isSeries ? identity.seriesTmdbId : identity.tmdbId
    var mediaType = identity.isSeries ? 'episode' : 'movie'
    var episode = identity.isSeries
        ? { seriesTmdbId: identity.seriesTmdbId, season: identity.season, episode: identity.episode }
        : null
    // 409 (upstream dedup, #390) means Scrob already has a WatchEvent for
    // this title within its own dedup window - our own pre-check above
    // (getBatchWatchStatus) didn't catch it (a different source's recent
    // write, or a duplicate within this same import), but the end result is
    // the same as a normal success: it's marked watched in Scrob either way.
    // watchedAt - Lampa's own road.updated (ms since epoch), threaded through
    // from resolveCardTimecodes() - the real moment lampac saw this play,
    // not "now". A falsy 0 (never actually set) is handled by
    // addHistoryEvent()'s own `if (watchedAt)` check, same as passing null.
    api.addHistoryEvent(tmdbId, mediaType, true, episode, watchedAt, function () { callback(true) }, function (err, status) { callback(status === 409) })
}

function pushProgress(identity, timeSeconds, runtimeMinutes, callback) {
    var payload = {
        tmdb_id: identity.isSeries ? null : identity.tmdbId,
        media_type: identity.isSeries ? 'episode' : 'movie',
        title: 'lampac import',
        runtime: runtimeMinutes || null,
        reset: false
    }
    if (identity.isSeries) {
        payload.show_tmdb_id = identity.seriesTmdbId
        payload.season_number = identity.season
        payload.episode_number = identity.episode
    }
    api.startSession(payload, function (res) {
        if (!res || !res.session_key) { callback(false); return }
        api.updateSession(res.session_key, { progress_seconds: Math.round(timeSeconds), state: 'paused' }, function () { callback(true) }, function () { callback(false) })
    }, function () { callback(false) })
}

function pushSequential(items, index, counters, onDone, onProgress) {
    if (index >= items.length) { onDone(counters); return }
    var item = items[index]
    var runtimeMinutes = item.duration > 0 ? Math.round(item.duration / 60) : null

    function next() {
        if (onProgress) onProgress(index + 1, items.length)
        setTimeout(function () { pushSequential(items, index + 1, counters, onDone, onProgress) }, PUSH_PAUSE_MS)
    }

    if (item.percent >= WATCHED_THRESHOLD_PERCENT) {
        pushWatched(item.identity, item.updated, function (ok) { if (ok) counters.watched++; next() })
    } else {
        pushProgress(item.identity, item.time, runtimeMinutes, function (ok) { if (ok) counters.progress++; next() })
    }
}

// ─── Orchestrator ───────────────────────────────────────────

// `onDone(result)` — result: { listsThrown, watched, progress, skipped, cardsScanned, error }
// `error` set only when the export couldn't run at all (no session/sync off);
// a partial/empty result from real attempts is NOT an error.
// `onProgress(stage, current, total)` — optional, `stage` is 'timecodes'
// (runPool over the local card pool) or 'uploading' (pushSequential over the
// deduped batch) - the only two multi-step, genuinely slow parts (§5.6,
// progress-bar follow-up 2026-09-18: a bare spinner gave no sense of whether
// a big library export was still working or stuck).
export function run(onDone, onProgress) {
    if (running) return
    if (!hasSyncRunning()) { onDone({ error: 'sync_not_running' }); return }
    running = true

    var favorite = readFavoriteRaw()
    var listsThrown = exportThrownList(favorite)
    if (listsThrown > 0) engine.forceSync()

    var auth = buildLampacAuth()

    function legacy() {
        fetchLegacyCandidates(auth, favorite.card, onProgress, function (res) {
            exportCandidates(res, listsThrown, onDone, onProgress)
        })
    }

    fetchCapabilities(auth, function (caps) {
        applyCapabilities(auth, caps)
        if (!supportsTimecodeDump(caps)) { legacy(); return }
        fetchDumpCandidates(auth, favorite, function (res) {
            if (!res) { legacy(); return }
            if (onProgress) onProgress('timecodes', 1, 1)
            exportCandidates(res, listsThrown, onDone, onProgress)
        })
    })
}

// `res` - { candidates, titles } from either timecode source above.
function exportCandidates(res, listsThrown, onDone, onProgress) {
    var candidates = []
    for (var i = 0; i < res.candidates.length; i++) {
        if (res.candidates[i].percent >= PROGRESS_FLOOR_PERCENT) candidates.push(res.candidates[i])
    }

    if (!candidates.length) {
        running = false
        onDone({ listsThrown: listsThrown, watched: 0, progress: 0, skipped: 0, cardsScanned: res.titles })
        return
    }

    var statusPool = buildBatchStatusPool(candidates)
    api.getBatchWatchStatus(statusPool, function (rows) {
        finishExport(candidates, buildKnownStatusLookup(rows), listsThrown, res.titles, onDone, onProgress)
    }, function () {
        // Dedup lookup failed - proceed without it rather than dropping
        // the whole import (§9 п.6 "all-or-nothing" precedent doesn't
        // apply here: worst case is a few redundant writes, not silence).
        finishExport(candidates, {}, listsThrown, res.titles, onDone, onProgress)
    })
}

function finishExport(candidates, knownLookup, listsThrown, cardsScanned, onDone, onProgress) {
    var toPush = []
    var skipped = 0
    for (var i = 0; i < candidates.length; i++) {
        var row = knownLookup[dedupKey(candidates[i].identity)]
        if (isAlreadyCovered(row, candidates[i].percent)) { skipped++; continue }
        toPush.push(candidates[i])
    }

    pushSequential(toPush, 0, { watched: 0, progress: 0 }, function (counters) {
        running = false
        onDone({
            listsThrown: listsThrown,
            watched: counters.watched,
            progress: counters.progress,
            skipped: skipped,
            cardsScanned: cardsScanned
        })
    }, function (done, total) {
        if (onProgress) onProgress('uploading', done, total)
    })
}

function hasSyncRunning() {
    var status = engine.getStatus()
    return !!(status && status.running)
}
