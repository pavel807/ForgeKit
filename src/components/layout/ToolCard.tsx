import { ArrowRight } from "lucide-react";
import { getTool } from "../../core/registry";
import { useRouter } from "../../core/Router";
import { cn } from "@/lib/utils";

export function ToolCard({ id }: { id: string }) {
  const { navigate } = useRouter();
  const tool = getTool(id);
  const Icon = tool.icon;
  return (
    <button
      onClick={() => navigate(id)}
      className={cn(
        "group flex cursor-pointer flex-col items-start gap-3 rounded-xl border border-border bg-background p-5 text-left",
        "shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg border border-border bg-muted/50 text-foreground transition-colors duration-150 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
          <Icon size={17} strokeWidth={2} />
        </span>
        <ArrowRight
          size={14}
          className="text-muted-foreground opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>
      <span>
        <span className="block text-sm font-semibold">{tool.name}</span>
        <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">{tool.description}</span>
      </span>
    </button>
  );
}
