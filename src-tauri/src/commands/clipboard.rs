/* Буфер обмена: история, управление, восстановление */

use crate::db::{self, AppDb};
use rusqlite::{params, OptionalExtension};
use serde::Serialize;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_clipboard_manager::ClipboardExt;

#[derive(Debug, Serialize, Clone)]
pub struct ClipboardItem {
    pub id: i64,
    pub kind: String,
    pub preview: String,
    pub created_at: i64,
    pub pinned: bool,
    pub favorite: bool,
}

#[derive(Debug, Serialize)]
pub struct ClipboardFull {
    pub kind: String,
    pub content: Option<String>,
    pub data_path: Option<String>,
}

fn row_to_item(row: &rusqlite::Row) -> rusqlite::Result<ClipboardItem> {
    Ok(ClipboardItem {
        id: row.get(0)?,
        kind: row.get(1)?,
        preview: row.get(2)?,
        created_at: row.get(3)?,
        pinned: row.get::<_, i64>(4)? != 0,
        favorite: row.get::<_, i64>(5)? != 0,
    })
}

/// Список записей истории с фильтрами и поиском
#[tauri::command]
pub fn clipboard_list(state: State<AppDb>, filter: String, query: String) -> Result<Vec<ClipboardItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut sql = String::from("SELECT id, kind, preview, created_at, pinned, favorite FROM clipboard_history");
    let mut conds: Vec<String> = Vec::new();

    match filter.as_str() {
        "text" => conds.push("kind IN ('text', 'code')".into()),
        "link" => conds.push("kind = 'link'".into()),
        "image" => conds.push("kind = 'image'".into()),
        "favorites" => conds.push("favorite = 1".into()),
        "pinned" => conds.push("pinned = 1".into()),
        _ => {}
    }
    let has_query = !query.trim().is_empty();
    if has_query {
        conds.push("preview LIKE '%' || ? || '%' COLLATE NOCASE".into());
    }
    if !conds.is_empty() {
        sql.push_str(" WHERE ");
        sql.push_str(&conds.join(" AND "));
    }
    sql.push_str(" ORDER BY pinned DESC, created_at DESC LIMIT ");

    let limit = db::LIMIT.to_string();
    sql.push_str(&limit);

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let iter = if has_query {
        stmt.query_map([query.trim()], row_to_item)
    } else {
        stmt.query_map([], row_to_item)
    };
    let items: Vec<ClipboardItem> = iter
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(items)
}

