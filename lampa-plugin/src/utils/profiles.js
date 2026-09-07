// Profile management: letter avatars and profile switching with per-profile data isolation.
import {
    KEYS,
    ISOLATED_KEYS,
    backupKey,
    defaultValue,
    getProfiles,
    serverUrl
} from './storage'

// Fixed palette for deterministic letter avatar colors.
var COLORS = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ff9800']

// Deterministic color from username hash (pattern: GramLink sdk/avatars.js avatarColor).
export function avatarColor(name) {
    if (!name) return COLORS[0]

    var hash = 0

    for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }

    return COLORS[Math.abs(hash) % COLORS.length]
}

// Avatar HTML: server image when avatar_url is set, uppercase first letter otherwise.
// Image URL needs ?api_key= because <img> cannot send headers.
export function avatarHtml(user) {
    var server = serverUrl()
    // Active profile's own key when one is set (see the matching note on
    // apiKeyHeaders() in utils/api.js), otherwise the signed-in user's own.
    var ownKey = Lampa.Storage.get(KEYS.ACTIVE_API_KEY) || Lampa.Storage.get(KEYS.OWN_API_KEY) || ''

    if (user && user.avatar_url && server) {
        var sep = user.avatar_url.indexOf('?') >= 0 ? '&' : '?'

        return '<img class="scrob-avatar" src="' + server + '/api/proxy' + user.avatar_url + sep + 'api_key=' + encodeURIComponent(ownKey) + '">'
    }

    // display_name: the only name-like field this plugin can ever resolve
    // for a session with no real login behind it (see storage.js's
    // getOwnProfileInfo()) - /auth/me (username) is Bearer-only.
    var name = (user && (user.username || user.display_name)) || '?'
    var letter = name.charAt(0).toUpperCase()

    return '<div class="scrob-avatar scrob-avatar--letter" style="background:' + avatarColor(name) + '">' + letter + '</div>'
}

// Soft refresh of the active page (pattern: docs/gramsync/profile_levende.js softRefresh).
export function softRefresh() {
    var activity = Lampa.Activity.active()

    if (activity.page) activity.page = 1

    Lampa.Activity.replace(activity)
    activity.outdated = false
}

// Back up the currently-active profile's isolated keys (if any profile was
// active), then restore targetId's own backup-or-defaults. Shared by
// switchProfile() (an in-session switch) and completeLogin() (a fresh sign-in
// establishing a profile identity for the first time this session) - a fresh
// login otherwise left ISOLATED_KEYS (favorite, online_view, ...) completely
// untouched, so whichever account happened to sign in simply inherited
// whatever local data was already sitting in storage from an unrelated
// earlier session, instead of that account's own isolated data (or a clean
// default) - confirmed against a real instance: two different Scrob accounts
// ended up with near-identical synced list contents after separate logins.
export function restoreIsolatedData(targetId) {
    var currentId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)

    if (currentId && currentId != targetId) {
        ISOLATED_KEYS.forEach(function (key) {
            var value = Lampa.Storage.get(key, 'none')

            if (value != 'none') Lampa.Storage.set(backupKey(currentId, key), value)
        })
    }

    ISOLATED_KEYS.forEach(function (key) {
        var saved = Lampa.Storage.get(backupKey(targetId, key), 'none')

        Lampa.Storage.set(key, saved != 'none' ? saved : defaultValue(key))
    })
}

// Switch active profile:
// 1. backup/restore isolated keys (current → backup, target → restore-or-default)
// 2. activate target credentials
// 3. re-read timeline/favorite into UI
// 4. soft refresh the active page
export function switchProfile(targetId) {
    var currentId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)
    var list = getProfiles()
    var target = null

    for (var i = 0; i < list.length; i++) {
        if (list[i].id == targetId) target = list[i]
    }

    if (!target || target.id == currentId) return false

    restoreIsolatedData(target.id)

    // 2. Activate target credentials — API key BEFORE profile id. Lampa.Storage.set()
    // dispatches its 'change' event synchronously (no microtask/setTimeout), and the
    // sync engine's setupProfileListener() reacts to ACTIVE_PROFILE_ID changing by
    // immediately restarting sync (utils/sync/engine.js). If the profile id were set
    // first, that restart - and the initial sync it kicks off - would fire while
    // ACTIVE_API_KEY still held the OUTGOING profile's key, one line away from being
    // updated: the very first request under the "new" profile would run under the
    // old one's identity.
    Lampa.Storage.set(KEYS.ACTIVE_API_KEY, target.api_key)
    Lampa.Storage.set(KEYS.ACTIVE_PROFILE_ID, target.id)

    // 3. Re-read data into UI
    Lampa.Timeline.read()
    Lampa.Favorite.read()

    // 4. Soft refresh of the active page
    softRefresh()

    return true
}
