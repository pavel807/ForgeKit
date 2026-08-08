import { useState } from "react";
import { QrCode } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Input } from "../components/ui";
import { api, pickSave } from "../core/api";
import { useI18n } from "../core/i18n";

export default function QRGenerator() {
  const [text, setText] = useState("");
  const [pngBase64, setPngBase64] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  async function generate() {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.generateQr(text.trim());
      setPngBase64(r.png_base64);
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
          {busy ? t("qr.generating") : t("qr.generate")}
        </Button>
      }
      toolbar={
        <Input className="mono-value" placeholder={t("qr.placeholder")} value={text} onChange={(e) => setText(e.target.value)} style={{ width: 380 }} />
      }
      statusLeft={<span>{t("qr.hint")}</span>}
      statusRight={pngBase64 ? <span>{t("qr.savedHint")}</span> : undefined}
    >
      {error && <div className="error-text" style={{ marginBottom: 12 }}>{error}</div>}
      {!pngBase64 ? (
        <EmptyState
          icon={<QrCode size={24} />}
          title={t("qr.emptyTitle")}
          description={t("qr.emptyDesc")}
          action={
            <Button variant="primary" leftIcon={<QrCode size={15} />} onClick={generate} disabled={!text.trim()}>
              {t("qr.generate")}
            </Button>
          }
        />
      ) : (
        <div className="fk-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <img src={`data:image/png;base64,${pngBase64}`} width={320} height={320} alt="QR" style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius-lg)" }} />
          <div className="row">
            <Button onClick={save} leftIcon={<QrCode size={15} />}>{t("qr.savePng")}</Button>
            <Button variant="ghost" onClick={() => setPngBase64(null)}>{t("common.close")}</Button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}