/// Полное содержимое записи (текст или путь к изображению)
#[tauri::command]
pub fn clipboard_get(state: State<AppDb>, id: i64) -> Result<ClipboardFull, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let row: Option<(String, Option<String>, Option<String>)> = conn
        .query_row(
            "SELECT h.kind, c.content, h.data_path
             FROM clipboard_history h
             LEFT JOIN clipboard_content c ON c.id = h.id
             WHERE h.id = ?1",
            params![id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    match row {
        Some((kind, content, data_path)) => Ok(ClipboardFull { kind, content, data_path }),
        None => Err("Запись не найдена".into()),
    }
}

#[tauri::command]
pub fn clipboard_delete(state: State<AppDb>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let data_path: Option<String> = conn
        .query_row(
            "SELECT data_path FROM clipboard_history WHERE id = ?1",
            params![id],
            |r| r.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM clipboard_history WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    if let Some(path) = data_path {
        let _ = std::fs::remove_file(path);
    }
    Ok(())
}

#[tauri::command]
pub fn clipboard_clear(state: State<AppDb>) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let paths: Vec<String> = conn
        .prepare("SELECT data_path FROM clipboard_history WHERE data_path IS NOT NULL")
        .map_err(|e| e.to_string())?
        .query_map([], |r| r.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM clipboard_history", []).map_err(|e| e.to_string())?;
    for p in paths {
        let _ = std::fs::remove_file(p);
    }
    Ok(())
}

#[tauri::command]
pub fn clipboard_set_pinned(state: State<AppDb>, id: i64, pinned: bool) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE clipboard_history SET pinned = ?1 WHERE id = ?2",
        params![pinned as i64, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clipboard_set_favorite(state: State<AppDb>, id: i64, favorite: bool) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE clipboard_history SET favorite = ?1 WHERE id = ?2",
        params![favorite as i64, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Запись текста в системный буфер обмена
#[tauri::command]
pub fn clipboard_write(app: AppHandle, text: String) -> Result<(), String> {
    app.clipboard()
        .write_text(text)
        .map_err(|e| e.to_string())
}

/// Восстановление записи: копирование содержимого обратно в буфер обмена
#[tauri::command]
pub fn clipboard_restore(app: AppHandle, state: State<AppDb>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let row: Option<(String, Option<String>, Option<String>)> = conn
        .query_row(
            "SELECT h.kind, c.content, h.data_path
             FROM clipboard_history h
             LEFT JOIN clipboard_content c ON c.id = h.id
             WHERE h.id = ?1",
            params![id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    match row {
        Some((kind, content, data_path)) => {
            if kind == "image" {
                if let Some(path) = data_path {
                    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
                    let img = tauri::image::Image::from_bytes(&bytes).map_err(|e| e.to_string())?;
                    app.clipboard().write_image(&img).map_err(|e| e.to_string())?;
                }
            } else if let Some(text) = content {
                app.clipboard().write_text(text).map_err(|e| e.to_string())?;
            }
            Ok(())
        }
        None => Err("Запись не найдена".into()),
    }
}

/// Сохранение текстового фрагмента (используется монитором буфера)
#[tauri::command]
pub fn clipboard_store_text(state: State<AppDb>, kind: String, text: String) -> Result<(), String> {
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;
    db::store_text(&mut conn, &kind, &text).map_err(|e| e.to_string())
}

/// Сохранение изображения из буфера (base64 PNG)
#[tauri::command]
pub fn clipboard_store_image(app: AppHandle, state: State<AppDb>, png_base64: String) -> Result<(), String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(png_base64.as_bytes())
        .map_err(|e| e.to_string())?;
    if bytes.is_empty() {
        return Ok(());
    }
    let dir = app.path().app_cache_dir().map_err(|e| e.to_string())?.join("clipboard");
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let hash = hex::encode(sha256_digest(&bytes));
    let path = dir.join(format!("{}.png", &hash[..16]));
    if !path.exists() {
        std::fs::write(&path, &bytes).map_err(|e| e.to_string())?;
    }
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;
    db::store_image(&mut conn, &path.to_string_lossy()).map_err(|e| e.to_string())
}

fn sha256_digest(bytes: &[u8]) -> [u8; 32] {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    hasher.finalize().into()
}

/// Фоновый монитор буфера обмена: опрашивает системный буфер и сохраняет
/// изменения в историю (текст и изображения). Работает на macOS, Windows и Linux.
pub fn start_monitor<R: tauri::Runtime>(app: tauri::AppHandle<R>) -> Result<(), String> {
    std::thread::Builder::new()
        .name("clipboard-monitor".into())
        .spawn(move || {
            /* Текущее состояние буфера считаем «уже известным»: не сохраняем его
               в историю, иначе после очистки истории запись вернётся при следующей
               проверке (и при первом запуске в историю попадёт старый буфер). */
            let mut last_text: Option<String> = app
                .clipboard()
                .read_text()
                .ok()
                .filter(|t| !t.trim().is_empty());
            let mut last_image: Option<Vec<u8>> = app.clipboard().read_image().ok().map(|img| img.rgba().to_vec());

            loop {
                std::thread::sleep(std::time::Duration::from_millis(700));

                let Some(state) = app.try_state::<AppDb>() else { continue; };
                let mut captured = false;

                /* Текст */
                if let Ok(text) = app.clipboard().read_text() {
                    if !text.trim().is_empty() && last_text.as_deref() != Some(text.as_str()) {
                        last_text = Some(text.clone());
                        let kind = db::detect_kind(&text);
                        if let Ok(mut conn) = state.0.lock() {
                            let _ = db::store_text(&mut conn, &kind, &text);
                        }
                        captured = true;
                    }
                }

                /* Изображение (если в буфере не текст) */
                if !captured {
                    if let Ok(img) = app.clipboard().read_image() {
                        let rgba = img.rgba().to_vec();
                        if last_image.as_deref() != Some(rgba.as_slice()) {
                            last_image = Some(rgba.clone());
                            if let Ok(mut conn) = state.0.lock() {
                                if let Some(path) = save_image(&app, &rgba, img.width(), img.height()) {
                                    let _ = db::store_image(&mut conn, &path);
                                }
                            }
                        }
                    }
                }
            }
        })
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Кодирует RGBA-пиксели в PNG и сохраняет файл в кэш приложения
fn save_image<R: tauri::Runtime>(app: &tauri::AppHandle<R>, rgba: &[u8], width: u32, height: u32) -> Option<String> {
    use image::{DynamicImage, ImageFormat, RgbaImage};

    if width == 0 || height == 0 {
        return None;
    }
    let buf = RgbaImage::from_raw(width, height, rgba.to_vec())?;
    let mut out = Vec::new();
    DynamicImage::ImageRgba8(buf)
        .write_to(&mut std::io::Cursor::new(&mut out), ImageFormat::Png)
        .ok()?;

    let dir = app.path().app_cache_dir().ok()?.join("clipboard");
    std::fs::create_dir_all(&dir).ok()?;
    let hash = hex::encode(sha256_digest(&out));
    let path = dir.join(format!("{}.png", &hash[..16]));
    if !path.exists() {
        std::fs::write(&path, &out).ok()?;
    }
    Some(path.to_string_lossy().into_owned())
}
