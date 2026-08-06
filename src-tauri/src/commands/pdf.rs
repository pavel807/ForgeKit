/* PDF: объединение, разделение, информация, изображение → PDF, извлечение текста, оптимизация */

use lopdf::{dictionary, Document, Object, ObjectId, Stream};
use serde::Serialize;
use std::collections::{BTreeMap, HashSet};
use std::path::Path;

#[derive(Debug, Serialize)]
pub struct PdfResult {
    pub pages: u32,
    pub size: u64,
}

#[derive(Debug, Serialize)]
pub struct PdfInfo {
    pub pages: u32,
    pub version: String,
    pub title: String,
    pub author: String,
    pub creator: String,
    pub producer: String,
    pub size: u64,
}

#[derive(Debug, Serialize)]
pub struct SplitResult {
    pub name: String,
    pub pages: u32,
}

#[derive(Debug, Serialize)]
pub struct OptimizeResult {
    pub before: u64,
    pub after: u64,
}

fn size_of(path: &str) -> u64 {
    std::fs::metadata(path).map(|m| m.len()).unwrap_or(0)
}

fn skip_object(obj: &Object) -> bool {
    match obj.type_name().unwrap_or("") {
        "Catalog" | "Pages" | "Outlines" | "Outline" => true,
        _ => false,
    }
}

/// Собирает новый документ из набора страниц и общих объектов
fn build_doc(
    page_objects: Vec<(ObjectId, Object)>,
    all_objects: BTreeMap<ObjectId, Object>,
) -> Result<Document, String> {
    let mut document = Document::with_version("1.5");
    document.objects = all_objects;

    let max_existing = document
        .objects
        .keys()
        .chain(page_objects.iter().map(|(id, _)| id))
        .map(|id| id.0)
        .max()
        .unwrap_or(0);
    let mut next = max_existing + 1;

    let pages_id = (next, 0);
    next += 1;
    let catalog_id = (next, 0);

    let count = page_objects.len() as u32;
    let kids: Vec<Object> = page_objects.iter().map(|(id, _)| Object::Reference(*id)).collect();

    for (id, mut obj) in page_objects {
        if let Ok(dict) = obj.as_dict_mut() {
            dict.set("Parent", Object::Reference(pages_id));
        }
        document.objects.insert(id, obj);
    }

    document.objects.insert(
        pages_id,
        Object::Dictionary(dictionary! {
            "Type" => "Pages",
            "Kids" => kids,
            "Count" => count,
        }),
    );
    document.objects.insert(
        catalog_id,
        Object::Dictionary(dictionary! {
            "Type" => "Catalog",
            "Pages" => pages_id,
        }),
    );

    document.trailer.set("Root", catalog_id);
    document.max_id = next;
    document.renumber_objects();
    Ok(document)
}

/// Объединение нескольких PDF в один файл
#[tauri::command]
pub fn pdf_merge(paths: Vec<String>, output: String) -> Result<PdfResult, String> {
    if paths.len() < 2 {
        return Err("Выберите минимум два файла PDF".into());
    }
    let mut all_objects: BTreeMap<ObjectId, Object> = BTreeMap::new();
    let mut page_objects: Vec<(ObjectId, Object)> = Vec::new();
    let mut max_id = 1u32;

    for p in &paths {
        let mut doc = Document::load(p).map_err(|e| format!("{p}: {e}"))?;
        doc.renumber_objects_with(max_id);
        max_id = doc.max_id + 1;
        for (id, obj) in doc.objects {
            if skip_object(&obj) {
                continue;
            }
            if obj.type_name().unwrap_or("") == "Page" {
                page_objects.push((id, obj));
            } else {
                all_objects.insert(id, obj);
            }
        }
    }

    if page_objects.is_empty() {
        return Err("В выбранных файлах нет страниц".into());
    }

    let mut document = build_doc(page_objects, all_objects)?;
    document.save(&output).map_err(|e| format!("Не удалось сохранить: {e}"))?;
    Ok(PdfResult {
        pages: document.get_pages().len() as u32,
        size: size_of(&output),
    })
}

/// Разбор диапазонов страниц «1-3,5,7-9»
fn parse_ranges(spec: &str, max_page: u32) -> Result<Vec<u32>, String> {
    let mut pages = Vec::new();
    for part in spec.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }
        if let Some((from, to)) = part.split_once('-') {
            let f: u32 = from.trim().parse().map_err(|_| format!("Неверный диапазон: {part}"))?;
            let t: u32 = to.trim().parse().map_err(|_| format!("Неверный диапазон: {part}"))?;
            if f == 0 || t > max_page || f > t {
                return Err(format!("Диапазон {part} выходит за пределы (1–{max_page})"));
            }
            for p in f..=t {
                pages.push(p);
            }
        } else {
            let p: u32 = part.parse().map_err(|_| format!("Неверный номер страницы: {part}"))?;
            if p == 0 || p > max_page {
                return Err(format!("Страница {p} выходит за пределы (1–{max_page})"));
            }
            pages.push(p);
        }
    }
    if pages.is_empty() {
        return Err("Укажите страницы или диапазоны".into());
    }
    pages.sort_unstable();
    pages.dedup();
    Ok(pages)
}

