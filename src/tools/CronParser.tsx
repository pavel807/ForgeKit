import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Input } from "../components/ui";
import { api, useRust } from "../core/api";

export default function CronParser() {
  const [expr, setExpr] = useState("*/5 * * * *");

  const { data } = useRust(() => api.cronParse(expr), [expr]);
  const spec = data && data.ok ? data : null;

  return (
    <ToolPage
      id="cron-parser"
      toolbar={
        <Input className="mono-value" placeholder="*/5 * * * *" value={expr} onChange={(e) => setExpr(e.target.value)} style={{ width: 240 }} />
      }
      statusLeft={<span>{data ? (data.ok ? "Выражение корректно" : "Ошибка: ожидается 5 полей") : ""}</span>}
      statusRight={spec ? <span>Ближайший запуск: {spec.next_runs[0] ?? "—"}</span> : undefined}
    >
      {spec ? (
        <div className="fk-panel" style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {spec.description.map((line, i) => (
              <div key={i} style={{ fontSize: 13 }}>{line}</div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border-soft)", marginTop: 14, paddingTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 8 }}>
              Ближайшие запуски
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {spec.next_runs.map((d, i) => (
                <div key={`${d}-${i}`} className="fk-list__item" style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius)" }}>
                  <span className="mono-value" style={{ fontSize: 13 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: "var(--danger)", fontSize: 13 }}>{data && !data.ok ? "Выражение не распознано" : ""}</div>
      )}
    </ToolPage>
  );
}
