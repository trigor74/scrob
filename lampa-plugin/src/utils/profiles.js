// Profile management: letter avatars and profile switching with per-profile data isolation.
import {
    KEYS,
    ISOLATED_KEYS,
    backupKey,
    defaultValue,
    getProfiles
} from './storage'
import { fetchAvatar } from './api'

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

// Avatar HTML: a letter placeholder, upgraded to the real server image by
// hydrateAvatar() below once it's fetched — an <img src> can't carry the
// auth header that fetch needs (X-Api-Key, or for a QR/device-token session
// with no API key at all, the paired device's Bearer token), so the image
// can no longer be loaded as a plain URL. Callers that insert this into a
// live DOM element must also call hydrateAvatar() on it afterwards.
export function avatarHtml(user) {
    // display_name: the only name-like field this plugin can ever resolve
    // for a session with no real login behind it (see storage.js's
    // getOwnProfileInfo()) - /auth/me (username) is Bearer-only.
    var name = (user && (user.username || user.display_name)) || '?'
    var letter = name.charAt(0).toUpperCase()
    var attr = (user && user.avatar_url) ? ' data-scrob-avatar-path="' + encodeURIComponent(user.avatar_url) + '"' : ''

    return '<div class="scrob-avatar scrob-avatar--letter"' + attr + ' style="background:' + avatarColor(name) + '">' + letter + '</div>'
}

// Swaps an avatarHtml() placeholder for the real avatar image once fetched
// with the caller's own auth headers (see fetchAvatar() in utils/api.js for
// why it's a header fetch and not a URL). $el is the jQuery element
// avatarHtml()'s output was inserted into — the placeholder itself, or an
// ancestor containing it. On any failure (no avatar, fetch error) the letter
// placeholder is simply left in place, same as before this image existed.
export function hydrateAvatar($el) {
    var placeholder = $el.is('[data-scrob-avatar-path]') ? $el : $el.find('[data-scrob-avatar-path]')
    if (!placeholder.length) return

    var path = decodeURIComponent(placeholder.attr('data-scrob-avatar-path'))

    fetchAvatar(path, function (blobUrl) {
        placeholder.replaceWith('<img class="scrob-avatar" src="' + blobUrl + '">')
    }, function () {})
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

    // Backup: one combined object under backupKey(currentId), not one flat
    // key per ISOLATED_KEY.
    if (currentId && currentId != targetId) {
        var outgoing = {}

        ISOLATED_KEYS.forEach(function (key) {
            var value = Lampa.Storage.get(key, 'none')

            if (value != 'none') outgoing[key] = value
        })

        Lampa.Storage.set(backupKey(currentId), outgoing)
    }

    // Restore: a malformed/corrupted backup for this one profile falls
    // through to defaults for every key instead of taking anything else
    // down with it.
    var saved = Lampa.Storage.get(backupKey(targetId), 'none')
    if (saved === 'none' || typeof saved !== 'object' || saved === null) saved = {}

    ISOLATED_KEYS.forEach(function (key) {
        Lampa.Storage.set(key, key in saved ? saved[key] : defaultValue(key))
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
