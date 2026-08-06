import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Input } from "../components/ui";
import { api, useRust } from "../core/api";

export default function UnicodeInfo() {
  const [input, setInput] = useState("");

  const { data: entries } = useRust(() => api.unicodeInfo(input), [input]);
  const list = entries ?? [];

  return (
    <ToolPage
      id="unicode-info"
      toolbar={<Input className="mono-value" placeholder="Введите символы…" value={input} onChange={(e) => setInput(e.target.value)} style={{ width: 320 }} />}
      statusLeft={<span>Коды, эскейп-последовательности и десятичные значения</span>}
      statusRight={list.length > 0 ? <span>Символов: {list.length}</span> : undefined}
    >
      {list.length === 0 ? (
        <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Введите символы, чтобы увидеть их Unicode-информацию</div>
      ) : (
        <div className="fk-panel" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 130px 130px 130px 1fr", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            <span>Символ</span>
            <span>Unicode</span>
            <span>Эскейп</span>
            <span>Десятичный</span>
            <span>Описание</span>
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
