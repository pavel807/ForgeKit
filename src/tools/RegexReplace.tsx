import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, Input } from "../components/ui";

export default function RegexReplace() {
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
          <Input className="mono-value" placeholder="Шаблон поиска" value={pattern} onChange={(e) => setPattern(e.target.value)} style={{ width: 200 }} />
          <Input className="mono-value" placeholder="Замена ($1, $2…)" value={replacement} onChange={(e) => setReplacement(e.target.value)} style={{ width: 200 }} />
          {["g", "i", "m"].map((f) => (
            <button key={f} className={`fk-chip${flags.includes(f) ? " fk-chip--on" : ""}`} onClick={() => setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f))}>
              {f}
            </button>
          ))}
        </>
      }
      statusLeft={<span>{error ? `Ошибка: ${error}` : `Совпадений: ${matchCount}`}</span>}
      statusRight={output ? <span>{input.length} → {output.length} символов</span> : undefined}
    >
      <div className="split-editor">
        <textarea className="fk-textarea mono-value" placeholder="Исходный текст…" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} style={{ border: error ? "1px solid var(--danger)" : undefined }} />
        <div className="split-editor__divider" />
        <textarea className="fk-textarea mono-value" value={output} readOnly placeholder="Результат замены" spellCheck={false} />
      </div>
    </ToolPage>
  );
}