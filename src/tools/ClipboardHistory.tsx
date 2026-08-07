import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardList, ClipboardX, FileText, Image as ImageIcon, Link2, Pin, PinOff, Star, Trash2 } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { api, isTauri, type ClipboardItem } from "../core/api";
import { formatRelativeTime } from "../core/format";
import { useI18n } from "../core/i18n";
import { EmptyState, IconButton, SearchInput, SegmentedControl } from "../components/ui";
import { ToolPage } from "../components/layout/ToolPage";
import { notifyForgekitCopy } from "../core/clipboard";

type Filter = "all" | "text" | "link" | "image" | "favorites" | "pinned";

function KindIcon({ kind }: { kind: string }) {
  if (kind === "image") return <ImageIcon size={16} />;
  if (kind === "link") return <Link2 size={16} />;
  if (kind === "code") return <FileText size={16} />;
  return <ClipboardList size={16} />;
}

export default function ClipboardHistory() {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [imageSrcs, setImageSrcs] = useState<Record<number, string>>({});
  const timerRef = useRef<number | null>(null);
  const { t, lang } = useI18n();

  const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: t("clip.filter.all") },
    { value: "text", label: t("clip.filter.text") },
    { value: "link", label: t("clip.filter.link") },
    { value: "image", label: t("clip.filter.image") },
    { value: "favorites", label: t("clip.filter.favorites") },
    { value: "pinned", label: t("clip.filter.pinned") },
  ];

  const kindLabel = (kind: string): string => {
    if (kind === "image") return t("kind.image");
    if (kind === "link") return t("kind.link");
    if (kind === "code") return t("kind.code");
    return t("kind.text");
  };

  const refresh = useCallback(async () => {
    try {
      const list = await api.clipboardList(filter, query);
      setItems(list);
    } catch {
      setItems([]);
    }
    setLoaded(true);
  }, [filter, query]);

  useEffect(() => {
    if (!isTauri()) {
      setLoaded(true);
      return;
    }
    refresh();
    const interval = window.setInterval(refresh, 1000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  /* Подгрузка путей к изображениям */
  useEffect(() => {
    if (!isTauri()) return;
    let cancelled = false;
    Promise.all(
      items.filter((it) => it.kind === "image").map((it) => api.clipboardGet(it.id).catch(() => null)),
    ).then((fulls) => {
      if (cancelled) return;
      const next: Record<number, string> = {};
      items.forEach((it, idx) => {
        const full = fulls[idx];
        if (full?.data_path) next[it.id] = convertFileSrc(full.data_path);
      });
      setImageSrcs((prev) => ({ ...prev, ...next }));
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  async function handleClick(item: ClipboardItem) {
    try {
      const full = await api.clipboardGet(item.id);
      if (full.content) {
        await api.clipboardWrite(full.content);
        notifyForgekitCopy();
        setCopiedId(item.id);
        if (timerRef.current) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopiedId(null), 1200);
      }
    } catch {
      /* ignore */
    }
  }

  async function togglePin(item: ClipboardItem) {
    await api.clipboardSetPinned(item.id, !item.pinned).catch(() => {});
    refresh();
  }

  async function toggleFavorite(item: ClipboardItem) {
    await api.clipboardSetFavorite(item.id, !item.favorite).catch(() => {});
    refresh();
  }

  async function remove(item: ClipboardItem) {
    await api.clipboardDelete(item.id).catch(() => {});
    refresh();
  }

  return (
    <ToolPage
      id="clipboard"
      toolbar={
        <>
          <SearchInput placeholder={t("clip.search")} value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 280 }} />
          <div className="spacer" />
          <SegmentedControl value={filter} onChange={setFilter} items={FILTERS} />
        </>
      }
      statusLeft={<span>{loaded ? t("clip.count", { n: items.length }) : t("clip.loading")}</span>}
      statusRight={
        <button
          className="fk-btn fk-btn--ghost fk-btn--sm"
          onClick={async () => {
            if (window.confirm(t("clip.clearConfirm"))) {
              await api.clipboardClear().catch(() => {});
              refresh();
            }
          }}
        >
          {t("clip.clear")}
        </button>
      }
    >
      {!loaded ? null : items.length === 0 ? (
        <EmptyState
          icon={<ClipboardX size={24} />}
          title={query || filter !== "all" ? t("clip.noResultsTitle") : t("clip.emptyTitle")}
          description={
            query || filter !== "all"
              ? t("clip.noResultsDesc")
              : t("clip.emptyDesc")
          }
        />
      ) : (
        <div className="clip-list">
          {items.map((item) => (
            <div
              key={item.id}
              className="clip-item"
              onClick={() => handleClick(item)}
              onMouseLeave={() => setCopiedId((c) => (c === item.id ? null : c))}
            >
              <div className="clip-item__type">
                <KindIcon kind={item.kind} />
              </div>
              <div className="clip-item__preview">
                {item.kind === "image" && imageSrcs[item.id] ? (
                  <img className="clip-item__thumb" src={imageSrcs[item.id]} alt="" />
                ) : (
                  <div className="clip-item__text">
                    <div className="clip-item__line">
                      {item.kind === "link" ? (
                        <span style={{ color: "var(--fk-accent)" }}>{item.preview}</span>
                      ) : (
                        item.preview || t("kind.image")
                      )}
                    </div>
                    <div className="clip-item__time">
                      {copiedId === item.id ? (
                        <span style={{ color: "var(--success)" }}>{t("clip.copied")}</span>
                      ) : (
                        formatRelativeTime(item.created_at, lang)
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="clip-item__time-col">{kindLabel(item.kind)}</div>
              <div className="clip-item__actions" onClick={(e) => e.stopPropagation()}>
                <IconButton
                  size="sm"
                  variant={item.pinned ? "active" : "ghost"}
                  tooltip={item.pinned ? t("clip.unpin") : t("clip.pin")}
                  onClick={() => togglePin(item)}
                >
                  {item.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                </IconButton>
                <IconButton
                  size="sm"
                  variant={item.favorite ? "active" : "ghost"}
                  tooltip={item.favorite ? t("clip.unfavorite") : t("clip.favorite")}
                  onClick={() => toggleFavorite(item)}
                >
                  <Star size={14} />
                </IconButton>
                <IconButton size="sm" variant="danger" tooltip={t("clip.delete")} onClick={() => remove(item)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
