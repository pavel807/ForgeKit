/* Плагины ForgeKit: модули, устанавливаемые пользователем.
   Каждый плагин — папка в app_data_dir()/plugins/<id>/ с файлом manifest.json
   и HTML-входом. Поставляется папкой или архивом .fkplugin (zip). */

use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Read;
use std::path::{Component, Path, PathBuf};
use tauri::{AppHandle, Manager};
use zip::ZipArchive;

/// Максимальный суммарный размер плагина и число файлов (защита от злоупотреблений).
const MAX_PLUGIN_BYTES: u64 = 250 * 1024 * 1024;
const MAX_PLUGIN_FILES: usize = 2048;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMeta {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub author: String,
    pub icon: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PluginManifest {
    id: String,
    name: String,
    description: Option<String>,
    version: String,
    author: Option<String>,
    entry: Option<String>,
    icon: Option<String>,
}

impl PluginManifest {
    fn validate(&self) -> Result<(), String> {
        if !is_valid_plugin_id(&self.id) {
            return Err(format!("Некорректный id плагина: «{}»", self.id));
        }
        if self.name.trim().is_empty() {
            return Err("В манифесте отсутствует name".to_string());
        }
        if self.version.trim().is_empty() {
            return Err("В манифесте отсутствует version".to_string());
        }
        for field in [
            self.entry.as_deref().unwrap_or(""),
            self.icon.as_deref().unwrap_or(""),
        ] {
            if !field.is_empty() && (field.contains("..") || Path::new(field).is_absolute()) {
                return Err("Некорректный путь в манифесте".to_string());
            }
        }
        Ok(())
    }

    fn into_meta(self) -> PluginMeta {
        PluginMeta {
            id: self.id,
            name: self.name,
            description: self.description.unwrap_or_default(),
            version: self.version,
            author: self.author.unwrap_or_default(),
            icon: self.icon,
        }
    }
}

pub fn is_valid_plugin_id(id: &str) -> bool {
    if id.is_empty() || id.len() > 48 {
        return false;
    }
    let b = id.as_bytes();
    let first_ok = b[0].is_ascii_lowercase() || b[0].is_ascii_digit();
    first_ok
        && b.iter()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || *c == b'-')
}

/// Плагины хранятся в app_data_dir()/plugins
pub fn plugins_root(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(dir.join("plugins"))
}

fn read_manifest(plugin_dir: &Path) -> Result<PluginManifest, String> {
    let path = plugin_dir.join("manifest.json");
    if !path.is_file() {
        return Err(format!("Нет manifest.json в {}", plugin_dir.display()));
    }
    let raw = fs::read(&path).map_err(|e| e.to_string())?;
    if raw.len() > 1024 * 1024 {
        return Err("manifest.json слишком большой".to_string());
    }
    let m: PluginManifest =
        serde_json::from_slice(&raw).map_err(|e| format!("Ошибка разбора manifest.json: {e}"))?;
    m.validate()?;
    Ok(m)
}

/// Плагин лежит строго внутри своей папки?
fn path_is_contained(root: &Path, candidate: &Path) -> bool {
    candidate.starts_with(root)
        && candidate.components().all(|c| !matches!(c, Component::ParentDir))
}

/// Замер папки: суммарный размер и число файлов.
fn measure_dir(dir: &Path) -> Result<(), String> {
    let mut bytes = 0u64;
    let mut files = 0usize;
    walk_measure(dir, &mut bytes, &mut files)?;
    Ok(())
}

fn walk_measure(p: &Path, bytes: &mut u64, files: &mut usize) -> Result<(), String> {
    for entry in fs::read_dir(p).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let meta = fs::symlink_metadata(entry.path()).map_err(|e| e.to_string())?;
        if meta.file_type().is_symlink() {
            continue;
        }
        if meta.is_dir() {
            walk_measure(&entry.path(), bytes, files)?;
        } else {
            *bytes = bytes.saturating_add(meta.len());
            *files += 1;
            if *bytes > MAX_PLUGIN_BYTES || *files > MAX_PLUGIN_FILES {
                return Err("Плагин слишком большой".to_string());
            }
        }
    }
    Ok(())
}

