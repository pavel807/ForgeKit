import type { LucideIcon } from "lucide-react";

/** Иконка заголовка страницы: градиентная подложка с бликом */
export function HeaderIcon({ icon: Icon, className = "" }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={`relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent text-primary shadow-xs ${className}`}>
      <div className="absolute inset-x-2 top-1.5 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <Icon size={20} strokeWidth={2} className="relative" />
    </div>
  );
}