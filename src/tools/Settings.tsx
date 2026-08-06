import { useEffect, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { SegmentedControl } from "../components/ui";
import { api, isTauri } from "../core/api";
import { getTheme, setTheme, type Theme } from "../core/theme";

function SettingRow({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{description}</div>
      </div>
      {control}
    </div>
  );
}

export default function Settings() {
  const [theme, setThemeState] = useState<Theme>(() => getTheme());
  const [clipboardMonitor, setClipboardMonitor] = useState(true);
  const [clipboardLimit, setClipboardLimit] = useState("500");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;
    api.settingsGet("clipboard_limit").then((v) => {
      if (v) setClipboardLimit(v);
    });
  }, []);

  async function save() {
    if (!isTauri()) return;
    await api.settingsSet("clipboard_limit", clipboardLimit.trim() || "500").catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <ToolPage
      id="settings"
      actions={<button className="fk-btn fk-btn--primary" onClick={save}>Сохранить</button>}
      statusLeft={<span>Настройки хранятся в SQLite (app_data_dir)</span>}
      statusRight={saved ? <span style={{ color: "var(--success)" }}>Сохранено</span> : undefined}
    >
      <div className="fk-panel" style={{ padding: "8px 0" }}>
        <SettingRow
          title="Тема оформления"
          description="Светлая, тёмная или по настройкам системы"
          control={
            <SegmentedControl<Theme>
              value={theme}
              onChange={(v) => {
                setTheme(v);
                setThemeState(v);
              }}
              items={[
                { value: "system", label: "Система" },
                { value: "light", label: "Светлая" },
                { value: "dark", label: "Тёмная" },
              ]}
            />
          }
        />
        <SettingRow
          title="Мониторинг буфера обмена"
          description="Автоматически сохранять новые копирования в историю"
          control={
            <label className="fk-switch">
              <input type="checkbox" checked={clipboardMonitor} onChange={(e) => setClipboardMonitor(e.target.checked)} />
              <span className="fk-switch__track" />
            </label>
          }
        />
        <SettingRow
          title="Лимит истории буфера"
          description="Максимальное количество записей, хранимых в базе"
          control={
            <input
              className="fk-input fk-input--sm mono-value"
              value={clipboardLimit}
              onChange={(e) => setClipboardLimit(e.target.value)}
              style={{ width: 90, textAlign: "right" }}
            />
          }
        />
        <SettingRow
          title="Глобальный хоткей"
          description="Ctrl+Space — открыть глобальный поиск в любом приложении"
          control={<span className="fk-kbd">Ctrl</span>}
        />
      </div>
    </ToolPage>
  );
}