// Scrob sync engine — single-convergence orchestrator for list synchronization.
// Model: Lampa core Account.Bookmarks (src/core/account/bookmarks.js).
// - Outbound: Favorite.listener add/remove + state:changed (custom keys) into one
//   serial push_queue with 500ms debounce. REST is the only write path.
// - Socket: inbound-only notify/invalidate hub (handler.js) → update(). Writes never
//   branch on isSocketActive(): the server already broadcasts REST writes to all devices.
// - Inbound/polling: one update() entry — fetch all lists, converge each pair
//   via applyRemoteDiff with the unified KeyResolver/applicator (mapping.js).
// - Mirror: Tracker-model {version,time} stamp; 409 resolves the real item_id,
//   deletes always use a resolved item_id. received flag guards echo.

import * as api from '../api'
import { registerHandlers, unregisterHandlers, bindUpdate, bindDropSync } from './handler'
import { KEYS, hasSession } from '../storage'
import {
    listNameForKey, syncableKeys, detectMediaType,
    elementKey, parseElementKey,
    resolveKeyForListId,
    localElementSet, scrobElementSet,
    applyRemoteAdd, applyRemoteRemove, cardFromScrobMedia
} from './mapping'
import * as mirror from './mirror'
import * as mapstore from './mapstore'

// ─── State ────────────────────────────────────────────────

var received = false       // Echo guard: true while engine itself writes favorite
var outboundTimer = null   // Debounce timer for outbound push (core: 500ms)
var pushQueue = []         // Serial outbound queue { method, lampaKey, card }
var pushRunning = false    // Serial guard (core: push_running)
var updateTimer = null     // Socket/poll invalidate debounce (core: update_timer 500ms)
var updateRunning = false  // Single-flight update() guard
var pollTimer = null       // Polling interval timer
var retryQueue = []        // Failed REST operations for retry
var retryTimer = null      // Retry interval timer
var running = false        // Engine active flag
var profileListener = null // Profile change listener reference
var brokenMappings = []    // Keys whose mapped list was deleted on server
var healing = false        // Self-heal guard: prevent re-entrant missing-key resolution
var activeSocket = null    // Current WebSocket instance (inbound-only notify)
var handlersBound = false  // Socket handlers registered flag
var socketPollBound = null // Socket open/close hook reference
var dropActivityBound = false // 'activity' listener (dropped-status refresh, §5.3.2) registered flag

// Debounce window for batching outbound changes (ms, core bookmarks.js: 500)
var DEBOUNCE_MS = 500
var RETRY_DELAY = 5000
var RETRY_MAX = 3

// ─── Conflict detection ───────────────────────────────────

// Detect conflicts with other sync mechanisms.
// Returns an array of conflict objects: { type, reason }
export function detectConflicts() {
    var conflicts = []

    // CUB account with sync enabled (section 9)
    if (Lampa.Account && Lampa.Account.Permit && Lampa.Account.Permit.sync) {
        conflicts.push({
            type: 'cub_sync',
            reason: 'CUB synchronization is enabled — Scrob list sync is blocked'
        })
    }

    // GramSync/GramLink profile active (section 9)
    if (Lampa.Storage.get('gramsync_sync_enabled')) {
        conflicts.push({
            type: 'gramsync',
            reason: 'GramSync is enabled — simultaneous sync may cause data conflicts'
        })
    }

    return conflicts
}

// ─── Socket integration ───────────────────────────────────

// Provide a WebSocket instance for real-time sync (inbound-only notify).
export function useSocket(socketInstance) {
    // Rebinding: drop handlers from the previous socket before switching.
    if (activeSocket && activeSocket !== socketInstance) unbindSocketHandlers()
    activeSocket = socketInstance
    if (running) {
        bindSocketHandlers()
        if (isSocketActive()) stopPolling()
        else startPolling()
    }
}

// Check if socket is currently connected and active.
export function isSocketActive() {
    return !!(activeSocket && activeSocket.isConnected && activeSocket.isConnected())
}

// ─── Favorite helpers ─────────────────────────────────────

// Read favorite from storage, normalize from string if needed.
function readFavorite() {
    var favorite = Lampa.Storage.get('favorite', '{}')
    if (typeof favorite === 'string') {
        try { favorite = JSON.parse(favorite) } catch (e) { favorite = {} }
    }
    if (!favorite.card) favorite.card = []
    return favorite
}

// Single favorite write under the received guard (core Timeline received pattern).
// Lampa.Favorite.check()/Lampa.Favorite.get() read from the core's own
// in-memory data$1 cache, NOT from Storage directly (confirmed against
// app.min.js) - that cache only ever refreshes inside Lampa.Favorite.read()
// itself. Without calling it here, every remote list-sync write this file
// makes (all 9 categories, not just thrown - found via §5.3.2's dropped-
// status review) landed correctly in Storage but stayed invisible in the
// live UI (mark buttons, badges) until something ELSE happened to call
// Favorite.read() (a profile switch, a page reload).
//
// Calls it with nolisten=true (found by live test 2026-09-14, regression
// from the very fix above) - a plain, no-arg Favorite.read() ALSO fires
// Lampa.Listener.send('state:changed', {target:'favorite', reason:'read'}),
// which core's OWN Lampa.Activity module reacts to by calling refresh(true)
// (app.min.js, Activity's init$G()) - a 1s-debounced .refresh() on EVERY
// cached activity in the whole navigation stack (up to pages_save_total,
// default 5), not just the current screen. Wired into writeFavorite() -
// the shared write path for all 9 categories, hit by the regular list-sync
// poll cycle (history changes on every card the user opens) and the
// dropped-status poll/activity pulls (§5.3.2) - this fired constantly
// during normal viewing, rebuilding every cached screen's content
// repeatedly (confirmed live on Android: other plugins relying on
// DOM/in-memory state scoped to a screen's lifecycle lost it on each
// rebuild). nolisten=true still refreshes data$1 (data$1 = Storage.get(...)
// happens unconditionally in Favorite's own read$1() before the nolisten
// check) - Favorite.check()/get() see fresh data on the next real render -
// it just skips the broadcast, so nothing forces an immediate in-place
// refresh of an already-visible badge/icon anymore. Acceptable: the
// original bug was about correctness on the NEXT open of a screen/card,
// not a live update while already staring at an unchanged one.
function writeFavorite(favorite) {
    received = true
    Lampa.Storage.set('favorite', favorite)
    if (Lampa.Favorite && typeof Lampa.Favorite.read === 'function') Lampa.Favorite.read(true)
    received = false
}

