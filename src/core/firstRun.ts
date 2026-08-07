/* Состояние первого запуска: маркер инструктажа и дата первого визита.
   В Tauri — через SQLite-настройки, в браузере — через localStorage. */

import { api, isTauri } from "./api";

const SETTING_TOUR = "onboarding_tour";
const SETTING_FIRST_VISIT = "first_visit_date";
const LS_TOUR = "forgekit-onboarding-tour";
const LS_FIRST_VISIT = "forgekit-first-visit";

function today(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function readSetting(key: string, lsKey: string): Promise<string | null> {
  if (isTauri()) {
    try {
      return await api.settingsGet(key);
    } catch {
      return null;
    }
  }
  return localStorage.getItem(lsKey);
}

async function writeSetting(key: string, lsKey: string, value: string): Promise<void> {
  if (isTauri()) {
    try {
      await api.settingsSet(key, value);
      return;
    } catch {
      return;
    }
  }
  localStorage.setItem(lsKey, value);
}

/** Дата первого запуска (заполняется при первом обращении). */
export async function firstVisitDate(): Promise<string> {
  const stored = await readSetting(SETTING_FIRST_VISIT, LS_FIRST_VISIT);
  if (stored) return stored;
  const now = today();
  await writeSetting(SETTING_FIRST_VISIT, LS_FIRST_VISIT, now);
  return now;
}

/** True, если пользователь пришёл впервые и сегодня — его первый день. */
export async function isFirstDay(): Promise<boolean> {
  return (await firstVisitDate()) === today();
}

/** True, если инструктаж уже пройден или пропущен. */
export async function isTourDone(): Promise<boolean> {
  return (await readSetting(SETTING_TOUR, LS_TOUR)) === "1";
}

/** Отметить инструктаж как завершённый (не показывать снова). */
export async function markTourDone(): Promise<void> {
  await writeSetting(SETTING_TOUR, LS_TOUR, "1");
}

/** Запрос на показ инструктажа из настроек (слушает Shell). */
export function requestTour(): void {
  window.dispatchEvent(new CustomEvent("forgekit-open-tour"));
}