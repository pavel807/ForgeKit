import { useState } from "react";
import { ImageDown } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Select } from "../components/ui";
import { api, pickFiles, pickSave } from "../core/api";
import { formatBytes } from "../core/format";
import { useI18n } from "../core/i18n";

const FORMATS = [
  { value: "png", label: "PNG", ext: ".png" },
  { value: "jpeg", label: "JPEG", ext: ".jpg" },
  { value: "webp", label: "WebP", ext: ".webp" },
  { value: "gif", label: "GIF", ext: ".gif" },
  { value: "bmp", label: "BMP", ext: ".bmp" },
  { value: "tiff", label: "TIFF", ext: ".tiff" },
];

export default function ImageConverter() {
  const [files, setFiles] = useState<string[]>([]);
  const [format, setFormat] = useState("png");
  const [log, setLog] = useState<{ file: string; ok: boolean; message: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  async function pick() {
    const sel = await pickFiles({ multiple: true, filters: [{ name: t("files.imgFilter"), extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff"] }] });
    if (sel?.length) setFiles(sel);
  }

  const fmt = FORMATS.find((f) => f.value === format)!;

  async function convertOne(file: string): Promise<{ file: string; ok: boolean; message: string }> {
    const out = await pickSave(`${file.slice(file.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "")}${fmt.ext}`, [{ name: t("files.imgFilter"), extensions: [fmt.ext.replace(".", "")] }]);
    if (!out) return { file, ok: false, message: t("common.cancelled") };
    const r = await api.convertImage(file, out, format);
    return { file, ok: true, message: formatBytes(r.size) };
  }

  async function convertAll() {
    setBusy(true);
    const logOut: { file: string; ok: boolean; message: string }[] = [];
    for (const f of files) {
      const r = await convertOne(f);
      logOut.push(r);
    }
    setLog(logOut);
    setBusy(false);
  }

  return (
    <ToolPage
      id="image-converter"
      actions={
        <Button variant="primary" leftIcon={<ImageDown size={15} />} onClick={convertAll} disabled={busy || files.length === 0}>
          {busy ? t("imgc.converting") : t("imgc.convert", { n: files.length })}
        </Button>
      }
      toolbar={<Select label="" options={FORMATS.map((f) => ({ value: f.value, label: `${t("imgc.format")}: ${f.label}` }))} value={format} onChange={(e) => setFormat(e.target.value)} />}
      statusLeft={<span>{t("imgc.hint")}</span>}
      statusRight={<span>{t("files.count", { n: files.length })}</span>}
    >
      {files.length === 0 ? (
        <EmptyState
          icon={<ImageDown size={24} />}
          title={t("imgc.emptyTitle")}
          description={t("imgc.emptyDesc")}
          action={<Button variant="primary" leftIcon={<ImageDown size={15} />} onClick={pick}>{t("files.pickImages")}</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {log.length === 0 && (
            <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>
                {files.length > 0 ? t("files.selected", { n: files.length }) : ""}
              </span>
              <Button onClick={pick}>{t("files.addMore")}</Button>
            </div>
          )}
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