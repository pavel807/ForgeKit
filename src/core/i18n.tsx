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