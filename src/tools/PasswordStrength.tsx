import { useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { Progress } from "../components/ui";
import { api, useRust } from "../core/api";

export default function PasswordStrength() {
  const [password, setPassword] = useState("");

  const { data } = useRust(() => api.passwordStrength(password), [password]);

  const percent = data?.percent ?? 0;
  const label =
    data == null
      ? "Введите пароль"
      : percent < 34
        ? "Слабый пароль"
        : percent < 67
          ? "Средний пароль"
          : "Надёжный пароль";

  return (
    <ToolPage
      id="password-strength"
      statusLeft={<span>Оценка основана на длине и наборе символов</span>}
      statusRight={password ? <span style={{ fontWeight: 600 }}>{label}</span> : undefined}
    >
      <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <input className="fk-input mono-value" type="password" placeholder="Введите пароль…" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
        <Progress value={percent} tone={percent >= 67 ? "success" : percent >= 34 ? "warning" : "danger"} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(data?.checks ?? []).map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ color: c.ok ? "var(--success)" : "var(--text-tertiary)", width: 24 }}>{c.ok ? "✓" : "○"}</span>
              <span style={{ color: c.ok ? "var(--text)" : "var(--text-secondary)" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolPage>
  );
}