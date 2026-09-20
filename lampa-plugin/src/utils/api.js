// Scrob server API wrapper. All requests go through new Lampa.Reguest().
// Base prefix of every endpoint: {server_url}/api/proxy
import { serverUrl, KEYS } from './storage'

function base() {
    return serverUrl() + '/api/proxy'
}

// X-Api-Key header for the currently active identity: the switched-to
// profile's own key when an admin has picked one (switchProfile()/
// completeLogin() write ACTIVE_API_KEY), otherwise the signed-in user's own
// key. Without this, every request kept using OWN_API_KEY regardless of
// which profile was selected - ACTIVE_API_KEY was written on every switch
// but never read anywhere, so admin profile-switching never actually
// changed whose account requests were made under.
//
// ALWAYS present, even empty — the Astro session-cookie gate (middleware.ts)
// only checks that this header exists at all (its value is validated
// separately, by the backend) before letting a /api/proxy/* request through
// without redirecting to /login. A non-browser client like this plugin never
// has that cookie, so omitting the header entirely (as before) silently
// blocked every request made with no api_key configured yet — including the
// login/QR-pairing requests themselves.
function apiKeyHeaders() {
    var key = Lampa.Storage.get(KEYS.ACTIVE_API_KEY) || Lampa.Storage.get(KEYS.OWN_API_KEY) || ''
    return { 'X-Api-Key': key }
}

// Bearer token header from the user's session; empty object when not set
function bearerHeaders() {
    var token = Lampa.Storage.get(KEYS.ACCESS_TOKEN) || ''
    return token ? { Authorization: 'Bearer ' + token } : {}
}

// Headers for regular (non-bootstrap) requests: the manually-entered API key
// when present, otherwise the QR-paired device token as Bearer. Either alone
// satisfies the backend's own per-endpoint auth dependency; X-Api-Key is
// always sent (see apiKeyHeaders() above) so the Astro gate lets the request
// through either way.
function authHeaders() {
    var headers = apiKeyHeaders()
    var apiKey = Lampa.Storage.get(KEYS.OWN_API_KEY) || ''
    if (!apiKey) {
        var deviceToken = Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN) || ''
        if (deviceToken) headers['Authorization'] = 'Bearer ' + deviceToken
    }
    return headers
}

function parse(data) {
    if (typeof data !== 'string') return data

    try {
        return JSON.parse(data)
    } catch (e) {
        return null
    }
}

