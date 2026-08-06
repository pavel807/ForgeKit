import { useState } from "react";
import { Lock } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton, SegmentedControl } from "../components/ui";
import { api } from "../core/api";

export default function AESEncrypt() {
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!key || !input) {
      setError("Введите ключ и данные");
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
          {busy ? "Обработка…" : mode === "encrypt" ? "Зашифровать" : "Расшифровать"}
        </Button>
      }
      toolbar={<SegmentedControl value={mode} onChange={(v) => setMode(v as "encrypt" | "decrypt")} items={[{ value: "encrypt", label: "Шифрование" }, { value: "decrypt", label: "Расшифрование" }]} />}
      statusLeft={<span>AES-256-GCM, ключ выводится из пароля через PBKDF2 (ядро Rust)</span>}
      statusRight={input ? <span>{bytes} байт</span> : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <input className="fk-input mono-value" type="password" placeholder="Пароль (ключ)" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" style={{ width: 320 }} />
        <textarea
          className="fk-textarea mono-value"
          placeholder={mode === "encrypt" ? "Текст для шифрования…" : "Base64-зашифрованные данные…"}
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
