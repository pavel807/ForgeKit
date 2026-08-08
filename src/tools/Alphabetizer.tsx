import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function Alphabetizer() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"az" | "za" | "length" | "unique">("az");

  const lines = input ? input.split("\n").length : 0;
  const { data: output } = useRust(() => api.sortLines(input, mode), [input, mode]);

  return (
    <ToolPage
      id="alphabetizer"
      actions={
        <>
          <Button variant="primary" onClick={() => setInput(output ?? "")} disabled={!output}>{t("alphabet.apply")}</Button>
          <CopyButton text={output ?? ""} disabled={!output} />
        </>
      }
      toolbar={<SegmentedControl value={mode} onChange={(v) => setMode(v as "az" | "za" | "length" | "unique")} items={[{ value: "az", label: t("alphabet.az") }, { value: "za", label: t("alphabet.za") }, { value: "length", label: t("alphabet.length") }, { value: "unique", label: t("alphabet.unique") }]} />}
      statusLeft={<span>{t("alphabet.hint")}</span>}
      statusRight={<span>{t("alphabet.lines", { n: lines })}</span>}
    >
      <div className="split-editor">
        <textarea className="fk-textarea mono-value" placeholder={t("alphabet.placeholder")} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
        <div className="split-editor__divider" />
        <textarea className="fk-textarea mono-value" value={output ?? ""} readOnly spellCheck={false} />
      </div>
    </ToolPage>
  );
}
