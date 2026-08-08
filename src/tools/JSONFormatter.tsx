import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function JSONFormatter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);

  const { data } = useRust(() => api.jsonFormat(input, indent), [input, indent]);

  const output = data?.output ?? "";
  const error = data && !data.ok ? (data.error ?? t("jsonf.error")) : null;
  const stats = data?.ok && data.output ? t("jsonf.stats", { l: data.lines, b: data.bytes }) : "";

  return (
    <ToolPage
      id="json-formatter"
      toolbar={
        <>
          <select className="fk-select" value={String(indent)} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value="2">{t("jsonf.indent2")}</option>
            <option value="4">{t("jsonf.indent4")}</option>
            <option value="0">{t("jsonf.noIndent")}</option>
          </select>
          <div className="spacer" />
          <Button variant="primary" onClick={() => setInput(output)} disabled={!output}>
            {t("jsonf.apply")}
          </Button>
          <CopyButton text={output} disabled={!output} />
        </>
      }
      statusLeft={<span>{error ? t("jsonf.error") : data?.output ? t("jsonf.valid") : ""}</span>}
      statusRight={<span>{stats}</span>}
    >
      <div className="split-editor">
        <textarea
          className="fk-textarea mono-value"
          placeholder={t("jsonf.inputPlaceholder")}
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
          placeholder={error ? "" : t("jsonf.outputPlaceholder")}
          spellCheck={false}
        />
      </div>
      {error && <div className="error-text">{error}</div>}
    </ToolPage>
  );
}
