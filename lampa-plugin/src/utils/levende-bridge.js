// Scrob ↔ levende/lampa-plugins "profiles.js" bridge (Lampac accsdb).
//
// Lets a third-party Lampa multi-profile plugin (levende's profiles.js,
// driven by Lampac's accsdb.users[].params.profiles[].params) control which
// Scrob account this plugin talks to per device profile - without requiring
// Scrob admin rights, unlike this plugin's own /admin/users profile switcher
// (utils/profiles.js switchProfile()), which stays admin-only and unrelated.
//
// Two situations per active levende profile:
//   (B) its params carry scrob_server_url/scrob_api_key - credentials applied
//       directly, the accsdb config is the source of truth, nothing to back
//       up/restore for THOSE (re-applied fresh from params on every 'changed'
//       event for it). Our own plugin SETTINGS (SETTINGS_FIELDS below, e.g.
//       which Favorite lists to prefetch) still get backed up/restored per
//       profile even here - unlike credentials, they have no accsdb-provided
//       source of truth to re-apply fresh from.
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
import { KEYS, hasSession } from './storage'
import * as sync from './sync'
import * as timelineSync from './sync/timeline'

var CURRENT_PROFILE_KEY = 'scrob_levende_current_profile_id'
var BACKUP_STORE_KEY = 'scrob_levende_backup'
var ACTIVE_FLAG_KEY = 'scrob_levende_active'
var MANAGED_FLAG_KEY = 'scrob_levende_managed'
// Separate from CURRENT_PROFILE_KEY itself - see doApplyUnsafe()'s
// everApplied check below for why comparing raw profileId values alone
// isn't safe here.
var HAS_APPLIED_KEY = 'scrob_levende_has_applied'
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

// Per-profile PLUGIN SETTINGS (not credentials, SYNC-ARCHITECTURE-PLAN.md
// §5.2.7) - backed up/restored for BOTH situations B and C, unlike
// BACKUP_FIELDS above. Situation B's credentials come from accsdb, never a
// backup - but which Lampa.Favorite lists are worth prefetching depends on
// the individual account's own library size/habits (a big "Закладки" list
// on one real person's Scrob account shouldn't force prefetch off for a
// sibling levende profile with a small one, or vice versa), not on where
// its credentials come from. Boolean defaults mirror main.js's own
// SettingsApi trigger declarations for these same keys - kept in sync
// manually, there's no single shared source for a trigger's default
// between the two files.
var SETTINGS_FIELDS = [KEYS.PREFETCH_HISTORY, KEYS.PREFETCH_BOOK, KEYS.PREFETCH_LIKE, KEYS.PREFETCH_WATH]
var SETTINGS_DEFAULTS = {}
SETTINGS_DEFAULTS[KEYS.PREFETCH_HISTORY] = true
SETTINGS_DEFAULTS[KEYS.PREFETCH_BOOK] = false
SETTINGS_DEFAULTS[KEYS.PREFETCH_LIKE] = false
SETTINGS_DEFAULTS[KEYS.PREFETCH_WATH] = false

// utils/sync/custom.js's own custom-category registry (which named custom
// Favorite categories exist, plus their display titles - drives real UI:
// left-menu items and a bookmarks ContentRow). Its own storage key is a
// single flat 'scrob_custom_categories', not scoped by anything - unlike
// mapstore.js/mirror.js (both already keyed off ACTIVE_PROFILE_ID, see the
// comment above its own set() call in doApplyUnsafe() below), so without
// this it leaks one levende profile's custom category names into every
// other profile's menu/bookmarks. Backed up/restored for BOTH situations B
// and C, same rationale as SETTINGS_FIELDS above - this is account data
// with no accsdb-provided source of truth to re-apply fresh from either.
// Kept separate from SETTINGS_FIELDS itself since its value is a JSON
// array, not a boolean - restoreSettingsFields()'s own boolean-specific
// restore logic doesn't apply here.
var CUSTOM_CATEGORIES_KEY = 'scrob_custom_categories'

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

// True only once a REAL 'profile'/'changed' event has actually arrived THIS
// page load (set in stageProfile() below) - distinct from levendeActive
// itself, which may start out true purely from last session's persisted
// flag, with nothing yet having confirmed it's still accurate.
var confirmedThisSession = false

