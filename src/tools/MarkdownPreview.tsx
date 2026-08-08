import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { SegmentedControl } from "../components/ui";
import { useI18n } from "../core/i18n";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    if (line.startsWith("```")) {
      if (inCode) {
        out.push(`<pre class="fk-code mono-value">${escapeHtml(codeBuf.join("\n"))}</pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)/);
    if (h) {
      closeList();
      const level = h[1].length;
      out.push(`<h${level} class="md-h md-h--${level}">${escapeHtml(h[2])}</h${level}>`);
      continue;
    }
    const ul = line.match(/^\s*[-*+]\s+(.*)/);
    if (ul) {
      if (!inList) {
        out.push("<ul class=\"md-list\">");
        inList = true;
      }
      out.push(`<li>${escapeHtml(ul[1])}</li>`);
      continue;
    }
    closeList();
    if (line.trim() === "") {
      continue;
    }
    const bold = escapeHtml(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
    const link = bold.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
      const href = url.trim();
      if (/^(https?|mailto):/i.test(href) || href.startsWith("#")) {
        return `<a href="${href}" target="_blank" rel="noreferrer">${text}</a>`;
      }
      return `<span>[${text}](${url})</span>`;
    });
    out.push(`<p class="md-p">${link}</p>`);
  }
  closeList();
  return out.join("\n");
}

export default function MarkdownPreview() {
  const [input, setInput] = useState("# Заголовок\n\nНапишите **markdown** здесь…\n\n- пункт 1\n- пункт 2\n\n```js\nconst x = 1;\n```");
  const [mode, setMode] = useState<"split" | "preview">("split");
  const { t } = useI18n();

  const html = useMemo(() => renderMarkdown(input), [input]);
  const wordCount = useMemo(() => input.trim().split(/\s+/).filter(Boolean).length, [input]);

  return (
    <ToolPage
      id="markdown-preview"
      toolbar={<SegmentedControl value={mode} onChange={(v) => setMode(v as "split" | "preview")} items={[{ value: "split", label: t("md.split") }, { value: "preview", label: t("md.preview") }]} />}
      statusLeft={<span>{t("md.hint")}</span>}
      statusRight={<span>{t("md.words", { n: wordCount })}</span>}
    >
      {mode === "split" ? (
        <div className="split-editor">
          <textarea className="fk-textarea mono-value" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} />
          <div className="split-editor__divider" />
          <div className="md-preview fk-panel" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="md-preview fk-panel" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </ToolPage>
  );
}