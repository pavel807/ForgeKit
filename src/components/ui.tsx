import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Check, ChevronDown, Copy, Search, Star } from "lucide-react";
import { useState } from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { Button as ShadcnButton } from "./ui/button";
import { Input as ShadcnInput } from "./ui/input";
import { Textarea as ShadcnTextarea } from "./ui/textarea";
import { Badge as ShadcnBadge } from "./ui/badge";
import {
  Dialog as ShadcnDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

/* ---------- Кнопка ---------- */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "md" | "sm";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  leftIcon?: ReactNode;
}

const variantMap = { primary: "default", secondary: "secondary", ghost: "ghost", danger: "destructive" } as const;

export function Button({ variant = "secondary", size = "md", leftIcon, className = "", children, ...rest }: BtnProps) {
  return (
    <ShadcnButton
      variant={variantMap[variant]}
      size={size === "sm" ? "sm" : "default"}
      className={className}
      {...rest}
    >
      {leftIcon}
      {children}
    </ShadcnButton>
  );
}

/* ---------- Синяя звёздочка официального плагина (как verified в Telegram) ---------- */
export function OfficialStar({ size = 11 }: { size?: number }) {
  return (
    <Star
      size={size}
      aria-label=""
      className="shrink-0 text-primary"
      fill="currentColor"
      strokeWidth={0}
    />
  );
}

/* ---------- Кнопка-иконка ---------- */
interface IconBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "secondary" | "danger" | "active";
  size?: "md" | "sm";
  tooltip?: string;
}

export function IconButton({ variant = "ghost", size = "md", tooltip, className = "", children, ...rest }: IconBtnProps) {
  const btn = (
    <ShadcnButton
      variant="ghost"
      size={size === "sm" ? "icon-sm" : "icon"}
      className={[
        variant === "danger" ? "text-destructive hover:text-destructive hover:bg-destructive/10" : "",
        variant === "active" ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </ShadcnButton>
  );
  if (!tooltip) return btn;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ---------- Поле ввода ---------- */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <ShadcnInput className={className} {...rest} />
    </div>
  );
}

/* ---------- Многострочное поле ---------- */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...rest }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <ShadcnTextarea className={className} {...rest} />
    </div>
  );
}

/* ---------- Выпадающий список ---------- */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <div className="relative inline-flex">
        <select
          className={`h-9 w-full cursor-pointer appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-xs transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

/* ---------- Поле поиска ---------- */
export function SearchInput({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <ShadcnInput className="pl-9" {...rest} />
    </div>
  );
}

/* ---------- Чекбокс ---------- */
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label className="group flex cursor-pointer select-none items-center gap-2 text-sm" style={disabled ? { opacity: 0.5 } : undefined}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="grid size-4.5 place-items-center rounded-[5px] border border-input bg-background shadow-xs transition-colors peer-checked:border-primary peer-checked:bg-primary group-has-[input:focus-visible]:ring-[3px] group-has-[input:focus-visible]:ring-ring/50">
        <Check size={12} strokeWidth={3} className="text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
      <span className="text-muted-foreground transition-colors group-has-[:checked]:text-foreground">{label}</span>
    </label>
  );
}

/* ---------- Переключатель ---------- */
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
}

export function Switch({ checked, onChange, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-input bg-muted transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "border-primary bg-primary" : ""
      }`}
    >
      <span
        className={`pointer-events-none block size-4.5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[19px]" : "translate-x-[3px]"}`}
      />
    </button>
  );
}

/* ---------- Бейдж ---------- */
export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "success" | "danger" }) {
  const toneCls =
    tone === "success"
      ? "border-[var(--success-soft)] bg-[var(--success-soft)] text-[var(--success)]"
      : tone === "danger"
        ? "border-[var(--danger-soft)] bg-[var(--danger-soft)] text-[var(--danger)]"
        : tone === "accent"
          ? "border-transparent bg-primary/10 text-primary"
          : "";
  return <ShadcnBadge className={toneCls}>{children}</ShadcnBadge>;
}

/* ---------- Клавиша ---------- */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-border bg-muted/60 px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

/* ---------- Прогресс-бар ---------- */
export function Progress({ value, tone = "accent" }: { value: number; tone?: "accent" | "success" | "warning" | "danger" }) {
  const v = Math.max(0, Math.min(100, value));
  const color =
    tone === "success" ? "var(--success)" : tone === "warning" ? "var(--warning)" : tone === "danger" ? "var(--danger)" : "var(--primary)";
  return (
    <ProgressPrimitive.Root className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 rounded-full transition-transform"
        style={{ transform: `translateX(-${100 - v}%)`, background: color }}
      />
    </ProgressPrimitive.Root>
  );
}

/* ---------- Сегментированный контрол ---------- */
interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  items: { value: T; label: ReactNode }[];
}

export function SegmentedControl<T extends string>({ value, onChange, items }: SegmentedProps<T>) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
      {items.map((it) => (
        <button
          key={it.value}
          className={`rounded-[7px] px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
            it.value === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Кнопка «Скопировать» ---------- */
import { t } from "../core/i18n";

export function CopyButton({ text, size = "md", label, disabled }: { text: string; size?: "md" | "sm"; label?: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (disabled || !text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const { api } = await import("../core/api");
      await api.clipboardWrite(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  if (label) {
    return (
      <Button size={size} leftIcon={copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />} onClick={copy} disabled={disabled}>
        {copied ? t("common.copied") : label}
      </Button>
    );
  }
  return (
    <IconButton size={size} onClick={copy} disabled={disabled} tooltip={copied ? t("common.copied") : t("common.copy")}>
      {copied ? <Check size={15} className="text-[var(--success)]" /> : <Copy size={15} />}
    </IconButton>
  );
}

/* ---------- Диалог ---------- */
interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export function Dialog({ open, title, children, onClose, footer }: DialogProps) {
  return (
    <ShadcnDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>{children}</DialogDescription>
        </DialogHeader>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </ShadcnDialog>
  );
}

/* ---------- Пустое состояние ---------- */
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-8 py-12 text-center">
      <div className="relative">
        <div className="absolute -inset-3 rounded-full bg-primary/10 blur-xl" />
        <div className="relative grid size-12 place-items-center rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-background to-background text-primary shadow-sm">
          <div className="absolute inset-x-3 top-2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          {icon}
        </div>
      </div>
      <h3 className="mt-2 text-sm font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------- Статус-бар ---------- */
export function StatusBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <footer className="flex h-9 shrink-0 items-center justify-between gap-4 border-t border-border bg-muted/25 px-4 text-xs text-muted-foreground">
      <div className="flex min-w-0 items-center gap-3">{left ?? <span>Готово</span>}</div>
      <div className="flex items-center gap-3">{right}</div>
    </footer>
  );
}