// ─── Outbound: Favorite.listener + state:changed → serial queue ───
// Core pattern: Favorite.listener.follow('add,added'/'remove') in bookmarks.js init().

function onFavoriteAdd(e) {
    if (!running || received) return
    if (!e || !e.where || !e.card || !e.card.id) return
    // 'thrown' (§5.3.2) never goes through the generic /lists queue below -
    // it maps to Scrob's own first-class dropped-state endpoints instead.
    if (e.where === 'thrown') { pushDrop('add', e.card); return }
    push('add', e.where, e.card)
}

function onFavoriteRemove(e) {
    if (!running || received) return
    if (!e || !e.where || !e.card) return
    if (e.method && e.method !== 'id') return
    if (!e.card.id) return
    if (e.where === 'thrown') { pushDrop('remove', e.card); return }
    push('remove', e.where, e.card)
}

// ─── Dropped status ("Кинуто") — SYNC-ARCHITECTURE-PLAN.md §5.3.2 ─────────
// A first-class Scrob server state (dropped_shows/dropped_movies), not a
// /lists entry - excluded from the generic list-sync above (mapping.js's
// EXCLUDED), pushed/pulled here directly against POST/DELETE
// /history/drop/show|movie and GET /history/dropped instead.

function pushDrop(action, card) {
    var tmdbId = parseInt(card.id, 10)
    if (!tmdbId) return
    var isSeries = detectMediaType(card) === 'series'
    var call = action === 'add' ? api.dropMedia : api.undropMedia

    call(tmdbId, isSeries, function () {}, function (err) {
        if (isAuthError(err)) { pauseSync('Authentication expired'); return }
        enqueueRetry({
            type: 'custom',
            run: function (done, fail) { call(tmdbId, isSeries, done, fail) }
        })
    })
}

// Builds the {tmdb_id, type, title} shape cardFromScrobMedia() expects out
// of a source that only ever gives a bare tmdb_id/title with no `type`
// field of its own (both GET /history/dropped's per-array items and the
// show.*/movie.* socket payloads are like this - see §5.3.2).
function dropMediaShape(mediaType, source) {
    return {
        tmdb_id: source.tmdb_id,
        type: mediaType === 'show' ? 'series' : 'movie',
        title: source.title,
        poster_path: source.poster_path
    }
}

// favorite.thrown holds raw card.id values, which can be either a number or
// a string depending on where the card originally came from (the same
// nuance mapping.js's own localElementSet() already normalizes for) - a
// plain === / Array.indexOf (including the one inside applyRemoteRemove()
// itself) can silently miss a type-mismatched entry. Not touched in
// mapping.js itself (still shared by the generic list-sync above, for the
// other 8 categories) - normalized locally here instead, only for `thrown`.
function hasThrown(favorite, tmdbId) {
    var arr = favorite.thrown
    if (!Array.isArray(arr)) return false
    var target = parseInt(tmdbId, 10)
    for (var i = 0; i < arr.length; i++) {
        if (parseInt(arr[i], 10) === target) return true
    }
    return false
}

function removeThrown(favorite, tmdbId) {
    var arr = favorite.thrown
    if (!Array.isArray(arr)) return false
    var target = parseInt(tmdbId, 10)
    for (var i = 0; i < arr.length; i++) {
        if (parseInt(arr[i], 10) === target) {
            applyRemoteRemove(favorite, 'thrown', arr[i]) // the raw stored element, not `target` - its own indexOf needs an exact match too
            return true
        }
    }
    return false
}

// Throttle shared by every pullDropped() caller (start(), the poll cycle,
// and the activity trigger below) - a single flag/timestamp, not per-caller,
// so none of them can race each other into overlapping GET /history/dropped
// calls. A session-once flag (mirroring timeline.js's own `prefetched`) was
// considered and rejected (found by review 2026-09-12): prefetch is a one-
// time bootstrap whose ongoing freshness other, per-card mechanisms take
// over afterward - dropped-status has no such fallback, the activity
// trigger IS the only extra freshness source beyond polling/socket, so
// going one-shot would permanently disable it after the very first run.
var lastDropPullAt = 0
var dropPullInFlight = false
var DROP_PULL_MIN_INTERVAL_MS = 15000

// Bulk pull - bidirectional (adds AND removes local thrown marks the server
// no longer agrees with), safe to call from start() (force=true, bypasses
// the throttle - a lifecycle event, not rapid navigation), the poll cycle,
// and the activity trigger (both without force - throttled/in-flight-guarded).
function pullDropped(force) {
    if (dropPullInFlight) return
    if (!force && Date.now() - lastDropPullAt < DROP_PULL_MIN_INTERVAL_MS) return
    dropPullInFlight = true

    api.getDropped(function (result) {
        dropPullInFlight = false
        lastDropPullAt = Date.now()

        var favorite = readFavorite()
        var changed = false
        var remoteIds = {}

        function addMissing(mediaType, items) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i]
                var tmdbId = parseInt(item.tmdb_id, 10)
                if (!tmdbId) continue
                remoteIds[tmdbId] = true
                if (hasThrown(favorite, tmdbId)) continue
                applyRemoteAdd(favorite, 'thrown', tmdbId, dropMediaShape(mediaType, item))
                changed = true
            }
        }
        addMissing('show', result.shows)
        addMissing('movie', result.movies)

        // Bidirectional: a title undropped elsewhere (web dashboard, another
        // device) while this device was offline/socket-disconnected must
        // lose its local mark too - unless it's still sitting in pushQueue
        // (this device marked it thrown just now, hasn't reached the server
        // yet) - same stillQueued guard convergeOneList() already uses for
        // the generic list-sync above, ported here for 'thrown'.
        var localThrown = Array.isArray(favorite.thrown) ? favorite.thrown.slice() : []
        for (var li = 0; li < localThrown.length; li++) {
            var localId = parseInt(localThrown[li], 10)
            if (!localId || remoteIds[localId]) continue
            var stillQueued = false
            for (var q = 0; q < pushQueue.length; q++) {
                if (pushQueue[q].lampaKey === 'thrown' && parseInt(pushQueue[q].card.id, 10) === localId) { stillQueued = true; break }
            }
            if (stillQueued) continue
            if (removeThrown(favorite, localId)) changed = true
        }

        if (changed) writeFavorite(favorite)
    }, function (err) {
        dropPullInFlight = false
        // Set on failure too (found by review 2026-09-12) - otherwise an
        // offline server/500 means every subsequent card open or `main`
        // visit retries immediately instead of backing off for the same
        // DROP_PULL_MIN_INTERVAL_MS.
        lastDropPullAt = Date.now()
        console.warn('ScrobSync', 'dropped pull failed', err)
    })
}

