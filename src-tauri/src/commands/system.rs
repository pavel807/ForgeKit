/* Система: информация о системе и список процессов */

use serde::Serialize;
use sysinfo::{Disks, ProcessesToUpdate, System};

#[derive(Debug, Serialize)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub hostname: String,
    pub kernel: String,
    pub arch: String,
    pub cpu_model: String,
    pub cpu_cores: usize,
    pub cpu_usage: f32,
    pub total_mem: u64,
    pub used_mem: u64,
    pub total_disk: u64,
    pub free_disk: u64,
    pub uptime_sec: u64,
}

#[derive(Debug, Serialize)]
pub struct ProcessEntry {
    pub pid: u32,
    pub name: String,
    pub cpu: f32,
    pub mem: u64,
    pub state: String,
}

/// Сводная информация о системе
#[tauri::command]
pub fn system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new();
    sys.refresh_cpu_all();
    std::thread::sleep(std::time::Duration::from_millis(120));
    sys.refresh_cpu_all();
    sys.refresh_memory();

    let cpu_model = sys.cpus().first().map(|c| c.brand().to_string()).unwrap_or_default();
    let cpu_cores = sys.cpus().len();
    let cpu_usage = sys.global_cpu_usage();
    let disks = Disks::new_with_refreshed_list();
    /* Основной диск: берём самый большой несъёмный том (на macOS APFS-тома
       и внешние диски не должны суммироваться), иначе сумма всех томов
       оказывается больше физического диска */
    let main_disk = disks
        .list()
        .iter()
        .filter(|d| !d.is_removable() && d.total_space() >= 10 * 1024 * 1024 * 1024)
        .max_by_key(|d| d.total_space());
    let total_disk = main_disk.map(|d| d.total_space()).unwrap_or(0);
    let free_disk = main_disk.map(|d| d.available_space()).unwrap_or(0);

    Ok(SystemInfo {
        os_name: System::name().unwrap_or_default(),
        os_version: System::os_version().unwrap_or_default(),
        hostname: System::host_name().unwrap_or_default(),
        kernel: System::kernel_version().unwrap_or_default(),
        arch: std::env::consts::ARCH.to_string(),
        cpu_model,
        cpu_cores,
        cpu_usage,
        total_mem: sys.total_memory(),
        used_mem: sys.used_memory(),
        total_disk,
        free_disk,
        uptime_sec: System::uptime(),
    })
}

fn status_str(s: &sysinfo::ProcessStatus) -> &'static str {
    use sysinfo::ProcessStatus::*;
    match s {
        Run => "Работает",
        Sleep | Waking | Wakekill | UninterruptibleDiskSleep => "Ожидает",
        Idle => "Простаивает",
        Stop => "Остановлен",
        Zombie => "Зомби",
        Dead => "Завершён",
        Tracing => "Трассировка",
        Parked => "Приостановлен",
        LockBlocked => "Заблокирован",
        _ => "Неизвестно",
    }
}

/// Список процессов с использованием CPU и памяти
#[tauri::command]
pub fn process_list() -> Result<Vec<ProcessEntry>, String> {
    let mut sys = System::new();
    sys.refresh_processes(ProcessesToUpdate::All, true);

    let mut out: Vec<ProcessEntry> = sys
        .processes()
        .iter()
        .map(|(_, p)| ProcessEntry {
            pid: p.pid().as_u32(),
            name: p.name().to_string_lossy().to_string(),
            cpu: p.cpu_usage(),
            mem: p.memory(),
            state: status_str(&p.status()).to_string(),
        })
        .collect();

    out.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap_or(std::cmp::Ordering::Equal));
    Ok(out)
}
