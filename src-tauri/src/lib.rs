mod commands;
mod db;

use db::AppDb;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::ShortcutState;

/// Иконка в системном трее: macOS — Menu Bar, Windows — системный трей.
/// Слева-клик показывает окно (Windows — открывает меню), меню: показать/выйти.
#[cfg(desktop)]
fn setup_tray(app: &tauri::App) -> tauri::Result<()> {
    use tauri::image::Image;
    use tauri::menu::{MenuBuilder, MenuItemBuilder};
    use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

    let show = MenuItemBuilder::with_id("show", "Показать ForgeKit").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Выйти из ForgeKit").build(app)?;
    let menu = MenuBuilder::new(app).item(&show).separator().item(&quit).build()?;

    let icon = Image::from_bytes(include_bytes!("../icons/tray-icon.png").as_ref())
        .map_err(|e| tauri::Error::Anyhow(e.into()))?;

    TrayIconBuilder::with_id("forgekit-tray")
        .icon(icon)
        .menu(&menu)
        .icon_as_template(cfg!(target_os = "macos"))
        .show_menu_on_left_click(cfg!(target_os = "windows"))
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.unminimize();
                    let _ = win.set_focus();
                }
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            #[cfg(not(target_os = "windows"))]
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.unminimize();
                    let _ = win.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["ctrl+space"])
                .expect("не удалось зарегистрировать глобальное сочетание Ctrl+Space")
                .with_handler(|app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        let _ = app.emit("show-search", ());
                    }
                })
                .build(),
        )
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            let conn = db::open(dir)?;
            let monitor_on = db::get_setting(&conn, "clipboard_monitor")
                .ok()
                .flatten()
                .map(|v| v != "false")
                .unwrap_or(true);
            app.manage(AppDb::new(conn));
            app.manage(commands::clipboard::MonitorEnabled(Arc::new(AtomicBool::new(monitor_on))));
            #[cfg(not(mobile))]
            let _ = commands::clipboard::start_monitor(app.handle().clone());
            #[cfg(desktop)]
            setup_tray(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::clipboard::clipboard_list,
            commands::clipboard::clipboard_get,
            commands::clipboard::clipboard_delete,
            commands::clipboard::clipboard_clear,
            commands::clipboard::clipboard_set_pinned,
            commands::clipboard::clipboard_set_favorite,
            commands::clipboard::clipboard_write,
            commands::clipboard::clipboard_restore,
            commands::clipboard::clipboard_store_text,
            commands::clipboard::clipboard_store_image,
            commands::clipboard::clipboard_monitor_set_enabled,
            commands::developer::hash_string,
            commands::compute::text_count,
            commands::compute::case_convert,
            commands::compute::slugify,
            commands::compute::sort_lines,
            commands::compute::base64_encode,
            commands::compute::base64_decode,
            commands::compute::url_encode,
            commands::compute::url_decode,
            commands::compute::uuid_generate,
            commands::compute::password_generate,
            commands::compute::password_strength,
            commands::compute::lorem_generate,
            commands::compute::text_obfuscate,
            commands::compute::text_deobfuscate,
            commands::compute::json_format,
            commands::compute::jwt_decode,
            commands::compute::color_convert,
            commands::compute::cron_parse,
            commands::compute::text_diff,
            commands::compute::json_diff,
            commands::compute::unicode_info,
            commands::compute::aes_encrypt,
            commands::compute::aes_decrypt,
            commands::compute::date_now,
            commands::compute::date_convert,
            commands::compute::svg_optimize,
            commands::files::files_scan,
            commands::files::files_find_duplicates,
            commands::files::files_rename,
            commands::files::files_organize,
            commands::files::files_size_breakdown,
            commands::files::write_text_file,
            commands::files::copy_file,
            commands::system::system_info,
            commands::system::process_list,
            commands::system::get_app_version,
            commands::network::ping_host,
            commands::network::scan_ports,
            commands::network::public_ip,
            commands::network::whois,
            commands::graphics::convert_image,
            commands::graphics::resize_image,
            commands::graphics::compress_image,
            commands::graphics::generate_qr,
            commands::graphics::save_qr_image,
            commands::pdf::pdf_merge,
            commands::pdf::pdf_split,
            commands::pdf::pdf_info,
            commands::pdf::image_to_pdf,
            commands::pdf::pdf_extract_text,
            commands::pdf::pdf_optimize,
            commands::pdf::pdf_to_images,
            commands::settings::settings_get,
            commands::settings::settings_set,
            commands::settings::settings_get_all,
        ])
        .run(tauri::generate_context!())
        .expect("ошибка запуска ForgeKit");
}
