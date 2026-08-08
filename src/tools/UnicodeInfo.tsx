import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Input } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function UnicodeInfo() {
  const { t } = useI18n();
  const [input, setInput] = useState("");

  const { data: entries } = useRust(() => api.unicodeInfo(input), [input]);
  const list = entries ?? [];

  return (
    <ToolPage
      id="unicode-info"
      toolbar={<Input className="mono-value" placeholder={t("unicode.placeholder")} value={input} onChange={(e) => setInput(e.target.value)} style={{ width: 320 }} />}
      statusLeft={<span>{t("unicode.hint")}</span>}
      statusRight={list.length > 0 ? <span>{t("unicode.chars", { n: list.length })}</span> : undefined}
    >
      {list.length === 0 ? (
        <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{t("unicode.emptyHint")}</div>
      ) : (
        <div className="fk-panel" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 130px 130px 130px 1fr", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            <span>{t("unicode.char")}</span>
            <span>Unicode</span>
            <span>{t("unicode.escape")}</span>
            <span>{t("unicode.decimal")}</span>
            <span>{t("unicode.description")}</span>
          </div>
          {list.map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 130px 130px 130px 1fr", padding: "7px 14px", borderBottom: "1px solid var(--border-soft)", fontSize: 12.5 }}>
              <span style={{ fontSize: 16 }}>{e.char}</span>
              <span className="mono-value">{e.code}</span>
              <span className="mono-value" style={{ userSelect: "text" }}>{e.hex}</span>
              <span className="mono-value">{e.dec}</span>
              <span style={{ color: "var(--text-secondary)" }}>{e.name}</span>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
