import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Command, Search } from "lucide-react";
import { TOOLS, getTool } from "../../core/registry";
import { useRouter } from "../../core/Router";
import { useI18n } from "../../core/i18n";
import { fuzzySearch } from "../../core/search";
import { isTauri } from "../../core/api";
import { cn } from "@/lib/utils";
import { Kbd } from "../ui";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { navigate } = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchableTools = useMemo(
    () => TOOLS.map((t2) => ({ id: t2.id, name: t(t2.name), description: t(t2.description), keywords: t2.keywords, category: t2.category, categoryName: t(t2.categoryName) })),
    [t],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => fuzzySearch(query, searchableTools, 12), [query]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  const openTool = useCallback(
    (id: string) => {
      navigate(id);
      onClose();
    },
    [navigate, onClose],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden rounded-[16px] bg-black/30 pt-[14vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[600px] max-w-[90vw] overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Search size={17} className="shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            className="h-full flex-1 bg-transparent text-[15px] text-popover-foreground outline-none placeholder:text-muted-foreground"
            placeholder={t("app.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              }
              if (e.key === "Enter" && results[index]) openTool(results[index].item.id);
            }}
          />
        </div>

        <div className="max-h-[380px] overflow-y-auto p-1.5">
          {results.length === 0 && query ? (
            <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" className="text-muted-foreground" aria-hidden>
                <circle cx="21" cy="21" r="13" stroke="currentColor" strokeWidth="2" strokeDasharray="3.5 3.5" opacity="0.7" />
                <path d="M31 31 42 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M21 15.5v11M15.5 21h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
              </svg>
              <div className="text-sm font-medium text-popover-foreground">{t("search.noResults")}</div>
              <div className="text-[13px] text-muted-foreground">{t("search.noResultsFor", { q: query })}</div>
            </div>
          ) : (
            results.map((r, i) => {
              const tool = getTool(r.item.id);
              const Icon = tool.icon;
              const active = i === index;
              return (
                <button
                  key={r.item.id}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                    active ? "bg-accent text-accent-foreground" : "text-popover-foreground",
                  )}
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => openTool(r.item.id)}
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-md border",
                      active ? "border-transparent bg-background" : "border-border bg-muted/50",
                    )}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{r.item.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.item.description}</span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            {t("search.navigate")}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Enter</Kbd>
            {t("search.open")}
          </span>
          {isTauri() && (
            <span className="ml-auto flex items-center gap-1.5">
              <Command size={11} />
              Ctrl + Space
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd>
            {t("search.close")}
          </span>
        </div>
      </div>
    </div>
  );
}