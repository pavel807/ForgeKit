import { useState } from "react";
import { FileStack } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickFiles, pickSave } from "../core/api";

export default function PDFMerge() {
  const [files, setFiles] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const sel = await pickFiles({ multiple: true, filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (sel?.length) setFiles(sel);
  }

  async function merge() {
    const out = await pickSave("merged.pdf", [{ name: "PDF", extensions: ["pdf"] }]);
    if (!out) return;
    setBusy(true);
    const r = await api.pdfMerge(files, out).catch(() => null);
    setLog([r ? `OK: ${out} (${r.pages} стр.)` : "Ошибка: не удалось объединить файлы"]);
    setBusy(false);
  }

  return (
    <ToolPage
      id="pdf-merge"
      actions={
        <Button variant="primary" leftIcon={<FileStack size={15} />} onClick={merge} disabled={busy || files.length < 2}>
          {busy ? "Объединение…" : "Объединить"}
        </Button>
      }
      statusLeft={<span>Порядок файлов = порядок страниц</span>}
      statusRight={<span>Файлов: {files.length}</span>}
    >
      {files.length === 0 ? (
        <EmptyState
          icon={<FileStack size={24} />}
          title="Объединение PDF"
          description="Склейте несколько PDF-файлов в один, сохранив порядок страниц"
          action={<Button variant="primary" leftIcon={<FileStack size={15} />} onClick={pick}>Выбрать PDF-файлы</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>Выбрано файлов: {files.length} — минимум 2 для объединения</span>
            <Button onClick={pick}>Добавить ещё</Button>
          </div>
          {files.map((f, i) => (
            <div key={`${f}-${i}`} className="fk-list__item" style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius)" }}>
              <span className="mono-value" style={{ fontSize: 12.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i + 1}. {f}</span>
            </div>
          ))}
          {log.map((l, i) => (
            <div key={i} className="error-text" style={{ color: l.startsWith("OK") ? "var(--success)" : "var(--danger)" }}>{l}</div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}