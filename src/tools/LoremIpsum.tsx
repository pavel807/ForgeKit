import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, Input, Select } from "../components/ui";
import { api, useRust } from "../core/api";

export default function LoremIpsum() {
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState<"paragraph" | "sentence" | "word">("paragraph");
  const [seed, setSeed] = useState(0);

  const { data } = useRust(() => api.loremGenerate(count, unit), [count, unit, seed]);
  const text = data?.text ?? "";

  return (
    <ToolPage
      id="lorem-ipsum"
      actions={
        <>
          <Button variant="primary" onClick={() => setSeed((s) => s + 1)}>Заново</Button>
          <CopyButton text={text} />
        </>
      }
      toolbar={
        <>
          <Input className="mono-value" type="number" min={1} max={100} value={String(count)} onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))} style={{ width: 80 }} />
          <Select label="" options={[{ value: "paragraph", label: "Абзацев" }, { value: "sentence", label: "Предложений" }, { value: "word", label: "Слов" }]} value={unit} onChange={(e) => setUnit(e.target.value as "paragraph" | "sentence" | "word")} />
        </>
      }
      statusLeft={<span>Классический Lorem ipsum для вёрстки и макетов</span>}
      statusRight={text ? <span>{data?.words} слов · {data?.chars} символов</span> : undefined}
    >
      <div className="fk-panel" style={{ padding: "20px 22px" }}>
        <textarea className="fk-textarea" value={text} readOnly spellCheck={false} style={{ minHeight: 260, whiteSpace: "pre-wrap" }} />
      </div>
    </ToolPage>
  );
}