// The persisted flags above exist so the icon/settings gating is already
// correct at the very first render of a fresh page load (see the comment
// above them) - but nothing besides a genuine levende 'profile' event ever
// updates them again. If levende itself gets removed/disabled entirely,
// that event will simply never fire again, and this plugin would be stuck
// forever believing levende is still active/managing credentials - hiding
// its own sign-in/server/logout UI with no way for the user to reach it,
// even though the credentials left behind (whatever levende last injected)
// are now just as "manual" as any other. Give levende's own init (a real
// network round-trip to Lampac's accsdb) a generous window to prove the
// flag is still accurate; if nothing confirms it by then, reset to "no
// levende" and let the plugin's normal UI/behavior take back over.
var STALE_CHECK_DELAY_MS = 8000

export function checkStaleLevendeState() {
    if (!levendeActive) return

    setTimeout(function () {
        if (confirmedThisSession) return
        resetLevendeState()
    }, STALE_CHECK_DELAY_MS)
}

function resetLevendeState() {
    levendeActive = false
    levendeManaged = false
    Lampa.Storage.set(ACTIVE_FLAG_KEY, false)
    Lampa.Storage.set(MANAGED_FLAG_KEY, false)
    if (onApplyCallback) onApplyCallback()
}

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
    BACKUP_FIELDS.concat(SETTINGS_FIELDS).concat([CUSTOM_CATEGORIES_KEY]).forEach(function (field) {
        snapshot[field] = Lampa.Storage.get(field, '')
    })
    store[profileId] = snapshot
    Lampa.Storage.set(BACKUP_STORE_KEY, store)
}

// Restores just the SETTINGS_FIELDS subset of profileId's own backed-up
// snapshot, falling back to each field's own proper default (not '') when
// there is no snapshot yet, or the snapshotted value isn't really a saved
// boolean - backupProfile() always writes SOMETHING for every field it
// iterates (Lampa.Storage.get(field, '') falls through to '' for a field
// that plain never existed anywhere on this device yet), so a bare
// `field in snapshot` check would wrongly treat that filler '' as "really
// set to falsy" instead of "never set" and never apply the true default.
// Shared by restoreProfile() below (situation C, alongside credentials)
// and situation B's own branch in doApplyUnsafe() (settings only -
// credentials there come from accsdb, not a backup, so BACKUP_FIELDS
// itself is never restored for B).
function restoreSettingsFields(profileId) {
    var snapshot = getBackupStore()[profileId] || {}
    SETTINGS_FIELDS.forEach(function (field) {
        var saved = snapshot[field]
        Lampa.Storage.set(field, typeof saved === 'boolean' ? saved : SETTINGS_DEFAULTS[field])
    })
}

// Restores CUSTOM_CATEGORIES_KEY from profileId's own snapshot, defaulting
// to an empty registry ('[]', matching storage.js's own DEFAULTS convention
// for other JSON-array-shaped keys) when there is none yet - same
// "restore-or-clean-default" shape as restoreProfile() below. Called
// alongside restoreSettingsFields() in both situations (B and C) - see
// CUSTOM_CATEGORIES_KEY's own comment above for why.
function restoreCustomCategories(profileId) {
    var snapshot = getBackupStore()[profileId] || {}
    Lampa.Storage.set(CUSTOM_CATEGORIES_KEY, snapshot[CUSTOM_CATEGORIES_KEY] || '[]')
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
    restoreSettingsFields(profileId)
    restoreCustomCategories(profileId)
}

// Deterministic short fingerprint of a (server, apiKey) pair - djb2 over the
// concatenation, base36-encoded. Used below to scope mirror.js/mapstore.js's
// own per-account storage for scenario (B) profiles - see the comment at its
// call site for why this can't just be profile.profileId.
function credentialFingerprint(server, apiKey) {
    var str = (server || '') + '|' + (apiKey || '')
    var hash = 5381
    for (var i = 0; i < str.length; i++) {
        hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0
    }
    return hash.toString(36)
}

