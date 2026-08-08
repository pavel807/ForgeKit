import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, Input } from "../components/ui";
import { api, useRust } from "../core/api";
import { useI18n } from "../core/i18n";

export default function SlugGenerator() {
  const { t } = useI18n();
  const [input, setInput] = useState("");

  const { data: slug } = useRust(() => api.slugify(input), [input]);

  return (
    <ToolPage
      id="slug-generator"
      actions={<CopyButton text={slug ?? ""} disabled={!slug} />}
      toolbar={<Input className="mono-value" placeholder={t("slug.placeholder")} value={input} onChange={(e) => setInput(e.target.value)} style={{ width: 320 }} />}
      statusLeft={<span>{t("slug.hint")}</span>}
      statusRight={slug ? <span>{t("slug.length", { n: slug.length })}</span> : undefined}
    >
      {slug ? (
        <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="info-row__label">{t("slug.result")}</div>
          <div className="mono-value" style={{ fontSize: 18, userSelect: "text" }}>{slug}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{t("slug.example", { slug })}</div>
        </div>
      ) : (
        <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>{t("slug.emptyHint")}</div>
      )}
    </ToolPage>
  );
}
