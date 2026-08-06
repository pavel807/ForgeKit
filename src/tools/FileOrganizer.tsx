import { useState } from "react";
import { FolderOpen, FolderTree, Move } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState, Select } from "../components/ui";
import { api, pickDirectory, type OrganizeResult } from "../core/api";

export default function FileOrganizer() {
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
            Выбрать папку
          </Button>
          <Button variant="primary" leftIcon={<Move size={15} />} onClick={() => run(false)} disabled={busy || !preview || preview.length === 0}>
            Переместить файлы
          </Button>
        </>
      }
      toolbar={
        <Select
          label=""
          options={[
            { value: "type", label: "По типу файла" },
            { value: "ext", label: "По расширению" },
          ]}
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        />
      }
      statusLeft={dir ? <span className="mono-value" style={{ fontSize: 11.5 }}>{dir}</span> : <span>Папка не выбрана</span>}
      statusRight={
        preview || applied ? (
          <span>
            Перемещений: {okCount}
            {errCount > 0 ? ` · ошибок: ${errCount}` : ""}
          </span>
        ) : undefined
      }
    >
      {!dir ? (
        <EmptyState
          icon={<FolderTree size={24} />}
          title="Организация файлов"
          description="ForgeKit разложит файлы по папкам по типу или расширению. Сначала покажет предпросмотр перемещений"
          action={
            <Button variant="primary" leftIcon={<FolderOpen size={15} />} onClick={open}>
              Выбрать папку
            </Button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!preview && !applied && (
            <div className="row">
              <Button variant="primary" leftIcon={<FolderTree size={15} />} onClick={() => run(true)} disabled={busy}>
                Показать предпросмотр
              </Button>
            </div>
          )}
          {(preview ?? applied)?.length === 0 && (
            <EmptyState icon={<FolderTree size={24} />} title="Перемещать нечего" description="Все файлы уже упорядочены" />
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
