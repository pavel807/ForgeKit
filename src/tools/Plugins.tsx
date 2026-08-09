import { useState } from "react";
import { Puzzle, PackageOpen, FolderOpen, Trash2, Play, PlugZap } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, OfficialStar, Switch } from "../components/ui";
import { useI18n } from "../core/i18n";
import { useModules, CORE_MODULE_IDS } from "../core/modules";
import { TOOLS } from "../core/registry";
import { useRouter } from "../core/Router";
import { api, isOfficialPlugin, isTauri, pickDirectory, pickFiles } from "../core/api";

/** Расширения: управление встроенными модулями и установленными плагинами */
export default function Plugins() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { plugins, isEnabled, setEnabled, refreshPlugins } = useModules();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modules = TOOLS.filter((tool) => !CORE_MODULE_IDS.has(tool.id));

  const runAction = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  };

  const installFolder = () =>
    runAction(async () => {
      const dir = await pickDirectory();
      if (!dir) return;
      await api.pluginInstall(dir);
      await refreshPlugins();
    });

  const installZip = () =>
    runAction(async () => {
      const files = await pickFiles({ filters: [{ name: t("mod.zipFilter"), extensions: ["fkplugin"] }] });
      if (!files) return;
      await api.pluginInstallZip(files[0]);
      await refreshPlugins();
    });

  const removePlugin = (id: string) =>
    runAction(async () => {
      await api.pluginUninstall(id);
      await refreshPlugins();
    });

  return (
    <ToolPage
      id="plugins"
      statusLeft={<span>{t("mod.statusLeft")}</span>}
      statusRight={
        <span>
          {t("mod.installed", { a: modules.length, b: TOOLS.length })}
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* --- Установка плагинов --- */}
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 className="text-sm font-semibold text-muted-foreground">{t("mod.installTitle")}</h2>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
              <PackageOpen size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t("mod.installDesc")}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{t("mod.installHint")}</div>
            </div>
            {isTauri() && (
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" leftIcon={<FolderOpen size={13} />} onClick={installFolder} disabled={busy}>
                  {t("mod.fromFolder")}
                </Button>
                <Button variant="primary" size="sm" onClick={installZip} disabled={busy}>
                  {t("mod.fromZip")}
                </Button>
              </div>
            )}
          </div>
          {error && (
            <div className="fk-badge fk-badge--danger" style={{ alignSelf: "flex-start", padding: "6px 12px", fontSize: 12.5 }}>
              {error}
            </div>
          )}
        </section>

        {/* --- Установленные плагины --- */}
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)" }}>
            {t("mod.pluginsTitle")}
          </h2>
          {plugins.length === 0 ? (
            <EmptyState icon={<Puzzle size={24} />} title={t("mod.noPlugins")} description={t("mod.noPluginsDesc")} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plugins.map((p) => (
                <div key={p.id} className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
                    <Puzzle size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
                      {isOfficialPlugin(p) && <OfficialStar size={12} />}
                      <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>v{p.version}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }} className="truncate">
                      {p.description || t("mod.noDesc")}
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{p.author}</span>
                  <Button variant="ghost" size="sm" leftIcon={<Play size={13} />} onClick={() => navigate(p.id)}>
                    {t("mod.open")}
                  </Button>
                  <Switch checked={isEnabled(p.id)} onChange={(v) => setEnabled(p.id, v)} />
                  <Button variant="ghost" size="sm" leftIcon={<Trash2 size={13} />} onClick={() => removePlugin(p.id)} disabled={busy}>
                    {t("mod.remove")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- Встроенные модули --- */}
        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)" }}>
            {t("mod.builtinTitle")}
          </h2>
          <div className="fk-panel" style={{ display: "flex", flexDirection: "column", padding: 6 }}>
            {modules.map((tool, i) => {
              const Icon = tool.icon;
              const enabled = isEnabled(tool.id);
              return (
                <div
                  key={tool.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    borderBottom: i < modules.length - 1 ? "1px solid var(--border, rgba(128,128,128,0.18))" : "none",
                    opacity: enabled ? 1 : 0.55,
                  }}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
                    <Icon size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{t(tool.name)}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }} className="truncate">
                      {t(tool.description)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" leftIcon={<PlugZap size={13} />} onClick={() => navigate(tool.id)}>
                    {t("mod.open")}
                  </Button>
                  <Switch checked={enabled} onChange={(v) => setEnabled(tool.id, v)} />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </ToolPage>
  );
}