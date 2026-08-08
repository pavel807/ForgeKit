import { useCallback, useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, isTauri } from "../core/api";
import { useI18n } from "../core/i18n";

export default function IPLookup() {
  const [ip, setIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const seqRef = useRef(0);
  const { t, lang } = useI18n();

  const load = useCallback(async (showBusy = true) => {
    const seq = ++seqRef.current;
    if (showBusy) setBusy(true);
    setError(null);
    try {
      const r = await api.publicIp();
      if (seq !== seqRef.current) return;
      setIp(r);
    } catch (err) {
      if (seq !== seqRef.current) return;
      setError(String(err));
      setIp(null);
    }
    setUpdatedAt(Date.now());
    if (showBusy) setBusy(false);
  }, []);

  useEffect(() => {
    if (!isTauri()) return;
    load(false);
    const interval = window.setInterval(() => load(false), 10000);
    return () => window.clearInterval(interval);
  }, [load]);

  return (
    <ToolPage
      id="ip-lookup"
      actions={
        <Button variant="primary" leftIcon={<Globe size={15} />} onClick={() => load()} disabled={busy}>
          {busy ? t("ip.checking") : t("ip.check")}
        </Button>
      }
      statusLeft={<span>{t("ip.hint")}</span>}
      statusRight={ip ? <span>{t("ip.updated", { at: updatedAt ? new Date(updatedAt).toLocaleTimeString(lang === "en" ? "en-US" : "ru-RU") : "—" })}</span> : undefined}
    >
      {!ip && !error ? (
        <EmptyState icon={<Globe size={24} />} title={t("ip.emptyTitle")} description={t("ip.emptyDesc")} />
      ) : (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="info-row">
            <span className="info-row__label">{t("ip.yourIp")}</span>
            <span className="info-row__value mono-value" style={{ fontSize: 20 }}>{ip ?? "—"}</span>
          </div>
          {error && <div className="error-text">{error}</div>}
        </div>
      )}
    </ToolPage>
  );
}