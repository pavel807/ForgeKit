import { useState } from "react";
import { Puzzle, Unplug } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, SearchInput } from "../components/ui";

interface PluginInfo {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  installed: boolean;
}

const PLUGINS: PluginInfo[] = [
  { id: "clipboard-manager", name: "Clipboard Manager", description: "История и восстановление буфера обмена", author: "ForgeKit", version: "2.3.2", installed: true },
  { id: "global-shortcut", name: "Global Shortcut", description: "Глобальный хоткей Ctrl+Space", author: "ForgeKit", version: "2.3.2", installed: true },
  { id: "dialog", name: "Dialog", description: "Системные диалоги выбора файлов", author: "ForgeKit", version: "2.7.2", installed: true },
  { id: "opener", name: "Opener", description: "Открытие ссылок во внешнем браузере", author: "ForgeKit", version: "2.5.0", installed: true },
];

export default function Plugins() {
  const [query, setQuery] = useState("");
  const filtered = PLUGINS.filter(
    (p) => !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ToolPage
      id="plugins"
      toolbar={<SearchInput placeholder="Поиск плагинов…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 280 }} />}
      statusLeft={<span>Плагины — это модули расширения ForgeKit</span>}
      statusRight={<span>Установлено: {PLUGINS.filter((p) => p.installed).length} из {PLUGINS.length}</span>}
    >
      {filtered.length === 0 ? (
        <EmptyState icon={<Puzzle size={24} />} title="Плагины не найдены" description="Попробуйте изменить запрос" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((p) => (
            <div key={p.id} className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
              <div className="plugin-icon"><Puzzle size={18} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                  <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>v{p.version}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{p.description}</div>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{p.author}</span>
              {p.installed ? (
                <span className="fk-badge fk-badge--success">Установлен</span>
              ) : (
                <Button size="sm" leftIcon={<Unplug size={13} />}>Установить</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}