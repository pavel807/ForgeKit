import { useState } from "react";
import { FolderOpen, Files, Search } from "lucide-react";
import { ToolPage } from "../components/layout/ToolPage";
import { Button, EmptyState } from "../components/ui";
import { api, pickDirectory, type DuplicateGroup } from "../core/api";
import { formatBytes } from "../core/format";

export default function DuplicateFinder() {
  const [dir, setDir] = useState<string | null>(null);
  const [groups, setGroups] = useState<DuplicateGroup[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    const d = await pickDirectory();
    if (!d) return;
    setDir(d);
    setScanning(true);
    setError(null);
    try {
      const result = await api.filesFindDuplicates(d);
      setGroups(result);
    } catch (e) {
      setError(String(e));
      setGroups([]);
    }
    setScanning(false);
  }

  const duplicateFiles = groups.reduce((acc, g) => acc + g.items.length, 0);
  const wastedSpace = groups.reduce((acc, g) => acc + g.size * (g.items.length - 1), 0);

  return (
    <ToolPage
      id="duplicate-finder"
      actions={
        <Button variant="primary" leftIcon={<Search size={15} />} onClick={scan} disabled={scanning}>
          {scanning ? "Сканирование…" : "Сканировать папку"}
        </Button>
      }
      statusLeft={
        dir ? (
          <span className="mono-value" style={{ fontSize: 11.5 }}>
            {dir}
          </span>
        ) : (
          <span>Папка не выбрана</span>
        )
      }
      statusRight={
        groups.length > 0 ? (
          <span>
            Дубликатов: {duplicateFiles} · можно освободить {formatBytes(wastedSpace)}
          </span>
        ) : undefined
      }
    >
      {error && <div className="error-text" style={{ marginBottom: 14 }}>{error}</div>}

      {groups.length === 0 && !scanning ? (
        <EmptyState
          icon={<Files size={24} />}
          title="Поиск дубликатов"
          description="Выберите папку, и ForgeKit найдёт повторяющиеся файлы, сравнив их содержимое по хэшу"
          action={
            <Button variant="primary" leftIcon={<FolderOpen size={15} />} onClick={scan}>
              Выбрать папку
            </Button>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {groups.slice(0, 50).map((g, i) => (
            <div className="fk-panel" key={i}>
              <div className="fk-panel__header">
                Группа {i + 1} · {g.items.length} файла · {formatBytes(g.size)} каждый
              </div>
              <div>
                {g.items.map((f) => (
                  <div key={f.path} className="fk-list__item" style={{ borderBottom: "1px solid var(--border-soft)", borderRadius: 0 }}>
                    <span className="mono-value" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {f.path}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {groups.length > 50 && (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
              Показаны первые 50 групп из {groups.length}
            </div>
          )}
        </div>
      )}
    </ToolPage>
  );
}
