import { useState } from "react";
import { QrCode } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api, isTauri, pickSave } from "../core/api";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [pngBase64, setPngBase64] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      if (isTauri()) {
        const r = await api.generateQr(text.trim());
        setPngBase64(r.png_base64);
      } else {
        const r = await api.generateQr(text.trim());
        setPngBase64(r.png_base64);
      }
    } catch (e) {
      setError(String(e));
    }
    setBusy(false);
  }

  async function save() {
    if (!pngBase64) return;
    const out = await pickSave("qr-code.png", [{ name: "PNG", extensions: ["png"] }]);
    if (!out) return;
    await api.saveQrImage(out, pngBase64).catch((e) => setError(String(e)));
  }

  return (
    <ToolPage
      id="qr-generator"
      actions={
        <Button variant="primary" leftIcon={<QrCode size={15} />} onClick={generate} disabled={busy || !text.trim()}>
          {busy ? "Генерация…" : "Сгенерировать"}
        </Button>
      }
      toolbar={
        <Input className="mono-value" placeholder="Текст, ссылка, Wi-Fi…" value={text} onChange={(e) => setText(e.target.value)} style={{ width: 380 }} />
      }
      statusLeft={<span>QR-код генерируется Rust-командой (crate qrcode)</span>}
      statusRight={pngBase64 ? <span>PNG · можно сохранить на диск</span> : undefined}
    >
      {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}
      {!pngBase64 ? (
        <EmptyState
          icon={<QrCode size={24} />}
          title="Генератор QR-кодов"
          description="Превратите любую строку в QR-код и сохраните его как PNG"
          action={
            <Button variant="primary" leftIcon={<QrCode size={15} />} onClick={generate} disabled={!text.trim()}>
              Сгенерировать
            </Button>
          }
        />
      ) : (
        <div className="fk-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <img src={`data:image/png;base64,${pngBase64}`} width={320} height={320} alt="QR" style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius-lg)" }} />
          <div className="row">
            <Button onClick={save} leftIcon={<QrCode size={15} />}>Сохранить PNG</Button>
            <Button variant="ghost" onClick={() => setPngBase64(null)}>Закрыть</Button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}