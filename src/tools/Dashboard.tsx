import { useEffect, useState } from "react";
import { ArrowRight, ClipboardList } from "lucide-react";
import { FEATURED_TOOLS } from "../core/registry";
import { useRouter } from "../core/Router";
import { api, isTauri, type ClipboardItem } from "../core/api";
import { formatRelativeTime } from "../core/format";
import { isFirstDay } from "../core/firstRun";
import { useI18n } from "../core/i18n";
import { Button } from "../components/ui";
import { ToolCard } from "../components/layout/ToolCard";
import { HeroArt } from "../components/ui/art";

function QuickActions() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
      {FEATURED_TOOLS.map((id) => (
        <ToolCard key={id} id={id} />
      ))}
    </div>
  );
}

function RecentClipboard() {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const { navigate } = useRouter();
  const { t, lang } = useI18n();

  useEffect(() => {
    if (!isTauri()) return;
    const fetchItems = () => api.clipboardList("all", "").then((list) => setItems(list.slice(0, 5))).catch(() => {});
    fetchItems();
    const interval = window.setInterval(fetchItems, 3000);
    return () => window.clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("dash.recentClipboard")}</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate("clipboard")}>
          {t("dash.allRecords")}
          <ArrowRight size={13} />
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => navigate("clipboard")}
            className="flex w-full cursor-pointer items-center gap-3.5 border-b border-border px-4 py-3 text-left transition-colors duration-150 last:border-b-0 hover:bg-muted/50"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
              <ClipboardList size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{it.preview || t("kind.image")}</span>
              <span className="block text-xs text-muted-foreground">{formatRelativeTime(it.created_at, lang)}</span>
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {it.kind === "image" ? t("kind.image") : it.kind === "link" ? t("kind.link") : t("kind.text")}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [firstDay, setFirstDay] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    isFirstDay().then((d) => !cancelled && setFirstDay(d));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[1100px] px-8 py-12">
        <div className="flex items-start justify-between gap-8">
          <div className="min-w-0 pt-2">
            <h1 className="text-3xl font-semibold tracking-tight">{firstDay ? t("dash.welcomeFirst") : t("dash.welcomeBack")}</h1>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              {firstDay ? t("dash.subFirst") : t("dash.subBack")}
            </p>
          </div>
          <HeroArt className="hidden xl:block" />
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{t("dash.quickActions")}</h2>
          <QuickActions />
        </section>

        <RecentClipboard />
      </div>
    </div>
  );
}