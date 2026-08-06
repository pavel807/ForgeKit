import type { ReactNode } from "react";
import { getTool } from "../../core/registry";
import { useRouter } from "../../core/Router";
import { StatusBar } from "../ui";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { HeaderIcon } from "./HeaderIcon";

interface ToolPageProps {
  id: string;
  toolbar?: ReactNode;
  actions?: ReactNode;
  statusLeft?: ReactNode;
  statusRight?: ReactNode;
  children: ReactNode;
}

/** Единый шаблон страницы инструмента: заголовок → панель → рабочая область → статус-бар */
export function ToolPage({ id, toolbar, actions, statusLeft, statusRight, children }: ToolPageProps) {
  const tool = getTool(id);
  const Icon = tool.icon;
  const { navigate } = useRouter();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border bg-background px-8 py-5">
        <HeaderIcon icon={Icon} />
        <div className="min-w-0">
          <Breadcrumb className="mb-0.5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-xs text-muted-foreground" onClick={() => navigate("dashboard")}>
                  Инструменты
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-xs text-muted-foreground" onClick={() => navigate(tool.category)}>
                  {tool.categoryName}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">{tool.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-lg font-semibold leading-tight tracking-tight">{tool.name}</h1>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{tool.description}</p>
        </div>
        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {toolbar && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-8 py-2.5">
          {toolbar}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-8">{children}</div>
      <StatusBar left={statusLeft ?? <span>Готово</span>} right={statusRight} />
    </div>
  );
}