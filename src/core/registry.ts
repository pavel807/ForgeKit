/* Реестр инструментов ForgeKit: категории, инструменты, поиск.
   name/description/categoryName — это ключи i18n (см. core/i18n.ts). */

import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";
import { isOfficialPlugin } from "./api";
import {
  ArrowDownAZ,
  Binary,
  Braces,
  CalendarClock,
  CalendarDays,
  CaseSensitive,
  ClipboardList,
  Cpu,
  Crop,
  EyeOff,
  FileCog,
  FileOutput,
  FileSearch,
  FileStack,
  FileText,
  Files,
  Fingerprint,
  FolderTree,
  GitCompare,
  Globe,
  Globe2,
  Hash,
  Image,
  ImageDown,
  ImagePlus,
  Info,
  KeyRound,
  KeySquare,
  Languages,
  LayoutDashboard,
  Link,
  Lock,
  Minimize2,
  MonitorCog,
  Network,
  PenLine,
  PieChart,
  Pilcrow,
  Pipette,
  Puzzle,
  QrCode,
  Regex,
  Scale,
  Scissors,
  ScrollText,
  Settings,
  ShieldCheck,
  Sigma,
  Split,
  TextSelect,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";

export interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
  category: string;
  categoryName: string;
  component: LazyExoticComponent<ComponentType>;
  /** Плагины официальных авторов отмечаются синей звёздочкой */
  official?: boolean;
}

export interface CategoryDef {
  id: string;
  name: string;
  icon: LucideIcon;
  toolIds: string[];
}

const lazyTool = (id: string) => lazy(() => import(`../tools/${id}.tsx`).then((m) => ({ default: m.default })));

