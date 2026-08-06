import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton } from "../components/ui";
import { api, useRust } from "../core/api";

export default function JSONFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);

  const { data } = useRust(() => api.jsonFormat(input, indent), [input, indent]);

  const output = data?.output ?? "";
  const error = data && !data.ok ? (data.error ?? "Ошибка в JSON") : null;
  const stats = data?.ok && data.output ? `Строк: ${data.lines} · ${data.bytes} байт` : "";

  return (
    <ToolPage
      id="json-formatter"
      toolbar={
        <>
          <select className="fk-select" value={String(indent)} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value="2">Отступ: 2 пробела</option>
            <option value="4">Отступ: 4 пробела</option>
            <option value="0">Без отступов</option>
          </select>
          <div className="spacer" />
          <Button variant="primary" onClick={() => setInput(output)} disabled={!output}>
            Применить формат
          </Button>
          <CopyButton text={output} disabled={!output} />
        </>
      }
      statusLeft={<span>{error ? "Ошибка в JSON" : data?.output ? "Данные валидны" : ""}</span>}
      statusRight={<span>{stats}</span>}
    >
      <div className="split-editor">
        <textarea
          className="fk-textarea mono-value"
          placeholder="Вставьте JSON…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ border: error ? "1px solid var(--danger)" : undefined }}
        />
        <div className="split-editor__divider" />
        <textarea
          className="fk-textarea mono-value"
          value={output}
          readOnly
          placeholder={error ? "" : "Отформатированный JSON"}
          spellCheck={false}
        />
      </div>
      {error && <div className="error-text">{error}</div>}
    </ToolPage>
  );
}
