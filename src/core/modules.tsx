/* Состояние модулей: какие инструменты/плагины включены.
   Хранится в БД (SQLite) как settings module:<id> = "1"/"0".
   Без явной записи модуль считается включённым по умолчанию. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, isTauri, type PluginMeta } from "./api";
import { removePluginTool, registerPluginTool } from "./registry";

/** Встроенные страницы, которые нельзя отключить */
export const CORE_MODULE_IDS = new Set(["dashboard", "plugins", "settings", "about"]);

interface ModulesValue {
  loaded: boolean;
  /** Явные переопределения из БД: id → включён/выключен */
  overrides: Record<string, boolean>;
  plugins: PluginMeta[];
  isEnabled: (id: string) => boolean;
  setEnabled: (id: string, enabled: boolean) => void;
  refreshPlugins: () => Promise<void>;
}

const ModulesContext = createContext<ModulesValue>({
  loaded: false,
  overrides: {},
  plugins: [],
  isEnabled: () => true,
  setEnabled: () => {},
  refreshPlugins: async () => {},
});

export function ModulesProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [plugins, setPlugins] = useState<PluginMeta[]>([]);

  useEffect(() => {
    if (!isTauri()) {
      setLoaded(true);
      return;
    }
    let alive = true;
    Promise.all([api.modulesGet(), api.pluginList()]).then(
      ([mods, list]) => {
        if (!alive) return;
        const map: Record<string, boolean> = {};
        for (const [id, enabled] of mods) map[id] = enabled;
        setOverrides(map);
        setPlugins(list);
for (const p of list) registerPluginTool({ id: p.id, name: p.name, description: p.description, author: p.author });
      setLoaded(true);
      },
      () => alive && setLoaded(true),
    );
    return () => {
      alive = false;
    };
  }, []);

  const refreshPlugins = useCallback(async () => {
    if (!isTauri()) return;
    try {
      const list = await api.pluginList();
      const installed = new Set(list.map((p) => p.id));
      setPlugins((prev) => {
        for (const p of prev) if (!installed.has(p.id)) removePluginTool(p.id);
        return list;
      });
      for (const p of list) registerPluginTool({ id: p.id, name: p.name, description: p.description, author: p.author });
      setOverrides((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const p of list) if (!(p.id in next)) next[p.id] = true, changed = true;
        return changed ? next : prev;
      });
    } catch {
      /* игнорируем ошибки обновления списка */
    }
  }, []);

  const isEnabled = useCallback(
    (id: string) => {
      if (!loaded) return true;
      if (CORE_MODULE_IDS.has(id)) return true;
      return overrides[id] ?? true;
    },
    [loaded, overrides],
  );

  const setEnabled = useCallback((id: string, enabled: boolean) => {
    setOverrides((prev) => ({ ...prev, [id]: enabled }));
    if (isTauri()) void api.moduleSet(id, enabled).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ loaded, overrides, plugins, isEnabled, setEnabled, refreshPlugins }),
    [loaded, overrides, plugins, isEnabled, setEnabled, refreshPlugins],
  );

  return <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>;
}

export function useModules(): ModulesValue {
  return useContext(ModulesContext);
}