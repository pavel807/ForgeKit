import { useState } from "react";
import { Minimize2 } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api, pickFiles } from "../core/api";
import { formatBytes } from "../core/format";
import { useI18n } from "../core/i18n";

export default function ImageCompressor() {
  const [files, setFiles] = useState<string[]>([]);
  const [quality, setQuality] = useState(70);
  const [log, setLog] = useState<{ file: string; ok: boolean; message: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  async function pick() {
    const sel = await pickFiles({ multiple: true, filters: [{ name: t("files.imgFilter"), extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff"] }] });
    if (sel?.length) setFiles(sel);
  }

  async function compressAll() {
    setBusy(true);
    const out: { file: string; ok: boolean; message: string }[] = [];
    for (const f of files) {
      const r = await api.compressImage(f, quality).catch(() => null);
      out.push({ file: f, ok: !!r, message: r ? `${formatBytes(r.size)} · ${t("imgp.was", { n: formatBytes(r.original) })}` : t("imgp.error") });
    }
    setLog(out);
    setBusy(false);
  }

  return (
    <ToolPage
      id="image-compressor"
      actions={
        <Button variant="primary" leftIcon={<Minimize2 size={15} />} onClick={compressAll} disabled={busy || files.length === 0}>
          {busy ? t("imgp.compressing") : t("imgp.compress")}
        </Button>
      }
      toolbar={
        <Input
          type="range"
          min={10}
          max={100}
          value={String(quality)}
          onChange={(e) => setQuality(Number(e.target.value))}
          style={{ width: 220 }}
        />
      }
      statusLeft={<span>{t("imgp.quality", { n: quality })}</span>}
      statusRight={<span>{t("imgp.stats", { files: files.length, done: log.length })}</span>}
    >
      {files.length === 0 ? (
        <EmptyState
          icon={<Minimize2 size={24} />}
          title={t("imgp.emptyTitle")}
          description={t("imgp.emptyDesc")}
          action={<Button variant="primary" leftIcon={<Minimize2 size={15} />} onClick={pick}>{t("files.pickImages")}</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>{t("files.selected", { n: files.length })}</span>
            <Button onClick={pick}>{t("files.addMore")}</Button>
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