export const TOOLS: ToolDef[] = [
  /* --- Dashboard / Буфер --- */
  {
    id: "dashboard",
    name: "tool.dashboard.name",
    description: "tool.dashboard.desc",
    icon: LayoutDashboard,
    keywords: ["главная", "старт", "обзор", "dashboard", "home"],
    category: "dashboard",
    categoryName: "cat.dashboard",
    component: lazyTool("Dashboard"),
  },
  {
    id: "clipboard",
    name: "tool.clipboard.name",
    description: "tool.clipboard.desc",
    icon: ClipboardList,
    keywords: ["буфер", "обмена", "история", "копирование", "clipboard", "copy", "paste"],
    category: "clipboard",
    categoryName: "cat.clipboard",
    component: lazyTool("ClipboardHistory"),
  },

  /* --- Файлы --- */
  {
    id: "duplicate-finder",
    name: "tool.duplicate-finder.name",
    description: "tool.duplicate-finder.desc",
    icon: FileSearch,
    keywords: ["дубликаты", "файлы", "поиск", "хэш", "duplicate"],
    category: "files",
    categoryName: "cat.files",
    component: lazyTool("DuplicateFinder"),
  },
  {
    id: "bulk-rename",
    name: "tool.bulk-rename.name",
    description: "tool.bulk-rename.desc",
    icon: PenLine,
    keywords: ["переименование", "rename", "шаблон", "папка", "batch"],
    category: "files",
    categoryName: "cat.files",
    component: lazyTool("BulkRename"),
  },
  {
    id: "file-organizer",
    name: "tool.file-organizer.name",
    description: "tool.file-organizer.desc",
    icon: FolderTree,
    keywords: ["организация", "папки", "сортировка", "organize", "move"],
    category: "files",
    categoryName: "cat.files",
    component: lazyTool("FileOrganizer"),
  },
  {
    id: "file-size-analyzer",
    name: "tool.file-size-analyzer.name",
    description: "tool.file-size-analyzer.desc",
    icon: PieChart,
    keywords: ["размер", "анализ", "место", "диск", "size", "storage"],
    category: "files",
    categoryName: "cat.files",
    component: lazyTool("FileSizeAnalyzer"),
  },

  /* --- Разработка --- */
  {
    id: "json-formatter",
    name: "tool.json-formatter.name",
    description: "tool.json-formatter.desc",
    icon: Braces,
    keywords: ["json", "форматирование", "валидация", "pretty"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("JSONFormatter"),
  },
  {
    id: "json-diff",
    name: "tool.json-diff.name",
    description: "tool.json-diff.desc",
    icon: GitCompare,
    keywords: ["json", "diff", "сравнение", "различия"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("JSONDiff"),
  },
  {
    id: "regex-tester",
    name: "tool.regex-tester.name",
    description: "tool.regex-tester.desc",
    icon: Regex,
    keywords: ["regex", "регулярные", "выражения", "тест"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("RegexTester"),
  },
  {
    id: "hash-generator",
    name: "tool.hash-generator.name",
    description: "tool.hash-generator.desc",
    icon: Fingerprint,
    keywords: ["хэш", "md5", "sha", "хеширование", "hash"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("HashGenerator"),
  },
  {
    id: "uuid",
    name: "tool.uuid.name",
    description: "tool.uuid.desc",
    icon: Hash,
    keywords: ["uuid", "guid", "идентификатор", "генератор"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("UUIDGenerator"),
  },
  {
    id: "base64",
    name: "tool.base64.name",
    description: "tool.base64.desc",
    icon: Binary,
    keywords: ["base64", "кодирование", "декодирование", "encode"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("Base64Encoder"),
  },
  {
    id: "url-codec",
    name: "tool.url-codec.name",
    description: "tool.url-codec.desc",
    icon: Link,
    keywords: ["url", "кодирование", "uri", "percent", "encode"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("URLCodec"),
  },
  {
    id: "jwt-decoder",
    name: "tool.jwt-decoder.name",
    description: "tool.jwt-decoder.desc",
    icon: KeyRound,
    keywords: ["jwt", "token", "токен", "декодирование", "payload"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("JWTDecoder"),
  },
  {
    id: "markdown-preview",
    name: "tool.markdown-preview.name",
    description: "tool.markdown-preview.desc",
    icon: ScrollText,
    keywords: ["markdown", "md", "превью", "предпросмотр", "разметка"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("MarkdownPreview"),
  },
  {
    id: "cron-parser",
    name: "tool.cron-parser.name",
    description: "tool.cron-parser.desc",
    icon: CalendarClock,
    keywords: ["cron", "расписание", "парсер", "задачи", "schedule"],
    category: "developer",
    categoryName: "cat.developer",
    component: lazyTool("CronParser"),
  },

  /* --- Система --- */
  {
    id: "system-info",
    name: "tool.system-info.name",
    description: "tool.system-info.desc",
    icon: MonitorCog,
    keywords: ["система", "информация", "oc", "процессор", "память", "system"],
    category: "system",
    categoryName: "cat.system",
    component: lazyTool("SystemInfo"),
  },
  {
    id: "process-viewer",
    name: "tool.process-viewer.name",
    description: "tool.process-viewer.desc",
    icon: Cpu,
    keywords: ["процессы", "pid", "память", "task", "process"],
    category: "system",
    categoryName: "cat.system",
    component: lazyTool("ProcessViewer"),
  },
  {
    id: "unit-converter",
    name: "tool.unit-converter.name",
    description: "tool.unit-converter.desc",
    icon: Scale,
    keywords: ["конвертер", "единицы", "длина", "вес", "температура"],
    category: "system",
    categoryName: "cat.system",
    component: lazyTool("UnitConverter"),
  },
  {
    id: "date-time-converter",
    name: "tool.date-time-converter.name",
    description: "tool.date-time-converter.desc",
    icon: CalendarDays,
    keywords: ["дата", "время", "unix", "timestamp", "iso"],
    category: "system",
    categoryName: "cat.system",
    component: lazyTool("DateTimeConverter"),
  },

  /* --- Сеть --- */
  {
    id: "ping",
    name: "tool.ping.name",
    description: "tool.ping.desc",
    icon: Wifi,
    keywords: ["ping", "доступность", "задержка", "хост", "сеть"],
    category: "network",
    categoryName: "cat.network",
    component: lazyTool("Ping"),
  },
  {
    id: "port-scanner",
    name: "tool.port-scanner.name",
    description: "tool.port-scanner.desc",
    icon: Network,
    keywords: ["порты", "сканер", "port", "scan", "tcp"],
    category: "network",
    categoryName: "cat.network",
    component: lazyTool("PortScanner"),
  },
  {
    id: "ip-lookup",
    name: "tool.ip-lookup.name",
    description: "tool.ip-lookup.desc",
    icon: Globe,
    keywords: ["ip", "адрес", "публичный", "внешний", "lookup"],
    category: "network",
    categoryName: "cat.network",
    component: lazyTool("IPLookup"),
  },
  {
    id: "http-status",
    name: "tool.http-status.name",
    description: "tool.http-status.desc",
    icon: Globe2,
    keywords: ["http", "коды", "статус", "404", "200", "ошибки"],
    category: "network",
    categoryName: "cat.network",
    component: lazyTool("HTTPStatus"),
  },
  {
    id: "whois",
    name: "tool.whois.name",
    description: "tool.whois.desc",
    icon: FileSearch,
    keywords: ["whois", "домен", "регистрация", "владелец"],
    category: "network",
    categoryName: "cat.network",
    component: lazyTool("Whois"),
  },

  /* --- Безопасность --- */
  {
    id: "password-generator",
    name: "tool.password-generator.name",
    description: "tool.password-generator.desc",
    icon: KeySquare,
    keywords: ["пароль", "генератор", "password", "сложный"],
    category: "security",
    categoryName: "cat.security",
    component: lazyTool("PasswordGenerator"),
  },
  {
    id: "password-strength",
    name: "tool.password-strength.name",
    description: "tool.password-strength.desc",
    icon: ShieldCheck,
    keywords: ["пароль", "надёжность", "сила", "strength", "проверка"],
    category: "security",
    categoryName: "cat.security",
    component: lazyTool("PasswordStrength"),
  },
  {
    id: "aes-encrypt",
    name: "tool.aes-encrypt.name",
    description: "tool.aes-encrypt.desc",
    icon: Lock,
    keywords: ["aes", "шифрование", "encrypt", "ключ", "gcm"],
    category: "security",
    categoryName: "cat.security",
    component: lazyTool("AESEncrypt"),
  },
  {
    id: "text-obfuscator",
    name: "tool.text-obfuscator.name",
    description: "tool.text-obfuscator.desc",
    icon: EyeOff,
    keywords: ["маскировка", "обфускация", "текст", "скрыть", "obfuscate"],
    category: "security",
    categoryName: "cat.security",
    component: lazyTool("TextObfuscator"),
  },

  /* --- Графика --- */
  {
    id: "color-picker",
    name: "tool.color-picker.name",
    description: "tool.color-picker.desc",
    icon: Pipette,
    keywords: ["цвет", "hex", "rgb", "hsl", "cmyk", "палитра"],
    category: "graphics",
    categoryName: "cat.graphics",
    component: lazyTool("ColorPicker"),
  },
  {
    id: "image-converter",
    name: "tool.image-converter.name",
    description: "tool.image-converter.desc",
    icon: ImageDown,
    keywords: ["изображение", "конвертация", "png", "jpeg", "webp"],
    category: "graphics",
    categoryName: "cat.graphics",
    component: lazyTool("ImageConverter"),
  },
  {
    id: "image-compressor",
    name: "tool.image-compressor.name",
    description: "tool.image-compressor.desc",
    icon: Minimize2,
    keywords: ["сжатие", "компрессия", "размер", "качество", "jpeg"],
    category: "graphics",
    categoryName: "cat.graphics",
    component: lazyTool("ImageCompressor"),
  },
  {
    id: "image-resizer",
    name: "tool.image-resizer.name",
    description: "tool.image-resizer.desc",
    icon: Crop,
    keywords: ["размер", "масштаб", "resize", "пиксели", "изображение"],
    category: "graphics",
    categoryName: "cat.graphics",
    component: lazyTool("ImageResizer"),
  },
  {
    id: "qr-generator",
    name: "tool.qr-generator.name",
    description: "tool.qr-generator.desc",
    icon: QrCode,
    keywords: ["qr", "код", "генератор", "ссылка", "barcode"],
    category: "graphics",
    categoryName: "cat.graphics",
    component: lazyTool("QRGenerator"),
  },
  {
    id: "svg-optimizer",
    name: "tool.svg-optimizer.name",
    description: "tool.svg-optimizer.desc",
    icon: Zap,
    keywords: ["svg", "оптимизация", "минификация", "разметка"],
    category: "graphics",
    categoryName: "cat.graphics",
    component: lazyTool("SVGOptimizer"),
  },

  /* --- Текст --- */
  {
    id: "case-converter",
    name: "tool.case-converter.name",
    description: "tool.case-converter.desc",
    icon: CaseSensitive,
    keywords: ["регистр", "case", "uppercase", "lowercase", "camel"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("CaseConverter"),
  },
  {
    id: "text-counter",
    name: "tool.text-counter.name",
    description: "tool.text-counter.desc",
    icon: Sigma,
    keywords: ["счётчик", "символы", "слова", "статистика", "counter"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("TextCounter"),
  },
  {
    id: "text-diff",
    name: "tool.text-diff.name",
    description: "tool.text-diff.desc",
    icon: Split,
    keywords: ["сравнение", "diff", "различия", "текст", "версии"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("TextDiff"),
  },
  {
    id: "lorem-ipsum",
    name: "tool.lorem-ipsum.name",
    description: "tool.lorem-ipsum.desc",
    icon: TextSelect,
    keywords: ["lorem", "ipsum", "заглушка", "текст", "генератор"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("LoremIpsum"),
  },
  {
    id: "slug-generator",
    name: "tool.slug-generator.name",
    description: "tool.slug-generator.desc",
    icon: Pilcrow,
    keywords: ["slug", "транслитерация", "url", "название", "ссылка"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("SlugGenerator"),
  },
  {
    id: "alphabetizer",
    name: "tool.alphabetizer.name",
    description: "tool.alphabetizer.desc",
    icon: ArrowDownAZ,
    keywords: ["сортировка", "алфавит", "строки", "алфавитизация", "sort"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("Alphabetizer"),
  },
  {
    id: "unicode-info",
    name: "tool.unicode-info.name",
    description: "tool.unicode-info.desc",
    icon: Languages,
    keywords: ["unicode", "символы", "коды", "escaped", "codepoint"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("UnicodeInfo"),
  },
  {
    id: "regex-replace",
    name: "tool.regex-replace.name",
    description: "tool.regex-replace.desc",
    icon: Wrench,
    keywords: ["regex", "замена", "поиск", "регулярные", "replace"],
    category: "text",
    categoryName: "cat.text",
    component: lazyTool("RegexReplace"),
  },

  /* --- PDF --- */
  {
    id: "pdf-merge",
    name: "tool.pdf-merge.name",
    description: "tool.pdf-merge.desc",
    icon: FileStack,
    keywords: ["pdf", "объединение", "merge", "склейка", "страницы"],
    category: "documents",
    categoryName: "cat.documents",
    component: lazyTool("PDFMerge"),
  },
  {
    id: "pdf-split",
    name: "tool.pdf-split.name",
    description: "tool.pdf-split.desc",
    icon: Scissors,
    keywords: ["pdf", "разделение", "split", "диапазон", "страницы"],
    category: "documents",
    categoryName: "cat.documents",
    component: lazyTool("PDFSplit"),
  },
  {
    id: "pdf-info",
    name: "tool.pdf-info.name",
    description: "tool.pdf-info.desc",
    icon: FileText,
    keywords: ["pdf", "информация", "метаданные", "страницы", "info"],
    category: "documents",
    categoryName: "cat.documents",
    component: lazyTool("PDFInfo"),
  },
  {
    id: "image-to-pdf",
    name: "tool.image-to-pdf.name",
    description: "tool.image-to-pdf.desc",
    icon: ImagePlus,
    keywords: ["pdf", "изображение", "конвертация", "картинки", "image"],
    category: "documents",
    categoryName: "cat.documents",
    component: lazyTool("ImageToPDF"),
  },
  {
    id: "pdf-to-images",
    name: "tool.pdf-to-images.name",
    description: "tool.pdf-to-images.desc",
    icon: FileOutput,
    keywords: ["pdf", "изображения", "png", "рендер", "страницы"],
    category: "documents",
    categoryName: "cat.documents",
    component: lazyTool("PDFToImages"),
  },
  {
    id: "pdf-compress",
    name: "tool.pdf-compress.name",
    description: "tool.pdf-compress.desc",
    icon: FileCog,
    keywords: ["pdf", "сжатие", "оптимизация", "размер", "compress"],
    category: "documents",
    categoryName: "cat.documents",
    component: lazyTool("PDFCompress"),
  },

  /* --- Системные страницы --- */
  {
    id: "plugins",
    name: "tool.plugins.name",
    description: "tool.plugins.desc",
    icon: Puzzle,
    keywords: ["плагины", "модули", "расширения", "plugins"],
    category: "settings",
    categoryName: "cat.settings",
    component: lazyTool("Plugins"),
  },
  {
    id: "settings",
    name: "tool.settings.name",
    description: "tool.settings.desc",
    icon: Settings,
    keywords: ["настройки", "параметры", "settings", "конфигурация"],
    category: "settings",
    categoryName: "cat.settings",
    component: lazyTool("Settings"),
  },
  {
    id: "about",
    name: "tool.about.name",
    description: "tool.about.desc",
    icon: Info,
    keywords: ["о приложении", "версия", "about", "информация"],
    category: "settings",
    categoryName: "cat.settings",
    component: lazyTool("About"),
  },
];

const TOOL_MAP = new Map(TOOLS.map((t) => [t.id, t]));

/* Динамическая регистрация плагинов: общие статичные данные карточки. */
const PLUGIN_TOOLS = new Map<string, ToolDef>();

const pluginView = lazy(() => import("../components/tools/PluginView").then((m) => ({ default: m.default })));

export function registerPluginTool(
  meta: { id: string; name: string; description: string; author?: string | null },
  icon: LucideIcon = Puzzle,
): ToolDef | null {
  if (TOOL_MAP.has(meta.id) || PLUGIN_TOOLS.has(meta.id)) return null;
  const def: ToolDef = {
    id: meta.id,
    name: meta.name,
    description: meta.description,
    icon,
    keywords: [meta.id, meta.name],
    category: "plugins",
    categoryName: "cat.plugins",
    component: pluginView,
    official: isOfficialPlugin(meta),
  };
  PLUGIN_TOOLS.set(meta.id, def);
  return def;
}

export function removePluginTool(id: string): void {
  PLUGIN_TOOLS.delete(id);
}

export function getTool(id: string): ToolDef {
  return TOOL_MAP.get(id) ?? PLUGIN_TOOLS.get(id) ?? TOOLS[0];
}

/** Все инструменты: встроенные + текущие плагины. */
export function getTools(): ToolDef[] {
  return [...TOOLS, ...PLUGIN_TOOLS.values()];
}

export const CATEGORIES: CategoryDef[] = [
  { id: "dashboard", name: "cat.dashboard", icon: LayoutDashboard, toolIds: ["dashboard"] },
  { id: "clipboard", name: "cat.clipboard", icon: ClipboardList, toolIds: ["clipboard"] },
  { id: "files", name: "cat.files", icon: Files, toolIds: ["duplicate-finder", "bulk-rename", "file-organizer", "file-size-analyzer"] },
  { id: "developer", name: "cat.developer", icon: Braces, toolIds: ["json-formatter", "json-diff", "regex-tester", "hash-generator", "uuid", "base64", "url-codec", "jwt-decoder", "markdown-preview", "cron-parser"] },
  { id: "system", name: "cat.system", icon: Cpu, toolIds: ["system-info", "process-viewer", "unit-converter", "date-time-converter"] },
  { id: "network", name: "cat.network", icon: Wifi, toolIds: ["ping", "port-scanner", "ip-lookup", "http-status", "whois"] },
  { id: "security", name: "cat.security", icon: ShieldCheck, toolIds: ["password-generator", "password-strength", "aes-encrypt", "text-obfuscator"] },
  { id: "graphics", name: "cat.graphics", icon: Image, toolIds: ["color-picker", "image-converter", "image-compressor", "image-resizer", "qr-generator", "svg-optimizer"] },
  { id: "text", name: "cat.text", icon: TextSelect, toolIds: ["case-converter", "text-counter", "text-diff", "lorem-ipsum", "slug-generator", "alphabetizer", "unicode-info", "regex-replace"] },
  { id: "documents", name: "cat.documents", icon: FileStack, toolIds: ["pdf-merge", "pdf-split", "pdf-info", "image-to-pdf", "pdf-to-images", "pdf-compress"] },
  { id: "plugins", name: "cat.plugins", icon: Puzzle, toolIds: ["plugins"] },
  { id: "settings", name: "cat.settings", icon: Settings, toolIds: ["settings", "about"] },
];

const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: string): CategoryDef | undefined {
  return CATEGORY_MAP.get(id);
}

export const FEATURED_TOOLS: string[] = [
  "clipboard",
  "json-formatter",
  "image-converter",
  "password-generator",
  "pdf-merge",
  "hash-generator",
];