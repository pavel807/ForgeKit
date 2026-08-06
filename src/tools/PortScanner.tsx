import { useState } from "react";
import { Network } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input, SegmentedControl } from "../components/ui";
import { api } from "../core/api";

const PORT_NAMES: Record<number, string> = {
  20: "FTP-data", 21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
  80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 3306: "MySQL",
  3389: "RDP", 5432: "PostgreSQL", 5433: "PostgreSQL", 6379: "Redis", 8080: "HTTP-alt",
};

function portName(p: number): string {
  return PORT_NAMES[p] ?? "";
}

const PRESETS: { value: string; label: string; ports: number[] }[] = [
  { value: "common", label: "Частые", ports: [21, 22, 23, 25, 53, 80, 443, 3306, 5432, 6379, 8080] },
  { value: "web", label: "Web", ports: [80, 443, 8000, 8080, 8443, 8888, 3000, 5000, 9000] },
  { value: "db", label: "Базы данных", ports: [3306, 5432, 5433, 6379, 27017, 1433, 9200] },
];

export default function PortScanner() {
  const [host, setHost] = useState("localhost");
  const [preset, setPreset] = useState("common");
  const [custom, setCustom] = useState("");
  const [openPorts, setOpenPorts] = useState<number[] | null>(null);
  const [busy, setBusy] = useState(false);

  function parsePorts(presetValue: string, customValue: string): number[] {
    if (presetValue === "custom" && customValue.trim()) {
      const ports: number[] = [];
      for (const part of customValue.split(",")) {
        const [a, b] = part.split("-");
        if (a && b) {
          const lo = parseInt(a, 10);
          const hi = parseInt(b, 10);
          for (let i = lo; i <= hi; i++) ports.push(i);
        } else {
          const p = parseInt(part, 10);
          if (!Number.isNaN(p)) ports.push(p);
        }
      }
      return ports;
    }
    return PRESETS.find((p) => p.value === presetValue)?.ports ?? [];
  }

  async function scan() {
    const ports = parsePorts(preset, custom);
    if (!ports.length) return;
    setBusy(true);
    const r = await api.scanPorts(host.trim() || "localhost", ports).catch(() => null);
    setOpenPorts(r);
    setBusy(false);
  }

  const checked = parsePorts(preset, custom);

  return (
    <ToolPage
      id="port-scanner"
      actions={
        <Button variant="primary" leftIcon={<Network size={15} />} onClick={scan} disabled={busy}>
          {busy ? "Сканирование…" : "Сканировать"}
        </Button>
      }
      toolbar={
        <>
          <Input className="mono-value" placeholder="localhost" value={host} onChange={(e) => setHost(e.target.value)} style={{ width: 180 }} />
          <SegmentedControl value={preset} onChange={(v) => setPreset(v)} items={[...PRESETS.map((p) => ({ value: p.value, label: p.label })), { value: "custom", label: "Свои" }]} />
        </>
      }
      statusLeft={<span>Порты проверяются последовательно TCP-подключением</span>}
      statusRight={openPorts ? <span>Открыто: {openPorts.length} из {checked.length}</span> : undefined}
    >
      {preset === "custom" && (
        <input className="fk-input mono-value" placeholder="22,80,443 или 20-25" value={custom} onChange={(e) => setCustom(e.target.value)} style={{ marginBottom: 12, width: 260 }} />
      )}
      {openPorts === null ? (
        <EmptyState
          icon={<Network size={24} />}
          title="Сканирование портов"
          description="Проверяет, какие порты открыты на хосте, и подписывает известные сервисы"
          action={
            <Button variant="primary" leftIcon={<Network size={15} />} onClick={scan}>
              Начать сканирование
            </Button>
          }
        />
      ) : openPorts.length === 0 ? (
        <EmptyState icon={<Network size={24} />} title="Открытых портов нет" description="Все проверенные порты закрыты или не отвечают" />
      ) : (
        <div className="port-grid">
          {openPorts.map((p) => (
            <div key={p} className="fk-panel fk-panel--port is-open" style={{ textAlign: "center", padding: "12px 10px" }}>
              <div className="port-grid__num mono-value">{p}</div>
              <div className="port-grid__service" style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{portName(p)}</div>
              <div className="port-grid__status" style={{ fontSize: 11.5, fontWeight: 600, marginTop: 4, color: "var(--success)" }}>открыт</div>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}