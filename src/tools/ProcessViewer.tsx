import { useCallback, useEffect, useMemo, useState } from "react";
import { Cpu } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, SearchInput } from "../components/ui";
import { api, isTauri, type ProcessEntry } from "../core/api";import { formatBytes } from "../core/format";

export default function ProcessViewer() {
  const [procs, setProcs] = useState<ProcessEntry[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [filtered, setFiltered] = useState<ProcessEntry[]>([]);

  const load = useCallback(async () => {
    setBusy(true);
    const result = await api.processList().catch(() => [] as ProcessEntry[]);
    setProcs(result);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isTauri()) load();
  }, [load]);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(procs.slice(0, 200));
      return;
    }
    const q = query.toLowerCase();
    setFiltered(procs.filter((p) => p.name.toLowerCase().includes(q) || String(p.pid).includes(q)).slice(0, 200));
  }, [procs, query]);

  const sortProcs = useMemo(() => [...filtered].sort((a, b) => b.mem - a.mem), [filtered]);

  return (
    <ToolPage
      id="process-viewer"
      actions={
        <Button variant="primary" leftIcon={<Cpu size={15} />} onClick={load} disabled={busy}>
          {busy ? "Загрузка…" : "Обновить список"}
        </Button>
      }
      toolbar={<SearchInput placeholder="Поиск по имени или PID…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 280 }} />}
      statusLeft={<span>Процессов: {procs.length} · показано: {sortProcs.length}</span>}
      statusRight={sortProcs.length > 0 ? <span>Память всего: {formatBytes(sortProcs.reduce((a, p) => a + p.mem, 0))}</span> : undefined}
    >
      {sortProcs.length === 0 ? (
        <EmptyState icon={<Cpu size={24} />} title="Список процессов" description="Показывает запущенные приложения и использование памяти" />
      ) : (
        <div className="fk-panel" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 110px", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            <span>PID</span>
            <span>Процесс</span>
            <span style={{ textAlign: "right" }}>Память</span>
            <span style={{ textAlign: "right" }}>Статус</span>
          </div>
          <div style={{ maxHeight: "calc(100vh - 320px)", overflow: "auto" }}>
            {sortProcs.map((p) => (
              <div key={p.pid} style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 110px", padding: "6px 14px", borderBottom: "1px solid var(--border-soft)", fontSize: 12.5 }}>
                <span className="mono-value" style={{ color: "var(--text-secondary)" }}>{p.pid}</span>
                <span>{p.name}</span>
                <span className="mono-value" style={{ textAlign: "right", color: "var(--text-secondary)" }}>{formatBytes(p.mem)}</span>
                <span style={{ textAlign: "right", color: "var(--text-tertiary)" }}>{p.state}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolPage>
  );
}