import { useEffect, useState } from "react";
import { MonitorCog } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Progress } from "../components/ui";
import { api, isTauri, type SystemInfo } from "../core/api";
import { formatBytesBinary } from "../core/format";
import { useI18n } from "../core/i18n";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="info-row__label">{label}</span>
      <span className="info-row__value">{value}</span>
    </div>
  );
}

export default function SystemInfo() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const { t } = useI18n();

  async function load(showBusy = true) {
    if (showBusy) setBusy(true);
    const result = await api.systemInfo().catch(() => null);
    setInfo(result);
    if (showBusy) setBusy(false);
  }

  useEffect(() => {
    if (!isTauri()) return;
    load(false);
    const interval = window.setInterval(() => load(false), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const uptime = info ? t("sys.uptimeFmt", { h: Math.floor(info.uptime_sec / 3600), m: Math.floor((info.uptime_sec % 3600) / 60) }) : "";

  return (
    <ToolPage
      id="system-info"
      actions={
        <Button variant="primary" leftIcon={<MonitorCog size={15} />} onClick={() => load()} disabled={busy}>
          {busy ? t("sys.refreshing") : t("sys.refresh")}
        </Button>
      }
      statusLeft={<span>{t("sys.hint")}</span>}
      statusRight={info ? <span>{t("sys.osLabel", { os: `${info.os_name} ${info.os_version}` })}</span> : undefined}
    >
      {!info ? (
        <EmptyState
          icon={<MonitorCog size={24} />}
          title={t("sys.emptyTitle")}
          description={t("sys.emptyDesc")}
          action={
            <Button variant="primary" leftIcon={<MonitorCog size={15} />} onClick={() => load()}>
              {t("sys.getData")}
            </Button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="fk-panel">
            <Row label={t("sys.os")} value={`${info.os_name} ${info.os_version}`} />
            <Row label={t("sys.kernel")} value={info.kernel} />
            <Row label={t("sys.arch")} value={info.arch} />
            <Row label={t("sys.hostname")} value={info.hostname} />
            <Row label={t("sys.cpu")} value={info.cpu_model} />
            <Row label={t("sys.cores")} value={String(info.cpu_cores)} />
            <Row label={t("sys.uptime")} value={uptime} />
          </div>
          <div className="fk-panel" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 12 }}>
              {t("sys.cpuLoad", { n: info.cpu_usage.toFixed(1) })}
            </div>
            <Progress value={info.cpu_usage} />
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 16, marginBottom: 12 }}>
              {t("sys.memOf", { used: formatBytesBinary(info.used_mem), total: formatBytesBinary(info.total_mem) })}
            </div>
            <Progress value={info.total_mem > 0 ? (info.used_mem / info.total_mem) * 100 : 0} />
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 16, marginBottom: 12 }}>
              {t("sys.diskFree", { free: formatBytesBinary(info.free_disk), total: formatBytesBinary(info.total_disk) })}
            </div>
            <Progress value={info.total_disk > 0 ? ((info.total_disk - info.free_disk) / info.total_disk) * 100 : 0} />
          </div>
        </div>
      )}
    </ToolPage>
  );
}