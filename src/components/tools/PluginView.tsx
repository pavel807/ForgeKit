import { useEffect, useState } from "react";
import { Puzzle } from "lucide-react";
import { ToolPage } from "../layout/ToolPage";
import { OfficialStar } from "../ui";
import { useRouter } from "../../core/Router";
import { useModules } from "../../core/modules";
import { useI18n } from "../../core/i18n";
import { api, isOfficialPlugin, isTauri } from "../../core/api";

/** Страница плагина: изолированный iframe (песочница без доступа к Tauri API). */
export default function PluginView() {
  const { current } = useRouter();
  const { t } = useI18n();
  const { plugins } = useModules();
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const plugin = plugins.find((p) => p.id === current);

  useEffect(() => {
    setUrl(null);
    setFailed(false);
    if (!plugin) return;
    if (!isTauri()) {
      setFailed(true);
      return;
    }
    api
      .pluginBaseUrl(plugin.id)
      .then((u) => setUrl(u))
      .catch(() => setFailed(true));
  }, [plugin]);

  return (
    <ToolPage
      id={current}
      titleBadge={plugin && isOfficialPlugin(plugin) ? <OfficialStar size={14} /> : undefined}
      statusLeft={<span>{t("plg.sandboxed")}</span>}
    >
      {url && plugin ? (
        <iframe
          key={url}
          src={url}
          sandbox="allow-scripts"
          title={plugin.name}
          className="h-full min-h-[400px] w-full overflow-hidden rounded-xl border border-border bg-white"
        />
      ) : failed ? (
        <div className="grid h-full place-items-center">
          <div className="flex max-w-sm flex-col items-center gap-3 text-center">
            <span className="grid size-12 place-items-center rounded-xl border border-border bg-muted/50 text-muted-foreground">
              <Puzzle size={22} />
            </span>
            <p className="text-sm font-medium">{t("plg.loadError")}</p>
          </div>
        </div>
      ) : null}
    </ToolPage>
  );
}