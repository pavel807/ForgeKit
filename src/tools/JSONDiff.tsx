import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Checkbox } from "../components/ui";
import { api, useRust } from "../core/api";

export default function JSONDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const { data: processed } = useRust(() => api.jsonDiff(left, right, ignoreWhitespace), [left, right, ignoreWhitespace]);
  const lines = processed ?? [];

  const adds = lines.filter((l) => l.type === "add").length;
  const dels = lines.filter((l) => l.type === "del").length;

  return (
    <ToolPage
      id="json-diff"
      toolbar={
        <Checkbox label="Нормализовать пробелы" checked={ignoreWhitespace} onChange={(v) => setIgnoreWhitespace(v)} />
      }
      statusLeft={<span>Вставьте две версии текста или JSON слева и справа</span>}
      statusRight={<span>+ {adds} · − {dels}</span>}
    >
      <div className="diff-grid">
        <div className="diff-col">
          <textarea className="fk-textarea mono-value" placeholder="Версия A" value={left} onChange={(e) => setLeft(e.target.value)} spellCheck={false} />
        </div>
        <div className="diff-col">
          <textarea className="fk-textarea mono-value" placeholder="Версия B" value={right} onChange={(e) => setRight(e.target.value)} spellCheck={false} />
        </div>
        <div className="diff-result" style={{ gridColumn: "1 / -1" }}>
          {lines.length === 0 && <div style={{ color: "var(--text-tertiary)", textAlign: "center", paddingTop: 40 }}>Различий нет</div>}
          {lines.map((l, i) => (
            <div
              key={i}
              className={`diff-line diff-line--${l.type}`}
              style={l.type === "same" ? { color: "var(--text-tertiary)", fontSize: 12.5 } : undefined}
            >
              <span className="diff-line__sign">{l.type === "add" ? "+" : l.type === "del" ? "−" : " "}</span>
              <pre className="diff-line__text mono-value">{l.text}</pre>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}
