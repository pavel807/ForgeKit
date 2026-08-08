import { useEffect, useRef, useState } from "react";
import { Wifi } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api, type PingResult } from "../core/api";
import { useI18n } from "../core/i18n";

export default function Ping() {
  const [host, setHost] = useState("google.com");
  const [result, setResult] = useState<PingResult | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const { t } = useI18n();

  async function ping() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const r = await api.pingHost(host.trim() || "localhost").catch((e) => ({ ok: false, latency_ms: null, error: String(e) }));
    setResult(r);
    busyRef.current = false;
    setBusy(false);
  }

  useEffect(() => {
    ping();
    const interval = window.setInterval(ping, 2000);
    return () => window.clearInterval(interval);
  }, [host]);

  return (
    <ToolPage
      id="ping"
      actions={
        <Button variant="primary" leftIcon={<Wifi size={15} />} onClick={ping} disabled={busy}>
          {busy ? t("ping.checking") : t("ping.ping")}
        </Button>
      }
      toolbar={<Input className="mono-value" placeholder="example.com" value={host} onChange={(e) => setHost(e.target.value)} style={{ width: 280 }} />}
      statusLeft={<span>{t("ping.hint")}</span>}
      statusRight={
        result ? (
          result.ok ? <span style={{ color: "var(--success)" }}>{t("ping.up")}</span> : <span style={{ color: "var(--danger)" }}>{t("ping.down")}</span>
        ) : undefined
      }
    >
      {!result ? (
        <EmptyState
          icon={<Wifi size={24} />}
          title={t("ping.emptyTitle")}
          description={t("ping.emptyDesc")}
          action={
            <Button variant="primary" leftIcon={<Wifi size={15} />} onClick={ping}>
              {t("ping.check")}
            </Button>
          }
        />
      ) : (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="info-row">
            <span className="info-row__label">{t("ping.host")}</span>
            <span className="info-row__value mono-value">{host}</span>
          </div>
          <div className="info-row">
            <span className="info-row__label">{t("ping.latency")}</span>
            <span className="info-row__value mono-value">{result.ok && result.latency_ms != null ? t("ping.ms", { n: result.latency_ms }) : "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-row__label">{t("ping.status")}</span>
            <span className="info-row__value" style={{ color: result.ok ? "var(--success)" : "var(--danger)" }}>
              {result.ok ? t("ping.up") : (result.error ?? t("ping.down"))}
            </span>
          </div>
        </div>
      )}
    </ToolPage>
  );
}