import { useState } from "react";
import { FileOutput } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api, pickDirectory, pickFiles } from "../core/api";
import { useI18n } from "../core/i18n";

export default function PDFToImages() {
  const { t } = useI18n();
  const [file, setFile] = useState<string | null>(null);
  const [dpi, setDpi] = useState("150");
  const [done, setDone] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pickFile() {
    const sel = await pickFiles({ filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (sel?.[0]) setFile(sel[0]);
  }

  async function convert() {
    if (!file) return;
    setError(null);
    const outDir = await pickDirectory();
    if (!outDir) return;
    setBusy(true);
    const r = await api.pdfToImages(file, outDir, parseInt(dpi, 10) || 150).catch((e) => { setError(String(e)); return null; });
    if (r) setDone(r.map((x) => x.name));
    setBusy(false);
  }

  return (
    <ToolPage
      id="pdf-to-images"
      actions={
        <Button variant="primary" leftIcon={<FileOutput size={15} />} onClick={convert} disabled={busy || !file}>
          {busy ? t("pdftoi.rendering") : t("pdftoi.convert")}
        </Button>
      }
      toolbar={
        <Input className="mono-value" placeholder="DPI" value={dpi} onChange={(e) => setDpi(e.target.value)} style={{ width: 90 }} />
      }
      statusLeft={<span>{t("pdftoi.hint")}</span>}
      statusRight={file ? <span className="mono-value" style={{ fontSize: 11.5 }}>{file.slice(file.lastIndexOf("/") + 1)}</span> : undefined}
    >
      {!file ? (
        <EmptyState
          icon={<FileOutput size={24} />}
          title={t("pdftoi.emptyTitle")}
          description={t("pdftoi.emptyDesc")}
          action={<Button variant="primary" leftIcon={<FileOutput size={15} />} onClick={pickFile}>{t("pdftoi.pickFile")}</Button>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono-value" style={{ flex: 1, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file}</span>
            <Button onClick={pickFile}>{t("pdftoi.otherFile")}</Button>
          </div>
          {error && <div className="error-text">{error}</div>}
          {done.length > 0 && (
            <div className="fk-panel" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
                {t("pdftoi.created", { n: done.length })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {done.map((name) => (
                  <div key={name} className="mono-value" style={{ fontSize: 12.5 }}>{name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </ToolPage>
  );
}