// Home screen / full card visit - separate 'activity' listener (engine.js
// had none before this), same component filter timeline.js's own
// onActivityStart()/onMainScreenActivity() already use. Throttled by
// pullDropped()'s own guard above, not a session-once flag - see the
// rejected-alternative note there for why.
function onDropSyncActivity(e) {
    if (!running) return
    if (!e || e.type !== 'start') return
    if (e.component !== 'main' && e.component !== 'full') return
    pullDropped()
}

// Inbound socket event (handler.js's bindDropSync) - a show/movie was
// dropped or undropped on ANY device tied to this account. `payload` is
// whatever the server's socket emit carries ({ show_id|media_id, tmdb_id,
// title }, see history.py) - enough to build a minimal card via
// cardFromScrobMedia(), same fallback shape a fresh remote /lists addition
// already gets elsewhere in this file.
function applyRemoteDropEvent(mediaType, action, payload) {
    if (!running || !payload || !payload.tmdb_id) return
    var favorite = readFavorite()
    var tmdbId = parseInt(payload.tmdb_id, 10)
    if (!tmdbId) return
    var changed
    if (action === 'dropped') {
        changed = !hasThrown(favorite, tmdbId)
        if (changed) applyRemoteAdd(favorite, 'thrown', tmdbId, dropMediaShape(mediaType, payload))
    } else {
        changed = removeThrown(favorite, tmdbId)
    }
    if (changed) writeFavorite(favorite)
}

// Custom categories bypass core Favorite (see main.js toggleCustomCategory) and
// only emit state:changed with type=custom key — bridge them into the same queue.
// Dedupe: core keys already arrived via Favorite.listener; skip if identical op queued.
function onStateChanged(e) {
    if (!running || received) return
    if (!e || e.target !== 'favorite' || e.reason !== 'update') return
    if (!e.type || !e.card || !e.card.id) return
    if (e.method !== 'add' && e.method !== 'added' && e.method !== 'remove') return
    var fav = readFavorite()
    if (!Array.isArray(fav[e.type])) return
    var method = (e.method === 'remove') ? 'remove' : 'add'
    for (var i = 0; i < pushQueue.length; i++) {
        if (pushQueue[i].method === method &&
            pushQueue[i].lampaKey === e.type && pushQueue[i].card.id == e.card.id) return
    }
    push(method, e.type, e.card)
}

function push(method, lampaKey, card) {
    pushQueue.push({ method: method, lampaKey: lampaKey, card: card })
    if (outboundTimer) clearTimeout(outboundTimer)
    outboundTimer = setTimeout(processQueue, DEBOUNCE_MS)
}

// Serial outbound drain: one REST write at a time, then mirror + invalidate.
// `outboundTimer` is a plain setTimeout, not a Lampa listener re-evaluated
// against the CURRENT `running` on every call - stop() clears both the timer
// and pushQueue, but only if it runs to completion before this fires. Checked
// directly here too (found live 2026-09-18: Favorite/list writes kept
// reaching the server for a short window after toggling sync off).
function processQueue() {
    outboundTimer = null
    if (!running || pushRunning || pushQueue.length === 0) return
    pushRunning = true

    var op = pushQueue.shift()
    writeOne(op, function () {
        pushRunning = false
        if (pushQueue.length > 0) {
            outboundTimer = setTimeout(processQueue, DEBOUNCE_MS)
        }
    })
}

// Resolve list_id for a Lampa key: mapstore first, then mirror by canonical name.
function resolveListId(lampaKey) {
    var mapping = mapstore.getMapping(lampaKey)
    if (mapping && mapping.list_id) return { listId: mapping.list_id, listName: mapping.list_name || listNameForKey(lampaKey) }
    var name = listNameForKey(lampaKey)
    if (!name) return null
    var m = mirror.get()
    if (m.lists[name] && m.lists[name].list_id) return { listId: m.lists[name].list_id, listName: name }
    return null
}

// Single REST write. Socket is notify-only: no socketIngest branch here.
function writeOne(op, done) {
    var target = resolveListId(op.lampaKey)
    if (!target) {
        // Unknown list (e.g. new custom key before self-heal) — defer to update().
        update('self-heal')
        done()
        return
    }
    var cardId = parseInt(op.card.id, 10)
    if (!cardId) { done(); return }
    var mediaType = detectMediaType(op.card)
    var key = elementKey(mediaType, cardId)

    if (op.method === 'add') {
        api.addListItem(target.listId, cardId, mediaType, function (response) {
            mirror.setItemId(target.listName, key, response && response.id ? response.id : null)
            // Notify other devices; our own state already converged via the queue.
            done()
        }, function (err, status) {
            if (status === 409 || String(err).indexOf('409') !== -1) {
                // Already on server: fetch the real item_id so delete stays possible.
                fetchItemId(target.listId, target.listName, key, done)
                return
            }
            if (isAuthError(err)) { pauseSync('Authentication expired'); done(); return }
            enqueueRetry({ type: 'add', listId: target.listId, listName: target.listName, key: key, tmdbId: cardId, mediaType: mediaType })
            done()
        })
    } else {
        var itemId = mirror.getItemId(target.listName, key)
        if (!itemId) {
            // No item_id (409 null-mark or missed ingest): resolve before delete.
            fetchItemId(target.listId, target.listName, key, function (resolved) {
                var rid = mirror.getItemId(target.listName, key)
                if (rid) {
                    api.deleteListItem(target.listId, rid, function () {
                        mirror.removeItemId(target.listName, key)
                        done()
                    }, function (err) {
                        if (isAuthError(err)) { pauseSync('Authentication expired'); done(); return }
                        enqueueRetry({ type: 'remove', listId: target.listId, listName: target.listName, key: key, itemId: rid })
                        done()
                    })
                } else {
                    // Item is neither on server nor in mirror — converge by dropping the mark.
                    mirror.removeItemId(target.listName, key)
                    done()
                }
            }, true)
            return
        }
        api.deleteListItem(target.listId, itemId, function () {
            mirror.removeItemId(target.listName, key)
            done()
        }, function (err) {
            if (isAuthError(err)) { pauseSync('Authentication expired'); done(); return }
            enqueueRetry({ type: 'remove', listId: target.listId, listName: target.listName, key: key, itemId: itemId })
            done()
        })
    }
}

