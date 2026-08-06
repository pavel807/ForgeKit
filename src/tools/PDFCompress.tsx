import { useState } from "react";
import { FileCog } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickFiles, pickSave } from "../core/api";
import { formatBytes } from "../core/format";

export default function PDFCompress() {
  const [file, setFile] = useState<string | null>(null);
  const [result, setResult] = useState<{ before: number; after: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const sel = await pickFiles({ filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (sel?.[0]) {
      setFile(sel[0]);
      setResult(null);
    }
  }

  async function compress() {
    if (!file) return;
    const out = await pickSave(`${file.slice(file.lastIndexOf("/") + 1).replace(/\.pdf$/i, "")}-optim.pdf`, [{ name: "PDF", extensions: ["pdf"] }]);
    if (!out) return;
    setBusy(true);
    const r = await api.pdfOptimize(file, out).catch(() => null);
    if (r) setResult(r);
    setBusy(false);
  }

  const saved = result && result.before > 0 ? `${Math.round((1 - result.after / result.before) * 100)}%` : null;

  return (
    <ToolPage
      id="pdf-compress"
      actions={
        <Button variant="primary" leftIcon={<FileCog size={15} />} onClick={compress} disabled={busy || !file}>
          {busy ? "Оптимизация…" : "Оптимизировать"}
        </Button>
      }
      statusLeft={<span>Удаляет неиспользуемые объекты из PDF</span>}
      statusRight={file ? <span className="mono-value" style={{ fontSize: 11.5 }}>{file.slice(file.lastIndexOf("/") + 1)}</span> : undefined}
    >
      {!file ? (
        <EmptyState
          icon={<FileCog size={24} />}
          title="Оптимизация PDF"
          description="Уменьшите размер PDF, удалив избыточные и неиспользуемые данные"
          action={<Button variant="primary" leftIcon={<FileCog size={15} />} onClick={pick}>Выбрать PDF-файл</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono-value" style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file}</span>
            <Button onClick={pick}>Другой файл</Button>
          </div>
          {!result && <div className="info-row"><span className="info-row__label">Шаги</span><span className="info-row__value" style={{ fontSize: 13 }}>1. Выберите файл → 2. Укажите имя результата → 3. Проверьте итог</span></div>}
          {result && (
            <div className="fk-panel" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="info-row">
                <span className="info-row__label">Было</span>
                <span className="info-row__value mono-value">{formatBytes(result.before)}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Стало</span>
                <span className="info-row__value mono-value">{formatBytes(result.after)}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">Экономия</span>
                <span className="info-row__value" style={{ color: "var(--success)", fontWeight: 600 }}>{saved}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  );
}