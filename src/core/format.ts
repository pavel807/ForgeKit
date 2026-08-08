/* Форматирование: время, размер, числа */

import type { Lang } from "./i18n";

const REL = {
  ru: { just: "только что", sec: "сек. назад", min: "мин. назад", hour: "ч. назад", yesterday: "вчера", days: "дн. назад" },
  en: { just: "just now", sec: "s ago", min: "min ago", hour: "h ago", yesterday: "yesterday", days: "d ago" },
} as const;

const locale = (lang: Lang) => (lang === "en" ? "en-US" : "ru-RU");

export function formatRelativeTime(ts: number, lang: Lang = "ru"): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  const loc = REL[lang];
  if (s < 10) return loc.just;
  if (s < 60) return `${s} ${loc.sec}`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} ${loc.min}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${loc.hour}`;
  const d = Math.floor(h / 24);
  if (d < 7) return d === 1 ? loc.yesterday : `${d} ${loc.days}`;
  const date = new Date(ts);
  return date.toLocaleDateString(locale(lang), { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(ts: number, lang: Lang = "ru"): string {
  return new Date(ts).toLocaleString(locale(lang), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Б";
  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val >= 10 || i === 0 ? Math.round(val) : val.toFixed(1)} ${units[i]}`;
}

/* Двоичные единицы (1024): для оперативной памяти, где 24 ГБ = 24 GiB */
export function formatBytesBinary(bytes: number): string {
  if (bytes === 0) return "0 ГБ";
  const units = ["Б", "КБ", "МБ", "ГБ", "ТБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val >= 10 || i === 0 ? Math.round(val) : val.toFixed(1)} ${units[i]}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

let uidCounter = 0;
export function uid(): string {
  uidCounter += 1;
  return `fk-${Date.now().toString(36)}-${uidCounter}`;
}