// Fetch the server item_id for one element key (fixes 409 null-marks).
// When onlyCheck is set, never creates — just resolves or drops the mark.
function fetchItemId(listId, listName, key, callback, onlyCheck) {
    api.getListItems(listId, function (items) {
        var set = scrobElementSet(items)
        if (set[key]) {
            mirror.setItemId(listName, key, set[key].itemId)
        } else if (onlyCheck) {
            mirror.removeItemId(listName, key)
        } else {
            mirror.setItemId(listName, key, null)
        }
        if (callback) callback(set[key] ? set[key].itemId : null)
    }, function () {
        if (!onlyCheck) mirror.setItemId(listName, key, null)
        if (callback) callback(null)
    })
}

// ─── List resolution ──────────────────────────────────────

// Resolve all syncable list names against Scrob server.
// Creates missing lists. Returns map: { listName: listId }
// Mapped keys use the mapped Scrob list; unmapped keys use [Lampa] lists.
function resolveLists(callback) {
    api.getLists(function (serverLists) {
        // Index server lists by name and by id for O(1) lookup
        var byName = {}
        var byId = {}
        for (var i = 0; i < serverLists.length; i++) {
            byName[serverLists[i].name] = serverLists[i]
            byId[serverLists[i].id] = serverLists[i]
        }

        // Read current favorite to get all syncable keys
        var favorite = readFavorite()

        var keys = syncableKeys(favorite)
        var resolved = {}
        var pending = 0
        brokenMappings = []

        function done() {
            callback(resolved)
        }

        function checkDone() {
            pending--
            if (pending <= 0) done()
        }

        // Resolve a canonical [Lampa] key: create list if missing
        function resolveDefaultKey(name) {
            if (byName[name]) {
                resolved[name] = byName[name].id
                mirror.setList(name, byName[name].id)
                checkDone()
            } else {
                pending++
                api.createList(name, function (created) {
                    resolved[name] = created.id
                    mirror.setList(name, created.id)
                    checkDone()
                }, function () {
                    checkDone()
                })
            }
        }

        if (keys.length === 0) {
            done()
        } else {
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j]
                var mapping = mapstore.getMapping(key)

                if (mapping) {
                    // Mapped key: resolve by list_id (fallback by list_name)
                    var serverList = byId[mapping.list_id]
                    if (!serverList && mapping.list_name) {
                        serverList = byName[mapping.list_name]
                    }

                    if (serverList) {
                        resolved[mapping.list_name || listNameForKey(key)] = serverList.id
                        mirror.setList(mapping.list_name || listNameForKey(key), serverList.id)
                        checkDone()
                    } else {
                        // List not found on server — mark broken, skip
                        brokenMappings.push(key)
                        mapstore.markBroken(key)
                        checkDone()
                    }
                } else {
                    // Unmapped key: use default [Lampa] list
                    var name = listNameForKey(key)
                    if (name) {
                        pending++
                        resolveDefaultKey(name)
                    } else {
                        checkDone()
                    }
                }
            }

            // Also resolve any existing mirror lists (might have been added by other clients)
            var m = mirror.get()
            var mirrorNames = Object.keys(m.lists)
            for (var k = 0; k < mirrorNames.length; k++) {
                if (!resolved[mirrorNames[k]]) {
                    pending++
                    resolveDefaultKey(mirrorNames[k])
                }
            }
            if (pending === 0) done()
        }
    }, function () {
        console.warn('ScrobSync', 'getLists failed')
        callback({})
    })
}

// Ensure a single list exists on server, merge into mirror, then re-run update.
// Self-heal completion always triggers a повторний диф (converge), never just fills the mirror.
function ensureList(name, lampaKey, callback) {
    function afterResolve(listId) {
        mergePair(lampaKey, listId, name, function () {
            update('self-heal')
            if (callback) callback()
        })
    }
    api.getLists(function (serverLists) {
        var byName = {}
        for (var i = 0; i < serverLists.length; i++) {
            byName[serverLists[i].name] = serverLists[i]
        }

        if (byName[name]) {
            mirror.setList(name, byName[name].id)
            afterResolve(byName[name].id)
        } else {
            api.createList(name, function (created) {
                mirror.setList(name, created.id)
                afterResolve(created.id)
            }, callback)
        }
    }, callback)
}

// ─── Converge: single update() for inbound WS + polling ───
// Mirrors Account.Bookmarks.update(): fetch everything, converge every pair,
// single favorite write, bump the Tracker stamp.

export function update(reason) {
    if (!running || !hasSession()) return
    if (updateRunning) {
        // Coalesce concurrent invalidations into one trailing run.
        if (updateTimer) clearTimeout(updateTimer)
        updateTimer = setTimeout(function () { updateTimer = null; update(reason) }, DEBOUNCE_MS)
        return
    }
    updateRunning = true
    // Own throttle/in-flight guard (pullDropped() itself) - independent of
    // updateRunning above, never blocks or is blocked by the /lists convergence.
    pullDropped()
    api.getLists(function (serverLists) {
        convergeAll(serverLists, function () {
            updateRunning = false
        })
    }, function () {
        console.warn('ScrobSync', 'update getLists failed (' + (reason || 'poll') + ')')
        updateRunning = false
    })
}

