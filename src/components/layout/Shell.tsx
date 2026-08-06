import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RouterProvider, useRouter } from "../../core/Router";
import { getCategory, getTool } from "../../core/registry";
import { isTauri } from "../../core/api";
import { checkForUpdates, type UpdateCheck } from "../../core/updater";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { GlobalSearch } from "./GlobalSearch";
import { CategoryPage } from "./CategoryPage";
import { TooltipProvider } from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";

function ToolSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border bg-background px-8 py-5">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3.5 w-72 max-w-full" />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function Body() {
  const { current } = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const tool = getTool(current);
  const category = getCategory(current);
  /* Категория рендерится как страница, если id не совпадает ни с одним инструментом */
  const isCategory = !!category && tool.id !== current;

  /* Ctrl/Cmd + K — локальный вызов поиска */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Глобальный вызов поиска из Rust (Ctrl + Space) */
  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;
    void import("@tauri-apps/api/event").then(({ listen }) =>
      listen("show-search", () => setSearchOpen(true)).then((fn) => (unlisten = fn)),
    );
    return () => unlisten?.();
  }, []);

  /* Автоматическая проверка обновлений при запуске */
  const [updateCheck, setUpdateCheck] = useState<UpdateCheck | null>(null);
  useEffect(() => {
    if (!isTauri()) return;
    checkForUpdates().then(setUpdateCheck);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[16px] bg-background">
      <TopBar onOpenSearch={() => setSearchOpen(true)} updateLatest={updateCheck?.status === "update" ? updateCheck.latest : null} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="relative flex min-w-0 flex-1 flex-col bg-muted/30">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="flex min-h-0 min-w-0 flex-1 flex-col"
            >
              <Suspense fallback={<ToolSkeleton />}>
                {isCategory ? <CategoryPage key={current} id={current} /> : <tool.component key={current} />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export function Shell() {
  return (
    <TooltipProvider delayDuration={250}>
      <RouterProvider>
        <Body />
      </RouterProvider>
    </TooltipProvider>
  );
}