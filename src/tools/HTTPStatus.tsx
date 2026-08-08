import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, SearchInput } from "../components/ui";
import { useI18n, type Keys } from "../core/i18n";

const STATUS_CODES: { code: number; label: string; descKey: Keys }[] = [
  { code: 200, label: "OK", descKey: "http.200" },
  { code: 201, label: "Created", descKey: "http.201" },
  { code: 202, label: "Accepted", descKey: "http.202" },
  { code: 204, label: "No Content", descKey: "http.204" },
  { code: 301, label: "Moved Permanently", descKey: "http.301" },
  { code: 302, label: "Found", descKey: "http.302" },
  { code: 304, label: "Not Modified", descKey: "http.304" },
  { code: 400, label: "Bad Request", descKey: "http.400" },
  { code: 401, label: "Unauthorized", descKey: "http.401" },
  { code: 403, label: "Forbidden", descKey: "http.403" },
  { code: 404, label: "Not Found", descKey: "http.404" },
  { code: 405, label: "Method Not Allowed", descKey: "http.405" },
  { code: 408, label: "Request Timeout", descKey: "http.408" },
  { code: 409, label: "Conflict", descKey: "http.409" },
  { code: 410, label: "Gone", descKey: "http.410" },
  { code: 413, label: "Payload Too Large", descKey: "http.413" },
  { code: 415, label: "Unsupported Media Type", descKey: "http.415" },
  { code: 429, label: "Too Many Requests", descKey: "http.429" },
  { code: 500, label: "Internal Server Error", descKey: "http.500" },
  { code: 501, label: "Not Implemented", descKey: "http.501" },
  { code: 502, label: "Bad Gateway", descKey: "http.502" },
  { code: 503, label: "Service Unavailable", descKey: "http.503" },
  { code: 504, label: "Gateway Timeout", descKey: "http.504" },
  { code: 505, label: "HTTP Version Not Supported", descKey: "http.505" },
];

function tone(color: number): "success" | "danger" | "warning" {
  if (color < 300) return "success";
  if (color < 400) return "warning";
  return "danger";
}

export default function HTTPStatus() {
  const [query, setQuery] = useState("");
  const { t } = useI18n();
  const filtered = useMemo(() => {
    if (!query.trim()) return STATUS_CODES;
    const q = query.toLowerCase();
    return STATUS_CODES.filter((s) => String(s.code).includes(q) || s.label.toLowerCase().includes(q) || t(s.descKey).toLowerCase().includes(q));
  }, [query, t]);

  return (
    <ToolPage
      id="http-status"
      toolbar={<SearchInput placeholder={t("http.search")} value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 280 }} />}
      statusLeft={<span>{t("http.count", { n: STATUS_CODES.length })}</span>}
      statusRight={<span>{t("http.groups")}</span>}
    >
      <div className="http-grid">
        {filtered.map((s) => (
          <div key={s.code} className="fk-panel fk-panel--http" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mono-value" style={{ fontSize: 16, fontWeight: 600 }}>{s.code}</span>
              <span className="fk-badge" data-tone={tone(s.code)}>{s.label}</span>
            </div>
            <span className="info-row__label" style={{ fontSize: 13 }}>{t(s.descKey)}</span>
            <CopyButton text={String(s.code)} size="sm" />
          </div>
        ))}
      </div>
    </ToolPage>
  );
}