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
// seasons[].episode_count сам по собі рахує ВСІ анонсовані епізоди сезону, включно
// з тими, що ще не вийшли в ефір — тому межу "вже вийшло" беремо з next_episode_to_air
// (усе до нього вже вийшло, а сам він — якщо його air_date вже сьогодні чи в
// минулому, то й він теж, TMDB просто ще не встиг зняти його з "next") або,
// якщо дата наступного невідома, з last_episode_to_air (усе аж ВКЛЮЧНО з ним).
// Обидва поля — стандартні TMDB-поля повного /tv/{id}, присутні в data.movie
// так само, як next_episode_to_air, що сама Lampa вже читає (app.min.js:44777) —
// лише last_episode_to_air клієнт не використовує, але не вирізає з відповіді.

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

// today() у форматі TMDB air_date ('YYYY-MM-DD') - рядкове порівняння з ISO-датою
// коректне лексикографічно, окремий парсинг не потрібен.
function todayDateString() {
    var d = new Date()
    var mm = String(d.getMonth() + 1)
    var dd = String(d.getDate())
    if (mm.length < 2) mm = '0' + mm
    if (dd.length < 2) dd = '0' + dd
    return d.getFullYear() + '-' + mm + '-' + dd
}

// Межа "вже вийшло": усе (season, episode) СУВОРО менше next_episode_to_air
// точно вийшло; якщо дата наступного невідома — усе аж ВКЛЮЧНО з last_episode_to_air.
// null, якщо TMDB не дав жодного з двох (тоді countUnwatched рахує без обмеження —
// той самий компроміс, що й раніше, лише як останній fallback).
//
// ВАЖЛИВО: next_episode_to_air.air_date - це лише ДАТА, без часу доби, а сам
// покажчик "next" TMDB перераховує приблизно раз на добу. Тож у день виходу
// епізоду (і деякий час після) next_episode_to_air ще СПОКІЙНІСІНЬКО може
// вказувати на щойно вийшлий епізод, хоча він уже фактично вийшов в ефір.
// Якщо air_date <= сьогодні - цей епізод уже вийшов, тож межу рахуємо
// ВКЛЮЧНО з ним, а не строго до нього (інакше рахунок завжди відстає на 1
// епізод одразу після виходу - саме так і зламалось: анонсовано 12, вийшло
// 12, TMDB ще добу тримає next_episode_to_air на 12-му).
function airedBoundary(card) {
    var next = card.next_episode_to_air
    if (next && next.season_number != null && next.episode_number != null) {
        var alreadyAired = !!next.air_date && next.air_date <= todayDateString()
        return { season: next.season_number, episode: next.episode_number, inclusive: alreadyAired }
    }
    var last = card.last_episode_to_air
    if (last && last.season_number != null && last.episode_number != null) {
        return { season: last.season_number, episode: last.episode_number, inclusive: true }
    }
    return null
}

// Скільки епізодів з seasons[] (виключно "Спеціальні", season_number > 0), що вже
// ВИЙШЛИ В ЕФІР (з урахуванням boundary), іде ПІСЛЯ останнього переглянутого.
function countUnwatched(seasons, lastSeason, lastEpisode, boundary) {
    if (!Array.isArray(seasons)) return 0
    var count = 0
    for (var i = 0; i < seasons.length; i++) {
        var s = seasons[i]
        if (!s || s.season_number <= 0) continue
        var airedInSeason = s.episode_count || 0

        if (boundary) {
            if (s.season_number > boundary.season) {
                airedInSeason = 0
            } else if (s.season_number === boundary.season) {
                airedInSeason = Math.min(airedInSeason, boundary.inclusive ? boundary.episode : boundary.episode - 1)
            }
        }
        if (airedInSeason <= 0) continue

        if (s.season_number === lastSeason) {
            count += Math.max(0, airedInSeason - lastEpisode)
        } else if (s.season_number > lastSeason) {
            count += airedInSeason
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

        var boundary = airedBoundary(card)
        var unwatchedCount = countUnwatched(card.seasons, lastWatched.season_number, lastWatched.episode_number, boundary)
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
