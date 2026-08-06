import { useEffect, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, Input, SegmentedControl } from "../components/ui";
import { api, useRust } from "../core/api";
import type { DateParts, DateResult } from "../core/api";

function formatForParts(parts: DateParts, format: string): string {
  const map: Record<string, string> = {
    YYYY: String(parts.year),
    MM: String(parts.month).padStart(2, "0"),
    DD: String(parts.day).padStart(2, "0"),
    HH: String(parts.hour).padStart(2, "0"),
    mm: String(parts.minute).padStart(2, "0"),
    ss: String(parts.second).padStart(2, "0"),
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (k) => map[k]);
}

function localStr(r: DateResult | null): string {
  if (!r) return "";
  const p = r.local;
  return `${String(p.day).padStart(2, "0")}.${String(p.month).padStart(2, "0")}.${p.year}, ${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}:${String(p.second).padStart(2, "0")}`;
}

export default function DateTimeConverter() {
  const [tab, setTab] = useState<"webtime" | "table">("webtime");
  const [now, setNow] = useState<DateResult | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = () => api.dateNow().then((r) => alive && setNow(r));
    tick();
    const t = setInterval(tick, 1000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const [custom, setCustom] = useState("");
  const { data: customRes } = useRust(() => api.dateConvert(custom), [custom]);

  const parsed = customRes && customRes.ok ? customRes.result : null;
  const parsedError = customRes && !customRes.ok ? (customRes.error ?? "Формат не распознан") : null;

  const presets = ["YYYY-MM-DD HH:mm:ss", "DD-MM-YYYY", "HH:mm:ss", "DD.MM.YYYY"];

  return (
    <ToolPage
      id="date-time-converter"
      toolbar={<SegmentedControl value={tab} onChange={(v) => setTab(v as "webtime" | "table")} items={[{ value: "webtime", label: "Текущее время" }, { value: "table", label: "Перевод даты" }]} />}
      statusLeft={<span>Все времена в local timezone</span>}
      statusRight={<span>{localStr(now)}</span>}
    >
      {tab === "webtime" ? (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="info-row">
            <span className="info-row__label">Unix (секунды)</span>
            <span className="info-row__value mono-value">{now ? now.unix : ""}</span>
            <CopyButton text={now ? String(now.unix) : ""} size="sm" />
          </div>
          <div className="info-row">
            <span className="info-row__label">Unix (миллисекунды)</span>
            <span className="info-row__value mono-value">{now ? now.ms : ""}</span>
            <CopyButton text={now ? String(now.ms) : ""} size="sm" />
          </div>
          <div className="info-row">
            <span className="info-row__label">ISO 8601</span>
            <span className="info-row__value mono-value">{now ? now.iso : ""}</span>
            <CopyButton text={now ? now.iso : ""} size="sm" />
          </div>
          <div className="info-row">
            <span className="info-row__label">Локальная дата</span>
            <span className="info-row__value">{localStr(now)}</span>
          </div>
          <div className="info-row">
            <span className="info-row__label">UTC</span>
            <span className="info-row__value mono-value">{now ? now.utc_str : ""}</span>
            <CopyButton text={now ? now.utc_str : ""} size="sm" />
          </div>
        </div>
      ) : (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="converter-row">
            <span className="info-row__label" style={{ width: 120 }}>Дата/время</span>
            <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="2026-08-05T12:34:56 или секунды…" style={{ width: 300 }} />
          </div>
          {parsed && (
            <>
              <div className="info-row">
                <span className="info-row__label">Unix (с)</span>
                <span className="info-row__value mono-value">{parsed.unix}</span>
                <CopyButton text={String(parsed.unix)} size="sm" />
              </div>
              <div className="info-row">
                <span className="info-row__label">ISO</span>
                <span className="info-row__value mono-value">{parsed.iso}</span>
                <CopyButton text={parsed.iso} size="sm" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {presets.map((p) => (
                  <div key={p} className="info-row" style={{ borderRadius: "var(--radius)", border: "1px solid var(--border-soft)", padding: "8px 12px" }}>
                    <span className="info-row__label mono-value" style={{ fontSize: 12.5 }}>{p}</span>
                    <span className="info-row__value mono-value" style={{ fontSize: 13 }}>{formatForParts(parsed.local, p)}</span>
                    <CopyButton text={formatForParts(parsed.local, p)} size="sm" />
                  </div>
                ))}
              </div>
            </>
          )}
          {custom && parsedError && <div className="error-text">{parsedError}</div>}
        </div>
      )}
    </ToolPage>
  );
}
