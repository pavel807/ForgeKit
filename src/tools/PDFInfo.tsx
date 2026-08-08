import { useState } from "react";
import { FileText } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickFiles, type PdfInfo } from "../core/api";
import { formatBytes } from "../core/format";
import { useI18n } from "../core/i18n";

export default function PDFInfo() {
  const { t } = useI18n();
  const [file, setFile] = useState<string | null>(null);
  const [info, setInfo] = useState<PdfInfo | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const sel = await pickFiles({ filters: [{ name: "PDF", extensions: ["pdf"] }] });
    if (!sel?.[0]) return;
    setFile(sel[0]);
    setBusy(true);
    const r = await api.pdfInfo(sel[0]).catch(() => null);
    setInfo(r);
    setBusy(false);
  }

  const rows = [
    { label: t("pdfinfo.file"), value: file ? file.slice(file.lastIndexOf("/") + 1) : "" },
    { label: t("pdfinfo.size"), value: info ? formatBytes(info.size) : "" },
    { label: t("pdfinfo.version"), value: info?.version ?? "" },
    { label: t("pdfinfo.pages"), value: info ? String(info.pages) : "" },
    { label: t("pdfinfo.title"), value: info?.title ?? "" },
    { label: t("pdfinfo.author"), value: info?.author ?? "" },
    { label: t("pdfinfo.creator"), value: info?.creator ?? "" },
    { label: t("pdfinfo.producer"), value: info?.producer ?? "" },
  ];

  return (
    <ToolPage
      id="pdf-info"
      actions={
        <Button variant="primary" leftIcon={<FileText size={15} />} onClick={pick} disabled={busy}>
          {busy ? t("pdfinfo.reading") : t("pdfinfo.openPdf")}
        </Button>
      }
      statusLeft={<span>{t("pdfinfo.hint")}</span>}
      statusRight={info ? <span>{t("pdfinfo.updated")}</span> : undefined}
    >
      {!info ? (
        <EmptyState
          icon={<FileText size={24} />}
          title={t("pdfinfo.emptyTitle")}
          description={t("pdfinfo.emptyDesc")}
          action={<Button variant="primary" leftIcon={<FileText size={15} />} onClick={pick}>{file ? t("pdfinfo.otherFile") : t("pdfinfo.pickFile")}</Button>}
        />
      ) : (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 2 }}>
          {rows.map((r) => (
            <div key={r.label} className="info-row" style={{ padding: "9px 0" }}>
              <span className="info-row__label">{r.label}</span>
              <span className="info-row__value">{r.value || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}