/// Разделение PDF на части по диапазонам страниц
#[tauri::command]
pub fn pdf_split(path: String, output_dir: String, ranges: String) -> Result<Vec<SplitResult>, String> {
    let doc = Document::load(&path).map_err(|e| format!("Не удалось открыть PDF: {e}"))?;
    let pages_map = doc.get_pages();
    let max_page = pages_map.len() as u32;
    let pages = parse_ranges(&ranges, max_page)?;

    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;

    // Группируем страницы в смежные части
    let mut chunks: Vec<Vec<u32>> = Vec::new();
    for p in &pages {
        let last = chunks.last_mut();
        match last {
            Some(chunk) if *chunk.last().unwrap() + 1 == *p => chunk.push(*p),
            _ => chunks.push(vec![*p]),
        }
    }

    let base_name = Path::new(&path)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "part".into());

    let mut results = Vec::new();
    for (idx, chunk) in chunks.iter().enumerate() {
        let selected: Vec<(ObjectId, Object)> = chunk
            .iter()
            .filter_map(|n| pages_map.get(n))
            .filter_map(|id| doc.objects.get(id).map(|o| (*id, o.clone())))
            .collect();
        let selected_ids: HashSet<ObjectId> = selected.iter().map(|(id, _)| *id).collect();
        let all_objects: BTreeMap<ObjectId, Object> = doc
            .objects
            .iter()
            .filter(|(id, obj)| !skip_object(obj) && obj.type_name().unwrap_or("") != "Page" && !selected_ids.contains(id))
            .map(|(id, obj)| (*id, obj.clone()))
            .collect();

        let mut part_doc = build_doc(selected, all_objects)?;
        let name = if chunks.len() == 1 {
            format!("{base_name}_part.pdf")
        } else {
            format!("{base_name}_part_{}.pdf", idx + 1)
        };
        let out_path = Path::new(&output_dir).join(&name);
        part_doc.save(&out_path).map_err(|e| format!("Не удалось сохранить {name}: {e}"))?;
        results.push(SplitResult {
            name,
            pages: chunk.len() as u32,
        });
    }
    Ok(results)
}

/// Метаданные и параметры PDF
#[tauri::command]
pub fn pdf_info(path: String) -> Result<PdfInfo, String> {
    let doc = Document::load(&path).map_err(|e| format!("Не удалось открыть PDF: {e}"))?;
    let mut info = PdfInfo {
        pages: doc.get_pages().len() as u32,
        version: doc.version.clone(),
        title: String::new(),
        author: String::new(),
        creator: String::new(),
        producer: String::new(),
        size: size_of(&path),
    };

    let info_obj = doc.trailer.get(b"Info").ok().cloned();
    if let Some(Object::Reference(id)) = info_obj {
        if let Ok(Object::Dictionary(dict)) = doc.get_object(id).cloned() {
            info.title = string_field(&dict, b"Title");
            info.author = string_field(&dict, b"Author");
            info.creator = string_field(&dict, b"Creator");
            info.producer = string_field(&dict, b"Producer");
        }
    }
    Ok(info)
}

fn string_field(dict: &lopdf::Dictionary, key: &[u8]) -> String {
    dict.get(key)
        .ok()
        .and_then(|o| o.as_string().ok())
        .map(|c| c.into_owned())
        .unwrap_or_default()
}