// GET /profile/me — the "public profile" fields (display_name, avatar_url,
// bio, ...), NOT the core username/email (those stay Bearer-only, /auth/me).
// Unlike /auth/me, this accepts an API key OR a device-scoped Bearer token
// (get_current_user_or_api_key on the backend) - the only identity this
// plugin can ever resolve for a session with no real login behind it.
export function getProfile(onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(10000)

    network.native(
        base() + '/profile/me',
        function (data) {
            network.clear()

            var json = parse(data)

            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// GET {path} (an already-prefixed avatar_url, e.g. "/profile/avatar/2") as a
// Blob, turned into an object URL. Uses raw fetch() instead of Lampa.Reguest():
// an <img src> can't carry a request header, so the caller's credential
// (X-Api-Key, or - for a QR/device-token session with no API key at all -
// the paired device's Bearer token) has to be sent via authHeaders() on a
// real fetch and the response handed back as a blob: URL, rather than
// embedded in the image URL itself where it would leak into browser
// history, disk caches and proxy/access logs.
export function fetchAvatar(path, onDone, onFail) {
    fetch(base() + path, { headers: authHeaders() })
        .then(function (r) { return r.ok ? r.blob() : null })
        .then(function (blob) {
            if (blob) onDone(URL.createObjectURL(blob))
            else onFail()
        })
        .catch(function () { onFail() })
}

// POST /auth/login — form-urlencoded username+password → Token
// NOTE: login is an unauthenticated endpoint — do NOT send Bearer
// NOTE: Astro middleware requires X-Api-Key for /api/proxy/* routes
// OAuth2 Password Flow requires grant_type=password
export function login(username, password, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    var body = 'grant_type=password&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password)

    network.native(
        base() + '/auth/login',
        function (data) {
            network.clear()

            var json = parse(data)

            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        body,
        { headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, apiKeyHeaders()) }
    )
}

// GET /auth/me — Bearer token → User
export function me(token, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/auth/me',
        function (data) {
            network.clear()

            var json = parse(data)

            if (json && json.id) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: Object.assign({ Authorization: 'Bearer ' + token }, apiKeyHeaders()) }
    )
}

// GET /admin/users — Bearer token, admin only → AdminUser[]
export function adminUsers(token, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/admin/users',
        function (data) {
            network.clear()

            var json = parse(data)

            if (Array.isArray(json)) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: Object.assign({ Authorization: 'Bearer ' + token }, apiKeyHeaders()) }
    )
}

// ─── List sync API methods ────────────────────────────────

// GET /lists — all user lists (without items)
export function getLists(onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/lists',
        function (data) {
            network.clear()

            var json = parse(data)

            // Server wraps the array: { lists: [...] } — accept both shapes
            if (Array.isArray(json)) onDone(json)
            else if (json && Array.isArray(json.lists)) onDone(json.lists)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// POST /lists — create a new list
export function createList(name, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/lists',
        function (data) {
            network.clear()

            var json = parse(data)

            if (json && json.id) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        JSON.stringify({ name: name, privacy_level: 'private' }),
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// GET /lists/{listId} — list detail, items in .items field
export function getListItems(listId, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/lists/' + listId,
        function (data) {
            network.clear()

            var json = parse(data)

            // List detail returns { ..., items: [...] } — unwrap
            if (json && Array.isArray(json.items)) onDone(json.items)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// POST /lists/{listId}/items — add an item to a list
export function addListItem(listId, tmdbId, mediaType, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/lists/' + listId + '/items',
        function (data) {
            network.clear()

            var json = parse(data)

            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            // Pass HTTP status to onFail so callers can handle 409 (already exists)
            var status = a && a.status
            onFail(network.errorDecode(a, c), status)
        },
        JSON.stringify({ tmdb_id: tmdbId, media_type: mediaType }),
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// DELETE /lists/{listId}/items/{itemId} — remove an item from a list
export function deleteListItem(listId, itemId, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/lists/' + listId + '/items/' + itemId,
        function () {
            network.clear()
            onDone()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        '{}',
        { headers: Object.assign({ 'X-HTTP-Method-Override': 'DELETE' }, authHeaders()), type: 'DELETE' }
    )
}

// POST /socket/events — socket-plane ingest, same services as REST
// Body: { type, payload }. Auth via X-Api-Key header.
export function socketIngest(type, payload, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/socket/events',
        function (data) {
            network.clear()

            var json = parse(data)

            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            // Pass HTTP status to onFail so callers can handle 409 (already exists)
            var status = a && a.status
            onFail(network.errorDecode(a, c), status)
        },
        JSON.stringify({ type: type, payload: payload || {} }),
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// ─── Admin & history API methods ──────────────────────────

// GET /admin/settings — socket configuration for the server
// NOTE: Astro middleware requires X-Api-Key for /api/proxy/* routes
// NOTE: backend requires Bearer token (OAuth2PasswordBearer)
export function adminSettings(onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(10000)

    network.native(
        base() + '/admin/settings',
        function (data) {
            network.clear()
            var json = parse(data)
            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: Object.assign({}, apiKeyHeaders(), bearerHeaders()) }
    )
}

// POST /history — mark a media as watched. episode fields optional (movie: omit all three).
// `watchedAt` optional (Date object or timestamp) - omitted means the server
// stamps "now" on receipt (WatchEventCreate.watched_at, unset-vs-null
// distinction preserved server-side); passed explicitly by the external-
// player batch backdating path (§5.1.1) so a batch of several episodes gets
// a real, ordered spread instead of racing each other for "now".
// `onFail` receives the HTTP status as its 2nd arg (upstream #390, live audit
// 2026-09-18) - `completed:true` without `force:true` now 409s as
// "duplicate_watch" when a WatchEvent already exists for this title within
// the server's dedup window (min. 5 minutes, user-configurable) instead of
// silently succeeding. Callers treat 409 as "already recorded" (a real
// success), not a failure to retry - see sendPlainExternalWatchedMark()/
// sendPlainManualWatchedMark() (timeline.js) and pushWatched() (lampac-export.js).
export function addHistoryEvent(tmdbId, mediaType, completed, episode, watchedAt, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    var payload = {
        tmdb_id: tmdbId,
        media_type: mediaType,
        completed: completed
    }
    if (episode) {
        payload.series_tmdb_id = episode.seriesTmdbId
        payload.season_number = episode.season
        payload.episode_number = episode.episode
    }
    if (watchedAt) payload.watched_at = new Date(watchedAt).toISOString()

    network.native(
        base() + '/history',
        function (data) {
            network.clear()
            var json = parse(data)
            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            var status = a && a.status
            onFail(network.errorDecode(a, c), status)
        },
        JSON.stringify(payload),
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// DELETE /history/event/{eventId} — remove a watch event
export function removeHistoryEvent(eventId, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/event/' + eventId,
        function () {
            network.clear()
            onDone()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        '{}',
        { headers: Object.assign({ 'X-HTTP-Method-Override': 'DELETE' }, authHeaders()), type: 'DELETE' }
    )
}

// ─── Manual scrobble session API (playback progress tracking) ────
// Session key is derived server-side from title identity (tmdb_id for a
// movie, show_tmdb_id+season+episode for an episode) — repeated starts for
// the same title upsert the same session instead of resetting progress.

// POST /history/session/start — start (or resume) a playback session
export function startSession(payload, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/session/start',
        function (data) {
            network.clear()
            var json = parse(data)
            if (json && json.session_key) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        JSON.stringify(payload),
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// PATCH /history/session/{sessionKey} — heartbeat: progress/state, optional runtime correction
export function updateSession(sessionKey, payload, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/session/' + sessionKey,
        function (data) {
            network.clear()
            onDone(parse(data))
        },
        function (a, c) {
            network.clear()
            var status = a && a.status
            onFail(network.errorDecode(a, c), status)
        },
        JSON.stringify(payload),
        { headers: Object.assign({ 'Content-Type': 'application/json', 'X-HTTP-Method-Override': 'PATCH' }, authHeaders()), type: 'PATCH' }
    )
}

// POST /history/session/{sessionKey}/complete — mark the session watched
export function completeSession(sessionKey, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/session/' + sessionKey + '/complete',
        function (data) {
            network.clear()
            onDone(parse(data))
        },
        function (a, c) {
            network.clear()
            var status = a && a.status
            onFail(network.errorDecode(a, c), status)
        },
        '{}',
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// DELETE /history/session/{sessionKey} — discard a session (exited before any real progress)
export function deleteSession(sessionKey, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/session/' + sessionKey,
        function () {
            network.clear()
            onDone()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        '{}',
        { headers: Object.assign({ 'X-HTTP-Method-Override': 'DELETE' }, authHeaders()), type: 'DELETE' }
    )
}

// GET /history/now-playing — this account's active/paused playback
// sessions. `includeHidden` bypasses the dropped-show/movie filter that the
// homepage's own display list applies - needed for a targeted "does THIS
// exact title still have a live session" lookup (SYNC-ARCHITECTURE-PLAN.md
// §5.2.6's manual-mark/unmark reconciliation), not a display list.
export function getNowPlaying(includeHidden, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/now-playing' + (includeHidden ? '?include_hidden=true' : ''),
        function (data) {
            network.clear()
            var json = parse(data)
            if (json && Array.isArray(json.now_playing)) onDone(json.now_playing)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// GET /history/watch-status — lean, per-title watch state (movie or whole
// show) for the pull direction: only rows with real state (watched, or an
// in-progress bookmark), never a full episode list padded with zeroes.
// `type` accepts either 'movie' or 'tv'/'series' (server maps both).
export function getWatchStatus(tmdbId, type, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/watch-status?tmdb_id=' + tmdbId + '&type=' + type,
        function (data) {
            network.clear()
            var json = parse(data)
            if (Array.isArray(json)) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// POST /history/watch-status/batch — same per-item shape as getWatchStatus()
// above, for a whole pool of candidate titles at once (prefetch, §5.2.7).
// `items` is [{tmdbId, type}, ...] ('type' same loose 'movie'/'tv'/'series'
// convention as getWatchStatus()). Unknown/untouched titles are simply
// omitted from the response, same as [] from the single-item endpoint.
export function getBatchWatchStatus(items, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(20000)

    var body = {
        items: items.map(function (i) {
            return { tmdb_id: i.tmdbId, type: i.type }
        })
    }

    network.native(
        base() + '/history/watch-status/batch',
        function (data) {
            network.clear()
            var json = parse(data)
            if (json && Array.isArray(json.statuses)) onDone(json.statuses)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        JSON.stringify(body),
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// GET /history/continue-watching — everything currently in progress, for the
// bulk pull direction (login/profile switch/app start).
export function getContinueWatching(onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/continue-watching',
        function (data) {
            network.clear()
            var json = parse(data)
            if (json && Array.isArray(json.continue_watching)) onDone(json.continue_watching)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// GET /history/item-events — real WatchEvent list for one episode (or one
// movie via tmdb_id), newest first, already rewatch-aware. Used by the
// manual "unmark" flow (SYNC-ARCHITECTURE-PLAN.md §5.2.6) to decide which
// menu options to offer and which event id to delete.
export function getItemEvents(params, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    var query = ['media_type=' + params.mediaType]
    if (params.tmdbId) query.push('tmdb_id=' + params.tmdbId)
    if (params.seriesTmdbId) query.push('series_tmdb_id=' + params.seriesTmdbId)
    if (params.season != null) query.push('season_number=' + params.season)
    if (params.episode != null) query.push('episode_number=' + params.episode)

    network.native(
        base() + '/history/item-events?' + query.join('&'),
        function (data) {
            network.clear()
            var json = parse(data)
            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// POST /history/rewatch — start a fresh rewatch cycle (whole show, a season,
// or a single episode); never touches existing history.
export function startRewatch(seriesTmdbId, season, episode, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    var query = ['series_tmdb_id=' + seriesTmdbId]
    if (season != null) query.push('season_number=' + season)
    if (episode != null) query.push('episode_number=' + episode)

    network.native(
        base() + '/history/rewatch?' + query.join('&'),
        function (data) {
            network.clear()
            var json = parse(data)
            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        '{}',
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// DELETE /history/item?id={mediaId}&media_type=... — remove ALL watch events
// for one media item (all rewatch cycles included). `mediaId` is the
// server's internal Media.id (from GET /history/item-events's media_id),
// not a tmdb_id.
export function deleteHistoryItem(mediaId, mediaType, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/item?id=' + mediaId + '&media_type=' + mediaType,
        function () {
            network.clear()
            onDone()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        '{}',
        { headers: Object.assign({ 'X-HTTP-Method-Override': 'DELETE' }, authHeaders()), type: 'DELETE' }
    )
}

// POST /history/drop/show|movie — mark a title "dropped" (SYNC-ARCHITECTURE-
// PLAN.md §5.3.2): a first-class server-side status, excluded from
// continue-watching/next-up/discover server-side, NOT a /lists entry.
// `isSeries` picks the endpoint; body only ever carries tmdb_id (never
// show_id/media_id - this plugin never has a local Scrob id to send).
export function dropMedia(tmdbId, isSeries, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/drop/' + (isSeries ? 'show' : 'movie'),
        function (data) {
            network.clear()
            onDone(parse(data))
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        JSON.stringify({ tmdb_id: tmdbId }),
        { headers: Object.assign({ 'Content-Type': 'application/json' }, authHeaders()) }
    )
}

// DELETE /history/drop/show|movie — undo a drop.
export function undropMedia(tmdbId, isSeries, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/drop/' + (isSeries ? 'show' : 'movie') + '?tmdb_id=' + tmdbId,
        function (data) {
            network.clear()
            onDone(parse(data))
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        '{}',
        { headers: Object.assign({ 'X-HTTP-Method-Override': 'DELETE' }, authHeaders()), type: 'DELETE' }
    )
}

// GET /history/dropped — every currently-dropped show/movie, for the bulk
// pull direction (§5.3.2). Response shape: { shows: [...], movies: [...] },
// items carry tmdb_id/title/poster_path but no `type` field of their own -
// the caller knows which array it came from.
export function getDropped(onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    network.native(
        base() + '/history/dropped',
        function (data) {
            network.clear()
            var json = parse(data)
            if (json && Array.isArray(json.shows) && Array.isArray(json.movies)) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// GET /history — fetch watch history with optional pagination and type filter
export function getHistory(page, pageSize, mediaType, onDone, onFail) {
    var network = new Lampa.Reguest()
    network.timeout(15000)

    var params = []
    if (page) params.push('page=' + page)
    if (pageSize) params.push('page_size=' + pageSize)
    if (mediaType) params.push('type=' + mediaType)

    var queryString = params.length ? '?' + params.join('&') : ''

    network.native(
        base() + '/history' + queryString,
        function (data) {
            network.clear()
            var json = parse(data)
            if (json) onDone(json)
            else onFail()
        },
        function (a, c) {
            network.clear()
            onFail(network.errorDecode(a, c))
        },
        false,
        { headers: authHeaders() }
    )
}

// ─── QR device pairing (OAuth 2.0 Device Authorization Grant, /auth/device/*) ───
// These three requests are genuinely anonymous by design (RFC 8628) — the Astro
// gate explicitly exempts them (middleware.ts PUBLIC_PREFIXES), no X-Api-Key/
// Bearer needed at all. Uses raw fetch() instead of Lampa.Reguest(): the poll's
// "still pending" response is itself a non-2xx status carrying a JSON body
// ({error: "authorization_pending" | "slow_down" | ...}) the caller needs to
// read, which Reguest's onFail callback isn't set up to expose here.

// POST /auth/device/code — start pairing; returns device_code/user_code/verification_uri(_complete)
export function deviceCode(onDone, onFail) {
    fetch(base() + '/auth/device/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: 'Lampa', scope: 'write' })
    })
        .then(function (r) { return r.ok ? r.json() : null })
        .then(function (data) {
            if (data && data.device_code && data.user_code) onDone(data)
            else onFail()
        })
        .catch(function () { onFail() })
}

// POST /auth/device/token (grant_type=device_code) — one poll of the pairing loop.
// onDone always receives { ok, body }: the caller reads body.error to tell
// authorization_pending/slow_down (keep polling) apart from a real outcome.
export function deviceToken(deviceCodeValue, onDone, onFail) {
    fetch(base() + '/auth/device/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=' + encodeURIComponent(deviceCodeValue)
    })
        .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body || {} } }) })
        .then(onDone)
        .catch(function () { onFail() })
}

// POST /auth/device/token (grant_type=refresh_token) — rotates refresh_token on every call.
export function deviceTokenRefresh(refreshToken, onDone, onFail) {
    fetch(base() + '/auth/device/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken)
    })
        .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body || {} } }) })
        .then(onDone)
        .catch(function () { onFail() })
}
