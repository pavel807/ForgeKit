import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function TextDiff() {
  const { t } = useI18n();
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);

  const { data: diff } = useRust(() => api.textDiff(left, right, ignoreCase), [left, right, ignoreCase]);
  const lines = diff ?? [];

  const adds = lines.filter((d) => d.type === "add").length;
  const dels = lines.filter((d) => d.type === "del").length;

  return (
    <ToolPage
      id="text-diff"
      toolbar={
        <label className="fk-checkbox" style={{ fontSize: 13 }}>
          <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
          <span>{t("diff.ignoreCase")}</span>
        </label>
      }
      statusLeft={<span>{t("diff.hint")}</span>}
      statusRight={<span style={{ color: "var(--success)" }}>+ {adds} <span style={{ color: "var(--danger)" }}>− {dels}</span></span>}
    >
      <div className="diff-grid">
        <div className="diff-col">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 6 }}>
            {t("diff.versionA")}
          </div>
          <textarea className="fk-textarea mono-value" placeholder="…" value={left} onChange={(e) => setLeft(e.target.value)} spellCheck={false} />
        </div>
        <div className="diff-col">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 6 }}>
            {t("diff.versionB")}
          </div>
          <textarea className="fk-textarea mono-value" placeholder="…" value={right} onChange={(e) => setRight(e.target.value)} spellCheck={false} />
        </div>
        <div className="diff-result" style={{ gridColumn: "1 / -1" }}>
          {lines.length === 0 && <div style={{ color: "var(--text-tertiary)", textAlign: "center", paddingTop: 40 }}>{t("diff.identical")}</div>}
          {lines.map((l, i) => (
            <div key={i} className={`diff-line diff-line--${l.type}`} style={l.type === "same" ? { color: "var(--text-tertiary)", fontSize: 12.5 } : undefined}>
              <span className="diff-line__sign">{l.type === "add" ? "+" : l.type === "del" ? "−" : " "}</span>
              <pre className="diff-line__text mono-value">{l.text}</pre>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
