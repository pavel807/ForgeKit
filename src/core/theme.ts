/* Управление темой: system / light / dark, класс .dark на <html> */

export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "forgekit-theme";

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getTheme(): Theme {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

export function isDark(t: Theme = getTheme()): boolean {
  return t === "dark" || (t === "system" && prefersDark().matches);
}

export function applyTheme(t: Theme) {
  const dark = isDark(t);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function setTheme(t: Theme) {
  localStorage.setItem(STORAGE_KEY, t);
  applyTheme(t);
}

export function initTheme() {
  applyTheme(getTheme());
  prefersDark().addEventListener("change", () => {
    if (getTheme() === "system") applyTheme("system");
  });
}