/// Копирование дерева с пропуском симлинков (не даём выйти за пределы плагина).
fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| e.to_string())?;
    for entry in fs::read_dir(src).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let meta = fs::symlink_metadata(entry.path()).map_err(|e| e.to_string())?;
        if meta.file_type().is_symlink() {
            continue;
        }
        let target = dst.join(entry.file_name());
        if meta.is_dir() {
            copy_dir_recursive(&entry.path(), &target)?;
        } else {
            fs::copy(&entry.path(), &target).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

/// Установка из папки-источника в app_data_dir()/plugins/<id> (перезапись).
fn install_source(app: &AppHandle, source: &Path) -> Result<PluginMeta, String> {
    if !source.is_dir() {
        return Err("Выбрана не папка".to_string());
    }
    let m = read_manifest(source)?;
    let entry = m.entry.as_deref().unwrap_or("index.html");
    if !source.join(entry).is_file() {
        return Err(format!("В плагине нет входного файла «{entry}»"));
    }
    measure_dir(source)?;

    let root = plugins_root(app)?;
    let target = root.join(&m.id);
    if target.exists() {
        fs::remove_dir_all(&target).map_err(|e| e.to_string())?;
    }
    fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    copy_dir_recursive(source, &target)?;
    Ok(m.into_meta())
}

/* ------------------------------ Tauri-команды ------------------------------ */

/// Список установленных плагинов (папки без валидного манифеста пропускаются).
#[tauri::command]
pub fn plugin_list(app: AppHandle) -> Result<Vec<PluginMeta>, String> {
    let root = plugins_root(&app)?;
    if !root.exists() {
        return Ok(vec![]);
    }
    let mut out = Vec::new();
    for entry in fs::read_dir(&root).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        if !entry.file_type().map(|t| t.is_dir()).unwrap_or(false) {
            continue;
        }
        if let Ok(m) = read_manifest(&entry.path()) {
            out.push(m.into_meta());
        }
    }
    out.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(out)
}

/// Установка плагина из выбранной папки.
#[tauri::command]
pub fn plugin_install(app: AppHandle, folder_path: String) -> Result<PluginMeta, String> {
    install_source(&app, &PathBuf::from(&folder_path))
}

/// Установка плагина из архива .fkplugin (zip).
#[tauri::command]
pub fn plugin_install_zip(app: AppHandle, zip_path: String) -> Result<PluginMeta, String> {
    let file = fs::File::open(&zip_path).map_err(|e| format!("Не удалось открыть архив: {e}"))?;
    let mut archive = ZipArchive::new(file).map_err(|e| format!("Повреждённый архив: {e}"))?;

    /* Распаковываем во временную папку, валидируем, затем переносим в plugins/<id>. */
    let tmp = app
        .path()
        .temp_dir()
        .map_err(|e| e.to_string())?
        .join(format!(".fkplugin-{}", uuid::Uuid::new_v4()));
    fs::create_dir_all(&tmp).map_err(|e| e.to_string())?;

    let result = extract_archive(&mut archive, &tmp).and_then(|root| install_source(&app, &root));
    let _ = fs::remove_dir_all(&tmp);
    result
}

