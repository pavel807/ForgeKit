import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Input, Select } from "../components/ui";

type UnitDef = { value: string; label: string; factor: number };

const GROUPS: Record<string, { title: string; units: UnitDef[] }> = {
  length: {
    title: "Длина",
    units: [
      { value: "mm", label: "мм", factor: 0.001 },
      { value: "cm", label: "см", factor: 0.01 },
      { value: "m", label: "м", factor: 1 },
      { value: "km", label: "км", factor: 1000 },
      { value: "in", label: "дюйм", factor: 0.0254 },
      { value: "ft", label: "фут", factor: 0.3048 },
      { value: "mi", label: "миля", factor: 1609.344 },
    ],
  },
  weight: {
    title: "Вес",
    units: [
      { value: "mg", label: "мг", factor: 0.000001 },
      { value: "g", label: "г", factor: 0.001 },
      { value: "kg", label: "кг", factor: 1 },
      { value: "t", label: "тонна", factor: 1000 },
      { value: "oz", label: "унция", factor: 0.0283495 },
      { value: "lb", label: "фунт", factor: 0.453592 },
    ],
  },
  data: {
    title: "Данные",
    units: [
      { value: "b", label: "Байт", factor: 1 },
      { value: "kb", label: "КБ", factor: 1024 },
      { value: "mb", label: "МБ", factor: 1024 ** 2 },
      { value: "gb", label: "ГБ", factor: 1024 ** 3 },
      { value: "tb", label: "ТБ", factor: 1024 ** 4 },
    ],
  },
  speed: {
    title: "Скорость",
    units: [
      { value: "mps", label: "м/с", factor: 1 },
      { value: "kmph", label: "км/ч", factor: 1 / 3.6 },
      { value: "mphp", label: "миль/ч", factor: 1 / 2.236936 },
      { value: "knot", label: "узел", factor: 1 / 1.943844 },
    ],
  },
  temperature: {
    title: "Температура",
    units: [
      { value: "c", label: "°C", factor: 1 },
      { value: "f", label: "°F", factor: 1 },
      { value: "k", label: "K", factor: 1 },
    ],
  },
  area: {
    title: "Площадь",
    units: [
      { value: "m2", label: "м²", factor: 1 },
      { value: "km2", label: "км²", factor: 1e6 },
      { value: "ha", label: "га", factor: 10000 },
      { value: "ft2", label: "фут²", factor: 0.092903 },
    ],
  },
};

export default function UnitConverter() {
  const [group, setGroup] = useState("length");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [value, setValue] = useState("1");

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

  const allOptions = Object.entries(GROUPS).map(([k, g]) => ({ value: k, label: g.title }));

  return (
    <ToolPage
      id="unit-converter"
      toolbar={<Select label="" options={allOptions} value={group} onChange={(e) => { const g = e.target.value; const first = GROUPS[g].units[0].value; const second = GROUPS[g].units[1].value; setGroup(g); setFrom(first); setTo(second); }} />}
      statusLeft={<span>Поддерживаются все основные единицы измерения</span>}
      statusRight={<span>Группа: {GROUPS[group].title}</span>}
    >
      <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="converter-row">
          <span className="info-row__label" style={{ width: 90 }}>Значение</span>
          <Input className="mono-value" value={value} onChange={(e) => setValue(e.target.value)} style={{ width: 200 }} />
        </div>
        <div className="converter-row">
          <span className="info-row__label" style={{ width: 90 }}>Из</span>
          <Select label="" options={units.map((u) => ({ value: u.value, label: u.label }))} value={from} onChange={(e) => setFrom(e.target.value)} />
          <span style={{ margin: "0 10px", color: "var(--text-tertiary)" }}>→</span>
          <span className="info-row__label" style={{ width: 90 }}>В</span>
          <Select label="" options={units.map((u) => ({ value: u.value, label: u.label }))} value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 6 }}>
            Результат
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, userSelect: "text" }}>
            {result} {units.find((u) => u.value === to)?.label}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}