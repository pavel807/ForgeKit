import { useState } from "react";
import { FolderOpen, PieChart } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Progress } from "../components/ui";
import { api, pickDirectory, type SizeEntry } from "../core/api";
import { formatBytes } from "../core/format";
import { useI18n } from "../core/i18n";

export default function FileSizeAnalyzer() {
  const { t } = useI18n();
  const [dir, setDir] = useState<string | null>(null);
  const [entries, setEntries] = useState<SizeEntry[]>([]);
  const [busy, setBusy] = useState(false);

  async function scan() {
    const d = await pickDirectory();
    if (!d) return;
    setDir(d);
    setBusy(true);
    const result = await api.filesSizeBreakdown(d).catch(() => [] as SizeEntry[]);
    setEntries(result);
    setBusy(false);
  }

  const total = entries.reduce((acc, e) => acc + e.size, 0);

  return (
    <ToolPage
      id="file-size-analyzer"
      actions={
        <Button variant="primary" leftIcon={<PieChart size={15} />} onClick={scan} disabled={busy}>
          {busy ? t("fsize.analyzing") : t("fsize.analyze")}
        </Button>
      }
      statusLeft={dir ? <span className="mono-value" style={{ fontSize: 11.5 }}>{dir}</span> : <span>{t("fsize.noFolder")}</span>}
      statusRight={total > 0 ? <span>{t("fsize.total", { n: formatBytes(total) })}</span> : undefined}
    >
      {entries.length === 0 ? (
        <EmptyState
          icon={<PieChart size={24} />}
          title={t("fsize.emptyTitle")}
          description={t("fsize.emptyDesc")}
          action={
            <Button variant="primary" leftIcon={<FolderOpen size={15} />} onClick={scan}>
              {t("fsize.pickFolder")}
            </Button>
          }
        />
      ) : (
        <div className="fk-panel" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.slice(0, 40).map((e) => (
              <div className="bar-row" key={e.path}>
                <div className="bar-row__label mono-value">{e.name}</div>
                <div className="bar-row__track">
                  <Progress value={total > 0 ? (e.size / total) * 100 : 0} />
                </div>
                <div className="bar-row__value">{formatBytes(e.size)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12.5, color: "var(--text-secondary)" }}>
            {t("fsize.limit", { n: entries.length })}
          </div>
        </div>
      )}
    </ToolPage>
  );
}
