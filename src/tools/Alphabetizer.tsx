import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";

export default function Alphabetizer() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"az" | "za" | "length" | "unique">("az");

  const lines = input ? input.split("\n").length : 0;
  const { data: output } = useRust(() => api.sortLines(input, mode), [input, mode]);

  return (
    <ToolPage
      id="alphabetizer"
      actions={
        <>
          <Button variant="primary" onClick={() => setInput(output ?? "")} disabled={!output}>Применить</Button>
          <CopyButton text={output ?? ""} disabled={!output} />
        </>
      }
      toolbar={<SegmentedControl value={mode} onChange={(v) => setMode(v as "az" | "za" | "length" | "unique")} items={[{ value: "az", label: "А–Я" }, { value: "za", label: "Я–А" }, { value: "length", label: "По длине" }, { value: "unique", label: "Уникальные" }]} />}
      statusLeft={<span>Сортировка с учётом кириллицы (ядро Rust)</span>}
      statusRight={<span>Строк: {lines}</span>}
    >
      <div className="split-editor">
        <textarea className="fk-textarea mono-value" placeholder="Каждая строка — отдельный элемент…" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className="split-editor__divider" />
        <textarea className="fk-textarea mono-value" value={output ?? ""} readOnly spellCheck={false} />
      </div>
    </ToolPage>
  );
}
