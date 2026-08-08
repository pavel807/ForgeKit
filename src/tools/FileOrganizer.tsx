import { useState } from "react";
import { FolderOpen, FolderTree, Move } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Select } from "../components/ui";
import { api, pickDirectory, type OrganizeResult } from "../core/api";
import { useI18n } from "../core/i18n";

export default function FileOrganizer() {
  const { t } = useI18n();
  const [dir, setDir] = useState<string | null>(null);
  const [mode, setMode] = useState<string>("type");
  const [preview, setPreview] = useState<OrganizeResult[] | null>(null);
  const [applied, setApplied] = useState<OrganizeResult[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(dry: boolean) {
    if (!dir) return;
    setBusy(true);
    const result = await api.filesOrganize(dir, mode, dry).catch(() => [] as OrganizeResult[]);
    if (dry) {
      setPreview(result);
      setApplied(null);
    } else {
      setApplied(result);
      setPreview(null);
    }
    setBusy(false);
  }

  async function open() {
    const d = await pickDirectory();
    if (!d) return;
    setDir(d);
    setPreview(null);
    setApplied(null);
  }

  const okCount = (preview ?? applied ?? []).filter((r) => r.ok).length;
  const errCount = (preview ?? applied ?? []).filter((r) => !r.ok).length;

  return (
    <ToolPage
      id="file-organizer"
      actions={
        <>
          <Button leftIcon={<FolderOpen size={15} />} onClick={open}>
            {t("organizer.pickFolder")}
          </Button>
          <Button variant="primary" leftIcon={<Move size={15} />} onClick={() => run(false)} disabled={busy || !preview || preview.length === 0}>
            {t("organizer.move")}
          </Button>
        </>
      }
      toolbar={
        <Select
          label=""
          options={[
            { value: "type", label: t("organizer.byType") },
            { value: "ext", label: t("organizer.byExt") },
          ]}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        />
      }
      statusLeft={dir ? <span className="mono-value" style={{ fontSize: 11.5 }}>{dir}</span> : <span>{t("organizer.noFolder")}</span>}
      statusRight={
        preview || applied ? (
          <span>
            {t("organizer.moves", { n: okCount })}
            {errCount > 0 ? ` · ${t("organizer.errors", { n: errCount })}` : ""}
          </span>
        ) : undefined
      }
    >
      {!dir ? (
        <EmptyState
          icon={<FolderTree size={24} />}
          title={t("organizer.emptyTitle")}
          description={t("organizer.emptyDesc")}
          action={
            <Button variant="primary" leftIcon={<FolderOpen size={15} />} onClick={open}>
              {t("organizer.pickFolder")}
            </Button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!preview && !applied && (
            <div className="row">
              <Button variant="primary" leftIcon={<FolderTree size={15} />} onClick={() => run(true)} disabled={busy}>
                {t("organizer.preview")}
              </Button>
            </div>
          )}
          {(preview ?? applied)?.length === 0 && (
            <EmptyState icon={<FolderTree size={24} />} title={t("organizer.none")} description={t("organizer.noneDesc")} />
          )}
          {(preview ?? applied ?? []).map((r, i) => (
            <div key={i} className="fk-list__item" style={{ border: "1px solid var(--border-soft)", borderRadius: "var(--radius)" }}>
              <span className="mono-value" style={{ fontSize: 12, color: r.ok ? "var(--text)" : "var(--danger)" }}>
                {r.from}
              </span>
              <span style={{ color: "var(--text-tertiary)" }}>→</span>
              <span className="mono-value" style={{ fontSize: 12, color: r.ok ? "var(--success)" : "var(--danger)" }}>
                {r.to}
              </span>
              {!r.ok && r.error && <span style={{ fontSize: 12, color: "var(--danger)" }}>({r.error})</span>}
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
