/* Файлы: поиск дубликатов, массовое переименование, организация, анализ размера */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Clone)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub is_dir: bool,
}

#[derive(Debug, Serialize)]
pub struct DuplicateGroup {
    pub hash: String,
    pub size: u64,
    pub items: Vec<FileEntry>,
}

#[derive(Debug, Deserialize)]
pub struct RenameOp {
    pub from: String,
    pub to: String,
}

#[derive(Debug, Serialize)]
pub struct RenameResult {
    pub ok: bool,
    pub from: String,
    pub to: String,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct OrganizeResult {
    pub ok: bool,
    pub from: String,
    pub to: String,
    pub error: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SizeEntry {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub file_count: u64,
    pub dir_count: u64,
}

fn entry_to_file_entry(path: &Path) -> Option<FileEntry> {
    let meta = std::fs::metadata(path).ok()?;
    Some(FileEntry {
        path: path.to_string_lossy().to_string(),
        name: path.file_name()?.to_string_lossy().to_string(),
        size: if meta.is_dir() { 0 } else { meta.len() },
        is_dir: meta.is_dir(),
    })
}

/// Сканирование содержимого папки (один уровень или рекурсивно)
#[tauri::command]
pub fn files_scan(dir: String, recursive: bool) -> Result<Vec<FileEntry>, String> {
    let path = PathBuf::from(&dir);
    if !path.is_dir() {
        return Err("Папка не найдена".into());
    }
    let mut out = Vec::new();
    walk_scan(&path, &mut out, recursive)?;
    out.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(out)
}

fn walk_scan(dir: &Path, out: &mut Vec<FileEntry>, recursive: bool) -> Result<(), String> {
    let rd = std::fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in rd.flatten() {
        let path = entry.path();
        let Some(fe) = entry_to_file_entry(&path) else { continue };
        let is_dir = fe.is_dir;
        out.push(fe);
        if recursive && is_dir {
            walk_scan(&path, out, recursive)?;
        }
    }
    Ok(())
}

/// Поиск дубликатов: сначала по размеру, затем по хэшу содержимого
#[tauri::command]
pub fn files_find_duplicates(dir: String) -> Result<Vec<DuplicateGroup>, String> {
    let path = PathBuf::from(&dir);
    if !path.is_dir() {
        return Err("Папка не найдена".into());
    }

    let mut files: Vec<FileEntry> = Vec::new();
    walk_files(&path, &mut files)?;

    let mut by_size: HashMap<u64, Vec<&FileEntry>> = HashMap::new();
    for f in &files {
        by_size.entry(f.size).or_default().push(f);
    }

    let mut groups: Vec<DuplicateGroup> = Vec::new();
    for (size, entries) in by_size {
        if entries.len() < 2 || size == 0 {
            continue;
        }
        let mut by_hash: HashMap<String, Vec<FileEntry>> = HashMap::new();
        for fe in entries {
            let hash = file_sha256(&PathBuf::from(&fe.path)).unwrap_or_default();
            by_hash.entry(hash).or_default().push(fe.clone());
        }
        for (hash, items) in by_hash {
            if items.len() > 1 {
                groups.push(DuplicateGroup { hash, size, items });
            }
        }
    }
    groups.sort_by_key(|g| std::cmp::Reverse(g.size));
    Ok(groups)
}

fn walk_files(dir: &Path, out: &mut Vec<FileEntry>) -> Result<(), String> {
    let rd = std::fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in rd.flatten() {
        let path = entry.path();
        if path.is_dir() {
            walk_files(&path, out)?;
        } else if let Some(fe) = entry_to_file_entry(&path) {
            out.push(fe);
        }
    }
    Ok(())
}

fn file_sha256(path: &Path) -> Option<String> {
    use sha2::{Digest, Sha256};
    let bytes = std::fs::read(path).ok()?;
    let mut hasher = Sha256::new();
    hasher.update(&bytes);
    Some(hex::encode(hasher.finalize()))
}

/// Массовое переименование файлов
#[tauri::command]
pub fn files_rename(ops: Vec<RenameOp>) -> Result<Vec<RenameResult>, String> {
    let mut results = Vec::with_capacity(ops.len());
    for op in ops {
        let from = PathBuf::from(&op.from);
        let to = PathBuf::from(&op.to);
        let mut result = RenameResult {
            ok: false,
            from: op.from.clone(),
            to: op.to.clone(),
            error: None,
        };
        if !from.exists() {
            result.error = Some("Исходный файл не найден".into());
        } else if to.exists() {
            result.error = Some("Файл с новым именем уже существует".into());
        } else {
            match std::fs::rename(&from, &to) {
                Ok(()) => result.ok = true,
                Err(e) => result.error = Some(e.to_string()),
            }
        }
        results.push(result);
    }
    Ok(results)
}

fn category_of(ext: &str) -> &'static str {
    const IMAGE: &[&str] = &["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "tiff", "ico", "heic", "avif"];
    const VIDEO: &[&str] = &["mp4", "mov", "mkv", "avi", "webm", "wmv", "flv"];
    const AUDIO: &[&str] = &["mp3", "wav", "flac", "ogg", "aac", "m4a", "opus"];
    const DOCUMENT: &[&str] = &["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md", "rtf", "odt", "epub"];
    const ARCHIVE: &[&str] = &["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso", "dmg"];
    const CODE: &[&str] = &["js", "ts", "tsx", "jsx", "json", "html", "css", "rs", "py", "go", "java", "c", "cpp", "h", "rb", "php", "sh", "yml", "yaml", "toml", "sql", "xml"];
    if IMAGE.contains(&ext) {
        "Изображения"
    } else if VIDEO.contains(&ext) {
        "Видео"
    } else if AUDIO.contains(&ext) {
        "Аудио"
    } else if DOCUMENT.contains(&ext) {
        "Документы"
    } else if ARCHIVE.contains(&ext) {
        "Архивы"
    } else if CODE.contains(&ext) {
        "Код"
    } else {
        "Прочее"
    }
}

/// Организация файлов по категориям или расширениям
#[tauri::command]
pub fn files_organize(dir: String, mode: String, dry_run: bool) -> Result<Vec<OrganizeResult>, String> {
    let path = PathBuf::from(&dir);
    if !path.is_dir() {
        return Err("Папка не найдена".into());
    }
    let rd = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut results = Vec::new();

    for entry in rd.flatten() {
        let p = entry.path();
        if p.is_dir() {
            continue;
        }
        let Some(name) = p.file_name().map(|n| n.to_string_lossy().to_string()) else { continue };
        let ext = p
            .extension()
            .map(|e| e.to_string_lossy().to_lowercase())
            .unwrap_or_default();
        let folder = if mode == "type" {
            category_of(&ext).to_string()
        } else {
            ext.to_uppercase()
        };
        if folder.is_empty() {
            continue;
        }
        let target_dir = path.join(&folder);
        let target = target_dir.join(&name);
        if target == p {
            continue;
        }
        if target.exists() {
            results.push(OrganizeResult {
                ok: false,
                from: p.to_string_lossy().to_string(),
                to: target.to_string_lossy().to_string(),
                error: Some("Файл уже существует в целевой папке".into()),
            });
            continue;
        }
        let mut ok = true;
        let mut error = None;
        if !dry_run {
            if std::fs::create_dir_all(&target_dir).is_err() {
                ok = false;
                error = Some("Не удалось создать папку".into());
            } else if let Err(e) = std::fs::rename(&p, &target) {
                ok = false;
                error = Some(e.to_string());
            }
        }
        results.push(OrganizeResult {
            ok,
            from: p.to_string_lossy().to_string(),
            to: target.to_string_lossy().to_string(),
            error,
        });
    }
    Ok(results)
}

/// Разбивка размера: сколько занимает каждый элемент папки
#[tauri::command]
pub fn files_size_breakdown(dir: String) -> Result<Vec<SizeEntry>, String> {
    let path = PathBuf::from(&dir);
    if !path.is_dir() {
        return Err("Папка не найдена".into());
    }
    let rd = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut out = Vec::new();
    for entry in rd.flatten() {
        let p = entry.path();
        let Some(name) = p.file_name().map(|n| n.to_string_lossy().to_string()) else { continue };
        let (size, files, dirs) = measure(&p);
        out.push(SizeEntry {
            path: p.to_string_lossy().to_string(),
            name,
            size,
            file_count: files,
            dir_count: dirs,
        });
    }
    out.sort_by(|a, b| b.size.cmp(&a.size));
    Ok(out)
}

/* Запись текстового файла по указанному пути (для сохранения SVG и подобного) */
#[tauri::command]
pub fn write_text_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

fn measure(p: &Path) -> (u64, u64, u64) {
    let mut size = 0u64;
    let mut files = 0u64;
    let mut dirs = 0u64;
    let mut stack = vec![p.to_path_buf()];
    while let Some(dir) = stack.pop() {
        if dir.is_file() {
            size += std::fs::metadata(&dir).map(|m| m.len()).unwrap_or(0);
            files += 1;
            continue;
        }
        dirs += 1;
        if let Ok(rd) = std::fs::read_dir(&dir) {
            for e in rd.flatten() {
                stack.push(e.path());
            }
        }
    }
    (size, files, dirs)
}
