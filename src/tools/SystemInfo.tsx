import { useEffect, useState } from "react";
import { MonitorCog } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Progress } from "../components/ui";
import { api, isTauri, type SystemInfo } from "../core/api";
import { formatBytes } from "../core/format";

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

  async function load() {
    setBusy(true);
    const result = await api.systemInfo().catch(() => null);
    setInfo(result);
    setBusy(false);
  }

  useEffect(() => {
    if (isTauri()) load();
  }, []);

  const uptime = info ? `${Math.floor(info.uptime_sec / 3600)} ч ${Math.floor((info.uptime_sec % 3600) / 60)} мин` : "";

  return (
    <ToolPage
      id="system-info"
      actions={
        <Button variant="primary" leftIcon={<MonitorCog size={15} />} onClick={load} disabled={busy}>
          {busy ? "Обновление…" : "Обновить данные"}
        </Button>
      }
      statusLeft={<span>Данные предоставлены Rust-командой system_info</span>}
      statusRight={info ? <span>ОС: {info.os_name} {info.os_version}</span> : undefined}
    >
      {!info ? (
        <EmptyState
          icon={<MonitorCog size={24} />}
          title="Сведения о системе"
          description="Узнайте версию ОС, характеристики и загрузку процессора и памяти"
          action={
            <Button variant="primary" leftIcon={<MonitorCog size={15} />} onClick={load}>
              Получить данные
            </Button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="fk-panel">
            <Row label="Операционная система" value={`${info.os_name} ${info.os_version}`} />
            <Row label="Ядро" value={info.kernel} />
            <Row label="Архитектура" value={info.arch} />
            <Row label="Имя машины" value={info.hostname} />
            <Row label="Процессор" value={info.cpu_model} />
            <Row label="Ядер" value={String(info.cpu_cores)} />
            <Row label="Время работы" value={uptime} />
          </div>
          <div className="fk-panel" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 12 }}>
              Загрузка CPU {info.cpu_usage.toFixed(1)}%
            </div>
            <Progress value={info.cpu_usage} />
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 16, marginBottom: 12 }}>
              Память: {formatBytes(info.used_mem)} из {formatBytes(info.total_mem)}
            </div>
            <Progress value={info.total_mem > 0 ? (info.used_mem / info.total_mem) * 100 : 0} />
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginTop: 16, marginBottom: 12 }}>
              Диск: {formatBytes(info.free_disk)} свободно из {formatBytes(info.total_disk)}
            </div>
            <Progress value={info.total_disk > 0 ? ((info.total_disk - info.free_disk) / info.total_disk) * 100 : 0} />
          </div>
        </div>
      )}
    </ToolPage>
  );
}