// Actually switches credentials for `profile` (an object shaped like what
// stageProfile() builds below). Called once, by whichever of
// applyPendingProfile() / the fallback timer gets there first.
//
// applyPendingProfile() runs synchronously INSIDE Lampa's own 'state:changed'
// dispatch (Subscribe.send()) - confirmed against the real core source that
// its entire listener loop is wrapped in ONE try/catch around the WHOLE
// array, so a throw from any single listener (this one included) silently
// aborts EVERY remaining listener for that dispatch, not just this one.
// Live-testing traced a controller-focus regression (see
// fix/lampa-plugin-levende-picker-controller-focus) to exactly this: with
// this bridge active, some listener downstream of ours (very possibly
// Lampa's or levende's own, responsible for the natural post-switch content
// refresh) never got a chance to run at all. This wrapper is a hard
// boundary against that failure mode regardless of what specifically throws
// inside - this bridge must never be the thing that silently breaks
// everyone else sharing this event.
function doApply(profile) {
    try {
        doApplyUnsafe(profile)
    } catch (err) {
        console.error('ScrobLevendeBridge', 'doApply failed:', err)
    }
}

function doApplyUnsafe(profile) {
    // !! (not a raw truthy/null check) because Lampa.Storage.get() does NOT
    // reliably return the literal `null` passed as its own default when a
    // key was never set - confirmed live, it comes back as '' instead - so
    // a boolean flag stored separately from CURRENT_PROFILE_KEY is the only
    // safe way to know whether ANY profile has ever been applied yet.
    var everApplied = !!Lampa.Storage.get(HAS_APPLIED_KEY, false)
    var previousId = Lampa.Storage.get(CURRENT_PROFILE_KEY, null)

    // Only situation (C) short-circuits on "same profile, nothing to do" -
    // its restoreProfile() would otherwise roll a live-refreshed value
    // (e.g. a rotated device refresh_token) back to whatever the last real
    // switch away had snapshotted, for no reason if nothing actually
    // changed. Situation (B) has no such risk - it always writes directly
    // from THIS event's own params, never from a backup - and accsdb can
    // be edited live (server/key added, rotated, or removed) without the
    // levende profile's own id ever changing, so it must always re-apply
    // fresh on every 'changed' event regardless of previousId, exactly as
    // the module comment at the top already documents. Skipping it here
    // too used to mean an accsdb edit for the CURRENTLY active profile
    // never took effect until some unrelated profile switch happened to
    // touch it again.
    if (!profile.hasScrobParams && everApplied && previousId === profile.profileId) {
        // Same (C) profile re-confirmed (levende sends 'changed' on every
        // app start too, not just on a real switch) - nothing actually
        // changed, so touch nothing.
        //
        // everApplied guards this comparison because levende's own
        // default/root profile commonly has a genuinely EMPTY STRING id
        // (unlike explicitly-added sub-profiles, which get real ids like
        // "1", "2", ...) - without this guard, that real '' would collide
        // with the SAME '' the "never set" default above resolves to,
        // making the very FIRST apply for that profile silently skip
        // itself as "already applied, nothing to do": the api key was
        // staged but never actually written to storage. Confirmed live
        // via console tracing on a cleared localStorage: both previousId
        // and profile.profileId logged as ''.
        return
    }

    // Both sync engines restart around a credential swap - list-sync
    // (engine.js) already did before timeline push/pull (timeline.js)
    // existed; this was never extended here when it was added, so under
    // levende progress never actually reached the server (timelineSync
    // never even called start() once) even though list-sync worked fine.
    sync.stop()
    timelineSync.stop()

    // Back up whatever is CURRENTLY live under the outgoing profile, whether
    // it came from situation B or C (harmless no-op to preserve for a B
    // profile, since it's never read back - see backupProfile() above).
    if (everApplied) backupProfile(previousId)

    if (profile.hasScrobParams) {
        // accsdb-managed profile - never a real login (the api key is never
        // round-tripped through /auth/me, and there's no OAuth device
        // pairing either), so any leftover "real identity" fields from
        // whatever this device was doing BEFORE this switch - a real
        // username/password login on a previous scenario-C profile, a QR/
        // device pairing, or even an admin login predating levende
        // altogether - must be cleared here. Otherwise getMe()/
        // activeProfile() keep showing that stale identity's name/avatar
        // (scrob_user_info in settings, in particular) even though every
        // actual request already correctly uses THIS profile's own api key
        // - confirmed live: api key correct, displayed identity wrong.
        Lampa.Storage.set(KEYS.ME, '')
        Lampa.Storage.set(KEYS.ACCESS_TOKEN, '')
        Lampa.Storage.set(KEYS.DEVICE_ACCESS_TOKEN, '')
        Lampa.Storage.set(KEYS.DEVICE_REFRESH_TOKEN, '')
        Lampa.Storage.set(KEYS.DEVICE_EXPIRES_AT, '')

        if (profile.server) Lampa.Storage.set(KEYS.SERVER_URL, profile.server)
        Lampa.Storage.set(KEYS.OWN_API_KEY, profile.apiKey || '')
        Lampa.Storage.set(KEYS.ACTIVE_API_KEY, profile.apiKey || '')
        // No real Scrob user id available here (accsdb-provided key, never
        // round-tripped through /auth/me) - a stable synthetic id scopes
        // this plugin's own mirror/map storage instead (utils/sync/
        // mirror.js, mapstore.js both key off ACTIVE_PROFILE_ID already).
        // Fingerprinted from server+apiKey, NOT bare profile.profileId -
        // accsdb can rotate which Scrob account a levende profile SLOT
        // points to (server/key edited in place) without profile.profileId
        // itself ever changing, exactly as the module comment above already
        // documents for why credentials always re-apply fresh regardless of
        // previousId. A profileId-only id would keep mirror/mapstore keyed
        // to the OLD account's storage after such a rotation - the new
        // account's writes would then check its list_id ownership against
        // the wrong account server-side and fail (live-reported: 404 on
        // POST /lists/{id}/items, list ownership check is strict on write,
        // lax on read - so convergeOneList's own read half kept looking
        // fine while every push 404'd). Keying off the credentials
        // themselves means a genuine rotation gets a fresh, correctly
        // isolated namespace, while reverting to a previously-used account
        // correctly reuses its own still-valid mirror/map data.
        Lampa.Storage.set(KEYS.ACTIVE_PROFILE_ID, 'levende_' + profile.profileId + '_' + credentialFingerprint(profile.server, profile.apiKey))
        // Credentials come from accsdb, not a backup - but the prefetch
        // candidate-list settings and the custom-category registry still
        // need their own per-profile restore (see SETTINGS_FIELDS and
        // CUSTOM_CATEGORIES_KEY above).
        restoreSettingsFields(profile.profileId)
        restoreCustomCategories(profile.profileId)
    } else {
        restoreProfile(profile.profileId)
    }

    Lampa.Storage.set(CURRENT_PROFILE_KEY, profile.profileId)
    Lampa.Storage.set(HAS_APPLIED_KEY, true)

    if (Lampa.Storage.get(KEYS.SYNC_ENABLED)) {
        sync.start()
        timelineSync.start()
    }

    if (onApplyCallback) onApplyCallback()
}

