import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { api, useRust } from "../core/api";

export default function TextCounter() {
  const [input, setInput] = useState("");

  const { data: stats } = useRust(() => api.textCount(input), [input]);

  const cards = stats
    ? [
        { label: "Символов", value: stats.chars },
        { label: "Без пробелов", value: stats.chars_no_space },
        { label: "Слов", value: stats.words },
        { label: "Уникальных слов", value: stats.unique_words },
        { label: "Строк", value: stats.lines },
        { label: "Предложений", value: stats.sentences },
        { label: "Букв", value: stats.letters },
        { label: "Цифр", value: stats.digits },
        { label: "Пробелов", value: stats.spaces },
        { label: "Знаков препинания", value: stats.punct },
        { label: "Байт (UTF-8)", value: stats.bytes },
      ]
    : [];

  return (
    <ToolPage
      id="text-counter"
      statusLeft={<span>Подсчёт символов, слов, строк и других метрик</span>}
      statusRight={input && stats ? <span>~ {stats.reading_min} мин чтения</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <textarea className="fk-textarea" placeholder="Вставьте текст…" value={input} onChange={(e) => setInput(e.target.value)} style={{ flex: 1, minHeight: 200 }} />
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
