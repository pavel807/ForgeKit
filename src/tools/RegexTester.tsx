import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Input } from "../components/ui";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [flags, setFlags] = useState("g");
  const [error, setError] = useState<string | null>(null);

  const matches = useMemo(() => {
    if (!pattern || !text) return [] as string[];
    try {
      const re = new RegExp(pattern, flags);
      setError(null);
      return [...text.matchAll(re)].map((m) => m[0]);
    } catch (e) {
      setError(String(e));
      return [] as string[];
    }
  }, [pattern, text, flags]);

  return (
    <ToolPage
      id="regex-tester"
      toolbar={
        <>
          <Input className="mono-value" placeholder="Регулярное выражение" value={pattern} onChange={(e) => setPattern(e.target.value)} style={{ width: 380 }} />
          {["g", "i", "m", "s"].map((f) => (
            <button key={f} className={`fk-chip${flags.includes(f) ? " fk-chip--on" : ""}`} onClick={() => setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f))}>
              {f}
            </button>
          ))}
        </>
      }
      statusLeft={<span>{error ? `Ошибка: ${error}` : `Совпадений: ${matches.length}`}</span>}
      statusRight={matches.length > 0 ? <span>Всего букв в совпадениях: {matches.reduce((a, m) => a + m.length, 0)}</span> : undefined}
    >
      <textarea
        className="fk-textarea mono-value"
        placeholder="Текст для проверки…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        style={{ flex: 1, minHeight: 120 }}
      />
      {matches.length > 0 && (
        <div className="fk-panel" style={{ marginTop: 14, maxHeight: 180, overflow: "auto" }}>
          {matches.map((m, i) => (
            <div key={i} className="fk-list__item" style={{ borderBottom: "1px solid var(--border-soft)", borderRadius: 0 }}>
              <span className="mono-value" style={{ fontSize: 12.5 }}>{m || "(пустое совпадение)"}</span>
            </div>
          ))}
        </div>
      )}
      {error && <div className="error-text" style={{ marginTop: 12 }}>{error}</div>}
    </ToolPage>
  );
}