fn extract_archive(archive: &mut ZipArchive<std::fs::File>, tmp: &Path) -> Result<PathBuf, String> {
    let mut total = 0u64;
    let mut count = 0usize;
    for i in 0..archive.len() {
        let mut f = archive.by_index(i).map_err(|e| e.to_string())?;
        let name = f.name().replace('\\', "/");
        if name.is_empty()
            || Path::new(&name).is_absolute()
            || name.split('/').any(|seg| seg == ".." || seg == ".")
        {
            return Err("Архив содержит небезопасные пути".to_string());
        }
        if name.ends_with('/') {
            fs::create_dir_all(tmp.join(&name)).map_err(|e| e.to_string())?;
            continue;
        }
        count += 1;
        if count > MAX_PLUGIN_FILES {
            return Err("Плагин слишком большой".to_string());
        }
        let out = tmp.join(&name);
        if let Some(parent) = out.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let mut buf = Vec::new();
        f.read_to_end(&mut buf).map_err(|e| e.to_string())?;
        total = total.saturating_add(buf.len() as u64);
        if total > MAX_PLUGIN_BYTES {
            return Err("Плагин слишком большой".to_string());
        }
        fs::write(&out, buf).map_err(|e| e.to_string())?;
    }

    /* Если в архиве ровно одна корневая папка — начинаем с неё. */
    let entries: Vec<_> = fs::read_dir(tmp)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .collect();
    if entries.len() == 1 && entries[0].file_type().map(|t| t.is_dir()).unwrap_or(false) {
        Ok(entries[0].path())
    } else {
        Ok(tmp.to_path_buf())
    }
}

/// Удаление плагина (вместе со всеми его файлами).
#[tauri::command]
pub fn plugin_uninstall(app: AppHandle, id: String) -> Result<(), String> {
    if !is_valid_plugin_id(&id) {
        return Err("Некорректный id плагина".to_string());
    }
    let target = plugins_root(&app)?.join(&id);
    if !target.is_dir() {
        return Err("Плагин не найден".to_string());
    }
    fs::remove_dir_all(&target).map_err(|e| e.to_string())?;
    Ok(())
}

/// Корректный URL iframe для плагина (form вис-зависим на платформе).
#[tauri::command]
pub fn plugin_base_url(_app: AppHandle, id: String) -> Result<String, String> {
    if !is_valid_plugin_id(&id) {
        return Err("Некорректный id плагина".to_string());
    }
    let (scheme, host) = if cfg!(target_os = "windows") {
        ("http", "fkplugin.localhost")
    } else {
        ("fkplugin", "localhost")
    };
    Ok(format!("{scheme}://{host}/{id}/"))
}

/// Полный путь к файлу плагина из запроса к схеме fkplugin:// (без выходов за пределы).
pub fn resolve_plugin_file(app: &AppHandle, request_path: &str) -> Result<PathBuf, String> {
    let mut segs: Vec<String> = request_path
        .split('/')
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .collect();
    if segs.is_empty() || !is_valid_plugin_id(&segs[0]) {
        return Err("Некорректный путь плагина".to_string());
    }
    let id = segs.remove(0);
    if segs.is_empty() {
        segs.push("index.html".to_string());
    }
    let root = plugins_root(app)?.join(&id);
    let mut candidate = root.clone();
    for seg in &segs {
        if seg.contains('\\') || seg == ".." {
            return Err("Некорректный путь плагина".to_string());
        }
        candidate.push(seg);
    }
    if !path_is_contained(&root, &candidate) || !candidate.is_file() {
        return Err("Файл плагина не найден".to_string());
    }
    Ok(candidate)
}

