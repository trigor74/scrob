// Бейдж "останній переглянутий епізод" на повній картці серіалу.
// Той самий підхід, що вже перевірений у трьохсторонньому плагіні TraktTV.js
// на цьому ж форку клієнта (Lampa.Listener.follow('full', ...), e.type === 'complite'
// — DOM повної картки вже зібраний, кнопки згруповані).
//
// Дані беруться з уже наявного api.getWatchStatus() (те саме джерело, що й
// utils/sync/timeline.js онActivityStart) — жодного нового backend-ендпоінту.
// "Останній переглянутий" — максимальний (сезон, епізод) серед watched:true,
// а не найновіший updated_at: сервер уже rewatch-aware сам (GET /history/watch-status,
// backend/routers/history.py get_watch_status) — під час активного rewatch
// watched:true бере ТІЛЬКИ з поточного циклу RewatchProgress, тож max(сезон,епізод)
// природно відображає позицію в активному rewatch, а не старий рекорд з першого
// перегляду. updated_at натомість збивається ручною позначкою епізоду не по порядку
// (напр. довідмічений заднім числом пропущений епізод з нижчим номером).
//
// Лічильник непереглянутих епізодів — з data.movie.seasons[] (той самий об'єкт
// TMDB, що вже прийшов з подією 'full'/'complite'), без жодного додаткового запиту.
// episode_count у TMDB іноді проставляється на кілька днів раніше фактичного ефіру
// — свідомо прийнятий компроміс на користь нуля зайвих мережевих запитів.

import * as api from './api'
import { KEYS, hasSession } from './storage'

function isTvCard(e) {
    return !!(e && e.data && e.data.movie && e.object && e.object.method === 'tv')
}

function pickLastWatched(items) {
    var last = null
    for (var i = 0; i < items.length; i++) {
        var item = items[i]
        if (!item.watched) continue
        if (!last ||
            item.season_number > last.season_number ||
            (item.season_number === last.season_number && item.episode_number > last.episode_number)) {
            last = item
        }
    }
    return last
}

// Скільки епізодів з seasons[] (виключно "Спеціальні", season_number > 0)
// іде ПІСЛЯ останнього переглянутого — сума решти поточного сезону плюс усі наступні сезони.
function countUnwatched(seasons, lastSeason, lastEpisode) {
    if (!Array.isArray(seasons)) return 0
    var count = 0
    for (var i = 0; i < seasons.length; i++) {
        var s = seasons[i]
        if (!s || s.season_number <= 0) continue
        var episodeCount = s.episode_count || 0
        if (s.season_number === lastSeason) {
            count += Math.max(0, episodeCount - lastEpisode)
        } else if (s.season_number > lastSeason) {
            count += episodeCount
        }
    }
    return count
}

function buildBadge(iconSvg, lastWatched, unwatchedCount) {
    var el = document.createElement('div')
    el.className = 'full-start-new__details scrob-last-episode'

    var html = '<div class="scrob-last-episode__icon">' + iconSvg + '</div>' +
        '<span>' + Lampa.Lang.translate('full_season') + ': ' + lastWatched.season_number + '</span>' +
        '<span class="full-start-new__split">●</span>' +
        '<span>' + Lampa.Lang.translate('full_episode') + ': ' + lastWatched.episode_number + '</span>'

    if (unwatchedCount > 0) {
        html += '<span class="scrob-last-episode__new">' +
            '<span class="scrob-last-episode__dot"></span>' +
            Lampa.Lang.translate('scrob_new_episodes').replace('%s', unwatchedCount) +
            '</span>'
    }

    el.innerHTML = html
    return el
}

function showBadge(iconSvg, e) {
    if (!hasSession()) return
    if (!Lampa.Storage.get(KEYS.SHOW_LAST_EPISODE_BADGE, true)) return
    if (!isTvCard(e)) return

    var card = e.data.movie
    if (!card.id) return

    api.getWatchStatus(card.id, 'tv', function (items) {
        var lastWatched = pickLastWatched(items)
        if (!lastWatched) return

        var renderRoot = e.object.activity.render()
        var buttons = renderRoot.find('.full-start-new__buttons').first()
        if (!buttons.length) return

        renderRoot.find('.full-start-new__details.scrob-last-episode').remove()

        var unwatchedCount = countUnwatched(card.seasons, lastWatched.season_number, lastWatched.episode_number)
        buttons.before(buildBadge(iconSvg, lastWatched, unwatchedCount))
    }, function (err) {
        console.warn('ScrobLastEpisodeBadge', 'watch-status request failed', err)
    })
}

export function init(iconSvg) {
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') showBadge(iconSvg, e)
    })
}
