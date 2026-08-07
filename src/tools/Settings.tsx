import { useEffect, useState } from "react";
import { Info, Sparkles } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { SegmentedControl } from "../components/ui";
import { api, isTauri } from "../core/api";
import { getTheme, setTheme, type Theme } from "../core/theme";
import { useRouter } from "../core/Router";
import { requestTour } from "../core/firstRun";
import { useI18n, type Lang } from "../core/i18n";

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

const LANG_LABELS: Record<Lang, string> = { ru: "Русский", en: "English" };

export default function Settings() {
  const { navigate } = useRouter();
  const { t, lang, setLang } = useI18n();
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
      actions={<button className="fk-btn fk-btn--primary" onClick={save}>{t("set.save")}</button>}
      statusLeft={<span>{t("set.storage")}</span>}
      statusRight={saved ? <span style={{ color: "var(--success)" }}>{t("set.saved")}</span> : undefined}
    >
      <div className="fk-panel" style={{ padding: "8px 0" }}>
        <SettingRow
          title={t("set.language")}
          description={t("set.languageDesc")}
          control={
            <SegmentedControl<Lang>
              value={lang}
              onChange={setLang}
              items={[
                { value: "ru", label: LANG_LABELS.ru },
                { value: "en", label: LANG_LABELS.en },
              ]}
            />
          }
        />
        <SettingRow
          title={t("set.theme")}
          description={t("set.themeDesc")}
          control={
            <SegmentedControl<Theme>
              value={theme}
              onChange={(v) => {
                setTheme(v);
                setThemeState(v);
              }}
              items={[
                { value: "system", label: t("set.theme.system") },
                { value: "light", label: t("set.theme.light") },
                { value: "dark", label: t("set.theme.dark") },
              ]}
            />
          }
        />
        <SettingRow
          title={t("set.monitor")}
          description={t("set.monitorDesc")}
          control={
            <label className="fk-switch">
              <input type="checkbox" checked={clipboardMonitor} onChange={(e) => setClipboardMonitor(e.target.checked)} />
              <span className="fk-switch__track" />
            </label>
          }
        />
        <SettingRow
          title={t("set.limit")}
          description={t("set.limitDesc")}
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
          title={t("set.hotkey")}
          description={t("set.hotkeyDesc")}
          control={<span className="fk-kbd">Ctrl</span>}
        />
        <SettingRow
          title={t("set.onboarding")}
          description={t("set.onboardingDesc")}
          control={
            <button className="fk-btn fk-btn--ghost fk-btn--sm" onClick={requestTour}>
              <Sparkles size={14} /> {t("set.show")}
            </button>
          }
        />
        <SettingRow
          title={t("set.about")}
          description={t("set.aboutDesc")}
          control={
            <button className="fk-btn fk-btn--ghost fk-btn--sm" onClick={() => navigate("about")}>
              <Info size={14} /> {t("set.open")}
            </button>
          }
        />
      </div>
    </ToolPage>
  );
}