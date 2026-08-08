import { useState } from "react";
import { Lock } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api } from "../core/api";
import { useI18n } from "../core/i18n";

export default function AESEncrypt() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!key || !input) {
      setError(t("aes.enterKeyData"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = mode === "encrypt" ? await api.aesEncrypt(key, input) : await api.aesDecrypt(key, input);
      setOutput(res);
    } catch (e) {
      setError(String(e));
      setOutput("");
    }
    setBusy(false);
  }

  const bytes = new TextEncoder().encode(input).length;

  return (
    <ToolPage
      id="aes-encrypt"
      actions={
        <Button variant="primary" leftIcon={<Lock size={15} />} onClick={run} disabled={busy}>
          {busy ? t("aes.processing") : mode === "encrypt" ? t("aes.encrypt") : t("aes.decrypt")}
        </Button>
      }
      toolbar={<SegmentedControl value={mode} onChange={(v) => setMode(v as "encrypt" | "decrypt")} items={[{ value: "encrypt", label: t("aes.encryptMode") }, { value: "decrypt", label: t("aes.decryptMode") }]} />}
      statusLeft={<span>{t("aes.hint")}</span>}
      statusRight={input ? <span>{t("common.bytes", { n: bytes })}</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <input className="fk-input mono-value" type="password" placeholder={t("aes.keyPlaceholder")} value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" style={{ width: 320 }} />
        <textarea
          className="fk-textarea mono-value"
          placeholder={mode === "encrypt" ? t("aes.encryptPlaceholder") : t("aes.decryptPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ flex: 1, minHeight: 140 }}
        />
        {output && (
          <div className="fk-panel" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <textarea className="fk-textarea mono-value" value={output} readOnly spellCheck={false} style={{ flex: 1, minHeight: 80 }} />
            <CopyButton text={output} />
          </div>
        )}
        {error && <div className="error-text">{error}</div>}
      </div>
    </ToolPage>
  );
}
