/* Типизированные обёртки над Tauri-командами Rust-бэкенда */

import { invoke } from "@tauri-apps/api/core";

export interface ClipboardItem {
  id: number;
  kind: string;
  preview: string;
  created_at: number;
  pinned: boolean;
  favorite: boolean;
}

export interface ClipboardFull {
  kind: string;
  content: string | null;
  data_path: string | null;
}

export interface FileEntry {
  path: string;
  name: string;
  size: number;
  is_dir: boolean;
}

export interface DuplicateGroup {
  hash: string;
  size: number;
  items: FileEntry[];
}

export interface RenameResult {
  ok: boolean;
  from: string;
  to: string;
  error: string | null;
}

export interface OrganizeResult {
  ok: boolean;
  from: string;
  to: string;
  error: string | null;
}

export interface SizeEntry {
  path: string;
  name: string;
  size: number;
  file_count: number;
  dir_count: number;
}

export interface SystemInfo {
  os_name: string;
  os_version: string;
  hostname: string;
  kernel: string;
  arch: string;
  cpu_model: string;
  cpu_cores: number;
  cpu_usage: number;
  total_mem: number;
  used_mem: number;
  total_disk: number;
  free_disk: number;
  uptime_sec: number;
}

export interface ProcessEntry {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  state: string;
}

export interface PingResult {
  ok: boolean;
  latency_ms: number | null;
  error: string | null;
}

export interface ConvertResult {
  width: number;
  height: number;
  size: number;
  original: number;
  path: string;
}

export interface QrResult {
  png_base64: string;
}

export interface PdfResult {
  pages: number;
  size: number;
}

export interface PdfInfo {
  pages: number;
  version: string;
  title: string;
  author: string;
  creator: string;
  producer: string;
  size: number;
}

export interface SplitResult {
  name: string;
  pages: number;
}

export interface OptimizeResult {
  before: number;
  after: number;
}

export interface HashResult {
  algorithm: string;
  value: string;
}

export interface TextStats {
  chars: number;
  chars_no_space: number;
  words: number;
  unique_words: number;
  lines: number;
  sentences: number;
  letters: number;
  digits: number;
  spaces: number;
  punct: number;
  bytes: number;
  reading_min: number;
}

export interface PasswordResult {
  password: string;
  entropy: number;
}

export interface StrengthCheck {
  label: string;
  ok: boolean;
}

export interface StrengthResult {
  score: number;
  percent: number;
  checks: StrengthCheck[];
}

export interface LoremResult {
  text: string;
  words: number;
  chars: number;
}

export interface JsonFormatResult {
  ok: boolean;
  error: string | null;
  output: string;
  lines: number;
  bytes: number;
}

export interface JwtResult {
  header: string;
  payload: string;
  signature: string;
  exp_str: string | null;
}

export interface ColorResult {
  rgb: [number, number, number];
  hsl: string;
  cmyk: string;
}

export interface CronResult {
  ok: boolean;
  error: string | null;
  description: string[];
  next_runs: string[];
}

export interface DiffLine {
  type: "same" | "add" | "del";
  text: string;
}

export interface UnicodeEntry {
  char: string;
  code: string;
  hex: string;
  dec: number;
  name: string;
}

export interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface DateResult {
  ms: number;
  unix: number;
  iso: string;
  utc_str: string;
  local: DateParts;
}

export interface DateConvertResult {
  ok: boolean;
  error: string | null;
  result: DateResult | null;
}

export interface SvgResult {
  ok: boolean;
  error: string | null;
  output: string;
  before: number;
  after: number;
}

export interface PluginMeta {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string | null;
}

