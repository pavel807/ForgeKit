import { useState } from "react";
import { FileSearch, Globe2 } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api } from "../core/api";
import { useI18n } from "../core/i18n";

export default function Whois() {
  const [domain, setDomain] = useState("");
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  async function lookup() {
    if (!domain.trim()) return;
    setBusy(true);
    setError(null);
    setRaw(null);
    try {
      const r = await api.whois(domain.trim());
      setRaw(r);
    } catch (err) {
      setError(String(err));
    }
    setBusy(false);
  }

  return (
    <ToolPage
      id="whois"
      actions={
        <Button variant="primary" leftIcon={<Globe2 size={15} />} onClick={lookup} disabled={busy}>
          {busy ? t("whois.checking") : t("whois.check")}
        </Button>
      }
      toolbar={<Input className="mono-value" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ width: 280 }} />}
      statusLeft={<span>{t("whois.hint")}</span>}
      statusRight={raw ? <span>{t("whois.chars", { n: raw.length })}</span> : undefined}
    >
      {!raw && !error ? (
        <EmptyState
          icon={<FileSearch size={24} />}
          title="WHOIS"
          description={t("whois.emptyDesc")}
          action={
            <Button variant="primary" leftIcon={<Globe2 size={15} />} onClick={lookup}>
              {t("whois.check")}
            </Button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {error && <div className="error-text">{error}</div>}
          {raw && (
            <div className="fk-panel" style={{ overflow: "auto", userSelect: "text" }}>
              <pre className="whois-pre mono-value" style={{ fontSize: 12.5, margin: 0, padding: "14px 16px", whiteSpace: "pre-wrap" }}>
                {raw}
              </pre>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  );
}