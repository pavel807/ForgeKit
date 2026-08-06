import { Download, Maximize2, Minus, Puzzle, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "../../core/api";
import { useRouter } from "../../core/Router";
import { cn } from "@/lib/utils";

const winBtn = cn(
  "grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-150",
  "hover:bg-accent hover:text-accent-foreground",
);

export function WindowControls() {
  if (!isTauri()) return null;
  return (
    <div className="flex shrink-0 items-center gap-1" aria-label="Управление окном">
      <button type="button" className={winBtn} title="Свернуть" onClick={() => getCurrentWindow().minimize()}>
        <Minus size={15} />
      </button>
      <button type="button" className={winBtn} title="Развернуть / восстановить" onClick={() => getCurrentWindow().toggleMaximize()}>
        <Maximize2 size={14} />
      </button>
      <button
        type="button"
        className={cn(winBtn, "hover:bg-destructive/10 hover:text-destructive")}
        title="Закрыть"
        onClick={() => getCurrentWindow().close()}
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface TopBarProps {
  onOpenSearch: () => void;
  updateLatest?: string | null;
}

export function TopBar({ onOpenSearch, updateLatest }: TopBarProps) {
  const { navigate } = useRouter();

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <div className="flex shrink-0 items-center gap-1 pl-1">
        <button
          onClick={() => navigate("plugins")}
          title="Плагины"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
        >
          <Puzzle size={16} />
        </button>
        <button
          onClick={() => navigate("settings")}
          title="Настройки"
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        {updateLatest ? (
          <button
            onClick={() => navigate("about")}
            title={`Доступна версия ${updateLatest}`}
            className="relative grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
          >
            <Download size={16} />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--danger)]" />
          </button>
        ) : null}
      </div>

      <div data-tauri-drag-region className="flex h-full flex-1 items-center justify-center">
        <button
          onClick={onOpenSearch}
          className="group flex h-9 w-full max-w-md cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:bg-muted/70 hover:text-foreground"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="flex-1 text-left">Поиск инструментов…</span>
          <kbd className="flex items-center gap-0.5 font-mono text-[11px] text-muted-foreground">
            <span className="rounded-[5px] border border-border bg-background px-1.5 py-0.5 shadow-xs">⌘</span>
            <span className="rounded-[5px] border border-border bg-background px-1.5 py-0.5 shadow-xs">K</span>
          </kbd>
        </button>
      </div>

      <WindowControls />
    </header>
  );
}