/// Создание PDF из изображений (по одному изображению на страницу)
#[tauri::command]
pub fn image_to_pdf(paths: Vec<String>, output: String) -> Result<PdfResult, String> {
    if paths.is_empty() {
        return Err("Выберите хотя бы одно изображение".into());
    }
    use image::{ExtendedColorType, ImageEncoder};
    let mut doc = Document::with_version("1.4");
    let pages_id = doc.new_object_id();
    let mut page_ids: Vec<ObjectId> = Vec::new();

    for (i, p) in paths.iter().enumerate() {
        let img = image::open(p).map_err(|e| format!("{p}: {e}"))?;
        let (w, h) = (img.width(), img.height());
        let rgb = img.to_rgb8();
        let mut jbuf = Vec::new();
        image::codecs::jpeg::JpegEncoder::new_with_quality(&mut jbuf, 90)
            .write_image(rgb.as_raw(), w, h, ExtendedColorType::Rgb8)
            .map_err(|e| e.to_string())?;

        let img_id = doc.add_object(Stream::new(
            dictionary! {
                "Type" => "XObject",
                "Subtype" => "Image",
                "Width" => w as u32,
                "Height" => h as u32,
                "ColorSpace" => "DeviceRGB",
                "BitsPerComponent" => 8,
                "Filter" => "DCTDecode",
            },
            jbuf,
        ));

        let content = format!("q\n{} 0 0 {} 0 0 cm\n/Im{} Do\nQ", w, h, i);
        let content_id = doc.add_object(Stream::new(dictionary! {}, content.into_bytes()));

        let page_id = doc.add_object(dictionary! {
            "Type" => "Page",
            "Parent" => pages_id,
            "MediaBox" => vec![
                Object::Integer(0),
                Object::Integer(0),
                Object::Integer(w as i64),
                Object::Integer(h as i64),
            ],
            "Contents" => content_id,
            "Resources" => dictionary! {
                "XObject" => dictionary! {
                    format!("Im{}", i) => img_id,
                },
            },
        });
        page_ids.push(page_id);
    }

    doc.objects.insert(
        pages_id,
        Object::Dictionary(dictionary! {
            "Type" => "Pages",
            "Kids" => page_ids.iter().map(|&id| Object::Reference(id)).collect::<Vec<_>>(),
            "Count" => page_ids.len() as u32,
        }),
    );
    let catalog_id = doc.add_object(dictionary! {
        "Type" => "Catalog",
        "Pages" => pages_id,
    });
    doc.trailer.set("Root", catalog_id);
    doc.save(&output).map_err(|e| format!("Не удалось сохранить: {e}"))?;
    Ok(PdfResult {
        pages: page_ids.len() as u32,
        size: size_of(&output),
    })
}

/// Извлечение текста из всех страниц PDF
#[tauri::command]
pub fn pdf_extract_text(path: String) -> Result<String, String> {
    let doc = Document::load(&path).map_err(|e| format!("Не удалось открыть PDF: {e}"))?;
    let count = doc.get_pages().len() as u32;
    if count == 0 {
        return Ok(String::new());
    }
    let numbers: Vec<u32> = (1..=count).collect();
    let text = doc.extract_text(&numbers).map_err(|e| format!("Не удалось извлечь текст: {e}"))?;
    Ok(text)
}

fn collect_refs(obj: &Object, out: &mut Vec<ObjectId>) {
    match obj {
        Object::Reference(id) => out.push(*id),
        Object::Dictionary(dict) => {
            for (_, value) in dict.iter() {
                collect_refs(value, out);
            }
        }
        Object::Array(arr) => {
            for value in arr {
                collect_refs(value, out);
            }
        }
        Object::Stream(stream) => {
            for (_, value) in stream.dict.iter() {
                collect_refs(value, out);
            }
        }
        _ => {}
    }
}

/// Оптимизация PDF: удаление неиспользуемых объектов и пересборка
#[tauri::command]
pub fn pdf_optimize(path: String, output: String) -> Result<OptimizeResult, String> {
    let before = size_of(&path);
    let mut doc = Document::load(&path).map_err(|e| format!("Не удалось открыть PDF: {e}"))?;

    let mut reachable: HashSet<ObjectId> = HashSet::new();
    let mut queue: Vec<ObjectId> = Vec::new();
    if let Ok(obj) = doc.trailer.get(b"Root").cloned() {
        collect_refs(&obj, &mut queue);
    }
    if let Ok(obj) = doc.trailer.get(b"Info").cloned() {
        collect_refs(&obj, &mut queue);
    }

    while let Some(id) = queue.pop() {
        if reachable.insert(id) {
            if let Some(obj) = doc.objects.get(&id).cloned() {
                collect_refs(&obj, &mut queue);
            }
        }
    }

    doc.objects.retain(|id, _| reachable.contains(id));
    doc.max_id = doc.objects.len() as u32;
    doc.renumber_objects();
    doc.save(&output).map_err(|e| format!("Не удалось сохранить: {e}"))?;
    let after = size_of(&output);

    Ok(OptimizeResult { before, after })
}

/* PDF → изображения. Требует pdftoppm из poppler в PATH. */
#[tauri::command]
pub fn pdf_to_images(path: String, output_dir: String, dpi: u32) -> Result<Vec<SplitResult>, String> {
    let base = Path::new(&path)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "page".to_string());
    let out_prefix = format!("{}/{}", output_dir.trim_end_matches('/'), base);
    let dpi = dpi.clamp(72, 600);
    let status = std::process::Command::new("pdftoppm")
        .arg("-png")
        .arg("-r")
        .arg(dpi.to_string())
        .arg(&path)
        .arg(&out_prefix)
        .status()
        .map_err(|e| format!("pdftoppm недоступен: {e}. Установите poppler (`brew install poppler`) или выберите другой способ"))?;
    if !status.success() {
        return Err("pdftoppm завершился с ошибкой".into());
    }
    let mut out = Vec::new();
    if let Ok(rd) = std::fs::read_dir(&output_dir) {
        for e in rd.flatten() {
            let fname = e.file_name().to_string_lossy().to_string();
            if fname.starts_with(&base) && fname.ends_with(".png") {
                out.push(SplitResult { name: fname, pages: 1 });
            }
        }
    }
    out.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(out)
}
