import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n, type Keys } from "../core/i18n";

type Case = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab" | "pascal";

export default function CaseConverter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Case>("upper");

  const { data: output } = useRust(() => api.caseConvert(input, mode), [input, mode]);

  const CASES: { value: Case; label: Keys }[] = [
    { value: "upper", label: "case.upper" },
    { value: "lower", label: "case.lower" },
    { value: "title", label: "case.title" },
    { value: "sentence", label: "case.sentence" },
    { value: "camel", label: "case.camel" },
    { value: "snake", label: "case.snake" },
    { value: "kebab", label: "case.kebab" },
    { value: "pascal", label: "case.pascal" },
  ];

  return (
    <ToolPage
      id="case-converter"
      actions={<CopyButton text={output ?? ""} disabled={!output} />}
      toolbar={<SegmentedControl value={mode} onChange={(v) => setMode(v as Case)} items={CASES.map((c) => ({ ...c, label: t(c.label) }))} />}
      statusLeft={<span>{t("case.hint")}</span>}
      statusRight={input ? <span>{t("case.chars", { n: input.length })}</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea className="fk-textarea mono-value" placeholder={t("case.placeholder")} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} style={{ flex: 1, minHeight: 150 }} />
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
