import { useMemo, useState } from "react";
import { Scissors } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api, pickFiles, pickDirectory } from "../core/api";

export default function PDFSplit() {
  const [file, setFile] = useState<string | null>(null);
  const [ranges, setRanges] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const sel = await pickFiles({ filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (sel?.[0]) setFile(sel[0]);
  }

  const rangesValid = useMemo(() => /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/.test(ranges.trim()), [ranges]);

  async function split() {
    if (!file || !rangesValid) return;
    const outDir = await pickDirectory();
    if (!outDir) return;
    setBusy(true);
    const result = await api.pdfSplit(file, outDir, ranges).catch(() => null);
    setLog([result ? `OK: создано частей: ${result.length}` : "Ошибка: не удалось разделить файл"]);
    setBusy(false);
  }

  return (
    <ToolPage
      id="pdf-split"
      actions={
        <Button variant="primary" leftIcon={<Scissors size={15} />} onClick={split} disabled={busy || !file || !rangesValid}>
          {busy ? "Разделение…" : "Разделить"}
        </Button>
      }
      toolbar={<Input className="mono-value" placeholder="1-3, 5, 7-10" value={ranges} onChange={(e) => setRanges(e.target.value)} style={{ width: 220 }} />}
      statusLeft={<span>Формат диапазонов: 1-3, 5, 7-10</span>}
      statusRight={file ? <span className="mono-value" style={{ fontSize: 11.5 }}>{file.slice(file.lastIndexOf("/") + 1)}</span> : undefined}
    >
      {!file ? (
        <EmptyState
          icon={<Scissors size={24} />}
          title="Разделение PDF"
          description="Разрежьте PDF на части по диапазонам страниц"
          action={<Button variant="primary" leftIcon={<Scissors size={15} />} onClick={pick}>Выбрать PDF-файл</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono-value" style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file}</span>
            <Button onClick={pick}>Другой файл</Button>
          </div>
          {!rangesValid && ranges.trim() && <div className="error-text">Некорректные диапазоны. Пример: 1-3, 5, 7-10</div>}
          {log.map((l, i) => (
            <div key={i} className="error-text" style={{ color: l.startsWith("OK") ? "var(--success)" : "var(--danger)" }}>{l}</div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}