import type { ReactNode } from "react";
import { useId } from "react";
import { Braces, ClipboardCheck, ImageDown, KeyRound, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/* Бренд-марка ForgeKit — точная векторная копия src/assets/icon.svg
   (эталонная иконка, не изменять) */
export function ForgeMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1080 1080"
      className={cn("forge-mark shrink-0", className)}
      aria-hidden
    >
      <defs>
        <filter id="fk-mark-shadow" x="0" y="0" width="1080" height="1080" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="16" />
          <feOffset dx="0" dy="6" result="offsetblur" />
          <feFlood floodColor="#000000" floodOpacity="0.07" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path fill="#ffffff" stroke="none" filter="url(#fk-mark-shadow)" d="M 205 30 L 875 30 C 971.649841 30 1050 108.350159 1050 205 L 1050 875 C 1050 971.649841 971.649841 1050 875 1050 L 205 1050 C 108.350166 1050 30 971.649841 30 875 L 30 205 C 30 108.350159 108.350166 30 205 30 Z" />
      <path fill="#00a2ff" stroke="none" d="M 324 292.921753 C 339.034821 254.973938 379.127686 236 429.243744 236 L 704.882141 236 C 739.96344 236 760.009827 254.973938 754.99823 283.434814 L 744.975037 330.869629 C 739.96344 359.330505 714.905396 378.304443 679.824097 378.304443 L 469.336609 378.304443 C 434.255371 378.304443 409.197327 397.278381 389.150909 430.482788 L 354.069641 501.63501 C 344.046417 523.455017 327.006958 523.455017 324 501.63501 Z" />
      <path fill="#000000" stroke="none" d="M 324 496.921753 C 335.212738 458.973938 365.113342 440 402.489136 440 L 608.055908 440 C 634.218933 440 649.16925 458.973938 645.431641 487.434814 L 637.956482 534.869629 C 634.218933 563.330505 615.531006 582.304443 589.367981 582.304443 L 432.38974 582.304443 C 406.226715 582.304443 387.538818 601.278381 372.588501 634.482788 L 346.425476 705.63501 C 338.950317 727.455017 326.242554 727.455017 324 705.63501 Z" />
      <text x="194" y="840" fontFamily="Arial Black, Arial" fontSize="148" fontWeight="800" fill="#1a2332" letterSpacing="-3">
        Forge
      </text>
      <text x="699" y="840" fontFamily="Arial Black, Arial" fontSize="148" fontWeight="800" fill="#000000" letterSpacing="-3">
        Kit
      </text>
      <text x="206.25293" y="920" fontFamily="Arial, sans-serif" fontSize="44" fontWeight="700" fill="#1a2332" letterSpacing="10">
        ONE APP. ALL TOOLS.
      </text>
    </svg>
  );
}

interface FloatChipProps {
  className?: string;
  children: ReactNode;
  delay?: number;
}

function FloatChip({ className, children, delay = 0 }: FloatChipProps) {
  return (
    <div
      className={cn(
        "absolute grid place-items-center rounded-xl border border-border bg-background/90 text-foreground shadow-lg backdrop-blur",
        className,
      )}
      style={{ animation: `forge-float 6s ease-in-out ${delay}ms infinite` }}
    >
      {children}
    </div>
  );
}

/* Декоративная иллюстрация «мастерской инструментов» — для Dashboard */
export function HeroArt({ className }: { className?: string }) {
  const id = useId();
  return (
    <div className={cn("relative h-44 w-72 shrink-0 select-none", className)} aria-hidden>
      <div className="absolute -top-6 right-0 size-44 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 left-6 size-36 rounded-full bg-amber-400/10 blur-2xl" />

      <svg viewBox="0 0 288 176" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`${id}w`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <path d="M-20 140 Q90 90 200 128 T320 120" stroke={`url(#${id}w)`} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />
        <circle cx="30" cy="44" r="5" fill="var(--primary)" opacity="0.4" />
        <circle cx="262" cy="30" r="4" fill="#fbbf24" opacity="0.6" />
        <path d="M232 96 234.5 103 241.5 105.5 234.5 108 232 115 229.5 108 222.5 105.5 229.5 103 Z" fill="#fbbf24" opacity="0.85" />
        <circle cx="70" cy="122" r="2.5" fill="var(--primary)" opacity="0.5" />
        <rect x="108" y="96" width="88" height="5" rx="2.5" fill="var(--border)" opacity="0.9" />
        <rect x="108" y="112" width="56" height="5" rx="2.5" fill="var(--border)" opacity="0.55" />
      </svg>

      <FloatChip className="left-2 top-2 size-10 text-primary" delay={0}>
        <Zap size={18} />
      </FloatChip>
      <FloatChip className="left-[92px] top-9 size-11 bg-primary/10 text-primary" delay={900}>
        <Braces size={20} />
      </FloatChip>
      <FloatChip className="right-1 top-12 size-10 text-amber-500" delay={1500}>
        <KeyRound size={18} />
      </FloatChip>
      <FloatChip className="right-10 top-0 size-9 text-emerald-600" delay={2000}>
        <ShieldCheck size={16} />
      </FloatChip>
      <FloatChip className="bottom-1 left-16 size-10 text-sky-600" delay={1100}>
        <ClipboardCheck size={18} />
      </FloatChip>
      <FloatChip className="bottom-2 right-4 size-9 text-fuchsia-600" delay={2600}>
        <ImageDown size={16} />
      </FloatChip>
    </div>
  );
}
