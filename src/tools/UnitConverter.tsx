import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Input, Select } from "../components/ui";
import { useI18n, type Keys } from "../core/i18n";

type UnitDef = { value: string; labelKey: Keys; factor: number };

const GROUPS: Record<string, { titleKey: Keys; units: UnitDef[] }> = {
  length: {
    titleKey: "unit.length",
    units: [
      { value: "mm", labelKey: "unit.mm", factor: 0.001 },
      { value: "cm", labelKey: "unit.cm", factor: 0.01 },
      { value: "m", labelKey: "unit.m", factor: 1 },
      { value: "km", labelKey: "unit.km", factor: 1000 },
      { value: "in", labelKey: "unit.in", factor: 0.0254 },
      { value: "ft", labelKey: "unit.ft", factor: 0.3048 },
      { value: "mi", labelKey: "unit.mi", factor: 1609.344 },
    ],
  },
  weight: {
    titleKey: "unit.weight",
    units: [
      { value: "mg", labelKey: "unit.mg", factor: 0.000001 },
      { value: "g", labelKey: "unit.g", factor: 0.001 },
      { value: "kg", labelKey: "unit.kg", factor: 1 },
      { value: "t", labelKey: "unit.t", factor: 1000 },
      { value: "oz", labelKey: "unit.oz", factor: 0.0283495 },
      { value: "lb", labelKey: "unit.lb", factor: 0.453592 },
    ],
  },
  data: {
    titleKey: "unit.data",
    units: [
      { value: "b", labelKey: "unit.b", factor: 1 },
      { value: "kb", labelKey: "unit.kb", factor: 1024 },
      { value: "mb", labelKey: "unit.mb", factor: 1024 ** 2 },
      { value: "gb", labelKey: "unit.gb", factor: 1024 ** 3 },
      { value: "tb", labelKey: "unit.tb", factor: 1024 ** 4 },
    ],
  },
  speed: {
    titleKey: "unit.speed",
    units: [
      { value: "mps", labelKey: "unit.mps", factor: 1 },
      { value: "kmph", labelKey: "unit.kmph", factor: 1 / 3.6 },
      { value: "mphp", labelKey: "unit.mphp", factor: 1 / 2.236936 },
      { value: "knot", labelKey: "unit.knot", factor: 1 / 1.943844 },
    ],
  },
  temperature: {
    titleKey: "unit.temperature",
    units: [
      { value: "c", labelKey: "unit.c", factor: 1 },
      { value: "f", labelKey: "unit.f", factor: 1 },
      { value: "k", labelKey: "unit.k", factor: 1 },
    ],
  },
  area: {
    titleKey: "unit.area",
    units: [
      { value: "m2", labelKey: "unit.m2", factor: 1 },
      { value: "km2", labelKey: "unit.km2", factor: 1e6 },
      { value: "ha", labelKey: "unit.ha", factor: 10000 },
      { value: "ft2", labelKey: "unit.ft2", factor: 0.092903 },
    ],
  },
};

export default function UnitConverter() {
  const [group, setGroup] = useState("length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [value, setValue] = useState("1");
  const { t } = useI18n();

  const units = GROUPS[group].units;

  const result = useMemo(() => {
    const v = parseFloat(value.replace(",", "."));
    if (Number.isNaN(v)) return "";
    const fromU = units.find((u) => u.value === from)!;
    const toU = units.find((u) => u.value === to)!;
    if (group === "temperature") {
      /* только °C → °F → K */
      let c = v;
      if (from === "f") c = (v - 32) * (5 / 9);
      else if (from === "k") c = v - 273.15;
      let out = c;
      if (to === "f") out = c * (9 / 5) + 32;
      else if (to === "k") out = c + 273.15;
      return out.toFixed(4).replace(/\.?0+$/, "");
    }
    const factor = fromU.factor / toU.factor;
    const out = v * factor;
    return out.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
  }, [value, from, to, group, units]);

  const allOptions = Object.entries(GROUPS).map(([k, g]) => ({ value: k, label: t(g.titleKey) }));

  return (
    <ToolPage
      id="unit-converter"
      toolbar={<Select label="" options={allOptions} value={group} onChange={(e) => { const g = e.target.value; const first = GROUPS[g].units[0].value; const second = GROUPS[g].units[1].value; setGroup(g); setFrom(first); setTo(second); }} />}
      statusLeft={<span>{t("unit.hint")}</span>}
      statusRight={<span>{t("unit.group", { g: t(GROUPS[group].titleKey) })}</span>}
    >
      <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="converter-row">
          <span className="info-row__label" style={{ width: 90 }}>{t("unit.value")}</span>
          <Input className="mono-value" value={value} onChange={(e) => setValue(e.target.value)} style={{ width: 200 }} />
        </div>
        <div className="converter-row">
          <span className="info-row__label" style={{ width: 90 }}>{t("unit.from")}</span>
          <Select label="" options={units.map((u) => ({ value: u.value, label: t(u.labelKey) }))} value={from} onChange={(e) => setFrom(e.target.value)} />
          <span style={{ margin: "0 10px", color: "var(--text-tertiary)" }}>→</span>
          <span className="info-row__label" style={{ width: 90 }}>{t("unit.to")}</span>
          <Select label="" options={units.map((u) => ({ value: u.value, label: t(u.labelKey) }))} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 6 }}>
            {t("unit.result")}
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, userSelect: "text" }}>
            {result} {t(units.find((u) => u.value === to)!.labelKey)}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}