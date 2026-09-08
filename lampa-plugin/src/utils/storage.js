// Storage keys and session helpers for the Scrob plugin.
// All keys are prefixed with scrob_ so they never collide with CUB account/account_user.

export var KEYS = {
    SERVER_URL: 'scrob_server_url',
    USERNAME: 'scrob_username',
    PASSWORD: 'scrob_password',
    OWN_API_KEY: 'scrob_own_api_key',
    ACCESS_TOKEN: 'scrob_access_token',
    ME: 'scrob_me',
    PROFILES: 'scrob_profiles',
    ACTIVE_PROFILE_ID: 'scrob_active_profile_id',
    ACTIVE_API_KEY: 'scrob_active_api_key',
    SYNC_ENABLED: 'scrob_sync_enabled',
    SYNC_INTERVAL: 'scrob_sync_interval',
    // QR-пейринг (OAuth 2.0 Device Authorization Grant, /auth/device/*) — Bearer,
    // не api_key: за дизайном сервера device-скоупований токен не має доступу
    // до /auth/me, тож так постійний api_key отримати неможливо в принципі.
    DEVICE_ACCESS_TOKEN: 'scrob_device_access_token',
    DEVICE_REFRESH_TOKEN: 'scrob_device_refresh_token',
    DEVICE_EXPIRES_AT: 'scrob_device_expires_at'
}

// Keys isolated per profile: backed up on switch, restored for the target.
export var ISOLATED_KEYS = [
    'favorite',
    'online_view',
    'online_watched_last',
    'online_last_balanser',
    'file_view',
    'torrents_view',
    'torrents_filter_data'
]

// Defaults applied when the target profile has no saved data yet.
var DEFAULTS = {
    favorite: '{}',
    // Flat array of viewed-item hashes (online.js: Lampa.Storage.cache('online_view',
    // 5000, []), later viewed.indexOf(hash)) - NOT an object. Restoring a profile with
    // no backup yet used to write '{}' here, and online.js's own source-list screen
    // threw "viewed.indexOf is not a function" on the very next render, since a value
    // now genuinely exists (just the wrong shape) instead of falling through to its
    // own default.
    online_view: '[]',
    online_watched_last: '{}',
    online_last_balanser: '{}',
    file_view: '{}',
    // torrents_view/torrents_filter_data had their array/object shapes swapped -
    // confirmed against Lampa core (_refs/lampa/app.min.js), both by direct usage
    // and by its own account-sync type registry (sync(field, 'array_string'|'object_object')):
    //   - torrents_view is a flat array of viewed-torrent hashes: Storage.cache('torrents_view',
    //     5000, []), later viewed.indexOf(hash). A restored '{}' default (a profile with no
    //     backup yet) makes the very next call throw "viewed.indexOf is not a function" -
    //     same failure mode as the online_view fix above.
    //   - torrents_filter_data is an object keyed by cardID: Storage.cache('torrents_filter_data',
    //     500, {}), then all[cid] = filter. A restored '[]' default doesn't throw (arrays are
    //     objects too), but JSON.stringify() of an array only serializes numeric-index elements,
    //     so the non-index cid property is silently dropped - the per-card filter looks saved,
    //     then vanishes on the next reload.
    torrents_view: '[]',
    torrents_filter_data: '{}'
}

// Backup storage key for ONE profile - a single JSON object holding all of
// that profile's ISOLATED_KEYS at once, not one flat localStorage key per
// (userId, key) pair. Two reasons: a corrupted/malformed backup then only
// ever affects that one profile (restoreIsolatedData() in profiles.js falls
// back to defaults for it, not for everyone), and removing a stale profile's whole
// backup (pruneStaleBackups() below) becomes a single key deletion instead
// of one per ISOLATED_KEY.
export function backupKey(userId) {
    return 'scrob_backup_' + userId
}

