import { CATEGORIES, getTool } from "../../core/registry";
import { useRouter } from "../../core/Router";
import { ForgeMark } from "../ui/art";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { current, navigate } = useRouter();

  return (
    <nav className="flex w-[248px] shrink-0 flex-col border-r border-border bg-background">
      <div data-tauri-drag-region className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4">
        <ForgeMark size={26} />
        <span className="text-[15px] font-semibold tracking-tight">ForgeKit</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = current === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(cat.id)}
                className={cn(
                  "group flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-[var(--text-secondary)] hover:bg-accent hover:text-foreground",
                )}
                title={cat.name}
              >
                <Icon size={16} strokeWidth={2} />
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Система
          </div>
          <div className="flex flex-col gap-0.5 mb-2">
            {["plugins", "settings"].map((id) => {
              const tool = getTool(id);
              const Icon = tool.icon;
              const active = current === id;
              return (
                <button
                  key={id}
                  onClick={() => navigate(id)}
                  className={cn(
                    "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-[13px] font-medium transition-all duration-150",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-[var(--text-secondary)] hover:bg-accent hover:text-foreground",
                  )}
                  title={tool.description}
                >
                  <Icon size={16} strokeWidth={2} />
                  <span className="truncate">{tool.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="rounded-xl border border-border bg-muted/40 p-3.5">
          <p className="text-[13px] font-semibold">ForgeKit 1.4.2</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-tertiary)]">
            40+ инструментов в одном приложении
          </p>
        </div>
      </div>
    </nav>
  );
}