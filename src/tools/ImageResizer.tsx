import { useState } from "react";
import { Crop } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input, Select } from "../components/ui";
import { api, pickFiles } from "../core/api";
import { formatBytes } from "../core/format";

const PRESETS = [
  { value: "orig", label: "Оригинал" },
  { value: "1920", label: "1920×1080" },
  { value: "1280", label: "1280×720" },
  { value: "800", label: "800×600" },
  { value: "512", label: "512×512" },
  { value: "256", label: "256×256" },
  { value: "custom", label: "Свои размеры" },
];

export default function ImageResizer() {
  const [files, setFiles] = useState<string[]>([]);
  const [preset, setPreset] = useState("orig");
  const [w, setW] = useState("800");
  const [h, setH] = useState("600");
  const [log, setLog] = useState<{ file: string; ok: boolean; message: string }[]>([]);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const sel = await pickFiles({ multiple: true, filters: [{ name: "Изображения", extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff"] }] });
    if (sel?.length) setFiles(sel);
  }

  function targetSize(): [number, number] {
    if (preset === "custom") {
      return [Math.max(1, parseInt(w, 10) || 1), Math.max(1, parseInt(h, 10) || 1)];
    }
    if (preset === "orig") return [0, 0];
    const [pw, ph] = preset.split("x");
    return [parseInt(pw, 10), parseInt(ph, 10)];
  }

  async function resizeAll() {
    const [tw, th] = targetSize();
    if (tw === 0) return;
    setBusy(true);
    const out: { file: string; ok: boolean; message: string }[] = [];
    for (const f of files) {
      const r = await api.resizeImage(f, tw, th).catch(() => null);
      out.push({ file: f, ok: !!r, message: r ? `${r.width}×${r.height} · ${formatBytes(r.size)}` : "Ошибка изменения размера" });
    }
    setLog(out);
    setBusy(false);
  }

  return (
    <ToolPage
      id="image-resizer"
      actions={
        <Button variant="primary" leftIcon={<Crop size={15} />} onClick={resizeAll} disabled={busy || files.length === 0}>
          {busy ? "Изменение…" : "Изменить размер"}
        </Button>
      }
      toolbar={
        <>
          <Select label="" options={PRESETS} value={preset} onChange={(e) => setPreset(e.target.value)} />
          {preset === "custom" && (
            <>
              <Input className="mono-value" value={w} onChange={(e) => setW(e.target.value)} style={{ width: 80 }} />
              <span style={{ color: "var(--text-tertiary)" }}>×</span>
              <Input className="mono-value" value={h} onChange={(e) => setH(e.target.value)} style={{ width: 80 }} />
            </>
          )}
        </>
      }
      statusLeft={<span>Пропорции сохраняются автоматически</span>}
      statusRight={<span>Файлов: {files.length}</span>}
    >
      {files.length === 0 ? (
        <EmptyState
          icon={<Crop size={24} />}
          title="Изменение размера изображений"
          description="Выберите изображения и укажите целевой размер — копия сохранится рядом с оригиналом"
          action={<Button variant="primary" leftIcon={<Crop size={15} />} onClick={pick}>Выбрать изображения</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>Выбрано файлов: {files.length}</span>
            <Button onClick={pick}>Добавить ещё</Button>
          </div>
          {log.map((r, i) => (
            <div key={i} className="fk-list__item" style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius)" }}>
              <span className="mono-value" style={{ fontSize: 12.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.file}</span>
              <span style={{ fontSize: 12.5, color: r.ok ? "var(--success)" : "var(--danger)" }}>{r.message}</span>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}