/// MIME-тип по расширению файла.
pub fn mime_for(path: &Path) -> &'static str {
    match path.extension().and_then(|e| e.to_str()).unwrap_or("").to_ascii_lowercase().as_str() {
        "html" | "htm" => "text/html; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json; charset=utf-8",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "txt" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

/* ---------------------------------- Тесты ---------------------------------- */

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn valid_ids() {
        assert!(is_valid_plugin_id("hello"));
        assert!(is_valid_plugin_id("my-plugin-v2"));
        assert!(is_valid_plugin_id("a"));
        assert!(is_valid_plugin_id("0"));
    }

    #[test]
    fn invalid_ids() {
        assert!(!is_valid_plugin_id(""));
        assert!(!is_valid_plugin_id("Hello"));
        assert!(!is_valid_plugin_id("a/b"));
        assert!(!is_valid_plugin_id(".."));
        assert!(!is_valid_plugin_id("a".repeat(49).as_str()));
        assert!(!is_valid_plugin_id("-abc"));
    }

    #[test]
    fn containment() {
        let root = Path::new("/x/plugins/foo");
        assert!(path_is_contained(root, &root.join("index.html")));
        assert!(path_is_contained(root, &root.join("css/app.css")));
        assert!(!path_is_contained(root, &root.join("../evil")));
        assert!(!path_is_contained(root, &Path::new("/x/plugins/bar/index.html")));
    }

    #[test]
    fn zip_with_single_root_dir() {
        let tmp = std::env::temp_dir().join(format!("fkzip-test-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&tmp).unwrap();
        fs::create_dir_all(tmp.join("out")).unwrap();

        let zip_path = tmp.join("p.fkplugin");
        let file = fs::File::create(&zip_path).unwrap();
        let mut zw = zip::ZipWriter::new(file);
        let opts = zip::write::SimpleFileOptions::default();
        zw.start_file("my-plugin/manifest.json", opts).unwrap();
        zw.write_all(b"{\"id\":\"my-plugin\",\"name\":\"T\",\"version\":\"1.0.0\"}").unwrap();
        zw.start_file("my-plugin/index.html", opts).unwrap();
        zw.write_all(b"<h1>hi</h1>").unwrap();
        zw.finish().unwrap();

        let mut archive = zip::ZipArchive::new(fs::File::open(&zip_path).unwrap()).unwrap();
        let root = extract_archive(&mut archive, &tmp.join("out")).unwrap();
        assert_eq!(root.file_name().unwrap(), "my-plugin");
        assert!(root.join("index.html").is_file());

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn zip_flat_files_keep_tmp_root() {
        let tmp = std::env::temp_dir().join(format!("fkzip-test-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&tmp).unwrap();
        fs::create_dir_all(tmp.join("out")).unwrap();

        let zip_path = tmp.join("p.fkplugin");
        let file = fs::File::create(&zip_path).unwrap();
        let mut zw = zip::ZipWriter::new(file);
        let opts = zip::write::SimpleFileOptions::default();
        zw.start_file("manifest.json", opts).unwrap();
        zw.write_all(b"{\"id\":\"flat\",\"name\":\"T\",\"version\":\"1.0.0\"}").unwrap();
        zw.start_file("index.html", opts).unwrap();
        zw.write_all(b"<h1>hi</h1>").unwrap();
        zw.finish().unwrap();

        let mut archive = zip::ZipArchive::new(fs::File::open(&zip_path).unwrap()).unwrap();
        let root = extract_archive(&mut archive, &tmp.join("out")).unwrap();
        assert_eq!(root.file_name().unwrap(), "out");
        assert!(root.join("manifest.json").is_file());

        let _ = fs::remove_dir_all(&tmp);
    }

    #[test]
    fn zip_traversal_rejected() {
        let tmp = std::env::temp_dir().join(format!("fkzip-test-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&tmp).unwrap();
        fs::create_dir_all(tmp.join("out")).unwrap();

        let zip_path = tmp.join("p.fkplugin");
        let file = fs::File::create(&zip_path).unwrap();
        let mut zw = zip::ZipWriter::new(file);
        let opts = zip::write::SimpleFileOptions::default();
        zw.start_file("../evil.txt", opts).unwrap();
        zw.write_all(b"boom").unwrap();
        zw.finish().unwrap();

        let mut archive = zip::ZipArchive::new(fs::File::open(&zip_path).unwrap()).unwrap();
        assert!(extract_archive(&mut archive, &tmp.join("out")).is_err());

        let _ = fs::remove_dir_all(&tmp);
    }
}