import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function SVGOptimizer() {
  const [input, setInput] = useState("");
  const { t } = useI18n();
  const { data } = useRust(() => api.svgOptimize(input), [input]);

  const error = data && !data.ok ? (data.error ?? t("svg.error")) : null;
  const output = data?.ok ? data.output : "";
  const saved = data && data.ok && data.before > 0 ? Math.max(0, Math.round((1 - data.after / data.before) * 100)) : 0;

  return (
    <ToolPage
      id="svg-optimizer"
      actions={<CopyButton text={output} disabled={!output} />}
      statusLeft={<span>{error ? t("svg.error") : t("svg.hint")}</span>}
      statusRight={output ? <span>{t("svg.stats", { before: data?.before ?? 0, after: data?.after ?? 0, saved })}</span> : undefined}
    >
      <div className="split-editor">
        <textarea
          className="fk-textarea mono-value"
          placeholder={t("svg.inputPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ border: error ? "1px solid var(--danger)" : undefined }}
        />
        <div className="split-editor__divider" />
        <textarea className="fk-textarea mono-value" value={output} readOnly placeholder={t("svg.outputPlaceholder")} spellCheck={false} />
      </div>
      {error && <div className="error-text">{error}</div>}
    </ToolPage>
  );
}