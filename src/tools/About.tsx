import { Star } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { isTauri } from "../core/api";

const TOOL_COUNT = 40;
const CATEGORY_COUNT = 10;

export default function About() {
  return (
    <ToolPage
      id="about"
      statusLeft={<span>Собрано с любовью и вниманием к деталям</span>}
      statusRight={isTauri() ? <span>Нативное приложение Tauri 2</span> : <span>Предпросмотр в браузере</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, paddingTop: 40 }}>
        <div className="about-logo">
          <img src="/icon.svg" alt="ForgeKit" width={72} height={72} />
        </div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>ForgeKit</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Более {TOOL_COUNT} инструментов в {CATEGORY_COUNT} категориях</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} size={14} style={{ color: "var(--warning)" }} fill="currentColor" />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--text-secondary)" }}>
          <span>Версия 1.4.1</span>
          <span>·</span>
          <span>Rust + Tauri 2</span>
          <span>·</span>
          <span>React 19</span>
          <span>·</span>
          <span>SQLite</span>
        </div>
      </div>
    </ToolPage>
  );
}