import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, Input } from "../components/ui";
import { api, useRust } from "../core/api";

export default function SlugGenerator() {
  const [input, setInput] = useState("");

  const { data: slug } = useRust(() => api.slugify(input), [input]);

  return (
    <ToolPage
      id="slug-generator"
      actions={<CopyButton text={slug ?? ""} disabled={!slug} />}
      toolbar={<Input className="mono-value" placeholder="Название статьи или файла…" value={input} onChange={(e) => setInput(e.target.value)} style={{ width: 320 }} />}
      statusLeft={<span>Транслитерация кириллицы + slug-нормализация</span>}
      statusRight={slug ? <span>Длина: {slug.length} символов</span> : undefined}
    >
      {slug ? (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="info-row__label">Результат</div>
          <div className="mono-value" style={{ fontSize: 18, userSelect: "text" }}>{slug}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Пример использования: /articles/{slug}</div>
        </div>
      ) : (
        <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Начните вводить текст — slug появится автоматически</div>
      )}
    </ToolPage>
  );
}
