import { useMemo, useState } from "react";
import { FolderOpen, ListChecks, PenLine } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickDirectory, type FileEntry, type RenameResult } from "../core/api";
import { formatBytes } from "../core/format";
import { useI18n } from "../core/i18n";

interface Row {
  path: string;
  name: string;
  newName: string;
}

export default function BulkRename() {
  const { t } = useI18n();
  const [dir, setDir] = useState<string | null>(null);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [pattern, setPattern] = useState("");
  const [applyResult, setApplyResult] = useState<RenameResult[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function open(showDialog = true) {
    const d = showDialog ? await pickDirectory() : dir;
    if (!d) return;
    setDir(d);
    const list = await api.filesScan(d, false).catch(() => []);
    const onlyFiles = list.filter((f) => !f.is_dir);
    setFiles(onlyFiles);
    setRows(onlyFiles.map((f) => ({ path: f.path, name: f.name, newName: f.name })));
    if (showDialog) setApplyResult(null);
  }

  /* Применение шаблона вида: photo_{n}.jpg */
  function applyPattern() {
    const trimmed = pattern.trim();
    if (!trimmed.includes("{n}")) return;
    setRows((prev) =>
      prev.map((r, i) => {
        const [, ext] = splitExt(r.name);
        const newName = trimmed.replace("{n}", String(i + 1).padStart(3, "0")) + (trimmed.toLowerCase().endsWith(".jpg") ? "" : ext);
        return { ...r, newName };
      }),
    );
  }

  function splitExt(name: string): [string, string] {
    const idx = name.lastIndexOf(".");
    return idx > 0 ? [name.slice(0, idx), name.slice(idx)] : [name, ""];
  }

  const validCount = useMemo(() => rows.filter((r) => r.newName.trim() && r.newName !== r.name).length, [rows]);

  async function apply() {
    if (!dir) return;
    setBusy(true);
    const ops = rows.filter((r) => r.newName.trim() && r.newName !== r.name).map((r) => {
      const dirPath = r.path.slice(0, r.path.lastIndexOf("/") + 1);
      return { from: r.path, to: `${dirPath}${r.newName.trim()}` };
    });
    const result = await api.filesRename(ops).catch((e) => [{ ok: false, from: "", to: "", error: String(e) } as RenameResult]);
    setApplyResult(result);
    await open(false);
    setBusy(false);
  }

  return (
    <ToolPage
      id="bulk-rename"
      actions={
        <Button variant="primary" leftIcon={<PenLine size={15} />} onClick={apply} disabled={busy || validCount === 0}>
          {t("bulk.rename", { n: validCount })}
        </Button>
      }
      toolbar={
        <>
          <input
            className="fk-input mono-value"
            placeholder={t("bulk.patternPlaceholder")}
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            style={{ width: 260 }}
          />
          <Button onClick={applyPattern} disabled={!pattern.includes("{n}")}>
            {t("bulk.applyPattern")}
          </Button>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{t("bulk.patternNote")}</span>
        </>
      }
      statusLeft={dir ? <span className="mono-value" style={{ fontSize: 11.5 }}>{dir}</span> : <span>{t("bulk.noFolder")}</span>}
      statusRight={<span>{t("bulk.stats", { files: files.length, renamed: validCount })}</span>}
    >
      {applyResult && (
        <div style={{ marginBottom: 14, padding: 12, border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", background: "var(--bg-subtle)" }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t("bulk.resultTitle")}</div>
          {applyResult.map((r, i) => (
            <div key={i} style={{ fontSize: 12.5, color: r.ok ? "var(--success)" : "var(--danger)", userSelect: "text" }}>
              {r.ok ? "OK" : t("common.error")}: {r.from} → {r.to} {r.error ? `(${r.error})` : ""}
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={24} />}
          title={t("bulk.emptyTitle")}
          description={t("bulk.emptyDesc")}
          action={
            <Button variant="primary" leftIcon={<FolderOpen size={15} />} onClick={() => open()}>
              {t("bulk.pickFolder")}
            </Button>
          }
        />
      ) : (
        <div className="fk-panel" style={{ overflow: "hidden" }}>
          <div className="fk-table" role="table">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
              <span>{t("bulk.currentName")}</span>
              <span>{t("bulk.newName")}</span>
              <span style={{ textAlign: "right" }}>{t("bulk.size")}</span>
            </div>
            <div>
              {rows.map((r, i) => (
                <div key={r.path} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 90px", alignItems: "center", gap: 12, padding: "6px 14px", borderBottom: "1px solid var(--border-soft)" }}>
                  <span className="mono-value" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  <input
                    className="fk-input fk-input--sm mono-value"
                    value={r.newName}
                    onChange={(e) => setRows((prev) => prev.map((x, j) => (j === i ? { ...x, newName: e.target.value } : x)))}
                  />
                  <span style={{ textAlign: "right", fontSize: 12, color: "var(--text-secondary)" }}>{formatBytes(files[i]?.size ?? 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
