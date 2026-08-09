import type { ReactNode } from "react";
import { getTool } from "../../core/registry";
import { useRouter } from "../../core/Router";
import { useI18n } from "../../core/i18n";
import { StatusBar } from "../ui";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { HeaderIcon } from "./HeaderIcon";

interface ToolPageProps {
  id: string;
  toolbar?: ReactNode;
  actions?: ReactNode;
  statusLeft?: ReactNode;
  statusRight?: ReactNode;
  /** Бейдж-звёздочка рядом с заголовком (например, для официальных плагинов) */
  titleBadge?: ReactNode;
  children: ReactNode;
}

/** Единый шаблон страницы инструмента: заголовок → панель → рабочая область → статус-бар */
export function ToolPage({ id, toolbar, actions, statusLeft, statusRight, titleBadge, children }: ToolPageProps) {
  const tool = getTool(id);
  const Icon = tool.icon;
  const { navigate } = useRouter();
  const { t } = useI18n();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border bg-background px-8 py-5">
        <HeaderIcon icon={Icon} />
        <div className="min-w-0">
          <Breadcrumb className="mb-0.5">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-xs text-muted-foreground" onClick={() => navigate("dashboard")}>
                  {t("app.tools")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-xs text-muted-foreground" onClick={() => navigate(tool.category)}>
                  {t(tool.categoryName)}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs">{t(tool.name)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="flex items-center gap-2 text-lg font-semibold leading-tight tracking-tight">
            {t(tool.name)}
            {titleBadge}
          </h1>
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{t(tool.description)}</p>
        </div>
        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      {toolbar && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-8 py-2.5">
          {toolbar}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-8">{children}</div>
      <StatusBar left={statusLeft ?? <span>{t("app.ready")}</span>} right={statusRight} />
    </div>
  );
}