import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api } from "../core/api";

export default function UUIDGenerator() {
const count = 10;
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [uuids, setUuids] = useState<string[]>([]);

  async function generate(u: string, n: number) {
    try {
      setUuids(await api.uuidGenerate(u, n));
    } catch {
      setUuids([]);
    }
  }

  function regenerate() {
    generate(version, count);
  }

  return (
    <ToolPage
      id="uuid"
      actions={<Button variant="primary" onClick={regenerate}>Сгенерировать снова</Button>}
      toolbar={<SegmentedControl value={version} onChange={(v) => { const u = v as "v4" | "v7"; setVersion(u); generate(u, count); }} items={[{ value: "v4", label: "UUID v4" }, { value: "v7", label: "UUID v7" }]} />}
      statusLeft={<span>Версия {version.toUpperCase()} · timestamp-based для v7</span>}
      statusRight={<span>Сгенерировано: {uuids.length}</span>}
    >
      <div className="uuid-grid">
        {uuids.map((u, i) => (
          <div key={`${u}-${i}`} className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono-value" style={{ flex: 1, fontSize: 13.5, userSelect: "text" }}>{u}</span>
            <CopyButton text={u} size="sm" />
          </div>
        ))}
      </div>
    </ToolPage>
  );
}