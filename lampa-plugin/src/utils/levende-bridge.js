// Scrob ↔ levende/lampa-plugins "profiles.js" bridge (Lampac accsdb).
//
// Lets a third-party Lampa multi-profile plugin (levende's profiles.js,
// driven by Lampac's accsdb.users[].params.profiles[].params) control which
// Scrob account this plugin talks to per device profile - without requiring
// Scrob admin rights, unlike this plugin's own /admin/users profile switcher
// (utils/profiles.js switchProfile()), which stays admin-only and unrelated.
//
// Two situations per active levende profile:
//   (B) its params carry scrob_server_url/scrob_api_key - applied directly,
//       the accsdb config is the source of truth, nothing to back up/restore
//       (re-applied fresh from params on every 'changed' event for it).
//   (C) it has no Scrob params at all - the user can still sign in manually
//       (API key / login+password / QR) same as without levende, but we back
//       up/restore OUR OWN "regular account" fields ourselves, keyed by the
//       levende profileId: levende's own isolation (state.sync.keys in its
//       real v3/profiles.js source) is a hardcoded list of Lampa-core keys
//       with no hook to extend from outside, so it can never isolate keys
//       this plugin owns (scrob_own_api_key, scrob_server_url, etc.).
//
// Event ordering (verified against the real levende v3/profiles.js, not just
// its docs): 'profile'/'changed' fires synchronously and BEFORE levende
// itself swaps favorite/online_view to the new profile's data - in
// ProfileManager's onSelect, notifySvc.notify(...) runs, THEN switchFn(...)
// (which does the actual backupOfflineProfile/restoreOfflineProfile). Acting
// immediately on 'profile'/'changed' would still see the outgoing profile's
// local data. The normal signal to actually apply is the next
// 'state:changed' {target:'favorite', reason:'read'} - which
// Lampa.Favorite.read() itself sends when NOT called with nolisten=true, and
// both restoreOfflineProfile() and the switchFn's own shared refresh()
// callback (online and offline paths alike) call it that way as their last
// step. BUT levende's own reset() - called synchronously on every switch,
// before either path's real data swap - reads Lampa.Favorite.read(true)
// WITH nolisten, so that call itself never fires the signal. The REAL
// arrival can be delayed (online mode waits on an external sync script, up
// to lampac_profile_refresh_timeout - 10s by default) or never come at all
// this page load (levende's "full" refresh type reloads the page instead of
// ever calling refresh()). stageProfile() below therefore also arms a
// bounded fallback timer, so a slow or reload-skipped switch still applies
// instead of leaving this plugin on the outgoing profile's credentials.
import { KEYS } from './storage'
import * as sync from './sync'

var CURRENT_PROFILE_KEY = 'scrob_levende_current_profile_id'
var BACKUP_STORE_KEY = 'scrob_levende_backup'
var ACTIVE_FLAG_KEY = 'scrob_levende_active'
var MANAGED_FLAG_KEY = 'scrob_levende_managed'
var APPLY_FALLBACK_DELAY_MS = 2000

// "Regular account" fields backed up/restored per levende profile in
// situation (C). Deliberately excludes KEYS.PROFILES/SYNC_ENABLED/
// SYNC_INTERVAL/USERNAME/PASSWORD - the admin profile list has no meaning
// here (see isLevendeActive() below), and sync on/off + poll interval read
// more like a device-wide preference than a per-viewer one, matching this
// plugin's own ISOLATED_KEYS precedent of excluding similar app-level
// settings.
var BACKUP_FIELDS = [
    KEYS.OWN_API_KEY, KEYS.SERVER_URL, KEYS.ACCESS_TOKEN, KEYS.ME,
    KEYS.ACTIVE_API_KEY, KEYS.ACTIVE_PROFILE_ID,
    KEYS.DEVICE_ACCESS_TOKEN, KEYS.DEVICE_REFRESH_TOKEN, KEYS.DEVICE_EXPIRES_AT
]

// Staged by stageProfile() on 'profile'/'changed', consumed by whichever
// fires first: the real 'state:changed' signal (applyPendingProfile(), called
// from main.js) or the fallback timer armed alongside it.
var pending = null

// Persisted (not just in-memory) because both flags must already read
// correctly at the very first updateHeaderButton()/settingsListener check of
// a fresh page load - restoreSession() runs synchronously before levende's
// own 'profile' event has any chance to arrive (its init does a real network
// round-trip to Lampac first). An in-memory-only flag would default to false
// on every reload and let the icon/"Sign in" row flash briefly (or, on a
// slow connection, stay wrong) until that event finally showed up.
var levendeActive = !!Lampa.Storage.get(ACTIVE_FLAG_KEY, false)
var levendeManaged = !!Lampa.Storage.get(MANAGED_FLAG_KEY, false)

