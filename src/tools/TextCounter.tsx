import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function TextCounter() {
  const { t } = useI18n();
  const [input, setInput] = useState("");

  const { data: stats } = useRust(() => api.textCount(input), [input]);

  const cards = stats
    ? [
        { label: t("counter.chars"), value: stats.chars },
        { label: t("counter.noSpace"), value: stats.chars_no_space },
        { label: t("counter.words"), value: stats.words },
        { label: t("counter.uniqueWords"), value: stats.unique_words },
        { label: t("counter.lines"), value: stats.lines },
        { label: t("counter.sentences"), value: stats.sentences },
        { label: t("counter.letters"), value: stats.letters },
        { label: t("counter.digits"), value: stats.digits },
        { label: t("counter.spaces"), value: stats.spaces },
        { label: t("counter.punct"), value: stats.punct },
        { label: t("counter.bytes"), value: stats.bytes },
      ]
    : [];

  return (
    <ToolPage
      id="text-counter"
      statusLeft={<span>{t("counter.hint")}</span>}
      statusRight={input && stats ? <span>{t("counter.readingMin", { n: stats.reading_min })}</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <textarea className="fk-textarea" placeholder={t("counter.placeholder")} value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1, minHeight: 200 }} />
        {input && (
          <div className="stat-grid">
            {cards.map((c) => (
              <div key={c.label} className="fk-panel stat-card" style={{ padding: "14px 16px" }}>
                <div className="stat-card__value mono-value">{c.value}</div>
                <div className="stat-card__label">{c.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPage>
  );
}
