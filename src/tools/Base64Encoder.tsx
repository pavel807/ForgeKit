import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function Base64Encoder() {
  const { t } = useI18n();
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
      actions={<Button variant="primary" onClick={() => setInput(output)} disabled={!output}>{t("b64.apply")}</Button>}
      toolbar={<SegmentedControl value={direction} onChange={(v) => setDirection(v as "encode" | "decode")} items={[{ value: "encode", label: t("b64.encode") }, { value: "decode", label: t("b64.decode") }]} />}
      statusLeft={<span>{error ? t("b64.invalid") : t("b64.hint")}</span>}
      statusRight={<span>{input ? t("b64.stats", { in: inBytes, out: outBytes }) : ""}</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea
          className="fk-textarea mono-value"
          placeholder={direction === "encode" ? t("b64.inputPlaceholder") : t("b64.decodePlaceholder")}
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
