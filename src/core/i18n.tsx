/* Локализация: словарь ru/en, контекст и хук useI18n */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

const STORAGE_KEY = "forgekit-lang";

const dict = {
  /* --- Реестр: категории --- */
  "cat.dashboard": { ru: "Главная", en: "Dashboard" },
  "cat.clipboard": { ru: "История буфера обмена", en: "Clipboard History" },
  "cat.files": { ru: "Файлы", en: "Files" },
  "cat.developer": { ru: "Разработка", en: "Developer" },
  "cat.system": { ru: "Система", en: "System" },
  "cat.network": { ru: "Сеть", en: "Network" },
  "cat.security": { ru: "Безопасность", en: "Security" },
  "cat.graphics": { ru: "Графика", en: "Graphics" },
  "cat.text": { ru: "Текст", en: "Text" },
  "cat.documents": { ru: "PDF", en: "PDF" },
  "cat.plugins": { ru: "Плагины", en: "Plugins" },
  "cat.settings": { ru: "Настройки", en: "Settings" },

  /* --- Реестр: инструменты --- */
  "tool.dashboard.name": { ru: "Главная", en: "Dashboard" },
  "tool.dashboard.desc": { ru: "Обзор и быстрые действия", en: "Overview and quick actions" },
  "tool.clipboard.name": { ru: "История буфера обмена", en: "Clipboard History" },
  "tool.clipboard.desc": { ru: "История буфера обмена с поиском, закреплением и избранным", en: "Clipboard history with search, pinning and favorites" },
  "tool.duplicate-finder.name": { ru: "Поиск дубликатов", en: "Duplicate Finder" },
  "tool.duplicate-finder.desc": { ru: "Находит повторяющиеся файлы по хэшу содержимого", en: "Finds duplicate files by content hash" },
  "tool.bulk-rename.name": { ru: "Массовое переименование", en: "Bulk Rename" },
  "tool.bulk-rename.desc": { ru: "Переименовывает сразу все файлы в папке по шаблону", en: "Renames all files in a folder by template" },
  "tool.file-organizer.name": { ru: "Организация файлов", en: "File Organizer" },
  "tool.file-organizer.desc": { ru: "Раскладывает файлы по папкам по типу или расширению", en: "Sorts files into folders by type or extension" },
  "tool.file-size-analyzer.name": { ru: "Анализ размера файлов", en: "File Size Analyzer" },
  "tool.file-size-analyzer.desc": { ru: "Показывает, какие файлы и папки занимают больше всего места", en: "Shows which files and folders take the most space" },
  "tool.json-formatter.name": { ru: "JSON Formatter", en: "JSON Formatter" },
  "tool.json-formatter.desc": { ru: "Форматирование и валидация JSON-данных", en: "Format and validate JSON data" },
  "tool.json-diff.name": { ru: "JSON Diff", en: "JSON Diff" },
  "tool.json-diff.desc": { ru: "Сравнение двух JSON или текстовых версий", en: "Compare two JSON or text versions" },
  "tool.regex-tester.name": { ru: "Regex Tester", en: "Regex Tester" },
  "tool.regex-tester.desc": { ru: "Проверка регулярных выражений в реальном времени", en: "Test regular expressions in real time" },
  "tool.hash-generator.name": { ru: "Генератор хэшей", en: "Hash Generator" },
  "tool.hash-generator.desc": { ru: "MD5, SHA-1, SHA-256, SHA-512 для любой строки", en: "MD5, SHA-1, SHA-256, SHA-512 for any string" },
  "tool.uuid.name": { ru: "UUID Generator", en: "UUID Generator" },
  "tool.uuid.desc": { ru: "Генерация UUID v4 и v7", en: "Generate UUID v4 and v7" },
  "tool.base64.name": { ru: "Base64 Encoder", en: "Base64 Encoder" },
  "tool.base64.desc": { ru: "Кодирование и декодирование Base64", en: "Encode and decode Base64" },
  "tool.url-codec.name": { ru: "URL Codec", en: "URL Codec" },
  "tool.url-codec.desc": { ru: "Кодирование и декодирование URL-строк", en: "Encode and decode URL strings" },
  "tool.jwt-decoder.name": { ru: "JWT Decoder", en: "JWT Decoder" },
  "tool.jwt-decoder.desc": { ru: "Расшифровка заголовка и payload JWT-токена", en: "Decode JWT header and payload" },
  "tool.markdown-preview.name": { ru: "Markdown Preview", en: "Markdown Preview" },
  "tool.markdown-preview.desc": { ru: "Редактор Markdown с предпросмотром", en: "Markdown editor with live preview" },
  "tool.cron-parser.name": { ru: "Cron Parser", en: "Cron Parser" },
  "tool.cron-parser.desc": { ru: "Разбор cron-выражений и ближайшие запуски", en: "Parse cron expressions and next runs" },
  "tool.system-info.name": { ru: "Сведения о системе", en: "System Info" },
  "tool.system-info.desc": { ru: "ОС, процессор, память, диски и время работы", en: "OS, CPU, memory, disks and uptime" },
  "tool.process-viewer.name": { ru: "Процессы", en: "Processes" },
  "tool.process-viewer.desc": { ru: "Список запущенных процессов и их использование памяти", en: "Running processes and their memory usage" },
  "tool.unit-converter.name": { ru: "Конвертер единиц", en: "Unit Converter" },
  "tool.unit-converter.desc": { ru: "Длина, вес, данные, скорость, температура, площадь", en: "Length, weight, data, speed, temperature, area" },
  "tool.date-time-converter.name": { ru: "Конвертер дат", en: "Date & Time Converter" },
  "tool.date-time-converter.desc": { ru: "Unix-время, ISO 8601, локальные форматы дат", en: "Unix time, ISO 8601, local date formats" },
  "tool.ping.name": { ru: "Ping", en: "Ping" },
  "tool.ping.desc": { ru: "Проверка доступности хоста и задержки", en: "Check host availability and latency" },
  "tool.port-scanner.name": { ru: "Сканер портов", en: "Port Scanner" },
  "tool.port-scanner.desc": { ru: "Проверка открытых портов на хосте", en: "Check open ports on a host" },
  "tool.ip-lookup.name": { ru: "Мой IP", en: "My IP" },
  "tool.ip-lookup.desc": { ru: "Определение публичного IP-адреса", en: "Find out your public IP address" },
  "tool.http-status.name": { ru: "HTTP Status Codes", en: "HTTP Status Codes" },
  "tool.http-status.desc": { ru: "Справочник кодов ответов HTTP", en: "Reference of HTTP response status codes" },
  "tool.whois.name": { ru: "WHOIS", en: "WHOIS" },
  "tool.whois.desc": { ru: "Информация о домене: владелец, даты, серверы", en: "Domain info: owner, dates, servers" },
  "tool.password-generator.name": { ru: "Генератор паролей", en: "Password Generator" },
  "tool.password-generator.desc": { ru: "Надёжные пароли с настраиваемым набором символов", en: "Strong passwords with customizable character sets" },
  "tool.password-strength.name": { ru: "Проверка пароля", en: "Password Checker" },
  "tool.password-strength.desc": { ru: "Оценка надёжности пароля по набору критериев", en: "Password strength evaluation by a set of criteria" },
  "tool.aes-encrypt.name": { ru: "AES Шифрование", en: "AES Encryption" },
  "tool.aes-encrypt.desc": { ru: "AES-256-GCM шифрование и расшифровка текста", en: "AES-256-GCM encrypt and decrypt text" },
  "tool.text-obfuscator.name": { ru: "Маскировка текста", en: "Text Obfuscator" },
  "tool.text-obfuscator.desc": { ru: "Преобразование текста в набор цифр и символов", en: "Transform text into digits and symbols" },
  "tool.color-picker.name": { ru: "Палитра цветов", en: "Color Picker" },
  "tool.color-picker.desc": { ru: "Конвертация HEX, RGB, HSL и CMYK", en: "Convert HEX, RGB, HSL and CMYK" },
  "tool.image-converter.name": { ru: "Конвертер изображений", en: "Image Converter" },
  "tool.image-converter.desc": { ru: "PNG, JPEG, WebP, GIF, BMP, TIFF — любой формат в любой", en: "PNG, JPEG, WebP, GIF, BMP, TIFF — any format to any" },
  "tool.image-compressor.name": { ru: "Сжатие изображений", en: "Image Compressor" },
  "tool.image-compressor.desc": { ru: "Уменьшение размера JPG, PNG и WebP с выбором качества", en: "Reduce JPG, PNG and WebP size with quality control" },
  "tool.image-resizer.name": { ru: "Изменение размера", en: "Image Resizer" },
  "tool.image-resizer.desc": { ru: "Масштабирование изображений под нужные размеры", en: "Resize images to target dimensions" },
  "tool.qr-generator.name": { ru: "QR-коды", en: "QR Codes" },
  "tool.qr-generator.desc": { ru: "Генерация QR-кода из текста или ссылки", en: "Generate QR codes from text or links" },
  "tool.svg-optimizer.name": { ru: "SVG Optimizer", en: "SVG Optimizer" },
  "tool.svg-optimizer.desc": { ru: "Минификация SVG-разметки: убирает пробелы и комментарии", en: "Minify SVG markup: removes whitespace and comments" },
  "tool.case-converter.name": { ru: "Конвертер регистра", en: "Case Converter" },
  "tool.case-converter.desc": { ru: "UPPER, lower, Title Case, camelCase, snake_case и другие", en: "UPPER, lower, Title Case, camelCase, snake_case and more" },
  "tool.text-counter.name": { ru: "Счётчик текста", en: "Text Counter" },
  "tool.text-counter.desc": { ru: "Символы, слова, строки, предложения и другая статистика", en: "Characters, words, lines, sentences and other statistics" },
  "tool.text-diff.name": { ru: "Сравнение текстов", en: "Text Diff" },
  "tool.text-diff.desc": { ru: "Построчное сравнение двух версий текста", en: "Line-by-line comparison of two text versions" },
  "tool.lorem-ipsum.name": { ru: "Lorem Ipsum", en: "Lorem Ipsum" },
  "tool.lorem-ipsum.desc": { ru: "Генератор текста-заглушки для вёрстки", en: "Lorem ipsum generator for layouts" },
  "tool.slug-generator.name": { ru: "Slug Generator", en: "Slug Generator" },
  "tool.slug-generator.desc": { ru: "Транслитерация и создание URL-slug из названий", en: "Transliteration and URL slug generation" },
  "tool.alphabetizer.name": { ru: "Сортировка строк", en: "Sort Lines" },
  "tool.alphabetizer.desc": { ru: "Алфавитная сортировка, по длине, удаление дубликатов", en: "Alphabetical sort, by length, remove duplicates" },
  "tool.unicode-info.name": { ru: "Unicode Info", en: "Unicode Info" },
  "tool.unicode-info.desc": { ru: "Коды символов: Unicode, эскейпы, десятичные значения", en: "Character codes: Unicode, escapes, decimal values" },
  "tool.regex-replace.name": { ru: "Regex Replace", en: "Regex Replace" },
  "tool.regex-replace.desc": { ru: "Поиск и замена текста по регулярному выражению", en: "Search and replace text with regular expressions" },
  "tool.pdf-merge.name": { ru: "Объединение PDF", en: "Merge PDF" },
  "tool.pdf-merge.desc": { ru: "Склейка нескольких PDF-файлов в один документ", en: "Merge multiple PDF files into one document" },
  "tool.pdf-split.name": { ru: "Разделение PDF", en: "Split PDF" },
  "tool.pdf-split.desc": { ru: "Разрезка PDF на части по диапазонам страниц", en: "Split PDF into parts by page ranges" },
  "tool.pdf-info.name": { ru: "Информация о PDF", en: "PDF Info" },
  "tool.pdf-info.desc": { ru: "Страницы, версия, метаданные документа", en: "Pages, version, document metadata" },
  "tool.image-to-pdf.name": { ru: "Изображение в PDF", en: "Image to PDF" },
  "tool.image-to-pdf.desc": { ru: "Сборка изображений в один PDF-документ", en: "Build one PDF document from images" },
  "tool.pdf-to-images.name": { ru: "PDF в изображения", en: "PDF to Images" },
  "tool.pdf-to-images.desc": { ru: "Рендер каждой страницы PDF в PNG (требуется poppler)", en: "Render each PDF page to PNG (requires poppler)" },
  "tool.pdf-compress.name": { ru: "Оптимизация PDF", en: "Optimize PDF" },
  "tool.pdf-compress.desc": { ru: "Уменьшение размера PDF за счёт удаления лишних объектов", en: "Reduce PDF size by removing unnecessary objects" },
  "tool.plugins.name": { ru: "Плагины", en: "Plugins" },
  "tool.plugins.desc": { ru: "Модули расширения ForgeKit", en: "ForgeKit extension modules" },
  "tool.settings.name": { ru: "Настройки", en: "Settings" },
  "tool.settings.desc": { ru: "Параметры приложения", en: "Application settings" },
  "tool.about.name": { ru: "О приложении", en: "About" },
  "tool.about.desc": { ru: "Версия и информация о ForgeKit", en: "Version and info about ForgeKit" },

  /* --- Оболочка --- */
  "app.searchPlaceholder": { ru: "Поиск инструментов…", en: "Search tools…" },
  "app.plugins": { ru: "Плагины", en: "Plugins" },
  "app.settings": { ru: "Настройки", en: "Settings" },
  "app.tools": { ru: "Инструменты", en: "Tools" },
  "app.ready": { ru: "Готово", en: "Ready" },
  "app.tagline": { ru: "40+ инструментов в одном приложении", en: "40+ tools in one app" },
  "app.toolsInCategory": { ru: "{n} инструментов в категории", en: "{n} tools in category" },
  "app.minimize": { ru: "Свернуть", en: "Minimize" },
  "app.maximize": { ru: "Развернуть / восстановить", en: "Maximize / restore" },
  "app.close": { ru: "Закрыть", en: "Close" },
  "app.updateAvailable": { ru: "Доступна версия {v}", en: "Version {v} available" },

  /* --- Поиск --- */
  "search.noResults": { ru: "Ничего не найдено", en: "Nothing found" },
  "search.noResultsFor": { ru: "По запросу «{q}» ничего не нашлось", en: "No results for “{q}”" },
  "search.navigate": { ru: "навигация", en: "navigate" },
  "search.open": { ru: "открыть", en: "open" },
  "search.close": { ru: "закрыть", en: "close" },

  /* --- Dashboard --- */
  "dash.welcomeFirst": { ru: "Добро пожаловать!", en: "Welcome!" },
  "dash.welcomeBack": { ru: "С возвращением", en: "Welcome back" },
  "dash.subFirst": { ru: "Рады видеть вас в ForgeKit. Выберите инструмент, чтобы начать работу — всё уже под рукой.", en: "Glad to see you in ForgeKit. Pick a tool to get started — everything is at hand." },
  "dash.subBack": { ru: "Выберите инструмент, чтобы начать работу. Все инструменты доступны в один клик.", en: "Pick a tool to get started. All tools are one click away." },
  "dash.quickActions": { ru: "Быстрые действия", en: "Quick actions" },
  "dash.recentClipboard": { ru: "Недавние элементы буфера обмена", en: "Recent clipboard items" },
  "dash.allRecords": { ru: "Все записи", en: "All items" },
  "kind.image": { ru: "Изображение", en: "Image" },
  "kind.link": { ru: "Ссылка", en: "Link" },
  "kind.text": { ru: "Текст", en: "Text" },
  "kind.code": { ru: "Код", en: "Code" },

  /* --- Буфер обмена (инструмент) --- */
  "clip.search": { ru: "Поиск по истории…", en: "Search history…" },
  "clip.filter.all": { ru: "Все", en: "All" },
  "clip.filter.text": { ru: "Текст", en: "Text" },
  "clip.filter.link": { ru: "Ссылки", en: "Links" },
  "clip.filter.image": { ru: "Изображения", en: "Images" },
  "clip.filter.favorites": { ru: "Избранное", en: "Favorites" },
  "clip.filter.pinned": { ru: "Закреплённые", en: "Pinned" },
  "clip.count": { ru: "Записей: {n}", en: "Items: {n}" },
  "clip.loading": { ru: "Загрузка…", en: "Loading…" },
  "clip.clear": { ru: "Очистить историю", en: "Clear history" },
  "clip.clearConfirm": { ru: "Очистить всю историю буфера обмена?", en: "Clear the entire clipboard history?" },
  "clip.copied": { ru: "Скопировано в буфер", en: "Copied to clipboard" },
  "clip.emptyTitle": { ru: "История пуста", en: "History is empty" },
  "clip.emptyDesc": { ru: "Скопируйте любой текст, ссылку или изображение — ForgeKit сохранит их здесь автоматически", en: "Copy any text, link or image — ForgeKit will save it here automatically" },
  "clip.noResultsTitle": { ru: "Ничего не найдено", en: "Nothing found" },
  "clip.noResultsDesc": { ru: "Попробуйте изменить запрос или фильтр", en: "Try changing the query or filter" },
  "clip.pin": { ru: "Закрепить", en: "Pin" },
  "clip.unpin": { ru: "Открепить", en: "Unpin" },
  "clip.favorite": { ru: "В избранное", en: "Favorite" },
  "clip.unfavorite": { ru: "Убрать из избранного", en: "Remove from favorites" },
  "clip.delete": { ru: "Удалить", en: "Delete" },

  /* --- Настройки --- */
  "set.language": { ru: "Язык интерфейса", en: "Interface language" },
  "set.languageDesc": { ru: "Русский или английский", en: "Russian or English" },
  "set.theme": { ru: "Тема оформления", en: "Theme" },
  "set.themeDesc": { ru: "Светлая, тёмная или по настройкам системы", en: "Light, dark or follow system settings" },
  "set.theme.system": { ru: "Система", en: "System" },
  "set.theme.light": { ru: "Светлая", en: "Light" },
  "set.theme.dark": { ru: "Тёмная", en: "Dark" },
  "set.monitor": { ru: "Мониторинг буфера обмена", en: "Clipboard monitoring" },
  "set.monitorDesc": { ru: "Автоматически сохранять новые копирования в историю", en: "Automatically save new copies to history" },
  "set.limit": { ru: "Лимит истории буфера", en: "Clipboard history limit" },
  "set.limitDesc": { ru: "Максимальное количество записей, хранимых в базе", en: "Maximum number of entries stored in the database" },
  "set.hotkey": { ru: "Глобальный хоткей", en: "Global hotkey" },
  "set.hotkeyDesc": { ru: "Ctrl+Space — открыть глобальный поиск в любом приложении", en: "Ctrl+Space — open global search in any app" },
  "set.onboarding": { ru: "Интерактивный инструктаж", en: "Interactive tour" },
  "set.onboardingDesc": { ru: "Ещё раз пройти обучение по основным возможностям", en: "Review the main features once more" },
  "set.show": { ru: "Показать", en: "Show" },
  "set.about": { ru: "О приложении", en: "About" },
  "set.aboutDesc": { ru: "Версия, проверка обновлений и информация о ForgeKit", en: "Version, update check and ForgeKit info" },
  "set.open": { ru: "Открыть", en: "Open" },
  "set.save": { ru: "Сохранить", en: "Save" },
  "set.saved": { ru: "Сохранено", en: "Saved" },
  "set.storage": { ru: "Настройки хранятся в SQLite (app_data_dir)", en: "Settings are stored in SQLite (app_data_dir)" },

  /* --- О приложении --- */
  "about.check": { ru: "Проверить обновления", en: "Check for updates" },
  "about.checking": { ru: "Проверка…", en: "Checking…" },
  "about.love": { ru: "Собрано с любовью и вниманием к деталям", en: "Made with love and attention to detail" },
  "about.stats": { ru: "Более {t} инструментов в {c} категориях", en: "More than {t} tools across {c} categories" },
  "about.version": { ru: "Версия {v}", en: "Version {v}" },
  "about.checkingUpd": { ru: "Проверка наличия обновлений…", en: "Checking for updates…" },
  "about.upToDate": { ru: "Актуальная версия — обновления не требуются", en: "You are up to date — no updates required" },
  "about.newVersion": { ru: "Доступна новая версия {v}", en: "New version {v} is available" },
  "about.download": { ru: "Скачать", en: "Download" },
  "about.error": { ru: "Не удалось проверить обновления", en: "Failed to check for updates" },
  "about.hint": { ru: "Нажмите «Проверить обновления»", en: "Press “Check for updates”" },

  /* --- Плагины --- */
  "plg.search": { ru: "Поиск плагинов…", en: "Search plugins…" },
  "plg.statusLeft": { ru: "Плагины — это модули расширения ForgeKit", en: "Plugins are ForgeKit extension modules" },
  "plg.installed": { ru: "Установлено: {a} из {b}", en: "Installed: {a} of {b}" },
  "plg.none": { ru: "Плагины не найдены", en: "No plugins found" },
  "plg.noneDesc": { ru: "Попробуйте изменить запрос", en: "Try changing the query" },
  "plg.installedBadge": { ru: "Установлен", en: "Installed" },
  "plg.install": { ru: "Установить", en: "Install" },
  "plg.desc.clipboard-manager": { ru: "История и восстановление буфера обмена", en: "Clipboard history and restore" },
  "plg.desc.global-shortcut": { ru: "Глобальный хоткей Ctrl+Space", en: "Global hotkey Ctrl+Space" },
  "plg.desc.dialog": { ru: "Системные диалоги выбора файлов", en: "System file picker dialogs" },
  "plg.desc.opener": { ru: "Открытие ссылок во внешнем браузере", en: "Open links in external browser" },

  /* --- Инструктаж --- */
  "tour.skip": { ru: "Пропустить", en: "Skip" },
  "tour.back": { ru: "Назад", en: "Back" },
  "tour.next": { ru: "Далее", en: "Next" },
  "tour.start": { ru: "Начать работу", en: "Get started" },
  "tour.skipHint": { ru: "пропустить", en: "skip" },
  "tour.0.title": { ru: "Добро пожаловать в ForgeKit", en: "Welcome to ForgeKit" },
  "tour.0.text": { ru: "Более 40 инструментов в одном приложении: от истории буфера обмена до работы с PDF и изображениями. Проведём вас по главному — это займёт меньше минуты.", en: "Over 40 tools in one app: from clipboard history to PDF and image processing. We'll show you the essentials — it takes less than a minute." },
  "tour.1.title": { ru: "Категории инструментов", en: "Tool categories" },
  "tour.1.text": { ru: "Все инструменты разбиты по категориям в левом меню: Файлы, Разработка, Сеть, Безопасность, Графика, Текст и PDF. Клик по категории открывает её инструменты.", en: "All tools are grouped by category in the left menu: Files, Developer, Network, Security, Graphics, Text and PDF. Click a category to open its tools." },
  "tour.2.title": { ru: "Глобальный поиск", en: "Global search" },
  "tour.2.text": { ru: "Нажмите ⌘K (Ctrl+K на Windows/Linux) в любом месте приложения — поиск мгновенно найдёт нужный инструмент по названию или описанию.", en: "Press ⌘K (Ctrl+K on Windows/Linux) anywhere in the app — search instantly finds the tool you need by name or description." },
  "tour.3.title": { ru: "Плагины, настройки и обновления", en: "Plugins, settings and updates" },
  "tour.3.text": { ru: "Сверху справа — быстрый доступ к Плагинам и Настройкам. Обновления проверяются автоматически при запуске: при выходе новой версии здесь появится значок загрузки.", en: "Top right — quick access to Plugins and Settings. Updates are checked automatically on launch: a download icon appears here when a new version is out." },
  "tour.4.title": { ru: "История буфера обмена", en: "Clipboard history" },
  "tour.4.text": { ru: "ForgeKit автоматически сохраняет скопированные тексты, ссылки и изображения. Любую запись можно закрепить, добавить в избранное или вставить повторно.", en: "ForgeKit automatically saves copied texts, links and images. Any entry can be pinned, favorited or pasted again." },
  "tour.5.title": { ru: "Глобальный хоткей", en: "Global hotkey" },
  "tour.5.text": { ru: "Нажмите Ctrl+Space в любом приложении — откроется поиск по инструментам ForgeKit, даже если окно приложения свёрнуто.", en: "Press Ctrl+Space in any app — the ForgeKit tool search opens, even if the app window is minimized." },
  "tour.6.title": { ru: "Тема оформления", en: "Theme" },
  "tour.6.text": { ru: "Тему можно выбрать в Настройках: светлая, тёмная или по системе. Также там настраивается лимит истории буфера обмена.", en: "Choose the theme in Settings: light, dark or system. The clipboard history limit is also configured there." },
  "tour.7.title": { ru: "Всё готово!", en: "You're all set!" },
  "tour.7.text": { ru: "Вы знакомы с основными возможностями ForgeKit. Нажмите «Начать работу» — все инструменты уже ждут вас.", en: "You now know ForgeKit's main features. Press “Get started” — all tools are waiting for you." },

  /* --- Общие --- */
  "app.windowControls": { ru: "Управление окном", en: "Window controls" },
  "app.pickFiles": { ru: "Выберите файлы", en: "Select files" },
  "app.pickFolder": { ru: "Выберите папку", en: "Select folder" },
  "app.saveFile": { ru: "Сохранить файл", en: "Save file" },
  "common.error": { ru: "Ошибка", en: "Error" },
  "common.done": { ru: "Готово", en: "Done" },
  "common.close": { ru: "Закрыть", en: "Close" },
  "common.saved": { ru: "Сохранено", en: "Saved" },
  "common.saving": { ru: "Сохранение…", en: "Saving…" },
  "common.download": { ru: "Скачать", en: "Download" },
  "common.copy": { ru: "Копировать", en: "Copy" },
  "common.copied": { ru: "Скопировано", en: "Copied" },
  "common.loading": { ru: "Загрузка…", en: "Loading…" },
  "common.bytes": { ru: "{n} байт", en: "{n} bytes" },

  /* --- Ping --- */
  "ping.ping": { ru: "Пинг", en: "Ping" },
  "ping.checking": { ru: "Проверка…", en: "Checking…" },
  "ping.check": { ru: "Проверить", en: "Check" },
  "ping.hint": { ru: "TCP-подключение к порту 443 · пинг каждые 2 с", en: "TCP connection to port 443 · ping every 2 s" },
  "ping.up": { ru: "Доступен", en: "Reachable" },
  "ping.down": { ru: "Недоступен", en: "Unreachable" },
  "ping.emptyTitle": { ru: "Проверка доступности", en: "Availability check" },
  "ping.emptyDesc": { ru: "Проверяет доступность хоста и измеряет задержку соединения", en: "Checks host availability and measures connection latency" },
  "ping.host": { ru: "Хост", en: "Host" },
  "ping.latency": { ru: "Задержка", en: "Latency" },
  "ping.status": { ru: "Статус", en: "Status" },
  "ping.ms": { ru: "{n} мс", en: "{n} ms" },

  /* --- Мой IP --- */
  "ip.check": { ru: "Определить IP", en: "Find my IP" },
  "ip.checking": { ru: "Проверка…", en: "Checking…" },
  "ip.hint": { ru: "Внешний адрес определяется через api.ipify.org · обновляется каждые 10 с", en: "Public address via api.ipify.org · refreshes every 10 s" },
  "ip.updated": { ru: "Обновлено: {at}", en: "Updated: {at}" },
  "ip.emptyTitle": { ru: "Определение IP-адреса", en: "Find your IP address" },
  "ip.emptyDesc": { ru: "Узнайте ваш публичный IPv4-адрес", en: "See your public IPv4 address" },
  "ip.yourIp": { ru: "Ваш IP", en: "Your IP" },

  /* --- HTTP Status --- */
  "http.search": { ru: "Поиск по коду или названию…", en: "Search by code or name…" },
  "http.count": { ru: "Всего кодов: {n}", en: "Total codes: {n}" },
  "http.groups": { ru: "Группы: 2xx успех · 3xx редирект · 4xx клиент · 5xx сервер", en: "Groups: 2xx success · 3xx redirect · 4xx client · 5xx server" },
  "http.200": { ru: "Запрос успешно выполнен", en: "Request succeeded" },
  "http.201": { ru: "Ресурс создан", en: "Resource created" },
  "http.202": { ru: "Запрос принят, обработка идёт", en: "Request accepted, processing in progress" },
  "http.204": { ru: "Успех без тела ответа", en: "Success with no response body" },
  "http.301": { ru: "Ресурс перемещён навсегда", en: "Resource moved permanently" },
  "http.302": { ru: "Временное перенаправление", en: "Temporary redirect" },
  "http.304": { ru: "Кэш актуален", en: "Cache is valid" },
  "http.400": { ru: "Некорректный запрос", en: "Malformed request" },
  "http.401": { ru: "Требуется авторизация", en: "Authentication required" },
  "http.403": { ru: "Доступ запрещён", en: "Access forbidden" },
  "http.404": { ru: "Ресурс не найден", en: "Resource not found" },
  "http.405": { ru: "Метод не разрешён", en: "Method not allowed" },
  "http.408": { ru: "Таймаут запроса", en: "Request timeout" },
  "http.409": { ru: "Конфликт состояния", en: "State conflict" },
  "http.410": { ru: "Ресурс удалён навсегда", en: "Resource gone forever" },
  "http.413": { ru: "Слишком большой запрос", en: "Payload too large" },
  "http.415": { ru: "Неподдерживаемый тип данных", en: "Unsupported media type" },
  "http.429": { ru: "Слишком много запросов", en: "Too many requests" },
  "http.500": { ru: "Ошибка сервера", en: "Internal server error" },
  "http.501": { ru: "Не реализовано", en: "Not implemented" },
  "http.502": { ru: "Ошибка шлюза", en: "Bad gateway" },
  "http.503": { ru: "Сервис недоступен", en: "Service unavailable" },
  "http.504": { ru: "Таймаут шлюза", en: "Gateway timeout" },
  "http.505": { ru: "Версия HTTP не поддерживается", en: "HTTP version not supported" },

  /* --- Сведения о системе --- */
  "sys.refresh": { ru: "Обновить данные", en: "Refresh data" },
  "sys.refreshing": { ru: "Обновление…", en: "Refreshing…" },
  "sys.hint": { ru: "Обновляется автоматически каждую секунду", en: "Refreshes automatically every second" },
  "sys.osLabel": { ru: "ОС: {os}", en: "OS: {os}" },
  "sys.emptyTitle": { ru: "Сведения о системе", en: "System info" },
  "sys.emptyDesc": { ru: "Узнайте версию ОС, характеристики и загрузку процессора и памяти", en: "See OS version, hardware specs and CPU/memory load" },
  "sys.getData": { ru: "Получить данные", en: "Get data" },
  "sys.os": { ru: "Операционная система", en: "Operating system" },
  "sys.kernel": { ru: "Ядро", en: "Kernel" },
  "sys.arch": { ru: "Архитектура", en: "Architecture" },
  "sys.hostname": { ru: "Имя машины", en: "Hostname" },
  "sys.cpu": { ru: "Процессор", en: "Processor" },
  "sys.cores": { ru: "Ядер", en: "Cores" },
  "sys.uptime": { ru: "Время работы", en: "Uptime" },
  "sys.uptimeFmt": { ru: "{h} ч {m} мин", en: "{h} h {m} min" },
  "sys.cpuLoad": { ru: "Загрузка CPU {n}%", en: "CPU load {n}%" },
  "sys.memOf": { ru: "Память: {used} из {total}", en: "Memory: {used} of {total}" },
  "sys.diskFree": { ru: "Диск: {free} свободно из {total}", en: "Disk: {free} free of {total}" },

  /* --- Процессы --- */
  "proc.refresh": { ru: "Обновить список", en: "Refresh list" },
  "proc.loading": { ru: "Загрузка…", en: "Loading…" },
  "proc.search": { ru: "Поиск по имени или PID…", en: "Search by name or PID…" },
  "proc.stats": { ru: "Процессов: {n} · отображено: {shown} · обновляется каждые 2 с", en: "Processes: {n} · shown: {shown} · refreshes every 2 s" },
  "proc.memTotal": { ru: "Память всего: {n}", en: "Total memory: {n}" },
  "proc.emptyTitle": { ru: "Список процессов", en: "Process list" },
  "proc.emptyDesc": { ru: "Показывает запущенные приложения и использование памяти", en: "Shows running processes and memory usage" },
  "proc.name": { ru: "Процесс", en: "Process" },
  "proc.mem": { ru: "Память", en: "Memory" },
  "proc.status": { ru: "Статус", en: "Status" },

  /* --- Общие для файловых инструментов --- */
  "files.imgFilter": { ru: "Изображения", en: "Images" },
  "files.count": { ru: "{n} файлов", en: "{n} files" },
  "files.selected": { ru: "Выбрано файлов: {n}", en: "Selected files: {n}" },
  "files.addMore": { ru: "Добавить ещё", en: "Add more" },
  "files.pickImages": { ru: "Выбрать изображения", en: "Pick images" },
  "common.cancelled": { ru: "Отменено", en: "Cancelled" },

  /* --- Конвертер изображений --- */
  "imgc.converting": { ru: "Конвертация…", en: "Converting…" },
  "imgc.convert": { ru: "Конвертировать ({n})", en: "Convert ({n})" },
  "imgc.format": { ru: "Формат", en: "Format" },
  "imgc.hint": { ru: "Конвертация выполняется Rust-командой на изображении", en: "Conversion is handled by the Rust backend" },
  "imgc.emptyTitle": { ru: "Конвертер изображений", en: "Image converter" },
  "imgc.emptyDesc": { ru: "Выберите изображения и переведите их в PNG, JPEG, WebP, GIF, BMP или TIFF", en: "Pick images and convert them to PNG, JPEG, WebP, GIF, BMP or TIFF" },

  /* --- Сжатие изображений --- */
  "imgp.compress": { ru: "Сжать изображения", en: "Compress images" },
  "imgp.compressing": { ru: "Сжатие…", en: "Compressing…" },
  "imgp.quality": { ru: "Качество JPEG: {n}%", en: "JPEG quality: {n}%" },
  "imgp.stats": { ru: "Файлов: {files}", en: "Files: {files}" },
  "imgp.was": { ru: "было {n}", en: "was {n}" },
  "imgp.error": { ru: "Ошибка сжатия", en: "Compression failed" },
  "imgp.emptyTitle": { ru: "Сжатие изображений", en: "Image compression" },
  "imgp.emptyDesc": { ru: "Уменьшите размер JPG/PNG/WebP, сохранив копию рядом с оригиналом", en: "Reduce JPG/PNG/WebP size, keeping a copy next to the original" },
  /* --- Изменение размера изображений --- */
  "imgr.resize": { ru: "Изменить размер", en: "Resize" },
  "imgr.resizing": { ru: "Изменение…", en: "Resizing…" },
  "imgr.custom": { ru: "Свой размер", en: "Custom size" },
  "imgr.hint": { ru: "Пропорции сохраняются автоматически", en: "Aspect ratio is preserved automatically" },
  "imgr.emptyTitle": { ru: "Изменение размера изображений", en: "Image resize" },
  "imgr.emptyDesc": { ru: "Выберите изображения и укажите целевой размер — копия сохранится рядом с оригиналом", en: "Pick images and set a target size — the copy is saved next to the original" },

  /* --- Генератор QR --- */
  "qr.generate": { ru: "Сгенерировать", en: "Generate" },
  "qr.generating": { ru: "Генерация…", en: "Generating…" },
  "qr.placeholder": { ru: "Текст, ссылка, Wi-Fi…", en: "Text, link, Wi-Fi…" },
  "qr.hint": { ru: "QR-код генерируется Rust-командой (crate qrcode)", en: "QR is rendered by a Rust command (qrcode crate)" },
  "qr.savedHint": { ru: "PNG · можно сохранить на диск", en: "PNG · can be saved to disk" },
  "qr.emptyTitle": { ru: "Генератор QR-кодов", en: "QR code generator" },
  "qr.emptyDesc": { ru: "Превратите любую строку в QR-код и сохраните его как PNG", en: "Turn any string into a QR code and save it as PNG" },
  "qr.savePng": { ru: "Сохранить PNG", en: "Save PNG" },

  /* --- Оптимизация SVG --- */
  "svg.hint": { ru: "Сжатие: комментарии, лишние пробелы, двойные кавычки", en: "Minify: comments, extra whitespace, double quotes" },
  "svg.error": { ru: "Ошибка в SVG", en: "Invalid SVG" },
  "svg.stats": { ru: "{before} → {after} байт · −{saved}%", en: "{before} → {after} bytes · −{saved}%" },
  "svg.inputPlaceholder": { ru: "Вставьте SVG…", en: "Paste SVG…" },
  "svg.outputPlaceholder": { ru: "Минифицированный SVG", en: "Minified SVG" },

  /* --- Цвет --- */
  "color.hint": { ru: "Конвертация HEX ↔ RGB ↔ HSL ↔ CMYK", en: "Convert HEX ↔ RGB ↔ HSL ↔ CMYK" },
  "color.palette": { ru: "Палитра", en: "Palette" },
  "color.hidePalette": { ru: "Скрыть палитру", en: "Hide palette" },

  /* --- Markdown Preview --- */
  "md.split": { ru: "Редактор + предпросмотр", en: "Editor + preview" },
  "md.preview": { ru: "Только предпросмотр", en: "Preview only" },
  "md.hint": { ru: "Поддерживается: заголовки, списки, код, ссылки, жирный текст", en: "Supports: headings, lists, code, links, bold text" },
  "md.words": { ru: "Слов: {n}", en: "Words: {n}" },
  /* --- Regex Tester --- */
  "regex.pattern": { ru: "Регулярное выражение", en: "Regular expression" },
  "regex.textPlaceholder": { ru: "Текст для проверки…", en: "Text to test…" },
  "regex.emptyMatch": { ru: "(пустое совпадение)", en: "(empty match)" },
  "regex.matches": { ru: "Совпадений: {n}", en: "Matches: {n}" },
  "regex.chars": { ru: "Всего букв в совпадениях", en: "Total letters in matches" },

  /* --- WHOIS --- */
  "whois.check": { ru: "Запросить whois", en: "Run whois" },
  "whois.checking": { ru: "Запрос…", en: "Querying…" },
  "whois.hint": { ru: "Запрос к whois-серверу по порту 43", en: "Queries the whois server on port 43" },
  "whois.chars": { ru: "Символов: {n}", en: "Chars: {n}" },
  "whois.emptyDesc": { ru: "Показывает владельца домена, даты регистрации и истечения", en: "Shows domain owner, registration and expiry dates" },

  /* --- Дата и время --- */
  "dt.now": { ru: "Текущее время", en: "Current time" },
  "dt.convert": { ru: "Перевод даты", en: "Convert date" },
  "dt.localTz": { ru: "Все времена в local timezone", en: "All times are in local timezone" },
  "dt.unixSec": { ru: "Unix (секунды)", en: "Unix (seconds)" },
  "dt.unixMs": { ru: "Unix (миллисекунды)", en: "Unix (milliseconds)" },
  "dt.localDate": { ru: "Локальная дата", en: "Local date" },
  "dt.datetime": { ru: "Дата/время", en: "Date/time" },
  "dt.inputPlaceholder": { ru: "2026-08-05T12:34:56 или секунды…", en: "2026-08-05T12:34:56 or seconds…" },
  "dt.parseError": { ru: "Формат не распознан", en: "Format not recognized" },

  /* --- Сканер портов --- */
  "ps.common": { ru: "Частые", en: "Common" },
  "ps.web": { ru: "Web", en: "Web" },
  "ps.db": { ru: "Базы данных", en: "Databases" },
  "ps.custom": { ru: "Свои", en: "Custom" },
  "ps.scan": { ru: "Сканировать", en: "Scan" },
  "ps.scanning": { ru: "Сканирование…", en: "Scanning…" },
  "ps.hint": { ru: "Порты проверяются последовательно TCP-подключением", en: "Ports are probed sequentially via TCP connect" },
  "ps.open": { ru: "Открыто: {open} из {total}", en: "Open: {open} of {total}" },
  "ps.customPlaceholder": { ru: "22,80,443 или 20-25", en: "22,80,443 or 20-25" },
  "ps.emptyTitle": { ru: "Сканирование портов", en: "Port scanning" },
  "ps.emptyDesc": { ru: "Проверяет, какие порты открыты на хосте, и подписывает известные сервисы", en: "Checks which ports are open on a host and labels known services" },
  "ps.noneTitle": { ru: "Открытых портов нет", en: "No open ports" },
  "ps.noneDesc": { ru: "Все проверенные порты закрыты или не отвечают", en: "All checked ports are closed or not responding" },
  "ps.openStatus": { ru: "открыт", en: "open" },

  /* --- Сортировка строк --- */
  "alphabet.apply": { ru: "Применить", en: "Apply" },
  "alphabet.az": { ru: "А–Я", en: "A–Z" },
  "alphabet.za": { ru: "Я–А", en: "Z–A" },
  "alphabet.length": { ru: "По длине", en: "By length" },
  "alphabet.unique": { ru: "Уникальные", en: "Unique" },
  "alphabet.hint": { ru: "Сортировка с учётом кириллицы (ядро Rust)", en: "Sorting with Cyrillic support (Rust core)" },
  "alphabet.lines": { ru: "Строк: {n}", en: "Lines: {n}" },
  "alphabet.placeholder": { ru: "Каждая строка — отдельный элемент…", en: "Each line is a separate item…" },

  /* --- Конвертер регистра --- */
  "case.upper": { ru: "ВЕРХНИЙ", en: "UPPER" },
  "case.lower": { ru: "нижний", en: "lower" },
  "case.title": { ru: "Заглавный", en: "Title Case" },
  "case.sentence": { ru: "Предложение", en: "Sentence" },
  "case.camel": { ru: "camelCase", en: "camelCase" },
  "case.snake": { ru: "snake_case", en: "snake_case" },
  "case.kebab": { ru: "kebab-case", en: "kebab-case" },
  "case.pascal": { ru: "PascalCase", en: "PascalCase" },
  "case.hint": { ru: "Мгновенная конвертация регистра (ядро Rust)", en: "Instant case conversion (Rust core)" },
  "case.chars": { ru: "Символов: {n}", en: "Characters: {n}" },
  "case.placeholder": { ru: "Исходный текст…", en: "Source text…" },

  /* --- Счётчик текста --- */
  "counter.chars": { ru: "Символов", en: "Characters" },
  "counter.noSpace": { ru: "Без пробелов", en: "No spaces" },
  "counter.words": { ru: "Слов", en: "Words" },
  "counter.uniqueWords": { ru: "Уникальных слов", en: "Unique words" },
  "counter.lines": { ru: "Строк", en: "Lines" },
  "counter.sentences": { ru: "Предложений", en: "Sentences" },
  "counter.letters": { ru: "Букв", en: "Letters" },
  "counter.digits": { ru: "Цифр", en: "Digits" },
  "counter.spaces": { ru: "Пробелов", en: "Spaces" },
  "counter.punct": { ru: "Знаков препинания", en: "Punctuation marks" },
  "counter.bytes": { ru: "Байт (UTF-8)", en: "Bytes (UTF-8)" },
  "counter.hint": { ru: "Подсчёт символов, слов, строк и других метрик", en: "Count characters, words, lines and other metrics" },
  "counter.readingMin": { ru: "~ {n} мин чтения", en: "~ {n} min read" },
  "counter.placeholder": { ru: "Вставьте текст…", en: "Paste text…" },

  /* --- Сравнение текстов --- */
  "diff.ignoreCase": { ru: "Игнорировать регистр", en: "Ignore case" },
  "diff.hint": { ru: "LCS-сравнение построчно (ядро Rust)", en: "Line-by-line LCS comparison (Rust core)" },
  "diff.versionA": { ru: "Версия A", en: "Version A" },
  "diff.versionB": { ru: "Версия B", en: "Version B" },
  "diff.identical": { ru: "Тексты идентичны", en: "Texts are identical" },

  /* --- Маскировка текста --- */
  "obfuscate.hide": { ru: "Скрыть текст", en: "Hide text" },
  "obfuscate.reveal": { ru: "Показать скрытое", en: "Reveal hidden" },
  "obfuscate.hint": { ru: "Обратимое преобразование букв в комбинации цифр и символов", en: "Reversible transform of letters into digit and symbol combos" },
  "obfuscate.chars": { ru: "{n} символов", en: "{n} characters" },
  "obfuscate.hidePlaceholder": { ru: "Публичный текст для маскировки…", en: "Public text to hide…" },
  "obfuscate.revealPlaceholder": { ru: "Замаскированный текст…", en: "Masked text…" },

  /* --- Lorem Ipsum --- */
  "lorem.again": { ru: "Заново", en: "Regenerate" },
  "lorem.paragraphs": { ru: "Абзацев", en: "Paragraphs" },
  "lorem.sentences": { ru: "Предложений", en: "Sentences" },
  "lorem.words": { ru: "Слов", en: "Words" },
  "lorem.hint": { ru: "Классический Lorem ipsum для вёрстки и макетов", en: "Classic Lorem ipsum for layouts and mockups" },
  "lorem.stats": { ru: "{w} слов · {c} символов", en: "{w} words · {c} characters" },

  /* --- Slug Generator --- */
  "slug.placeholder": { ru: "Название статьи или файла…", en: "Article or file title…" },
  "slug.hint": { ru: "Транслитерация кириллицы + slug-нормализация", en: "Cyrillic transliteration + slug normalization" },
  "slug.length": { ru: "Длина: {n} символов", en: "Length: {n} characters" },
  "slug.result": { ru: "Результат", en: "Result" },
  "slug.example": { ru: "Пример использования: /articles/{slug}", en: "Example usage: /articles/{slug}" },
  "slug.emptyHint": { ru: "Начните вводить текст — slug появится автоматически", en: "Start typing — the slug appears automatically" },

  /* --- Unicode Info --- */
  "unicode.placeholder": { ru: "Введите символы…", en: "Enter characters…" },
  "unicode.hint": { ru: "Коды, эскейп-последовательности и десятичные значения", en: "Codes, escape sequences and decimal values" },
  "unicode.chars": { ru: "Символов: {n}", en: "Characters: {n}" },
  "unicode.emptyHint": { ru: "Введите символы, чтобы увидеть их Unicode-информацию", en: "Enter characters to see their Unicode info" },
  "unicode.char": { ru: "Символ", en: "Character" },
  "unicode.escape": { ru: "Эскейп", en: "Escape" },
  "unicode.decimal": { ru: "Десятичный", en: "Decimal" },
  "unicode.description": { ru: "Описание", en: "Description" },

  /* --- Regex Replace --- */
  "regexreplace.patternPlaceholder": { ru: "Шаблон поиска", en: "Search pattern" },
  "regexreplace.replacementPlaceholder": { ru: "Замена ($1, $2…)", en: "Replacement ($1, $2…)" },
  "regexreplace.matches": { ru: "Совпадений: {n}", en: "Matches: {n}" },
  "regexreplace.stats": { ru: "{a} → {b} символов", en: "{a} → {b} characters" },
  "regexreplace.inputPlaceholder": { ru: "Исходный текст…", en: "Source text…" },
  "regexreplace.outputPlaceholder": { ru: "Результат замены", en: "Replacement result" },

  /* --- Base64 Encoder --- */
  "b64.apply": { ru: "Применить", en: "Apply" },
  "b64.encode": { ru: "Закодировать", en: "Encode" },
  "b64.decode": { ru: "Декодировать", en: "Decode" },
  "b64.invalid": { ru: "Некорректные данные", en: "Invalid data" },
  "b64.hint": { ru: "UTF-8 ↔ Base64 (ядро Rust)", en: "UTF-8 ↔ Base64 (Rust core)" },
  "b64.stats": { ru: "Вход: {in} байт · выход: {out} байт", en: "Input: {in} bytes · output: {out} bytes" },
  "b64.inputPlaceholder": { ru: "Текст для кодирования…", en: "Text to encode…" },
  "b64.decodePlaceholder": { ru: "Base64-строка для декодирования…", en: "Base64 string to decode…" },

  /* --- URL Codec --- */
  "url.apply": { ru: "Применить", en: "Apply" },
  "url.encode": { ru: "Кодировать", en: "Encode" },
  "url.decode": { ru: "Декодировать", en: "Decode" },
  "url.hint": { ru: "Кодирование по RFC 3986 (ядро Rust)", en: "RFC 3986 encoding (Rust core)" },
  "url.chars": { ru: "{n} символов", en: "{n} characters" },
  "url.inputPlaceholder": { ru: "URL или строка…", en: "URL or string…" },
  "url.encodedPlaceholder": { ru: "Закодированный фрагмент…", en: "Encoded fragment…" },
  "url.result": { ru: "Результат", en: "Result" },

  /* --- JWT Decoder --- */
  "jwt.decodeError": { ru: "Ошибка декодирования", en: "Decoding error" },
  "jwt.hint": { ru: "JWT декодируется локально в ядре, без отправки данных", en: "JWT is decoded locally in the core, no data is sent" },
  "jwt.expiresAt": { ru: "Срок действия: {at}", en: "Expires: {at}" },
  "jwt.expNotSet": { ru: "не указан (exp)", en: "not set (exp)" },
  "jwt.signature": { ru: "Подпись (не проверяется):", en: "Signature (not verified):" },

  /* --- Генератор хэшей --- */
  "hash.tauriOnly": { ru: "(доступно в Tauri)", en: "(available in Tauri)" },
  "hash.computing": { ru: "Хэшируем…", en: "Hashing…" },
  "hash.compute": { ru: "Вычислить хэши", en: "Compute hashes" },
  "hash.inputBytes": { ru: "Входных данных: {n} байт", en: "Input data: {n} bytes" },
  "hash.inputHint": { ru: "Введите текст для хэширования", en: "Enter text to hash" },
  "hash.algos": { ru: "Алгоритмы: MD5, SHA-1, SHA-256, SHA-512", en: "Algorithms: MD5, SHA-1, SHA-256, SHA-512" },
  "hash.placeholder": { ru: "Введите текст…", en: "Enter text…" },

  /* --- UUID Generator --- */
  "uuid.regenerate": { ru: "Сгенерировать снова", en: "Regenerate" },
  "uuid.versioning": { ru: "Версия {v} · timestamp-based для v7", en: "Version {v} · timestamp-based for v7" },
  "uuid.generated": { ru: "Сгенерировано: {n}", en: "Generated: {n}" },

  /* --- JSON Formatter --- */
  "jsonf.indent2": { ru: "Отступ: 2 пробела", en: "Indent: 2 spaces" },
  "jsonf.indent4": { ru: "Отступ: 4 пробела", en: "Indent: 4 spaces" },
  "jsonf.noIndent": { ru: "Без отступов", en: "No indent" },
  "jsonf.apply": { ru: "Применить формат", en: "Apply format" },
  "jsonf.error": { ru: "Ошибка в JSON", en: "Invalid JSON" },
  "jsonf.valid": { ru: "Данные валидны", en: "Data is valid" },
  "jsonf.stats": { ru: "Строк: {l} · {b} байт", en: "Lines: {l} · {b} bytes" },
  "jsonf.inputPlaceholder": { ru: "Вставьте JSON…", en: "Paste JSON…" },
  "jsonf.outputPlaceholder": { ru: "Отформатированный JSON", en: "Formatted JSON" },

  /* --- JSON Diff --- */
  "jsondiff.normalizeWhitespace": { ru: "Нормализовать пробелы", en: "Normalize whitespace" },
  "jsondiff.hint": { ru: "Вставьте две версии текста или JSON слева и справа", en: "Paste two versions of text or JSON left and right" },
  "jsondiff.versionA": { ru: "Версия A", en: "Version A" },
  "jsondiff.versionB": { ru: "Версия B", en: "Version B" },
  "jsondiff.noDiff": { ru: "Различий нет", en: "No differences" },

  /* --- Cron Parser --- */
  "cron.valid": { ru: "Выражение корректно", en: "Expression is valid" },
  "cron.expect5": { ru: "Ошибка: ожидается 5 полей", en: "Error: expected 5 fields" },
  "cron.nextRun": { ru: "Ближайший запуск: {at}", en: "Next run: {at}" },
  "cron.nextRuns": { ru: "Ближайшие запуски", en: "Next runs" },
  "cron.invalid": { ru: "Выражение не распознано", en: "Expression not recognized" },

  /* --- AES Шифрование --- */
  "aes.enterKeyData": { ru: "Введите ключ и данные", en: "Enter the key and data" },
  "aes.processing": { ru: "Обработка…", en: "Processing…" },
  "aes.encrypt": { ru: "Зашифровать", en: "Encrypt" },
  "aes.decrypt": { ru: "Расшифровать", en: "Decrypt" },
  "aes.encryptMode": { ru: "Шифрование", en: "Encryption" },
  "aes.decryptMode": { ru: "Расшифрование", en: "Decryption" },
  "aes.hint": { ru: "AES-256-GCM, ключ выводится из пароля через PBKDF2 (ядро Rust)", en: "AES-256-GCM, key derived from password via PBKDF2 (Rust core)" },
  "aes.keyPlaceholder": { ru: "Пароль (ключ)", en: "Password (key)" },
  "aes.encryptPlaceholder": { ru: "Текст для шифрования…", en: "Text to encrypt…" },
  "aes.decryptPlaceholder": { ru: "Base64-зашифрованные данные…", en: "Base64-encrypted data…" },

  /* --- Генератор паролей --- */
  "pwdgen.generate": { ru: "Сгенерировать", en: "Generate" },
  "pwdgen.hint": { ru: "Криптостойкий CSPRNG в ядре Rust (без перекоса распределения)", en: "Cryptographically strong CSPRNG in the Rust core (no distribution bias)" },
  "pwdgen.entropy": { ru: "Энтропия ~ {n} бит — {label}", en: "Entropy ~ {n} bits — {label}" },
  "pwdgen.excellent": { ru: "Отличный", en: "Excellent" },
  "pwdgen.good": { ru: "Хороший", en: "Good" },
  "pwdgen.fair": { ru: "Средний", en: "Fair" },
  "pwdgen.weak": { ru: "Слабый", en: "Weak" },
  "pwdgen.length": { ru: "Длина", en: "Length" },
  "pwdgen.upper": { ru: "Заглавные буквы (A–Z)", en: "Uppercase letters (A–Z)" },
  "pwdgen.digits": { ru: "Цифры (0–9)", en: "Digits (0–9)" },
  "pwdgen.symbols": { ru: "Символы (!@#$…)", en: "Symbols (!@#$…)" },
  "pwdgen.noAmbiguous": { ru: "Без похожих символов (O/0/I/l/1/|)", en: "No ambiguous characters (O/0/I/l/1/|)" },
  "pwdgen.result": { ru: "Сгенерированный пароль", en: "Generated password" },

  /* --- Проверка пароля --- */
  "pwdstr.enter": { ru: "Введите пароль", en: "Enter a password" },
  "pwdstr.weak": { ru: "Слабый пароль", en: "Weak password" },
  "pwdstr.fair": { ru: "Средний пароль", en: "Fair password" },
  "pwdstr.strong": { ru: "Надёжный пароль", en: "Strong password" },
  "pwdstr.hint": { ru: "Оценка основана на длине и наборе символов", en: "Assessment is based on length and character set" },
  "pwdstr.placeholder": { ru: "Введите пароль…", en: "Enter a password…" },

  /* --- Поиск дубликатов --- */
  "dup.scanning": { ru: "Сканирование…", en: "Scanning…" },
  "dup.scan": { ru: "Сканировать папку", en: "Scan folder" },
  "dup.noFolder": { ru: "Папка не выбрана", en: "No folder selected" },
  "dup.stats": { ru: "Дубликатов: {files} · можно освободить {size}", en: "Duplicates: {files} · can free {size}" },
  "dup.emptyTitle": { ru: "Поиск дубликатов", en: "Duplicate finder" },
  "dup.emptyDesc": { ru: "Выберите папку, и ForgeKit найдёт повторяющиеся файлы, сравнив их содержимое по хэшу", en: "Pick a folder and ForgeKit will find duplicate files by comparing content hashes" },
  "dup.pickFolder": { ru: "Выбрать папку", en: "Pick folder" },
  "dup.group": { ru: "Группа {i}: {n} файлов · {size} каждый", en: "Group {i}: {n} files · {size} each" },
  "dup.limit": { ru: "Показаны первые 50 групп из {n}", en: "Showing the first 50 groups of {n}" },

  /* --- Анализ размера файлов --- */
  "fsize.analyzing": { ru: "Анализ…", en: "Analyzing…" },
  "fsize.analyze": { ru: "Проанализировать папку", en: "Analyze folder" },
  "fsize.noFolder": { ru: "Папка не выбрана", en: "No folder selected" },
  "fsize.total": { ru: "Всего: {n}", en: "Total: {n}" },
  "fsize.emptyTitle": { ru: "Анализ размера файлов", en: "File size analysis" },
  "fsize.emptyDesc": { ru: "Покажите, какие папки и файлы занимают больше всего места на диске", en: "See which folders and files take the most space on disk" },
  "fsize.pickFolder": { ru: "Выбрать папку", en: "Pick folder" },
  "fsize.limit": { ru: "Всего элементов: {n} · показаны первые 40", en: "Total items: {n} · showing the first 40" },

  /* --- Организация файлов --- */
  "organizer.pickFolder": { ru: "Выбрать папку", en: "Pick folder" },
  "organizer.move": { ru: "Переместить файлы", en: "Move files" },
  "organizer.byType": { ru: "По типу файла", en: "By file type" },
  "organizer.byExt": { ru: "По расширению", en: "By extension" },
  "organizer.noFolder": { ru: "Папка не выбрана", en: "No folder selected" },
  "organizer.moves": { ru: "Перемещений: {n}", en: "Moves: {n}" },
  "organizer.errors": { ru: "ошибок: {n}", en: "errors: {n}" },
  "organizer.emptyTitle": { ru: "Организация файлов", en: "File organizer" },
  "organizer.emptyDesc": { ru: "ForgeKit разложит файлы по папкам по типу или расширению. Сначала покажет предпросмотр перемещений", en: "ForgeKit sorts files into folders by type or extension. It will show a move preview first" },
  "organizer.preview": { ru: "Показать предпросмотр", en: "Show preview" },
  "organizer.none": { ru: "Перемещать нечего", en: "Nothing to move" },
  "organizer.noneDesc": { ru: "Все файлы уже упорядочены", en: "All files are already organized" },

  /* --- Массовое переименование --- */
  "bulk.rename": { ru: "Переименовать ({n})", en: "Rename ({n})" },
  "bulk.patternPlaceholder": { ru: "Шаблон: photo_{n}.jpg", en: "Template: photo_{n}.jpg" },
  "bulk.applyPattern": { ru: "Применить шаблон", en: "Apply template" },
  "bulk.patternNote": { ru: "— «{n}» заменяется на номер файла", en: "— «{n}» is replaced with the file number" },
  "bulk.noFolder": { ru: "Папка не выбрана", en: "No folder selected" },
  "bulk.stats": { ru: "Файлов: {files} · будет переименовано: {renamed}", en: "Files: {files} · will be renamed: {renamed}" },
  "bulk.resultTitle": { ru: "Результат переименования", en: "Rename result" },
  "bulk.apply": { ru: "Применить", en: "Apply" },
  "bulk.emptyTitle": { ru: "Массовое переименование", en: "Bulk rename" },
  "bulk.emptyDesc": { ru: "Выберите папку с файлами, задайте шаблон имени и переименуйте сразу все файлы", en: "Pick a folder with files, set a name template and rename all files at once" },
  "bulk.pickFolder": { ru: "Выбрать папку", en: "Pick folder" },
  "bulk.currentName": { ru: "Текущее имя", en: "Current name" },
  "bulk.newName": { ru: "Новое имя", en: "New name" },
  "bulk.size": { ru: "Размер", en: "Size" },

  /* --- Оптимизация PDF --- */
  "pdfc.optimizing": { ru: "Оптимизация…", en: "Optimizing…" },
  "pdfc.optimize": { ru: "Оптимизировать", en: "Optimize" },
  "pdfc.hint": { ru: "Удаляет неиспользуемые объекты из PDF", en: "Removes unused objects from the PDF" },
  "pdfc.emptyTitle": { ru: "Оптимизация PDF", en: "PDF optimization" },
  "pdfc.emptyDesc": { ru: "Уменьшите размер PDF, удалив избыточные и неиспользуемые данные", en: "Reduce PDF size by removing redundant and unused data" },
  "pdfc.pickFile": { ru: "Выбрать PDF-файл", en: "Pick PDF file" },
  "pdfc.otherFile": { ru: "Другой файл", en: "Another file" },
  "pdfc.steps": { ru: "Шаги", en: "Steps" },
  "pdfc.stepsDesc": { ru: "1. Выберите файл → 2. Укажите имя результата → 3. Проверьте итог", en: "1. Pick a file → 2. Set the result name → 3. Check the result" },
  "pdfc.before": { ru: "Было", en: "Before" },
  "pdfc.after": { ru: "Стало", en: "After" },
  "pdfc.savedSpace": { ru: "Экономия", en: "Saved" },

  /* --- PDF в изображения --- */
  "pdftoi.rendering": { ru: "Рендер…", en: "Rendering…" },
  "pdftoi.convert": { ru: "Конвертировать в PNG", en: "Convert to PNG" },
  "pdftoi.hint": { ru: "Требуется poppler (pdftoppm) в PATH", en: "Requires poppler (pdftoppm) in PATH" },
  "pdftoi.emptyTitle": { ru: "PDF в изображения", en: "PDF to images" },
  "pdftoi.emptyDesc": { ru: "Рендерит каждую страницу PDF в отдельный PNG-файл (через pdftoppm)", en: "Renders each PDF page into a separate PNG file (via pdftoppm)" },
  "pdftoi.pickFile": { ru: "Выбрать PDF-файл", en: "Pick PDF file" },
  "pdftoi.otherFile": { ru: "Другой файл", en: "Another file" },
  "pdftoi.created": { ru: "Создано файлов: {n}", en: "Files created: {n}" },

  /* --- Объединение PDF --- */
  "pdfm.merging": { ru: "Объединение…", en: "Merging…" },
  "pdfm.merge": { ru: "Объединить", en: "Merge" },
  "pdfm.hint": { ru: "Порядок файлов = порядок страниц", en: "File order = page order" },
  "pdfm.files": { ru: "Файлов: {n}", en: "Files: {n}" },
  "pdfm.emptyTitle": { ru: "Объединение PDF", en: "PDF merge" },
  "pdfm.emptyDesc": { ru: "Склейте несколько PDF-файлов в один, сохранив порядок страниц", en: "Merge several PDF files into one, keeping the page order" },
  "pdfm.pickFiles": { ru: "Выбрать PDF-файлы", en: "Pick PDF files" },
  "pdfm.selected": { ru: "Выбрано файлов: {n} — минимум 2 для объединения", en: "Files selected: {n} — at least 2 required to merge" },
  "pdfm.merged": { ru: "OK: {out} ({pages} стр.)", en: "OK: {out} ({pages} p.)" },
  "pdfm.mergeFailed": { ru: "Не удалось объединить файлы", en: "Failed to merge the files" },

  /* --- Разделение PDF --- */
  "pdfs.splitting": { ru: "Разделение…", en: "Splitting…" },
  "pdfs.split": { ru: "Разделить", en: "Split" },
  "pdfs.rangesHint": { ru: "Формат диапазонов: {fmt}", en: "Range format: {fmt}" },
  "pdfs.emptyTitle": { ru: "Разделение PDF", en: "PDF split" },
  "pdfs.emptyDesc": { ru: "Разрежьте PDF на части по диапазонам страниц", en: "Cut a PDF into parts by page ranges" },
  "pdfs.pickFile": { ru: "Выбрать PDF-файл", en: "Pick PDF file" },
  "pdfs.otherFile": { ru: "Другой файл", en: "Another file" },
  "pdfs.invalidRanges": { ru: "Некорректные диапазоны. Пример: 1-3, 5, 7-10", en: "Invalid ranges. Example: 1-3, 5, 7-10" },
  "pdfs.splitted": { ru: "OK: создано частей: {n}", en: "OK: parts created: {n}" },
  "pdfs.splitFailed": { ru: "Не удалось разделить файл", en: "Failed to split the file" },

  /* --- Информация о PDF --- */
  "pdfinfo.reading": { ru: "Чтение…", en: "Reading…" },
  "pdfinfo.openPdf": { ru: "Открыть PDF", en: "Open PDF" },
  "pdfinfo.hint": { ru: "Метаданные читаются из трассировки PDF", en: "Metadata is read from the PDF trace" },
  "pdfinfo.updated": { ru: "Обновлено", en: "Updated" },
  "pdfinfo.emptyTitle": { ru: "Информация о PDF", en: "PDF info" },
  "pdfinfo.emptyDesc": { ru: "Показывает количество страниц, версию и метаданные документа", en: "Shows page count, version and document metadata" },
  "pdfinfo.otherFile": { ru: "Другой файл", en: "Another file" },
  "pdfinfo.pickFile": { ru: "Выбрать PDF-файл", en: "Pick PDF file" },
  "pdfinfo.file": { ru: "Файл", en: "File" },
  "pdfinfo.size": { ru: "Размер", en: "Size" },
  "pdfinfo.version": { ru: "Версия PDF", en: "PDF version" },
  "pdfinfo.pages": { ru: "Страниц", en: "Pages" },
  "pdfinfo.title": { ru: "Название", en: "Title" },
  "pdfinfo.author": { ru: "Автор", en: "Author" },
  "pdfinfo.creator": { ru: "Создатель", en: "Creator" },
  "pdfinfo.producer": { ru: "Программа", en: "Producer" },

  /* --- Изображение в PDF --- */
  "ipdf.creating": { ru: "Создание…", en: "Creating…" },
  "ipdf.create": { ru: "Создать PDF", en: "Create PDF" },
  "ipdf.hint": { ru: "Каждая страница — отдельное изображение", en: "Each page is a separate image" },
  "ipdf.images": { ru: "Изображений: {n}", en: "Images: {n}" },
  "ipdf.emptyTitle": { ru: "Изображение в PDF", en: "Image to PDF" },
  "ipdf.emptyDesc": { ru: "Соберите PNG, JPG, WebP или GIF в один PDF-документ", en: "Combine PNG, JPG, WebP or GIF into one PDF document" },
  "ipdf.created": { ru: "OK: {out} · {size} · {pages} стр.", en: "OK: {out} · {size} · {pages} p." },
  "ipdf.createFailed": { ru: "Не удалось создать PDF", en: "Failed to create the PDF" },

  /* --- Конвертер единиц --- */
  "unit.length": { ru: "Длина", en: "Length" },
  "unit.weight": { ru: "Вес", en: "Weight" },
  "unit.data": { ru: "Данные", en: "Data" },
  "unit.speed": { ru: "Скорость", en: "Speed" },
  "unit.temperature": { ru: "Температура", en: "Temperature" },
  "unit.area": { ru: "Площадь", en: "Area" },
  "unit.mm": { ru: "мм", en: "mm" },
  "unit.cm": { ru: "см", en: "cm" },
  "unit.m": { ru: "м", en: "m" },
  "unit.km": { ru: "км", en: "km" },
  "unit.in": { ru: "дюйм", en: "in" },
  "unit.ft": { ru: "фут", en: "ft" },
  "unit.mi": { ru: "миля", en: "mi" },
  "unit.mg": { ru: "мг", en: "mg" },
  "unit.g": { ru: "г", en: "g" },
  "unit.kg": { ru: "кг", en: "kg" },
  "unit.t": { ru: "тонна", en: "t" },
  "unit.oz": { ru: "унция", en: "oz" },
  "unit.lb": { ru: "фунт", en: "lb" },
  "unit.b": { ru: "Байт", en: "B" },
  "unit.kb": { ru: "КБ", en: "KB" },
  "unit.mb": { ru: "МБ", en: "MB" },
  "unit.gb": { ru: "ГБ", en: "GB" },
  "unit.tb": { ru: "ТБ", en: "TB" },
  "unit.mps": { ru: "м/с", en: "m/s" },
  "unit.kmph": { ru: "км/ч", en: "km/h" },
  "unit.mphp": { ru: "миль/ч", en: "mph" },
  "unit.knot": { ru: "узел", en: "knot" },
  "unit.c": { ru: "°C", en: "°C" },
  "unit.f": { ru: "°F", en: "°F" },
  "unit.k": { ru: "K", en: "K" },
  "unit.m2": { ru: "м²", en: "m²" },
  "unit.km2": { ru: "км²", en: "km²" },
  "unit.ha": { ru: "га", en: "ha" },
  "unit.ft2": { ru: "фут²", en: "ft²" },
  "unit.hint": { ru: "Поддерживаются все основные единицы измерения", en: "All common units of measure are supported" },
  "unit.group": { ru: "Группа: {g}", en: "Group: {g}" },
  "unit.value": { ru: "Значение", en: "Value" },
  "unit.from": { ru: "Из", en: "From" },
  "unit.to": { ru: "В", en: "To" },
  "unit.result": { ru: "Результат", en: "Result" },
} as const;

type Dict = typeof dict;
export type Keys = { [K in keyof Dict]: K }[keyof Dict];

interface Entry {
  ru: string;
  en: string;
}

export function getLang(): Lang {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "en" ? "en" : "ru";
}

export function setLang(lang: Lang): void {
  localStorage.setItem(STORAGE_KEY, lang);
}

export function t(key: Keys | (string & {}), lang: Lang = getLang(), vars?: Record<string, string | number>): string {
  const entry = (dict as Record<string, Entry>)[key];
  let s: string = entry?.[lang] ?? entry?.ru ?? key;
  if (vars) {
    for (const [k, val] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(val));
  }
  return s;
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Keys | (string & {}), vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: "ru",
  setLang: () => {},
  t: (key) => t(key, "ru"),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (l) => {
        setLang(l);
        setLangState(l);
      },
      t: (key, vars) => t(key, lang, vars),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}