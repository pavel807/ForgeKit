/* Графика: конвертация, сжатие, изменение размера изображений, QR-коды */

use base64::Engine;
use image::codecs::gif::GifEncoder;
use image::codecs::jpeg::JpegEncoder;
use image::codecs::png::PngEncoder;
use image::codecs::webp::WebPEncoder;
use image::{DynamicImage, ExtendedColorType, ImageEncoder};
use serde::Serialize;
use std::io::Cursor;

#[derive(Debug, Serialize)]
pub struct ConvertResult {
    pub width: u32,
    pub height: u32,
    pub size: u64,
    pub original: u64,
}

#[derive(Debug, Serialize)]
pub struct QrResult {
    pub png_base64: String,
}

fn load(path: &str) -> Result<DynamicImage, String> {
    let bytes = std::fs::read(path).map_err(|e| format!("Не удалось прочитать файл: {e}"))?;
    let img = image::load_from_memory(&bytes).map_err(|e| format!("Не удалось открыть изображение: {e}"))?;
    Ok(img)
}

fn save(buf: &[u8], path: &str, original: u64) -> Result<ConvertResult, String> {
    std::fs::write(path, buf).map_err(|e| format!("Не удалось сохранить файл: {e}"))?;
    let size = std::fs::metadata(path).map(|m| m.len()).unwrap_or(0);
    let img = load(path)?;
    Ok(ConvertResult {
        width: img.width(),
        height: img.height(),
        size,
        original,
    })
}

fn encode_to(img: &DynamicImage, format: &str, quality: u8) -> Result<Vec<u8>, String> {
    let q = quality.clamp(1, 100);
    let mut buf = Vec::new();
    match format {
        "png" => {
            let rgba = img.to_rgba8();
            PngEncoder::new(&mut buf)
                .write_image(rgba.as_raw(), img.width(), img.height(), ExtendedColorType::Rgba8)
                .map_err(|e| e.to_string())?;
        }
        "jpeg" => {
            let rgb = img.to_rgb8();
            let enc = JpegEncoder::new_with_quality(&mut buf, q);
            enc.write_image(rgb.as_raw(), img.width(), img.height(), ExtendedColorType::Rgb8)
                .map_err(|e| e.to_string())?;
        }
        "webp" => {
            let rgba = img.to_rgba8();
            WebPEncoder::new_lossless(&mut buf)
                .encode(rgba.as_raw(), img.width(), img.height(), ExtendedColorType::Rgba8)
                .map_err(|e| e.to_string())?;
        }
        "gif" => {
            let rgba = img.to_rgba8();
            GifEncoder::new(&mut buf)
                .encode(rgba.as_raw(), img.width(), img.height(), ExtendedColorType::Rgba8)
                .map_err(|e| e.to_string())?;
        }
        "bmp" => {
            let rgb = img.to_rgb8();
            image::codecs::bmp::BmpEncoder::new(&mut buf)
                .write_image(rgb.as_raw(), img.width(), img.height(), ExtendedColorType::Rgb8)
                .map_err(|e| e.to_string())?;
        }
        "tiff" => {
            let rgb = img.to_rgb8();
            let mut cursor = Cursor::new(Vec::new());
            image::codecs::tiff::TiffEncoder::new(&mut cursor)
                .write_image(rgb.as_raw(), img.width(), img.height(), ExtendedColorType::Rgb8)
                .map_err(|e| e.to_string())?;
            buf = cursor.into_inner();
        }
        "ico" => {
            let rgba = img.to_rgba8();
            image::codecs::ico::IcoEncoder::new(&mut buf)
                .write_image(rgba.as_raw(), img.width(), img.height(), ExtendedColorType::Rgba8)
                .map_err(|e| e.to_string())?;
        }
        other => return Err(format!("Формат не поддерживается: {other}")),
    }
    Ok(buf)
}

fn guess_format(path: &str) -> &'static str {
    let lower = path.to_lowercase();
    if lower.ends_with(".png") {
        "png"
    } else if lower.ends_with(".webp") {
        "webp"
    } else if lower.ends_with(".gif") {
        "gif"
    } else if lower.ends_with(".bmp") {
        "bmp"
    } else if lower.ends_with(".tiff") || lower.ends_with(".tif") {
        "tiff"
    } else if lower.ends_with(".ico") {
        "ico"
    } else {
        "jpeg"
    }
}

