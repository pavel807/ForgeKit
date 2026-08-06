import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";

export default function URLCodec() {
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { data, error } = useRust(
    () => (direction === "encode" ? api.urlEncode(input) : api.urlDecode(input)),
    [input, direction],
  );

  const output = error ? "" : (data ?? "");

  return (
    <ToolPage
      id="url-codec"
      actions={<Button variant="primary" onClick={() => setInput(output)} disabled={!output}>Применить</Button>}
      toolbar={<SegmentedControl value={direction} onChange={(v) => setDirection(v as "encode" | "decode")} items={[{ value: "encode", label: "Кодировать" }, { value: "decode", label: "Декодировать" }]} />}
      statusLeft={<span>Кодирование по RFC 3986 (ядро Rust)</span>}
      statusRight={output ? <span>{output.length} символов</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea
          className="fk-textarea mono-value"
          placeholder={direction === "encode" ? "URL или строка…" : "Закодированный фрагмент…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, minHeight: 130 }}
        />
        <div className="fk-panel" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <textarea className="fk-textarea mono-value" value={output} readOnly spellCheck={false} style={{ flex: 1, minHeight: 80 }} placeholder="Результат" />
          <CopyButton text={output} disabled={!output} />
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>
    </ToolPage>
  );
}
