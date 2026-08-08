import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, Input } from "../components/ui";
import { useI18n } from "../core/i18n";

export default function RegexReplace() {
  const { t } = useI18n();
  const [pattern, setPattern] = useState("");
  const [replacement, setReplacement] = useState("");
  const [input, setInput] = useState("");
  const [flags, setFlags] = useState("g");
  const [error, setError] = useState<string | null>(null);

  const output = useMemo(() => {
    if (!pattern || !input) return "";
    try {
      const re = new RegExp(pattern, flags);
      setError(null);
      return input.replace(re, replacement);
    } catch (e) {
      setError(String(e));
      return "";
    }
  }, [pattern, replacement, input, flags]);

  const matchCount = useMemo(() => {
    if (!pattern || !input) return 0;
    try {
      return (input.match(new RegExp(pattern, flags)) ?? []).length;
    } catch {
      return 0;
    }
  }, [pattern, input, flags]);

  return (
    <ToolPage
      id="regex-replace"
      actions={<CopyButton text={output} disabled={!output} />}
      toolbar={
        <>
          <Input className="mono-value" placeholder={t("regexreplace.patternPlaceholder")} value={pattern} onChange={(e) => setPattern(e.target.value)} style={{ width: 200 }} />
          <Input className="mono-value" placeholder={t("regexreplace.replacementPlaceholder")} value={replacement} onChange={(e) => setReplacement(e.target.value)} style={{ width: 200 }} />
          {["g", "i", "m"].map((f) => (
            <button key={f} className={`fk-chip${flags.includes(f) ? " fk-chip--on" : ""}`} onClick={() => setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f))}>
              {f}
            </button>
          ))}
        </>
      }
      statusLeft={<span>{error ? `${t("common.error")}: ${error}` : t("regexreplace.matches", { n: matchCount })}</span>}
      statusRight={output ? <span>{t("regexreplace.stats", { a: input.length, b: output.length })}</span> : undefined}
    >
      <div className="split-editor">
        <textarea className="fk-textarea mono-value" placeholder={t("regexreplace.inputPlaceholder")} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} style={{ border: error ? "1px solid var(--danger)" : undefined }} />
        <div className="split-editor__divider" />
        <textarea className="fk-textarea mono-value" value={output} readOnly placeholder={t("regexreplace.outputPlaceholder")} spellCheck={false} />
      </div>
    </ToolPage>
  );
}