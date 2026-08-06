import { useState } from "react";
import { Hash } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, CopyButton } from "../components/ui";
import { api, isTauri, useRust } from "../core/api";

const ALGOS = [
  { key: "md5", label: "MD5" },
  { key: "sha1", label: "SHA-1" },
  { key: "sha256", label: "SHA-256" },
  { key: "sha512", label: "SHA-512" },
];

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string> | null>(null);
  const [busy, setBusy] = useState(false);

  async function compute() {
    if (!input) return;
    setBusy(true);
    const next: Record<string, string> = {};
    if (isTauri()) {
      await Promise.all(
        ALGOS.map(async (a) => {
          try {
            next[a.key] = await api.hashString(input, a.key);
          } catch (e) {
            next[a.key] = `Ошибка: ${e}`;
          }
        }),
      );
    } else {
      /* Локальный расчёт через Web Crypto (SHA-256/512; MD5/SHA-1 недоступны) */
      const enc = new TextEncoder();
      for (const a of ALGOS) {
        if (a.key === "sha256" || a.key === "sha512") {
          const buf = await crypto.subtle.digest(a.key.toUpperCase().replace("-", ""), enc.encode(input));
          next[a.key] = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
        } else {
          next[a.key] = "(доступно в Tauri)";
        }
      }
    }
    setHashes(next);
    setBusy(false);
  }

  const { data: stats } = useRust(() => api.textCount(input), [input]);
  const inputBytes = stats?.bytes ?? 0;

  return (
    <ToolPage
      id="hash-generator"
      actions={
        <Button variant="primary" leftIcon={<Hash size={15} />} onClick={compute} disabled={busy || !input}>
          {busy ? "Хэшируем…" : "Вычислить хэши"}
        </Button>
      }
      statusLeft={<span>{input ? `Входных данных: ${inputBytes} байт` : "Введите текст для хэширования"}</span>}
      statusRight={<span>Алгоритмы: MD5, SHA-1, SHA-256, SHA-512</span>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <textarea
          className="fk-textarea mono-value"
          placeholder="Введите текст…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          style={{ minHeight: 90 }}
        />
        {hashes &&
          ALGOS.map((a) => (
            <div className="fk-panel fk-panel--row" key={a.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 70, fontWeight: 600, fontSize: 12.5 }}>{a.label}</span>
              <span className="mono-value" style={{ flex: 1, fontSize: 12.5, overflowWrap: "anywhere", userSelect: "text" }}>
                {hashes[a.key]}
              </span>
              <CopyButton text={hashes[a.key]} size="sm" />
            </div>
          ))}
      </div>
    </ToolPage>
  );
}