// Drop scrob_backup_<userId> entries for any userId no longer present in a
// freshly-fetched, AUTHORITATIVE full user list. Caller's responsibility:
// only call this with a real /admin/users result (main.js's completeLogin,
// the api.adminUsers() success branch) - NEVER with the single-item
// fallback list used both for a non-admin login and for an adminUsers()
// failure, which would wrongly wipe out every OTHER profile's backup on a
// shared device just because this session can't see the real list.
export function pruneStaleBackups(profiles) {
    var keep = {}
    profiles.forEach(function (p) { keep[p.id] = true })

    var prefix = 'scrob_backup_'
    for (var i = window.localStorage.length - 1; i >= 0; i--) {
        var key = window.localStorage.key(i)
        if (key && key.indexOf(prefix) === 0 && !keep[key.slice(prefix.length)]) {
            window.localStorage.removeItem(key)
        }
    }
}

// Default value for an isolated key.
export function defaultValue(key) {
    return DEFAULTS[key] || '{}'
}

// Server URL without trailing slash, '' when not set.
export function serverUrl() {
    var url = (Lampa.Storage.get(KEYS.SERVER_URL) || '').trim()
    if (url.slice(-1) === '/') url = url.slice(0, -1)
    return url
}

export function getMe() {
    var val = Lampa.Storage.get(KEYS.ME, {})
    return typeof val === 'object' && val !== null ? val : {}
}

export function getProfiles() {
    var val = Lampa.Storage.get(KEYS.PROFILES, [])
    return Array.isArray(val) ? val : []
}

// Identity this session's credential currently is (api key takes priority,
// matching authHeaders()' own precedence in api.js) - the key
// setOwnProfileInfo()/getOwnProfileInfo() cache GET /profile/me's result
// under, so a different key/token (a new manual entry, a fresh QR pairing)
// doesn't keep showing the previous credential's name/avatar.
export function ownCredentialKey() {
    return Lampa.Storage.get(KEYS.OWN_API_KEY) || Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN) || ''
}

// In-memory only, deliberately not persisted to Lampa.Storage - this plugin
// re-evaluates from scratch on every page load, so an in-memory cache
// already means "fetch at most once per page load, always fresh again on
// reload" for free, with none of a persisted TTL's staleness window (an
// edit to display_name/avatar made on the server, then a reload here,
// wants to show up right away - not "eventually, once some interval
// elapses").
var ownProfileInfo = null

export function setOwnProfileInfo(profile, forKey) {
    ownProfileInfo = Object.assign({}, profile, { forKey: forKey })
}

// Cached GET /profile/me result for the CURRENT credential this page load,
// or {} if not fetched yet (or the credential changed since the fetch).
export function getOwnProfileInfo() {
    if (!ownProfileInfo || ownProfileInfo.forKey !== ownCredentialKey()) return {}
    return ownProfileInfo
}

// Active profile object from cached list, falls back to logged-in user, then
// to whatever public-profile info (display_name/avatar_url) could be
// resolved for a session with no real login behind it (see getOwnProfileInfo()).
export function activeProfile() {
    var id = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)
    var list = getProfiles()

    for (var i = 0; i < list.length; i++) {
        if (list[i].id == id) return list[i]
    }

    var me = getMe()
    if (me.id) return me

    return getOwnProfileInfo()
}

// Three independent, standalone ways to be "signed in" — any one is enough:
// a manually-entered API key, a QR-paired device token, or a real username/
// password login (the only one that also unlocks admin profile-switching,
// since it's the only path that ever calls /auth/me).
export function hasSession() {
    return !!(
        Lampa.Storage.get(KEYS.OWN_API_KEY) ||
        Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN) ||
        (Lampa.Storage.get(KEYS.ACCESS_TOKEN) && getMe().id)
    )
}

// Clear session keys on logout. Credentials (server/username/password) are kept for re-login.
export function clearSession() {
    ;[
        KEYS.OWN_API_KEY,
        KEYS.ACCESS_TOKEN,
        KEYS.ME,
        KEYS.PROFILES,
        KEYS.ACTIVE_PROFILE_ID,
        KEYS.ACTIVE_API_KEY,
        KEYS.DEVICE_ACCESS_TOKEN,
        KEYS.DEVICE_REFRESH_TOKEN,
        KEYS.DEVICE_EXPIRES_AT
    ].forEach(function (key) {
        Lampa.Storage.set(key, '')
    })
}