export const api = {
  /* --- Буфер обмена --- */
  clipboardList: (filter: string, query: string) =>
    invoke<ClipboardItem[]>("clipboard_list", { filter, query }),
  clipboardGet: (id: number) => invoke<ClipboardFull>("clipboard_get", { id }),
  clipboardDelete: (id: number) => invoke<void>("clipboard_delete", { id }),
  clipboardClear: () => invoke<void>("clipboard_clear"),
  clipboardSetPinned: (id: number, pinned: boolean) => invoke<void>("clipboard_set_pinned", { id, pinned }),
  clipboardSetFavorite: (id: number, favorite: boolean) => invoke<void>("clipboard_set_favorite", { id, favorite }),
  clipboardWrite: (text: string) => invoke<void>("clipboard_write", { text }),
  clipboardStoreText: (kind: string, text: string) => invoke<void>("clipboard_store_text", { kind, text }),
  clipboardStoreImage: (pngBase64: string) => invoke<void>("clipboard_store_image", { pngBase64 }),
  clipboardRestore: (id: number) => invoke<void>("clipboard_restore", { id }),
  clipboardMonitorSetEnabled: (enabled: boolean) => invoke<void>("set_monitor_enabled", { enabled }),

  /* --- Файлы --- */
  filesScan: (dir: string, recursive: boolean) => invoke<FileEntry[]>("files_scan", { dir, recursive }),
  filesFindDuplicates: (dir: string) => invoke<DuplicateGroup[]>("files_find_duplicates", { dir }),
  filesRename: (ops: { from: string; to: string }[]) => invoke<RenameResult[]>("files_rename", { ops }),
  filesOrganize: (dir: string, mode: string, dryRun: boolean) => invoke<OrganizeResult[]>("files_organize", { dir, mode, dryRun }),
  filesSizeBreakdown: (dir: string) => invoke<SizeEntry[]>("files_size_breakdown", { dir }),
  writeTextFileLocal: (path: string, content: string) => invoke<void>("write_text_file", { path, content }),
  copyFile: (src: string, dst: string) => invoke<void>("copy_file", { src, dst }),

  /* --- Система --- */
  systemInfo: () => invoke<SystemInfo>("system_info"),
  processList: () => invoke<ProcessEntry[]>("process_list"),

  /* --- Сеть --- */
  pingHost: (host: string, port?: number, timeoutMs?: number) =>
    invoke<PingResult>("ping_host", { host, port: port ?? 443, timeoutMs: timeoutMs ?? 1500 }),
  scanPorts: (host: string, ports: number[], timeoutMs?: number) =>
    invoke<number[]>("scan_ports", { host, ports, timeoutMs: timeoutMs ?? 250 }),
  publicIp: () => invoke<string>("public_ip"),
  whois: (domain: string) => invoke<string>("whois", { domain }),

  /* --- Разработка --- */
  hashString: (text: string, algorithm: string) => invoke<string>("hash_string", { text, algorithm }),

  /* --- Вычисления (ядро Rust) --- */
  textCount: (input: string) => invoke<TextStats>("text_count", { input }),
  caseConvert: (input: string, mode: string) => invoke<string>("case_convert", { input, mode }),
  slugify: (input: string) => invoke<string>("slugify", { input }),
  sortLines: (input: string, mode: string) => invoke<string>("sort_lines", { input, mode }),
  base64Encode: (text: string) => invoke<string>("base64_encode", { text }),
  base64Decode: (text: string) => invoke<string>("base64_decode", { text }),
  urlEncode: (text: string) => invoke<string>("url_encode", { text }),
  urlDecode: (text: string) => invoke<string>("url_decode", { text }),
  uuidGenerate: (version: string, count: number) => invoke<string[]>("uuid_generate", { version, count }),
  passwordGenerate: (length: number, useUpper: boolean, useDigits: boolean, useSymbols: boolean, excludeAmbiguous: boolean) =>
    invoke<PasswordResult>("password_generate", { length, useUpper, useDigits, useSymbols, excludeAmbiguous }),
  passwordStrength: (pass: string) => invoke<StrengthResult>("password_strength", { pass }),
  loremGenerate: (count: number, unit: string) => invoke<LoremResult>("lorem_generate", { count, unit }),
  textObfuscate: (text: string) => invoke<string>("text_obfuscate", { text }),
  textDeobfuscate: (text: string) => invoke<string>("text_deobfuscate", { text }),
  jsonFormat: (input: string, indent: number) => invoke<JsonFormatResult>("json_format", { input, indent }),
  jwtDecode: (token: string) => invoke<JwtResult>("jwt_decode", { token }),
  colorConvert: (hex: string) => invoke<ColorResult | null>("color_convert", { hex }),
  cronParse: (expr: string) => invoke<CronResult>("cron_parse", { expr }),
  textDiff: (left: string, right: string, ignoreCase: boolean) =>
    invoke<DiffLine[]>("text_diff", { left, right, ignoreCase }),
  jsonDiff: (left: string, right: string, ignoreWhitespace: boolean) =>
    invoke<DiffLine[]>("json_diff", { left, right, ignoreWhitespace }),
  unicodeInfo: (input: string) => invoke<UnicodeEntry[]>("unicode_info", { input }),
  aesEncrypt: (key: string, data: string) => invoke<string>("aes_encrypt", { key, data }),
  aesDecrypt: (key: string, data: string) => invoke<string>("aes_decrypt", { key, data }),
  dateNow: () => invoke<DateResult>("date_now"),
  dateConvert: (custom: string) => invoke<DateConvertResult>("date_convert", { custom }),
  svgOptimize: (input: string) => invoke<SvgResult>("svg_optimize", { input }),

  /* --- Графика --- */
  convertImage: (inputPath: string, outputPath: string, format: string, quality?: number) =>
    invoke<ConvertResult>("convert_image", { inputPath, outputPath, format, quality: quality ?? 90 }),
  resizeImage: (inputPath: string, width: number, height: number, fit?: string) =>
    invoke<ConvertResult>("resize_image", { inputPath, width, height, fit: fit ?? "fit" }),
  compressImage: (inputPath: string, quality: number) =>
    invoke<ConvertResult>("compress_image", { inputPath, quality }),
  generateQr: (text: string, size?: number) => invoke<QrResult>("generate_qr", { text, size: size ?? 300 }),
  saveQrImage: (path: string, pngBase64: string) => invoke<void>("save_qr_image", { path, pngBase64 }),

  /* --- PDF --- */
  pdfMerge: (paths: string[], output: string) => invoke<PdfResult>("pdf_merge", { paths, output }),
  pdfSplit: (path: string, outputDir: string, ranges: string) => invoke<SplitResult[]>("pdf_split", { path, outputDir, ranges }),
  pdfInfo: (path: string) => invoke<PdfInfo>("pdf_info", { path }),
  imageToPdf: (paths: string[], output: string) => invoke<PdfResult>("image_to_pdf", { paths, output }),
  pdfExtractText: (path: string) => invoke<string>("pdf_extract_text", { path }),
  pdfOptimize: (path: string, output: string) => invoke<OptimizeResult>("pdf_optimize", { path, output }),
  pdfToImages: (path: string, outputDir: string, dpi: number) =>
    invoke<SplitResult[]>("pdf_to_images", { path, outputDir, dpi }),

  /* --- Настройки --- */
  settingsGet: (key: string) => invoke<string | null>("settings_get", { key }),
  settingsSet: (key: string, value: string) => invoke<void>("settings_set", { key, value }),

  /* --- Модули и плагины --- */
  modulesGet: () => invoke<[string, boolean][]>("modules_get"),
  moduleSet: (id: string, enabled: boolean) => invoke<void>("settings_set", { key: `module:${id}`, value: enabled ? "1" : "0" }),
  pluginList: () => invoke<PluginMeta[]>("plugin_list"),
  pluginInstall: (folderPath: string) => invoke<PluginMeta>("plugin_install", { folderPath }),
  pluginInstallZip: (zipPath: string) => invoke<PluginMeta>("plugin_install_zip", { zipPath }),
  pluginUninstall: (id: string) => invoke<void>("plugin_uninstall", { id }),
  pluginBaseUrl: (id: string) => invoke<string>("plugin_base_url", { id }),
};

