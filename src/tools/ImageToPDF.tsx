import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickFiles, pickSave } from "../core/api";
import { formatBytes } from "../core/format";
import { useI18n } from "../core/i18n";

export default function ImageToPDF() {
  const { t } = useI18n();
  const [files, setFiles] = useState<string[]>([]);
  const [log, setLog] = useState<{ ok: boolean; text: string }[]>([]);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const sel = await pickFiles({ multiple: true, filters: [{ name: t("files.imgFilter"), extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff"] }] });
    if (sel?.length) setFiles(sel);
  }

  async function convert() {
    const out = await pickSave("images.pdf", [{ name: "PDF", extensions: ["pdf"] }]);
    if (!out) return;
    setBusy(true);
    const r = await api.imageToPdf(files, out).catch(() => null);
    setLog([r
      ? { ok: true, text: t("ipdf.created", { out, size: formatBytes(r.size), pages: r.pages }) }
      : { ok: false, text: t("ipdf.createFailed") }]);
    setBusy(false);
  }

  return (
    <ToolPage
      id="image-to-pdf"
      actions={
        <Button variant="primary" leftIcon={<ImagePlus size={15} />} onClick={convert} disabled={busy || files.length === 0}>
          {busy ? t("ipdf.creating") : t("ipdf.create")}
        </Button>
      }
      statusLeft={<span>{t("ipdf.hint")}</span>}
      statusRight={<span>{t("ipdf.images", { n: files.length })}</span>}
    >
      {files.length === 0 ? (
        <EmptyState
          icon={<ImagePlus size={24} />}
          title={t("ipdf.emptyTitle")}
          description={t("ipdf.emptyDesc")}
          action={<Button variant="primary" leftIcon={<ImagePlus size={15} />} onClick={pick}>{t("files.pickImages")}</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>{t("files.selected", { n: files.length })}</span>
            <Button onClick={pick}>{t("files.addMore")}</Button>
          </div>
          {files.map((f, i) => (
            <div key={`${f}-${i}`} className="fk-list__item" style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius)" }}>
              <span className="mono-value" style={{ fontSize: 12.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i + 1}. {f}</span>
            </div>
          ))}
          {log.map((l, i) => (
            <div key={i} className="error-text" style={{ color: l.ok ? "var(--success)" : "var(--danger)" }}>{l.text}</div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}