// Debounced invalidate entry used by the socket hub and the poll timer.
export function invalidate(reason) {
    if (!running || !hasSession()) return
    if (updateRunning) return
    if (updateTimer) clearTimeout(updateTimer)
    updateTimer = setTimeout(function () {
        updateTimer = null
        update(reason || 'invalidate')
    }, DEBOUNCE_MS)
}

function convergeAll(serverLists, done) {
    var favorite = readFavorite()
    var map = mapstore.getMap()
    var m = mirror.get()

    // Index server lists by id.
    var byId = {}
    for (var i = 0; i < serverLists.length; i++) {
        if (serverLists[i].id != null) byId[serverLists[i].id] = serverLists[i]
    }

    // Build converge targets: every known pair exactly once.
    // Sources: mirror entries + mapstore mappings + local syncable keys.
    var targets = {} // listName -> { listId, lampaKey }
    var mirrorNames = Object.keys(m.lists)
    for (var a = 0; a < mirrorNames.length; a++) {
        var entry = m.lists[mirrorNames[a]]
        if (entry && entry.list_id) {
            targets[mirrorNames[a]] = {
                listId: entry.list_id,
                lampaKey: resolveKeyForListId(entry.list_id, map, m.lists, favorite)
            }
        }
    }
    var mapKeys = Object.keys(map)
    for (var b = 0; b < mapKeys.length; b++) {
        var me = map[mapKeys[b]]
        if (me && me.list_id && byId[me.list_id]) {
            var mname = me.list_name || byId[me.list_id].name
            if (!targets[mname]) targets[mname] = { listId: me.list_id, lampaKey: mapKeys[b] }
        }
    }
    var keys = syncableKeys(favorite)
    for (var c = 0; c < keys.length; c++) {
        var dname = listNameForKey(keys[c])
        if (dname && !targets[dname] && byId && m.lists[dname]) {
            targets[dname] = { listId: m.lists[dname].list_id, lampaKey: keys[c] }
        }
    }

    var names = Object.keys(targets)
    var changed = false

    function next(index) {
        if (index >= names.length) {
            if (changed) {
                writeFavorite(favorite)
                mirror.save(mirror.get())
            } else {
                // Still bump the Tracker stamp: converged-noop is a successful sync.
                mirror.save(mirror.get())
            }
            // Self-heal pass: brand-new local keys with no server list yet.
            selfHeal(favorite, map, function () { done() })
            return
        }
        var listName = names[index]
        var target = targets[listName]
        if (!target.listId || !target.lampaKey) { next(index + 1); return }
        convergeOneList(listName, target.listId, target.lampaKey, favorite, function (listChanged) {
            if (listChanged) changed = true
            next(index + 1)
        })
    }
    if (names.length === 0) {
        selfHeal(favorite, map, function () { done() })
        return
    }
    next(0)
}

// Converge one pair: pull remote→local and push local→remote, REST only.
function convergeOneList(listName, listId, lampaKey, favorite, callback) {
    api.getListItems(listId, function (scrobItems) {
        var scrobSet = scrobElementSet(scrobItems)
        var localSet = localElementSet(favorite, lampaKey)
        var mirrorItems = (mirror.getList(listName) || {}).items || {}

        // Remote-first: additions and removals relative to the converged mirror.
        var toAddLocal = []
        for (var sk in scrobSet) {
            if (typeof mirrorItems[sk] === 'undefined' && !localSet[sk]) {
                toAddLocal.push({ key: sk, media: scrobSet[sk].media })
            } else if (typeof mirrorItems[sk] === 'undefined' && localSet[sk]) {
                // Both sides added the same item while offline — adopt the server item_id.
                mirror.setItemId(listName, sk, scrobSet[sk].itemId)
            }
        }
        var toRemoveLocal = []
        for (var mk in mirrorItems) {
            if (!scrobSet[mk] && localSet[mk]) {
                // Gone on server but present locally: another device removed it — follow.
                // Our own queued removes carry a real item_id and win on push below.
                var stillQueued = false
                for (var q = 0; q < pushQueue.length; q++) {
                    if (pushQueue[q].lampaKey === lampaKey && pushQueue[q].method === 'remove') {
                        var qp = parseElementKey(mk)
                        if (String(pushQueue[q].card.id) === String(qp.tmdbId)) { stillQueued = true; break }
                    }
                }
                if (!stillQueued) toRemoveLocal.push(mk)
            } else if (!scrobSet[mk] && !localSet[mk]) {
                mirror.removeItemId(listName, mk)
            }
        }

        var listChanged = (toAddLocal.length > 0 || toRemoveLocal.length > 0)

        for (var ai = 0; ai < toAddLocal.length; ai++) {
            var parsed = parseElementKey(toAddLocal[ai].key)
            applyRemoteAdd(favorite, lampaKey, parseInt(parsed.tmdbId, 10), toAddLocal[ai].media)
            mirror.setItemId(listName, toAddLocal[ai].key, scrobSet[toAddLocal[ai].key].itemId)
        }
        for (var ri = 0; ri < toRemoveLocal.length; ri++) {
            var rparsed = parseElementKey(toRemoveLocal[ri])
            applyRemoteRemove(favorite, lampaKey, parseInt(rparsed.tmdbId, 10))
            mirror.removeItemId(listName, toRemoveLocal[ri])
        }

        // Local-first: push what is local but missing on the server.
        var toPush = []
        var freshLocal = localElementSet(favorite, lampaKey)
        for (var lk in freshLocal) {
            if (!scrobSet[lk]) toPush.push(lk)
        }
        if (toPush.length === 0) { callback(listChanged); return }
        if (listChanged) listChanged = true
        pushRestItems(listId, listName, toPush, 0, function () {
            callback(true)
        })
    }, function () {
        callback(false)
    })
}