/* --- Является ли окружение Tauri --- */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Официальные плагины (автор ForgeKit) отмечаются синей звёздочкой */
const OFFICIAL_PLUGIN_AUTHOR = "ForgeKit";

export function isOfficialPlugin(meta: { author?: string | null } | null | undefined): boolean {
  return !!meta?.author && meta.author === OFFICIAL_PLUGIN_AUTHOR;
}

export function isMac(): boolean {
  return navigator.userAgent.includes("Macintosh");
}

/* --- Открытие диалогов выбора файлов --- */
import { open, save } from "@tauri-apps/plugin-dialog";
import { t } from "./i18n";

export async function pickFiles(options: { multiple?: boolean; filters?: { name: string; extensions: string[] }[] } = {}): Promise<string[] | null> {
  const result = await open({
    multiple: options.multiple ?? false,
    directory: false,
    filters: options.filters,
    title: t("app.pickFiles"),
  });
  if (!result) return null;
  return Array.isArray(result) ? result : [result];
}

export async function pickDirectory(): Promise<string | null> {
  const result = await open({ directory: true, title: t("app.pickFolder") });
  if (!result) return null;
  return Array.isArray(result) ? result[0] : result;
}

export async function pickSave(defaultName: string, filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
  return save({ defaultPath: defaultName, filters, title: t("app.saveFile") });
}

/* --- Хук для вызова команд ядра и получения результата --- */
import { useEffect, useState } from "react";

export function useRust<T>(run: () => Promise<T>, deps: unknown[]): {
  data: T | null;
  error: string | null;
  pending: boolean;
} {
  const [state, setState] = useState<{ data: T | null; error: string | null; pending: boolean }>({
    data: null,
    error: null,
    pending: false,
  });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, pending: true, error: null }));
    run().then(
      (data) => alive && setState({ data, error: null, pending: false }),
      (err) => alive && setState({ data: null, error: String(err), pending: false }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}