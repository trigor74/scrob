// Scrob sync — socket notification hub.
// Socket is inbound-only: every event only invalidates state and calls engine.update().
// No direct writes to Lampa.Storage here (mirrors src/core/socket.js: inbound
// 'bookmarks' only triggers Account.Bookmarks.update()).

// Registered update callback from the engine (set via bindUpdate)
var updateFn = null

// Registered playback-pull callback from timeline.js (set via bindPlaybackUpdate).
// Deliberately a SEPARATE hook from updateFn/requestUpdate above, not routed
// through the engine at all - a playback_session.* event calls for a targeted
// re-pull of whatever card happens to be open right now (SYNC-ARCHITECTURE-
// PLAN.md §5.1.1/§5.4, Гілка 9), not the engine's own list convergence.
var playbackPullFn = null

// Registered dropped-status callback from engine.js (set via bindDropSync).
// Also separate from updateFn: a show.dropped/movie.dropped event needs the
// actual payload (tmdb_id/title) to update ONE local Favorite('thrown')
// entry directly (§5.3.2) - re-running the whole list convergence for this
// would be both the wrong mechanism (thrown isn't a /lists entry any more)
// and unnecessary work.
var dropSyncFn = null

// Named handlers: stable references so off() actually unregisters (unlike
// anonymous closures, which silently leak and double-fire after restarts).
function onItemAdded(payload) { requestUpdate('list.item_added') }
function onItemRemoved(payload) { requestUpdate('list.item_removed') }
function onListCreated(payload) { requestUpdate('list.created') }
function onListUpdated(payload) { requestUpdate('list.updated') }
function onListDeleted(payload) { requestUpdate('list.deleted') }
function onWatchEvent(payload) { requestUpdate('watch_event.created') }
function onPlaybackCompleted(payload) { requestUpdate('playback_session.completed') }
function onPlaybackStarted(payload) { requestPlaybackPull() }
function onPlaybackPlaying(payload) { requestPlaybackPull() }
function onPlaybackPaused(payload) { requestPlaybackPull() }
function onShowDropped(payload) { requestDropSync('show', 'dropped', payload) }
function onShowUndropped(payload) { requestDropSync('show', 'undropped', payload) }
function onMovieDropped(payload) { requestDropSync('movie', 'dropped', payload) }
function onMovieUndropped(payload) { requestDropSync('movie', 'undropped', payload) }

// Bind the engine update() entry point. Called once from engine.start().
export function bindUpdate(fn) {
    updateFn = fn
}

// Bind the playback-pull entry point. Called once from timelineSync.start().
export function bindPlaybackUpdate(fn) {
    playbackPullFn = fn
}

// Bind the dropped-status entry point. Called once from engine.start().
export function bindDropSync(fn) {
    dropSyncFn = fn
}

// Single notification path: ask the engine to refetch and converge.
export function requestUpdate(reason) {
    if (typeof updateFn === 'function') updateFn(reason || 'socket')
}

// Notify timeline.js that a playback_session.* event arrived somewhere for
// this account - no payload passed through on purpose (see timeline.js's
// pullActiveCard(): it re-pulls whatever card is on screen right now,
// regardless of which title the event was actually about).
function requestPlaybackPull() {
    if (typeof playbackPullFn === 'function') playbackPullFn()
}

// Notify engine.js that a show/movie was dropped or undropped somewhere for
// this account. `mediaType` ('show'|'movie') + `action` ('dropped'|'undropped')
// let one callback cover all four events; `payload` is passed through as-is
// ({ show_id|media_id, tmdb_id, title } - see backend socket emit).
function requestDropSync(mediaType, action, payload) {
    if (typeof dropSyncFn === 'function') dropSyncFn(mediaType, action, payload)
}

// ─── Public API ───────────────────────────────────────────

// Register invalidation handlers on the socket.
// Every event funnels into requestUpdate — no Storage writes here.
export function registerHandlers(socket) {
    socket.on('list.item_added', onItemAdded)
    socket.on('list.item_removed', onItemRemoved)
    socket.on('list.created', onListCreated)
    socket.on('list.updated', onListUpdated)
    socket.on('list.deleted', onListDeleted)
    socket.on('watch_event.created', onWatchEvent)
    socket.on('playback_session.completed', onPlaybackCompleted)
    socket.on('playback_session.started', onPlaybackStarted)
    socket.on('playback_session.playing', onPlaybackPlaying)
    socket.on('playback_session.paused', onPlaybackPaused)
    socket.on('show.dropped', onShowDropped)
    socket.on('show.undropped', onShowUndropped)
    socket.on('movie.dropped', onMovieDropped)
    socket.on('movie.undropped', onMovieUndropped)
}

// Unregister invalidation handlers from the socket.
export function unregisterHandlers(socket) {
    socket.off('list.item_added', onItemAdded)
    socket.off('list.item_removed', onItemRemoved)
    socket.off('list.created', onListCreated)
    socket.off('list.updated', onListUpdated)
    socket.off('list.deleted', onListDeleted)
    socket.off('watch_event.created', onWatchEvent)
    socket.off('playback_session.completed', onPlaybackCompleted)
    socket.off('playback_session.started', onPlaybackStarted)
    socket.off('playback_session.playing', onPlaybackPlaying)
    socket.off('playback_session.paused', onPlaybackPaused)
    socket.off('show.dropped', onShowDropped)
    socket.off('show.undropped', onShowUndropped)
    socket.off('movie.dropped', onMovieDropped)
    socket.off('movie.undropped', onMovieUndropped)
}
