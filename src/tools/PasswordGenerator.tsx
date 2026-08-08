import { useState } from "react";
import { KeySquare } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, Checkbox, CopyButton, Input } from "../components/ui";
import { api } from "../core/api";
import { useI18n } from "../core/i18n";

export default function PasswordGenerator() {
  const { t } = useI18n();
  const [length, setLength] = useState(24);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [entropy, setEntropy] = useState(0);

  async function generate() {
    try {
      const res = await api.passwordGenerate(length, useUpper, useDigits, useSymbols, excludeAmbiguous);
      setPassword(res.password);
      setEntropy(res.entropy);
    } catch {
      setPassword("");
    }
  }

  const strengthLabel = entropy >= 120 ? t("pwdgen.excellent") : entropy >= 80 ? t("pwdgen.good") : entropy >= 50 ? t("pwdgen.fair") : t("pwdgen.weak");

  return (
    <ToolPage
      id="password-generator"
      actions={
        <Button variant="primary" leftIcon={<KeySquare size={15} />} onClick={generate}>
          {t("pwdgen.generate")}
        </Button>
      }
      statusLeft={<span>{t("pwdgen.hint")}</span>}
      statusRight={password ? <span>{t("pwdgen.entropy", { n: entropy, label: strengthLabel })}</span> : undefined}
    >
      <div className="fk-panel" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="converter-row">
          <span className="info-row__label" style={{ width: 130 }}>{t("pwdgen.length")}</span>
          <Input className="mono-value" type="number" min={4} max={128} value={String(length)} onChange={(e) => setLength(Math.max(4, Math.min(128, parseInt(e.target.value, 10) || 4)))} style={{ width: 100 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Checkbox label={t("pwdgen.upper")} checked={useUpper} onChange={setUseUpper} />
          <Checkbox label={t("pwdgen.digits")} checked={useDigits} onChange={setUseDigits} />
          <Checkbox label={t("pwdgen.symbols")} checked={useSymbols} onChange={setUseSymbols} />
          <Checkbox label={t("pwdgen.noAmbiguous")} checked={excludeAmbiguous} onChange={setExcludeAmbiguous} />
        </div>
        {password && (
          <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>
              {t("pwdgen.result")}
            </div>
            <div className="fk-panel fk-panel--row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
              <span className="mono-value" style={{ flex: 1, fontSize: 18, overflowWrap: "anywhere", userSelect: "text" }}>{password}</span>
              <CopyButton text={password} />
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  );
}
