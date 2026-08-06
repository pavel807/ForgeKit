import { useCallback, useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, isTauri } from "../core/api";

export default function IPLookup() {
  const [ip, setIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const load = useCallback(async (showBusy = true) => {
    if (showBusy) setBusy(true);
    setError(null);
    const r = await api.publicIp().catch((e) => String(e));
    if (typeof r === "string" && r.includes(" ")) {
      setError(r);
      setIp(null);
    } else {
      setIp(r as string);
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
          {busy ? "Проверка…" : "Определить IP"}
        </Button>
      }
      statusLeft={<span>Внешний адрес определяется через api.ipify.org · обновляется каждые 10 с</span>}
      statusRight={ip ? <span>Обновлено: {updatedAt ? new Date(updatedAt).toLocaleTimeString("ru-RU") : "—"}</span> : undefined}
    >
      {!ip && !error ? (
        <EmptyState icon={<Globe size={24} />} title="Определение IP-адреса" description="Узнайте ваш публичный IPv4-адрес" />
      ) : (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="info-row">
            <span className="info-row__label">Ваш IP</span>
            <span className="info-row__value mono-value" style={{ fontSize: 20 }}>{ip ?? "—"}</span>
          </div>
          {error && <div className="error-text">{error}</div>}
        </div>
      )}
    </ToolPage>
  );
}