// Called from the 'profile' Listener in main.js.
export function stageProfile(e) {
    if (!e || e.type !== 'changed') return

    confirmedThisSession = true
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

// Mirrors storage.js's own hasSession() (OWN_API_KEY / DEVICE_ACCESS_TOKEN /
// ACCESS_TOKEN+ME.id), but reading from a backed-up snapshot object instead
// of live Storage - used for any (C) profile OTHER than the currently active
// one below, whose snapshot is the only record of what it signed in with.
function snapshotHasSession(snapshot) {
    var me = snapshot[KEYS.ME]
    return !!(
        snapshot[KEYS.OWN_API_KEY] ||
        snapshot[KEYS.DEVICE_ACCESS_TOKEN] ||
        (snapshot[KEYS.ACCESS_TOKEN] && me && typeof me === 'object' && me.id)
    )
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
    // hasSession() itself (not a bare OWN_API_KEY check) - QR/device pairing
    // never populates OWN_API_KEY at all (a device-scoped Bearer token, by
    // server design never round-tripped into a real api_key - see the
    // module comment on doApply()'s DEVICE_ACCESS_TOKEN clearing above), so
    // checking OWN_API_KEY alone showed a QR-signed-in profile as
    // unauthorized even though scrob_user_info/settings already displayed
    // its name correctly.
    var currentId = Lampa.Storage.get(CURRENT_PROFILE_KEY, null)
    if (profile && profile.id === currentId) {
        return hasSession()
    }

    var snapshot = getBackupStore()[profile && profile.id] || {}
    return snapshotHasSession(snapshot)
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
