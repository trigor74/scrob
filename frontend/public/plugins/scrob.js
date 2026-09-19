/**
 * Scrob — Lampa plugin for self-hosted media tracking
 * Build: 2026-09-19
 * Source: https://github.com/ellite/scrob
 */
(function () {
    'use strict';

    // Scrob plugin translations
    function addLang() {
      Lampa.Lang.add({
        scrob_title: {
          uk: 'Scrob',
          ru: 'Scrob',
          en: 'Scrob',
          be: 'Scrob'
        },
        scrob_server_url: {
          uk: 'Адреса сервера',
          ru: 'Адрес сервера',
          en: 'Server URL',
          be: 'Адрас сервера'
        },
        scrob_username: {
          uk: 'Логін',
          ru: 'Логин',
          en: 'Username',
          be: 'Лагін'
        },
        scrob_password: {
          uk: 'Пароль',
          ru: 'Пароль',
          en: 'Password',
          be: 'Пароль'
        },
        scrob_api_key: {
          uk: 'API-ключ',
          ru: 'API-ключ',
          en: 'API key',
          be: 'API-ключ'
        },
        scrob_api_key_descr: {
          uk: 'Самодостатній спосіб авторизації: вставте власний ключ і не заповнюйте логін/пароль',
          ru: 'Самодостаточный способ авторизации: вставьте свой ключ и не заполняйте логин/пароль',
          en: 'Standalone sign-in method: paste your own key and skip username/password',
          be: 'Самадастатковы спосаб аўтарызацыі: устаўце ўласны ключ і не запаўняйце лагін/пароль'
        },
        scrob_login: {
          uk: 'Логін і пароль',
          ru: 'Логин и пароль',
          en: 'Username & password',
          be: 'Лагін і пароль'
        },
        scrob_qr_login: {
          uk: 'Через QR-код',
          ru: 'Через QR-код',
          en: 'Via QR code',
          be: 'Праз QR-код'
        },
        scrob_auth_trigger: {
          uk: 'Авторизуватися на сервері',
          ru: 'Авторизоваться на сервере',
          en: 'Sign in to the server',
          be: 'Аўтарызавацца на серверы'
        },
        scrob_auth_choice_title: {
          uk: 'Авторизація Scrob',
          ru: 'Авторизация Scrob',
          en: 'Scrob Sign In',
          be: 'Аўтарызацыя Scrob'
        },
        scrob_auth_status_qr: {
          uk: 'Авторизовано через QR-код',
          ru: 'Авторизован через QR-код',
          en: 'Signed in via QR code',
          be: 'Аўтарызаваны праз QR-код'
        },
        scrob_auth_status_apikey: {
          uk: 'Авторизовано через API-ключ',
          ru: 'Авторизован через API-ключ',
          en: 'Signed in via API key',
          be: 'Аўтарызаваны праз API-ключ'
        },
        scrob_qr_modal_title: {
          uk: 'Вхід через QR-код',
          ru: 'Вход через QR-код',
          en: 'Sign in via QR code',
          be: 'Уваход праз QR-код'
        },
        scrob_qr_hint: {
          uk: 'Відскануйте QR-код телефоном або відкрийте посилання на іншому пристрої й введіть код вручну',
          ru: 'Отсканируйте QR-код телефоном или откройте ссылку на другом устройстве и введите код вручную',
          en: 'Scan the QR code with your phone, or open the link on another device and enter the code manually',
          be: 'Адскануйце QR-код тэлефонам або адкрыйце спасылку на іншай прыладзе і ўвядзіце код уручную'
        },
        scrob_qr_manual_prefix: {
          uk: 'Або вручну на ',
          ru: 'Или вручную на ',
          en: 'Or manually at ',
          be: 'Або ўручную на '
        },
        scrob_qr_draw_failed: {
          uk: 'Не вдалося намалювати QR — введіть код вручну на іншому пристрої',
          ru: 'Не удалось нарисовать QR — введите код вручную на другом устройстве',
          en: "Couldn't render the QR code — enter the code manually on another device",
          be: 'Не атрымалася намаляваць QR — увядзіце код уручную на іншай прыладзе'
        },
        scrob_noty_qr_gen_failed: {
          uk: 'Не вдалося згенерувати QR-код',
          ru: 'Не удалось сгенерировать QR-код',
          en: 'Failed to generate QR code',
          be: 'Не атрымалася згенераваць QR-код'
        },
        scrob_noty_qr_no_connection: {
          uk: 'Немає зв\'язку із сервером',
          ru: 'Нет связи с сервером',
          en: 'No connection to the server',
          be: 'Няма сувязі з сервером'
        },
        scrob_noty_qr_expired: {
          uk: 'Час дії QR-коду вичерпано, спробуйте ще раз',
          ru: 'Время действия QR-кода истекло, попробуйте снова',
          en: 'The QR code has expired, please try again',
          be: 'Час дзеяння QR-кода вычарпаны, паспрабуйце зноў'
        },
        scrob_noty_qr_denied: {
          uk: 'Авторизацію через QR скасовано або відхилено',
          ru: 'Авторизация через QR отменена или отклонена',
          en: 'QR sign-in was cancelled or denied',
          be: 'Аўтарызацыя праз QR скасавана або адхілена'
        },
        scrob_logout: {
          uk: 'Вийти',
          ru: 'Выйти',
          en: 'Sign Out',
          be: 'Выйсці'
        },
        scrob_auth_success: {
          uk: 'Авторизація успішна',
          ru: 'Авторизация успешна',
          en: 'Login successful',
          be: 'Аўтарызацыя паспяховая'
        },
        scrob_auth_error: {
          uk: 'Помилка авторизації',
          ru: 'Ошибка авторизации',
          en: 'Login failed',
          be: 'Памылка аўтарызацыі'
        },
        scrob_fill_fields: {
          uk: 'Заповніть адресу сервера, логін та пароль',
          ru: 'Заполните адрес сервера, логин и пароль',
          en: 'Fill in server URL, username and password',
          be: 'Запоўніце адрас сервера, лагін і пароль'
        },
        scrob_2fa_not_supported: {
          uk: 'Увімкнено 2FA — використайте API-ключ або вимкніть 2FA',
          ru: 'Включена 2FA — используйте API-ключ или отключите 2FA',
          en: '2FA is enabled — use an API key or disable 2FA',
          be: 'Уключана 2FA — выкарыстоўвайце API-ключ або адключыце 2FA'
        },
        scrob_me_error: {
          uk: 'Не вдалося отримати дані користувача',
          ru: 'Не удалось получить данные пользователя',
          en: 'Failed to get user data',
          be: 'Не атрымалася атрымаць даныя карыстальніка'
        },
        scrob_profiles: {
          uk: 'Профілі',
          ru: 'Профили',
          en: 'Profiles',
          be: 'Профілі'
        },
        scrob_profiles_empty: {
          uk: 'Неможливо отримати список профілів',
          ru: 'Невозможно получить список профилей',
          en: 'Unable to get profile list',
          be: 'Немагчыма атрымаць спіс профіляў'
        },
        scrob_logout_success: {
          uk: 'Ви вийшли з акаунта Scrob',
          ru: 'Вы вийшли из аккаунта Scrob',
          en: 'Signed out of Scrob',
          be: 'Вы выйшлі з акаўнта Scrob'
        },
        // ─── Sync settings ─────────────────────────────────
        scrob_sync_title: {
          uk: 'Синхронізація списків',
          ru: 'Синхронизация списков',
          en: 'List synchronization',
          be: 'Сінхранізацыя спісаў'
        },
        scrob_sync_enabled: {
          uk: 'Увімкнути синхронізацію',
          ru: 'Включить синхронизацию',
          en: 'Enable synchronization',
          be: 'Уключыць сінхранізацыю'
        },
        scrob_sync_interval: {
          uk: 'Інтервал опитування',
          ru: 'Интервал опроса',
          en: 'Poll interval',
          be: 'Інтэрвал апытання'
        },
        scrob_sync_interval_descr: {
          uk: 'Як часто опитувати сервер для вхідних змін (секунди)',
          ru: 'Как часто опрашивать сервер для входящих изменений (секунды)',
          en: 'How often to poll the server for incoming changes (seconds)',
          be: 'Як часта апытваць сервер для ўваходных змен (секунды)'
        },
        scrob_sync_now: {
          uk: 'Синхронізувати зараз',
          ru: 'Синхронизировать сейчас',
          en: 'Sync now',
          be: 'Сінхранізаваць зараз'
        },
        scrob_sync_started: {
          uk: 'Синхронізацію увімкнено',
          ru: 'Синхронизация включена',
          en: 'Synchronization enabled',
          be: 'Сінхранізацыя ўключана'
        },
        scrob_sync_stopped: {
          uk: 'Синхронізацію зупинено',
          ru: 'Синхронизация остановлена',
          en: 'Synchronization stopped',
          be: 'Сінхранізацыя спынена'
        },
        scrob_sync_status_last: {
          uk: 'Остання синхронізація',
          ru: 'Последняя синхронизация',
          en: 'Last synchronization',
          be: 'Апошняя сінхранізацыя'
        },
        scrob_sync_blocked_cub: {
          uk: 'Синхронізацію заблоковано: активна синхронізація CUB',
          ru: 'Синхронизация заблокирована: активна синхронизация CUB',
          en: 'Sync blocked: CUB synchronization is active',
          be: 'Сінхранізацыя заблакіравана: актыўная сінхранізацыя CUB'
        },
        scrob_lampac_export: {
          uk: 'Експортувати дані з lampac у Scrob',
          ru: 'Экспортировать данные из lampac в Scrob',
          en: 'Export data from lampac to Scrob',
          be: 'Экспартаваць даныя з lampac у Scrob'
        },
        scrob_lampac_export_need_session: {
          uk: 'Спершу авторизуйтесь на сервері Scrob',
          ru: 'Сначала авторизуйтесь на сервере Scrob',
          en: 'Sign in to the Scrob server first',
          be: 'Спачатку аўтарызуйцеся на серверы Scrob'
        },
        scrob_lampac_export_need_sync: {
          uk: 'Спершу увімкніть синхронізацію Scrob',
          ru: 'Сначала включите синхронизацию Scrob',
          en: 'Turn on Scrob synchronization first',
          be: 'Спачатку ўключыце сінхранізацыю Scrob'
        },
        scrob_lampac_export_done: {
          uk: 'Експорт з lampac завершено. Переглянуто: %watched%, прогрес: %progress%, пропущено (вже є): %skipped%, кинуто: %thrown%',
          ru: 'Экспорт из lampac завершён. Просмотрено: %watched%, прогресс: %progress%, пропущено (уже есть): %skipped%, брошено: %thrown%',
          en: 'lampac export done. Watched: %watched%, in progress: %progress%, skipped (already in Scrob): %skipped%, dropped: %thrown%',
          be: 'Экспарт з lampac завершаны. Прагледжана: %watched%, прагрэс: %progress%, прапушчана (ужо ёсць): %skipped%, кінута: %thrown%'
        },
        scrob_lampac_export_progress_start: {
          uk: 'Підготовка експорту...',
          ru: 'Подготовка экспорта...',
          en: 'Preparing export...',
          be: 'Падрыхтоўка экспарту...'
        },
        scrob_lampac_export_progress_timecodes: {
          uk: 'Зчитування таймкодів',
          ru: 'Считывание таймкодов',
          en: 'Reading timecodes',
          be: 'Счытванне таймкодаў'
        },
        scrob_lampac_export_progress_uploading: {
          uk: 'Завантаження в Scrob',
          ru: 'Загрузка в Scrob',
          en: 'Uploading to Scrob',
          be: 'Загрузка ў Scrob'
        },
        scrob_sync_conflict_gramsync: {
          uk: 'Увімкнений GramSync — можливі конфлікти',
          ru: 'Включён GramSync — возможны конфликты',
          en: 'GramSync enabled — possible conflicts',
          be: 'Уключаны GramSync — магчымыя канфлікты'
        },
        scrob_sync_paused: {
          uk: 'Синхронізацію зупинено',
          ru: 'Синхронизация приостановлена',
          en: 'Synchronization paused',
          be: 'Сінхранізацыя прыпынена'
        },
        scrob_sync_lost: {
          uk: 'Синхронізація Scrob втратила зв\'язок',
          ru: 'Синхронизация Scrob потеряла связь',
          en: 'Scrob sync lost connection',
          be: 'Сінхранізацыя Scrob страціла сувязь'
        },
        scrob_sync_lists_error: {
          uk: 'Не вдалося отримати списки Scrob',
          ru: 'Не удалось получить списки Scrob',
          en: 'Failed to fetch Scrob lists',
          be: 'Не атрымалася атрымаць спісы Scrob'
        },
        // ─── List mapping (F1.5) ─────────────────────────
        scrob_map_title: {
          uk: 'Мапінг списків',
          ru: 'Маппинг списков',
          en: 'List mapping',
          be: 'Мапінг спісаў'
        },
        scrob_map_select_list: {
          uk: 'Оберіть список Scrob',
          ru: 'Выберите список Scrob',
          en: 'Choose a Scrob list',
          be: 'Аберыце спіс Scrob'
        },
        scrob_map_select_cat: {
          uk: 'Категорія Lampa',
          ru: 'Категория Lampa',
          en: 'Lampa category',
          be: 'Катэгорыя Lampa'
        },
        scrob_map_none: {
          uk: 'Немає списків для мапінгу',
          ru: 'Нет списков для маппинга',
          en: 'No lists available for mapping',
          be: 'Няма спісаў для мапінгу'
        },
        scrob_map_confirm: {
          uk: 'буде об\'єднано з категорією',
          ru: 'будет объединено с категорией',
          en: 'will be merged with category',
          be: 'будзе аб\'яднана з катэгорыяй'
        },
        scrob_map_once: {
          uk: 'Одноразове злиття, далі двобічний синк',
          ru: 'Одноразовое слияние, далее двусторонняя синхронизация',
          en: 'One-time merge, then bidirectional sync',
          be: 'Аднаразовае зліццё, далей двухбаковая сінхранізацыя'
        },
        scrob_map_marks_warn: {
          uk: 'Статусна категорія: елементи з інших статусів буде знято',
          ru: 'Статусная категория: элементы из других статусов будут сняты',
          en: 'Status category: items from other statuses will be removed',
          be: 'Статусная катэгорыя: элементы з іншых статусаў будуць зняты'
        },
        scrob_map_replace: {
          uk: 'замінить поточний мапінг',
          ru: 'заменит текущий маппинг',
          en: 'will replace current mapping',
          be: 'заменіць бягучы мапінг'
        },
        scrob_map_created: {
          uk: 'Мапінг створено, синхронізація виконується',
          ru: 'Маппинг создан, синхронизация выполняется',
          en: 'Mapping created, synchronization in progress',
          be: 'Мапінг створаны, сінхранізацыя выконваецца'
        },
        scrob_map_active: {
          uk: 'Активні мапінги',
          ru: 'Активные маппинги',
          en: 'Active mappings',
          be: 'Актыўныя мапінгі'
        },
        scrob_map_unlink: {
          uk: 'Відв\'язати',
          ru: 'Отвязать',
          en: 'Unlink',
          be: 'Адвязаць'
        },
        scrob_map_unlinked: {
          uk: 'Мапінг видалено',
          ru: 'Маппинг удален',
          en: 'Mapping removed',
          be: 'Мапінг выдалены'
        },
        scrob_map_conflict: {
          uk: 'Цей список уже замаплений',
          ru: 'Этот список уже замаппирован',
          en: 'This list is already mapped',
          be: 'Гэты спіс ужо замаплены'
        },
        scrob_map_broken: {
          uk: 'Мапінг %s: список зник',
          ru: 'Маппинг %s: список исчез',
          en: 'Mapping %s: list deleted',
          be: 'Мапінг %s: спіс знік'
        },
        scrob_map_cancel: {
          uk: 'Скасувати',
          ru: 'Отмена',
          en: 'Cancel',
          be: 'Скасаваць'
        },
        scrob_map_apply: {
          uk: 'Замапити',
          ru: 'Замаппировать',
          en: 'Map',
          be: 'Замапіць'
        },
        // ─── Custom categories (F1.5 extension) ─────────
        scrob_map_create_own: {
          uk: 'Створити власну категорію',
          ru: 'Создать собственную категорию',
          en: 'Create own category',
          be: 'Стварыць уласную катэгорыю'
        },
        scrob_map_own_name: {
          uk: 'Назва категорії',
          ru: 'Название категории',
          en: 'Category name',
          be: 'Назва катэгорыі'
        },
        scrob_map_own_created: {
          uk: 'Категорію створено, імпорт виконується',
          ru: 'Категория создана, импорт выполняется',
          en: 'Category created, importing...',
          be: 'Катэгорыю створана, імпарт выконваецца'
        },
        scrob_map_own_exists: {
          uk: 'Категорія з такою назвою вже існує',
          ru: 'Категория с таким названием уже существует',
          en: 'Category with this name already exists',
          be: 'Катэгорыя з такой назвай ужо існуе'
        },
        scrob_cat_remove_confirm: {
          uk: 'Видалити з категорії?',
          ru: 'Удалить из категории?',
          en: 'Remove from category?',
          be: 'Выдаліць з катэгорыі?'
        },
        scrob_cat_remove: {
          uk: 'Видалити',
          ru: 'Удалить',
          en: 'Remove',
          be: 'Выдаліць'
        },
        scrob_cat_removed: {
          uk: 'Видалено з категорії',
          ru: 'Удалено из категории',
          en: 'Removed from category',
          be: 'Выдалена з катэгорыі'
        },
        // ─── Manual unmark menu (§5.2.6) ────────────────────
        scrob_unmark_menu_title: {
          uk: 'Дії з переглядом',
          ru: 'Действия с просмотром',
          en: 'Watch actions',
          be: 'Дзеянні з праглядам'
        },
        scrob_unmark_close: {
          uk: 'Закрити',
          ru: 'Закрыть',
          en: 'Close',
          be: 'Закрыць'
        },
        scrob_unmark_remove_event: {
          uk: 'Видалити перегляд',
          ru: 'Удалить просмотр',
          en: 'Delete watch',
          be: 'Выдаліць прагляд'
        },
        scrob_unmark_rewatch: {
          uk: 'Почати заново',
          ru: 'Начать заново',
          en: 'Start over',
          be: 'Пачаць нанова'
        },
        scrob_unmark_delete_all: {
          uk: 'Видалити всю історію',
          ru: 'Удалить всю историю',
          en: 'Delete all history',
          be: 'Выдаліць усю гісторыю'
        },
        // ─── Timeline prefetch candidate pool (§5.2.7) ──────
        scrob_prefetch_title: {
          uk: 'Автопідвантаження таймлайну',
          ru: 'Автоподгрузка таймлайна',
          en: 'Timeline prefetch',
          be: 'Аўтападгрузка таймлайна'
        },
        scrob_prefetch_history: {
          uk: 'Історія переглядів',
          ru: 'История просмотров',
          en: 'Watch history',
          be: 'Гісторыя праглядаў'
        },
        scrob_prefetch_book: {
          uk: 'Закладки',
          ru: 'Закладки',
          en: 'Bookmarks',
          be: 'Закладкі'
        },
        scrob_prefetch_like: {
          uk: 'Подобається',
          ru: 'Нравится',
          en: 'Liked',
          be: 'Падабаецца'
        },
        scrob_prefetch_wath: {
          uk: 'Пізніше',
          ru: 'Позже',
          en: 'Watch later',
          be: 'Пазней'
        },
        // ─── Last-episode badge on the show's full card ─────
        scrob_last_episode_badge: {
          uk: 'Останній переглянутий епізод на картці',
          ru: 'Последний просмотренный эпизод на карточке',
          en: 'Last watched episode on card',
          be: 'Апошні прагледжаны эпізод на картцы'
        },
        scrob_new_episodes: {
          uk: '+%s нових',
          ru: '+%s новых',
          en: '+%s new',
          be: '+%s новых'
        }
      });
    }

    function _typeof(o) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
        return typeof o;
      } : function (o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
      }, _typeof(o);
    }

    // Storage keys and session helpers for the Scrob plugin.
    // All keys are prefixed with scrob_ so they never collide with CUB account/account_user.

    var KEYS = {
      SERVER_URL: 'scrob_server_url',
      USERNAME: 'scrob_username',
      PASSWORD: 'scrob_password',
      OWN_API_KEY: 'scrob_own_api_key',
      ACCESS_TOKEN: 'scrob_access_token',
      ME: 'scrob_me',
      PROFILES: 'scrob_profiles',
      ACTIVE_PROFILE_ID: 'scrob_active_profile_id',
      ACTIVE_API_KEY: 'scrob_active_api_key',
      SYNC_ENABLED: 'scrob_sync_enabled',
      SYNC_INTERVAL: 'scrob_sync_interval',
      // Timeline prefetch candidate pool (SYNC-ARCHITECTURE-PLAN.md §5.2.7) —
      // which Lampa.Favorite lists feed the batch watch-status prefetch.
      // 'history' defaults on (needed for the continue_watch ongoing-show
      // filter itself); the rest default off to save traffic/startup time on
      // large collections.
      PREFETCH_HISTORY: 'scrob_prefetch_history',
      PREFETCH_BOOK: 'scrob_prefetch_book',
      PREFETCH_LIKE: 'scrob_prefetch_like',
      PREFETCH_WATH: 'scrob_prefetch_wath',
      // QR-пейринг (OAuth 2.0 Device Authorization Grant, /auth/device/*) — Bearer,
      // не api_key: за дизайном сервера device-скоупований токен не має доступу
      // до /auth/me, тож так постійний api_key отримати неможливо в принципі.
      DEVICE_ACCESS_TOKEN: 'scrob_device_access_token',
      DEVICE_REFRESH_TOKEN: 'scrob_device_refresh_token',
      DEVICE_EXPIRES_AT: 'scrob_device_expires_at',
      // Бейдж "останній переглянутий епізод" на повній картці серіалу.
      SHOW_LAST_EPISODE_BADGE: 'scrob_show_last_episode_badge'
    };

    // Keys isolated per profile: backed up on switch, restored for the target.
    var ISOLATED_KEYS = ['favorite', 'online_view', 'online_watched_last', 'online_last_balanser', 'file_view', 'torrents_view', 'torrents_filter_data'];

    // Defaults applied when the target profile has no saved data yet.
    var DEFAULTS = {
      favorite: '{}',
      // Flat array of viewed-item hashes (online.js: Lampa.Storage.cache('online_view',
      // 5000, []), later viewed.indexOf(hash)) - NOT an object. Restoring a profile with
      // no backup yet used to write '{}' here, and online.js's own source-list screen
      // threw "viewed.indexOf is not a function" on the very next render, since a value
      // now genuinely exists (just the wrong shape) instead of falling through to its
      // own default.
      online_view: '[]',
      online_watched_last: '{}',
      online_last_balanser: '{}',
      file_view: '{}',
      // torrents_view/torrents_filter_data had their array/object shapes swapped -
      // confirmed against Lampa core (_refs/lampa/app.min.js), both by direct usage
      // and by its own account-sync type registry (sync(field, 'array_string'|'object_object')):
      //   - torrents_view is a flat array of viewed-torrent hashes: Storage.cache('torrents_view',
      //     5000, []), later viewed.indexOf(hash). A restored '{}' default (a profile with no
      //     backup yet) makes the very next call throw "viewed.indexOf is not a function" -
      //     same failure mode as the online_view fix above.
      //   - torrents_filter_data is an object keyed by cardID: Storage.cache('torrents_filter_data',
      //     500, {}), then all[cid] = filter. A restored '[]' default doesn't throw (arrays are
      //     objects too), but JSON.stringify() of an array only serializes numeric-index elements,
      //     so the non-index cid property is silently dropped - the per-card filter looks saved,
      //     then vanishes on the next reload.
      torrents_view: '[]',
      torrents_filter_data: '{}'
    };

    // Backup storage key for ONE profile - a single JSON object holding all of
    // that profile's ISOLATED_KEYS at once, not one flat localStorage key per
    // (userId, key) pair. Two reasons: a corrupted/malformed backup then only
    // ever affects that one profile (restoreIsolatedData() in profiles.js falls
    // back to defaults for it, not for everyone), and removing a stale profile's whole
    // backup (pruneStaleBackups() below) becomes a single key deletion instead
    // of one per ISOLATED_KEY.
    function backupKey(userId) {
      return 'scrob_backup_' + userId;
    }

    // Drop scrob_backup_<userId> entries for any userId no longer present in a
    // freshly-fetched, AUTHORITATIVE full user list. Caller's responsibility:
    // only call this with a real /admin/users result (main.js's completeLogin,
    // the api.adminUsers() success branch) - NEVER with the single-item
    // fallback list used both for a non-admin login and for an adminUsers()
    // failure, which would wrongly wipe out every OTHER profile's backup on a
    // shared device just because this session can't see the real list.
    function pruneStaleBackups(profiles) {
      var keep = {};
      profiles.forEach(function (p) {
        keep[p.id] = true;
      });
      var prefix = 'scrob_backup_';
      for (var i = window.localStorage.length - 1; i >= 0; i--) {
        var key = window.localStorage.key(i);
        if (key && key.indexOf(prefix) === 0 && !keep[key.slice(prefix.length)]) {
          window.localStorage.removeItem(key);
        }
      }
    }

    // Default value for an isolated key.
    function defaultValue(key) {
      return DEFAULTS[key] || '{}';
    }

    // Server URL without trailing slash, '' when not set.
    function serverUrl() {
      var url = (Lampa.Storage.get(KEYS.SERVER_URL) || '').trim();
      if (url.slice(-1) === '/') url = url.slice(0, -1);
      return url;
    }
    function getMe() {
      var val = Lampa.Storage.get(KEYS.ME, {});
      return _typeof(val) === 'object' && val !== null ? val : {};
    }
    function getProfiles() {
      var val = Lampa.Storage.get(KEYS.PROFILES, []);
      return Array.isArray(val) ? val : [];
    }

    // Identity this session's credential currently is (api key takes priority,
    // matching authHeaders()' own precedence in api.js) - the key
    // setOwnProfileInfo()/getOwnProfileInfo() cache GET /profile/me's result
    // under, so a different key/token (a new manual entry, a fresh QR pairing)
    // doesn't keep showing the previous credential's name/avatar.
    function ownCredentialKey() {
      return Lampa.Storage.get(KEYS.OWN_API_KEY) || Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN) || '';
    }

    // In-memory only, deliberately not persisted to Lampa.Storage - this plugin
    // re-evaluates from scratch on every page load, so an in-memory cache
    // already means "fetch at most once per page load, always fresh again on
    // reload" for free, with none of a persisted TTL's staleness window (an
    // edit to display_name/avatar made on the server, then a reload here,
    // wants to show up right away - not "eventually, once some interval
    // elapses").
    var ownProfileInfo = null;
    function setOwnProfileInfo(profile, forKey) {
      ownProfileInfo = Object.assign({}, profile, {
        forKey: forKey
      });
    }

    // Cached GET /profile/me result for the CURRENT credential this page load,
    // or {} if not fetched yet (or the credential changed since the fetch).
    function getOwnProfileInfo() {
      if (!ownProfileInfo || ownProfileInfo.forKey !== ownCredentialKey()) return {};
      return ownProfileInfo;
    }

    // Active profile object from cached list, falls back to logged-in user, then
    // to whatever public-profile info (display_name/avatar_url) could be
    // resolved for a session with no real login behind it (see getOwnProfileInfo()).
    function activeProfile() {
      var id = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);
      var list = getProfiles();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id == id) return list[i];
      }
      var me = getMe();
      if (me.id) return me;
      return getOwnProfileInfo();
    }

    // Three independent, standalone ways to be "signed in" — any one is enough:
    // a manually-entered API key, a QR-paired device token, or a real username/
    // password login (the only one that also unlocks admin profile-switching,
    // since it's the only path that ever calls /auth/me).
    function hasSession() {
      return !!(Lampa.Storage.get(KEYS.OWN_API_KEY) || Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN) || Lampa.Storage.get(KEYS.ACCESS_TOKEN) && getMe().id);
    }

    // Clear session keys on logout. Credentials (server/username/password) are kept for re-login.
    function clearSession() {
      [KEYS.OWN_API_KEY, KEYS.ACCESS_TOKEN, KEYS.ME, KEYS.PROFILES, KEYS.ACTIVE_PROFILE_ID, KEYS.ACTIVE_API_KEY, KEYS.DEVICE_ACCESS_TOKEN, KEYS.DEVICE_REFRESH_TOKEN, KEYS.DEVICE_EXPIRES_AT].forEach(function (key) {
        Lampa.Storage.set(key, '');
      });
    }

    // Scrob server API wrapper. All requests go through new Lampa.Reguest().
    // Base prefix of every endpoint: {server_url}/api/proxy
    function base() {
      return serverUrl() + '/api/proxy';
    }

    // X-Api-Key header for the currently active identity: the switched-to
    // profile's own key when an admin has picked one (switchProfile()/
    // completeLogin() write ACTIVE_API_KEY), otherwise the signed-in user's own
    // key. Without this, every request kept using OWN_API_KEY regardless of
    // which profile was selected - ACTIVE_API_KEY was written on every switch
    // but never read anywhere, so admin profile-switching never actually
    // changed whose account requests were made under.
    //
    // ALWAYS present, even empty — the Astro session-cookie gate (middleware.ts)
    // only checks that this header exists at all (its value is validated
    // separately, by the backend) before letting a /api/proxy/* request through
    // without redirecting to /login. A non-browser client like this plugin never
    // has that cookie, so omitting the header entirely (as before) silently
    // blocked every request made with no api_key configured yet — including the
    // login/QR-pairing requests themselves.
    function apiKeyHeaders() {
      var key = Lampa.Storage.get(KEYS.ACTIVE_API_KEY) || Lampa.Storage.get(KEYS.OWN_API_KEY) || '';
      return {
        'X-Api-Key': key
      };
    }

    // Bearer token header from the user's session; empty object when not set
    function bearerHeaders() {
      var token = Lampa.Storage.get(KEYS.ACCESS_TOKEN) || '';
      return token ? {
        Authorization: 'Bearer ' + token
      } : {};
    }

    // Headers for regular (non-bootstrap) requests: the manually-entered API key
    // when present, otherwise the QR-paired device token as Bearer. Either alone
    // satisfies the backend's own per-endpoint auth dependency; X-Api-Key is
    // always sent (see apiKeyHeaders() above) so the Astro gate lets the request
    // through either way.
    function authHeaders() {
      var headers = apiKeyHeaders();
      var apiKey = Lampa.Storage.get(KEYS.OWN_API_KEY) || '';
      if (!apiKey) {
        var deviceToken = Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN) || '';
        if (deviceToken) headers['Authorization'] = 'Bearer ' + deviceToken;
      }
      return headers;
    }
    function parse$1(data) {
      if (typeof data !== 'string') return data;
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }

    // GET /profile/me — the "public profile" fields (display_name, avatar_url,
    // bio, ...), NOT the core username/email (those stay Bearer-only, /auth/me).
    // Unlike /auth/me, this accepts an API key OR a device-scoped Bearer token
    // (get_current_user_or_api_key on the backend) - the only identity this
    // plugin can ever resolve for a session with no real login behind it.
    function getProfile(onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(10000);
      network.native(base() + '/profile/me', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json) onDone(json);
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // POST /auth/login — form-urlencoded username+password → Token
    // NOTE: login is an unauthenticated endpoint — do NOT send Bearer
    // NOTE: Astro middleware requires X-Api-Key for /api/proxy/* routes
    // OAuth2 Password Flow requires grant_type=password
    function login(username, password, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      var body = 'grant_type=password&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);
      network.native(base() + '/auth/login', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, body, {
        headers: Object.assign({
          'Content-Type': 'application/x-www-form-urlencoded'
        }, apiKeyHeaders())
      });
    }

    // GET /auth/me — Bearer token → User
    function me(token, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/auth/me', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json && json.id) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: Object.assign({
          Authorization: 'Bearer ' + token
        }, apiKeyHeaders())
      });
    }

    // GET /admin/users — Bearer token, admin only → AdminUser[]
    function adminUsers(token, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/admin/users', function (data) {
        network.clear();
        var json = parse$1(data);
        if (Array.isArray(json)) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: Object.assign({
          Authorization: 'Bearer ' + token
        }, apiKeyHeaders())
      });
    }

    // ─── List sync API methods ────────────────────────────────

    // GET /lists — all user lists (without items)
    function getLists(onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/lists', function (data) {
        network.clear();
        var json = parse$1(data);

        // Server wraps the array: { lists: [...] } — accept both shapes
        if (Array.isArray(json)) onDone(json);else if (json && Array.isArray(json.lists)) onDone(json.lists);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // POST /lists — create a new list
    function createList(name, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/lists', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json && json.id) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, JSON.stringify({
        name: name,
        privacy_level: 'private'
      }), {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // GET /lists/{listId} — list detail, items in .items field
    function getListItems(listId, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/lists/' + listId, function (data) {
        network.clear();
        var json = parse$1(data);

        // List detail returns { ..., items: [...] } — unwrap
        if (json && Array.isArray(json.items)) onDone(json.items);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // POST /lists/{listId}/items — add an item to a list
    function addListItem(listId, tmdbId, mediaType, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/lists/' + listId + '/items', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        // Pass HTTP status to onFail so callers can handle 409 (already exists)
        var status = a && a.status;
        onFail(network.errorDecode(a, c), status);
      }, JSON.stringify({
        tmdb_id: tmdbId,
        media_type: mediaType
      }), {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // DELETE /lists/{listId}/items/{itemId} — remove an item from a list
    function deleteListItem(listId, itemId, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/lists/' + listId + '/items/' + itemId, function () {
        network.clear();
        onDone();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, '{}', {
        headers: Object.assign({
          'X-HTTP-Method-Override': 'DELETE'
        }, authHeaders()),
        type: 'DELETE'
      });
    }

    // ─── Admin & history API methods ──────────────────────────

    // GET /admin/settings — socket configuration for the server
    // NOTE: Astro middleware requires X-Api-Key for /api/proxy/* routes
    // NOTE: backend requires Bearer token (OAuth2PasswordBearer)
    function adminSettings(onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(10000);
      network.native(base() + '/admin/settings', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: Object.assign({}, apiKeyHeaders(), bearerHeaders())
      });
    }

    // POST /history — mark a media as watched. episode fields optional (movie: omit all three).
    // `watchedAt` optional (Date object or timestamp) - omitted means the server
    // stamps "now" on receipt (WatchEventCreate.watched_at, unset-vs-null
    // distinction preserved server-side); passed explicitly by the external-
    // player batch backdating path (§5.1.1) so a batch of several episodes gets
    // a real, ordered spread instead of racing each other for "now".
    // `onFail` receives the HTTP status as its 2nd arg (upstream #390, live audit
    // 2026-09-18) - `completed:true` without `force:true` now 409s as
    // "duplicate_watch" when a WatchEvent already exists for this title within
    // the server's dedup window (min. 5 minutes, user-configurable) instead of
    // silently succeeding. Callers treat 409 as "already recorded" (a real
    // success), not a failure to retry - see sendPlainExternalWatchedMark()/
    // sendPlainManualWatchedMark() (timeline.js) and pushWatched() (lampac-export.js).
    function addHistoryEvent(tmdbId, mediaType, completed, episode, watchedAt, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      var payload = {
        tmdb_id: tmdbId,
        media_type: mediaType,
        completed: completed
      };
      if (episode) {
        payload.series_tmdb_id = episode.seriesTmdbId;
        payload.season_number = episode.season;
        payload.episode_number = episode.episode;
      }
      if (watchedAt) payload.watched_at = new Date(watchedAt).toISOString();
      network.native(base() + '/history', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        var status = a && a.status;
        onFail(network.errorDecode(a, c), status);
      }, JSON.stringify(payload), {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // DELETE /history/event/{eventId} — remove a watch event
    function removeHistoryEvent(eventId, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/event/' + eventId, function () {
        network.clear();
        onDone();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, '{}', {
        headers: Object.assign({
          'X-HTTP-Method-Override': 'DELETE'
        }, authHeaders()),
        type: 'DELETE'
      });
    }

    // ─── Manual scrobble session API (playback progress tracking) ────
    // Session key is derived server-side from title identity (tmdb_id for a
    // movie, show_tmdb_id+season+episode for an episode) — repeated starts for
    // the same title upsert the same session instead of resetting progress.

    // POST /history/session/start — start (or resume) a playback session
    function startSession(payload, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/session/start', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json && json.session_key) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, JSON.stringify(payload), {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // PATCH /history/session/{sessionKey} — heartbeat: progress/state, optional runtime correction
    function updateSession(sessionKey, payload, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/session/' + sessionKey, function (data) {
        network.clear();
        onDone(parse$1(data));
      }, function (a, c) {
        network.clear();
        var status = a && a.status;
        onFail(network.errorDecode(a, c), status);
      }, JSON.stringify(payload), {
        headers: Object.assign({
          'Content-Type': 'application/json',
          'X-HTTP-Method-Override': 'PATCH'
        }, authHeaders()),
        type: 'PATCH'
      });
    }

    // POST /history/session/{sessionKey}/complete — mark the session watched
    function completeSession(sessionKey, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/session/' + sessionKey + '/complete', function (data) {
        network.clear();
        onDone(parse$1(data));
      }, function (a, c) {
        network.clear();
        var status = a && a.status;
        onFail(network.errorDecode(a, c), status);
      }, '{}', {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // DELETE /history/session/{sessionKey} — discard a session (exited before any real progress)
    function deleteSession(sessionKey, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/session/' + sessionKey, function () {
        network.clear();
        onDone();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, '{}', {
        headers: Object.assign({
          'X-HTTP-Method-Override': 'DELETE'
        }, authHeaders()),
        type: 'DELETE'
      });
    }

    // GET /history/now-playing — this account's active/paused playback
    // sessions. `includeHidden` bypasses the dropped-show/movie filter that the
    // homepage's own display list applies - needed for a targeted "does THIS
    // exact title still have a live session" lookup (SYNC-ARCHITECTURE-PLAN.md
    // §5.2.6's manual-mark/unmark reconciliation), not a display list.
    function getNowPlaying(includeHidden, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/now-playing' + ('?include_hidden=true' ), function (data) {
        network.clear();
        var json = parse$1(data);
        if (json && Array.isArray(json.now_playing)) onDone(json.now_playing);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // GET /history/watch-status — lean, per-title watch state (movie or whole
    // show) for the pull direction: only rows with real state (watched, or an
    // in-progress bookmark), never a full episode list padded with zeroes.
    // `type` accepts either 'movie' or 'tv'/'series' (server maps both).
    function getWatchStatus(tmdbId, type, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/watch-status?tmdb_id=' + tmdbId + '&type=' + type, function (data) {
        network.clear();
        var json = parse$1(data);
        if (Array.isArray(json)) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // POST /history/watch-status/batch — same per-item shape as getWatchStatus()
    // above, for a whole pool of candidate titles at once (prefetch, §5.2.7).
    // `items` is [{tmdbId, type}, ...] ('type' same loose 'movie'/'tv'/'series'
    // convention as getWatchStatus()). Unknown/untouched titles are simply
    // omitted from the response, same as [] from the single-item endpoint.
    function getBatchWatchStatus(items, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(20000);
      var body = {
        items: items.map(function (i) {
          return {
            tmdb_id: i.tmdbId,
            type: i.type
          };
        })
      };
      network.native(base() + '/history/watch-status/batch', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json && Array.isArray(json.statuses)) onDone(json.statuses);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, JSON.stringify(body), {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // GET /history/continue-watching — everything currently in progress, for the
    // bulk pull direction (login/profile switch/app start).
    function getContinueWatching(onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/continue-watching', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json && Array.isArray(json.continue_watching)) onDone(json.continue_watching);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // GET /history/item-events — real WatchEvent list for one episode (or one
    // movie via tmdb_id), newest first, already rewatch-aware. Used by the
    // manual "unmark" flow (SYNC-ARCHITECTURE-PLAN.md §5.2.6) to decide which
    // menu options to offer and which event id to delete.
    function getItemEvents(params, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      var query = ['media_type=' + params.mediaType];
      if (params.tmdbId) query.push('tmdb_id=' + params.tmdbId);
      if (params.seriesTmdbId) query.push('series_tmdb_id=' + params.seriesTmdbId);
      if (params.season != null) query.push('season_number=' + params.season);
      if (params.episode != null) query.push('episode_number=' + params.episode);
      network.native(base() + '/history/item-events?' + query.join('&'), function (data) {
        network.clear();
        var json = parse$1(data);
        if (json) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // POST /history/rewatch — start a fresh rewatch cycle (whole show, a season,
    // or a single episode); never touches existing history.
    function startRewatch(seriesTmdbId, season, episode, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      var query = ['series_tmdb_id=' + seriesTmdbId];
      if (season != null) query.push('season_number=' + season);
      if (episode != null) query.push('episode_number=' + episode);
      network.native(base() + '/history/rewatch?' + query.join('&'), function (data) {
        network.clear();
        var json = parse$1(data);
        if (json) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, '{}', {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // DELETE /history/item?id={mediaId}&media_type=... — remove ALL watch events
    // for one media item (all rewatch cycles included). `mediaId` is the
    // server's internal Media.id (from GET /history/item-events's media_id),
    // not a tmdb_id.
    function deleteHistoryItem(mediaId, mediaType, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/item?id=' + mediaId + '&media_type=' + mediaType, function () {
        network.clear();
        onDone();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, '{}', {
        headers: Object.assign({
          'X-HTTP-Method-Override': 'DELETE'
        }, authHeaders()),
        type: 'DELETE'
      });
    }

    // POST /history/drop/show|movie — mark a title "dropped" (SYNC-ARCHITECTURE-
    // PLAN.md §5.3.2): a first-class server-side status, excluded from
    // continue-watching/next-up/discover server-side, NOT a /lists entry.
    // `isSeries` picks the endpoint; body only ever carries tmdb_id (never
    // show_id/media_id - this plugin never has a local Scrob id to send).
    function dropMedia(tmdbId, isSeries, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/drop/' + (isSeries ? 'show' : 'movie'), function (data) {
        network.clear();
        onDone(parse$1(data));
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, JSON.stringify({
        tmdb_id: tmdbId
      }), {
        headers: Object.assign({
          'Content-Type': 'application/json'
        }, authHeaders())
      });
    }

    // DELETE /history/drop/show|movie — undo a drop.
    function undropMedia(tmdbId, isSeries, onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/drop/' + (isSeries ? 'show' : 'movie') + '?tmdb_id=' + tmdbId, function (data) {
        network.clear();
        onDone(parse$1(data));
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, '{}', {
        headers: Object.assign({
          'X-HTTP-Method-Override': 'DELETE'
        }, authHeaders()),
        type: 'DELETE'
      });
    }

    // GET /history/dropped — every currently-dropped show/movie, for the bulk
    // pull direction (§5.3.2). Response shape: { shows: [...], movies: [...] },
    // items carry tmdb_id/title/poster_path but no `type` field of their own -
    // the caller knows which array it came from.
    function getDropped(onDone, onFail) {
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(base() + '/history/dropped', function (data) {
        network.clear();
        var json = parse$1(data);
        if (json && Array.isArray(json.shows) && Array.isArray(json.movies)) onDone(json);else onFail();
      }, function (a, c) {
        network.clear();
        onFail(network.errorDecode(a, c));
      }, false, {
        headers: authHeaders()
      });
    }

    // ─── QR device pairing (OAuth 2.0 Device Authorization Grant, /auth/device/*) ───
    // These three requests are genuinely anonymous by design (RFC 8628) — the Astro
    // gate explicitly exempts them (middleware.ts PUBLIC_PREFIXES), no X-Api-Key/
    // Bearer needed at all. Uses raw fetch() instead of Lampa.Reguest(): the poll's
    // "still pending" response is itself a non-2xx status carrying a JSON body
    // ({error: "authorization_pending" | "slow_down" | ...}) the caller needs to
    // read, which Reguest's onFail callback isn't set up to expose here.

    // POST /auth/device/code — start pairing; returns device_code/user_code/verification_uri(_complete)
    function deviceCode(onDone, onFail) {
      fetch(base() + '/auth/device/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_name: 'Lampa',
          scope: 'write'
        })
      }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (data) {
        if (data && data.device_code && data.user_code) onDone(data);else onFail();
      }).catch(function () {
        onFail();
      });
    }

    // POST /auth/device/token (grant_type=device_code) — one poll of the pairing loop.
    // onDone always receives { ok, body }: the caller reads body.error to tell
    // authorization_pending/slow_down (keep polling) apart from a real outcome.
    function deviceToken(deviceCodeValue, onDone, onFail) {
      fetch(base() + '/auth/device/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=' + encodeURIComponent(deviceCodeValue)
      }).then(function (r) {
        return r.json().then(function (body) {
          return {
            ok: r.ok,
            body: body || {}
          };
        });
      }).then(onDone).catch(function () {
        onFail();
      });
    }

    // POST /auth/device/token (grant_type=refresh_token) — rotates refresh_token on every call.
    function deviceTokenRefresh(refreshToken, onDone, onFail) {
      fetch(base() + '/auth/device/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken)
      }).then(function (r) {
        return r.json().then(function (body) {
          return {
            ok: r.ok,
            body: body || {}
          };
        });
      }).then(onDone).catch(function () {
      });
    }

    // WebSocket client for real-time Scrob events.
    // Supports external (wss via itty.ws) and internal (ws direct) modes.
    // No external dependencies — native browser WebSocket only.

    var ws = null;
    var socketConfig = null;
    var handlers = {};
    var reconnectAttempts = 0;
    var reconnectTimer = null;

    // Build WebSocket URL based on connection mode.
    // Pattern: wss://itty.ws/c/{namespace}:{channel}?joinKey={join_key}&sendKey={send_key}
    function buildSocketUrl(config) {
      var channel = config.namespace + ':user-' + config.username;
      if (config.mode === 'external') {
        // itty.ws relay — uses joinKey + sendKey (not apiKey)
        var base = config.externalUrl + channel;
        var params = [];
        if (config.joinKey) params.push('joinKey=' + encodeURIComponent(config.joinKey));
        if (config.sendKey) params.push('sendKey=' + encodeURIComponent(config.sendKey));
        return base + (params.length ? '?' + params.join('&') : '');
      }
      if (config.mode === 'internal') {
        // Self-hosted — uses joinKey + sendKey
        var base2 = 'ws://' + config.host + ':' + (config.port || 7332) + '/c/' + channel;
        var params2 = [];
        if (config.joinKey) params2.push('joinKey=' + encodeURIComponent(config.joinKey));
        if (config.sendKey) params2.push('sendKey=' + encodeURIComponent(config.sendKey));
        return base2 + (params2.length ? '?' + params2.join('&') : '');
      }
      return null;
    }

    // Establish WebSocket connection with auto-reconnect.
    function connect(url) {
      if (ws) {
        ws.close();
        ws = null;
      }
      reconnectAttempts = 0;
      reconnectTimer = null;
      try {
        ws = new WebSocket(url);
        ws.onopen = function () {
          reconnectAttempts = 0;
          console.log('ScrobSocket', 'connected');
          emitLifecycle('open');
        };
        ws.onmessage = function (event) {
          handleMessage(event.data);
        };
        ws.onclose = function (event) {
          console.log('ScrobSocket', 'disconnected', event.code);
          emitLifecycle('close');
          scheduleReconnect();
        };
        ws.onerror = function (error) {
          console.error('ScrobSocket', 'error', error);
        };
      } catch (e) {
        console.error('ScrobSocket', 'connection failed', e);
        scheduleReconnect();
      }
    }

    // Exponential backoff reconnect: 1s → 2s → 4s → ... → 30s max.
    function scheduleReconnect() {
      if (reconnectTimer) return;
      var delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      reconnectAttempts++;
      reconnectTimer = setTimeout(function () {
        reconnectTimer = null;
        if (socketConfig) {
          var url = buildSocketUrl(socketConfig);
          if (url) connect(url);
        }
      }, delay);
    }

    // Parse incoming JSON and dispatch to registered handlers.
    function handleMessage(data) {
      try {
        var msg = JSON.parse(data);
        if (msg && msg.type) {
          dispatch(msg.type, msg.payload);
        }
      } catch (e) {
        console.error('ScrobSocket', 'invalid message', e);
      }
    }

    // Call all registered handlers for an event type.
    function dispatch(type, payload) {
      if (handlers[type]) {
        handlers[type].forEach(function (handler) {
          try {
            handler(payload);
          } catch (e) {
            console.error('ScrobSocket', 'handler error', e);
          }
        });
      }
    }

    // Lifecycle hooks: 'open' converges on stale snapshot, 'close' resumes polling.
    // Subscribed by sync.engine via onLifecycle (core socket open → update pattern).
    var lifecycle = {
      open: [],
      close: []
    };
    function emitLifecycle(which) {
      var list = lifecycle[which] || [];
      for (var i = 0; i < list.length; i++) {
        try {
          list[i]();
        } catch (e) {
          console.error('ScrobSocket', 'lifecycle error', e);
        }
      }
    }
    function scrobSocketOnLifecycle(which, handler) {
      if (lifecycle[which] && lifecycle[which].indexOf(handler) === -1) lifecycle[which].push(handler);
    }
    function scrobSocketOffLifecycle(which, handler) {
      if (lifecycle[which]) {
        lifecycle[which] = lifecycle[which].filter(function (h) {
          return h !== handler;
        });
      }
    }

    // ─── Public API ───────────────────────────────────────────

    // Initialize WebSocket connection.
    // config: { mode, namespace, externalUrl, host, port, apiKey, username }
    function scrobSocketInit(config) {
      if (config.mode === 'disabled') {
        console.log('ScrobSocket', 'disabled mode — WebSocket not connected');
        return false;
      }
      var url = buildSocketUrl(config);
      if (!url) return false;
      socketConfig = config;
      connect(url);
      return true;
    }

    // Register event handler.
    function scrobSocketOn(event, handler) {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(handler);
    }

    // Unregister event handler.
    function scrobSocketOff(event, handler) {
      if (handlers[event]) {
        handlers[event] = handlers[event].filter(function (h) {
          return h !== handler;
        });
      }
    }

    // Return connection state.
    function scrobSocketIsConnected() {
      return ws && ws.readyState === WebSocket.OPEN;
    }

    // Close connection and cleanup.
    function scrobSocketDisconnect() {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (ws) {
        ws.close();
        ws = null;
      }
      socketConfig = null;
      handlers = {};
    }

    // Get socket interface object for sync.engine (inbound-only notify).
    // REST is the only write path; the server broadcasts REST writes to all devices.
    function getScrobSocket() {
      return {
        on: scrobSocketOn,
        off: scrobSocketOff,
        isConnected: scrobSocketIsConnected,
        onLifecycle: scrobSocketOnLifecycle,
        offLifecycle: scrobSocketOffLifecycle
      };
    }

    // Scrob sync — socket notification hub.
    // Socket is inbound-only: every event only invalidates state and calls engine.update().
    // No direct writes to Lampa.Storage here (mirrors src/core/socket.js: inbound
    // 'bookmarks' only triggers Account.Bookmarks.update()).

    // Registered update callback from the engine (set via bindUpdate)
    var updateFn = null;

    // Registered playback-pull callback from timeline.js (set via bindPlaybackUpdate).
    // Deliberately a SEPARATE hook from updateFn/requestUpdate above, not routed
    // through the engine at all - a playback_session.* event calls for a targeted
    // re-pull of whatever card happens to be open right now (SYNC-ARCHITECTURE-
    // PLAN.md §5.1.1/§5.4, Гілка 9), not the engine's own list convergence.
    var playbackPullFn = null;

    // Registered dropped-status callback from engine.js (set via bindDropSync).
    // Also separate from updateFn: a show.dropped/movie.dropped event needs the
    // actual payload (tmdb_id/title) to update ONE local Favorite('thrown')
    // entry directly (§5.3.2) - re-running the whole list convergence for this
    // would be both the wrong mechanism (thrown isn't a /lists entry any more)
    // and unnecessary work.
    var dropSyncFn = null;

    // Named handlers: stable references so off() actually unregisters (unlike
    // anonymous closures, which silently leak and double-fire after restarts).
    function onItemAdded(payload) {
      requestUpdate('list.item_added');
    }
    function onItemRemoved(payload) {
      requestUpdate('list.item_removed');
    }
    function onListCreated(payload) {
      requestUpdate('list.created');
    }
    function onListUpdated(payload) {
      requestUpdate('list.updated');
    }
    function onListDeleted(payload) {
      requestUpdate('list.deleted');
    }
    // Identical effect for both directions (§5.7 Фаза 5 design point 2/3) -
    // requestPlaybackPull() re-pulls whatever's on screen right now regardless
    // of which way the change went. Two named handlers instead of one shared
    // one only so requestUpdate()'s own reason string stays accurate for
    // logging - off() below still needs each as a stable reference either way.
    function onWatchEvent(payload) {
      requestUpdate('watch_event.created');
      requestPlaybackPull();
    }
    function onWatchEventDeleted(payload) {
      requestUpdate('watch_event.deleted');
      requestPlaybackPull();
    }
    function onPlaybackCompleted(payload) {
      requestUpdate('playback_session.completed');
      requestPlaybackPull();
    }
    function onPlaybackStarted(payload) {
      requestPlaybackPull();
    }
    function onPlaybackPlaying(payload) {
      requestPlaybackPull();
    }
    function onPlaybackPaused(payload) {
      requestPlaybackPull();
    }
    function onShowDropped(payload) {
      requestDropSync('show', 'dropped', payload);
    }
    function onShowUndropped(payload) {
      requestDropSync('show', 'undropped', payload);
    }
    function onMovieDropped(payload) {
      requestDropSync('movie', 'dropped', payload);
    }
    function onMovieUndropped(payload) {
      requestDropSync('movie', 'undropped', payload);
    }

    // Bind the engine update() entry point. Called once from engine.start().
    function bindUpdate(fn) {
      updateFn = fn;
    }

    // Bind the playback-pull entry point. Called once from timelineSync.start().
    function bindPlaybackUpdate(fn) {
      playbackPullFn = fn;
    }

    // Bind the dropped-status entry point. Called once from engine.start().
    function bindDropSync(fn) {
      dropSyncFn = fn;
    }

    // Single notification path: ask the engine to refetch and converge.
    function requestUpdate(reason) {
      if (typeof updateFn === 'function') updateFn(reason || 'socket');
    }

    // Notify timeline.js that a playback_session.* event arrived somewhere for
    // this account - no payload passed through on purpose (see timeline.js's
    // pullActiveCard(): it re-pulls whatever card is on screen right now,
    // regardless of which title the event was actually about).
    function requestPlaybackPull() {
      if (typeof playbackPullFn === 'function') playbackPullFn();
    }

    // Notify engine.js that a show/movie was dropped or undropped somewhere for
    // this account. `mediaType` ('show'|'movie') + `action` ('dropped'|'undropped')
    // let one callback cover all four events; `payload` is passed through as-is
    // ({ show_id|media_id, tmdb_id, title } - see backend socket emit).
    function requestDropSync(mediaType, action, payload) {
      if (typeof dropSyncFn === 'function') dropSyncFn(mediaType, action, payload);
    }

    // ─── Public API ───────────────────────────────────────────

    // Register invalidation handlers on the socket.
    // Every event funnels into requestUpdate — no Storage writes here.
    function registerHandlers(socket) {
      socket.on('list.item_added', onItemAdded);
      socket.on('list.item_removed', onItemRemoved);
      socket.on('list.created', onListCreated);
      socket.on('list.updated', onListUpdated);
      socket.on('list.deleted', onListDeleted);
      socket.on('watch_event.created', onWatchEvent);
      socket.on('watch_event.deleted', onWatchEventDeleted);
      socket.on('playback_session.completed', onPlaybackCompleted);
      socket.on('playback_session.started', onPlaybackStarted);
      socket.on('playback_session.playing', onPlaybackPlaying);
      socket.on('playback_session.paused', onPlaybackPaused);
      socket.on('show.dropped', onShowDropped);
      socket.on('show.undropped', onShowUndropped);
      socket.on('movie.dropped', onMovieDropped);
      socket.on('movie.undropped', onMovieUndropped);
    }

    // Unregister invalidation handlers from the socket.
    function unregisterHandlers(socket) {
      socket.off('list.item_added', onItemAdded);
      socket.off('list.item_removed', onItemRemoved);
      socket.off('list.created', onListCreated);
      socket.off('list.updated', onListUpdated);
      socket.off('list.deleted', onListDeleted);
      socket.off('watch_event.created', onWatchEvent);
      socket.off('watch_event.deleted', onWatchEventDeleted);
      socket.off('playback_session.completed', onPlaybackCompleted);
      socket.off('playback_session.started', onPlaybackStarted);
      socket.off('playback_session.playing', onPlaybackPlaying);
      socket.off('playback_session.paused', onPlaybackPaused);
      socket.off('show.dropped', onShowDropped);
      socket.off('show.undropped', onShowUndropped);
      socket.off('movie.dropped', onMovieDropped);
      socket.off('movie.undropped', onMovieUndropped);
    }

    // Scrob sync — category mapping between Lampa favorite keys and Scrob list names.
    // Canonical list names are static English, never translated.
    // Universal rule: any other array key → '[Lampa] ' + Capitalized(key).
    // Excluded from iteration: card, thrown (§5.3.2 - separate mechanism, below),
    // watch (see note right below CANONICAL).
    //
    // `history` (SYNC-ARCHITECTURE-PLAN.md §5.3.1) is Lampa's own recently-
    // opened-cards playlist (Favorite.add('history', card, 100), capped
    // client-side at 100 - NOT the Scrob WatchEvent journal, a completely
    // separate table/concept; syncing it here only moves cards in/out of this
    // UI list across devices, never touches watch history/timeline data.
    //
    // `viewed` (§5.3) is the whole-card "переглянуто" status (mutually
    // exclusive with look/scheduled/continued/thrown, see MARK_KEYS below,
    // same as those four already are) - NOT Lampa.Timeline's per-episode
    // watched marks (§5.2.6/§5.2), a different mechanism entirely; syncing it
    // here never touches Timeline/WatchEvent.
    //
    // `thrown` (§5.3.2) is EXCLUDED here on purpose, unlike the other four
    // MARK_KEYS - "Кинуто" maps to Scrob's own first-class dropped_shows/
    // dropped_movies state (POST/DELETE /history/drop/show|movie), not a
    // generic named list, so continue-watching filtering and the native
    // "Покинуті" page on the server both already know about it. engine.js
    // intercepts `where === 'thrown'` in its own Favorite.listener hooks
    // instead of routing it through this file's generic list-sync pipeline.

    // Canonical mapping: Lampa key → Scrob list name
    var CANONICAL = {
      book: '[Lampa] Bookmarks',
      like: '[Lampa] Like',
      wath: '[Lampa] Later',
      scheduled: '[Lampa] Scheduled',
      continued: '[Lampa] To be continued',
      look: '[Lampa] Look',
      history: '[Lampa] History',
      viewed: '[Lampa] Viewed'
    };

    // `watch` (with "ch", distinct from `wath`) is a dead/unused category - the
    // real Lampa client (web/Android) never writes to it, only reads/writes
    // `wath`. lampac's own BookmarkController.cs's EnsureDefaultArrays() force-
    // includes it (an empty array) in EVERY /bookmark/list response regardless,
    // and bookmark.js overwrites local Lampa.Storage 'favorite' wholesale with
    // that response - so `favorite.watch = []` shows up for any lampac user,
    // and the generic list-sync below (syncableKeys()'s "any array key" rule)
    // dutifully mirrored it up as a useless "[Lampa] Watch" list on Scrob (found
    // live 2026-09-19, lists.md). Excluded here so it's silently ignored, same
    // as `card`.
    //
    // Keys excluded from sync iteration
    var EXCLUDED = {
      card: true,
      thrown: true,
      watch: true
    };

    // Mark categories — mutually exclusive statuses (section 13, point 3)
    var MARK_KEYS = ['scheduled', 'continued', 'thrown', 'look', 'viewed'];

    // Capitalize first letter of a string
    function capitalize(str) {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Get Scrob list name for a Lampa favorite key.
    // Canonical keys get static names; unknown keys use universal rule.
    // Returns null for excluded keys (card).
    function listNameForKey(key) {
      if (EXCLUDED[key]) return null;
      if (CANONICAL[key]) return CANONICAL[key];
      return '[Lampa] ' + capitalize(key);
    }

    // Get all syncable keys from a favorite object (all array keys except excluded).
    function syncableKeys(favorite) {
      var keys = [];
      for (var k in favorite) {
        if (!EXCLUDED[k] && Array.isArray(favorite[k])) {
          keys.push(k);
        }
      }
      return keys;
    }

    // Detect entity type from a Lampa card object.
    // Returns: 'person' | 'series' | 'movie'
    function detectMediaType(card) {
      if (!card) return 'movie';

      // Person detection (from custom/core/favorite.js:98)
      if (card.profile_path || card.known_for_department || typeof card.gender !== 'undefined') {
        return 'person';
      }

      // Series detection
      if (card.method === 'tv' || card.first_air_date || card.name && !card.title) {
        return 'series';
      }
      return 'movie';
    }

    // Convert Lampa method/type to Scrob media_type.
    // Lampa uses 'tv', Scrob uses 'series'.
    function toScrobType(lampaType) {
      if (lampaType === 'tv') return 'series';
      return lampaType; // 'movie', 'person'
    }

    // Convert Scrob media_type to Lampa method.
    // Scrob uses 'series', Lampa uses 'tv'.
    function toLampaMethod(scrobType) {
      if (scrobType === 'series') return 'tv';
      if (scrobType === 'person') return undefined;
      return 'movie';
    }

    // Build element key for mirror: "media_type:tmdb_id"
    function elementKey(mediaType, tmdbId) {
      return mediaType + ':' + tmdbId;
    }

    // Parse element key back to components
    function parseElementKey(key) {
      var idx = key.indexOf(':');
      if (idx === -1) return {
        mediaType: 'movie',
        tmdbId: key
      };
      return {
        mediaType: key.substring(0, idx),
        tmdbId: key.substring(idx + 1)
      };
    }

    // Build a minimal Lampa card from Scrob media object (section 7).
    // Enough for Lampa to open full-screen and fetch details.
    function cardFromScrobMedia(media) {
      if (!media || !media.tmdb_id) return null;
      var method = toLampaMethod(media.type);
      var card = {
        id: media.tmdb_id,
        method: method,
        title: media.title || '',
        poster_path: media.poster_path || '',
        backdrop_path: media.backdrop_path || '',
        release_date: media.release_date || ''
      };

      // Series: duplicate title into name/original_name for Lampa compatibility
      if (media.type === 'series') {
        card.name = media.title || '';
        card.original_name = media.title || '';
      }
      return card;
    }

    // ─── Unified KeyResolver (single implementation for REST + socket paths) ───
    // map: mapstore mapping object { lampaKey: { list_id, list_name } }
    // mirrorLists: mirror.get().lists ({ name: { list_id } })
    // favorite: parsed favorite object (for custom keys discovered at runtime)

    // Resolve the Lampa key for a Scrob list name.
    // Priority: 1) mapstore reverse lookup by name, 2) canonical names, 3) custom keys.
    function resolveKeyForListName(listName, map, favorite) {
      if (!listName) return null;
      if (map) {
        var mapKeys = Object.keys(map);
        for (var i = 0; i < mapKeys.length; i++) {
          if (map[mapKeys[i]].list_name === listName) return mapKeys[i];
        }
      }
      var canonicals = Object.keys(CANONICAL);
      for (var j = 0; j < canonicals.length; j++) {
        if (CANONICAL[canonicals[j]] === listName) return canonicals[j];
      }
      if (favorite) {
        var keys = syncableKeys(favorite);
        for (var k = 0; k < keys.length; k++) {
          if (listNameForKey(keys[k]) === listName) return keys[k];
        }
      }
      return null;
    }

    // Resolve the Scrob list name for a list_id via the mirror index.
    function resolveNameForListId(listId, mirrorLists) {
      if (listId == null || !mirrorLists) return null;
      var names = Object.keys(mirrorLists);
      for (var i = 0; i < names.length; i++) {
        if (mirrorLists[names[i]].list_id == listId) return names[i];
      }
      return null;
    }

    // Resolve the Lampa key for a Scrob list_id.
    // Priority: 1) mapstore reverse lookup by id, 2) mirror name → key.
    function resolveKeyForListId(listId, map, mirrorLists, favorite) {
      if (listId == null) return null;
      if (map) {
        var keys = Object.keys(map);
        for (var i = 0; i < keys.length; i++) {
          if (map[keys[i]].list_id == listId) return keys[i];
        }
      }
      var name = resolveNameForListId(listId, mirrorLists);
      if (name) return resolveKeyForListName(name, map, favorite);
      return null;
    }

    // ─── Unified applicator (single write path with core marks logic) ───
    // All functions mutate the passed favorite object; the caller performs
    // exactly one Lampa.Storage.set('favorite') after the batch.

    // Remove a card from all mark categories except the specified one.
    // Mirrors Favorite.toggle() exclusivity in src/core/favorite.js.
    function removeFromOtherMarks(favorite, cardId, exceptKey) {
      for (var i = 0; i < MARK_KEYS.length; i++) {
        var key = MARK_KEYS[i];
        if (key === exceptKey) continue;
        if (!Array.isArray(favorite[key])) continue;
        var idx = favorite[key].indexOf(cardId);
        if (idx !== -1) favorite[key].splice(idx, 1);
      }
    }

    // Find a card by id in the shared pool.
    function findCardById(cards, id) {
      if (!Array.isArray(cards)) return null;
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].id == id) return cards[i];
      }
      return null;
    }

    // Build the local element set for one category: { "type:tmdb_id": cardId }
    function localElementSet(favorite, lampaKey) {
      var set = {};
      var localIds = lampaKey && Array.isArray(favorite[lampaKey]) ? favorite[lampaKey] : [];
      for (var j = 0; j < localIds.length; j++) {
        var card = findCardById(favorite.card, localIds[j]);
        if (!card || !card.id) continue;
        var idNum = parseInt(card.id, 10);
        if (!idNum) continue;
        set[elementKey(detectMediaType(card), idNum)] = card.id;
      }
      return set;
    }

    // Build the server element set from GET /lists/{id} items.
    function scrobElementSet(scrobItems) {
      var set = {};
      for (var i = 0; i < scrobItems.length; i++) {
        var item = scrobItems[i];
        if (item.media && item.media.tmdb_id) {
          var key = elementKey(toScrobType(item.media.type || 'movie'), item.media.tmdb_id);
          set[key] = {
            itemId: item.id,
            media: item.media
          };
        }
      }
      return set;
    }

    // Apply one remote addition to the favorite object (card pool + category + marks).
    function applyRemoteAdd(favorite, lampaKey, tmdbId, media) {
      if (!tmdbId) return;
      if (!Array.isArray(favorite.card)) favorite.card = [];
      var card = findCardById(favorite.card, tmdbId);
      if (!card) {
        card = media && cardFromScrobMedia(media) || null;
        if (!card) {
          card = {
            id: tmdbId,
            method: 'movie',
            title: String(tmdbId),
            poster_path: ''
          };
        }
        favorite.card.push(card);
      }
      if (lampaKey) {
        if (!Array.isArray(favorite[lampaKey])) favorite[lampaKey] = [];
        if (favorite[lampaKey].indexOf(card.id) === -1) favorite[lampaKey].push(card.id);
        if (MARK_KEYS.indexOf(lampaKey) !== -1) removeFromOtherMarks(favorite, card.id, lampaKey);
      }
    }

    // Apply one remote removal to the favorite object.
    function applyRemoteRemove(favorite, lampaKey, tmdbId) {
      if (!tmdbId || !lampaKey || !Array.isArray(favorite[lampaKey])) return;
      var idx = favorite[lampaKey].indexOf(tmdbId);
      if (idx !== -1) favorite[lampaKey].splice(idx, 1);
    }

    // Scrob sync — mirror storage with Tracker-model staleness.
    // Per-profile mirror: scrob_sync_mirror_{profile_id}
    // Structure: { lists: { "[Lampa] Name": { list_id, items: { "type:tmdb_id": item_id } } },
    //              version, time, updated_at }
    // version/time follow Lampa core Tracker (src/core/tracker.js): bumped on every
    // converged save; profile switch resets them so the next update fetches fresh state.


    // Get the storage key for the active profile's mirror
    function mirrorKey() {
      var pid = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID) || 'default';
      return 'scrob_sync_mirror_' + pid;
    }

    // Get the initial-done flag key for the active profile
    function initialDoneKey() {
      var pid = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID) || 'default';
      return 'scrob_sync_initial_done_' + pid;
    }

    // Default mirror structure
    function emptyMirror() {
      return {
        lists: {},
        version: 0,
        time: 0,
        updated_at: 0
      };
    }

    // Read the mirror from storage
    function get() {
      var raw = Lampa.Storage.get(mirrorKey(), 'none');
      if (raw === 'none' || !raw) return emptyMirror();
      if (typeof raw === 'string') {
        try {
          raw = JSON.parse(raw);
        } catch (e) {
          return emptyMirror();
        }
      }
      return raw;
    }

    // Save the mirror to storage
    function save(mirror) {
      var now = Date.now();
      mirror.time = now;
      mirror.version = (mirror.version || 0) + 1;
      mirror.updated_at = now;
      Lampa.Storage.set(mirrorKey(), mirror);
    }

    // True when the mirror snapshot is older than the given age (ms)
    function isStale(maxAgeMs) {
      var m = get();
      return Date.now() - (m.time || 0) > maxAgeMs;
    }

    // Reset the mirror to empty
    function reset() {
      Lampa.Storage.set(mirrorKey(), emptyMirror());
    }

    // Get a list entry by name (returns undefined if not found)
    function getList(name) {
      var m = get();
      return m.lists[name];
    }

    // Set a list entry by name
    function setList(name, listId) {
      var m = get();
      m.lists[name] = {
        list_id: listId,
        items: m.lists[name] ? m.lists[name].items : {}
      };
      save(m);
    }

    // Get item_id from mirror for a specific list and element key
    function getItemId(listName, elemKey) {
      var list = getList(listName);
      if (!list) return null;
      return list.items[elemKey] || null;
    }

    // Set item_id in mirror for a specific list and element key
    function setItemId(listName, elemKey, itemId) {
      var m = get();
      if (!m.lists[listName]) {
        m.lists[listName] = {
          list_id: null,
          items: {}
        };
      }
      m.lists[listName].items[elemKey] = itemId;
      save(m);
    }

    // Remove item_id from mirror for a specific list and element key
    function removeItemId(listName, elemKey) {
      var m = get();
      if (m.lists[listName] && m.lists[listName].items) {
        delete m.lists[listName].items[elemKey];
        save(m);
      }
    }

    // Check if initial sync has been done for the active profile
    function isInitialDone() {
      return !!Lampa.Storage.get(initialDoneKey());
    }

    // Mark initial sync as done
    function markInitialDone() {
      Lampa.Storage.set(initialDoneKey(), true);
    }

    // Clear initial done flag (for profile switch re-sync)
    function clearInitialDone() {
      Lampa.Storage.set(initialDoneKey(), false);
    }

    // Scrob sync — manual mapping storage.
    // Maps arbitrary Scrob lists to Lampa favorite categories.
    // Storage key: scrob_sync_map_{profile_id}
    // Structure: { "wath": { "list_id": 5, "list_name": "Test" } }


    // Get the storage key for the active profile's mapping
    function mapKey() {
      var pid = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID) || 'default';
      return 'scrob_sync_map_' + pid;
    }

    // Broken mappings storage key
    function brokenKey() {
      var pid = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID) || 'default';
      return 'scrob_sync_broken_' + pid;
    }

    // Parse stored map from storage
    function parseMap(raw) {
      if (!raw || raw === 'none') return {};
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return {};
        }
      }
      return raw;
    }

    // Parse stored broken array from storage
    function parseBroken(raw) {
      if (!raw || raw === 'none') return [];
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return [];
        }
      }
      return Array.isArray(raw) ? raw : [];
    }

    // Get the full mapping object
    function getMap() {
      return parseMap(Lampa.Storage.get(mapKey(), 'none'));
    }

    // Save the full mapping object
    function saveMap(map) {
      Lampa.Storage.set(mapKey(), map);
    }

    // Set a mapping: lampaKey → { list_id, list_name }
    // Returns true on success, false if list_id already mapped to another category
    function setMapping(lampaKey, listId, listName) {
      var map = getMap();

      // Exclusivity check: list_id must not be mapped to another category
      var keys = Object.keys(map);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] !== lampaKey && map[keys[i]].list_id == listId) {
          return false;
        }
      }
      map[lampaKey] = {
        list_id: listId,
        list_name: listName
      };
      saveMap(map);

      // Clear broken flag for this key if it was previously broken
      var broken = getBroken();
      var idx = broken.indexOf(lampaKey);
      if (idx !== -1) {
        broken.splice(idx, 1);
        saveBroken(broken);
      }
      return true;
    }

    // Remove a mapping for a lampaKey
    function removeMapping(lampaKey) {
      var map = getMap();
      delete map[lampaKey];
      saveMap(map);
    }

    // Get all mapped list_ids
    function getMappedIds() {
      var map = getMap();
      var ids = [];
      var keys = Object.keys(map);
      for (var i = 0; i < keys.length; i++) {
        ids.push(map[keys[i]].list_id);
      }
      return ids;
    }

    // Get broken mappings array
    function getBroken() {
      return parseBroken(Lampa.Storage.get(brokenKey(), 'none'));
    }

    // Save broken mappings array
    function saveBroken(broken) {
      Lampa.Storage.set(brokenKey(), broken);
    }

    // Mark a mapping as broken (list deleted on server)
    function markBroken(lampaKey) {
      var broken = getBroken();
      if (broken.indexOf(lampaKey) === -1) {
        broken.push(lampaKey);
        saveBroken(broken);
      }
    }

    // Get mapping entry for a lampaKey (returns { list_id, list_name } or undefined)
    function getMapping(lampaKey) {
      var map = getMap();
      return map[lampaKey];
    }

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


    // ─── State ────────────────────────────────────────────────

    var received = false; // Echo guard: true while engine itself writes favorite
    var outboundTimer = null; // Debounce timer for outbound push (core: 500ms)
    var pushQueue = []; // Serial outbound queue { method, lampaKey, card }
    var pushRunning = false; // Serial guard (core: push_running)
    var updateTimer = null; // Socket/poll invalidate debounce (core: update_timer 500ms)
    var updateRunning = false; // Single-flight update() guard
    var pollTimer = null; // Polling interval timer
    var retryQueue = []; // Failed REST operations for retry
    var retryTimer = null; // Retry interval timer
    var running$2 = false; // Engine active flag
    var profileListener$1 = null; // Profile change listener reference
    var brokenMappings = []; // Keys whose mapped list was deleted on server
    var healing = false; // Self-heal guard: prevent re-entrant missing-key resolution
    var activeSocket = null; // Current WebSocket instance (inbound-only notify)
    var handlersBound = false; // Socket handlers registered flag
    var socketPollBound = null; // Socket open/close hook reference
    var dropActivityBound = false; // 'activity' listener (dropped-status refresh, §5.3.2) registered flag

    // Debounce window for batching outbound changes (ms, core bookmarks.js: 500)
    var DEBOUNCE_MS = 500;
    var RETRY_DELAY = 5000;
    var RETRY_MAX = 3;

    // ─── Conflict detection ───────────────────────────────────

    // Detect conflicts with other sync mechanisms.
    // Returns an array of conflict objects: { type, reason }
    function detectConflicts() {
      var conflicts = [];

      // CUB account with sync enabled (section 9)
      if (Lampa.Account && Lampa.Account.Permit && Lampa.Account.Permit.sync) {
        conflicts.push({
          type: 'cub_sync',
          reason: 'CUB synchronization is enabled — Scrob list sync is blocked'
        });
      }

      // GramSync/GramLink profile active (section 9)
      if (Lampa.Storage.get('gramsync_sync_enabled')) {
        conflicts.push({
          type: 'gramsync',
          reason: 'GramSync is enabled — simultaneous sync may cause data conflicts'
        });
      }
      return conflicts;
    }

    // ─── Socket integration ───────────────────────────────────

    // Provide a WebSocket instance for real-time sync (inbound-only notify).
    function useSocket(socketInstance) {
      // Rebinding: drop handlers from the previous socket before switching.
      if (activeSocket && activeSocket !== socketInstance) unbindSocketHandlers();
      activeSocket = socketInstance;
      if (running$2) {
        bindSocketHandlers();
        if (isSocketActive()) stopPolling();else startPolling();
      }
    }

    // Check if socket is currently connected and active.
    function isSocketActive() {
      return !!(activeSocket && activeSocket.isConnected && activeSocket.isConnected());
    }

    // ─── Favorite helpers ─────────────────────────────────────

    // Read favorite from storage, normalize from string if needed.
    function readFavorite() {
      var favorite = Lampa.Storage.get('favorite', '{}');
      if (typeof favorite === 'string') {
        try {
          favorite = JSON.parse(favorite);
        } catch (e) {
          favorite = {};
        }
      }
      if (!favorite.card) favorite.card = [];
      return favorite;
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
      received = true;
      Lampa.Storage.set('favorite', favorite);
      if (Lampa.Favorite && typeof Lampa.Favorite.read === 'function') Lampa.Favorite.read(true);
      received = false;
    }

    // ─── Outbound: Favorite.listener + state:changed → serial queue ───
    // Core pattern: Favorite.listener.follow('add,added'/'remove') in bookmarks.js init().

    function onFavoriteAdd(e) {
      if (!running$2 || received) return;
      if (!e || !e.where || !e.card || !e.card.id) return;
      // 'thrown' (§5.3.2) never goes through the generic /lists queue below -
      // it maps to Scrob's own first-class dropped-state endpoints instead.
      if (e.where === 'thrown') {
        pushDrop('add', e.card);
        return;
      }
      push('add', e.where, e.card);
    }
    function onFavoriteRemove(e) {
      if (!running$2 || received) return;
      if (!e || !e.where || !e.card) return;
      if (e.method && e.method !== 'id') return;
      if (!e.card.id) return;
      if (e.where === 'thrown') {
        pushDrop('remove', e.card);
        return;
      }
      push('remove', e.where, e.card);
    }

    // ─── Dropped status ("Кинуто") — SYNC-ARCHITECTURE-PLAN.md §5.3.2 ─────────
    // A first-class Scrob server state (dropped_shows/dropped_movies), not a
    // /lists entry - excluded from the generic list-sync above (mapping.js's
    // EXCLUDED), pushed/pulled here directly against POST/DELETE
    // /history/drop/show|movie and GET /history/dropped instead.

    function pushDrop(action, card) {
      var tmdbId = parseInt(card.id, 10);
      if (!tmdbId) return;
      var isSeries = detectMediaType(card) === 'series';
      var call = action === 'add' ? dropMedia : undropMedia;
      call(tmdbId, isSeries, function () {}, function (err) {
        if (isAuthError(err)) {
          pauseSync('Authentication expired');
          return;
        }
        enqueueRetry({
          type: 'custom',
          run: function run(done, fail) {
            call(tmdbId, isSeries, done, fail);
          }
        });
      });
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
      };
    }

    // favorite.thrown holds raw card.id values, which can be either a number or
    // a string depending on where the card originally came from (the same
    // nuance mapping.js's own localElementSet() already normalizes for) - a
    // plain === / Array.indexOf (including the one inside applyRemoteRemove()
    // itself) can silently miss a type-mismatched entry. Not touched in
    // mapping.js itself (still shared by the generic list-sync above, for the
    // other 8 categories) - normalized locally here instead, only for `thrown`.
    function hasThrown(favorite, tmdbId) {
      var arr = favorite.thrown;
      if (!Array.isArray(arr)) return false;
      var target = parseInt(tmdbId, 10);
      for (var i = 0; i < arr.length; i++) {
        if (parseInt(arr[i], 10) === target) return true;
      }
      return false;
    }
    function removeThrown(favorite, tmdbId) {
      var arr = favorite.thrown;
      if (!Array.isArray(arr)) return false;
      var target = parseInt(tmdbId, 10);
      for (var i = 0; i < arr.length; i++) {
        if (parseInt(arr[i], 10) === target) {
          applyRemoteRemove(favorite, 'thrown', arr[i]); // the raw stored element, not `target` - its own indexOf needs an exact match too
          return true;
        }
      }
      return false;
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
    var lastDropPullAt = 0;
    var dropPullInFlight = false;
    var DROP_PULL_MIN_INTERVAL_MS = 15000;

    // Bulk pull - bidirectional (adds AND removes local thrown marks the server
    // no longer agrees with), safe to call from start() (force=true, bypasses
    // the throttle - a lifecycle event, not rapid navigation), the poll cycle,
    // and the activity trigger (both without force - throttled/in-flight-guarded).
    function pullDropped(force) {
      if (dropPullInFlight) return;
      if (!force && Date.now() - lastDropPullAt < DROP_PULL_MIN_INTERVAL_MS) return;
      dropPullInFlight = true;
      getDropped(function (result) {
        dropPullInFlight = false;
        lastDropPullAt = Date.now();
        var favorite = readFavorite();
        var changed = false;
        var remoteIds = {};
        function addMissing(mediaType, items) {
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var tmdbId = parseInt(item.tmdb_id, 10);
            if (!tmdbId) continue;
            remoteIds[tmdbId] = true;
            if (hasThrown(favorite, tmdbId)) continue;
            applyRemoteAdd(favorite, 'thrown', tmdbId, dropMediaShape(mediaType, item));
            changed = true;
          }
        }
        addMissing('show', result.shows);
        addMissing('movie', result.movies);

        // Bidirectional: a title undropped elsewhere (web dashboard, another
        // device) while this device was offline/socket-disconnected must
        // lose its local mark too - unless it's still sitting in pushQueue
        // (this device marked it thrown just now, hasn't reached the server
        // yet) - same stillQueued guard convergeOneList() already uses for
        // the generic list-sync above, ported here for 'thrown'.
        var localThrown = Array.isArray(favorite.thrown) ? favorite.thrown.slice() : [];
        for (var li = 0; li < localThrown.length; li++) {
          var localId = parseInt(localThrown[li], 10);
          if (!localId || remoteIds[localId]) continue;
          var stillQueued = false;
          for (var q = 0; q < pushQueue.length; q++) {
            if (pushQueue[q].lampaKey === 'thrown' && parseInt(pushQueue[q].card.id, 10) === localId) {
              stillQueued = true;
              break;
            }
          }
          if (stillQueued) continue;
          if (removeThrown(favorite, localId)) changed = true;
        }
        if (changed) writeFavorite(favorite);
      }, function (err) {
        dropPullInFlight = false;
        // Set on failure too (found by review 2026-09-12) - otherwise an
        // offline server/500 means every subsequent card open or `main`
        // visit retries immediately instead of backing off for the same
        // DROP_PULL_MIN_INTERVAL_MS.
        lastDropPullAt = Date.now();
        console.warn('ScrobSync', 'dropped pull failed', err);
      });
    }

    // Home screen / full card visit - separate 'activity' listener (engine.js
    // had none before this), same component filter timeline.js's own
    // onActivityStart()/onMainScreenActivity() already use. Throttled by
    // pullDropped()'s own guard above, not a session-once flag - see the
    // rejected-alternative note there for why.
    function onDropSyncActivity(e) {
      if (!running$2) return;
      if (!e || e.type !== 'start') return;
      if (e.component !== 'main' && e.component !== 'full') return;
      pullDropped();
    }

    // Inbound socket event (handler.js's bindDropSync) - a show/movie was
    // dropped or undropped on ANY device tied to this account. `payload` is
    // whatever the server's socket emit carries ({ show_id|media_id, tmdb_id,
    // title }, see history.py) - enough to build a minimal card via
    // cardFromScrobMedia(), same fallback shape a fresh remote /lists addition
    // already gets elsewhere in this file.
    function applyRemoteDropEvent(mediaType, action, payload) {
      if (!running$2 || !payload || !payload.tmdb_id) return;
      var favorite = readFavorite();
      var tmdbId = parseInt(payload.tmdb_id, 10);
      if (!tmdbId) return;
      var changed;
      if (action === 'dropped') {
        changed = !hasThrown(favorite, tmdbId);
        if (changed) applyRemoteAdd(favorite, 'thrown', tmdbId, dropMediaShape(mediaType, payload));
      } else {
        changed = removeThrown(favorite, tmdbId);
      }
      if (changed) writeFavorite(favorite);
    }

    // Custom categories bypass core Favorite (see main.js toggleCustomCategory) and
    // only emit state:changed with type=custom key — bridge them into the same queue.
    // Dedupe: core keys already arrived via Favorite.listener; skip if identical op queued.
    function onStateChanged(e) {
      if (!running$2 || received) return;
      if (!e || e.target !== 'favorite' || e.reason !== 'update') return;
      if (!e.type || !e.card || !e.card.id) return;
      if (e.method !== 'add' && e.method !== 'added' && e.method !== 'remove') return;
      var fav = readFavorite();
      if (!Array.isArray(fav[e.type])) return;
      var method = e.method === 'remove' ? 'remove' : 'add';
      for (var i = 0; i < pushQueue.length; i++) {
        if (pushQueue[i].method === method && pushQueue[i].lampaKey === e.type && pushQueue[i].card.id == e.card.id) return;
      }
      push(method, e.type, e.card);
    }
    function push(method, lampaKey, card) {
      pushQueue.push({
        method: method,
        lampaKey: lampaKey,
        card: card
      });
      if (outboundTimer) clearTimeout(outboundTimer);
      outboundTimer = setTimeout(processQueue, DEBOUNCE_MS);
    }

    // Serial outbound drain: one REST write at a time, then mirror + invalidate.
    // `outboundTimer` is a plain setTimeout, not a Lampa listener re-evaluated
    // against the CURRENT `running` on every call - stop() clears both the timer
    // and pushQueue, but only if it runs to completion before this fires. Checked
    // directly here too (found live 2026-09-18: Favorite/list writes kept
    // reaching the server for a short window after toggling sync off).
    function processQueue() {
      outboundTimer = null;
      if (!running$2 || pushRunning || pushQueue.length === 0) return;
      pushRunning = true;
      var op = pushQueue.shift();
      writeOne(op, function () {
        pushRunning = false;
        if (pushQueue.length > 0) {
          outboundTimer = setTimeout(processQueue, DEBOUNCE_MS);
        }
      });
    }

    // Resolve list_id for a Lampa key: mapstore first, then mirror by canonical name.
    function resolveListId(lampaKey) {
      var mapping = getMapping(lampaKey);
      if (mapping && mapping.list_id) return {
        listId: mapping.list_id,
        listName: mapping.list_name || listNameForKey(lampaKey)
      };
      var name = listNameForKey(lampaKey);
      if (!name) return null;
      var m = get();
      if (m.lists[name] && m.lists[name].list_id) return {
        listId: m.lists[name].list_id,
        listName: name
      };
      return null;
    }

    // Single REST write. Socket is notify-only: no socketIngest branch here.
    function writeOne(op, done) {
      var target = resolveListId(op.lampaKey);
      if (!target) {
        // Unknown list (e.g. new custom key before self-heal) — defer to update().
        update('self-heal');
        done();
        return;
      }
      var cardId = parseInt(op.card.id, 10);
      if (!cardId) {
        done();
        return;
      }
      var mediaType = detectMediaType(op.card);
      var key = elementKey(mediaType, cardId);
      if (op.method === 'add') {
        addListItem(target.listId, cardId, mediaType, function (response) {
          setItemId(target.listName, key, response && response.id ? response.id : null);
          // Notify other devices; our own state already converged via the queue.
          done();
        }, function (err, status) {
          if (status === 409 || String(err).indexOf('409') !== -1) {
            // Already on server: fetch the real item_id so delete stays possible.
            fetchItemId(target.listId, target.listName, key, done);
            return;
          }
          if (isAuthError(err)) {
            pauseSync('Authentication expired');
            done();
            return;
          }
          enqueueRetry({
            type: 'add',
            listId: target.listId,
            listName: target.listName,
            key: key,
            tmdbId: cardId,
            mediaType: mediaType
          });
          done();
        });
      } else {
        var itemId = getItemId(target.listName, key);
        if (!itemId) {
          // No item_id (409 null-mark or missed ingest): resolve before delete.
          fetchItemId(target.listId, target.listName, key, function (resolved) {
            var rid = getItemId(target.listName, key);
            if (rid) {
              deleteListItem(target.listId, rid, function () {
                removeItemId(target.listName, key);
                done();
              }, function (err) {
                if (isAuthError(err)) {
                  pauseSync('Authentication expired');
                  done();
                  return;
                }
                enqueueRetry({
                  type: 'remove',
                  listId: target.listId,
                  listName: target.listName,
                  key: key,
                  itemId: rid
                });
                done();
              });
            } else {
              // Item is neither on server nor in mirror — converge by dropping the mark.
              removeItemId(target.listName, key);
              done();
            }
          }, true);
          return;
        }
        deleteListItem(target.listId, itemId, function () {
          removeItemId(target.listName, key);
          done();
        }, function (err) {
          if (isAuthError(err)) {
            pauseSync('Authentication expired');
            done();
            return;
          }
          enqueueRetry({
            type: 'remove',
            listId: target.listId,
            listName: target.listName,
            key: key,
            itemId: itemId
          });
          done();
        });
      }
    }

    // Fetch the server item_id for one element key (fixes 409 null-marks).
    // When onlyCheck is set, never creates — just resolves or drops the mark.
    function fetchItemId(listId, listName, key, callback, onlyCheck) {
      getListItems(listId, function (items) {
        var set = scrobElementSet(items);
        if (set[key]) {
          setItemId(listName, key, set[key].itemId);
        } else if (onlyCheck) {
          removeItemId(listName, key);
        } else {
          setItemId(listName, key, null);
        }
        if (callback) callback(set[key] ? set[key].itemId : null);
      }, function () {
        if (!onlyCheck) setItemId(listName, key, null);
        if (callback) callback(null);
      });
    }

    // ─── List resolution ──────────────────────────────────────

    // Resolve all syncable list names against Scrob server.
    // Creates missing lists. Returns map: { listName: listId }
    // Mapped keys use the mapped Scrob list; unmapped keys use [Lampa] lists.
    function resolveLists(callback) {
      getLists(function (serverLists) {
        // Index server lists by name and by id for O(1) lookup
        var byName = {};
        var byId = {};
        for (var i = 0; i < serverLists.length; i++) {
          byName[serverLists[i].name] = serverLists[i];
          byId[serverLists[i].id] = serverLists[i];
        }

        // Read current favorite to get all syncable keys
        var favorite = readFavorite();
        var keys = syncableKeys(favorite);
        var resolved = {};
        var pending = 0;
        brokenMappings = [];
        function done() {
          callback(resolved);
        }
        function checkDone() {
          pending--;
          if (pending <= 0) done();
        }

        // Resolve a canonical [Lampa] key: create list if missing
        function resolveDefaultKey(name) {
          if (byName[name]) {
            resolved[name] = byName[name].id;
            setList(name, byName[name].id);
            checkDone();
          } else {
            pending++;
            createList(name, function (created) {
              resolved[name] = created.id;
              setList(name, created.id);
              checkDone();
            }, function () {
              checkDone();
            });
          }
        }
        if (keys.length === 0) {
          done();
        } else {
          for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            var mapping = getMapping(key);
            if (mapping) {
              // Mapped key: resolve by list_id (fallback by list_name)
              var serverList = byId[mapping.list_id];
              if (!serverList && mapping.list_name) {
                serverList = byName[mapping.list_name];
              }
              if (serverList) {
                resolved[mapping.list_name || listNameForKey(key)] = serverList.id;
                setList(mapping.list_name || listNameForKey(key), serverList.id);
                checkDone();
              } else {
                // List not found on server — mark broken, skip
                brokenMappings.push(key);
                markBroken(key);
                checkDone();
              }
            } else {
              // Unmapped key: use default [Lampa] list
              var name = listNameForKey(key);
              if (name) {
                pending++;
                resolveDefaultKey(name);
              } else {
                checkDone();
              }
            }
          }

          // Also resolve any existing mirror lists (might have been added by
          // other clients) - but only if the name still maps to a CURRENT,
          // non-excluded key. mapping.js's EXCLUDED/CANONICAL can change
          // between plugin versions (`thrown` migrated fully off /lists in
          // §5.3.2; `watch` excluded as lampac's own dead category,
          // 2026-09-19, lists.md) - without this check, a mirror that still
          // remembers a list name from BEFORE either migration got it
          // silently RECREATED here (found live: forceSync() - which
          // clearInitialDone()s, forcing this whole block to re-run - from
          // lampac-export resurrected an already-deleted "[Lampa] Thrown"),
          // even though nothing in the current plugin ever pushes into it
          // again. Prune the stale entry instead of resurrecting it.
          var m = get();
          var mirrorNames = Object.keys(m.lists);
          var map = getMap();
          var mirrorChanged = false;
          for (var k = 0; k < mirrorNames.length; k++) {
            if (resolved[mirrorNames[k]]) continue;
            if (!resolveKeyForListName(mirrorNames[k], map, favorite)) {
              delete m.lists[mirrorNames[k]];
              mirrorChanged = true;
              continue;
            }
            pending++;
            resolveDefaultKey(mirrorNames[k]);
          }
          if (mirrorChanged) save(m);
          if (pending === 0) done();
        }
      }, function () {
        console.warn('ScrobSync', 'getLists failed');
        callback({});
      });
    }

    // Ensure a single list exists on server, merge into mirror, then re-run update.
    // Self-heal completion always triggers a повторний диф (converge), never just fills the mirror.
    function ensureList(name, lampaKey, callback) {
      function afterResolve(listId) {
        mergePair(lampaKey, listId, name, function () {
          update('self-heal');
          if (callback) callback();
        });
      }
      getLists(function (serverLists) {
        var byName = {};
        for (var i = 0; i < serverLists.length; i++) {
          byName[serverLists[i].name] = serverLists[i];
        }
        if (byName[name]) {
          setList(name, byName[name].id);
          afterResolve(byName[name].id);
        } else {
          createList(name, function (created) {
            setList(name, created.id);
            afterResolve(created.id);
          }, callback);
        }
      }, callback);
    }

    // ─── Converge: single update() for inbound WS + polling ───
    // Mirrors Account.Bookmarks.update(): fetch everything, converge every pair,
    // single favorite write, bump the Tracker stamp.

    function update(reason) {
      if (!running$2 || !hasSession()) return;
      if (updateRunning) {
        // Coalesce concurrent invalidations into one trailing run.
        if (updateTimer) clearTimeout(updateTimer);
        updateTimer = setTimeout(function () {
          updateTimer = null;
          update(reason);
        }, DEBOUNCE_MS);
        return;
      }
      updateRunning = true;
      // Own throttle/in-flight guard (pullDropped() itself) - independent of
      // updateRunning above, never blocks or is blocked by the /lists convergence.
      pullDropped();
      getLists(function (serverLists) {
        convergeAll(serverLists, function () {
          updateRunning = false;
        });
      }, function () {
        console.warn('ScrobSync', 'update getLists failed (' + (reason || 'poll') + ')');
        updateRunning = false;
      });
    }

    // Debounced invalidate entry used by the socket hub and the poll timer.
    function invalidate(reason) {
      if (!running$2 || !hasSession()) return;
      if (updateRunning) return;
      if (updateTimer) clearTimeout(updateTimer);
      updateTimer = setTimeout(function () {
        updateTimer = null;
        update(reason || 'invalidate');
      }, DEBOUNCE_MS);
    }
    function convergeAll(serverLists, done) {
      var favorite = readFavorite();
      var map = getMap();
      var m = get();

      // Index server lists by id.
      var byId = {};
      for (var i = 0; i < serverLists.length; i++) {
        if (serverLists[i].id != null) byId[serverLists[i].id] = serverLists[i];
      }

      // Build converge targets: every known pair exactly once.
      // Sources: mirror entries + mapstore mappings + local syncable keys.
      var targets = {}; // listName -> { listId, lampaKey }
      var mirrorNames = Object.keys(m.lists);
      for (var a = 0; a < mirrorNames.length; a++) {
        var entry = m.lists[mirrorNames[a]];
        if (entry && entry.list_id) {
          targets[mirrorNames[a]] = {
            listId: entry.list_id,
            lampaKey: resolveKeyForListId(entry.list_id, map, m.lists, favorite)
          };
        }
      }
      var mapKeys = Object.keys(map);
      for (var b = 0; b < mapKeys.length; b++) {
        var me = map[mapKeys[b]];
        if (me && me.list_id && byId[me.list_id]) {
          var mname = me.list_name || byId[me.list_id].name;
          if (!targets[mname]) targets[mname] = {
            listId: me.list_id,
            lampaKey: mapKeys[b]
          };
        }
      }
      var keys = syncableKeys(favorite);
      for (var c = 0; c < keys.length; c++) {
        var dname = listNameForKey(keys[c]);
        if (dname && !targets[dname] && byId && m.lists[dname]) {
          targets[dname] = {
            listId: m.lists[dname].list_id,
            lampaKey: keys[c]
          };
        }
      }
      var names = Object.keys(targets);
      var changed = false;
      function next(index) {
        if (index >= names.length) {
          if (changed) {
            writeFavorite(favorite);
            save(get());
          } else {
            // Still bump the Tracker stamp: converged-noop is a successful sync.
            save(get());
          }
          // Self-heal pass: brand-new local keys with no server list yet.
          selfHeal(favorite, map, function () {
            done();
          });
          return;
        }
        var listName = names[index];
        var target = targets[listName];
        if (!target.listId || !target.lampaKey) {
          next(index + 1);
          return;
        }
        convergeOneList(listName, target.listId, target.lampaKey, favorite, function (listChanged) {
          if (listChanged) changed = true;
          next(index + 1);
        });
      }
      if (names.length === 0) {
        selfHeal(favorite, map, function () {
          done();
        });
        return;
      }
      next(0);
    }

    // Converge one pair: pull remote→local and push local→remote, REST only.
    function convergeOneList(listName, listId, lampaKey, favorite, callback) {
      getListItems(listId, function (scrobItems) {
        var scrobSet = scrobElementSet(scrobItems);
        var localSet = localElementSet(favorite, lampaKey);
        var mirrorItems = (getList(listName) || {}).items || {};

        // Remote-first: additions and removals relative to the converged mirror.
        var toAddLocal = [];
        for (var sk in scrobSet) {
          if (typeof mirrorItems[sk] === 'undefined' && !localSet[sk]) {
            toAddLocal.push({
              key: sk,
              media: scrobSet[sk].media
            });
          } else if (typeof mirrorItems[sk] === 'undefined' && localSet[sk]) {
            // Both sides added the same item while offline — adopt the server item_id.
            setItemId(listName, sk, scrobSet[sk].itemId);
          }
        }
        var toRemoveLocal = [];
        for (var mk in mirrorItems) {
          if (!scrobSet[mk] && localSet[mk]) {
            // Gone on server but present locally: another device removed it — follow.
            // Our own queued removes carry a real item_id and win on push below.
            var stillQueued = false;
            for (var q = 0; q < pushQueue.length; q++) {
              if (pushQueue[q].lampaKey === lampaKey && pushQueue[q].method === 'remove') {
                var qp = parseElementKey(mk);
                if (String(pushQueue[q].card.id) === String(qp.tmdbId)) {
                  stillQueued = true;
                  break;
                }
              }
            }
            if (!stillQueued) toRemoveLocal.push(mk);
          } else if (!scrobSet[mk] && !localSet[mk]) {
            removeItemId(listName, mk);
          }
        }
        var listChanged = toAddLocal.length > 0 || toRemoveLocal.length > 0;
        for (var ai = 0; ai < toAddLocal.length; ai++) {
          var parsed = parseElementKey(toAddLocal[ai].key);
          applyRemoteAdd(favorite, lampaKey, parseInt(parsed.tmdbId, 10), toAddLocal[ai].media);
          setItemId(listName, toAddLocal[ai].key, scrobSet[toAddLocal[ai].key].itemId);
        }
        for (var ri = 0; ri < toRemoveLocal.length; ri++) {
          var rparsed = parseElementKey(toRemoveLocal[ri]);
          applyRemoteRemove(favorite, lampaKey, parseInt(rparsed.tmdbId, 10));
          removeItemId(listName, toRemoveLocal[ri]);
        }

        // Local-first: push what is local but missing on the server.
        var toPush = [];
        var freshLocal = localElementSet(favorite, lampaKey);
        for (var lk in freshLocal) {
          if (!scrobSet[lk]) toPush.push(lk);
        }
        if (toPush.length === 0) {
          callback(listChanged);
          return;
        }
        if (listChanged) listChanged = true;
        pushRestItems(listId, listName, toPush, 0, function () {
          callback(true);
        });
      }, function () {
        callback(false);
      });
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
      if (!running$2) {
        callback();
        return;
      }
      if (index >= items.length) {
        callback();
        return;
      }
      var parts = parseElementKey(items[index]);
      var tmdbId = parseInt(parts.tmdbId, 10);
      if (!tmdbId) {
        pushRestItems(listId, listName, items, index + 1, callback);
        return;
      }
      addListItem(listId, tmdbId, parts.mediaType, function (response) {
        setItemId(listName, items[index], response && response.id ? response.id : null);
        setTimeout(function () {
          pushRestItems(listId, listName, items, index + 1, callback);
        }, 150);
      }, function (err, status) {
        if (status === 409 || String(err).indexOf('409') !== -1) {
          fetchItemId(listId, listName, items[index], function () {
            setTimeout(function () {
              pushRestItems(listId, listName, items, index + 1, callback);
            }, 150);
          });
          return;
        }
        if (isAuthError(err)) {
          pauseSync('Authentication expired');
          callback();
          return;
        }
        enqueueRetry({
          type: 'add',
          listId: listId,
          listName: listName,
          key: items[index],
          tmdbId: tmdbId,
          mediaType: parts.mediaType
        });
        setTimeout(function () {
          pushRestItems(listId, listName, items, index + 1, callback);
        }, 150);
      });
    }

    // Self-heal: brand-new local keys with no server list yet → ensureList + re-diff.
    function selfHeal(favorite, map, done) {
      if (healing) {
        done();
        return;
      }
      var m = get();
      var missing = [];
      var keys = syncableKeys(favorite);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var mapped = map[key];
        if (mapped) {
          if (mapped.list_id && !m.lists[mapped.list_name]) {
            missing.push({
              key: key,
              name: mapped.list_name,
              listId: mapped.list_id
            });
          }
          continue;
        }
        var name = listNameForKey(key);
        if (name && !m.lists[name]) missing.push({
          key: key,
          name: name,
          listId: null
        });
      }
      if (missing.length === 0) {
        done();
        return;
      }
      healing = true;
      var pending = missing.length;
      function oneDone() {
        pending--;
        if (pending <= 0) {
          healing = false;
          done();
        }
      }
      for (var j = 0; j < missing.length; j++) {
        (function (entry) {
          if (entry.listId) {
            setList(entry.name, entry.listId);
            mergePair(entry.key, entry.listId, entry.name, oneDone);
          } else {
            ensureList(entry.name, entry.key, oneDone);
          }
        })(missing[j]);
      }
    }

    // ─── Initial sync (section 7) ─────────────────────────────

    function initialSync() {
      if (isInitialDone()) return;
      if (!hasSession()) return;
      console.log('ScrobSync', 'initial sync start');
      resolveLists(function (listMap) {
        var listNames = Object.keys(listMap);
        if (listNames.length === 0) {
          // If mirror is empty and this was a forced/first sync — report failure
          var m = get();
          if (Object.keys(m.lists).length === 0) {
            Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_lists_error'));
          } else {
            markInitialDone();
          }
          return;
        }
        // First converge goes through the single update() path.
        markInitialDone();
        update('initial');
      });
    }

    // ─── Retry queue ──────────────────────────────────────────
    // Shared by list push/pull (below) and any other module needing bounded
    // retry-with-backoff for a failed REST call (e.g. utils/sync/timeline.js's
    // session heartbeats) — enqueueRetry() is exported for that reuse. A
    // `type: 'custom'` op carries its own `run(done, fail)` closure instead of
    // engine-specific fields, so callers outside this file never need to know
    // about listId/listName/mirror.

    function enqueueRetry(op) {
      op.retries = (op.retries || 0) + 1;
      if (op.retries <= RETRY_MAX) {
        retryQueue.push(op);
      } else {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_lost'));
      }
    }
    function processRetryOp(op) {
      if (op.type === 'custom') {
        if (typeof op.run !== 'function') return;
        op.run(function done() {
          // Success — nothing more to do, already removed from the queue.
        }, function fail() {
          // Same pattern as 'add'/'remove' below: a retry-of-a-retry that
          // fails again is dropped silently past RETRY_MAX, not renotified —
          // enqueueRetry() itself already shows the Noty on the FIRST failure.
          op.retries = (op.retries || 0) + 1;
          if (op.retries <= RETRY_MAX) retryQueue.push(op);
        });
      } else if (op.type === 'add') {
        var parts = parseElementKey(op.key);
        var tmdbId = op.tmdbId || parseInt(parts.tmdbId, 10);
        var mediaType = op.mediaType || parts.mediaType;
        if (!tmdbId) return;
        addListItem(op.listId, tmdbId, mediaType, function (response) {
          setItemId(op.listName, op.key, response && response.id ? response.id : null);
        }, function (err, status) {
          if (status === 409 || String(err).indexOf('409') !== -1) {
            fetchItemId(op.listId, op.listName, op.key, null);
            return;
          }
          op.retries = (op.retries || 0) + 1;
          if (op.retries <= RETRY_MAX) retryQueue.push(op);
        });
      } else if (op.type === 'remove') {
        var itemId = op.itemId || getItemId(op.listName, op.key);
        if (!itemId) {
          // Resolve the real item_id first — deletes never use a null mark.
          fetchItemId(op.listId, op.listName, op.key, function (resolved) {
            var rid = resolved || getItemId(op.listName, op.key);
            if (rid) {
              deleteListItem(op.listId, rid, function () {
                removeItemId(op.listName, op.key);
              }, function () {
                op.retries = (op.retries || 0) + 1;
                if (op.retries <= RETRY_MAX) retryQueue.push(op);
              });
            } else {
              removeItemId(op.listName, op.key);
            }
          }, true);
          return;
        }
        deleteListItem(op.listId, itemId, function () {
          removeItemId(op.listName, op.key);
        }, function () {
          op.retries = (op.retries || 0) + 1;
          if (op.retries <= RETRY_MAX) retryQueue.push(op);
        });
      }
    }
    function startRetryLoop() {
      if (retryTimer) return;
      retryTimer = setInterval(function () {
        if (!running$2 || retryQueue.length === 0) return;
        var batch = retryQueue.splice(0, retryQueue.length);
        for (var i = 0; i < batch.length; i++) {
          processRetryOp(batch[i]);
        }
      }, RETRY_DELAY);
    }
    function stopRetryLoop() {
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = null;
      }
      retryQueue = [];
    }

    // ─── Inbound polling ────────────────────────

    function getPollInterval() {
      var val = Lampa.Storage.get('scrob_sync_interval', '30');
      return parseInt(val, 10) * 1000 || 30000;
    }
    function startPolling() {
      if (pollTimer) return;
      pollTimer = setInterval(function () {
        if (!running$2 || !hasSession()) return;
        // Socket-active mode invalidates via WS; polling is the fallback path.
        // Both funnel into the same update() — never two parallel writers.
        invalidate('poll');
      }, getPollInterval());
    }
    function stopPolling() {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    }

    // ─── Auth error handling ──────────────────────────────────

    function isAuthError(err) {
      if (!err) return false;
      var str = String(err);
      return str.indexOf('401') !== -1 || str.indexOf('403') !== -1;
    }
    function pauseSync(reason) {
      running$2 = false;
      stopPolling();
      stopRetryLoop();
      console.warn('ScrobSync', 'paused:', reason);
      Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_paused') + ': ' + reason);
    }

    // ─── Profile change handling ──────────────────────────────

    function setupProfileListener$1() {
      var lastProfileId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);
      profileListener$1 = function profileListener(e) {
        if (e.name === KEYS.ACTIVE_PROFILE_ID) {
          var newId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);
          if (newId !== lastProfileId) {
            lastProfileId = newId;
            // Stop, reset mirror + tracker stamp, re-sync for new profile.
            // Mirrors core: profile_select resets tracker time/version to force a dump.
            stop$1();
            reset();
            clearInitialDone();
            start$1();
          }
        }
      };
      Lampa.Storage.listener.follow('change', profileListener$1);
    }

    // ─── Socket lifecycle ─────────────────────────────────────

    // Socket open converges on a stale tracker snapshot (core socket open → update).
    function onSocketOpen() {
      if (!running$2) return;
      stopPolling();
      if (isStale(getPollInterval())) update('socket-open');
    }

    // Socket close resumes polling fallback.
    function onSocketClose() {
      if (!running$2) return;
      startPolling();
    }

    // Register WS invalidate handlers after start (core: socket open → update on stale).
    function bindSocketHandlers() {
      if (!activeSocket || handlersBound) return;
      bindUpdate(invalidate);
      bindDropSync(applyRemoteDropEvent);
      registerHandlers(activeSocket);
      if (activeSocket.onLifecycle) {
        activeSocket.onLifecycle('open', onSocketOpen);
        activeSocket.onLifecycle('close', onSocketClose);
      }
      handlersBound = true;
      // Already-connected socket with a stale tracker snapshot converges immediately.
      if (isSocketActive() && isStale(getPollInterval())) update('socket-open');
    }
    function unbindSocketHandlers() {
      if (activeSocket && handlersBound) {
        unregisterHandlers(activeSocket);
        if (activeSocket.offLifecycle) {
          activeSocket.offLifecycle('open', onSocketOpen);
          activeSocket.offLifecycle('close', onSocketClose);
        }
      }
      handlersBound = false;
      bindUpdate(null);
      bindDropSync(null);
    }

    // ─── Mapping merge (section 14.3) ─────────────────────────

    // Merge a single pair: union of local category and Scrob list, REST only.
    function mergePair(lampaKey, listId, listName, callback) {
      console.log('ScrobSync', 'merge pair', listName);
      getListItems(listId, function (scrobItems) {
        var favorite = readFavorite();
        var scrobSet = scrobElementSet(scrobItems);
        var localSet = localElementSet(favorite, lampaKey);

        // Push: localSet − scrobSet (REST only).
        var toAdd = [];
        for (var k in localSet) {
          if (!scrobSet[k]) toAdd.push(k);
        }

        // Pull: scrobSet − localSet (unified applicator).
        var toPull = [];
        for (var sk in scrobSet) {
          if (!localSet[sk]) toPull.push({
            key: sk,
            media: scrobSet[sk].media
          });
        }
        pushRestItems(listId, listName, toAdd, 0, function () {
          for (var p = 0; p < toPull.length; p++) {
            var parsed = parseElementKey(toPull[p].key);
            applyRemoteAdd(favorite, lampaKey, parseInt(parsed.tmdbId, 10), toPull[p].media);
            setItemId(listName, toPull[p].key, scrobSet[toPull[p].key].itemId);
          }
          // Adopt server item_ids for keys the push just created (409 or fresh).
          getListItems(listId, function (fresh) {
            var freshSet = scrobElementSet(fresh);
            for (var fk in freshSet) {
              setItemId(listName, fk, freshSet[fk].itemId);
            }
            writeFavorite(favorite);
            if (!getList(listName)) setList(listName, listId);
            save(get());
            callback();
          }, function () {
            writeFavorite(favorite);
            if (!getList(listName)) setList(listName, listId);
            save(get());
            callback();
          });
        });
      }, function () {
        callback();
      });
    }

    // Create a mapping: set mapping, remove orphaned [Lampa] mirror entry, merge pair
    function applyMapping(lampaKey, listId, listName, onDone, onFail) {
      console.log('ScrobSync', 'mapping apply', lampaKey);
      // Exclusivity check
      var success = setMapping(lampaKey, listId, listName);
      if (!success) {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_map_conflict'));
        return;
      }

      // Remove orphaned [Lampa] mirror entry for this key
      var defaultName = listNameForKey(lampaKey);
      if (defaultName) {
        var m = get();
        if (m.lists[defaultName]) {
          delete m.lists[defaultName];
          save(m);
        }
      }

      // Merge the mapped pair
      mergePair(lampaKey, listId, listName, function () {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_map_created'));
        if (onDone) onDone();
      });
    }

    // Remove mapping: delete mapping, remove mirror entry, reset default [Lampa] pair, reconcile
    function removeMappingFlow(lampaKey, onDone) {
      console.log('ScrobSync', 'mapping remove', lampaKey);
      var mapping = getMapping(lampaKey);
      if (!mapping) {
        if (onDone) onDone();
        return;
      }

      // Remove the mapping
      removeMapping(lampaKey);

      // Remove the mapped list's mirror entry
      var m = get();
      var mappedListName = mapping.list_name;
      if (mappedListName && m.lists[mappedListName]) {
        delete m.lists[mappedListName];
      }

      // Reset the default [Lampa] pair's mirror entry to trigger full reconcile
      var defaultName = listNameForKey(lampaKey);
      if (defaultName && m.lists[defaultName]) {
        // Clear items so reconcile does a full diff
        m.lists[defaultName].items = {};
      }
      save(m);

      // Re-resolve the default [Lampa] list and reconcile via the single update() path
      getLists(function (serverLists) {
        var byName = {};
        for (var i = 0; i < serverLists.length; i++) {
          byName[serverLists[i].name] = serverLists[i];
        }
        if (defaultName && byName[defaultName]) {
          setList(defaultName, byName[defaultName].id);
          update('mapping-remove');
        }
        if (onDone) onDone();
      }, function () {
        if (onDone) onDone();
      });
    }

    // ─── Public API ───────────────────────────────────────────

    // Start the sync engine
    function start$1() {
      if (running$2) return;
      if (!hasSession()) {
        console.warn('ScrobSync', 'start skipped: no session');
        return;
      }
      if (!Lampa.Storage.get('scrob_sync_enabled')) {
        console.warn('ScrobSync', 'start skipped: sync disabled');
        return;
      }

      // Check for blocking conflicts
      var conflicts = detectConflicts();
      for (var i = 0; i < conflicts.length; i++) {
        if (conflicts[i].type === 'cub_sync') {
          console.warn('ScrobSync', 'start skipped: CUB conflict');
          Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_blocked_cub'));
          return;
        }
      }
      running$2 = true;

      // Outbound: Favorite add/remove + state:changed bridge (custom keys), guarded.
      if (Lampa.Favorite && Lampa.Favorite.listener) {
        if (!Lampa.Favorite.listener.has('add', onFavoriteAdd)) {
          Lampa.Favorite.listener.follow('add,added', onFavoriteAdd);
        }
        if (!Lampa.Favorite.listener.has('remove', onFavoriteRemove)) {
          Lampa.Favorite.listener.follow('remove', onFavoriteRemove);
        }
      }
      if (Lampa.Listener && !socketPollBound) {
        socketPollBound = true;
        Lampa.Listener.follow('state:changed', onStateChanged);
      }
      if (Lampa.Listener && !dropActivityBound) {
        dropActivityBound = true;
        Lampa.Listener.follow('activity', onDropSyncActivity);
      }

      // Socket handlers register after start; polling stops once WS is live.
      bindSocketHandlers();
      if (isSocketActive()) stopPolling();else startPolling();
      setupProfileListener$1();
      startRetryLoop();

      // Initial sync if no mirror exists
      var m = get();
      if (Object.keys(m.lists).length === 0) {
        initialSync();
      } else if (isStale(getPollInterval())) {
        update('start-stale');
      }

      // Dropped-status bulk pull (§5.3.2) - independent of the /lists mirror
      // above (dropped_shows/dropped_movies aren't a list), idempotent, so
      // safe to run unconditionally on every start() (login, sync toggle,
      // profile switch) same as timeline.js's own pullContinueWatching().
      // force=true: a lifecycle event, not rapid navigation - bypasses the
      // throttle so a profile switch always gets a fresh pull immediately.
      pullDropped(true);
      console.log('ScrobSync', 'started', {
        mirrorLists: Object.keys(get().lists).length
      });
    }

    // Stop the sync engine
    function stop$1() {
      running$2 = false;
      console.log('ScrobSync', 'stopped');
      unbindSocketHandlers();
      activeSocket = null;
      if (Lampa.Favorite && Lampa.Favorite.listener) {
        Lampa.Favorite.listener.remove('add', onFavoriteAdd);
        Lampa.Favorite.listener.remove('added', onFavoriteAdd);
        Lampa.Favorite.listener.remove('remove', onFavoriteRemove);
      }
      if (Lampa.Listener && typeof Lampa.Listener.remove === 'function' && socketPollBound) {
        Lampa.Listener.remove('state:changed', onStateChanged);
        socketPollBound = null;
      }
      if (Lampa.Listener && typeof Lampa.Listener.remove === 'function' && dropActivityBound) {
        Lampa.Listener.remove('activity', onDropSyncActivity);
        dropActivityBound = false;
      }
      if (profileListener$1) {
        Lampa.Storage.listener.remove('change', profileListener$1);
        profileListener$1 = null;
      }
      if (outboundTimer) {
        clearTimeout(outboundTimer);
        outboundTimer = null;
      }
      if (updateTimer) {
        clearTimeout(updateTimer);
        updateTimer = null;
      }
      updateRunning = false;
      pushRunning = false;
      pushQueue = [];

      // Dropped-status throttle state (§5.3.2) - reset so a stale timestamp
      // from the profile/session just left doesn't linger into the next one
      // (start()'s own pullDropped(true) bypasses it anyway, but a mid-flight
      // request from the old profile shouldn't keep dropPullInFlight stuck).
      lastDropPullAt = 0;
      dropPullInFlight = false;
      stopPolling();
      stopRetryLoop();
    }

    // Force a manual sync (for settings UI "Sync Now" button)
    function forceSync() {
      if (!running$2) return;
      clearInitialDone();
      initialSync();
      pullDropped(true);
    }

    // Get sync status for display
    function getStatus() {
      var m = get();
      var listCount = Object.keys(m.lists).length;
      var itemCount = 0;
      var names = Object.keys(m.lists);
      for (var i = 0; i < names.length; i++) {
        itemCount += Object.keys(m.lists[names[i]].items).length;
      }
      return {
        running: running$2,
        listCount: listCount,
        itemCount: itemCount,
        lastSync: m.updated_at,
        conflicts: detectConflicts(),
        brokenMappings: brokenMappings.slice()
      };
    }

    // Scrob custom categories registry.
    // Device-local storage: scrob_custom_categories (no profile suffix).
    // Structure: [{ key: 'my_watchlist', title: 'My Watchlist' }]

    var STORAGE_KEY = 'scrob_custom_categories';

    // Parse stored array from storage
    function parse(raw) {
      if (!raw || raw === 'none') return [];
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw);
        } catch (e) {
          return [];
        }
      }
      return Array.isArray(raw) ? raw : [];
    }

    // Get all custom categories
    function getAll() {
      return parse(Lampa.Storage.get(STORAGE_KEY, 'none'));
    }

    // Add a custom category (dedup by key)
    function add(key, title) {
      var list = getAll();
      for (var i = 0; i < list.length; i++) {
        if (list[i].key === key) return;
      }
      list.push({
        key: key,
        title: title
      });
      Lampa.Storage.set(STORAGE_KEY, list);
    }

    // Get a single custom category by key
    function getByKey(key) {
      var list = getAll();
      for (var i = 0; i < list.length; i++) {
        if (list[i].key === key) return list[i];
      }
      return null;
    }

    // Fixed palette for deterministic letter avatar colors.
    var COLORS = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ff9800'];

    // Deterministic color from username hash (pattern: GramLink sdk/avatars.js avatarColor).
    function avatarColor(name) {
      if (!name) return COLORS[0];
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return COLORS[Math.abs(hash) % COLORS.length];
    }

    // Avatar HTML: server image when avatar_url is set, uppercase first letter otherwise.
    // Image URL needs ?api_key= because <img> cannot send headers.
    function avatarHtml(user) {
      var server = serverUrl();
      // Active profile's own key when one is set (see the matching note on
      // apiKeyHeaders() in utils/api.js), otherwise the signed-in user's own.
      var ownKey = Lampa.Storage.get(KEYS.ACTIVE_API_KEY) || Lampa.Storage.get(KEYS.OWN_API_KEY) || '';
      if (user && user.avatar_url && server) {
        var sep = user.avatar_url.indexOf('?') >= 0 ? '&' : '?';
        return '<img class="scrob-avatar" src="' + server + '/api/proxy' + user.avatar_url + sep + 'api_key=' + encodeURIComponent(ownKey) + '">';
      }

      // display_name: the only name-like field this plugin can ever resolve
      // for a session with no real login behind it (see storage.js's
      // getOwnProfileInfo()) - /auth/me (username) is Bearer-only.
      var name = user && (user.username || user.display_name) || '?';
      var letter = name.charAt(0).toUpperCase();
      return '<div class="scrob-avatar scrob-avatar--letter" style="background:' + avatarColor(name) + '">' + letter + '</div>';
    }

    // Soft refresh of the active page (pattern: docs/gramsync/profile_levende.js softRefresh).
    function softRefresh() {
      var activity = Lampa.Activity.active();
      if (activity.page) activity.page = 1;
      Lampa.Activity.replace(activity);
      activity.outdated = false;
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
    function restoreIsolatedData(targetId) {
      var currentId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);

      // Backup: one combined object under backupKey(currentId), not one flat
      // key per ISOLATED_KEY.
      if (currentId && currentId != targetId) {
        var outgoing = {};
        ISOLATED_KEYS.forEach(function (key) {
          var value = Lampa.Storage.get(key, 'none');
          if (value != 'none') outgoing[key] = value;
        });
        Lampa.Storage.set(backupKey(currentId), outgoing);
      }

      // Restore: a malformed/corrupted backup for this one profile falls
      // through to defaults for every key instead of taking anything else
      // down with it.
      var saved = Lampa.Storage.get(backupKey(targetId), 'none');
      if (saved === 'none' || _typeof(saved) !== 'object' || saved === null) saved = {};
      ISOLATED_KEYS.forEach(function (key) {
        Lampa.Storage.set(key, key in saved ? saved[key] : defaultValue(key));
      });
    }

    // Switch active profile:
    // 1. backup/restore isolated keys (current → backup, target → restore-or-default)
    // 2. activate target credentials
    // 3. re-read timeline/favorite into UI
    // 4. soft refresh the active page
    function switchProfile(targetId) {
      var currentId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);
      var list = getProfiles();
      var target = null;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id == targetId) target = list[i];
      }
      if (!target || target.id == currentId) return false;
      restoreIsolatedData(target.id);

      // 2. Activate target credentials — API key BEFORE profile id. Lampa.Storage.set()
      // dispatches its 'change' event synchronously (no microtask/setTimeout), and the
      // sync engine's setupProfileListener() reacts to ACTIVE_PROFILE_ID changing by
      // immediately restarting sync (utils/sync/engine.js). If the profile id were set
      // first, that restart - and the initial sync it kicks off - would fire while
      // ACTIVE_API_KEY still held the OUTGOING profile's key, one line away from being
      // updated: the very first request under the "new" profile would run under the
      // old one's identity.
      Lampa.Storage.set(KEYS.ACTIVE_API_KEY, target.api_key);
      Lampa.Storage.set(KEYS.ACTIVE_PROFILE_ID, target.id);

      // 3. Re-read data into UI
      Lampa.Timeline.read();
      Lampa.Favorite.read();

      // 4. Soft refresh of the active page
      softRefresh();
      return true;
    }

    // Scrob sync — playback progress: push (session start/heartbeat/complete)
    // AND pull (server → Lampa.Timeline). See SYNC-ARCHITECTURE-PLAN.md §5.1/§5.2.
    //
    // ─── Push ───────────────────────────────────────────────────
    // Ports the proven session model from the old standalone scrob.js plugin,
    // against the same backend session endpoints this plugin's api.js now wraps
    // (POST /history/session/start, PATCH /history/session/{key},
    // POST .../complete, DELETE .../{key}).
    //
    // Design points carried over deliberately (see the old scrob.js, function
    // onPlayerStart() onward, for the original reasoning and live-tested fixes):
    // - "Watched" is decided ONLY on player destroy (real exit), never mid-
    //   playback — otherwise a title reads as watched on the server while the
    //   user is still actually watching (e.g. sitting through end credits).
    // - A generation counter (session.gen) guards against a slow /session/start
    //   response landing AFTER a newer video has already started — the stale
    //   response just deletes its own orphaned server-side session instead of
    //   overwriting the new one's key.
    // - heartbeatInFlight coalesces rapid pause/resume into the LATEST position
    //   only (network delivery order between two independent PATCH requests is
    //   not guaranteed) instead of firing one PATCH per event.
    // - completeSession() defers behind an in-flight heartbeat rather than racing
    //   it — an out-of-order "playing" heartbeat arriving after /complete would
    //   silently reopen the session on the server.
    //
    // ─── Pull ───────────────────────────────────────────────────
    // On-demand (this file): a movie/show's own full card opening triggers
    // GET /history/watch-status, written into Timeline via pullWriteTimeline().
    // Bulk (continue-watching, at login/profile-switch/start) is a separate,
    // later addition reusing the same pullWriteTimeline()/buildHash()/
    // resolveDuration() helpers. Prefetch (§5.2.7, further below) is a third,
    // wider bulk pull over the user's own configurable Favorite lists (not just
    // continue-watching) - fills in Timeline for ongoing-show detection
    // (continue_watch's own filter) before the user opens any card by hand.
    // - LWW against the local Timeline entry's own `updated` timestamp — never
    //   blindly overwrites a possibly-newer local value (§5.2.3).
    // - `syncingFromServer` guards onTimelineUpdate() against mistaking a pull's
    //   own Timeline.update() echo for real local playback, and pullWriteTimeline()
    //   additionally refuses to touch the hash of whatever is actively playing
    //   right now — both needed because the active session's own local
    //   `road.updated` only refreshes every ~2min (Lampa's natural cycle), not
    //   every heartbeat, so LWW alone doesn't protect it.
    // - "Watched" with no real progress writes percent:100 (matching how Lampa's
    //   own "Просмотрено" menu action marks a file watched, not a Favorite('viewed')
    //   toggle — that's a different, whole-card status, see §5.2.4/§5.3).
    //
    // Deliberately NOT in this module (handled elsewhere):
    // - Favorite('viewed') — the whole-card "переглянуто" status (mutually
    //   exclusive with look/scheduled/continued/thrown, §5.3/Гілка 8) is a
    //   completely separate mechanism, synced generically through
    //   mapping.js/engine.js's own list-sync, never touching Lampa.Timeline/
    //   WatchEvent at all. NOT to be confused with the manual per-episode
    //   Timeline marks (season-episode__viewed clicks outside the player)
    //   THIS module does handle, further below (§5.2.6, Гілка 6).
    // - Grace-period undo window and a persisted offline queue — failed
    //   heartbeat/complete calls are retried via this plugin's own list-sync
    //   retry queue (engine.js's enqueueRetry) instead of a second, separate
    //   Lampa.Storage-backed queue.

    var WATCHED_THRESHOLD_PERCENT$1 = 90;
    var HEARTBEAT_THROTTLE_MS = 15000; // periodic heartbeat driven by Timeline updates
    var SAME_STATE_GUARD_MS = 3000; // native pause/playing: ignore immediate repeats
    var SEEK_GUARD_MS = 1500; // native seeked: ignore right after another heartbeat
    // External player (SYNC-ARCHITECTURE-PLAN.md §5.1.1): Android's own result-handling
    // loop fires all of a playlist's Timeline.update() calls back-to-back, same JS tick
    // range - not gated by our own network calls (those go out separately, asynchronously,
    // and don't feed back into this timer). This only needs to bridge the gap between
    // Android-side calls themselves, which is normally single-digit milliseconds. Used
    // to re-arm the timer on EACH incoming Timeline.update while a burst is landing -
    // never at launch, see EXTERNAL_CONTEXT_SAFETY_MS below for why.
    var EXTERNAL_CONTEXT_RESET_MS = 1000;
    // The ONLY timer armed at 'external' launch time (onExternalPlayerStart) - has to
    // outlive the entire external viewing session (could be hours), not just a burst of
    // updates. Android deliberately keeps this WebView's JS timers running while the
    // external player has focus (MainActivity.kt: "suppress WebView pauseTimers while
    // our external player is open"), so a short debounce here would fire mid-playback
    // and silently drop every subsequent Timeline.update for that whole session - a
    // confirmed bug, not hypothetical (EXTERNAL_CONTEXT_RESET_MS was wrongly reused here
    // originally). Pure safety net for "the external player never returns any result at
    // all" - normal exits are covered by the short reset above once updates start
    // arriving, well before this ever fires.
    var EXTERNAL_CONTEXT_SAFETY_MS = 6 * 60 * 60 * 1000;
    var running$1 = false;
    var listenersBound = false;
    var profileListener = null; // Profile change listener reference (engine.js has the same field, same reason)

    // Set only while pull-code (below) is writing a server-sourced value into
    // Lampa.Timeline — guards onTimelineUpdate() against mistaking that echo
    // for real local playback (SYNC-ARCHITECTURE-PLAN.md §5.2.3). Same pattern
    // as engine.js's own `received` flag for Favorite writes, and the old
    // scrob.js's `isSyncingNow`.
    var syncingFromServer = false;

    // Single persistent session slot — mutated in place, never reassigned, so a
    // stray closure holding a reference to `session` always sees the latest
    // state (matches the original plugin's module-level `session` object).
    // `session.card` falsy means "no active player session" everywhere below.
    var session = {
      card: null,
      isSeries: false,
      season: null,
      episode: null,
      expectedHash: null,
      duration: 0,
      lastPercent: 0,
      lastTimeSeconds: 0,
      expectedStartPercent: 0,
      lastUpdateTime: 0,
      completed: false,
      lastReportedState: null,
      playbackErrored: false,
      heartbeatInFlight: false,
      pendingHeartbeat: null,
      key: null,
      started: false,
      destroyedBeforeStart: false,
      gen: 0
    };

    // Set only while completeSession() is deferred behind an in-flight
    // heartbeat — module-level (not session.*) because it must still resolve
    // correctly even if resetSessionState() runs before that heartbeat returns.
    var pendingCompleteAfterHeartbeat = null;

    // External player context (§5.1.1) — deliberately separate from `session`
    // above, not reused: `session.expectedHash`/`session.key`/`started` etc are
    // all internal-player-specific (one fixed title, one long-lived server
    // session). An external playback burst can touch MANY different episodes'
    // hashes in one go (playlist auto-next, already resolved on the Android
    // side - see module header) and never has a session to keep open; each
    // Timeline.update is buffered as its own self-contained snapshot instead
    // (pendingItems - processed as one batch once the whole burst settles,
    // §5.1.1 backdating design, not fired individually as they arrive).
    var externalContext = {
      active: false,
      isSeries: false,
      originalName: null,
      card: null,
      handledHashes: {},
      startedAt: null,
      // Date.now() at 'external' launch — hard lower bound for backdated watched_at (see flushExternalBatch())
      pendingItems: [] // buffered {identity, percent, time, runtimeMinutes} - processed as one batch at burst-end, not fired per-event
    };
    var externalResetTimer = null;
    function resetExternalContext() {
      if (externalResetTimer) clearTimeout(externalResetTimer);
      externalResetTimer = null;
      externalContext.active = false;
      externalContext.isSeries = false;
      externalContext.originalName = null;
      externalContext.card = null;
      externalContext.handledHashes = {};
      externalContext.startedAt = null;
      externalContext.pendingItems = [];
    }

    // Flush-then-reset - the only ways a burst legitimately ends: the debounce
    // timer settling (no more updates arrived), the 6h safety timeout, or a real
    // internal player start winning over a stale external context (§5.1.1 point
    // 6). All three used to just discard via resetExternalContext() directly -
    // discarding here would silently drop real, already-confirmed watched
    // episodes sitting in pendingItems. NOT used by stop() (profile switch/
    // logout/sync-disable) - that stays a bare discard, since firing async
    // requests while credentials may be mid-swap risks sending under the wrong
    // profile.
    function flushAndResetExternalContext() {
      flushExternalBatch();
      resetExternalContext();
    }

    // Processes the whole buffered burst at once (§5.1.1, backdating design):
    // items arrive in true chronological viewing order, so pendingItems[0] is
    // the earliest. A lone watched episode (k<=1) is sent as-is (no explicit
    // watched_at - a real exit is "now" regardless of the last mile of network
    // latency). k>1 is a real playlist batch - split it evenly across
    // [externalContext.startedAt, now] rather than guessing from each episode's
    // own duration (rejected: playback speed/seeking make duration an unreliable
    // clock - see live discussion 2026-09-14), which has a hard floor at the
    // real player-launch time so it can never backdate into the past before
    // viewing even started.
    function flushExternalBatch() {
      // Reached via externalResetTimer's plain setTimeout (debounce or the 6h
      // safety net), not a Lampa listener re-evaluated against the CURRENT
      // `running` on every call - stop()'s own resetExternalContext() clears
      // that timer, but only if stop() runs to completion before it fires.
      // Checked directly here too (found live 2026-09-18: external-player
      // progress/watched marks kept reaching the server for a short window
      // after toggling sync off, mid-playlist).
      if (!running$1) {
        externalContext.pendingItems = [];
        return;
      }
      var items = externalContext.pendingItems;
      if (!items || !items.length) return;
      var watched = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].percent >= WATCHED_THRESHOLD_PERCENT$1) watched.push(items[i]);else pushExternalProgressSnapshot(items[i].identity, items[i].runtimeMinutes, items[i].time);
      }
      var k = watched.length;
      if (k === 0) return;

      // Captured NOW, synchronously, BEFORE the async now-playing lookup below -
      // flushAndResetExternalContext() runs resetExternalContext() (which nulls
      // externalContext.startedAt) immediately after this function returns, not
      // after getNowPlaying()'s response. Reading externalContext.startedAt
      // later, inside the async callback, would race that reset and fall back
      // to Date.now() evaluated AT RESPONSE TIME - making elapsed (below) ~0 and
      // every episode in the batch land on the same timestamp (live-tested
      // regression 2026-09-16, introduced together with the getNowPlaying
      // consolidation this same lookup is part of).
      var startedAt = externalContext.startedAt || Date.now();
      var now = Date.now();

      // One shared now-playing snapshot for the whole batch (live discussion
      // 2026-09-15) instead of a separate GET /history/now-playing per watched
      // episode - pushExternalWatchedMark() below matches each item against
      // this same snapshot locally (findActiveSessionKey()) rather than
      // re-resolving it itself. A lookup failure degrades to "no sessions"
      // (matches resolveActiveSession()'s own error handling elsewhere) rather
      // than dropping the whole batch.
      getNowPlaying(true, function (sessions) {
        sendWatchedBatch(watched, sessions, startedAt, now);
      }, function (err) {
        console.warn('ScrobTimeline', 'now-playing lookup failed for batch reconciliation, proceeding without it', err);
        sendWatchedBatch(watched, [], startedAt, now);
      });
    }
    function sendWatchedBatch(watched, sessions, startedAt, now) {
      var k = watched.length;
      if (k === 1) {
        pushExternalWatchedMark(watched[0].identity, undefined, findActiveSessionKey(sessions, watched[0].identity));
        return;
      }
      var elapsed = Math.max(0, now - startedAt);
      for (var w = 0; w < k; w++) {
        var watchedAt = startedAt + (w + 1) / k * elapsed;
        pushExternalWatchedMark(watched[w].identity, watchedAt, findActiveSessionKey(sessions, watched[w].identity));
      }
    }
    function resetSessionState() {
      session.key = null;
      session.card = null;
      session.season = null;
      session.episode = null;
      session.expectedHash = null;
      session.duration = 0;
      session.lastPercent = 0;
      session.lastTimeSeconds = 0;
      session.expectedStartPercent = 0;
      session.completed = false;
      session.lastReportedState = null;
      session.playbackErrored = false;
      session.heartbeatInFlight = false;
      session.pendingHeartbeat = null;
      session.started = false;
      session.destroyedBeforeStart = false;
    }

    // ─── Identification ────────────────────────────────────────

    // Direct season/episode fields on the Player 'start' event data, when the
    // source already provides them (the common case).
    function extractSeasonEpisode(obj) {
      if (!obj) return {};
      var season = obj.season_number || obj.season || obj.seasonNumber || obj.s;
      var episode = obj.episode_number || obj.episode || obj.episodeNumber || obj.e;
      return {
        season: season,
        episode: episode
      };
    }

    // Fallback when the source gives no direct season/episode fields: brute-
    // force the same hash formula Lampa's own Lampa.Timeline uses internally
    // (Utils.hash on [season, separator, episode, originalName]) against the
    // hash Lampa already computed for this file — this only has to search,
    // never guess the formula itself. Same technique the old scrob.js and the
    // third-party TraktTV plugin both independently arrived at (see
    // LAMPA-TRACKING-REFERENCE.md §4.1.3/§4.2.3).
    function resolveSeasonEpisode(hash, originalName) {
      if (!hash || !originalName) return {};
      for (var s = 1; s <= 40; s++) {
        var sep = s > 10 ? ':' : '';
        for (var e = 1; e <= 1500; e++) {
          if (String(Lampa.Utils.hash([s, sep, e, originalName].join(''))) === String(hash)) {
            return {
              season: s,
              episode: e
            };
          }
        }
      }
      return {};
    }

    // Best-effort runtime guess for the /session/start payload — corrected
    // later from the real file duration via heartbeat's `runtime` field
    // (backend/routers/history.py update_manual_session()) once the native
    // 'durationchange' event or a Timeline tick reveals it. null (not a guessed
    // constant) when genuinely nothing is known yet — the server keeps its own
    // runtime as null in that case too, until a real value arrives.
    function resolveRuntimeMinutes(card, timeline, isSeries) {
      if (timeline && timeline.duration > 0) return Math.round(timeline.duration / 60);
      if (timeline && timeline.time > 0 && timeline.percent > 0) {
        return Math.max(1, Math.round(timeline.time / (timeline.percent / 100) / 60));
      }
      if (card && card.runtime) return card.runtime;
      if (card && card.episode_run_time && card.episode_run_time.length) return card.episode_run_time[0];
      return null;
    }

    // ─── Pull: server → Lampa.Timeline (SYNC-ARCHITECTURE-PLAN.md §5.2) ────────

    // Forward direction of resolveSeasonEpisode() above — same hash formula,
    // building it from known identity instead of searching for one.
    function buildHash(isSeries, originalName, season, episode) {
      if (!originalName) return null;
      if (!isSeries) return Lampa.Utils.hash(originalName);
      var sep = season > 10 ? ':' : '';
      return Lampa.Utils.hash([season, sep, episode, originalName].join(''));
    }

    // Duration fallback chain for a pulled item — a manual "watched" mark can
    // leave both the real playback duration AND the TMDB runtime unknown
    // (§5.2.4). 0 (not a guessed constant) in that case — the real value, once
    // the native player reports it, is what corrects this going forward.
    function resolveDuration(item) {
      if (item.duration) return item.duration;
      if (item.runtime_minutes) return item.runtime_minutes * 60;
      return 0;
    }

    // Single write path for both pull triggers (on-demand and bulk) — LWW
    // against the local Timeline entry, guarded against corrupting whatever
    // title is actively playing right now (§5.2.3). `item` is the normalized
    // shape both callers build from their own source's response fields:
    // { isSeries, originalName, season, episode, watched, percent, time,
    //   duration, runtimeMinutes, updatedAt }
    //
    // updatedAt may come from a naive-UTC server timestamp with no offset (some
    // backend serializations still omit it, e.g. /history/continue-watching's
    // watched_at) - a JS Date parses an offset-less string as LOCAL time (ECMA-262
    // Date Time String Format), which would skew this exact LWW comparison by the
    // client's own UTC offset. Same fix the Astro dashboard already applies
    // (frontend/src/pages/history.astro etc: `new Date(watched_at + 'Z')`), just
    // done defensively so a string that already carries an offset isn't doubled.
    function parseServerTime(str) {
      if (!str) return 0;
      var s = String(str);
      var hasOffset = /Z$|[+-]\d\d:?\d\d$/.test(s);
      return new Date(hasOffset ? s : s + 'Z').getTime() || 0;
    }

    // `force` (§5.2.6, "Закрити") bypasses the LWW guard entirely — needed
    // because Lampa's own manual uncheck already stamped `updated: Date.now()`
    // locally, synchronously, before this ever runs, which would otherwise
    // always look "newer" than the server and silently block the restore. When
    // forced, the write itself is stamped `Date.now()` too (not `serverTime`)
    // so it correctly stays "newest" for any later LWW comparison.
    function pullWriteTimeline(item, force) {
      var hash = buildHash(item.isSeries, item.originalName, item.season, item.episode);
      if (!hash) return;
      if (session.card && String(hash) === String(session.expectedHash)) return; // never clobber the active session

      var local = Lampa.Timeline.view(hash);
      var localTime = local && local.updated || 0;
      var serverTime = parseServerTime(item.updatedAt);
      if (!force && localTime && serverTime <= localTime) return; // local is not older — nothing to do

      var duration = resolveDuration({
        duration: item.duration,
        runtime_minutes: item.runtimeMinutes,
        media_type: item.isSeries ? 'episode' : 'movie'
      });
      var percent = item.watched ? 100 : item.percent || 0;
      var time = item.watched ? duration : item.time || 0;
      console.log('ScrobTimeline', 'pull write', {
        hash: hash,
        percent: percent,
        watched: item.watched,
        force: !!force
      });
      syncingFromServer = true;
      Lampa.Timeline.update({
        hash: hash,
        percent: percent,
        time: time,
        duration: duration,
        received: true,
        updated: force ? Date.now() : serverTime || Date.now()
      });
      syncingFromServer = false;
    }

    // ─── Player lifecycle ──────────────────────────────────────

    function onPlayerStart(data) {
      if (!running$1) return;

      // Guard against a stale external-player context outliving a real internal
      // session that starts AND finishes inside the debounce window (§5.1.1,
      // point 6) - unconditional, every internal start wins over any pending
      // external context regardless of its own state. Flush first (not a bare
      // reset) - any already-confirmed watched episodes buffered in
      // pendingItems are real and must not be silently dropped just because
      // the internal player happened to start before the debounce window closed.
      flushAndResetExternalContext();
      var card = data && data.card || Lampa.Activity.active() && (Lampa.Activity.active().card_data || Lampa.Activity.active().card || Lampa.Activity.active().movie);
      if (!card) {
        console.warn('ScrobTimeline', 'player start: no card found, skipping', data);
        return;
      }
      var se = extractSeasonEpisode(data);
      var timeline = data && data.timeline;
      var hash = timeline && timeline.hash;
      if (hash && (!se.season || !se.episode)) {
        var origName = card.original_name || card.original_title || card.title || card.name;
        if (origName) se = resolveSeasonEpisode(hash, origName);
      }
      var isSeries = !!(card.number_of_seasons || card.first_air_date || card.type === 'tv' || se && se.season > 0);
      var gen = (session.gen || 0) + 1;
      resetSessionState();
      session.gen = gen;
      session.card = card;
      session.isSeries = isSeries;
      session.season = isSeries ? se.season || 1 : null;
      session.episode = isSeries ? se.episode || 1 : null;
      session.expectedHash = hash || null;
      session.duration = timeline && timeline.duration || 0;
      session.lastPercent = timeline && timeline.percent || 0;
      session.expectedStartPercent = timeline && timeline.percent || 0;
      session.lastUpdateTime = Date.now();
      console.log('ScrobTimeline', 'player start', {
        id: card.id,
        isSeries: isSeries,
        season: session.season,
        episode: session.episode,
        title: card.title || card.name,
        hash: session.expectedHash,
        gen: session.gen
      });
      startScrobSession();
    }

    // External player (§5.1.1) — Lampa fires 'external', not 'start', when the
    // video is handed off to an outside app (Just+/MX Player and similar on
    // Android; confirmed cross-platform - same event on iOS/macOS/webOS too,
    // see app.min.js's Player module). No session.card gets set here on
    // purpose: there is no long-lived internal session to track, just identity
    // context for whatever Timeline.update() calls come back later (real
    // device/duration verified only for Android - see §5.1.1 for the source
    // references this was confirmed against).
    function onExternalPlayerStart(data) {
      if (!running$1) return;

      // Flush first (not a bare reset) - mirrors the same guard onPlayerStart()
      // already has above. If 'external' fires again before the previous
      // context's debounce/safety timer settled (re-entering the external
      // player, picking a different title while one was still pending, etc.),
      // overwriting externalContext's fields directly would silently drop any
      // already-confirmed watched episodes still sitting in pendingItems.
      flushAndResetExternalContext();
      var card = data && data.card || Lampa.Activity.active() && (Lampa.Activity.active().card_data || Lampa.Activity.active().card || Lampa.Activity.active().movie);
      if (!card) {
        console.warn('ScrobTimeline', 'external player start: no card found, skipping', data);
        return;
      }
      var se = extractSeasonEpisode(data);
      var isSeries = !!(card.number_of_seasons || card.first_air_date || card.type === 'tv' || se && se.season > 0);
      var originalName = card.original_name || card.original_title || card.title || card.name;
      externalContext.active = true;
      externalContext.isSeries = isSeries;
      externalContext.originalName = originalName || null;
      externalContext.card = card;
      externalContext.handledHashes = {};
      externalContext.startedAt = Date.now();
      externalContext.pendingItems = [];
      if (externalResetTimer) clearTimeout(externalResetTimer);
      externalResetTimer = setTimeout(flushAndResetExternalContext, EXTERNAL_CONTEXT_SAFETY_MS);
      console.log('ScrobTimeline', 'external player start', {
        id: card.id,
        isSeries: isSeries,
        title: originalName
      });
    }
    function onTimelineUpdate(e) {
      if (!running$1 || syncingFromServer) return;
      if (!e || !e.data) return;
      if (!session.card) {
        // No internal player session — either an external-player result
        // (§5.1.1, handled below) or a manual click elsewhere with no
        // active player of any kind (§5.2.6: season-episode__viewed checkbox
        // or "Просмотрено" outside the player).
        if (externalContext.active) handleExternalTimelineUpdate(e);else handleManualTimelineUpdate(e);
        return;
      }
      var origName = session.card.original_name || session.card.original_title || session.card.title || session.card.name;
      var isSeries = !!(session.card.original_name || session.season || session.episode);
      if (isSeries) {
        if (session.expectedHash) {
          if (e.data.hash !== session.expectedHash) return;
        } else {
          var se = resolveSeasonEpisode(e.data.hash, origName);
          if (!se.season || !se.episode || se.season !== session.season || se.episode !== session.episode) return;
        }
      } else {
        var expectedHash = Lampa.Utils.hash(session.card.original_title || session.card.title);
        if (String(expectedHash) !== String(e.data.hash)) return;
      }
      var road = e.data.road || {};
      var percent = parseFloat(road.percent || 0);
      var time = parseFloat(road.time || 0);
      if (road.duration && !session.duration) session.duration = road.duration;
      session.lastPercent = percent;
      session.lastTimeSeconds = time;
      if (!session.started || !session.key || session.completed) return;

      // Threshold is deliberately NOT checked here — see module header.
      if (Date.now() - session.lastUpdateTime > HEARTBEAT_THROTTLE_MS && !session.playbackErrored) {
        sendSessionHeartbeat(time, 'playing');
      }
    }

    // Resolves a Timeline.update() hash against the identity captured at
    // 'external' launch (§5.1.1, points 1-2) — season/episode search for a
    // show (the hash can belong to ANY episode of it, not just the one that
    // started the playlist), or a direct hash check for a movie. null when the
    // hash doesn't belong to this context's title at all.
    function resolveExternalIdentity(hash) {
      var card = externalContext.card;
      if (!card) return null;
      if (externalContext.isSeries) {
        var se = resolveSeasonEpisode(hash, externalContext.originalName);
        if (!se.season || !se.episode) return null;
        return {
          isSeries: true,
          seriesTmdbId: card.id,
          season: se.season,
          episode: se.episode
        };
      }
      var expectedHash = Lampa.Utils.hash(card.original_title || card.title);
      if (String(expectedHash) !== String(hash)) return null;
      return {
        isSeries: false,
        tmdbId: card.id
      };
    }

    // External player (§5.1.1) — no session.card, so onTimelineUpdate() routes
    // here instead of the internal-player branch above. Each call is a
    // self-contained snapshot (no start→heartbeat→destroy lifecycle - there is
    // no 'destroy'-equivalent for an external player at all).
    // Buffers into externalContext.pendingItems instead of firing immediately -
    // how many items belong to this burst (and thus whether any backdating is
    // even needed) is only knowable once it settles (§5.1.1, live discussion
    // 2026-09-14). Actual network calls happen in flushExternalBatch(), once,
    // when the debounce window below finally closes.
    function handleExternalTimelineUpdate(e) {
      var hash = e.data.hash;
      if (!hash || externalContext.handledHashes[hash]) return; // point 7: dedupe within one burst

      var identity = resolveExternalIdentity(hash);
      if (!identity) return; // some other title's Timeline tick, not this context's

      externalContext.handledHashes[hash] = true;
      // Still mid-burst (or a fresh one) — extend the debounce window (point 4).
      if (externalResetTimer) clearTimeout(externalResetTimer);
      externalResetTimer = setTimeout(flushAndResetExternalContext, EXTERNAL_CONTEXT_RESET_MS);
      var road = e.data.road || {};
      var percent = parseFloat(road.percent || 0);
      var time = parseFloat(road.time || 0);
      var duration = parseFloat(road.duration || 0);
      console.log('ScrobTimeline', 'external timeline update', {
        hash: hash,
        percent: percent,
        time: time,
        duration: duration,
        identity: identity
      });
      if (percent < 1.5) return; // nothing meaningful watched, same threshold as onPlayerDestroy()

      externalContext.pendingItems.push({
        identity: identity,
        percent: percent,
        time: time,
        runtimeMinutes: duration > 0 ? Math.round(duration / 60) : null
      });
    }

    // Fully watched (§5.1.1, point 5) — one lightweight POST /history instead of
    // a full start→update→complete cycle. Deliberately doesn't carry runtime
    // (WatchEventCreate has no such field) - accepted tradeoff for the common
    // "batch of finished playlist episodes" case, see §5.1.1 point 5.
    //
    // Bug found live 2026-09-13 (same class as §5.2.6's manual-mark session-
    // reconcile fix): a title partially watched externally earlier (exited at
    // e.g. 30%, §5.1.1 point 3's full start→update cycle - a real, still-open
    // PlaybackSession left paused server-side) and then finished in a LATER
    // external-player viewing landed here with a bare POST /history - creating
    // a completed WatchEvent while leaving that first session dangling in
    // "paused" forever (in_progress AND watched at once). A found session's
    // PlaybackSession+PlaybackProgress must be cleared, exactly like a real exit
    // would - only fall back to the plain POST when no session is open for this
    // title at all.
    // `watchedAt` optional (Date/timestamp) - set by flushExternalBatch() when
    // this episode was part of a real multi-episode batch (backdated, evenly
    // spread from player-launch time); omitted for a lone watched episode
    // (server stamps "now", same as before this batch-backdating design).
    //
    // Live discussion 2026-09-15: this used to call completeSession() on a found
    // session, but that endpoint always stamps its own "now" server-side with no
    // override accepted - exactly the case that made the reconciled episode of a
    // batch land with the WRONG (latest, not backdated) watched_at and sort out
    // of order (live-tested bug, episode 401 of show 122612). Fixed client-side,
    // no backend change: deleteSession() ALREADY clears both PlaybackSession and
    // PlaybackProgress for this title (backend/routers/history.py
    // stop_manual_session() - verified against source), and addHistoryEvent()
    // (POST /history) ALREADY does everything completeSession() did (WatchEvent
    // creation, rewatch bookkeeping, external-tracker push) plus honors
    // `watchedAt` and additionally emits watch_event.created (completeSession()
    // doesn't). So: delete the stale session/progress first, THEN send the plain
    // mark with the correct watchedAt - same net server state, two existing,
    // unmodified endpoints, strictly sequential (delete before post, not
    // parallel) so the stale progress is never left behind. A delete failure
    // (including 404 - already gone) is NOT fatal to this: the history write is
    // what actually matters, so it proceeds regardless of how the delete went.
    // `sessionKey` is pre-resolved by the caller (sendWatchedBatch(), against
    // the one shared getNowPlaying() snapshot taken for the whole batch - see
    // flushExternalBatch()) rather than looked up here per-call.
    function pushExternalWatchedMark(identity, watchedAt, sessionKey) {
      var tmdbId = identity.isSeries ? identity.seriesTmdbId : identity.tmdbId;
      var mediaType = identity.isSeries ? 'episode' : 'movie';
      var episode = identity.isSeries ? {
        seriesTmdbId: identity.seriesTmdbId,
        season: identity.season,
        episode: identity.episode
      } : null;
      if (!sessionKey) {
        sendPlainExternalWatchedMark(tmdbId, mediaType, episode, identity, watchedAt);
        return;
      }
      deleteSession(sessionKey, function () {
        console.log('ScrobTimeline', 'external watched mark: discarded stale active session', sessionKey);
        sendPlainExternalWatchedMark(tmdbId, mediaType, episode, identity, watchedAt);
      }, function (err, status) {
        if (status === 404) {
          console.log('ScrobTimeline', 'external watched mark: session already gone (404)', sessionKey);
        } else {
          console.warn('ScrobTimeline', 'external watched mark: failed to discard stale session, queued for retry', err);
          enqueueRetry({
            type: 'custom',
            run: function run(done, fail) {
              deleteSession(sessionKey, done, function (e2, s2) {
                if (s2 === 404) {
                  done();
                  return;
                }
                fail();
              });
            }
          });
        }
        // The stale session/progress cleanup is best-effort - the history
        // write below is what actually matters and must go out either way.
        sendPlainExternalWatchedMark(tmdbId, mediaType, episode, identity, watchedAt);
      });
    }
    function sendPlainExternalWatchedMark(tmdbId, mediaType, episode, identity, watchedAt) {
      addHistoryEvent(tmdbId, mediaType, true, episode, watchedAt, function () {
        console.log('ScrobTimeline', 'external watched mark sent', identity, watchedAt ? 'watchedAt=' + new Date(watchedAt).toISOString() : '');
      }, function (err, status) {
        // 409 (upstream dedup, #390) means a WatchEvent already exists for
        // this title within the server's dedup window - the mark IS recorded,
        // not lost. Treat like success, not a failure to retry (retrying would
        // just keep getting the same 409 and end in a false "sync lost" noty).
        if (status === 409) {
          console.log('ScrobTimeline', 'external watched mark already recorded (409 dedup)', identity);
          return;
        }
        console.warn('ScrobTimeline', 'failed to send external watched mark, queued for retry', err);
        enqueueRetry({
          type: 'custom',
          run: function run(done, fail) {
            addHistoryEvent(tmdbId, mediaType, true, episode, watchedAt, done, function (e2, s2) {
              if (s2 === 409) {
                done();
                return;
              }
              fail();
            });
          }
        });
      });
    }

    // Exited mid-episode via the external player (1.5%-90%, §5.1.1 point 3) —
    // full start→(pause heartbeat, or delete if it somehow lands under 1.5%
    // after all) cycle, same thresholds as onPlayerDestroy(), so a resumable
    // PlaybackProgress bookmark is preserved exactly like a real internal exit.
    function pushExternalProgressSnapshot(identity, runtimeMinutes, timeSeconds) {
      var payload = {
        tmdb_id: identity.isSeries ? null : identity.tmdbId,
        media_type: identity.isSeries ? 'episode' : 'movie',
        title: externalContext.card && (externalContext.card.title || externalContext.card.name) || 'Unknown',
        runtime: runtimeMinutes,
        reset: false
      };
      if (identity.isSeries) {
        payload.show_tmdb_id = identity.seriesTmdbId;
        payload.season_number = identity.season;
        payload.episode_number = identity.episode;
      }
      startSession(payload, function (res) {
        if (!res || !res.session_key) {
          console.warn('ScrobTimeline', 'external session/start response had no session_key', res);
          return;
        }
        var key = res.session_key;
        updateSession(key, {
          progress_seconds: Math.round(timeSeconds),
          state: 'paused'
        }, function () {
          console.log('ScrobTimeline', 'external progress snapshot sent', key);
        }, function (err) {
          console.warn('ScrobTimeline', 'failed to send external progress, queued for retry', err);
          enqueueRetry({
            type: 'custom',
            run: function run(done, fail) {
              updateSession(key, {
                progress_seconds: Math.round(timeSeconds),
                state: 'paused'
              }, done, fail);
            }
          });
        });
      }, function (err) {
        console.warn('ScrobTimeline', 'external session/start request failed', err);
      });
    }

    // ─── Manual marks outside the player (§5.2.6) ──────────────
    // Episodes only — a movie has no comparable per-item checkbox UI (its only
    // manual action is "Скинути прогрес перегляду", a different, unanalyzed
    // action outside this scope). Fires when Lampa.Timeline.listener('update')
    // lands with no internal session (session.card) AND no external-player
    // context active — the only remaining source is a real local click on
    // season-episode__viewed (or "Просмотрено" on a file).

    // Resolves the clicked hash against whatever full-card screen is currently
    // open — same resolveSeasonEpisode() search onPlayerStart()/onExternalPlayerStart()
    // already use, just without a session/externalContext to anchor identity to.
    function resolveManualIdentity(hash) {
      var active = Lampa.Activity.active();
      if (!active) return null;
      var card = active.card_data || active.card || active.movie;
      if (!card || !card.id) return null;
      var isSeries = !!(card.number_of_seasons || card.first_air_date || card.type === 'tv');
      if (!isSeries) return null; // movies out of scope, see module header above

      var originalName = card.original_name || card.original_title || card.title || card.name;
      var se = resolveSeasonEpisode(hash, originalName);
      if (!se.season || !se.episode) return null;
      return {
        seriesTmdbId: card.id,
        season: se.season,
        episode: se.episode
      };
    }
    function handleManualTimelineUpdate(e) {
      var hash = e.data.hash;
      if (!hash) return;
      var identity = resolveManualIdentity(hash);
      if (!identity) return; // not this screen's episode, or a movie — nothing to do

      var road = e.data.road || {};
      var percent = parseFloat(road.percent || 0);
      if (percent >= WATCHED_THRESHOLD_PERCENT$1) pushManualWatchedMark(identity);else handleManualUnmark(identity);
    }

    // `identity` is either the episode shape ({seriesTmdbId, season, episode},
    // §5.2.6 manual marks — `isSeries` absent there entirely, movies are out of
    // scope for that flow) or the external-player shape ({isSeries, tmdbId} for
    // a movie / {isSeries, seriesTmdbId, season, episode} for an episode, §5.1.1)
    // — `isSeries === false` is checked explicitly (not falsy) so the absent-
    // field manual-mark identity still always falls into the episode branch.
    function sessionMatchesIdentity(sessionEntry, identity) {
      var media = sessionEntry.media || {};
      return identity.isSeries === false ? media.type === 'movie' && String(media.tmdb_id) === String(identity.tmdbId) : media.type === 'episode' && String(media.show_tmdb_id) === String(identity.seriesTmdbId) && String(media.season_number) === String(identity.season) && String(media.episode_number) === String(identity.episode);
    }

    // Finds a still-active PlaybackSession for this exact title, if any
    // (GET /history/now-playing, include_hidden — a reconciliation lookup for
    // one specific title, not the homepage's own dropped-aware display list).
    // Bug found by live test 2026-09-13: a session left paused server-side
    // (e.g. the player was never properly exited) is invisible to §5.2.6's
    // WatchEvent-only item-events check — POST /history alone (mark) leaves it
    // dangling ("watched" in history AND still "in progress" in now-playing),
    // and unchecking has nothing to reconcile against at all if no WatchEvent
    // ever existed. Callback receives the session_key, or null when none found.
    function resolveActiveSession(identity, callback) {
      getNowPlaying(true, function (sessions) {
        callback(findActiveSessionKey(sessions, identity));
      }, function (err) {
        console.warn('ScrobTimeline', 'now-playing lookup failed', err);
        callback(null);
      });
    }

    // Same matching, against an already-fetched snapshot — used by
    // sendWatchedBatch() so a whole external-player batch shares ONE
    // getNowPlaying() call instead of one per item (see flushExternalBatch()).
    function findActiveSessionKey(sessions, identity) {
      for (var i = 0; i < sessions.length; i++) {
        if (sessionMatchesIdentity(sessions[i], identity)) return sessions[i].session_key;
      }
      return null;
    }

    // "Positive" direction. When a PlaybackSession is still active for this
    // episode, complete THAT (POST /history/session/{key}/complete) instead —
    // it creates the same completed WatchEvent AND atomically clears both
    // PlaybackSession and PlaybackProgress in one server-side transaction,
    // exactly like a real player exit would (§5.1). Only when no session is
    // active does this fall back to the simple, session-less POST /history.
    function pushManualWatchedMark(identity) {
      resolveActiveSession(identity, function (sessionKey) {
        if (!sessionKey) {
          sendPlainManualWatchedMark(identity);
          return;
        }
        completeSession(sessionKey, function () {
          console.log('ScrobTimeline', 'manual watched mark: completed active session', sessionKey);
        }, function (err, status) {
          if (status === 404) {
            // Session was already gone server-side (closed elsewhere) by the
            // time this landed - the user still explicitly asked to mark it
            // watched, so that intent has to go through some other way now.
            console.log('ScrobTimeline', 'manual watched mark: session already gone (404), falling back to plain mark', sessionKey);
            sendPlainManualWatchedMark(identity);
            return;
          }
          console.warn('ScrobTimeline', 'manual watched mark: completeSession failed, queued for retry', err);
          enqueueRetry({
            type: 'custom',
            run: function run(done, fail) {
              completeSession(sessionKey, done, function (e2, s2) {
                if (s2 === 404) {
                  done();
                  sendPlainManualWatchedMark(identity);
                  return;
                }
                fail();
              });
            }
          });
        });
      });
    }
    function sendPlainManualWatchedMark(identity) {
      var episode = {
        seriesTmdbId: identity.seriesTmdbId,
        season: identity.season,
        episode: identity.episode
      };
      addHistoryEvent(identity.seriesTmdbId, 'episode', true, episode, null, function () {
        console.log('ScrobTimeline', 'manual watched mark sent', identity);
      }, function (err, status) {
        // 409 dedup (upstream #390) - already recorded, not a real failure.
        if (status === 409) {
          console.log('ScrobTimeline', 'manual watched mark already recorded (409 dedup)', identity);
          return;
        }
        console.warn('ScrobTimeline', 'failed to send manual watched mark, queued for retry', err);
        enqueueRetry({
          type: 'custom',
          run: function run(done, fail) {
            addHistoryEvent(identity.seriesTmdbId, 'episode', true, episode, null, done, function (e2, s2) {
              if (s2 === 409) {
                done();
                return;
              }
              fail();
            });
          }
        });
      });
    }

    // Full (not relative) date for the "Видалити перегляд" menu label.
    function formatManualDate(isoString) {
      var time = parseServerTime(isoString);
      if (!time) return '';
      var d = new Date(time);
      function pad(n) {
        return n < 10 ? '0' + n : '' + n;
      }
      return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
    }

    // "Unmark" direction — never deletes anything silently (see §5.2.6 module
    // notes). Lampa already unchecked the box locally by the time this runs, so
    // the first step is always a real lookup of what the server actually knows
    // about this episode.
    //
    // Independent of the WatchEvent menu below: an active PlaybackSession
    // (a title left paused/playing server-side, e.g. never properly exited) has
    // no WatchEvent at all, so it would never surface through item-events - but
    // "unwatched" still has to mean "not in progress either" (bug found by live
    // test 2026-09-13). discardActiveSession() reconciles that unconditionally,
    // in parallel with the WatchEvent lookup, not gated by its result.
    function discardActiveSession(identity) {
      resolveActiveSession(identity, function (sessionKey) {
        if (!sessionKey) return;
        deleteSession(sessionKey, function () {
          console.log('ScrobTimeline', 'manual unmark: discarded active session', sessionKey);
        }, function (err) {
          console.warn('ScrobTimeline', 'manual unmark: failed to discard session, queued for retry', err);
          enqueueRetry({
            type: 'custom',
            run: function run(done, fail) {
              deleteSession(sessionKey, done, fail);
            }
          });
        });
      });
    }
    function handleManualUnmark(identity) {
      discardActiveSession(identity);
      Lampa.Loading.start(function () {
        Lampa.Loading.stop();
      });
      getItemEvents({
        mediaType: 'episode',
        seriesTmdbId: identity.seriesTmdbId,
        season: identity.season,
        episode: identity.episode
      }, function (res) {
        Lampa.Loading.stop();
        var events = res && res.events || [];
        // Server has nothing for this episode at all — nothing to reconcile,
        // the local uncheck already matches the server's (empty) state.
        if (!events.length) return;
        showUnmarkMenu(identity, events, res.media_id);
      }, function (err) {
        Lampa.Loading.stop();
        console.warn('ScrobTimeline', 'item-events request failed', err);
      });
    }

    // Re-runs the on-demand pull (§5.2.5) for exactly this episode's hash, with
    // `force: true` — restores whatever the server actually has (100%, 31%, or
    // nothing) instead of guessing, and bypasses the LWW guard that Lampa's own
    // synchronous local uncheck would otherwise trip (see pullWriteTimeline()).
    function restoreTimelineFromServer(identity) {
      getWatchStatus(identity.seriesTmdbId, 'tv', function (items) {
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (item.media_type === 'episode' && item.season_number === identity.season && item.episode_number === identity.episode) {
            applyWatchStatusItem(item, true);
            return;
          }
        }
        // Nothing server-side for this episode — Lampa's own local uncheck
        // (0%/unwatched) already matches that; nothing to force.
      }, function (err) {
        console.warn('ScrobTimeline', 'restore after "close" failed', err);
      });
    }

    // Four-item menu, exact order per §5.2.6. `resolved` guards onBack against
    // re-running "Закрити"'s restore after items 2-4 already took a real,
    // server-affecting action — Lampa.Select.show's onBack firing behavior
    // after a plain onSelect isn't confirmed one way or the other, so this
    // guard is needed regardless. "Закрити" itself is NOT guarded by it (its
    // own restore is idempotent — a redundant second run is harmless).
    //
    // `enabled` + Controller.toggle(enabled) in every branch (found missing by
    // live test 2026-09-13 — real app.min.js's own Select.show() call sites,
    // e.g. player quality/flow menus, always do this): selecting an item only
    // hides the select box (bind$7()'s goclose(), app.min.js:12848) - it does
    // NOT detach Controller's 'select' group (toggle$c(), app.min.js:12917),
    // which stays bound (back/left → close$a) until something explicitly
    // switches the Controller elsewhere. Without this, the box is invisible but
    // still "focused" - the user sees a dead/phantom screen, and every further
    // back-press still reaches close$a() → onBack() → another restore call.
    function showUnmarkMenu(identity, events, mediaId) {
      var resolved = false;
      var enabled = Lampa.Controller.enabled().name;
      var removeDate = formatManualDate(events[0].watched_at);
      var items = [{
        title: Lampa.Lang.translate('scrob_unmark_close'),
        action: 'close'
      }, {
        title: Lampa.Lang.translate('scrob_unmark_remove_event') + (removeDate ? ' (' + removeDate + ')' : ''),
        action: 'remove_event'
      }, {
        title: Lampa.Lang.translate('scrob_unmark_rewatch'),
        action: 'rewatch'
      }];
      if (events.length > 1) {
        items.push({
          title: Lampa.Lang.translate('scrob_unmark_delete_all') + ' (' + events.length + ')',
          action: 'delete_all'
        });
      }
      Lampa.Select.show({
        title: Lampa.Lang.translate('scrob_unmark_menu_title'),
        items: items,
        onSelect: function onSelect(item) {
          if (item.action === 'close') {
            restoreTimelineFromServer(identity);
            Lampa.Controller.toggle(enabled);
            return;
          }
          resolved = true;
          if (item.action === 'remove_event') {
            removeHistoryEvent(events[0].id, function () {
              console.log('ScrobTimeline', 'manual unmark: removed event', events[0].id);
            }, function (err) {
              console.warn('ScrobTimeline', 'manual unmark: remove event failed', err);
            });
          } else if (item.action === 'rewatch') {
            startRewatch(identity.seriesTmdbId, identity.season, identity.episode, function () {
              console.log('ScrobTimeline', 'manual unmark: rewatch started', identity);
            }, function (err) {
              console.warn('ScrobTimeline', 'manual unmark: rewatch start failed', err);
            });
          } else if (item.action === 'delete_all') {
            deleteHistoryItem(mediaId, 'episode', function () {
              console.log('ScrobTimeline', 'manual unmark: deleted all history', mediaId);
            }, function (err) {
              console.warn('ScrobTimeline', 'manual unmark: delete all failed', err);
            });
          }
          Lampa.Controller.toggle(enabled);
        },
        onBack: function onBack() {
          if (!resolved) restoreTimelineFromServer(identity);
          Lampa.Controller.toggle(enabled);
        }
      });
    }
    function onPlayerDestroy() {
      if (!running$1) return;
      if (!session.card) return;
      if (!hasSession()) {
        resetSessionState();
        return;
      }
      if (!session.key) {
        // /session/start hasn't resolved yet — startScrobSession()'s own
        // response handler will discard the session once it arrives.
        session.destroyedBeforeStart = true;
        return;
      }
      if (session.completed) {
        resetSessionState();
        return;
      }
      console.log('ScrobTimeline', 'player destroy, final percent: ' + session.lastPercent + '%');
      if (session.lastPercent >= WATCHED_THRESHOLD_PERCENT$1) {
        completeScrobSession();
        resetSessionState();
      } else if (session.lastPercent < 1.5) {
        console.log('ScrobTimeline', 'exited early (<1.5%), deleting session', session.key);
        deleteSession(session.key, function () {}, function (err) {
          console.warn('ScrobTimeline', 'failed to delete session', err);
        });
        resetSessionState();
      } else {
        sendSessionHeartbeat(session.lastTimeSeconds, 'paused', function () {
          resetSessionState();
        });
      }
    }

    // ─── Native <video> events — immediate reaction, not waiting for the next
    // rare Timeline update (same technique used by the old scrob.js and the
    // third-party TraktTV plugin, LAMPA-TRACKING-REFERENCE.md §4.1.1/§4.2.1).

    function onNativeVideoStateChange(e, state) {
      if (!running$1) return;
      if (!session.card || !session.key || session.completed) return;
      var target = e && e.target;
      if (!target || target.tagName !== 'VIDEO') return;
      var sameStateRecently = session.lastReportedState === state && Date.now() - session.lastUpdateTime < SAME_STATE_GUARD_MS;
      if (sameStateRecently) return;
      var currentTime = typeof target.currentTime === 'number' ? target.currentTime : session.lastTimeSeconds;
      // A resumed position hasn't caught up to Lampa's own expected resume point
      // yet — a bare 0 here would otherwise erase the already-saved progress.
      if (currentTime === 0 && session.expectedStartPercent > 1.5) return;
      session.lastTimeSeconds = currentTime;
      session.lastReportedState = state;
      trackNativePositionAndHeartbeat(currentTime, state);
    }
    function trackNativePositionAndHeartbeat(currentTime, state) {
      if (session.duration > 0) session.lastPercent = currentTime / session.duration * 100;
      sendSessionHeartbeat(currentTime, state);
    }
    function onNativeVideoPause(e) {
      onNativeVideoStateChange(e, 'paused');
    }
    function onNativeVideoPlaying(e) {
      session.playbackErrored = false;
      onNativeVideoStateChange(e, 'playing');
    }
    function onNativeVideoSeeked(e) {
      if (!running$1) return;
      if (!session.card || !session.key || session.completed) return;
      if (Date.now() - session.lastUpdateTime < SEEK_GUARD_MS) return;
      var target = e && e.target;
      if (!target || target.tagName !== 'VIDEO' || typeof target.currentTime !== 'number') return;
      var currentTime = target.currentTime;
      if (currentTime === 0 && session.expectedStartPercent > 1.5) return;
      var state = target.paused ? 'paused' : 'playing';
      session.lastTimeSeconds = currentTime;
      session.lastReportedState = state;
      trackNativePositionAndHeartbeat(currentTime, state);
    }
    function onNativeVideoError(e) {
      if (!running$1) return;
      var target = e && e.target;
      if (!target || target.tagName !== 'VIDEO') return;
      if (!session.card || !session.key || session.completed) return;
      session.playbackErrored = true;
      onNativeVideoStateChange(e, 'paused');
    }
    function onNativeVideoDurationChange(e) {
      if (!running$1) return;
      var target = e && e.target;
      if (!target || target.tagName !== 'VIDEO') return;
      if (!session.card || !session.key || session.completed) return;
      if (session.duration > 0) return;
      var duration = target.duration;
      if (!duration || !isFinite(duration) || duration <= 0) return;
      session.duration = duration;
      var currentTime = typeof target.currentTime === 'number' ? target.currentTime : session.lastTimeSeconds;
      trackNativePositionAndHeartbeat(currentTime, target.paused ? 'paused' : 'playing');
    }

    // ─── Server calls ──────────────────────────────────────────

    function startScrobSession() {
      var startGen = session.gen;
      var isSeries = session.isSeries;
      var runtimeMinutes = resolveRuntimeMinutes(session.card, {
        duration: session.duration,
        time: session.lastTimeSeconds,
        percent: session.lastPercent
      });
      var payload = {
        tmdb_id: isSeries ? null : session.card.id,
        media_type: isSeries ? 'episode' : 'movie',
        title: session.card.title || session.card.name || 'Unknown',
        runtime: runtimeMinutes,
        reset: false
      };
      if (isSeries) {
        payload.show_tmdb_id = session.card.id;
        payload.season_number = session.season;
        payload.episode_number = session.episode;
      }
      console.log('ScrobTimeline', 'sending session start', payload);
      startSession(payload, function (res) {
        if (session.gen !== startGen) {
          // A newer video already started while this was in flight — this
          // response belongs to nobody now, just clean up its orphan.
          console.log('ScrobTimeline', 'stale session/start response (gen mismatch), discarding', res);
          if (res && res.session_key) deleteSession(res.session_key, function () {}, function () {});
          return;
        }
        if (!res || !res.session_key) {
          console.warn('ScrobTimeline', 'session/start response had no session_key', res);
          return;
        }
        if (session.destroyedBeforeStart) {
          console.log('ScrobTimeline', 'player destroyed before session_key arrived, discarding', res.session_key);
          deleteSession(res.session_key, function () {}, function () {});
          resetSessionState();
          return;
        }
        session.key = res.session_key;
        session.started = true;
        console.log('ScrobTimeline', 'session started, key: ' + session.key);
      }, function (err) {
        console.warn('ScrobTimeline', 'session/start request failed', err);
        if (session.gen === startGen) resetSessionState();
      });
    }

    // Called ONLY from onPlayerDestroy (a real exit) — see module header.
    function completeScrobSession() {
      if (!session.key || session.completed) return;
      session.completed = true;
      var key = session.key;
      if (session.heartbeatInFlight) {
        pendingCompleteAfterHeartbeat = key;
        return;
      }
      fireCompleteRequest(key);
    }
    function fireCompleteRequest(key) {
      console.log('ScrobTimeline', 'completing session', key);
      completeSession(key, function () {
        console.log('ScrobTimeline', 'session completed successfully', key);
      }, function (err, status) {
        // The server's own background auto-completer (90%+, independent of
        // this client) may have already completed & removed the session.
        if (status === 404) {
          console.log('ScrobTimeline', 'session already completed server-side (404)', key);
          return;
        }
        console.warn('ScrobTimeline', 'failed to complete session, queued for retry', err);
        enqueueRetry({
          type: 'custom',
          run: function run(done, fail) {
            completeSession(key, done, function (e2, s2) {
              if (s2 === 404) {
                done();
                return;
              }
              fail();
            });
          }
        });
      });
    }
    function sendSessionHeartbeat(timeSeconds, state, callback) {
      if (!session.key) return;

      // Strict in-order delivery: two independent parallel PATCH requests are
      // not guaranteed to arrive in the order they were sent (long buffering
      // often makes the player emit pause/playing back-to-back). Coalesce into
      // the LATEST known position/state instead of firing one per event.
      if (session.heartbeatInFlight) {
        session.pendingHeartbeat = {
          timeSeconds: timeSeconds,
          state: state,
          callback: callback,
          sessionKey: session.key
        };
        return;
      }
      session.heartbeatInFlight = true;
      session.lastUpdateTime = Date.now();
      session.lastReportedState = state || 'playing';
      var key = session.key;
      var payload = {
        progress_seconds: Math.round(timeSeconds),
        state: state || 'playing'
      };
      // The real file duration, once known — corrects the server-side percent
      // calculation away from whatever guess was sent at session start.
      if (session.duration > 0) payload.runtime = Math.round(session.duration / 60);
      function afterSettled() {
        session.heartbeatInFlight = false;
        var pending = session.pendingHeartbeat;
        session.pendingHeartbeat = null;

        // A /complete deferred because THIS heartbeat was in flight takes
        // priority — the session is already done, a stale pending
        // intermediate heartbeat no longer means anything.
        if (pendingCompleteAfterHeartbeat && pendingCompleteAfterHeartbeat === key) {
          var completeKey = pendingCompleteAfterHeartbeat;
          pendingCompleteAfterHeartbeat = null;
          fireCompleteRequest(completeKey);
          return;
        }
        // sessionKey may have changed (a new session started) while this was
        // in flight — a stale pending call from the PREVIOUS session is
        // simply dropped.
        if (pending && pending.sessionKey === session.key) {
          sendSessionHeartbeat(pending.timeSeconds, pending.state, pending.callback);
        }
      }
      console.log('ScrobTimeline', 'sending heartbeat', key, payload);
      updateSession(key, payload, function () {
        console.log('ScrobTimeline', 'heartbeat sent successfully');
        if (callback) callback();
        afterSettled();
      }, function (err, status) {
        if (status === 404) {
          // Already gone server-side (likely the same background auto-
          // completer) — mark completed locally so further pause/playing/
          // seeked don't keep hitting the same 404 through end credits.
          console.log('ScrobTimeline', 'session already gone server-side (404), marking completed locally');
          if (session.key === key) session.completed = true;
          if (callback) callback();
          afterSettled();
          return;
        }
        console.warn('ScrobTimeline', 'failed to send heartbeat, queued for retry', err);
        enqueueRetry({
          type: 'custom',
          run: function run(done, fail) {
            updateSession(key, payload, done, function (e2, s2) {
              if (s2 === 404) {
                done();
                return;
              }
              fail();
            });
          }
        });
        if (callback) callback();
        afterSettled();
      });
    }

    // Normalizes one GET /history/watch-status item into pullWriteTimeline()'s
    // shape — kept separate so the bulk pull (continue-watching, different
    // field names) can build the same shape from its own response later.
    function applyWatchStatusItem(item, force) {
      pullWriteTimeline({
        isSeries: item.media_type === 'episode',
        originalName: item.original_name,
        season: item.season_number,
        episode: item.episode_number,
        watched: !!item.watched,
        percent: item.percent,
        time: item.time,
        duration: item.duration,
        runtimeMinutes: item.runtime_minutes,
        updatedAt: item.updated_at
      }, force);
    }

    // Normalizes one GET /history/continue-watching item (format_event() shape:
    // nested `media`, progress fields at the top level) into
    // pullWriteTimeline()'s shape. Always partial progress, never "watched" —
    // /continue-watching is sourced from PlaybackProgress alone, which only
    // ever holds the 5%-90% in-progress window (backend/routers/history.py).
    function applyContinueWatchingItem(item) {
      var media = item.media || {};
      var isSeries = media.type === 'episode';
      pullWriteTimeline({
        isSeries: isSeries,
        originalName: isSeries ? media.show_original_title : media.original_title,
        season: media.season_number,
        episode: media.episode_number,
        watched: false,
        // format_event() passes PlaybackProgress.progress_percent through as
        // a 0-1 fraction, unlike /history/watch-status's own 0-100 `percent`.
        percent: (item.progress_percent || 0) * 100,
        time: item.progress_seconds,
        duration: null,
        runtimeMinutes: media.runtime,
        updatedAt: item.watched_at // aliases PlaybackProgress.updated_at, see format_event()
      });
    }

    // Bulk pull: everything currently in progress, at login/profile-switch/app
    // start — so the "continue watching" row is already correct without
    // waiting for the user to open each card individually (on-demand pull
    // above only fires per-card). Exported for main.js to call alongside its
    // existing Lampa.Timeline.read()/Lampa.Favorite.read() calls.
    function pullContinueWatching() {
      if (!running$1) return;
      getContinueWatching(function (items) {
        for (var i = 0; i < items.length; i++) applyContinueWatchingItem(items[i]);
      }, function (err) {
        console.warn('ScrobTimeline', 'continue-watching pull failed', err);
      });
    }

    // Point-in-time pull: fires when a movie/show's own full card opens (not
    // episode lists, search, settings, or any other screen — 'activity' fires
    // for ALL of those). Exact filter/field path ported from the old scrob.js,
    // already proven against this same event (lines 677-679).
    function onActivityStart(e) {
      if (!running$1) return;
      if (!e || e.type !== 'start' || e.component !== 'full') return;
      var card = e.object && (e.object.card || e.object.data && e.object.data.movie || e.object.movie);
      if (!card || !card.id) return;
      var isSeries = !!(card.number_of_seasons || card.first_air_date || card.type === 'tv');
      getWatchStatus(card.id, isSeries ? 'tv' : 'movie', function (items) {
        for (var i = 0; i < items.length; i++) applyWatchStatusItem(items[i]);
      }, function (err) {
        console.warn('ScrobTimeline', 'watch-status request failed', err);
      });
    }

    // Socket-triggered pull (§5.1.1/§5.4, Гілка 9) — a playback_session.started/
    // playing/paused event arrived for this account, from any device. The socket
    // payload itself doesn't carry enough identity for a targeted pull (playing/
    // paused have no tmdb_id at all; started's media_tmdb_id is frequently null
    // for an episode) and enriching it would need a server change - instead,
    // just re-run the same on-demand pull as onActivityStart() above for
    // whatever full card happens to already be open right now. Harmless no-op
    // when nothing relevant is open or the event was about a different title
    // entirely (pullWriteTimeline()'s own LWW/active-session guards still apply).
    function pullActiveCard() {
      if (!running$1) return;
      var active = Lampa.Activity.active();
      if (!active || active.component !== 'full') return;
      var card = active.card_data || active.card || active.movie;
      if (!card || !card.id) return;
      var isSeries = !!(card.number_of_seasons || card.first_air_date || card.type === 'tv');
      getWatchStatus(card.id, isSeries ? 'tv' : 'movie', function (items) {
        for (var i = 0; i < items.length; i++) applyWatchStatusItem(items[i]);
      }, function (err) {
        console.warn('ScrobTimeline', 'watch-status request failed (socket-triggered)', err);
      });
    }

    // ─── Prefetch (SYNC-ARCHITECTURE-PLAN.md §5.2.7) ───────────
    // Lampa's own "Продовжити перегляд" row (continue_watch) hides an ongoing
    // show once its next-to-air episode's PREVIOUS one reads >=90% watched in
    // the local Timeline (file_view) - but on-demand pull (onActivityStart
    // above) only ever fills that in once the user opens the show's own full
    // card. On a fresh app start file_view is empty for everything, so every
    // caught-up ongoing show wrongly stays in the row until opened once by
    // hand. Batches every enabled Favorite-list candidate's watch-status up
    // front instead, so the row's own filter already has real data on first
    // paint.
    var PREFETCH_CHUNK_SIZE = 100;
    // True once a prefetch run has completed successfully THIS session (app
    // launch to reload/close) - every trigger below (start(), profile switch,
    // each `main` visit) shares this one flag, so only the very first one that
    // actually succeeds does real work; the rest are a single boolean check.
    // Deliberately NOT persisted to Lampa.Storage: an in-memory flag already
    // means "at most once per page load, always fresh again on reload", with
    // none of a persisted TTL's staleness window.
    var prefetched = false;
    var prefetchInFlight = false;
    // Bumped on stop()/resetPrefetch()/forcePrefetch() - any chunk response still
    // in flight from an earlier run (e.g. a profile switch landed mid-batch)
    // captures the generation it started under and compares against this on
    // arrival; a mismatch means "some later run has already reset/superseded
    // this one" and the response is dropped silently, touching neither
    // `prefetched`/`prefetchInFlight` (already whatever the newer run set them
    // to) nor Timeline (would otherwise write the PREVIOUS profile's watch
    // state into whatever profile is active by the time this lands). Same
    // pattern as session.gen above, for the same reason.
    var prefetchGeneration = 0;
    function prefetchCandidateKeys() {
      var keys = [];
      if (Lampa.Storage.get(KEYS.PREFETCH_HISTORY, true)) keys.push('history');
      if (Lampa.Storage.get(KEYS.PREFETCH_BOOK, false)) keys.push('book');
      if (Lampa.Storage.get(KEYS.PREFETCH_LIKE, false)) keys.push('like');
      if (Lampa.Storage.get(KEYS.PREFETCH_WATH, false)) keys.push('wath');
      return keys;
    }

    // Unique {tmdbId, type} pool across every enabled candidate list - the same
    // card can legitimately sit in more than one list (e.g. both history and
    // book), and detectMediaType() filters out person cards (a Favorite list is
    // a card pool, not guaranteed movie/show-only). `type` uses the same 'tv'/
    // 'movie' convention this file's other API calls already use (onActivityStart/
    // pullActiveCard above), not mapping.js's 'series' (a different, list-sync-
    // specific convention).
    function collectPrefetchCandidates() {
      var seen = {};
      var items = [];
      var keys = prefetchCandidateKeys();
      for (var k = 0; k < keys.length; k++) {
        var cards = Lampa.Favorite.get({
          type: keys[k]
        }) || [];
        for (var i = 0; i < cards.length; i++) {
          var card = cards[i];
          if (!card || !card.id) continue;
          var mediaType = detectMediaType(card);
          if (mediaType === 'person') continue;
          var type = mediaType === 'series' ? 'tv' : 'movie';
          var dedupeKey = type + ':' + card.id;
          if (seen[dedupeKey]) continue;
          seen[dedupeKey] = true;
          items.push({
            tmdbId: card.id,
            type: type
          });
        }
      }
      return items;
    }

    // One chunk at a time, not all in parallel — keeps the burst of DB work this
    // causes server-side bounded to one batch query at a time, same spirit as
    // the external-player push's own "don't hammer a weak Android TV box's
    // network" reasoning (§5.1.1 point 5).
    function runPrefetchChunks(chunks, index, gen) {
      if (gen !== prefetchGeneration) return; // superseded mid-flight - see prefetchGeneration above

      if (index >= chunks.length) {
        prefetched = true;
        prefetchInFlight = false;
        // Same signal continue_watch's own render already reacts to (used
        // by the on-demand/bulk pulls above too) - makes the just-filled
        // file_view data take effect on the CURRENT main screen immediately,
        // not only on the next navigation to it.
        Lampa.Listener.send('state:changed', {
          target: 'favorite',
          reason: 'read'
        });
        console.log('ScrobTimeline', 'prefetch complete,', chunks.length, 'chunk(s)');
        return;
      }
      getBatchWatchStatus(chunks[index], function (items) {
        if (gen !== prefetchGeneration) return; // ditto - a stale response landed after the check above too
        for (var i = 0; i < items.length; i++) applyWatchStatusItem(items[i]);
        runPrefetchChunks(chunks, index + 1, gen);
      }, function (err) {
        if (gen !== prefetchGeneration) return;
        // All-or-nothing (SYNC-ARCHITECTURE-PLAN.md §9 п.6): deliberately NOT
        // queued through enqueueRetry (§5.1's retry queue is for mutations;
        // this is a read-only snapshot) - `prefetched` just stays false, so
        // the next `main` visit retries the WHOLE pool from scratch. Chunks
        // already applied before this failure are harmless to redo
        // (applyWatchStatusItem()/pullWriteTimeline() is idempotent, LWW-guarded).
        prefetchInFlight = false;
        console.warn('ScrobTimeline', 'batch watch-status prefetch failed', err);
      });
    }
    function runPrefetch() {
      if (!running$1 || prefetched || prefetchInFlight) return;
      var candidates = collectPrefetchCandidates();
      // Deliberately NOT `prefetched = true` here - an empty pool right now
      // (e.g. Favorite/Bookmarks data hasn't finished loading yet at plugin
      // start) would otherwise permanently block any future retry this
      // session, even once the same list genuinely has candidates a moment
      // later. A bare return costs nothing (no network call happened) and
      // leaves every later trigger (next `main` visit, forcePrefetch(), ...)
      // free to try again.
      if (!candidates.length) return;
      prefetchInFlight = true;
      var gen = prefetchGeneration;
      var chunks = [];
      for (var i = 0; i < candidates.length; i += PREFETCH_CHUNK_SIZE) {
        chunks.push(candidates.slice(i, i + PREFETCH_CHUNK_SIZE));
      }
      console.log('ScrobTimeline', 'prefetch starting,', candidates.length, 'candidate(s),', chunks.length, 'chunk(s)');
      runPrefetchChunks(chunks, 0, gen);
    }

    // Separate 'activity' listener from onActivityStart() above (that one only
    // cares about component 'full') - the home screen is Lampa's own 'main'
    // component (confirmed against app.min.js's own Activity.push({component:
    // 'main', ...}) call sites). A no-op past the first successful run this
    // session, or while one is already in flight - see `prefetched` above.
    function onMainScreenActivity(e) {
      if (!running$1) return;
      if (!e || e.type !== 'start' || e.component !== 'main') return;
      runPrefetch();
    }

    // Candidate-list settings changed (main.js's prefetch toggles) - re-run
    // against the new pool on the next `main` visit rather than mid-navigation.
    // Bumps the generation too - a chunk sequence already in flight against the
    // OLD pool must not keep writing into Timeline nor mark this new intent
    // `prefetched` once it (coincidentally) finishes.
    function resetPrefetch() {
      prefetched = false;
      prefetchInFlight = false;
      prefetchGeneration++;
    }

    // "Синхронізувати зараз" button (main.js) - resets AND re-runs immediately,
    // matching forceSync()'s own immediate-effect expectation instead of
    // waiting for the next `main` visit.
    function forcePrefetch() {
      resetPrefetch();
      runPrefetch();
    }

    // ─── Profile switch ─────────────────────────────────────────
    // switchProfile() (utils/profiles.js) never calls start()/stop() directly —
    // it (like engine.js's own list-sync) just sets KEYS.ACTIVE_PROFILE_ID and
    // relies on whoever cares about that to notice. engine.js has always had
    // this listener (setupProfileListener() there); porting the exact same
    // pattern here — a previously-missing gap, this module ran unrestarted
    // across a profile switch until now.
    function setupProfileListener() {
      var lastProfileId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);
      profileListener = function profileListener(e) {
        if (e.name === KEYS.ACTIVE_PROFILE_ID) {
          var newId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);
          if (newId !== lastProfileId) {
            lastProfileId = newId;
            stop();
            start();
          }
        }
      };
      Lampa.Storage.listener.follow('change', profileListener);
    }

    // ─── Lifecycle ──────────────────────────────────────────────

    function start() {
      if (running$1) return;
      if (!hasSession()) {
        console.warn('ScrobTimeline', 'start skipped: no session');
        return;
      }
      if (!Lampa.Storage.get(KEYS.SYNC_ENABLED)) {
        console.warn('ScrobTimeline', 'start skipped: sync disabled');
        return;
      }
      running$1 = true;
      if (!listenersBound) {
        Lampa.Player.listener.follow('start', onPlayerStart);
        Lampa.Player.listener.follow('destroy', onPlayerDestroy);
        Lampa.Player.listener.follow('external', onExternalPlayerStart);
        Lampa.Timeline.listener.follow('update', onTimelineUpdate);
        Lampa.Listener.follow('activity', onActivityStart);
        Lampa.Listener.follow('activity', onMainScreenActivity);
        document.addEventListener('pause', onNativeVideoPause, true);
        document.addEventListener('playing', onNativeVideoPlaying, true);
        document.addEventListener('seeked', onNativeVideoSeeked, true);
        document.addEventListener('error', onNativeVideoError, true);
        document.addEventListener('durationchange', onNativeVideoDurationChange, true);
        // engine.js owns the actual socket connection and calls handler.js's
        // registerHandlers() on it independently of this module's lifecycle -
        // this just makes sure playback_session.* events have somewhere to
        // go once that happens (order between the two doesn't matter,
        // requestPlaybackPull() reads this at call time, not bind time).
        bindPlaybackUpdate(pullActiveCard);
        listenersBound = true;
      }
      setupProfileListener();
      console.log('ScrobTimeline', 'started');
      // Bulk pull once per start() — covers login, the sync toggle,
      // restoreSession() on app launch, AND now a profile switch (via
      // setupProfileListener() above), without needing a separate hook at
      // each call site.
      pullContinueWatching();
      runPrefetch();
    }
    function stop() {
      running$1 = false;
      console.log('ScrobTimeline', 'stopped');
      // Listeners stay bound intentionally: Lampa.Player/Timeline's global
      // listener buses have no targeted unfollow-by-reference API worth
      // relying on here, and every handler above already checks `running`
      // first, making this a clean no-op while stopped.

      if (profileListener) {
        Lampa.Storage.listener.remove('change', profileListener);
        profileListener = null;
      }

      // Reset conditions 1+2 (§5.2.7 point 4): a profile switch goes through
      // exactly this stop()/start() cycle (setupProfileListener() above), and
      // so does logout/sync-disable - the next start() (if any) re-collects
      // the pool from scratch rather than trusting a previous profile's result.
      // The generation bump is the important part here: a chunk request still
      // in flight for the PROFILE BEING LEFT must not land its data into the
      // next profile's Timeline once its response arrives after this point.
      prefetched = false;
      prefetchInFlight = false;
      prefetchGeneration++;
      resetSessionState();
      resetExternalContext();
    }

    var CURRENT_PROFILE_KEY = 'scrob_levende_current_profile_id';
    var BACKUP_STORE_KEY = 'scrob_levende_backup';
    var ACTIVE_FLAG_KEY = 'scrob_levende_active';
    var MANAGED_FLAG_KEY = 'scrob_levende_managed';
    // Separate from CURRENT_PROFILE_KEY itself - see doApplyUnsafe()'s
    // everApplied check below for why comparing raw profileId values alone
    // isn't safe here.
    var HAS_APPLIED_KEY = 'scrob_levende_has_applied';
    var APPLY_FALLBACK_DELAY_MS = 2000;

    // "Regular account" fields backed up/restored per levende profile in
    // situation (C). Deliberately excludes KEYS.PROFILES/SYNC_ENABLED/
    // SYNC_INTERVAL/USERNAME/PASSWORD - the admin profile list has no meaning
    // here (see isLevendeActive() below), and sync on/off + poll interval read
    // more like a device-wide preference than a per-viewer one, matching this
    // plugin's own ISOLATED_KEYS precedent of excluding similar app-level
    // settings.
    var BACKUP_FIELDS = [KEYS.OWN_API_KEY, KEYS.SERVER_URL, KEYS.ACCESS_TOKEN, KEYS.ME, KEYS.ACTIVE_API_KEY, KEYS.ACTIVE_PROFILE_ID, KEYS.DEVICE_ACCESS_TOKEN, KEYS.DEVICE_REFRESH_TOKEN, KEYS.DEVICE_EXPIRES_AT];

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
    var SETTINGS_FIELDS = [KEYS.PREFETCH_HISTORY, KEYS.PREFETCH_BOOK, KEYS.PREFETCH_LIKE, KEYS.PREFETCH_WATH];
    var SETTINGS_DEFAULTS = {};
    SETTINGS_DEFAULTS[KEYS.PREFETCH_HISTORY] = true;
    SETTINGS_DEFAULTS[KEYS.PREFETCH_BOOK] = false;
    SETTINGS_DEFAULTS[KEYS.PREFETCH_LIKE] = false;
    SETTINGS_DEFAULTS[KEYS.PREFETCH_WATH] = false;

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
    var CUSTOM_CATEGORIES_KEY = 'scrob_custom_categories';

    // Staged by stageProfile() on 'profile'/'changed', consumed by whichever
    // fires first: the real 'state:changed' signal (applyPendingProfile(), called
    // from main.js) or the fallback timer armed alongside it.
    var pending = null;

    // Persisted (not just in-memory) because both flags must already read
    // correctly at the very first updateHeaderButton()/settingsListener check of
    // a fresh page load - restoreSession() runs synchronously before levende's
    // own 'profile' event has any chance to arrive (its init does a real network
    // round-trip to Lampac first). An in-memory-only flag would default to false
    // on every reload and let the icon/"Sign in" row flash briefly (or, on a
    // slow connection, stay wrong) until that event finally showed up.
    var levendeActive = !!Lampa.Storage.get(ACTIVE_FLAG_KEY, false);
    var levendeManaged = !!Lampa.Storage.get(MANAGED_FLAG_KEY, false);

    // True only once a REAL 'profile'/'changed' event has actually arrived THIS
    // page load (set in stageProfile() below) - distinct from levendeActive
    // itself, which may start out true purely from last session's persisted
    // flag, with nothing yet having confirmed it's still accurate.
    var confirmedThisSession = false;

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
    var STALE_CHECK_DELAY_MS = 8000;
    function checkStaleLevendeState() {
      if (!levendeActive) return;
      setTimeout(function () {
        if (confirmedThisSession) return;
        resetLevendeState();
      }, STALE_CHECK_DELAY_MS);
    }
    function resetLevendeState() {
      levendeActive = false;
      levendeManaged = false;
      Lampa.Storage.set(ACTIVE_FLAG_KEY, false);
      Lampa.Storage.set(MANAGED_FLAG_KEY, false);
      if (onApplyCallback) onApplyCallback();
    }

    // Notified after every real apply (credential swap actually happened) - set
    // once from main.js's initLevendeProfilesBridge(), used to refresh the
    // header icon/settings screen without this module needing to import them
    // back (main.js already owns those functions).
    var onApplyCallback = null;
    function setOnApply(callback) {
      onApplyCallback = callback;
    }
    function isLevendeActive() {
      return levendeActive;
    }
    function isLevendeManaged() {
      return levendeManaged;
    }
    function getBackupStore() {
      var raw = Lampa.Storage.get(BACKUP_STORE_KEY, {});
      return raw && _typeof(raw) === 'object' && !Array.isArray(raw) ? raw : {};
    }

    // Snapshots the CURRENT live values of BACKUP_FIELDS under profileId. Safe to
    // call even for a situation-(B) profile (accsdb-managed) - the snapshot just
    // mirrors whatever accsdb already defines and stays unused, since re-entering
    // a (B) profile always re-applies fresh from its own params, never from this
    // backup.
    function backupProfile(profileId) {
      var store = getBackupStore();
      var snapshot = {};
      BACKUP_FIELDS.concat(SETTINGS_FIELDS).concat([CUSTOM_CATEGORIES_KEY]).forEach(function (field) {
        snapshot[field] = Lampa.Storage.get(field, '');
      });
      store[profileId] = snapshot;
      Lampa.Storage.set(BACKUP_STORE_KEY, store);
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
      var snapshot = getBackupStore()[profileId] || {};
      SETTINGS_FIELDS.forEach(function (field) {
        var saved = snapshot[field];
        Lampa.Storage.set(field, typeof saved === 'boolean' ? saved : SETTINGS_DEFAULTS[field]);
      });
    }

    // Restores CUSTOM_CATEGORIES_KEY from profileId's own snapshot, defaulting
    // to an empty registry ('[]', matching storage.js's own DEFAULTS convention
    // for other JSON-array-shaped keys) when there is none yet - same
    // "restore-or-clean-default" shape as restoreProfile() below. Called
    // alongside restoreSettingsFields() in both situations (B and C) - see
    // CUSTOM_CATEGORIES_KEY's own comment above for why.
    function restoreCustomCategories(profileId) {
      var snapshot = getBackupStore()[profileId] || {};
      Lampa.Storage.set(CUSTOM_CATEGORIES_KEY, snapshot[CUSTOM_CATEGORIES_KEY] || '[]');
    }

    // Restores profileId's own backed-up snapshot, or resets every field to
    // empty if this levende profile has never signed in to Scrob before (first
    // visit) - the same "restore-or-clean-default" shape as this plugin's own
    // restoreIsolatedData().
    function restoreProfile(profileId) {
      var snapshot = getBackupStore()[profileId] || {};
      BACKUP_FIELDS.forEach(function (field) {
        Lampa.Storage.set(field, snapshot[field] || '');
      });
      restoreSettingsFields(profileId);
      restoreCustomCategories(profileId);
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
        doApplyUnsafe(profile);
      } catch (err) {
        console.error('ScrobLevendeBridge', 'doApply failed:', err);
      }
    }
    function doApplyUnsafe(profile) {
      // !! (not a raw truthy/null check) because Lampa.Storage.get() does NOT
      // reliably return the literal `null` passed as its own default when a
      // key was never set - confirmed live, it comes back as '' instead - so
      // a boolean flag stored separately from CURRENT_PROFILE_KEY is the only
      // safe way to know whether ANY profile has ever been applied yet.
      var everApplied = !!Lampa.Storage.get(HAS_APPLIED_KEY, false);
      var previousId = Lampa.Storage.get(CURRENT_PROFILE_KEY, null);

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
        return;
      }

      // Both sync engines restart around a credential swap - list-sync
      // (engine.js) already did before timeline push/pull (timeline.js)
      // existed; this was never extended here when it was added, so under
      // levende progress never actually reached the server (timelineSync
      // never even called start() once) even though list-sync worked fine.
      stop$1();
      stop();

      // Back up whatever is CURRENTLY live under the outgoing profile, whether
      // it came from situation B or C (harmless no-op to preserve for a B
      // profile, since it's never read back - see backupProfile() above).
      if (everApplied) backupProfile(previousId);
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
        Lampa.Storage.set(KEYS.ME, '');
        Lampa.Storage.set(KEYS.ACCESS_TOKEN, '');
        Lampa.Storage.set(KEYS.DEVICE_ACCESS_TOKEN, '');
        Lampa.Storage.set(KEYS.DEVICE_REFRESH_TOKEN, '');
        Lampa.Storage.set(KEYS.DEVICE_EXPIRES_AT, '');
        if (profile.server) Lampa.Storage.set(KEYS.SERVER_URL, profile.server);
        Lampa.Storage.set(KEYS.OWN_API_KEY, profile.apiKey || '');
        Lampa.Storage.set(KEYS.ACTIVE_API_KEY, profile.apiKey || '');
        // No real Scrob user id available here (accsdb-provided key, never
        // round-tripped through /auth/me) - a stable synthetic id, unique
        // per levende profile, is enough to correctly scope this plugin's
        // own mirror/map storage (utils/sync/mirror.js, mapstore.js both key
        // off ACTIVE_PROFILE_ID already).
        Lampa.Storage.set(KEYS.ACTIVE_PROFILE_ID, 'levende_' + profile.profileId);
        // Credentials come from accsdb, not a backup - but the prefetch
        // candidate-list settings and the custom-category registry still
        // need their own per-profile restore (see SETTINGS_FIELDS and
        // CUSTOM_CATEGORIES_KEY above).
        restoreSettingsFields(profile.profileId);
        restoreCustomCategories(profile.profileId);
      } else {
        restoreProfile(profile.profileId);
      }
      Lampa.Storage.set(CURRENT_PROFILE_KEY, profile.profileId);
      Lampa.Storage.set(HAS_APPLIED_KEY, true);
      if (Lampa.Storage.get(KEYS.SYNC_ENABLED)) {
        start$1();
        start();
      }
      if (onApplyCallback) onApplyCallback();
    }

    // Called from the 'profile' Listener in main.js.
    function stageProfile(e) {
      if (!e || e.type !== 'changed') return;
      confirmedThisSession = true;
      levendeActive = true;
      Lampa.Storage.set(ACTIVE_FLAG_KEY, true);
      var params = e.params || {};
      var server = params.scrob_server_url || '';
      var apiKey = params.scrob_api_key || '';
      var hasScrobParams = !!(server || apiKey);
      levendeManaged = hasScrobParams;
      Lampa.Storage.set(MANAGED_FLAG_KEY, hasScrobParams);
      var profile = {
        profileId: e.profileId,
        hasScrobParams: hasScrobParams,
        server: server,
        apiKey: apiKey
      };
      pending = profile;

      // Fallback: see the module comment above for why the real signal can be
      // delayed or skipped entirely.
      setTimeout(function () {
        if (pending === profile) {
          pending = null;
          doApply(profile);
        }
      }, APPLY_FALLBACK_DELAY_MS);
    }

    // Called from the 'state:changed' Listener in main.js (already pre-filtered
    // to target:'favorite', reason:'read').
    function applyPendingProfile() {
      if (!pending) return;
      var profile = pending;
      pending = null;
      doApply(profile);
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
    var originalSelectShow = null;

    // Same shape as the plugin's own settings-section icon (main.js's
    // ICON_SVG), recolored per status instead of a plain dot - gradient stop
    // colors swap to red when not authorized, so the mark stays recognizably
    // "Scrob" while still carrying the red/normal signal. Gradient ids are
    // counter-suffixed since every row in the picker embeds its own copy of
    // this SVG - two elements sharing one id in the same document is invalid
    // and could make every row resolve to whichever gradient the browser saw
    // first.
    var svgIconCounter = 0;
    function statusIconSvg(ok) {
      svgIconCounter += 1;
      var ringId = 'scrobLevendeRing' + svgIconCounter;
      var dotId = 'scrobLevendeDot' + svgIconCounter;
      var ringStops = ok ? '<stop offset="0%" stop-color="#5B34D6"/><stop offset="50%" stop-color="#9E3BC1"/><stop offset="100%" stop-color="#C147D8"/>' : '<stop offset="0%" stop-color="#7A1F1F"/><stop offset="50%" stop-color="#B23A3A"/><stop offset="100%" stop-color="#E05252"/>';
      var dotStops = ok ? '<stop offset="0%" stop-color="#5B34D6"/><stop offset="100%" stop-color="#C147D8"/>' : '<stop offset="0%" stop-color="#7A1F1F"/><stop offset="100%" stop-color="#E05252"/>';
      return '<svg class="scrob-levende-status-icon" viewBox="0 0 419 454" xmlns="http://www.w3.org/2000/svg">' + '<defs>' + '<linearGradient id="' + ringId + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="454">' + ringStops + '</linearGradient>' + '<linearGradient id="' + dotId + '" gradientUnits="objectBoundingBox" x1="0" y1="1" x2="0" y2="0">' + dotStops + '</linearGradient>' + '</defs>' + '<path d="M 394.09 73.88 A 226.5 226.5 0 1 0 332.74 427.26 L 287.64 358.22 A 144.6 144.6 0 1 1 334.56 130.14 Z" fill="url(#' + ringId + ')"/>' + '<circle cx="368.97" cy="347.2" r="48.29" fill="url(#' + dotId + ')"/>' + '</svg>';
    }

    // Mirrors storage.js's own hasSession() (OWN_API_KEY / DEVICE_ACCESS_TOKEN /
    // ACCESS_TOKEN+ME.id), but reading from a backed-up snapshot object instead
    // of live Storage - used for any (C) profile OTHER than the currently active
    // one below, whose snapshot is the only record of what it signed in with.
    function snapshotHasSession(snapshot) {
      var me = snapshot[KEYS.ME];
      return !!(snapshot[KEYS.OWN_API_KEY] || snapshot[KEYS.DEVICE_ACCESS_TOKEN] || snapshot[KEYS.ACCESS_TOKEN] && me && _typeof(me) === 'object' && me.id);
    }

    // True only when accsdb gives BOTH the server and the key for a (B) profile
    // - one without the other is exactly the "misconfigured" case worth
    // flagging, same as a (C) profile that has never signed in successfully.
    function isProfileAuthorized(profile) {
      var params = profile && profile.params || {};
      var server = params.scrob_server_url || '';
      var apiKey = params.scrob_api_key || '';
      if (server || apiKey) return !!(server && apiKey);

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
      var currentId = Lampa.Storage.get(CURRENT_PROFILE_KEY, null);
      if (profile && profile.id === currentId) {
        return hasSession();
      }
      var snapshot = getBackupStore()[profile && profile.id] || {};
      return snapshotHasSession(snapshot);
    }

    // Prepended, not appended - levende already marks the current profile with
    // its own end-of-row indicator (a CSS-only "selected" class, no title text
    // involved), so a trailing dot here would sit right next to it.
    function decorateProfilePickerItems(options) {
      if (!options || options.title !== Lampa.Lang.translate('account_profiles')) return;
      if (!Array.isArray(options.items) || !options.items.length) return;
      if (!options.items[0].profile) return;
      options.items.forEach(function (item) {
        if (!item.profile) return;
        var icon = statusIconSvg(isProfileAuthorized(item.profile));
        item.title = icon + ' ' + (item.title || '');
      });
    }

    // Called once from main.js's initLevendeProfilesBridge(). Idempotent - a
    // second call is a no-op, so it's safe to call unconditionally even if
    // levende ends up getting initialized more than once per page load.
    function patchProfileSelect() {
      if (originalSelectShow) return;
      if (typeof Lampa.Select === 'undefined' || typeof Lampa.Select.show !== 'function') return;
      originalSelectShow = Lampa.Select.show;
      Lampa.Select.show = function (options) {
        decorateProfilePickerItems(options);
        return originalSelectShow.call(Lampa.Select, options);
      };
    }

    var WATCHED_THRESHOLD_PERCENT = 90;
    var PROGRESS_FLOOR_PERCENT = 1.5; // same "meaningful progress" floor used elsewhere (timeline.js)
    var TIMECODE_POOL_SIZE = 5; // concurrent GET /timecode/all requests
    var PUSH_PAUSE_MS = 50; // pause between sequential Scrob writes (§5.6.3 п.6)

    var running = false; // guards against a second export overlapping the first

    // ─── Host/auth discovery (§5.6.3 п.1, revised) ─────────────

    function findLampacScriptUrl() {
      var scripts = document.querySelectorAll('script[src]');
      for (var i = 0; i < scripts.length; i++) {
        var src = scripts[i].src;
        if (src && /\/(bookmark|timecode)(\.js|\/js\/)/.test(src)) return src;
      }
      return null;
    }
    function buildLampacAuth() {
      var scriptUrl = findLampacScriptUrl();
      var host = null;
      var token = '';
      if (scriptUrl) {
        try {
          var parsed = new URL(scriptUrl);
          host = parsed.origin;
          var m = parsed.pathname.match(/\/(?:bookmark|timecode)\/js\/([^/]+)/);
          if (m) token = m[1];
        } catch (e) {/* malformed src - fall through to origin fallback below */}
      }
      if (!host) host = window.location.origin;
      return {
        host: host,
        token: token,
        uid: Lampa.Storage.get('lampac_unic_id', ''),
        accountEmail: Lampa.Storage.get('account_email', ''),
        profileId: Lampa.Storage.get('lampac_profile_id', '')
      };
    }
    function appendParam(url, key, value) {
      if (!value) return url;
      return url + (url.indexOf('?') === -1 ? '?' : '&') + key + '=' + encodeURIComponent(value);
    }
    function buildTimecodeUrl(auth, cardId) {
      var url = auth.host + '/timecode/all';
      url = appendParam(url, 'token', auth.token);
      url = appendParam(url, 'account_email', auth.accountEmail);
      url = appendParam(url, 'uid', auth.uid);
      url = appendParam(url, 'profile_id', auth.profileId);
      url = appendParam(url, 'card_id', cardId);
      return url;
    }

    // ─── Local card pool (§5.6.3 п.2, revised — local only, no remote /bookmark/list) ───

    function readFavoriteRaw() {
      var favorite = Lampa.Storage.get('favorite', {});
      if (typeof favorite === 'string') {
        try {
          favorite = JSON.parse(favorite);
        } catch (e) {
          favorite = {};
        }
      }
      if (!favorite || _typeof(favorite) !== 'object') favorite = {};
      if (!Array.isArray(favorite.card)) favorite.card = [];
      return favorite;
    }

    // ─── Step: dropped titles (`thrown`) — re-fire Favorite.add so engine.js's
    // own onFavoriteAdd()/pushDrop() (already live, §5.3.2) picks each one up.
    // See module header for why this is the one category needing an explicit
    // push instead of just forceSync().
    function exportThrownList(favorite) {
      var ids = Array.isArray(favorite.thrown) ? favorite.thrown : [];
      var pushed = 0;
      for (var i = 0; i < ids.length; i++) {
        var card = null;
        for (var c = 0; c < favorite.card.length; c++) {
          if (favorite.card[c].id == ids[i]) {
            card = favorite.card[c];
            break;
          }
        }
        if (!card) continue;
        Lampa.Favorite.add('thrown', card);
        pushed++;
      }
      return pushed;
    }

    // ─── Timecodes (§5.6.3 п.3-4, revised) ─────────────────────

    function parseTimecodeResponse(raw) {
      var out = {};
      if (!raw || _typeof(raw) !== 'object') return out;
      // accsdb marks an access-control rejection body (Core/Middlewares/
      // Accsdb.cs), not real timecode data - the whole response is invalid,
      // same as plugin.js's own update() (`if (result.accsdb) return`).
      if (raw.accsdb) return out;
      for (var hash in raw) {
        var entry;
        try {
          entry = JSON.parse(raw[hash]);
        } catch (e) {
          continue;
        }
        if (!entry || _typeof(entry) !== 'object') continue;
        out[hash] = {
          duration: parseFloat(entry.duration) || 0,
          time: parseFloat(entry.time) || 0,
          percent: parseFloat(entry.percent) || 0
        };
      }
      return out;
    }

    // One card's timecode fetch → a list of {identity, percent, time, duration}
    // candidates. `identity` matches pushExternalWatchedMark()'s own shape
    // (timeline.js) so the same downstream push helpers can be reused untouched.
    function resolveCardTimecodes(card, raw) {
      var timecodes = parseTimecodeResponse(raw);
      var hashes = Object.keys(timecodes);
      if (!hashes.length) return [];
      var isSeries = !!card.name;
      var results = [];
      if (!isSeries) {
        // Movie: card_id already scopes the response to this one title - if
        // several hash variants exist (different encodes), take the one with
        // the most progress rather than guessing which hash "is" the movie.
        var best = null;
        for (var h = 0; h < hashes.length; h++) {
          var tc = timecodes[hashes[h]];
          if (!best || tc.percent > best.percent) best = tc;
        }
        if (best) results.push({
          identity: {
            isSeries: false,
            tmdbId: card.id
          },
          percent: best.percent,
          time: best.time,
          duration: best.duration
        });
        return results;
      }

      // Same fallback chain used elsewhere for this exact hash-matching search
      // (timeline.js's resolveManualIdentity()/onExternalPlayerStart()) - needs
      // to land on whichever name Lampa itself used when the hash now being
      // searched for was originally computed.
      var originalName = card.original_name || card.original_title || card.title || card.name;
      for (var i = 0; i < hashes.length; i++) {
        var se = resolveSeasonEpisode(hashes[i], originalName);
        if (!se.season || !se.episode) continue;
        var t = timecodes[hashes[i]];
        results.push({
          identity: {
            isSeries: true,
            seriesTmdbId: card.id,
            season: se.season,
            episode: se.episode
          },
          percent: t.percent,
          time: t.time,
          duration: t.duration
        });
      }
      return results;
    }

    // Small fixed-size concurrency pool - mirrors the external-player batch's
    // own "don't hammer the network" reasoning (§5.1.1), here against lampac's
    // server instead of Scrob's. `onProgress(done, total)` - optional - fires
    // after each item settles, regardless of order (concurrency 5, so item 3
    // can finish before item 1) - only the running count is meaningful here,
    // not which specific item just completed.
    function runPool(items, size, worker, onDone, onProgress) {
      var index = 0;
      var active = 0;
      var done = 0;
      var results = new Array(items.length);
      function launchNext() {
        if (index >= items.length) {
          if (active === 0) onDone(results);
          return;
        }
        var i = index++;
        active++;
        worker(items[i], function (result) {
          results[i] = result;
          active--;
          done++;
          if (onProgress) onProgress(done, items.length);
          launchNext();
        });
      }
      if (!items.length) {
        onDone(results);
        return;
      }
      for (var k = 0; k < Math.min(size, items.length); k++) launchNext();
    }
    function fetchCardTimecodes(auth, card, callback) {
      var cardId = card.id + '_' + (card.name ? 'tv' : 'movie');
      var url = buildTimecodeUrl(auth, cardId);
      var network = new Lampa.Reguest();
      network.timeout(15000);
      network.native(url, function (data) {
        network.clear();
        var raw = typeof data === 'string' ? function () {
          try {
            return JSON.parse(data);
          } catch (e) {
            return null;
          }
        }() : data;
        callback(resolveCardTimecodes(card, raw));
      }, function () {
        network.clear();
        callback([]);
      }, false, {});
    }

    // ─── Dedup against Scrob (§5.6.3 п.5) ──────────────────────

    function dedupKey(identity) {
      return identity.isSeries ? 'episode:' + identity.seriesTmdbId + ':' + identity.season + ':' + identity.episode : 'movie:' + identity.tmdbId;
    }

    // Batch-status is per SHOW/MOVIE (not per episode) - one request per unique
    // title covers every episode candidate belonging to it in one response.
    function buildBatchStatusPool(candidates) {
      var seen = {};
      var items = [];
      for (var i = 0; i < candidates.length; i++) {
        var id = candidates[i].identity;
        var tmdbId = id.isSeries ? id.seriesTmdbId : id.tmdbId;
        var type = id.isSeries ? 'tv' : 'movie';
        var key = type + ':' + tmdbId;
        if (seen[key]) continue;
        seen[key] = true;
        items.push({
          tmdbId: tmdbId,
          type: type
        });
      }
      return items;
    }

    // Server rows → lookup keyed the same way as dedupKey() above.
    function buildKnownStatusLookup(rows) {
      var lookup = {};
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var key;
        if (row.media_type === 'episode') {
          key = 'episode:' + row.series_tmdb_id + ':' + row.season_number + ':' + row.episode_number;
        } else {
          key = 'movie:' + row.tmdb_id;
        }
        lookup[key] = row;
      }
      return lookup;
    }
    function isAlreadyCovered(row, candidatePercent) {
      if (!row) return false;
      if (row.watched) return true;
      return (row.percent || 0) >= candidatePercent;
    }

    // ─── Push to Scrob (§5.6.3 п.6) ────────────────────────────

    function pushWatched(identity, callback) {
      var tmdbId = identity.isSeries ? identity.seriesTmdbId : identity.tmdbId;
      var mediaType = identity.isSeries ? 'episode' : 'movie';
      var episode = identity.isSeries ? {
        seriesTmdbId: identity.seriesTmdbId,
        season: identity.season,
        episode: identity.episode
      } : null;
      // 409 (upstream dedup, #390) means Scrob already has a WatchEvent for
      // this title within its own dedup window - our own pre-check above
      // (getBatchWatchStatus) didn't catch it (a different source's recent
      // write, or a duplicate within this same import), but the end result is
      // the same as a normal success: it's marked watched in Scrob either way.
      addHistoryEvent(tmdbId, mediaType, true, episode, null, function () {
        callback(true);
      }, function (err, status) {
        callback(status === 409);
      });
    }
    function pushProgress(identity, timeSeconds, runtimeMinutes, callback) {
      var payload = {
        tmdb_id: identity.isSeries ? null : identity.tmdbId,
        media_type: identity.isSeries ? 'episode' : 'movie',
        title: 'lampac import',
        runtime: runtimeMinutes || null,
        reset: false
      };
      if (identity.isSeries) {
        payload.show_tmdb_id = identity.seriesTmdbId;
        payload.season_number = identity.season;
        payload.episode_number = identity.episode;
      }
      startSession(payload, function (res) {
        if (!res || !res.session_key) {
          callback(false);
          return;
        }
        updateSession(res.session_key, {
          progress_seconds: Math.round(timeSeconds),
          state: 'paused'
        }, function () {
          callback(true);
        }, function () {
          callback(false);
        });
      }, function () {
        callback(false);
      });
    }
    function pushSequential(items, index, counters, onDone, onProgress) {
      if (index >= items.length) {
        onDone(counters);
        return;
      }
      var item = items[index];
      var runtimeMinutes = item.duration > 0 ? Math.round(item.duration / 60) : null;
      function next() {
        if (onProgress) onProgress(index + 1, items.length);
        setTimeout(function () {
          pushSequential(items, index + 1, counters, onDone, onProgress);
        }, PUSH_PAUSE_MS);
      }
      if (item.percent >= WATCHED_THRESHOLD_PERCENT) {
        pushWatched(item.identity, function (ok) {
          if (ok) counters.watched++;
          next();
        });
      } else {
        pushProgress(item.identity, item.time, runtimeMinutes, function (ok) {
          if (ok) counters.progress++;
          next();
        });
      }
    }

    // ─── Orchestrator ───────────────────────────────────────────

    // `onDone(result)` — result: { listsThrown, watched, progress, skipped, cardsScanned, error }
    // `error` set only when the export couldn't run at all (no session/sync off);
    // a partial/empty result from real attempts is NOT an error.
    // `onProgress(stage, current, total)` — optional, `stage` is 'timecodes'
    // (runPool over the local card pool) or 'uploading' (pushSequential over the
    // deduped batch) - the only two multi-step, genuinely slow parts (§5.6,
    // progress-bar follow-up 2026-09-18: a bare spinner gave no sense of whether
    // a big library export was still working or stuck).
    function run(onDone, onProgress) {
      if (running) return;
      if (!hasSyncRunning()) {
        onDone({
          error: 'sync_not_running'
        });
        return;
      }
      running = true;
      var favorite = readFavoriteRaw();
      var listsThrown = exportThrownList(favorite);
      if (listsThrown > 0) forceSync();
      var auth = buildLampacAuth();
      var cards = favorite.card;
      if (!cards.length) {
        running = false;
        onDone({
          listsThrown: listsThrown,
          watched: 0,
          progress: 0,
          skipped: 0,
          cardsScanned: 0
        });
        return;
      }
      runPool(cards, TIMECODE_POOL_SIZE, function (card, done) {
        fetchCardTimecodes(auth, card, done);
      }, function (perCardResults) {
        var candidates = [];
        for (var i = 0; i < perCardResults.length; i++) {
          var list = perCardResults[i] || [];
          for (var j = 0; j < list.length; j++) {
            if (list[j].percent >= PROGRESS_FLOOR_PERCENT) candidates.push(list[j]);
          }
        }
        if (!candidates.length) {
          running = false;
          onDone({
            listsThrown: listsThrown,
            watched: 0,
            progress: 0,
            skipped: 0,
            cardsScanned: cards.length
          });
          return;
        }
        var statusPool = buildBatchStatusPool(candidates);
        getBatchWatchStatus(statusPool, function (rows) {
          finishExport(candidates, buildKnownStatusLookup(rows), listsThrown, cards.length, onDone, onProgress);
        }, function () {
          // Dedup lookup failed - proceed without it rather than dropping
          // the whole import (§9 п.6 "all-or-nothing" precedent doesn't
          // apply here: worst case is a few redundant writes, not silence).
          finishExport(candidates, {}, listsThrown, cards.length, onDone, onProgress);
        });
      }, function (done, total) {
        if (onProgress) onProgress('timecodes', done, total);
      });
    }
    function finishExport(candidates, knownLookup, listsThrown, cardsScanned, onDone, onProgress) {
      var toPush = [];
      var skipped = 0;
      for (var i = 0; i < candidates.length; i++) {
        var row = knownLookup[dedupKey(candidates[i].identity)];
        if (isAlreadyCovered(row, candidates[i].percent)) {
          skipped++;
          continue;
        }
        toPush.push(candidates[i]);
      }
      pushSequential(toPush, 0, {
        watched: 0,
        progress: 0
      }, function (counters) {
        running = false;
        onDone({
          listsThrown: listsThrown,
          watched: counters.watched,
          progress: counters.progress,
          skipped: skipped,
          cardsScanned: cardsScanned
        });
      }, function (done, total) {
        if (onProgress) onProgress('uploading', done, total);
      });
    }
    function hasSyncRunning() {
      var status = getStatus();
      return !!(status && status.running);
    }

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
    // (усе СУВОРО до нього вже вийшло) або, якщо дата наступного невідома, з
    // last_episode_to_air (усе аж ВКЛЮЧНО з ним). Обидва поля — стандартні TMDB-поля
    // повного /tv/{id}, присутні в data.movie так само, як next_episode_to_air, що сама
    // Lampa вже читає (app.min.js:44777) — лише last_episode_to_air клієнт не використовує,
    // але не вирізає з відповіді.

    function isTvCard(e) {
      return !!(e && e.data && e.data.movie && e.object && e.object.method === 'tv');
    }
    function pickLastWatched(items) {
      var last = null;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item.watched) continue;
        if (!last || item.season_number > last.season_number || item.season_number === last.season_number && item.episode_number > last.episode_number) {
          last = item;
        }
      }
      return last;
    }

    // Межа "вже вийшло": усе (season, episode) СУВОРО менше next_episode_to_air
    // точно вийшло; якщо дата наступного невідома — усе аж ВКЛЮЧНО з last_episode_to_air.
    // null, якщо TMDB не дав жодного з двох (тоді countUnwatched рахує без обмеження —
    // той самий компроміс, що й раніше, лише як останній fallback).
    function airedBoundary(card) {
      var next = card.next_episode_to_air;
      if (next && next.season_number != null && next.episode_number != null) {
        return {
          season: next.season_number,
          episode: next.episode_number,
          inclusive: false
        };
      }
      var last = card.last_episode_to_air;
      if (last && last.season_number != null && last.episode_number != null) {
        return {
          season: last.season_number,
          episode: last.episode_number,
          inclusive: true
        };
      }
      return null;
    }

    // Скільки епізодів з seasons[] (виключно "Спеціальні", season_number > 0), що вже
    // ВИЙШЛИ В ЕФІР (з урахуванням boundary), іде ПІСЛЯ останнього переглянутого.
    function countUnwatched(seasons, lastSeason, lastEpisode, boundary) {
      if (!Array.isArray(seasons)) return 0;
      var count = 0;
      for (var i = 0; i < seasons.length; i++) {
        var s = seasons[i];
        if (!s || s.season_number <= 0) continue;
        var airedInSeason = s.episode_count || 0;
        if (boundary) {
          if (s.season_number > boundary.season) {
            airedInSeason = 0;
          } else if (s.season_number === boundary.season) {
            airedInSeason = Math.min(airedInSeason, boundary.inclusive ? boundary.episode : boundary.episode - 1);
          }
        }
        if (airedInSeason <= 0) continue;
        if (s.season_number === lastSeason) {
          count += Math.max(0, airedInSeason - lastEpisode);
        } else if (s.season_number > lastSeason) {
          count += airedInSeason;
        }
      }
      return count;
    }
    function buildBadge(iconSvg, lastWatched, unwatchedCount) {
      var el = document.createElement('div');
      el.className = 'full-start-new__details scrob-last-episode';
      var html = '<div class="scrob-last-episode__icon">' + iconSvg + '</div>' + '<span>' + Lampa.Lang.translate('full_season') + ': ' + lastWatched.season_number + '</span>' + '<span class="full-start-new__split">●</span>' + '<span>' + Lampa.Lang.translate('full_episode') + ': ' + lastWatched.episode_number + '</span>';
      if (unwatchedCount > 0) {
        html += '<span class="scrob-last-episode__new">' + '<span class="scrob-last-episode__dot"></span>' + Lampa.Lang.translate('scrob_new_episodes').replace('%s', unwatchedCount) + '</span>';
      }
      el.innerHTML = html;
      return el;
    }
    function showBadge(iconSvg, e) {
      if (!hasSession()) return;
      if (!Lampa.Storage.get(KEYS.SHOW_LAST_EPISODE_BADGE, true)) return;
      if (!isTvCard(e)) return;
      var card = e.data.movie;
      if (!card.id) return;
      getWatchStatus(card.id, 'tv', function (items) {
        var lastWatched = pickLastWatched(items);
        if (!lastWatched) return;
        var renderRoot = e.object.activity.render();
        var buttons = renderRoot.find('.full-start-new__buttons').first();
        if (!buttons.length) return;
        renderRoot.find('.full-start-new__details.scrob-last-episode').remove();
        var boundary = airedBoundary(card);
        var unwatchedCount = countUnwatched(card.seasons, lastWatched.season_number, lastWatched.episode_number, boundary);
        buttons.before(buildBadge(iconSvg, lastWatched, unwatchedCount));
      }, function (err) {
        console.warn('ScrobLastEpisodeBadge', 'watch-status request failed', err);
      });
    }
    function init(iconSvg) {
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') showBadge(iconSvg, e);
      });
    }

    /**
     * Scrob custom category viewer component.
     * Pattern: kinobaza/myperson/component.js — Lampa.Maker.make('Category')
     * Reads items from Lampa 'favorite' storage by custom_key.
     */

    function component(object) {
      var comp = Lampa.Maker.make('Category', object);
      comp.use({
        onCreate: function onCreate() {
          // Read custom category items from favorite storage
          var favorite = Lampa.Storage.get('favorite', '{}');
          if (typeof favorite === 'string') {
            try {
              favorite = JSON.parse(favorite);
            } catch (e) {
              favorite = {};
            }
          }
          var ids = Array.isArray(favorite[object.custom_key]) ? favorite[object.custom_key] : [];
          var cards = Array.isArray(favorite.card) ? favorite.card : [];
          var results = [];
          for (var i = 0; i < ids.length; i++) {
            for (var j = 0; j < cards.length; j++) {
              if (cards[j].id == ids[i]) {
                results.push(cards[j]);
                break;
              }
            }
          }
          var json = {
            results: results,
            total_pages: 1,
            page: 1
          };
          if (results.length === 0) {
            this.empty();
          } else {
            this.build(json);
          }
        },
        onInstance: function onInstance(card, element) {
          card.use({
            onlyEnter: function onlyEnter() {
              Lampa.Activity.push({
                url: '',
                title: element.title || element.name,
                component: 'full',
                card: element,
                page: 1
              });
            },
            onLong: function onLong() {
              // Long press: remove from this category
              var enabledCtrl = Lampa.Controller.enabled().name;
              Lampa.Select.show({
                title: Lampa.Lang.translate('scrob_cat_remove_confirm'),
                items: [{
                  title: Lampa.Lang.translate('scrob_cat_remove'),
                  _remove: true
                }, {
                  title: Lampa.Lang.translate('cancel'),
                  cancel: true
                }],
                onSelect: function onSelect(item) {
                  if (!item._remove) {
                    Lampa.Controller.toggle(enabledCtrl);
                    return;
                  }
                  Lampa.Favorite.remove(object.custom_key, element);
                  Lampa.Noty.show(Lampa.Lang.translate('scrob_cat_removed'));
                  Lampa.Activity.replace(object);
                },
                onBack: function onBack() {
                  Lampa.Controller.toggle(enabledCtrl);
                }
              });
            }
          });
        }
      });
      return comp;
    }

    // Scrob — Lampa plugin: login to a self-hosted Scrob server,
    // switch between server users as profiles, isolate watch data per profile.

    // Settings section icon (gradient ids prefixed scrob- to avoid conflicts)
    var ICON_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 419 454\"><defs><linearGradient id=\"scrobRingGrad\" gradientUnits=\"userSpaceOnUse\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"454\"><stop offset=\"0%\" stop-color=\"#5B34D6\"/><stop offset=\"50%\" stop-color=\"#9E3BC1\"/><stop offset=\"100%\" stop-color=\"#C147D8\"/></linearGradient><linearGradient id=\"scrobDotGrad\" gradientUnits=\"objectBoundingBox\" x1=\"0\" y1=\"1\" x2=\"0\" y2=\"0\"><stop offset=\"0%\" stop-color=\"#5B34D6\"/><stop offset=\"100%\" stop-color=\"#C147D8\"/></linearGradient></defs><path d=\"M 394.09 73.88 A 226.5 226.5 0 1 0 332.74 427.26 L 287.64 358.22 A 144.6 144.6 0 1 1 334.56 130.14 Z\" fill=\"url(#scrobRingGrad)\"/><circle cx=\"368.97\" cy=\"347.2\" r=\"48.29\" fill=\"url(#scrobDotGrad)\"/></svg>";
    var settingsListener = null;

    // stop() of the currently-active QR pairing poll, so a repeat call to
    // openQrAuthDialog() (without closing the previous modal) silences the old
    // loop instead of running two in parallel.
    var scrobQrStopActive = null;

    // Refreshes early — refreshDeviceToken() rotates the refresh_token too, so a
    // buffer avoids clock-drift/sleep making a request land right past expiry.
    var DEVICE_TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

    // ─── Header profile button ────────────────────────────────

    function removeHeaderButton() {
      $('.open--scrob-profile').remove();
    }

    // Render avatar button after open--settings (pattern: siaivo birthday.js)
    function renderHeaderButton() {
      removeHeaderButton();
      var btn = $('<div class="head__action selector open--scrob-profile"></div>');
      btn.append(avatarHtml(activeProfile()));
      btn.on('hover:enter', showProfileSelect);
      $('.head .head__actions .open--settings').after(btn);
    }

    // Shared with scrob_user_info's onRender below - the "how am I signed in"
    // fallback text when there's no real username (bare API key or QR/device
    // token, i.e. no real login behind this session).
    function authStatusText() {
      if (Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN, '')) return Lampa.Lang.translate('scrob_auth_status_qr');
      if (Lampa.Storage.get(KEYS.OWN_API_KEY, '')) return Lampa.Lang.translate('scrob_auth_status_apikey');
      return '';
    }

    // levende adds its OWN persistent header icon for per-viewer switching
    // (.open--profile.levende, #user_profile_icon inside) - third-party markup
    // this plugin doesn't create and doesn't control the render timing of.
    // Small red/green dot overlaid in its corner - same "is the ACTIVE profile
    // actually connected to Scrob" question hasSession() already answers for
    // this plugin's OWN header button, just surfaced on levende's icon too
    // (which stays visible under levende, unlike our own - see
    // updateHeaderButton() below). Idempotent and cheap to call often: creates
    // the dot once, then just flips its color on every call after.
    function updateLevendeHeaderDot() {
      var $icon = $('.open--profile.levende');
      if (!isLevendeActive() || !$icon.length) {
        // Also covers levende getting removed/disabled mid-session
        // (resetLevendeState()'s own onApplyCallback already calls back
        // into here via updateHeaderButton()) - nothing left to decorate.
        $('.scrob-levende-header-dot').remove();
        return;
      }
      var $dot = $icon.find('.scrob-levende-header-dot');
      if (!$dot.length) $dot = $('<div class="scrob-levende-header-dot"></div>').appendTo($icon);
      $dot.toggleClass('scrob-levende-header-dot--ok', hasSession());
    }
    function updateHeaderButton() {
      updateLevendeHeaderDot();
      if (!hasSession()) {
        removeHeaderButton();
        return;
      }

      // Fetch/refresh display_name+avatar regardless of levende - scrob_user_info
      // in settings reads it for both levende scenarios (B and C) too, not just
      // when this plugin's own header icon is the one showing it.
      ensureOwnProfileInfo();

      // Under levende, per-viewer identity switching is the bridge's job (its
      // own head icon already exists for that) - this plugin's own switcher
      // exists solely to pick between /admin/users profiles, which never
      // applies while levende is active (see completeLogin() below).
      if (!isLevendeActive()) renderHeaderButton();else removeHeaderButton();
    }

    // A bare API key or QR/device token (no real username/password login) never
    // gets a real identity from this plugin's own login flow - /auth/me
    // (username/email) is Bearer-only, so getMe() stays empty for these. GET
    // /profile/me is the one endpoint that accepts either credential and
    // returns SOMETHING name-like (display_name) and an avatar_url - fetch and
    // cache it once per credential, then let activeProfile()/avatarHtml() pick
    // it up like any other profile.
    function ensureOwnProfileInfo() {
      if (getMe().id) return; // real login already has a real identity

      var key = ownCredentialKey();
      if (!key) return;
      if (getOwnProfileInfo().forKey === key) return; // already fetched this page load for this credential

      getProfile(function (profile) {
        setOwnProfileInfo(profile, key);
        // updateHeaderButton(), not renderHeaderButton() directly - this now
        // also runs while levende is active (for scrob_user_info's sake), and
        // the header icon must stay hidden in that case regardless of a
        // successful fetch. The re-entrant ensureOwnProfileInfo() call inside
        // is a harmless no-op - the cache is already populated by now.
        updateHeaderButton();
        refreshSettings();
      }, function () {
        // Leave whatever was cached (possibly nothing) - the '?' fallback
        // avatar still works fine without this.
      });
    }

    // Profile picker (pattern: siaivo/src/core/account/profile.js select())
    function showProfileSelect() {
      var profiles = getProfiles();
      var returnController = Lampa.Controller.enabled().name;
      if (!profiles.length) {
        // No /admin/users list to show for a session with no real login
        // behind it (bare API key, QR/device token) - trying anyway would
        // just fail with a permissions error for a non-admin account, since
        // there's nothing to switch between in the first place. Show the
        // current (only) account on its own instead.
        Lampa.Select.show({
          title: Lampa.Lang.translate('scrob_profiles'),
          items: [{
            title: activeProfile().display_name || authStatusText(),
            template: 'selectbox_icon',
            icon: avatarHtml(activeProfile()),
            selected: true
          }],
          onSelect: function onSelect() {
            Lampa.Controller.toggle(returnController);
          },
          onBack: function onBack() {
            Lampa.Controller.toggle(returnController);
          }
        });
        return;
      }
      var activeId = Lampa.Storage.get(KEYS.ACTIVE_PROFILE_ID);
      // Select's onSelect never restores the controller on its own (only "Back" does,
      // and only if onBack is given) — capture where we came from and restore it
      // explicitly in both paths, or the remote/mouse is left hanging after this menu.
      var returnController = Lampa.Controller.enabled().name;
      var items = profiles.map(function (u) {
        return {
          title: u.username,
          subtitle: u.email || '',
          template: 'selectbox_icon',
          icon: avatarHtml(u),
          selected: u.id == activeId,
          id: u.id
        };
      });
      Lampa.Select.show({
        title: Lampa.Lang.translate('scrob_profiles'),
        items: items,
        onSelect: function onSelect(a) {
          if (switchProfile(a.id)) renderHeaderButton();
          Lampa.Controller.toggle(returnController);
        },
        onBack: function onBack() {
          Lampa.Controller.toggle(returnController);
        }
      });
    }

    // ─── Login / logout ───────────────────────────────────────

    function refreshSettings() {
      if (typeof Lampa.Settings !== 'undefined' && typeof Lampa.Settings.update === 'function') {
        try {
          // Lampa.Settings.update() re-renders whichever settings page was
          // last opened THIS SESSION (a closure var, empty string until
          // then) - if the user never opened settings at all yet, it
          // throws trying to look up a template for an empty component
          // name ("Template [settings_] not found", confirmed against the
          // real core source). Nothing to refresh in that case - ignore.
          Lampa.Settings.update();
        } catch (e) {}
      }
    }

    // Save session, load profile list, draw header button
    function completeLogin(token, me, username, password) {
      Lampa.Storage.set(KEYS.ACCESS_TOKEN, token);
      Lampa.Storage.set(KEYS.ME, me);
      Lampa.Storage.set(KEYS.OWN_API_KEY, me.api_key || '');

      // Give this account its own isolated local data (favorite, online_view, ...)
      // instead of silently inheriting whatever was left in storage from an
      // unrelated earlier session/profile - same isolation switchProfile() already
      // does for an in-session switch, needed here too since this is equally a
      // "become profile me.id" transition, just via a fresh login instead.
      restoreIsolatedData(me.id);
      Lampa.Timeline.read();
      Lampa.Favorite.read();

      // API key before profile id — same ordering fix as switchProfile()
      // (utils/profiles.js): Storage.set() fires its 'change' listener
      // synchronously, and the sync engine restarts on ACTIVE_PROFILE_ID
      // changing, so the key must already be correct by then.
      Lampa.Storage.set(KEYS.ACTIVE_API_KEY, me.api_key || '');
      Lampa.Storage.set(KEYS.ACTIVE_PROFILE_ID, me.id);
      // Store credentials for socket re-authentication
      if (username) Lampa.Storage.set(KEYS.USERNAME, username);
      if (password) Lampa.Storage.set(KEYS.PASSWORD, password);
      var finish = function finish(profiles) {
        Lampa.Storage.set(KEYS.PROFILES, profiles);
        updateHeaderButton();
        refreshCustomMenu();
        refreshSettings();
        Lampa.Noty.show(Lampa.Lang.translate('scrob_auth_success'));

        // Start sync if enabled (lifecycle wiring)
        if (Lampa.Storage.get(KEYS.SYNC_ENABLED)) {
          start$1();
          start();
        }
      };

      // Under levende, this account behaves like a plain single-profile sign-in
      // regardless of is_admin - per-viewer switching is the levende bridge's
      // job now, not this plugin's own /admin/users list (avoids a confusing
      // nested "profile of a profile" switcher on top of levende's own).
      if (me.is_admin && !isLevendeActive()) {
        // Admin gets all server users as profiles; on failure fall back to own profile only
        adminUsers(token, function (profiles) {
          finish(profiles);

          // This is the one place a real, authoritative full user list ever
          // arrives - safe to prune backups for any userId no longer present.
          // NOT done in the fallback/non-admin branches below: finish([me])
          // there is never a full list, so pruning against it would wrongly
          // wipe out every OTHER profile's backup on a shared device.
          pruneStaleBackups(profiles);
        }, function () {
          finish([me]);
        });
      } else {
        finish([me]);
      }
    }

    // Lampa.Input.edit's own back() hardcodes returning focus to
    // 'settings_component' regardless of caller — every terminal branch here
    // explicitly overrides that with Controller.toggle(returnTo).
    function performServerLogin(username, password, returnTo) {
      returnTo = returnTo || 'settings_component';
      if (!serverUrl()) {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_fill_fields'));
        Lampa.Controller.toggle(returnTo);
        return;
      }
      login(username, password, function (token) {
        if (token.requires_2fa) {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_2fa_not_supported'));
          Lampa.Controller.toggle(returnTo);
          return;
        }
        me(token.access_token, function (me) {
          completeLogin(token.access_token, me, username, password);
          Lampa.Controller.toggle(returnTo);
        }, function () {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_me_error'));
          Lampa.Controller.toggle(returnTo);
        });
      }, function () {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_auth_error'));
        Lampa.Controller.toggle(returnTo);
      });
    }

    // Two chained Input.edit dialogs (username, then password) — mirrors the
    // standalone Scrob Lampa plugin's openAuthDialog() (scrob.js).
    function openLoginInputFlow(returnTo) {
      returnTo = returnTo || 'settings_component';
      Lampa.Input.edit({
        title: Lampa.Lang.translate('scrob_username'),
        value: '',
        free: true,
        nosave: true
      }, function (username) {
        if (!username || !username.trim()) {
          Lampa.Controller.toggle(returnTo);
          return;
        }
        Lampa.Input.edit({
          title: Lampa.Lang.translate('scrob_password'),
          value: '',
          free: true,
          nosave: true
        }, function (password) {
          if (!password || !password.trim()) {
            Lampa.Controller.toggle(returnTo);
            return;
          }
          performServerLogin(username.trim(), password.trim(), returnTo);
        });
      });
    }

    // Manual API key — standalone auth method, no login required at all.
    function openApiKeyInput(returnTo) {
      returnTo = returnTo || 'settings_component';
      Lampa.Input.edit({
        title: Lampa.Lang.translate('scrob_api_key'),
        value: Lampa.Storage.get(KEYS.OWN_API_KEY, ''),
        free: true,
        nosave: true
      }, function (value) {
        Lampa.Storage.set(KEYS.OWN_API_KEY, (value || '').trim());
        updateHeaderButton();
        refreshSettings();
        Lampa.Controller.toggle(returnTo);
      });
    }

    // Entry point: one settings row → three standalone sign-in methods, matching
    // the standalone Scrob Lampa plugin's own choice menu (scrob.js
    // openAuthChoiceDialog()) instead of three permanently-visible input fields.
    function showAuthChoice(returnTo) {
      returnTo = returnTo || 'settings_component';
      Lampa.Select.show({
        title: Lampa.Lang.translate('scrob_auth_choice_title'),
        items: [{
          title: Lampa.Lang.translate('scrob_api_key'),
          action: 'apikey'
        }, {
          title: Lampa.Lang.translate('scrob_login'),
          action: 'login'
        }, {
          title: Lampa.Lang.translate('scrob_qr_login'),
          action: 'qr'
        }],
        onSelect: function onSelect(item) {
          if (item.action === 'apikey') openApiKeyInput(returnTo);else if (item.action === 'login') openLoginInputFlow(returnTo);else if (item.action === 'qr') openQrAuthDialog(returnTo);
        },
        onBack: function onBack() {
          Lampa.Controller.toggle(returnTo);
        }
      });
    }
    function doLogout() {
      // Stop sync before clearing session (lifecycle wiring)
      stop$1();
      stop();
      clearSession();
      removeHeaderButton();
      refreshSettings();
      Lampa.Noty.show(Lampa.Lang.translate('scrob_logout_success'));
    }

    // ─── QR device pairing (third, standalone sign-in method) ──
    // Bearer device token, never an api_key — the backend deliberately refuses
    // /auth/me for device-scoped tokens (see KEYS.DEVICE_ACCESS_TOKEN in
    // storage.js), so admin profile-switching stays login-only; this path is for
    // plain scrobbling/sync without ever typing a password on the TV remote.

    function openQrAuthDialog(returnTo) {
      returnTo = returnTo || 'settings_component';
      deviceCode(function (data) {
        showQrAuthModal(data, returnTo);
      }, function () {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_noty_qr_gen_failed'));
      });
    }
    function showQrAuthModal(data, returnTo) {
      // A repeat call without closing the previous modal would otherwise stack
      // parallel polling loops.
      if (scrobQrStopActive) {
        scrobQrStopActive();
        scrobQrStopActive = null;
      }
      var pollDelay = (data.interval || 5) * 1000;
      var expiresAt = Date.now() + (data.expires_in || 900) * 1000;
      var pollTimeout = null;
      var stopped = false;
      function stopPolling() {
        stopped = true;
        if (pollTimeout) {
          clearTimeout(pollTimeout);
          pollTimeout = null;
        }
        if (scrobQrStopActive === stopPolling) scrobQrStopActive = null;
      }
      scrobQrStopActive = stopPolling;
      var $html = $('<div class="scrob-qr-wrap">' + '<div class="scrob-qr-code"></div>' + '<div class="scrob-qr-user-code"></div>' + '<div class="scrob-qr-hint">' + Lampa.Lang.translate('scrob_qr_hint') + '</div>' + '<div class="scrob-qr-manual"></div>' + '</div>');
      $html.find('.scrob-qr-user-code').text(data.user_code); // .text() — без ризику інʼєкції в HTML

      // Будуємо посилання самі з serverUrl(), а не з data.verification_uri*
      // від сервера: до цього моменту serverUrl() уже гарантовано робочий (цей
      // самий /auth/device/code запит щойно пройшов саме через нього) - на
      // відміну від app_settings.server_url на бекенді, статичного налаштування,
      // яке легко лишити незаданим (тоді сервер віддає дефолтний
      // http://localhost:7330, що не працює на жодному пристрої, крім самого
      // сервера). Код (?code=...) - пряме зчеплення рядків, не переклад:
      // scrob_qr_manual_suffix раніше тримав це як i18n-ключ з порожнім
      // значенням у кожній мові, а Lampa.Lang.translate() трактує порожній
      // переклад як "немає перекладу" і повертає сам ключ - буквально
      // "scrob_qr_manual_suffix" замість коду.
      var manualLink = serverUrl() + '/link?code=' + encodeURIComponent(data.user_code);
      $html.find('.scrob-qr-manual').text(Lampa.Lang.translate('scrob_qr_manual_prefix') + manualLink);
      Lampa.Utils.qrcode(manualLink, $html.find('.scrob-qr-code'), function () {
        $html.find('.scrob-qr-code').text(Lampa.Lang.translate('scrob_qr_draw_failed'));
      });
      Lampa.Modal.open({
        title: Lampa.Lang.translate('scrob_qr_modal_title'),
        html: $html,
        onBack: function onBack() {
          stopPolling();
          Lampa.Modal.close();
          Lampa.Controller.toggle(returnTo);
        }
      });
      function poll() {
        if (stopped) return;
        if (Date.now() > expiresAt) {
          stopPolling();
          Lampa.Modal.close();
          Lampa.Noty.show(Lampa.Lang.translate('scrob_noty_qr_expired'));
          return;
        }
        deviceToken(data.device_code, function (res) {
          if (stopped) return;
          if (res.ok && res.body.access_token) {
            stopPolling();
            Lampa.Storage.set(KEYS.DEVICE_ACCESS_TOKEN, res.body.access_token);
            Lampa.Storage.set(KEYS.DEVICE_REFRESH_TOKEN, res.body.refresh_token);
            Lampa.Storage.set(KEYS.DEVICE_EXPIRES_AT, Date.now() + res.body.expires_in * 1000);
            Lampa.Modal.close();
            Lampa.Noty.show(Lampa.Lang.translate('scrob_auth_success'));
            updateHeaderButton();
            refreshSettings();
            Lampa.Controller.toggle(returnTo);
            return;
          }
          var err = res.body.error;
          if (err === 'slow_down') pollDelay += 5000; // сервер просить пул рідше
          if (err === 'access_denied' || err === 'expired_token' || err === 'invalid_grant') {
            stopPolling();
            Lampa.Modal.close();
            Lampa.Noty.show(Lampa.Lang.translate('scrob_noty_qr_denied'));
            return;
          }
          // 'authorization_pending' (чи щось незнайоме) — мовчки продовжуємо пул
          pollTimeout = setTimeout(poll, pollDelay);
        }, function () {
          // тимчасова мережева помилка одного пулу — цикл не зупиняємо
          if (!stopped) pollTimeout = setTimeout(poll, pollDelay);
        });
      }
      pollTimeout = setTimeout(poll, pollDelay);
    }

    // Rotates refresh_token on every call (server design) — always store the new
    // one. Clears the pairing ONLY on an explicit server refusal (grant revoked
    // or a replayed/stale refresh_token), never on a plain network failure, so a
    // temporary connectivity blip can't sign the device out on its own.
    function refreshDeviceToken(callback) {
      var refreshToken = Lampa.Storage.get(KEYS.DEVICE_REFRESH_TOKEN, '');
      if (!refreshToken) {
        return;
      }
      deviceTokenRefresh(refreshToken, function (res) {
        if (res.ok && res.body.access_token) {
          Lampa.Storage.set(KEYS.DEVICE_ACCESS_TOKEN, res.body.access_token);
          Lampa.Storage.set(KEYS.DEVICE_REFRESH_TOKEN, res.body.refresh_token);
          Lampa.Storage.set(KEYS.DEVICE_EXPIRES_AT, Date.now() + res.body.expires_in * 1000);
        } else {
          Lampa.Storage.set(KEYS.DEVICE_ACCESS_TOKEN, '');
          Lampa.Storage.set(KEYS.DEVICE_REFRESH_TOKEN, '');
          Lampa.Storage.set(KEYS.DEVICE_EXPIRES_AT, 0);
          updateHeaderButton();
          refreshSettings();
        }
      });
    }

    // Proactive check, called periodically — see the setInterval in startPlugin().
    function ensureDeviceTokenFresh() {
      var token = Lampa.Storage.get(KEYS.DEVICE_ACCESS_TOKEN, '');
      if (!token) return;
      var expiresAt = Lampa.Storage.get(KEYS.DEVICE_EXPIRES_AT, 0);
      if (Date.now() < expiresAt - DEVICE_TOKEN_REFRESH_BUFFER_MS) return;
      refreshDeviceToken();
    }

    // ─── Settings section ─────────────────────────────────────

    // Mark categories — mutually exclusive statuses
    var MARK_CATS = ['scheduled', 'continued', 'thrown', 'look', 'viewed'];

    // Lampa favorite category translation keys (from core)
    var CAT_LABELS = {
      book: 'title_book',
      like: 'title_like',
      wath: 'title_wath',
      scheduled: 'title_scheduled',
      continued: 'title_continued',
      thrown: 'title_thrown',
      look: 'title_look',
      history: 'title_history',
      viewed: 'title_viewed'
    };
    function catLabel(key) {
      var translationKey = CAT_LABELS[key];
      if (translationKey) return Lampa.Lang.translate(translationKey);
      // Custom key: capitalize
      return key.charAt(0).toUpperCase() + key.slice(1);
    }

    // Sanitize category name into a storage key
    function sanitizeCategoryKey(name) {
      var key = String(name || '').trim().toLowerCase().replace(/[^\wа-яіїєґё]+/gi, '_') // letters/digits/underscore only
      .replace(/_{2,}/g, '_').replace(/^_+|_+$/g, '').slice(0, 32);
      return key;
    }

    // Menu icon SVG for custom categories (folder/list icon, stroke currentColor)
    var MENU_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

    // ─── Mapping flow ─────────────────────────────────────────

    function showMappingFlow() {
      if (!hasSession()) {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_fill_fields'));
        return;
      }

      // Captured once, threaded through the whole list→category→create/confirm chain —
      // Select's own controller is always named 'select', so re-querying
      // Controller.enabled() at a deeper step would just report 'select' back.
      var returnController = Lampa.Controller.enabled().name;

      // Fetch all lists from server
      getLists(function (serverLists) {
        // Filter: exclude [Lampa] lists and already-mapped lists
        var mappedIds = getMappedIds();
        var available = [];
        for (var i = 0; i < serverLists.length; i++) {
          var sl = serverLists[i];
          if (!sl.name) continue;
          if (sl.name.indexOf('[Lampa] ') === 0) continue;
          if (mappedIds.indexOf(sl.id) !== -1) continue;
          available.push(sl);
        }
        if (available.length === 0) {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_map_none'));
          return;
        }

        // Select #1: choose Scrob list
        var listItems = available.map(function (sl) {
          return {
            title: sl.name,
            subtitle: (sl.item_count || 0) + ' items',
            id: sl.id,
            list_name: sl.name
          };
        });
        Lampa.Select.show({
          title: Lampa.Lang.translate('scrob_map_select_list'),
          items: listItems,
          onSelect: function onSelect(selectedList) {
            showCategorySelect(selectedList, returnController);
          },
          onBack: function onBack() {
            Lampa.Controller.toggle(returnController);
          }
        });
      }, function () {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_lists_error'));
      });
    }
    function showCategorySelect(selectedList, returnController) {
      // Build category list: standard keys + custom keys from favorite
      var favorite = Lampa.Storage.get('favorite', '{}');
      if (typeof favorite === 'string') {
        try {
          favorite = JSON.parse(favorite);
        } catch (e) {
          favorite = {};
        }
      }
      var standardKeys = ['book', 'like', 'wath', 'scheduled', 'continued', 'look', 'history', 'viewed'];
      var existingMap = getMap();
      var catItems = [];

      // First item: create own category
      catItems.push({
        title: Lampa.Lang.translate('scrob_map_create_own'),
        icon: MENU_ICON_SVG,
        _create_own: true
      });

      // Standard categories
      for (var i = 0; i < standardKeys.length; i++) {
        var key = standardKeys[i];
        var label = catLabel(key);
        var mapping = existingMap[key];
        if (mapping) {
          label += ' (' + Lampa.Lang.translate('scrob_map_replace') + ': ' + mapping.list_name + ')';
        }
        catItems.push({
          title: label,
          id: key,
          _isMark: MARK_CATS.indexOf(key) !== -1
        });
      }

      // Custom keys from favorite (not standard, not excluded)
      // 'thrown' is excluded here too - it maps to Scrob's native dropped-state
      // endpoints (§5.3.2), never to a /lists mapping, so offering it in this
      // "map to a Scrob list" picker (as a standard OR a custom key) would be
      // misleading - see mapping.js's own EXCLUDED for the sync-side half of
      // this same exclusion. 'watch' (with "ch") is excluded for the same
      // reason as mapping.js's own EXCLUDED - lampac force-includes this dead,
      // never-written-to category in every /bookmark/list response (lists.md);
      // engine.js already ignores it entirely, so offering it here would let
      // the user create a mapping that silently never syncs anything.
      var excluded = {
        card: true,
        thrown: true,
        watch: true
      };
      for (var k in favorite) {
        if (excluded[k] || standardKeys.indexOf(k) !== -1 || !Array.isArray(favorite[k])) continue;
        var customLabel = k.charAt(0).toUpperCase() + k.slice(1);
        var customMapping = existingMap[k];
        if (customMapping) {
          customLabel += ' (' + Lampa.Lang.translate('scrob_map_replace') + ': ' + customMapping.list_name + ')';
        }
        catItems.push({
          title: customLabel,
          id: k,
          _isMark: false
        });
      }
      Lampa.Select.show({
        title: Lampa.Lang.translate('scrob_map_select_cat'),
        items: catItems,
        onSelect: function onSelect(selectedCat) {
          if (selectedCat._create_own) {
            showCreateOwnInput(selectedList, returnController);
          } else {
            showConfirmMapping(selectedList, selectedCat, returnController);
          }
        },
        onBack: function onBack() {
          Lampa.Controller.toggle(returnController);
        }
      });
    }

    // Reserved keys that cannot be used as custom category names
    var RESERVED_KEYS = ['card', 'history', 'viewed', 'persons', 'like', 'wath', 'book', 'look', 'scheduled', 'continued', 'thrown'];

    // Input flow for creating a custom category
    function showCreateOwnInput(selectedList, returnController) {
      Lampa.Input.edit({
        title: Lampa.Lang.translate('scrob_map_own_name'),
        value: selectedList.list_name || '',
        free: true,
        nosave: true,
        align: 'center'
      }, function (value) {
        var name = String(value || '').trim();
        var key = sanitizeCategoryKey(name);
        if (!key) {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_map_own_exists'));
          showCreateOwnInput(selectedList, returnController);
          return;
        }

        // Check reserved keys
        if (RESERVED_KEYS.indexOf(key) !== -1) {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_map_own_exists'));
          showCreateOwnInput(selectedList, returnController);
          return;
        }

        // Check custom registry
        if (getByKey(key)) {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_map_own_exists'));
          showCreateOwnInput(selectedList, returnController);
          return;
        }

        // Check existing favorite keys
        var favorite = Lampa.Storage.get('favorite', '{}');
        if (typeof favorite === 'string') {
          try {
            favorite = JSON.parse(favorite);
          } catch (e) {
            favorite = {};
          }
        }
        if (favorite[key] && Array.isArray(favorite[key])) {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_map_own_exists'));
          showCreateOwnInput(selectedList, returnController);
          return;
        }

        // Create category in favorite storage
        favorite[key] = [];
        Lampa.Storage.set('favorite', favorite);

        // Register custom category
        add(key, name);

        // Apply mapping: pull items from Scrob list into new category
        applyMapping(key, selectedList.id, selectedList.list_name, function () {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_map_own_created'));
          refreshCustomMenu();
          refreshSettings();
        });

        // Input.edit завжди сам повертає фокус на 'settings_component' — перекриваємо
        // це власним поверненням до реального контексту виклику.
        Lampa.Controller.toggle(returnController);
      });
    }
    function showConfirmMapping(selectedList, selectedCat, returnController) {
      var html = $('<div>' + '<div style="padding:1em; line-height:1.6">' + '"' + selectedList.list_name + '" ' + Lampa.Lang.translate('scrob_map_confirm') + ' "' + catLabel(selectedCat.id) + '"<br>' + '<span style="opacity:0.6">' + Lampa.Lang.translate('scrob_map_once') + '</span>' + (selectedCat._isMark ? '<br><span style="color:#e8a838">' + Lampa.Lang.translate('scrob_map_marks_warn') + '</span>' : '') + '</div></div>');
      Lampa.Modal.open({
        title: Lampa.Lang.translate('scrob_map_title'),
        html: html,
        size: 'medium',
        buttons: [{
          name: Lampa.Lang.translate('scrob_map_cancel'),
          onSelect: function onSelect() {
            Lampa.Modal.close();
            Lampa.Controller.toggle(returnController);
          }
        }, {
          name: Lampa.Lang.translate('scrob_map_apply'),
          onSelect: function onSelect() {
            Lampa.Modal.close();
            Lampa.Controller.toggle(returnController);
            applyMapping(selectedCat.id, selectedList.id, selectedList.list_name, function () {
              // Success: refresh settings to update active mappings button
              refreshSettings();
            });
          }
        }],
        onBack: function onBack() {
          Lampa.Modal.close();
          Lampa.Controller.toggle(returnController);
        }
      });
    }

    // ─── Active mappings management ───────────────────────────

    function showActiveMappings() {
      var map = getMap();
      var keys = Object.keys(map);
      if (keys.length === 0) {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_map_none'));
        return;
      }

      // Select's own controller is always named 'select' (native singleton), so it
      // can't be used as a "return to" target for a NESTED select — capture the
      // real caller context once here and thread it through to showMappingActions.
      var returnController = Lampa.Controller.enabled().name;
      var items = keys.map(function (key) {
        return {
          title: catLabel(key) + ' → ' + map[key].list_name,
          _lampaKey: key,
          _listId: map[key].list_id,
          _listName: map[key].list_name
        };
      });
      Lampa.Select.show({
        title: Lampa.Lang.translate('scrob_map_active'),
        items: items,
        onSelect: function onSelect(selected) {
          showMappingActions(selected, returnController);
        },
        onBack: function onBack() {
          Lampa.Controller.toggle(returnController);
        }
      });
    }
    function showMappingActions(mappingEntry, returnController) {
      Lampa.Select.show({
        title: mappingEntry.title,
        items: [{
          title: Lampa.Lang.translate('scrob_map_unlink'),
          _action: 'unlink'
        }, {
          title: Lampa.Lang.translate('scrob_map_cancel'),
          _action: 'cancel'
        }],
        onSelect: function onSelect(item) {
          if (item._action === 'unlink') {
            removeMappingFlow(mappingEntry._lampaKey, function () {
              Lampa.Noty.show(Lampa.Lang.translate('scrob_map_unlinked'));
              refreshSettings();
            });
          }
          // 'cancel' — just close, Select auto-closes
          Lampa.Controller.toggle(returnController);
        },
        onBack: function onBack() {
          Lampa.Controller.toggle(returnController);
        }
      });
    }

    // ─── Dynamic custom category menu items ───────────────────

    function refreshCustomMenu() {
      // Remove previous custom menu items
      $('.menu .menu__list .scrob-custom-menu-item').remove();
      var categories = getAll();
      if (!categories.length) return;
      for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        var button = $('<li class="menu__item selector scrob-custom-menu-item" data-key="' + cat.key + '">' + '<div class="menu__ico">' + MENU_ICON_SVG + '</div>' + '<div class="menu__text">' + cat.title + '</div>' + '</li>');
        button.on('hover:enter', function (c) {
          return function () {
            Lampa.Activity.push({
              url: '',
              title: c.title,
              component: 'scrob_category',
              custom_key: c.key,
              page: 1
            });
          };
        }(cat));
        $('.menu .menu__list').eq(0).append(button);
      }
    }

    // ─── Bookmarks ContentRows for custom categories ─────────

    function registerBookmarksRows() {
      try {
        Lampa.ContentRows.add({
          name: 'scrob_custom_categories',
          title: Lampa.Lang.translate('scrob_title'),
          index: 90,
          screen: ['bookmarks'],
          call: function call(params, screen) {
            var categories = getAll();
            if (!categories || !categories.length) return;
            var favorite = Lampa.Storage.get('favorite', '{}');
            if (typeof favorite === 'string') {
              try {
                favorite = JSON.parse(favorite);
              } catch (e) {
                favorite = {};
              }
            }
            var cards = Array.isArray(favorite.card) ? favorite.card : [];
            var lines = [];
            for (var i = 0; i < categories.length; i++) {
              var cat = categories[i];
              var ids = Array.isArray(favorite[cat.key]) ? favorite[cat.key] : [];
              var results = [];
              for (var j = 0; j < ids.length; j++) {
                for (var k = 0; k < cards.length; k++) {
                  if (cards[k].id == ids[j]) {
                    var clone = Object.assign({}, cards[k]);
                    clone.params = {
                      emit: {
                        onEnter: function (c) {
                          return function () {
                            Lampa.Activity.push({
                              url: '',
                              title: c.title || c.name,
                              component: 'full',
                              card: c,
                              page: 1
                            });
                          };
                        }(clone),
                        onFocus: function (c) {
                          return function () {
                            Lampa.Background.change(Lampa.Utils.cardImgBackground(c));
                          };
                        }(clone)
                      }
                    };
                    results.push(clone);
                    break;
                  }
                }
              }
              if (results.length === 0) continue;
              lines.push({
                title: cat.title,
                results: results,
                total_pages: 1,
                page: 1,
                params: {
                  module: Lampa.Maker.module('Line').toggle(Lampa.Maker.module('Line').MASK.base, 'Event')
                }
              });
            }
            return lines;
          }
        });
      } catch (e) {
        console.error('Scrob', 'registerBookmarksRows error', e);
      }
    }

    // ─── Direct-storage toggle for custom categories ───
    // Core Favorite.toggle() routes through cloud()/check() which only knows
    // the hardcoded category whitelist, so custom keys never register as present.
    // This helper manages storage directly and emits the same UI event.

    function toggleCustomCategory(key, card) {
      var favorite = Lampa.Storage.get('favorite', '{}');
      if (typeof favorite === 'string') {
        try {
          favorite = JSON.parse(favorite);
        } catch (e) {
          favorite = {};
        }
      }
      var ids = Array.isArray(favorite[key]) ? favorite[key] : [];
      var idx = ids.indexOf(card.id);
      var method;
      if (idx === -1) {
        // Add: insert id at top and ensure card exists in the shared pool
        ids.unshift(card.id);
        favorite[key] = ids;
        var pool = Array.isArray(favorite.card) ? favorite.card : [];
        var exists = false;
        for (var i = 0; i < pool.length; i++) {
          if (pool[i].id == card.id) {
            exists = true;
            break;
          }
        }
        if (!exists && Lampa.Utils.clearCard && Lampa.Arrays.clone) {
          pool.unshift(Lampa.Utils.clearCard(Lampa.Arrays.clone(card)));
          favorite.card = pool;
        }
        method = 'add';
      } else {
        // Remove: splice the id out. KEEP the card in favorite.card —
        // core Favorite.remove() prunes the pool via the whitelist-only check()
        // and would destroy cards that live only in custom categories.
        ids.splice(idx, 1);
        favorite[key] = ids;
        method = 'remove';
      }
      Lampa.Storage.set('favorite', favorite);

      // Notify the UI layer (same event shape the core emits)
      Lampa.Listener.send('state:changed', {
        target: 'favorite',
        reason: 'update',
        method: method,
        type: key,
        card: card
      });
    }

    // ─── Card menu patch for custom categories (v3 Card Module) ───
    // Wraps CardModule.Menu.onCreate to inject custom favorite categories
    // into the long-press card action bar (same pattern as kinobaza/custom-favs.js).

    function patchCardMenu() {
      try {
        var cardModule = Lampa.Maker.map('Card');
        if (!cardModule || !cardModule.Menu || !cardModule.Menu.onCreate) return;
        var categories = getAll();
        if (!categories || !categories.length) return;
        var onMenuCreate = cardModule.Menu.onCreate;
        cardModule.Menu.onCreate = function () {
          var self = this;

          // Find the Favorites entry in menu_list by title
          var favoriteMenuList = this.menu_list.filter(function (menu) {
            return menu.title === Lampa.Lang.translate('settings_input_links');
          })[0];
          if (!favoriteMenuList) {
            onMenuCreate.apply(this, arguments);
            return;
          }
          var originalMenu = favoriteMenuList.menu;
          favoriteMenuList.menu = function () {
            // Build custom category checkbox items
            var newItems = categories.map(function (cat) {
              var favorite = Lampa.Storage.get('favorite', '{}');
              if (typeof favorite === 'string') {
                try {
                  favorite = JSON.parse(favorite);
                } catch (e) {
                  favorite = {};
                }
              }
              var ids = Array.isArray(favorite[cat.key]) ? favorite[cat.key] : [];
              var isChecked = ids.indexOf(self.data.id) !== -1;
              return {
                checkbox: true,
                checked: isChecked ? self.data.id : undefined,
                title: cat.title,
                onCheck: function onCheck(item, elem) {
                  toggleCustomCategory(cat.key, self.data);

                  // Recompute checked state after toggle
                  var fresh = Lampa.Storage.get('favorite', '{}');
                  if (typeof fresh === 'string') {
                    try {
                      fresh = JSON.parse(fresh);
                    } catch (e) {
                      fresh = {};
                    }
                  }
                  var member = Array.isArray(fresh[cat.key]) && fresh[cat.key].indexOf(self.data.id) !== -1;
                  elem.toggleClass('selectbox-item--checked', member);
                }
              };
            });
            var oldMenuItems = originalMenu.apply(favoriteMenuList);
            if (newItems.length) {
              var scrobSeparator = {
                title: Lampa.Lang.translate('scrob_title'),
                separator: true
              };
              // Find the Status separator to insert Scrob section before it
              var statusIdx = -1;
              for (var s = 0; s < oldMenuItems.length; s++) {
                if (oldMenuItems[s] && oldMenuItems[s].separator && oldMenuItems[s].title === Lampa.Lang.translate('settings_cub_status')) {
                  statusIdx = s;
                  break;
                }
              }
              if (statusIdx > -1) {
                var before = oldMenuItems.slice(0, statusIdx);
                var after = oldMenuItems.slice(statusIdx);
                return before.concat(scrobSeparator, newItems, after);
              }
              return oldMenuItems.concat(scrobSeparator, newItems);
            }
            return oldMenuItems;
          };
          onMenuCreate.apply(this, arguments);
        };
      } catch (e) {
        console.error('Scrob', 'patchCardMenu error', e);
      }
    }

    // ─── Full card bookmark button patch for custom categories ──
    // Intercepts the .button--book click on the full card detail page
    // and injects custom category items into the Select popup.
    // This covers path #2 (separate from CardModule.Menu used by line cards).

    function patchFullCardBookmark() {
      try {
        var attachToButton = function attachToButton() {
          if (customAttached) return;
          var btn = document.querySelector('.button--book');
          if (!btn) return;
          var act = Lampa.Activity.active();
          if (!act || act.component !== 'full' || !act.card) return;
          customAttached = true;
          var cardData = act.card;
          if (!cardData || !cardData.id) return;
          $(btn).on('hover:enter.scrob_bookmark', function () {
            setTimeout(function () {
              var $box = $('body > .selectbox');
              if (!$box.length) return;
              var categories = getAll();
              if (!categories || !categories.length) return;
              if ($box.find('.scrob-select-item').length) return;
              var favorite = Lampa.Storage.get('favorite', '{}');
              if (typeof favorite === 'string') {
                try {
                  favorite = JSON.parse(favorite);
                } catch (e) {
                  favorite = {};
                }
              }

              // Find Status separator — could be .settings-param-title or .selectbox-item with that text
              var $insertBefore = $box.find('.settings-param-title').filter(function () {
                return $(this).find('span').text() === Lampa.Lang.translate('settings_cub_status');
              }).first();
              if (!$insertBefore.length) {
                $insertBefore = $box.find('.selectbox-item__title').filter(function () {
                  return $(this).text() === Lampa.Lang.translate('settings_cub_status');
                }).first().closest('.selectbox-item');
              }

              // Build Scrob separator
              if (categories.length) {
                var $separator = $('<div class="settings-param-title"><span>' + Lampa.Lang.translate('scrob_title') + '</span></div>');
                if ($insertBefore.length) $separator.insertBefore($insertBefore);else $separator.appendTo($box.find('.scroll__body'));
              }
              for (var i = 0; i < categories.length; i++) {
                var cat = categories[i];
                var $item = $('<div class="selectbox-item selector scrob-select-item">' + '<div class="selectbox-item__title"></div>' + '<div class="selectbox-item__checkbox"></div>' + '</div>');
                $item.find('.selectbox-item__title').text(cat.title);
                var ids = favorite[cat.key];
                if (Array.isArray(ids) && ids.indexOf(cardData.id) !== -1) {
                  $item.addClass('selectbox-item--checked');
                }
                if ($insertBefore.length) $item.insertBefore($insertBefore);else $item.appendTo($box.find('.scroll__body'));
                $item.on('hover:enter', function (catKey) {
                  return function () {
                    toggleCustomCategory(catKey, cardData);
                    var fresh = Lampa.Storage.get('favorite', '{}');
                    if (typeof fresh === 'string') {
                      try {
                        fresh = JSON.parse(fresh);
                      } catch (e) {
                        fresh = {};
                      }
                    }
                    var member = Array.isArray(fresh[catKey]) && fresh[catKey].indexOf(cardData.id) !== -1;
                    $(this).toggleClass('selectbox-item--checked', member);
                  };
                }(cat.key));
              }
              Lampa.Controller.collectionSet($box.find('.scroll__body'));
              setTimeout(function () {
                var $items = $box.find('.selector');
                if ($items.length) {
                  Lampa.Controller.focus($items.get(0));
                  Navigator.focus($items.get(0));
                }
              }, 10);
            }, 200);
          });
        };
        var customAttached = false;
        Lampa.Listener.follow('activity', function () {
          customAttached = false;
          attachToButton();
          setTimeout(attachToButton, 300);
          setTimeout(attachToButton, 600);
        });
      } catch (e) {
        console.error('Scrob', 'patchFullCardBookmark error', e);
      }
    }

    // ─── lampac one-time export (SYNC-ARCHITECTURE-PLAN.md §5.6) ──────────────

    function startLampacExport() {
      if (!hasSession()) {
        Lampa.Noty.show(Lampa.Lang.translate('scrob_lampac_export_need_session'));
        return;
      }

      // Lampa.Loading.setText()/setProgress() (real core API, app.min.js's own
      // Loading module) update the same text line the spinner already shows -
      // a bare start()/stop() with no text left the user unable to tell a big
      // library export apart from a stuck spinner (live feedback 2026-09-18).
      Lampa.Loading.start(function () {
        Lampa.Loading.stop();
      }, Lampa.Lang.translate('scrob_lampac_export_progress_start'));
      run(function (result) {
        Lampa.Loading.stop();
        if (result.error) {
          Lampa.Noty.show(Lampa.Lang.translate('scrob_lampac_export_need_sync'));
          return;
        }
        var text = Lampa.Lang.translate('scrob_lampac_export_done').replace('%watched%', result.watched).replace('%progress%', result.progress).replace('%skipped%', result.skipped).replace('%thrown%', result.listsThrown);
        Lampa.Noty.show(text);
      }, function (stage, current, total) {
        var percent = total ? Math.round(current / total * 100) : 0;
        var label = Lampa.Lang.translate(stage === 'timecodes' ? 'scrob_lampac_export_progress_timecodes' : 'scrob_lampac_export_progress_uploading');
        Lampa.Loading.setProgress(percent, label + ': ' + current + '/' + total);
      });
    }

    // ─── Settings section ─────────────────────────────────────

    function initSettings() {
      Lampa.SettingsApi.addComponent({
        component: 'scrob',
        icon: ICON_SVG,
        name: Lampa.Lang.translate('scrob_title'),
        before: 'interface'
      });

      // Server address
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: KEYS.SERVER_URL,
          type: 'input',
          default: '',
          values: '',
          placeholder: 'https://scrob.example.com'
        },
        field: {
          name: Lampa.Lang.translate('scrob_server_url')
        }
      });

      // Sign-in trigger — one row opening a choice of three standalone methods
      // (API key / login+password / QR code), matching the standalone Scrob
      // Lampa plugin's own menu instead of always-visible input fields.
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: 'scrob_auth_trigger_btn',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_auth_trigger')
        },
        onChange: function onChange() {
          showAuthChoice('settings_component');
        }
      });

      // Current user static line — shown once any of the three methods is
      // signed in (see scrob_auth_trigger_btn above, hidden by then).
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: 'scrob_user_info',
          type: 'static'
        },
        field: {
          name: ''
        },
        onRender: function onRender(item) {
          item.attr('data-name', 'scrob_user_info');
          var me = getMe();
          var text = '';
          if (me.username) {
            text = me.username + (me.email ? ' (' + me.email + ')' : '');
          } else {
            var info = getOwnProfileInfo();
            text = info.display_name || authStatusText();
          }
          item.find('.settings-param__name').text(text);
        }
      });

      // Logout button
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: 'scrob_logout_btn',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_logout')
        },
        onChange: doLogout
      });

      // General sync master switch — controls EVERY kind of sync with the Scrob
      // server (lists, watch progress, and whatever gets added later), not just
      // the list-sync nested page below. Deliberately on the top-level 'scrob'
      // page, before the "List synchronization" button — placing it inside
      // that nested page (as before) misleadingly implied it only gated list
      // sync, when list-sync engine.js and the timeline progress-push module
      // both already gate their own start()/stop() on this exact same flag.
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: KEYS.SYNC_ENABLED,
          type: 'trigger',
          default: false
        },
        field: {
          name: Lampa.Lang.translate('scrob_sync_enabled')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set(KEYS.SYNC_ENABLED, value);
          if (value) {
            // Check for blocking conflicts before starting
            var conflicts = detectConflicts();
            var blocked = false;
            for (var i = 0; i < conflicts.length; i++) {
              if (conflicts[i].type === 'cub_sync') {
                Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_blocked_cub'));
                Lampa.Storage.set(KEYS.SYNC_ENABLED, false);
                blocked = true;
                break;
              }
            }
            if (!blocked) {
              start$1();
              start();
              Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_started'));
            }
          } else {
            stop$1();
            stop();
            Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_stopped'));
          }
        }
      });

      // ── Sync nested page button (after logout block) ─────
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: 'scrob_open_sync',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_sync_title')
        },
        onChange: function onChange() {
          Lampa.Settings.create('scrob_sync_page', {
            onBack: function onBack() {
              Lampa.Settings.create('scrob');
            }
          });
        }
      });

      // ── Prefetch nested page button (right after list sync) ──
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: 'scrob_open_prefetch',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_prefetch_title')
        },
        onChange: function onChange() {
          Lampa.Settings.create('scrob_prefetch_page', {
            onBack: function onBack() {
              Lampa.Settings.create('scrob');
            }
          });
        }
      });

      // ── lampac one-time export button (§5.6) ──
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: 'scrob_lampac_export_btn',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_lampac_export')
        },
        onChange: startLampacExport
      });

      // ── "Останній переглянутий епізод" бейдж на повній картці серіалу ──
      Lampa.SettingsApi.addParam({
        component: 'scrob',
        param: {
          name: KEYS.SHOW_LAST_EPISODE_BADGE,
          type: 'trigger',
          default: true
        },
        field: {
          name: Lampa.Lang.translate('scrob_last_episode_badge')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set(KEYS.SHOW_LAST_EPISODE_BADGE, value);
        }
      });

      // ══════════════════════════════════════════════════════
      //  NESTED PAGE: List sync settings
      // ══════════════════════════════════════════════════════

      // Poll interval select
      Lampa.SettingsApi.addParam({
        component: 'scrob_sync_page',
        param: {
          name: KEYS.SYNC_INTERVAL,
          type: 'select',
          values: {
            15: '15',
            30: '30',
            60: '60',
            120: '120'
          },
          default: '30'
        },
        field: {
          name: Lampa.Lang.translate('scrob_sync_interval'),
          description: Lampa.Lang.translate('scrob_sync_interval_descr')
        },
        onChange: function onChange(value) {
          Lampa.Storage.set(KEYS.SYNC_INTERVAL, value);
        }
      });

      // Manual sync button
      Lampa.SettingsApi.addParam({
        component: 'scrob_sync_page',
        param: {
          name: 'scrob_sync_force_btn',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_sync_now')
        },
        onChange: function onChange() {
          if (!Lampa.Storage.get(KEYS.SYNC_ENABLED)) {
            Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_stopped'));
            return;
          }
          forceSync();
          forcePrefetch();
          Lampa.Noty.show(Lampa.Lang.translate('scrob_sync_now') + '…');
        }
      });

      // ── List mapping button ─────────────────────────────
      Lampa.SettingsApi.addParam({
        component: 'scrob_sync_page',
        param: {
          name: 'scrob_map_btn',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_map_title')
        },
        onChange: showMappingFlow
      });

      // Active mappings button (shown/hidden via settingsListener)
      Lampa.SettingsApi.addParam({
        component: 'scrob_sync_page',
        param: {
          name: 'scrob_map_active_btn',
          type: 'button'
        },
        field: {
          name: Lampa.Lang.translate('scrob_map_active')
        },
        onChange: showActiveMappings
      });

      // Status line (static, updated on render)
      Lampa.SettingsApi.addParam({
        component: 'scrob_sync_page',
        param: {
          name: 'scrob_sync_status',
          type: 'static'
        },
        field: {
          name: ''
        },
        onRender: function onRender(item) {
          item.attr('data-name', 'scrob_sync_status');
          var status = getStatus();
          var nameEl = item.find('.settings-param__name');
          if (!status.running) {
            nameEl.text(Lampa.Lang.translate('scrob_sync_stopped'));
            return;
          }

          // Format last sync time
          var timeText = '—';
          if (status.lastSync) {
            var d = new Date(status.lastSync);
            var hh = ('0' + d.getHours()).slice(-2);
            var mm = ('0' + d.getMinutes()).slice(-2);
            timeText = hh + ':' + mm;
          }
          var text = Lampa.Lang.translate('scrob_sync_status_last') + ': ' + timeText + ' • ' + status.listCount + ' ' + Lampa.Lang.translate('scrob_sync_title').toLowerCase() + ' / ' + status.itemCount;

          // Append conflict warnings
          if (status.conflicts && status.conflicts.length > 0) {
            for (var i = 0; i < status.conflicts.length; i++) {
              var c = status.conflicts[i];
              if (c.type === 'cub_sync') {
                text += '\n' + Lampa.Lang.translate('scrob_sync_blocked_cub');
              } else if (c.type === 'gramsync') {
                text += '\n' + Lampa.Lang.translate('scrob_sync_conflict_gramsync');
              }
            }
          }

          // Append broken mapping warnings
          if (status.brokenMappings && status.brokenMappings.length > 0) {
            for (var b = 0; b < status.brokenMappings.length; b++) {
              text += '\n' + Lampa.Lang.translate('scrob_map_broken').replace('%s', status.brokenMappings[b]);
            }
          }
          nameEl.text(text);
        }
      })

      // ══════════════════════════════════════════════════════
      //  NESTED PAGE: Timeline prefetch settings (§5.2.7)
      // ══════════════════════════════════════════════════════
      // Which Favorite lists feed the batch watch-status prefetch that fills
      // Timeline up front for continue_watch's own ongoing-show filter.
      // `history` defaults on (needed for that filter to work at all); the
      // rest default off to save traffic/startup time on large collections.
    ;
      [{
        key: KEYS.PREFETCH_HISTORY,
        name: 'scrob_prefetch_history',
        def: true
      }, {
        key: KEYS.PREFETCH_BOOK,
        name: 'scrob_prefetch_book',
        def: false
      }, {
        key: KEYS.PREFETCH_LIKE,
        name: 'scrob_prefetch_like',
        def: false
      }, {
        key: KEYS.PREFETCH_WATH,
        name: 'scrob_prefetch_wath',
        def: false
      }].forEach(function (row) {
        Lampa.SettingsApi.addParam({
          component: 'scrob_prefetch_page',
          param: {
            name: row.key,
            type: 'trigger',
            default: row.def
          },
          field: {
            name: Lampa.Lang.translate(row.name)
          },
          onChange: function onChange(value) {
            Lampa.Storage.set(row.key, value);
            // The pool changed - re-collect it on the next `main` visit
            // rather than mid-navigation through the settings screen.
            resetPrefetch();
          }
        });
      });

      // Show/hide rows depending on authorization state (pattern: kinobaza settings.js)
      settingsListener = function settingsListener(e) {
        if (e.name === 'scrob') {
          var body = e.body.find('.scroll__body > div');
          if (hasSession()) {
            body.find('[data-name="scrob_auth_trigger_btn"]').remove();
            if (isLevendeManaged()) {
              // accsdb already supplies server/key directly for this
              // profile - the address is config, not user-editable,
              // and there's no separate log-out action (the bridge
              // owns the switch, not this plugin's own login flow).
              body.find('[data-name="' + KEYS.SERVER_URL + '"]').remove();
              body.find('[data-name="scrob_logout_btn"]').remove();
            }
          } else {
            body.find('[data-name="scrob_user_info"]').remove();
            body.find('[data-name="scrob_logout_btn"]').remove();
            body.find('[data-name="' + KEYS.SYNC_ENABLED + '"]').remove();
            body.find('[data-name="scrob_open_sync"]').remove();
            body.find('[data-name="scrob_open_prefetch"]').remove();
          }
        }

        // Hide sync controls if no session
        if (e.name === 'scrob_sync_page' && !hasSession()) {
          e.body.find('.scroll__body > div').html('');
          return;
        }

        // Hide prefetch controls if no session (same pattern as scrob_sync_page above)
        if (e.name === 'scrob_prefetch_page' && !hasSession()) {
          e.body.find('.scroll__body > div').html('');
          return;
        }

        // Show/hide active mappings button based on whether mappings exist
        if (e.name === 'scrob_sync_page') {
          var map = getMap();
          var hasMappings = Object.keys(map).length > 0;
          var body2 = e.body.find('.scroll__body > div');
          if (!hasMappings) {
            body2.find('[data-name="scrob_map_active_btn"]').addClass('hide');
          } else {
            body2.find('[data-name="scrob_map_active_btn"]').removeClass('hide');
          }
        }
      };
      Lampa.Settings.listener.follow('open', settingsListener);
    }

    // ─── Lifecycle ────────────────────────────────────────────

    // Fetch socket config from admin settings and initialize WebSocket.
    // Only activates for 'external' or 'internal' modes; otherwise polling remains.
    function initSocket() {
      console.log('Scrob', 'initSocket called');
      var username = Lampa.Storage.get(KEYS.USERNAME);
      var password = Lampa.Storage.get(KEYS.PASSWORD);
      console.log('Scrob', 'credentials:', username ? 'yes' : 'no', password ? 'yes' : 'no');

      // Always re-login first to get a fresh token
      if (!username || !password) {
        console.warn('Scrob', 'no credentials for login — using polling');
        return;
      }
      login(username, password, function (token) {
        if (!token || !token.access_token) {
          console.warn('Scrob', 'login failed — using polling');
          return;
        }

        // Save fresh token
        Lampa.Storage.set(KEYS.ACCESS_TOKEN, token.access_token);
        console.log('Scrob', 'login successful, token saved');

        // Now fetch admin settings with fresh token
        adminSettings(function (settings) {
          console.log('Scrob', 'adminSettings received:', JSON.stringify(settings));
          startSocket(settings);
        }, function (err) {
          console.warn('Scrob', 'adminSettings failed:', err, '- using polling');
        });
      }, function (err) {
        console.warn('Scrob', 'login request failed:', err, '- using polling');
      });
      function startSocket(settings) {
        if (settings.socket_mode === 'external' || settings.socket_mode === 'internal') {
          var me = getMe();
          var config = {
            mode: settings.socket_mode,
            namespace: settings.socket_namespace,
            externalUrl: settings.socket_external_url,
            host: serverUrl(),
            port: settings.socket_internal_port || 7332,
            joinKey: settings.socket_join_key,
            sendKey: settings.socket_send_key,
            username: me ? me.username : ''
          };
          if (scrobSocketInit(config)) {
            useSocket(getScrobSocket());
            console.log('Scrob', 'socket initialized, mode:', settings.socket_mode);
          }
        } else {
          console.log('Scrob', 'socket disabled, using polling');
        }
      }
    }

    // Re-render header button from saved session on startup
    function restoreSession() {
      if (hasSession()) {
        // updateHeaderButton() (not renderHeaderButton() directly) - two
        // separate reasons this matters:
        // 1. A plain render never kicks off ensureOwnProfileInfo(), so an
        //    API-key-only or QR-paired session established in an EARLIER page
        //    load never got its GET /profile/me fetched on a plain app
        //    restart: ownProfileInfo is in-memory-only (storage.js) and
        //    starts null every page load, so the header avatar and
        //    scrob_user_info in Settings stayed stuck on the generic
        //    "?"/authStatusText() fallback no matter how many times Settings
        //    was reopened, even though the credential itself was perfectly
        //    valid and /profile/me would have returned a real display_name
        //    if only anyone had asked it to.
        // 2. A plain render also never respects isLevendeActive() - the icon
        //    reappeared on every page load regardless of the persisted flag
        //    (the flag was read correctly, this call site just never
        //    consulted it).
        updateHeaderButton();

        // Start sync if enabled (lifecycle wiring)
        if (Lampa.Storage.get(KEYS.SYNC_ENABLED)) {
          start$1();
          start();
        }
      }
    }

    // Wires the levende/lampa-plugins "profiles.js" bridge (utils/levende-bridge.js)
    // to Lampa's own event bus. Registered unconditionally and early - both events
    // are plain Lampa.Listener subscriptions, safe before window.appready, and
    // levende's own 'changed' notification (fired at its OWN app-ready handling)
    // must find this listener already attached.
    function initLevendeProfilesBridge() {
      // Credentials may switch either from the real 'state:changed' signal below
      // or from levende-bridge.js's own fallback timer (see its module comment -
      // that signal can be delayed or skipped by levende entirely) - registering
      // this callback covers both paths with a single UI refresh point.
      // refreshCustomMenu() included - levende-bridge.js's own CUSTOM_CATEGORIES_KEY
      // isolation swaps the underlying scrob_custom_categories storage on every
      // apply, but the left-menu items it drives are actual DOM elements that
      // only custom.js's own registerBookmarksRows()/patchCardMenu() re-read
      // eagerly (per-render) - the persistent menu itself only re-renders when
      // told to, otherwise it'd keep showing the outgoing profile's categories
      // until an unrelated refresh (e.g. a full reload) happened to call this.
      setOnApply(function () {
        updateHeaderButton();
        refreshSettings();
        refreshCustomMenu();
      });

      // Badges levende's OWN profile picker rows with a status dot - safe to
      // call unconditionally here since it only touches Lampa.Select.show once
      // and no-ops on a repeat call.
      patchProfileSelect()

      // updateLevendeHeaderDot() already re-runs on every real apply
      // (onApplyCallback above), but that can take up to
      // APPLY_FALLBACK_DELAY_MS (2s) on a cold load if the real levende
      // 'state:changed' signal is slow or skipped - and levende's own header
      // icon needs its own network round-trip (Plugin().start(), ~500ms self-
      // imposed delay) before it even exists to decorate. Short dedicated
      // retry so the dot doesn't sit missing for that whole window.
    ;
      [500, 1500, 3000].forEach(function (delay) {
        setTimeout(updateLevendeHeaderDot, delay);
      });

      // If levende was active last session but got removed/disabled since,
      // nothing will ever fire again to correct the persisted flags below -
      // this arms a one-time fallback that resets them if no real 'profile'
      // event confirms them within a generous window.
      checkStaleLevendeState();
      Lampa.Listener.follow('profile', function (e) {
        stageProfile(e);
      });
      Lampa.Listener.follow('state:changed', function (e) {
        if (!e || e.target !== 'favorite' || e.reason !== 'read') return;
        applyPendingProfile();
      });
    }
    function startPlugin() {
      console.log('Scrob', 'startPlugin called');
      window.scrob_plugin = true;
      Lampa.Manifest.plugins = {
        type: 'other',
        version: '1.0.0',
        name: 'Scrob',
        description: 'Scrob server profiles and watch data isolation',
        component: 'scrob'
      };
      addLang();
      Lampa.Template.add('scrob_style', '<style>@charset "UTF-8";\n/* Scrob plugin styles */\n/* Header profile button avatar */\n.scrob-avatar {\n  width: 1.8em;\n  height: 1.8em;\n  border-radius: 50%;\n  object-fit: cover;\n  display: block;\n}\n\n/* Letter avatar: first letter of username on colored background */\n.scrob-avatar--letter {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #fff;\n  font-weight: 700;\n  font-size: 0.9em;\n  line-height: 1;\n  text-transform: uppercase;\n  user-select: none;\n}\n\n/* Larger avatar inside the profile selectbox list */\n.selectbox-item .scrob-avatar {\n  width: 2.6em;\n  height: 2.6em;\n  font-size: 1em;\n}\n\n/* Status dot overlaid on levende\'s OWN header profile icon\n   (.open--profile.levende - third-party markup, not ours). Red when the\n   ACTIVE profile has no working Scrob session, green when it does -\n   plain red/green rather than this plugin\'s own purple/pink branding,\n   as requested: a quick at-a-glance signal distinct from the picker\'s own\n   recolored-logo badge below. position:relative scoped to this one\n   selector so it can\'t affect anything else sharing .head__action. */\n.open--profile.levende {\n  position: relative;\n}\n\n.scrob-levende-header-dot {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  width: 0.55em;\n  height: 0.55em;\n  border-radius: 50%;\n  background: #E05252;\n  box-shadow: 0 0 0 0.12em rgba(0, 0, 0, 0.6);\n  pointer-events: none;\n}\n\n.scrob-levende-header-dot--ok {\n  background: #4CAF50;\n}\n\n/* Scrob logo prepended to a levende profile\'s name in ITS OWN picker\n   (levende-bridge.js) - gradient colors swap to red when the bridge\n   considers that profile not authorized (misconfigured accsdb pair, or\n   never signed in), the normal purple/pink gradient otherwise. Prepended\n   rather than appended: levende already marks the current profile at the\n   END of the row via a CSS-only "selected" class, no title text involved.\n   No intrinsic width/height on the SVG itself (only viewBox) - without\n   this it falls back to the browser\'s replaced-element default (300x150),\n   dwarfing the row text. */\n.scrob-levende-status-icon {\n  display: inline-block;\n  width: 1em;\n  height: 1.08em;\n  vertical-align: -0.15em;\n  margin-right: 0.35em;\n}\n\n/* QR device-pairing modal */\n.scrob-qr-wrap {\n  text-align: center;\n  padding: 1.5em 1em;\n}\n\n.scrob-qr-code {\n  display: flex;\n  justify-content: center;\n  margin: 0 auto 1em;\n}\n\n.scrob-qr-code svg {\n  width: 14em;\n  height: 14em;\n  background: #fff;\n  padding: 0.6em;\n  border-radius: 0.3em;\n}\n\n.scrob-qr-user-code {\n  font-size: 1.8em;\n  font-weight: 700;\n  letter-spacing: 0.15em;\n  margin-bottom: 0.6em;\n}\n\n.scrob-qr-hint {\n  font-size: 0.9em;\n  color: #bbbbbb;\n  max-width: 26em;\n  margin: 0 auto;\n}\n\n.scrob-qr-manual {\n  font-size: 0.85em;\n  color: #888888;\n  max-width: 26em;\n  margin: 0.6em auto 0;\n  word-break: break-all;\n}\n\n/* "Останній переглянутий епізод" бейдж на повній картці серіалу */\n.full-start-new__details.scrob-last-episode {\n  display: flex;\n  align-items: center;\n  color: #fff;\n}\n\n.scrob-last-episode__icon {\n  width: 18px;\n  height: 18px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  margin-right: 0.5em;\n}\n\n.scrob-last-episode__icon svg {\n  width: 100%;\n  height: 100%;\n  display: block;\n}\n\n.scrob-last-episode__new {\n  display: inline-flex;\n  align-items: center;\n  margin-left: 0.7em;\n  color: #C147D8;\n  font-weight: 600;\n}\n\n.scrob-last-episode__dot {\n  width: 0.5em;\n  height: 0.5em;\n  border-radius: 50%;\n  background: #C147D8;\n  margin-right: 0.4em;\n  flex-shrink: 0;\n}</style>');
      $('body').append(Lampa.Template.get('scrob_style', {}, true));

      // Nested page templates
      Lampa.Template.add('settings_scrob_sync_page', '<div></div>');
      Lampa.Template.add('settings_scrob_prefetch_page', '<div></div>');

      // Register custom category viewer component
      Lampa.Component.add('scrob_category', component);
      initSettings();
      initLevendeProfilesBridge();

      // Register bookmarks rows once — displays custom categories on bookmarks screen
      registerBookmarksRows();

      // Inject custom categories into card long-press menu
      patchCardMenu();

      // Inject custom categories into full card bookmark button
      patchFullCardBookmark();

      // "Останній переглянутий епізод" бейдж на повній картці серіалу
      init(ICON_SVG);
      if (window.appready) {
        restoreSession();
        refreshCustomMenu();
        initSocket();
        ensureDeviceTokenFresh();
      } else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type === 'ready') {
            restoreSession();
            refreshCustomMenu();
            initSocket();
            ensureDeviceTokenFresh();
          }
        });
      }

      // Keep the QR-paired device token from expiring under a long-running app —
      // checked well before actual expiry (see DEVICE_TOKEN_REFRESH_BUFFER_MS).
      setInterval(ensureDeviceTokenFresh, 2 * 60 * 1000);

      // Clean up socket on app destroy
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'destroy') scrobSocketDisconnect();
      });
    }
    if (!window.scrob_plugin) startPlugin();

})();
