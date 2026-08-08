import { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw, Star } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Button } from "../components/ui";
import { ToolPage } from "../components/layout/ToolPage";
import { isTauri } from "../core/api";
import { checkForUpdates, getAppVersion, type UpdateCheck } from "../core/updater";
import { useI18n } from "../core/i18n";
import { TOOLS, CATEGORIES } from "../core/registry";

export default function About() {
  const [version, setVersion] = useState("");
  const [check, setCheck] = useState<UpdateCheck | null>(null);
  const { t } = useI18n();

  const run = useCallback(async () => {
    setCheck({ status: "checking", current: version, latest: null, releaseUrl: null });
    const result = await checkForUpdates();
    setVersion(result.current);
    setCheck(result);
  }, []);

  useEffect(() => {
    getAppVersion().then(setVersion);
    checkForUpdates().then((r) => {
      setVersion(r.current);
      setCheck(r);
    });
  }, []);

  return (
    <ToolPage
      id="about"
      actions={
        <Button variant="ghost" leftIcon={<RefreshCw size={15} />} onClick={run} disabled={check?.status === "checking" || !isTauri()}>
          {check?.status === "checking" ? t("about.checking") : t("about.check")}
        </Button>
      }
      statusLeft={<span>{t("about.love")}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 40 }}>
        <div className="about-logo">
          <img src="/icon.svg" alt="ForgeKit" width={72} height={72} />
        </div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>ForgeKit</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("about.stats", { t: TOOLS.length, c: CATEGORIES.length })}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={14} style={{ color: "var(--warning)" }} fill="currentColor" />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--text-secondary)" }}>
          <span>{t("about.version", { v: version || "…" })}</span>
          <span>·</span>
          <span>Rust + Tauri 2</span>
          <span>·</span>
          <span>React 19</span>
          <span>·</span>
          <span>SQLite</span>
        </div>
        <div className="fk-panel" style={{ width: "100%", maxWidth: 420, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {check?.status === "checking" ? (
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("about.checkingUpd")}</span>
          ) : check?.status === "up-to-date" ? (
            <span style={{ fontSize: 13, color: "var(--success)" }}>{t("about.upToDate")}</span>
          ) : check?.status === "update" && check.latest ? (
            <>
              <span style={{ fontSize: 13, color: "var(--warning)" }}>{t("about.newVersion", { v: check.latest })}</span>
              <Button variant="primary" size="sm" leftIcon={<Download size={13} />} onClick={() => check.releaseUrl && openUrl(check.releaseUrl)}>
                {t("about.download")}
              </Button>
            </>
          ) : check?.status === "error" ? (
            <span style={{ fontSize: 13, color: "var(--danger)" }}>{t("about.error")}</span>
          ) : (
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("about.hint")}</span>
          )}
        </div>
      </div>
    </ToolPage>
  );
}