/// Конвертация изображения в выбранный формат
#[tauri::command]
pub fn convert_image(input_path: String, output_path: String, format: String, quality: u8) -> Result<ConvertResult, String> {
    let img = load(&input_path)?;
    let orig = std::fs::metadata(&input_path).map(|m| m.len()).unwrap_or(0);
    let buf = encode_to(&img, &format, quality)?;
    save(&buf, &output_path, orig)
}

/// Изменение размера изображения. Копия сохраняется рядом с оригиналом
/// под именем `имя_resized.расширение`.
#[tauri::command]
pub fn resize_image(input_path: String, width: u32, height: u32, fit: String) -> Result<ConvertResult, String> {
    let img = load(&input_path)?;
    let orig = std::fs::metadata(&input_path).map(|m| m.len()).unwrap_or(0);
    let (w, h) = (width.max(1), height.max(1));
    let out = match fit.as_str() {
        "exact" => img.resize_exact(w, h, image::imageops::FilterType::Triangle),
        "fit" => img.resize(w, h, image::imageops::FilterType::Triangle),
        _ => img.resize(w, h, image::imageops::FilterType::Triangle),
    };
    let format = guess_format(&input_path);
    let buf = encode_to(&out, format, 95)?;
    let output_path = sibling_path(&input_path, "_resized");
    save(&buf, &output_path, orig)
}

/// Сжатие изображения в JPEG с выбранным качеством. Копия сохраняется
/// рядом с оригиналом под именем `имя_compressed.jpg`.
#[tauri::command]
pub fn compress_image(input_path: String, quality: u8) -> Result<ConvertResult, String> {
    let img = load(&input_path)?;
    let orig = std::fs::metadata(&input_path).map(|m| m.len()).unwrap_or(0);
    let buf = encode_to(&img, "jpeg", quality)?;
    let output_path = sibling_path(&input_path, "_compressed.jpg");
    save(&buf, &output_path, orig)
}

/// Генерация QR-кода в PNG (base64)
#[tauri::command]
pub fn generate_qr(text: String, size: u32) -> Result<QrResult, String> {
    use qrcode::Color;

    let code = qrcode::QrCode::new(text.as_bytes()).map_err(|e| format!("Не удалось создать QR-код: {e}"))?;
    let cells = code.width() as u32;
    let colors = code.to_colors();
    let scale = (size / cells).max(3);
    let quiet = 4u32;
    let dim = (cells + quiet * 2) * scale;
    let mut img = image::RgbaImage::from_pixel(dim, dim, image::Rgba([255u8, 255u8, 255u8, 255u8]));

    for y in 0..cells {
        for x in 0..cells {
            if colors[(y * cells + x) as usize] == Color::Dark {
                for dy in 0..scale {
                    for dx in 0..scale {
                        img.put_pixel((quiet + x) * scale + dx, (quiet + y) * scale + dy, image::Rgba([0u8, 0u8, 0u8, 255u8]));
                    }
                }
            }
        }
    }

    let mut buf = Vec::new();
    PngEncoder::new(&mut buf)
        .write_image(img.as_raw(), dim, dim, ExtendedColorType::Rgba8)
        .map_err(|e| e.to_string())?;
    Ok(QrResult {
        png_base64: base64::engine::general_purpose::STANDARD.encode(&buf),
    })
}

/// Сохранение сгенерированного QR-кода (base64 PNG) в файл
#[tauri::command]
pub fn save_qr_image(path: String, png_base64: String) -> Result<(), String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(&png_base64)
        .map_err(|e| format!("Не удалось декодировать PNG: {e}"))?;
    std::fs::write(&path, &bytes).map_err(|e| format!("Не удалось записать файл: {e}"))
}

fn sibling_path(path: &str, suffix: &str) -> String {
    let p = std::path::Path::new(path);
    let parent = p.parent().map(|d| d.to_string_lossy().to_string()).unwrap_or_default();
    let stem = p.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "file".into());
    let ext = p.extension().map(|s| s.to_string_lossy().to_string()).unwrap_or_default();
    let suffix_stripped = suffix.strip_prefix('_').unwrap_or(&suffix);
    if ext.is_empty() {
        format!("{parent}/{stem}_{suffix_stripped}")
    } else {
        format!("{parent}/{stem}_{suffix_stripped}.{ext}")
    }
}
