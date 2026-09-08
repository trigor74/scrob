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
    SYNC_INTERVAL: 'scrob_sync_interval'
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
    online_view: '{}',
    online_watched_last: '{}',
    online_last_balanser: '{}',
    file_view: '{}',
    torrents_view: '{}',
    torrents_filter_data: '[]'
}

// Backup storage key for ONE profile - a single JSON object holding all of
// that profile's ISOLATED_KEYS at once, not one flat localStorage key per
// (userId, key) pair. Two reasons: a corrupted/malformed backup then only
// ever affects that one profile (switchProfile() in profiles.js falls back
// to defaults for it, not for everyone), and removing a stale profile's whole
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

// Active profile object from cached list, falls back to logged-in user.
export function activeProfile() {
    var id = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)
    var list = getProfiles()

    for (var i = 0; i < list.length; i++) {
        if (list[i].id == id) return list[i]
    }

    return getMe()
}

export function hasSession() {
    return !!(Lampa.Storage.get(KEYS.ACCESS_TOKEN) && getMe().id)
}

// Clear session keys on logout. Credentials (server/username/password) are kept for re-login.
export function clearSession() {
    ;[
        KEYS.OWN_API_KEY,
        KEYS.ACCESS_TOKEN,
        KEYS.ME,
        KEYS.PROFILES,
        KEYS.ACTIVE_PROFILE_ID,
        KEYS.ACTIVE_API_KEY
    ].forEach(function (key) {
        Lampa.Storage.set(key, '')
    })
}
