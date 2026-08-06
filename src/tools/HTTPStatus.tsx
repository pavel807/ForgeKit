import { useMemo, useState } from "react";
import { ToolPage } from "../components/layout/ToolPage";
import { CopyButton, SearchInput } from "../components/ui";

const STATUS_CODES: { code: number; label: string; ru: string }[] = [
  { code: 200, label: "OK", ru: "Запрос успешно выполнен" },
  { code: 201, label: "Created", ru: "Ресурс создан" },
  { code: 202, label: "Accepted", ru: "Запрос принят, обработка идёт" },
  { code: 204, label: "No Content", ru: "Успех без тела ответа" },
  { code: 301, label: "Moved Permanently", ru: "Ресурс перемещён навсегда" },
  { code: 302, label: "Found", ru: "Временное перенаправление" },
  { code: 304, label: "Not Modified", ru: "Кэш актуален" },
  { code: 400, label: "Bad Request", ru: "Некорректный запрос" },
  { code: 401, label: "Unauthorized", ru: "Требуется авторизация" },
  { code: 403, label: "Forbidden", ru: "Доступ запрещён" },
  { code: 404, label: "Not Found", ru: "Ресурс не найден" },
  { code: 405, label: "Method Not Allowed", ru: "Метод не разрешён" },
  { code: 408, label: "Request Timeout", ru: "Таймаут запроса" },
  { code: 409, label: "Conflict", ru: "Конфликт состояния" },
  { code: 410, label: "Gone", ru: "Ресурс удалён навсегда" },
  { code: 413, label: "Payload Too Large", ru: "Слишком большой запрос" },
  { code: 415, label: "Unsupported Media Type", ru: "Неподдерживаемый тип данных" },
  { code: 429, label: "Too Many Requests", ru: "Слишком много запросов" },
  { code: 500, label: "Internal Server Error", ru: "Ошибка сервера" },
  { code: 501, label: "Not Implemented", ru: "Не реализовано" },
  { code: 502, label: "Bad Gateway", ru: "Ошибка шлюза" },
  { code: 503, label: "Service Unavailable", ru: "Сервис недоступен" },
  { code: 504, label: "Gateway Timeout", ru: "Таймаут шлюза" },
  { code: 505, label: "HTTP Version Not Supported", ru: "Версия HTTP не поддерживается" },
];

function tone(color: number): "success" | "danger" | "warning" {
  if (color < 300) return "success";
  if (color < 400) return "warning";
  return "danger";
}

export default function HTTPStatus() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return STATUS_CODES;
    const q = query.toLowerCase();
    return STATUS_CODES.filter((s) => String(s.code).includes(q) || s.label.toLowerCase().includes(q) || s.ru.toLowerCase().includes(q));
  }, [query]);

  return (
    <ToolPage
      id="http-status"
      toolbar={<SearchInput placeholder="Поиск по коду или названию…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: 280 }} />}
      statusLeft={<span>Всего кодов: {STATUS_CODES.length}</span>}
      statusRight={<span>Группы: 2xx успех · 3xx редирект · 4xx клиент · 5xx сервер</span>}
    >
      <div className="http-grid">
        {filtered.map((s) => (
          <div key={s.code} className="fk-panel fk-panel--http" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mono-value" style={{ fontSize: 16, fontWeight: 600 }}>{s.code}</span>
              <span className="fk-badge" data-tone={tone(s.code)}>{s.label}</span>
            </div>
            <span className="info-row__label" style={{ fontSize: 13 }}>{s.ru}</span>
            <CopyButton text={String(s.code)} size="sm" />
          </div>
        ))}
      </div>
    </ToolPage>
  );
}