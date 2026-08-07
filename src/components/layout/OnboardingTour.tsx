import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ClipboardList,
  Compass,
  Keyboard,
  Palette,
  Puzzle,
  Search,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Kbd } from "../ui";
import { ForgeMark } from "../ui/art";
import { useI18n, type Keys } from "../../core/i18n";

interface TourStep {
  icon: LucideIcon;
  title: Keys;
  text: Keys;
  target?: string;
}

const STEPS: TourStep[] = [
  { icon: Compass, title: "tour.0.title", text: "tour.0.text" },
  { icon: Compass, title: "tour.1.title", text: "tour.1.text", target: "sidebar" },
  { icon: Search, title: "tour.2.title", text: "tour.2.text", target: "search" },
  { icon: Puzzle, title: "tour.3.title", text: "tour.3.text", target: "top-actions" },
  { icon: ClipboardList, title: "tour.4.title", text: "tour.4.text", target: "clipboard" },
  { icon: Keyboard, title: "tour.5.title", text: "tour.5.text" },
  { icon: Palette, title: "tour.6.title", text: "tour.6.text", target: "top-actions" },
  { icon: Sparkles, title: "tour.7.title", text: "tour.7.text" },
];

const TOOLTIP_WIDTH = 340;
const TOOLTIP_EST_HEIGHT = 168;
const GAP = 14;

interface OnboardingTourProps {
  open: boolean;
  onFinish: () => void;
}

interface CardPos {
  left: number;
  top: number;
  placement: "below" | "above" | "center";
}

export function OnboardingTour({ open, onFinish }: OnboardingTourProps) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [card, setCard] = useState<CardPos | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;

  /* Измерение целевого элемента и пересчёт карточки */
  useEffect(() => {
    if (!open) return;
    const target = step.target ? document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`) : null;
    const measure = () => setRect(target ? target.getBoundingClientRect() : null);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, index, step.target]);

  /* Позиционирование карточки с учётом фактических размеров */
  useLayoutEffect(() => {
    if (!open) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!rect) {
      setCard({ left: (vw - TOOLTIP_WIDTH) / 2, top: (vh - TOOLTIP_EST_HEIGHT) / 2, placement: "center" });
      return;
    }

    const node = cardRef.current;
    const h = node ? node.offsetHeight : TOOLTIP_EST_HEIGHT;
    const left = Math.min(Math.max(rect.left, 12), Math.max(12, vw - TOOLTIP_WIDTH - 12));

    const below = rect.bottom + GAP;
    if (below + h <= vh - 12) {
      setCard({ left, top: below, placement: "below" });
      return;
    }
    const above = rect.top - GAP - h;
    if (above >= 12) {
      setCard({ left, top: above, placement: "above" });
      return;
    }
    setCard({ left, top: Math.max(12, (vh - h) / 2), placement: "center" });
  }, [open, rect, index]);

  /* Escape — пропустить тур */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFinish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onFinish]);

  if (!open) return null;

  const next = () => setIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={step.title}>
      <div className="absolute inset-0 bg-black/45" />

      {rect && (
        <div
          className="pointer-events-none fixed z-[110] rounded-xl transition-all duration-200"
          style={{
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: "0 0 0 2px var(--fk-accent), 0 0 24px 4px rgba(0,162,255,0.35)",
          }}
        />
      )}

      {card && (
        <div
          ref={cardRef}
          className={cn(
            "fixed z-[120] w-[340px] max-w-[calc(100vw-24px)] rounded-2xl border border-border bg-popover p-5 shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            card.placement === "center" && "top-1/2 -translate-y-1/2",
          )}
          style={card.placement === "center" ? undefined : { left: card.left, top: card.top }}
        >
          {!isFirst && (
            <button
              type="button"
              onClick={onFinish}
              title="Пропустить"
              className="absolute right-3 top-3 grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X size={15} />
            </button>
          )}

          <div className="flex items-start gap-3">
            {isFirst ? (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <ForgeMark size={24} />
              </span>
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} />
              </span>
            )}
            <div className="min-w-0">
              <div className="text-[15px] font-semibold leading-tight text-popover-foreground">{t(step.title)}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{t(step.text)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn("size-1.5 rounded-full transition-colors", i === index ? "bg-[var(--fk-accent)]" : "bg-border")}
                />
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={prev} disabled={isFirst}>
                {t("tour.back")}
              </Button>
              <Button variant="primary" size="sm" onClick={isLast ? onFinish : next}>
                {isLast ? t("tour.start") : t("tour.next")}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Kbd>Esc</Kbd>
            <span>{t("tour.skipHint")}</span>
          </div>
        </div>
      )}
    </div>
  );
}