import { useState } from "react";
import { FileSearch, Globe2 } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api } from "../core/api";

export default function Whois() {
  const [domain, setDomain] = useState("");
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function lookup() {
    if (!domain.trim()) return;
    setBusy(true);
    setError(null);
    const r = await api.whois(domain.trim()).catch((e) => String(e));
    if (typeof r === "string" && (r.startsWith("Ошибка") || r.startsWith("Не удалось") || r.startsWith("Нет") || r.startsWith("Сервер") || r.startsWith("Введите"))) {
      setError(r);
      setRaw(null);
    } else {
      setRaw(r);
    }
    setBusy(false);
  }

  return (
    <ToolPage
      id="whois"
      actions={
        <Button variant="primary" leftIcon={<Globe2 size={15} />} onClick={lookup} disabled={busy}>
          {busy ? "Запрос…" : "Запросить whois"}
        </Button>
      }
      toolbar={<Input className="mono-value" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} style={{ width: 280 }} />}
      statusLeft={<span>Запрос к whois-серверу по порту 43</span>}
      statusRight={raw ? <span>Символов: {raw.length}</span> : undefined}
    >
      {!raw && !error ? (
        <EmptyState
          icon={<FileSearch size={24} />}
          title="WHOIS"
          description="Показывает владельца домена, даты регистрации и истечения"
          action={
            <Button variant="primary" leftIcon={<Globe2 size={15} />} onClick={lookup}>
              Проверить домен
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