import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";

export default function Base64Encoder() {
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { data, error } = useRust(
    () => (direction === "encode" ? api.base64Encode(input) : api.base64Decode(input)),
    [input, direction],
  );

  const output = error ? "" : (data ?? "");
  const inBytes = new Blob([input]).size;
  const outBytes = new Blob([output]).size;

  return (
    <ToolPage
      id="base64"
      actions={<Button variant="primary" onClick={() => setInput(output)} disabled={!output}>Применить</Button>}
      toolbar={<SegmentedControl value={direction} onChange={(v) => setDirection(v as "encode" | "decode")} items={[{ value: "encode", label: "Закодировать" }, { value: "decode", label: "Декодировать" }]} />}
      statusLeft={<span>{error ? "Некорректные данные" : "UTF-8 ↔ Base64 (ядро Rust)"}</span>}
      statusRight={<span>{input ? `Вход: ${inBytes} байт · выход: ${outBytes} байт` : ""}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea
          className="fk-textarea mono-value"
          placeholder={direction === "encode" ? "Текст для кодирования…" : "Base64-строка для декодирования…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, minHeight: 150 }}
        />
        {output && (
          <div className="fk-panel" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <textarea className="fk-textarea mono-value" value={output} readOnly spellCheck={false} style={{ flex: 1, minHeight: 80 }} />
            <CopyButton text={output} />
          </div>
        )}
        {error && <div className="error-text">{error}</div>}
      </div>
    </ToolPage>
  );
}
