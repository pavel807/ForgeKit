import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, Input } from "../components/ui";
import { api, useRust } from "../core/api";

const PRESETS = ["#2563EB", "#0F172A", "#FFFFFF", "#DC2626", "#16A34A", "#D97706", "#9333EA", "#0EA5E9"];

export default function ColorPicker() {
  const [hex, setHex] = useState("#2563EB");
  const [showNative, setShowNative] = useState(false);

  const { data: color } = useRust(() => api.colorConvert(hex), [hex]);

  function validHex(v: string): string {
    const m = v.match(/^#?([0-9a-f]{6})$/i);
    return m ? `#${m[1].toUpperCase()}` : "";
  }

  return (
    <ToolPage
      id="color-picker"
      statusLeft={<span>Конвертация HEX ↔ RGB ↔ HSL ↔ CMYK</span>}
      statusRight={color ? <span>HSL: hsl({color.hsl}, 100%)</span> : undefined}
    >
      <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", gap: 24 }}>
        <div className="color-swatch" style={{ width: 120, height: 120, borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: color ? `rgb(${color.rgb.join(", ")})` : "#fff" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <div className="converter-row">
            <span className="info-row__label" style={{ width: 90 }}>HEX</span>
            <Input className="mono-value" value={hex} onChange={(e) => { setHex(e.target.value); }} style={{ width: 140 }} />
            <button className="fk-btn fk-btn--ghost" onClick={() => setShowNative((v) => !v)}>
              {showNative ? "Скрыть палитру" : "Палитра"}
            </button>
            {showNative && (
              <input
                type="color"
                value={validHex(hex) || "#2563EB"}
                onChange={(e) => setHex(e.target.value.toUpperCase())}
                style={{ width: 48, height: 32, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "none", cursor: "pointer" }}
              />
            )}
            <CopyButton text={validHex(hex) || hex} size="sm" />
          </div>
          <div className="converter-row">
            <span className="info-row__label" style={{ width: 90 }}>RGB</span>
            <span className="info-row__value mono-value" style={{ fontSize: 13.5, userSelect: "text" }}>
              {color ? `rgb(${color.rgb.join(", ")})` : "—"}
            </span>
            {color && <CopyButton text={`rgb(${color.rgb.join(", ")})`} size="sm" />}
          </div>
          <div className="converter-row">
            <span className="info-row__label" style={{ width: 90 }}>HSL</span>
            <span className="info-row__value mono-value" style={{ fontSize: 13.5, userSelect: "text" }}>
              {color ? `hsl(${color.hsl}, 100%)` : "—"}
            </span>
            {color && <CopyButton text={`hsl(${color.hsl}, 100%)`} size="sm" />}
          </div>
          <div className="converter-row">
            <span className="info-row__label" style={{ width: 90 }}>CMYK</span>
            <span className="info-row__value mono-value" style={{ fontSize: 13.5, userSelect: "text" }}>
              {color ? `cmyk(${color.cmyk})` : "—"}
            </span>
            {color && <CopyButton text={`cmyk(${color.cmyk})`} size="sm" />}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {PRESETS.map((p) => (
              <button key={p} className="color-dot" style={{ background: p, outline: hex.toUpperCase() === p ? "2px solid var(--fk-accent)" : "none" }} onClick={() => setHex(p)} />
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
