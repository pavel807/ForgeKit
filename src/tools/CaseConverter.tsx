import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";

type Case = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab" | "pascal";

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Case>("upper");

  const { data: output } = useRust(() => api.caseConvert(input, mode), [input, mode]);

  const CASES: { value: Case; label: string }[] = [
    { value: "upper", label: "ВЕРХНИЙ" },
    { value: "lower", label: "нижний" },
    { value: "title", label: "Заглавный" },
    { value: "sentence", label: "Предложение" },
    { value: "camel", label: "camelCase" },
    { value: "snake", label: "snake_case" },
    { value: "kebab", label: "kebab-case" },
    { value: "pascal", label: "PascalCase" },
  ];

  return (
    <ToolPage
      id="case-converter"
      actions={<CopyButton text={output ?? ""} disabled={!output} />}
      toolbar={<SegmentedControl value={mode} onChange={(v) => setMode(v as Case)} items={CASES} />}
      statusLeft={<span>Мгновенная конвертация регистра (ядро Rust)</span>}
      statusRight={input ? <span>Символов: {input.length}</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea className="fk-textarea mono-value" placeholder="Исходный текст…" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} style={{ flex: 1, minHeight: 150 }} />
        {output && (
          <div className="fk-panel" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <textarea className="fk-textarea mono-value" value={output} readOnly spellCheck={false} style={{ flex: 1, minHeight: 120 }} />
            <CopyButton text={output} />
          </div>
        )}
      </div>
    </ToolPage>
  );
}