// Sequential REST push with 150ms pause between writes. Each step re-arms
// itself via setTimeout - same gap as processQueue() above (a stray timer
// tick doesn't re-evaluate `running` on its own) - checked directly so
// toggling sync off mid-drain doesn't keep pushing the rest of a large
// batch (e.g. a freshly-triggered forceSync() after lampac-export) for
// several more seconds. Still calls `callback()` on the way out so the
// caller's own convergeOneList()/convergeAll() chain settles normally
// instead of leaving `updateRunning` stuck.
function pushRestItems(listId, listName, items, index, callback) {
    if (!running) { callback(); return }
    if (index >= items.length) { callback(); return }
    var parts = parseElementKey(items[index])
    var tmdbId = parseInt(parts.tmdbId, 10)
    if (!tmdbId) { pushRestItems(listId, listName, items, index + 1, callback); return }
    api.addListItem(listId, tmdbId, parts.mediaType, function (response) {
        mirror.setItemId(listName, items[index], response && response.id ? response.id : null)
        setTimeout(function () {
            pushRestItems(listId, listName, items, index + 1, callback)
        }, 150)
    }, function (err, status) {
        if (status === 409 || String(err).indexOf('409') !== -1) {
            fetchItemId(listId, listName, items[index], function () {
                setTimeout(function () {
                    pushRestItems(listId, listName, items, index + 1, callback)
                }, 150)
            })
            return
        }
        if (isAuthError(err)) { pauseSync('Authentication expired'); callback(); return }
        enqueueRetry({ type: 'add', listId: listId, listName: listName, key: items[index], tmdbId: tmdbId, mediaType: parts.mediaType })
        setTimeout(function () {
            pushRestItems(listId, listName, items, index + 1, callback)
        }, 150)
    })
}

// Self-heal: brand-new local keys with no server list yet → ensureList + re-diff.
function selfHeal(favorite, map, done) {
    if (healing) { done(); return }
    var m = mirror.get()
    var missing = []
    var keys = syncableKeys(favorite)
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var mapped = map[key]
        if (mapped) {
            if (mapped.list_id && !m.lists[mapped.list_name]) {
                missing.push({ key: key, name: mapped.list_name, listId: mapped.list_id })
            }
            continue
        }
        var name = listNameForKey(key)
        if (name && !m.lists[name]) missing.push({ key: key, name: name, listId: null })
    }
    if (missing.length === 0) { done(); return }
    healing = true
    var pending = missing.length
    function oneDone() {
        pending--
        if (pending <= 0) { healing = false; done() }
    }
    for (var j = 0; j < missing.length; j++) {
        (function (entry) {
            if (entry.listId) {
                mirror.setList(entry.name, entry.listId)
                mergePair(entry.key, entry.listId, entry.name, oneDone)
            } else {
                ensureList(entry.name, entry.key, oneDone)
            }
        })(missing[j])
    }
}

// ─── Initial sync (section 7) ─────────────────────────────

function initialSync() {
    if (mirror.isInitialDone()) return
    if (!hasSession()) return

    console.log('ScrobSync', 'initial sync start')

    resolveLists(function (listMap) {
        var listNames = Object.keys(listMap)
        if (listNames.length === 0) {
            // If mirror is empty and this was a forced/first sync — report failure
            var m = mirror.get()
            if (Object.keys(m.lists).length === 0) {
                Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_lists_error'))
            } else {
                mirror.markInitialDone()
            }
            return
        }
        // First converge goes through the single update() path.
        mirror.markInitialDone()
        update('initial')
    })
}

// ─── Retry queue ──────────────────────────────────────────
// Shared by list push/pull (below) and any other module needing bounded
// retry-with-backoff for a failed REST call (e.g. utils/sync/timeline.js's
// session heartbeats) — enqueueRetry() is exported for that reuse. A
// `type: 'custom'` op carries its own `run(done, fail)` closure instead of
// engine-specific fields, so callers outside this file never need to know
// about listId/listName/mirror.

export function enqueueRetry(op) {
    op.retries = (op.retries || 0) + 1
    if (op.retries <= RETRY_MAX) {
        retryQueue.push(op)
    } else {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_lost'))
    }
}

function processRetryOp(op) {
    if (op.type === 'custom') {
        if (typeof op.run !== 'function') return
        op.run(function done() {
            // Success — nothing more to do, already removed from the queue.
        }, function fail() {
            // Same pattern as 'add'/'remove' below: a retry-of-a-retry that
            // fails again is dropped silently past RETRY_MAX, not renotified —
            // enqueueRetry() itself already shows the Noty on the FIRST failure.
            op.retries = (op.retries || 0) + 1
            if (op.retries <= RETRY_MAX) retryQueue.push(op)
        })
    } else if (op.type === 'add') {
        var parts = parseElementKey(op.key)
        var tmdbId = op.tmdbId || parseInt(parts.tmdbId, 10)
        var mediaType = op.mediaType || parts.mediaType
        if (!tmdbId) return
        api.addListItem(op.listId, tmdbId, mediaType, function (response) {
            mirror.setItemId(op.listName, op.key, response && response.id ? response.id : null)
        }, function (err, status) {
            if (status === 409 || String(err).indexOf('409') !== -1) {
                fetchItemId(op.listId, op.listName, op.key, null)
                return
            }
            op.retries = (op.retries || 0) + 1
            if (op.retries <= RETRY_MAX) retryQueue.push(op)
        })
    } else if (op.type === 'remove') {
        var itemId = op.itemId || mirror.getItemId(op.listName, op.key)
        if (!itemId) {
            // Resolve the real item_id first — deletes never use a null mark.
            fetchItemId(op.listId, op.listName, op.key, function (resolved) {
                var rid = resolved || mirror.getItemId(op.listName, op.key)
                if (rid) {
                    api.deleteListItem(op.listId, rid, function () {
                        mirror.removeItemId(op.listName, op.key)
                    }, function () {
                        op.retries = (op.retries || 0) + 1
                        if (op.retries <= RETRY_MAX) retryQueue.push(op)
                    })
                } else {
                    mirror.removeItemId(op.listName, op.key)
                }
            }, true)
            return
        }
        api.deleteListItem(op.listId, itemId, function () {
            mirror.removeItemId(op.listName, op.key)
        }, function () {
            op.retries = (op.retries || 0) + 1
            if (op.retries <= RETRY_MAX) retryQueue.push(op)
        })
    }
}

