import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function TextObfuscator() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"hide" | "reveal">("hide");
  const [input, setInput] = useState("");

  const { data } = useRust(
    () => (tab === "hide" ? api.textObfuscate(input) : api.textDeobfuscate(input)),
    [input, tab],
  );

  const result = data ?? "";

  return (
    <ToolPage
      id="text-obfuscator"
      actions={<CopyButton text={result} disabled={!result} />}
      toolbar={<SegmentedControl value={tab} onChange={(v) => setTab(v as "hide" | "reveal")} items={[{ value: "hide", label: t("obfuscate.hide") }, { value: "reveal", label: t("obfuscate.reveal") }]} />}
      statusLeft={<span>{t("obfuscate.hint")}</span>}
      statusRight={result ? <span>{t("obfuscate.chars", { n: result.length })}</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <textarea
          className="fk-textarea mono-value"
          placeholder={tab === "hide" ? t("obfuscate.hidePlaceholder") : t("obfuscate.revealPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, minHeight: 150 }}
        />
        {result && (
          <div className="fk-panel" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <textarea className="fk-textarea mono-value" value={result} readOnly spellCheck={false} style={{ flex: 1, minHeight: 80 }} />
            <CopyButton text={result} />
          </div>
        )}
      </div>
    </ToolPage>
  );
}
