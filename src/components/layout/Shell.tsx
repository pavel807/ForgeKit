import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RouterProvider, useRouter } from "../../core/Router";
import { getCategory, getTool } from "../../core/registry";
import { isTauri } from "../../core/api";
import { checkForUpdates, type UpdateCheck } from "../../core/updater";
import { ModulesProvider, useModules } from "../../core/modules";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { GlobalSearch } from "./GlobalSearch";
import { OnboardingTour } from "./OnboardingTour";
import { CategoryPage } from "./CategoryPage";
import { TooltipProvider } from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";
import { I18nProvider, useI18n } from "../../core/i18n";
import { isFirstDay, isTourDone, markTourDone } from "../../core/firstRun";
import { Puzzle, PlugZap } from "lucide-react";
import { Button } from "../ui";

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
  const { isEnabled } = useModules();
  const tool = getTool(current);
  const category = getCategory(current);
  /* Категория рендерится как страница, если id не совпадает ни с одним инструментом */
  const isCategory = !!category && tool.id !== current;
  const isDisabled = !isCategory && !isEnabled(current);

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

  /* Интерактивный инструктаж при первом запуске */
  const [tourOpen, setTourOpen] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [firstDay, done] = await Promise.all([isFirstDay(), isTourDone()]);
      if (!cancelled && firstDay && !done) setTourOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Повторный показ инструктажа из настроек */
  useEffect(() => {
    const onShow = () => setTourOpen(true);
    window.addEventListener("forgekit-open-tour", onShow);
    return () => window.removeEventListener("forgekit-open-tour", onShow);
  }, []);

  const finishTour = () => {
    setTourOpen(false);
    void markTourDone();
  };

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
                {isCategory ? (
                  <CategoryPage key={current} id={current} />
                ) : isDisabled ? (
                  <DisabledPage key={current} />
                ) : (
                  <tool.component key={current} />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <OnboardingTour open={tourOpen} onFinish={finishTour} />
    </div>
  );
}

export function Shell() {
  return (
    <I18nProvider>
      <TooltipProvider delayDuration={250}>
        <ModulesProvider>
          <RouterProvider>
            <Body />
          </RouterProvider>
        </ModulesProvider>
      </TooltipProvider>
    </I18nProvider>
  );
}

/** Страница выключенного модуля: подсказка включить его в «Расширениях» */
function DisabledPage() {
  const { navigate } = useRouter();
  const { t } = useI18n();
  return (
    <div className="grid h-full place-items-center">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <span className="grid size-14 place-items-center rounded-2xl border border-border bg-muted/50 text-muted-foreground">
          <PlugZap size={24} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-semibold">{t("mod.disabledTitle")}</p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{t("mod.disabledDesc")}</p>
        </div>
        <Button variant="primary" leftIcon={<Puzzle size={15} />} onClick={() => navigate("plugins")}>
          {t("mod.openManager")}
        </Button>
      </div>
    </div>
  );
}