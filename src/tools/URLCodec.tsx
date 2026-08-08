import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function URLCodec() {
  const { t } = useI18n();
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
      actions={<Button variant="primary" onClick={() => setInput(output)} disabled={!output}>{t("url.apply")}</Button>}
      toolbar={<SegmentedControl value={direction} onChange={(v) => setDirection(v as "encode" | "decode")} items={[{ value: "encode", label: t("url.encode") }, { value: "decode", label: t("url.decode") }]} />}
      statusLeft={<span>{t("url.hint")}</span>}
      statusRight={output ? <span>{t("url.chars", { n: output.length })}</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea
          className="fk-textarea mono-value"
          placeholder={direction === "encode" ? t("url.inputPlaceholder") : t("url.encodedPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, minHeight: 130 }}
        />
        <div className="fk-panel" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <textarea className="fk-textarea mono-value" value={output} readOnly spellCheck={false} style={{ flex: 1, minHeight: 80 }} placeholder={t("url.result")} />
          <CopyButton text={output} disabled={!output} />
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>
    </ToolPage>
  );
}
