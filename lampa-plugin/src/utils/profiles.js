// Profile management: letter avatars and profile switching with per-profile data isolation.
import {
    KEYS,
    ISOLATED_KEYS,
    backupKey,
    defaultValue,
    getProfiles,
    getMe
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

// ─── Per-profile lampac data area ──────────────────────────
// lampac keeps one data area per (uid, lampac_profile_id) - bookmarks,
// timecodes and sync.js's online_view/torrents_view alike - so with an
// untouched lampac_profile_id every Scrob profile on a device shared ONE
// area, and each page load merged the other profiles' lampac changes into
// whichever profile was active (then pushed them to its Scrob account;
// found live 2026-09-27). The signed-in (main) profile keeps the area the
// device already had at login; every other profile gets its own
// 'scrob_<id>'. Works for both lampac generations - profile_id predates
// 95b3a03.

var LAMPAC_PROFILE_KEY = 'lampac_profile_id'
var LAMPAC_AREA_PREFIX = 'scrob_'
// Extra field in a profile backup (not an ISOLATED_KEY, never restored):
// the lampac area its lampac_bookmark_version was taken from.
var LAMPAC_AREA_TAG = 'lampac_area'

function lampacBaseProfileId() {
    var saved = Lampa.Storage.get(KEYS.LAMPAC_BASE_PROFILE_ID, '')
    if (saved && typeof saved === 'object' && typeof saved.value === 'string') return saved.value
    return null
}

// Remembers the device's own lampac area once per session (login). A value
// that is already one of ours ('scrob_...') means a previous session never
// released it (see releaseLampacProfileId()) - fall back to the default
// area rather than adopting another profile's.
function captureLampacBaseProfileId() {
    if (lampacBaseProfileId() !== null) return
    var current = String(Lampa.Storage.get(LAMPAC_PROFILE_KEY, '') || '')
    if (current.indexOf(LAMPAC_AREA_PREFIX) === 0) current = ''
    Lampa.Storage.set(KEYS.LAMPAC_BASE_PROFILE_ID, { value: current })
}

function lampacProfileIdFor(targetId) {
    var me = getMe()
    if (me.id != null && String(me.id) === String(targetId)) return lampacBaseProfileId() || ''
    return LAMPAC_AREA_PREFIX + targetId
}

// Returns true when the area actually changed.
function setLampacProfileId(value) {
    if (String(Lampa.Storage.get(LAMPAC_PROFILE_KEY, '') || '') === value) return false
    Lampa.Storage.set(LAMPAC_PROFILE_KEY, value)
    return true
}

// Ask lampac's own scripts to re-read the (new) area - both events exist in
// lampac before and after 95b3a03; a no-op without lampac.
function requestLampacPull() {
    Lampa.Listener.send('lampac', { name: 'bookmark_pullFromServer' })
    Lampa.Listener.send('lampac', { type: 'timecode_pullFromServer' })
}

// Logout: hand the device back its own lampac area. The cursor is reset
// because the local `favorite` left behind belongs to the profile just
// left, not to the base area.
export function releaseLampacProfileId() {
    var base = lampacBaseProfileId()
    if (base === null) return
    if (setLampacProfileId(base)) Lampa.Storage.set('lampac_bookmark_version', '0')
    Lampa.Storage.set(KEYS.LAMPAC_BASE_PROFILE_ID, '')
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
        // Which lampac area lampac_bookmark_version above belongs to - see
        // the restore side below.
        outgoing[LAMPAC_AREA_TAG] = String(Lampa.Storage.get(LAMPAC_PROFILE_KEY, '') || '')

        Lampa.Storage.set(backupKey(currentId), outgoing)
    }

    // Switch the lampac area BEFORE restoring: lampac's sync.js exports
    // online_view/torrents_view on every Storage 'change', immediately, to
    // whatever lampac_profile_id is set at that moment - restoring first
    // would upload the target's data into the outgoing profile's area.
    captureLampacBaseProfileId()
    var lampacArea = lampacProfileIdFor(targetId)
    var lampacChanged = setLampacProfileId(lampacArea)

    // Restore: a malformed/corrupted backup for this one profile falls
    // through to defaults for every key instead of taking anything else
    // down with it.
    var saved = Lampa.Storage.get(backupKey(targetId), 'none')
    if (saved === 'none' || typeof saved !== 'object' || saved === null) saved = {}

    // A cursor saved against a different area (a backup from before this
    // per-profile split, or with no area tag at all) is meaningless for
    // this one - drop it so lampac starts from a full dump.
    var staleCursor = saved[LAMPAC_AREA_TAG] !== lampacArea

    ISOLATED_KEYS.forEach(function (key) {
        var cursorKey = key === 'lampac_bookmark_version' || key === 'lampac_bookmark_scope'
        var keep = key in saved && !(cursorKey && staleCursor)
        Lampa.Storage.set(key, keep ? saved[key] : defaultValue(key))
    })

    if (lampacChanged) requestLampacPull()
}

// Switch active profile:
// 1. backup/restore isolated keys (current → backup, target → restore-or-default)
// 2. re-read timeline/favorite into UI
// 3. activate target credentials
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

    // 2. Re-read data into UI — BEFORE step 3, same order as main.js's
    // completeLogin(). restoreIsolatedData() only writes Storage, while
    // Lampa.Favorite.get() reads core's in-memory cache (refreshed only by
    // Favorite.read()). Setting ACTIVE_PROFILE_ID restarts timeline.js
    // synchronously, and its start() runs the watch-status prefetch whose
    // candidate pool comes from Favorite.get({type:'history'}) - read after
    // step 3, that pool was still the OUTGOING profile's history, so the
    // "Ви дивилися"/continue-watching row of the new profile stayed stale
    // until each card was opened by hand (found live 2026-09-27).
    Lampa.Timeline.read()
    Lampa.Favorite.read()

    // 3. Activate target credentials — API key BEFORE profile id. Lampa.Storage.set()
    // dispatches its 'change' event synchronously (no microtask/setTimeout), and the
    // sync engine's setupProfileListener() reacts to ACTIVE_PROFILE_ID changing by
    // immediately restarting sync (utils/sync/engine.js). If the profile id were set
    // first, that restart - and the initial sync it kicks off - would fire while
    // ACTIVE_API_KEY still held the OUTGOING profile's key, one line away from being
    // updated: the very first request under the "new" profile would run under the
    // old one's identity.
    Lampa.Storage.set(KEYS.ACTIVE_API_KEY, target.api_key)
    Lampa.Storage.set(KEYS.ACTIVE_PROFILE_ID, target.id)

    // 4. Soft refresh of the active page
    softRefresh()

    return true
}
