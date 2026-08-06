import { getCategory, getTool } from "../../core/registry";
import { ToolCard } from "./ToolCard";
import { HeaderIcon } from "./HeaderIcon";

interface CategoryPageProps {
  id: string;
}

/** Страница-категория: заголовок категории и карточки её инструментов */
export function CategoryPage({ id }: CategoryPageProps) {
  const cat = getCategory(id);
  if (!cat) return null;
  const Icon = cat.icon;
  const tools = cat.toolIds.map((t) => getTool(t));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border bg-background px-8 py-5">
        <HeaderIcon icon={Icon} />
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight tracking-tight">{cat.name}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{tools.length} инструментов в категории</p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} id={tool.id} />
          ))}
        </div>
      </div>
    </div>
  );
}