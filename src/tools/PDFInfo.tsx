import { useState } from "react";
import { FileText } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickFiles, type PdfInfo } from "../core/api";
import { formatBytes } from "../core/format";

export default function PDFInfo() {
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
    { label: "Файл", value: file ? file.slice(file.lastIndexOf("/") + 1) : "" },
    { label: "Размер", value: info ? formatBytes(info.size) : "" },
    { label: "Версия PDF", value: info?.version ?? "" },
    { label: "Страниц", value: info ? String(info.pages) : "" },
    { label: "Название", value: info?.title ?? "" },
    { label: "Автор", value: info?.author ?? "" },
    { label: "Создатель", value: info?.creator ?? "" },
    { label: "Программа", value: info?.producer ?? "" },
  ];

  return (
    <ToolPage
      id="pdf-info"
      actions={
        <Button variant="primary" leftIcon={<FileText size={15} />} onClick={pick} disabled={busy}>
          {busy ? "Чтение…" : "Открыть PDF"}
        </Button>
      }
      statusLeft={<span>Метаданные читаются из трассировки PDF</span>}
      statusRight={info ? <span>Обновлено</span> : undefined}
    >
      {!info ? (
        <EmptyState
          icon={<FileText size={24} />}
          title="Информация о PDF"
          description="Показывает количество страниц, версию и метаданные документа"
          action={<Button variant="primary" leftIcon={<FileText size={15} />} onClick={pick}>{file ? "Другой файл" : "Выбрать PDF-файл"}</Button>}
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