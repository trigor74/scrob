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
// local data. Lampa.Favorite.read() (without nolisten=true) itself sends
// 'state:changed' {target:'favorite', reason:'read'} as its last step - both
// restoreOfflineProfile() and the switchFn's own shared refresh() callback
// (online and offline paths alike) call it - so that event is the correct,
// verified-safe point to actually apply anything here.
import { KEYS } from './storage'
import * as sync from './sync'

var CURRENT_PROFILE_KEY = 'scrob_levende_current_profile_id'
var BACKUP_STORE_KEY = 'scrob_levende_backup'

// "Regular account" fields backed up/restored per levende profile in
// situation (C). Deliberately excludes KEYS.PROFILES/SYNC_ENABLED/
// SYNC_INTERVAL/USERNAME/PASSWORD - the admin profile list has no meaning
// here (see levendeActive below), and sync on/off + poll interval read more
// like a device-wide preference than a per-viewer one, matching this
// plugin's own ISOLATED_KEYS precedent of excluding similar app-level
// settings.
var BACKUP_FIELDS = [
    KEYS.OWN_API_KEY, KEYS.SERVER_URL, KEYS.ACCESS_TOKEN, KEYS.ME,
    KEYS.ACTIVE_API_KEY, KEYS.ACTIVE_PROFILE_ID,
    KEYS.DEVICE_ACCESS_TOKEN, KEYS.DEVICE_REFRESH_TOKEN, KEYS.DEVICE_EXPIRES_AT
]

// Staged by stageProfile() on 'profile'/'changed', consumed by
// applyPendingProfile() on the next safe 'state:changed' signal.
var pending = null

// true once ANY levende 'profile' event has been seen this session - gates
// this plugin's own admin-profile-switching everywhere (header icon,
// completeLogin()'s api.adminUsers() branch, restoreIsolatedData()): under
// levende, per-viewer identity switching is the bridge's job, not this
// plugin's /admin/users switcher, regardless of whether the CURRENT profile
// specifically carries Scrob params.
var levendeActive = false

// true only while the CURRENTLY ACTIVE levende profile itself carries
// scrob_server_url/scrob_api_key (situation B). Also hides the "Sign in to
// the server" row even before hasSession() flips true - manually signing in
// here would just get overwritten by the next 'profile' event anyway.
var levendeManaged = false

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

// Called from the 'profile' Listener in main.js.
export function stageProfile(e) {
    if (!e || e.type !== 'changed') return

    levendeActive = true

    var params = e.params || {}
    var hasScrobParams = !!(params.scrob_server_url || params.scrob_api_key)
    levendeManaged = hasScrobParams

    pending = {
        profileId: e.profileId,
        hasScrobParams: hasScrobParams,
        server: params.scrob_server_url || '',
        apiKey: params.scrob_api_key || ''
    }
}

// Called from the 'state:changed' Listener in main.js (already pre-filtered
// to target:'favorite', reason:'read'). Returns true if something was
// actually applied (caller should refresh the header icon/settings then).
export function applyPendingProfile() {
    if (!pending) return false

    var profile = pending
    pending = null

    var previousId = Lampa.Storage.get(CURRENT_PROFILE_KEY, null)

    if (previousId === profile.profileId) {
        // Same profile re-confirmed (levende sends 'changed' on every app
        // start too, not just on a real switch) - nothing actually changed,
        // so touch nothing. Blindly backing up+restoring here would roll a
        // live-refreshed value (e.g. a rotated device refresh_token) back to
        // whatever the last real switch away had snapshotted.
        return false
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

    return true
}