// Notified after every real apply (credential swap actually happened) - set
// once from main.js's initLevendeProfilesBridge(), used to refresh the
// header icon/settings screen without this module needing to import them
// back (main.js already owns those functions).
var onApplyCallback = null

export function setOnApply(callback) {
    onApplyCallback = callback
}

export function isLevendeActive() {
    return levendeActive
}

export function isLevendeManaged() {
    return levendeManaged
}

function getBackupStore() {
    var raw = Lampa.Storage.get(BACKUP_STORE_KEY, {})
    return (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {}
}

// Snapshots the CURRENT live values of BACKUP_FIELDS under profileId. Safe to
// call even for a situation-(B) profile (accsdb-managed) - the snapshot just
// mirrors whatever accsdb already defines and stays unused, since re-entering
// a (B) profile always re-applies fresh from its own params, never from this
// backup.
function backupProfile(profileId) {
    var store = getBackupStore()
    var snapshot = {}
    BACKUP_FIELDS.forEach(function (field) {
        snapshot[field] = Lampa.Storage.get(field, '')
    })
    store[profileId] = snapshot
    Lampa.Storage.set(BACKUP_STORE_KEY, store)
}

// Restores profileId's own backed-up snapshot, or resets every field to
// empty if this levende profile has never signed in to Scrob before (first
// visit) - the same "restore-or-clean-default" shape as this plugin's own
// restoreIsolatedData().
function restoreProfile(profileId) {
    var snapshot = getBackupStore()[profileId] || {}
    BACKUP_FIELDS.forEach(function (field) {
        Lampa.Storage.set(field, snapshot[field] || '')
    })
}

// Actually switches credentials for `profile` (an object shaped like what
// stageProfile() builds below). Called once, by whichever of
// applyPendingProfile() / the fallback timer gets there first.
function doApply(profile) {
    var previousId = Lampa.Storage.get(CURRENT_PROFILE_KEY, null)

    if (previousId === profile.profileId) {
        // Same profile re-confirmed (levende sends 'changed' on every app
        // start too, not just on a real switch) - nothing actually changed,
        // so touch nothing. Blindly backing up+restoring here would roll a
        // live-refreshed value (e.g. a rotated device refresh_token) back to
        // whatever the last real switch away had snapshotted.
        return
    }

    sync.stop()

    // Back up whatever is CURRENTLY live under the outgoing profile, whether
    // it came from situation B or C (harmless no-op to preserve for a B
    // profile, since it's never read back - see backupProfile() above).
    if (previousId !== null) backupProfile(previousId)

    if (profile.hasScrobParams) {
        if (profile.server) Lampa.Storage.set(KEYS.SERVER_URL, profile.server)
        Lampa.Storage.set(KEYS.OWN_API_KEY, profile.apiKey || '')
        Lampa.Storage.set(KEYS.ACTIVE_API_KEY, profile.apiKey || '')
        // No real Scrob user id available here (accsdb-provided key, never
        // round-tripped through /auth/me) - a stable synthetic id, unique
        // per levende profile, is enough to correctly scope this plugin's
        // own mirror/map storage (utils/sync/mirror.js, mapstore.js both key
        // off ACTIVE_PROFILE_ID already).
        Lampa.Storage.set(KEYS.ACTIVE_PROFILE_ID, 'levende_' + profile.profileId)
    } else {
        restoreProfile(profile.profileId)
    }

    Lampa.Storage.set(CURRENT_PROFILE_KEY, profile.profileId)

    if (Lampa.Storage.get(KEYS.SYNC_ENABLED)) sync.start()

    if (onApplyCallback) onApplyCallback()
}

// Called from the 'profile' Listener in main.js.
export function stageProfile(e) {
    if (!e || e.type !== 'changed') return

    levendeActive = true
    Lampa.Storage.set(ACTIVE_FLAG_KEY, true)

    var params = e.params || {}
    var server = params.scrob_server_url || ''
    var apiKey = params.scrob_api_key || ''
    var hasScrobParams = !!(server || apiKey)
    levendeManaged = hasScrobParams
    Lampa.Storage.set(MANAGED_FLAG_KEY, hasScrobParams)

    var profile = {
        profileId: e.profileId,
        hasScrobParams: hasScrobParams,
        server: server,
        apiKey: apiKey
    }
    pending = profile

    // Fallback: see the module comment above for why the real signal can be
    // delayed or skipped entirely.
    setTimeout(function () {
        if (pending === profile) {
            pending = null
            doApply(profile)
        }
    }, APPLY_FALLBACK_DELAY_MS)
}

// Called from the 'state:changed' Listener in main.js (already pre-filtered
// to target:'favorite', reason:'read').
export function applyPendingProfile() {
    if (!pending) return

    var profile = pending
    pending = null
    doApply(profile)
}

// ─── Status dot in levende's own profile picker ────────────
//
// levende's ProfileManager builds its picker as a plain Lampa.Select.show()
// call (Lampa core's own generic selectbox, not a custom-rendered element of
// levende's own) - Lampa.Select.show({title: Lampa.Lang.translate(
// 'account_profiles'), items: state.profiles.map(profile => ({title,
// template:'selectbox_icon', icon, selected, profile}))}) - verified in the
// real v3/profiles.js source. Each item's own `profile` field is the FULL
// parsed accsdb profile object (id + params), for every profile, not just
// the active one - so wrapping this one Lampa.Select.show call gives us
// everything needed to badge every row, without ever touching levende's own
// (private, unexported) internal state.
var originalSelectShow = null

// Same shape as the plugin's own settings-section icon (main.js's
// ICON_SVG), recolored per status instead of a plain dot - gradient stop
// colors swap to red when not authorized, so the mark stays recognizably
// "Scrob" while still carrying the red/normal signal. Gradient ids are
// counter-suffixed since every row in the picker embeds its own copy of
// this SVG - two elements sharing one id in the same document is invalid
// and could make every row resolve to whichever gradient the browser saw
// first.
var svgIconCounter = 0

function statusIconSvg(ok) {
    svgIconCounter += 1
    var ringId = 'scrobLevendeRing' + svgIconCounter
    var dotId = 'scrobLevendeDot' + svgIconCounter
    var ringStops = ok
        ? '<stop offset="0%" stop-color="#5B34D6"/><stop offset="50%" stop-color="#9E3BC1"/><stop offset="100%" stop-color="#C147D8"/>'
        : '<stop offset="0%" stop-color="#7A1F1F"/><stop offset="50%" stop-color="#B23A3A"/><stop offset="100%" stop-color="#E05252"/>'
    var dotStops = ok
        ? '<stop offset="0%" stop-color="#5B34D6"/><stop offset="100%" stop-color="#C147D8"/>'
        : '<stop offset="0%" stop-color="#7A1F1F"/><stop offset="100%" stop-color="#E05252"/>'

    return '<svg class="scrob-levende-status-icon" viewBox="0 0 419 454" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
        '<linearGradient id="' + ringId + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="454">' + ringStops + '</linearGradient>' +
        '<linearGradient id="' + dotId + '" gradientUnits="objectBoundingBox" x1="0" y1="1" x2="0" y2="0">' + dotStops + '</linearGradient>' +
        '</defs>' +
        '<path d="M 394.09 73.88 A 226.5 226.5 0 1 0 332.74 427.26 L 287.64 358.22 A 144.6 144.6 0 1 1 334.56 130.14 Z" fill="url(#' + ringId + ')"/>' +
        '<circle cx="368.97" cy="347.2" r="48.29" fill="url(#' + dotId + ')"/>' +
        '</svg>'
}

// True only when accsdb gives BOTH the server and the key for a (B) profile
// - one without the other is exactly the "misconfigured" case worth
// flagging, same as a (C) profile that has never signed in successfully.
function isProfileAuthorized(profile) {
    var params = (profile && profile.params) || {}
    var server = params.scrob_server_url || ''
    var apiKey = params.scrob_api_key || ''

    if (server || apiKey) return !!(server && apiKey)

    // Situation (C): the CURRENTLY active profile's live storage is the
    // source of truth (may have just signed in this very session, before
    // any backup snapshot exists for it yet); any other profile falls back
    // to whatever was captured the last time we switched away from it.
    var currentId = Lampa.Storage.get(CURRENT_PROFILE_KEY, null)
    if (profile && profile.id === currentId) {
        return !!Lampa.Storage.get(KEYS.OWN_API_KEY, '')
    }

    var snapshot = getBackupStore()[profile && profile.id]
    return !!(snapshot && snapshot[KEYS.OWN_API_KEY])
}

// Prepended, not appended - levende already marks the current profile with
// its own end-of-row indicator (a CSS-only "selected" class, no title text
// involved), so a trailing dot here would sit right next to it.
function decorateProfilePickerItems(options) {
    if (!options || options.title !== Lampa.Lang.translate('account_profiles')) return
    if (!Array.isArray(options.items) || !options.items.length) return
    if (!options.items[0].profile) return

    options.items.forEach(function (item) {
        if (!item.profile) return
        var icon = statusIconSvg(isProfileAuthorized(item.profile))
        item.title = icon + ' ' + (item.title || '')
    })
}

// Called once from main.js's initLevendeProfilesBridge(). Idempotent - a
// second call is a no-op, so it's safe to call unconditionally even if
// levende ends up getting initialized more than once per page load.
export function patchProfileSelect() {
    if (originalSelectShow) return
    if (typeof Lampa.Select === 'undefined' || typeof Lampa.Select.show !== 'function') return

    originalSelectShow = Lampa.Select.show

    Lampa.Select.show = function (options) {
        decorateProfilePickerItems(options)
        return originalSelectShow.call(Lampa.Select, options)
    }
}
