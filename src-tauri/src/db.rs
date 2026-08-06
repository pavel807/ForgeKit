/* База данных SQLite: история буфера обмена и настройки приложения */

use rusqlite::{params, Connection, OptionalExtension};
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

pub const LIMIT: i64 = 500;

pub struct AppDb(pub Mutex<Connection>);

impl AppDb {
    pub fn new(conn: Connection) -> Self {
        Self(Mutex::new(conn))
    }
}

pub fn open(mut dir: PathBuf) -> Result<Connection, rusqlite::Error> {
    std::fs::create_dir_all(&dir).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    dir.push("forgekit.db");
    let conn = Connection::open(dir)?;
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS clipboard_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kind TEXT NOT NULL,
            content_hash TEXT NOT NULL,
            preview TEXT NOT NULL DEFAULT '',
            data_path TEXT,
            created_at INTEGER NOT NULL,
            pinned INTEGER NOT NULL DEFAULT 0,
            favorite INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS clipboard_content (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            FOREIGN KEY (id) REFERENCES clipboard_history (id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_history_created ON clipboard_history (created_at DESC);",
    )?;
    Ok(conn)
}

pub fn unix_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

pub fn get_setting(conn: &Connection, key: &str) -> Result<Option<String>, rusqlite::Error> {
    conn.query_row("SELECT value FROM settings WHERE key = ?1", params![key], |row| row.get(0))
        .optional()
}

pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT (key) DO UPDATE SET value = excluded.value",
        params![key, value],
    )?;
    Ok(())
}

fn prune(conn: &Connection) {
    let _ = conn.execute(
        "DELETE FROM clipboard_history
         WHERE id NOT IN (
             SELECT id FROM clipboard_history
             ORDER BY pinned DESC, created_at DESC
             LIMIT ?1
         )",
        params![LIMIT],
    );
}

/// Сохраняет текстовый фрагмент в историю (дедупликация по хэшу)
pub fn store_text(conn: &mut Connection, kind: &str, text: &str) -> Result<(), rusqlite::Error> {
    let hash = hex::encode(sha256(text.as_bytes()));
    let preview: String = text.trim().chars().take(240).collect();
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM clipboard_history WHERE content_hash = ?1", params![hash])?;
    tx.execute(
        "INSERT INTO clipboard_history (kind, content_hash, preview, created_at) VALUES (?1, ?2, ?3, ?4)",
        params![kind, hash, preview, unix_ms()],
    )?;
    let id = tx.last_insert_rowid();
    tx.execute("INSERT INTO clipboard_content (id, content) VALUES (?1, ?2)", params![id, text])?;
    tx.commit()?;
    prune(conn);
    Ok(())
}

/// Сохраняет изображение в историю (файл PNG в кэше приложения)
pub fn store_image(conn: &mut Connection, data_path: &str) -> Result<(), rusqlite::Error> {
    let bytes = std::fs::read(data_path).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    let hash = hex::encode(sha256(&bytes));
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM clipboard_history WHERE content_hash = ?1", params![hash])?;
    tx.execute(
        "INSERT INTO clipboard_history (kind, content_hash, preview, data_path, created_at) VALUES ('image', ?1, '', ?2, ?3)",
        params![hash, data_path, unix_ms()],
    )?;
    tx.commit()?;
    prune(conn);
    Ok(())
}

pub fn sha256(bytes: &[u8]) -> [u8; 32] {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    hasher.finalize().into()
}

/// Классификация текстового фрагмента: ссылка / код / обычный текст
pub fn detect_kind(text: &str) -> String {
    let t = text.trim();
    if t.len() > 2000 || (t.len() > 32 && t.bytes().all(|b| b.is_ascii_alphanumeric() || b == b'+' || b == b'/' || b == b'=')) {
        return "code".into();
    }
    let is_link = (t.starts_with("https://") || t.starts_with("http://") || t.starts_with("ftp://") || t.starts_with("www."))
        && !t.contains(char::is_whitespace)
        && !t.chars().any(|c| c.is_control());
    if is_link {
        "link".into()
    } else {
        "text".into()
    }
}
