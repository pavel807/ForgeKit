import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function JWTDecoder() {
  const { t } = useI18n();
  const [token, setToken] = useState("");

  const { data: decoded, error } = useRust(() => api.jwtDecode(token), [token]);

  return (
    <ToolPage
      id="jwt-decoder"
      statusLeft={<span>{error ? t("jwt.decodeError") : t("jwt.hint")}</span>}
      statusRight={decoded ? <span>{t("jwt.expiresAt", { at: decoded.exp_str ?? t("jwt.expNotSet") })}</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea
          className="fk-textarea mono-value"
          placeholder="eyJhbGciOi…"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          spellCheck={false}
          style={{ minHeight: 90 }}
        />
        {error && <div className="error-text">{error}</div>}
        {decoded && (
          <>
            <div className="fk-panel">
              <div className="fk-panel__header">Header</div>
              <pre className="fk-code mono-value">{decoded.header}</pre>
            </div>
            <div className="fk-panel">
              <div className="fk-panel__header fk-panel__header--row">
                Payload
                <CopyButton text={decoded.payload} size="sm" />
              </div>
              <pre className="fk-code mono-value">{decoded.payload}</pre>
            </div>
            <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{t("jwt.signature")}</span>
              <span className="mono-value" style={{ flex: 1, fontSize: 12, overflowWrap: "anywhere", userSelect: "text" }}>
                {decoded.signature}
              </span>
              <CopyButton text={decoded.signature} size="sm" />
            </div>
          </>
        )}
      </div>
    </ToolPage>
  );
}
