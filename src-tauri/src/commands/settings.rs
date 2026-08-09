/* Настройки приложения: пары ключ-значение в SQLite */

use crate::db::{self, AppDb};
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub fn settings_get(state: State<AppDb>, key: String) -> Result<Option<String>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::get_setting(&conn, &key).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn settings_set(state: State<AppDb>, key: String, value: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    db::set_setting(&conn, &key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn settings_get_all(state: State<AppDb>) -> Result<HashMap<String, String>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT key, value FROM settings").map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?
        .collect::<Result<HashMap<_, _>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}

/// Состояние модулей (плагинов и встроенных инструментов): key — id модуля,
/// value — "1" (включён) или "0" (выключен). Плагины хранятся под ключом `module:<id>`.
#[tauri::command]
pub fn modules_get(state: State<AppDb>) -> Result<Vec<(String, bool)>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT key, value FROM settings WHERE key LIKE 'module:%'")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows
        .into_iter()
        .map(|(key, value)| (key.trim_start_matches("module:").to_string(), value == "1"))
        .collect())
}
