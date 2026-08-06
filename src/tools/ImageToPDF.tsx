import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickFiles, pickSave } from "../core/api";
import { formatBytes } from "../core/format";

export default function ImageToPDF() {
  const [files, setFiles] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const sel = await pickFiles({ multiple: true, filters: [{ name: "Изображения", extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff"] }] });
    if (sel?.length) setFiles(sel);
  }

  async function convert() {
    const out = await pickSave("images.pdf", [{ name: "PDF", extensions: ["pdf"] }]);
    if (!out) return;
    setBusy(true);
    const r = await api.imageToPdf(files, out).catch(() => null);
    setLog([r ? `OK: ${out} · ${formatBytes(r.size)} · ${r.pages} стр.` : "Ошибка: не удалось создать PDF"]);
    setBusy(false);
  }

  return (
    <ToolPage
      id="image-to-pdf"
      actions={
        <Button variant="primary" leftIcon={<ImagePlus size={15} />} onClick={convert} disabled={busy || files.length === 0}>
          {busy ? "Создание…" : "Создать PDF"}
        </Button>
      }
      statusLeft={<span>Каждая страница — отдельное изображение</span>}
      statusRight={<span>Изображений: {files.length}</span>}
    >
      {files.length === 0 ? (
        <EmptyState
          icon={<ImagePlus size={24} />}
          title="Изображение в PDF"
          description="Соберите PNG, JPG, WebP или GIF в один PDF-документ"
          action={<Button variant="primary" leftIcon={<ImagePlus size={15} />} onClick={pick}>Выбрать изображения</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>Выбрано файлов: {files.length}</span>
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