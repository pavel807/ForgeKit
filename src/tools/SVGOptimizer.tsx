import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton } from "../components/ui";
import { api, useRust } from "../core/api";

export default function SVGOptimizer() {
  const [input, setInput] = useState("");

  const { data } = useRust(() => api.svgOptimize(input), [input]);

  const error = data && !data.ok ? (data.error ?? "Ошибка в SVG") : null;
  const output = data?.ok ? data.output : "";
  const saved = data && data.ok && data.before > 0 ? Math.round((1 - data.after / data.before) * 100) : 0;

  return (
    <ToolPage
      id="svg-optimizer"
      actions={<CopyButton text={output} disabled={!output} />}
      statusLeft={<span>{error ? "Ошибка в SVG" : "Сжатие: комментарии, лишние пробелы, двойные кавычки"}</span>}
      statusRight={output ? <span>{data?.before} → {data?.after} байт (−{saved}%)</span> : undefined}
    >
      <div className="split-editor">
        <textarea
          className="fk-textarea mono-value"
          placeholder="Вставьте SVG…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ border: error ? "1px solid var(--danger)" : undefined }}
        />
        <div className="split-editor__divider" />
        <textarea className="fk-textarea mono-value" value={output} readOnly placeholder="Минифицированный SVG" spellCheck={false} />
      </div>
      {error && <div className="error-text">{error}</div>}
    </ToolPage>
  );
}