function startRetryLoop() {
    if (retryTimer) return

    retryTimer = setInterval(function () {
        if (!running || retryQueue.length === 0) return

        var batch = retryQueue.splice(0, retryQueue.length)
        for (var i = 0; i < batch.length; i++) {
            processRetryOp(batch[i])
        }
    }, RETRY_DELAY)
}

function stopRetryLoop() {
    if (retryTimer) {
        clearInterval(retryTimer)
        retryTimer = null
    }
    retryQueue = []
}

// ─── Inbound polling ────────────────────────

function getPollInterval() {
    var val = Lampa.Storage.get('scrob_sync_interval', '30')
    return parseInt(val, 10) * 1000 || 30000
}

function startPolling() {
    if (pollTimer) return

    pollTimer = setInterval(function () {
        if (!running || !hasSession()) return
        // Socket-active mode invalidates via WS; polling is the fallback path.
        // Both funnel into the same update() — never two parallel writers.
        invalidate('poll')
    }, getPollInterval())
}

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
    }
}

// ─── Auth error handling ──────────────────────────────────

function isAuthError(err) {
    if (!err) return false
    var str = String(err)
    return str.indexOf('401') !== -1 || str.indexOf('403') !== -1
}

function pauseSync(reason) {
    running = false
    stopPolling()
    stopRetryLoop()
    console.warn('ScrobSync', 'paused:', reason)
    Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_paused') + ': ' + reason)
}

// ─── Profile change handling ──────────────────────────────

function setupProfileListener() {
    var lastProfileId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)

    profileListener = function (e) {
        if (e.name === KEYS.ACTIVE_PROFILE_ID) {
            var newId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID)
            if (newId !== lastProfileId) {
                lastProfileId = newId
                // Stop, reset mirror + tracker stamp, re-sync for new profile.
                // Mirrors core: profile_select resets tracker time/version to force a dump.
                stop()
                mirror.reset()
                mirror.clearInitialDone()
                start()
            }
        }
    }

    Lampa.Storage.listener.follow('change', profileListener)
}

// ─── Socket lifecycle ─────────────────────────────────────

// Socket open converges on a stale tracker snapshot (core socket open → update).
function onSocketOpen() {
    if (!running) return
    stopPolling()
    if (mirror.isStale(getPollInterval())) update('socket-open')
}

// Socket close resumes polling fallback.
function onSocketClose() {
    if (!running) return
    startPolling()
}

// Register WS invalidate handlers after start (core: socket open → update on stale).
function bindSocketHandlers() {
    if (!activeSocket || handlersBound) return
    bindUpdate(invalidate)
    bindDropSync(applyRemoteDropEvent)
    registerHandlers(activeSocket)
    if (activeSocket.onLifecycle) {
        activeSocket.onLifecycle('open', onSocketOpen)
        activeSocket.onLifecycle('close', onSocketClose)
    }
    handlersBound = true
    // Already-connected socket with a stale tracker snapshot converges immediately.
    if (isSocketActive() && mirror.isStale(getPollInterval())) update('socket-open')
}

function unbindSocketHandlers() {
    if (activeSocket && handlersBound) {
        unregisterHandlers(activeSocket)
        if (activeSocket.offLifecycle) {
            activeSocket.offLifecycle('open', onSocketOpen)
            activeSocket.offLifecycle('close', onSocketClose)
        }
    }
    handlersBound = false
    bindUpdate(null)
    bindDropSync(null)
}

// ─── Mapping merge (section 14.3) ─────────────────────────

// Merge a single pair: union of local category and Scrob list, REST only.
function mergePair(lampaKey, listId, listName, callback) {
    console.log('ScrobSync', 'merge pair', listName)
    api.getListItems(listId, function (scrobItems) {
        var favorite = readFavorite()
        var scrobSet = scrobElementSet(scrobItems)
        var localSet = localElementSet(favorite, lampaKey)

        // Push: localSet − scrobSet (REST only).
        var toAdd = []
        for (var k in localSet) {
            if (!scrobSet[k]) toAdd.push(k)
        }

        // Pull: scrobSet − localSet (unified applicator).
        var toPull = []
        for (var sk in scrobSet) {
            if (!localSet[sk]) toPull.push({ key: sk, media: scrobSet[sk].media })
        }

        pushRestItems(listId, listName, toAdd, 0, function () {
            for (var p = 0; p < toPull.length; p++) {
                var parsed = parseElementKey(toPull[p].key)
                applyRemoteAdd(favorite, lampaKey, parseInt(parsed.tmdbId, 10), toPull[p].media)
                mirror.setItemId(listName, toPull[p].key, scrobSet[toPull[p].key].itemId)
            }
            // Adopt server item_ids for keys the push just created (409 or fresh).
            api.getListItems(listId, function (fresh) {
                var freshSet = scrobElementSet(fresh)
                for (var fk in freshSet) {
                    mirror.setItemId(listName, fk, freshSet[fk].itemId)
                }
                writeFavorite(favorite)
                if (!mirror.getList(listName)) mirror.setList(listName, listId)
                mirror.save(mirror.get())
                callback()
            }, function () {
                writeFavorite(favorite)
                if (!mirror.getList(listName)) mirror.setList(listName, listId)
                mirror.save(mirror.get())
                callback()
            })
        })
    }, function () {
        callback()
    })
}

// Create a mapping: set mapping, remove orphaned [Lampa] mirror entry, merge pair
export function applyMapping(lampaKey, listId, listName, onDone, onFail) {
    console.log('ScrobSync', 'mapping apply', lampaKey)
    // Exclusivity check
    var success = mapstore.setMapping(lampaKey, listId, listName)
    if (!success) {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_map_conflict'))
        if (onFail) onFail()
        return
    }

    // Remove orphaned [Lampa] mirror entry for this key
    var defaultName = listNameForKey(lampaKey)
    if (defaultName) {
        var m = mirror.get()
        if (m.lists[defaultName]) {
            delete m.lists[defaultName]
            mirror.save(m)
        }
    }

    // Merge the mapped pair
    mergePair(lampaKey, listId, listName, function () {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_map_created'))
        if (onDone) onDone()
    })
}

// Remove mapping: delete mapping, remove mirror entry, reset default [Lampa] pair, reconcile
export function removeMappingFlow(lampaKey, onDone) {
    console.log('ScrobSync', 'mapping remove', lampaKey)
    var mapping = mapstore.getMapping(lampaKey)
    if (!mapping) {
        if (onDone) onDone()
        return
    }

    // Remove the mapping
    mapstore.removeMapping(lampaKey)

    // Remove the mapped list's mirror entry
    var m = mirror.get()
    var mappedListName = mapping.list_name
    if (mappedListName && m.lists[mappedListName]) {
        delete m.lists[mappedListName]
    }

    // Reset the default [Lampa] pair's mirror entry to trigger full reconcile
    var defaultName = listNameForKey(lampaKey)
    if (defaultName && m.lists[defaultName]) {
        // Clear items so reconcile does a full diff
        m.lists[defaultName].items = {}
    }
    mirror.save(m)

    // Re-resolve the default [Lampa] list and reconcile via the single update() path
    api.getLists(function (serverLists) {
        var byName = {}
        for (var i = 0; i < serverLists.length; i++) {
            byName[serverLists[i].name] = serverLists[i]
        }

        if (defaultName && byName[defaultName]) {
            mirror.setList(defaultName, byName[defaultName].id)
            update('mapping-remove')
        }
        if (onDone) onDone()
    }, function () {
        if (onDone) onDone()
    })
}

// ─── Public API ───────────────────────────────────────────

// Start the sync engine
export function start() {
    if (running) return
    if (!hasSession()) {
        console.warn('ScrobSync', 'start skipped: no session')
        return
    }
    if (!Lampa.Storage.get('scrob_sync_enabled')) {
        console.warn('ScrobSync', 'start skipped: sync disabled')
        return
    }

    // Check for blocking conflicts
    var conflicts = detectConflicts()
    for (var i = 0; i < conflicts.length; i++) {
        if (conflicts[i].type === 'cub_sync') {
            console.warn('ScrobSync', 'start skipped: CUB conflict')
            Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_blocked_cub'))
            return
        }
    }

    running = true

    // Outbound: Favorite add/remove + state:changed bridge (custom keys), guarded.
    if (Lampa.Favorite && Lampa.Favorite.listener) {
        if (!Lampa.Favorite.listener.has('add', onFavoriteAdd)) {
            Lampa.Favorite.listener.follow('add,added', onFavoriteAdd)
        }
        if (!Lampa.Favorite.listener.has('remove', onFavoriteRemove)) {
            Lampa.Favorite.listener.follow('remove', onFavoriteRemove)
        }
    }
    if (Lampa.Listener && !socketPollBound) {
        socketPollBound = true
        Lampa.Listener.follow('state:changed', onStateChanged)
    }
    if (Lampa.Listener && !dropActivityBound) {
        dropActivityBound = true
        Lampa.Listener.follow('activity', onDropSyncActivity)
    }

    // Socket handlers register after start; polling stops once WS is live.
    bindSocketHandlers()
    if (isSocketActive()) stopPolling()
    else startPolling()

    setupProfileListener()
    startRetryLoop()

    // Initial sync if no mirror exists
    var m = mirror.get()
    if (Object.keys(m.lists).length === 0) {
        initialSync()
    } else if (mirror.isStale(getPollInterval())) {
        update('start-stale')
    }

    // Dropped-status bulk pull (§5.3.2) - independent of the /lists mirror
    // above (dropped_shows/dropped_movies aren't a list), idempotent, so
    // safe to run unconditionally on every start() (login, sync toggle,
    // profile switch) same as timeline.js's own pullContinueWatching().
    // force=true: a lifecycle event, not rapid navigation - bypasses the
    // throttle so a profile switch always gets a fresh pull immediately.
    pullDropped(true)

    console.log('ScrobSync', 'started', { mirrorLists: Object.keys(mirror.get().lists).length })
}

// Stop the sync engine
export function stop() {
    running = false
    console.log('ScrobSync', 'stopped')

    unbindSocketHandlers()
    activeSocket = null

    if (Lampa.Favorite && Lampa.Favorite.listener) {
        Lampa.Favorite.listener.remove('add', onFavoriteAdd)
        Lampa.Favorite.listener.remove('added', onFavoriteAdd)
        Lampa.Favorite.listener.remove('remove', onFavoriteRemove)
    }
    if (Lampa.Listener && typeof Lampa.Listener.remove === 'function' && socketPollBound) {
        Lampa.Listener.remove('state:changed', onStateChanged)
        socketPollBound = null
    }
    if (Lampa.Listener && typeof Lampa.Listener.remove === 'function' && dropActivityBound) {
        Lampa.Listener.remove('activity', onDropSyncActivity)
        dropActivityBound = false
    }

    if (profileListener) {
        Lampa.Storage.listener.remove('change', profileListener)
        profileListener = null
    }

    if (outboundTimer) {
        clearTimeout(outboundTimer)
        outboundTimer = null
    }
    if (updateTimer) {
        clearTimeout(updateTimer)
        updateTimer = null
    }
    updateRunning = false
    pushRunning = false
    pushQueue = []

    // Dropped-status throttle state (§5.3.2) - reset so a stale timestamp
    // from the profile/session just left doesn't linger into the next one
    // (start()'s own pullDropped(true) bypasses it anyway, but a mid-flight
    // request from the old profile shouldn't keep dropPullInFlight stuck).
    lastDropPullAt = 0
    dropPullInFlight = false

    stopPolling()
    stopRetryLoop()
}

// Force a manual sync (for settings UI "Sync Now" button)
export function forceSync() {
    if (!running) return
    mirror.clearInitialDone()
    initialSync()
    pullDropped(true)
}

// Get sync status for display
export function getStatus() {
    var m = mirror.get()
    var listCount = Object.keys(m.lists).length
    var itemCount = 0
    var names = Object.keys(m.lists)
    for (var i = 0; i < names.length; i++) {
        itemCount += Object.keys(m.lists[names[i]].items).length
    }

    return {
        running: running,
        listCount: listCount,
        itemCount: itemCount,
        lastSync: m.updated_at,
        conflicts: detectConflicts(),
        brokenMappings: brokenMappings.slice()
    }
}
