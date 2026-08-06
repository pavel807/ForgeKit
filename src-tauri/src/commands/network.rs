/* Сеть: ping (TCP), сканер портов, определение IP, whois */

use serde::Serialize;
use std::io::{Read, Write};
use std::net::{TcpStream, ToSocketAddrs};
use std::time::{Duration, Instant};

#[derive(Debug, Serialize)]
pub struct PingResult {
    pub ok: bool,
    pub latency_ms: Option<u64>,
    pub error: Option<String>,
}

/// Проверка доступности хоста и задержки (TCP-подключение)
#[tauri::command]
pub fn ping_host(host: String, port: u16, timeout_ms: u64) -> Result<PingResult, String> {
    let timeout = Duration::from_millis(timeout_ms.max(100));
    let addr = (host.as_str(), port)
        .to_socket_addrs()
        .map_err(|e| format!("Не удалось разрешить адрес: {e}"))?
        .next()
        .ok_or_else(|| "Адрес не найден".to_string())?;

    let start = Instant::now();
    match TcpStream::connect_timeout(&addr, timeout) {
        Ok(_) => Ok(PingResult {
            ok: true,
            latency_ms: Some(start.elapsed().as_millis() as u64),
            error: None,
        }),
        Err(e) => Ok(PingResult {
            ok: false,
            latency_ms: None,
            error: Some(format!("{e}")),
        }),
    }
}

/// Последовательное сканирование портов
#[tauri::command]
pub fn scan_ports(host: String, ports: Vec<u16>, timeout_ms: u64) -> Result<Vec<u16>, String> {
    let timeout = Duration::from_millis(timeout_ms.max(50));
    let mut open = Vec::new();
    for port in ports {
        let addr = (host.as_str(), port)
            .to_socket_addrs()
            .map_err(|e| format!("Не удалось разрешить адрес: {e}"))?
            .next()
            .ok_or_else(|| "Адрес не найден".to_string())?;
        if TcpStream::connect_timeout(&addr, timeout).is_ok() {
            open.push(port);
        }
    }
    Ok(open)
}

/// Определение публичного IP-адреса
#[tauri::command]
pub fn public_ip() -> Result<String, String> {
    let body = ureq::get("https://api.ipify.org")
        .timeout(Duration::from_secs(8))
        .call()
        .map_err(|e| format!("Не удалось определить IP: {e}"))?
        .into_string()
        .map_err(|e| e.to_string())?;
    Ok(body.trim().to_string())
}

fn whois_server(tld: &str) -> &'static str {
    match tld {
        "com" | "net" => "whois.verisign-grs.com",
        "org" => "whois.pir.org",
        "io" => "whois.nic.io",
        "ru" | "рф" => "whois.tcinet.ru",
        "de" => "whois.denic.de",
        "uk" => "whois.nic.uk",
        "eu" => "whois.eu",
        "info" => "whois.afilias.net",
        "biz" => "whois.nic.biz",
        "dev" | "app" | "page" | "blog" => "whois.nic.google",
        "me" => "whois.nic.me",
        "xyz" => "whois.nic.xyz",
        "ai" => "whois.nic.ai",
        "co" => "whois.nic.co",
        _ => "whois.iana.org",
    }
}

/// WHOIS-запрос по домену (сырой ответ сервера)
#[tauri::command]
pub fn whois(domain: String) -> Result<String, String> {
    let domain = domain.trim().to_lowercase();
    if domain.is_empty() {
        return Err("Введите домен".into());
    }
    let tld = domain.rsplit('.').next().unwrap_or("");
    let server = whois_server(tld);

    let mut stream = TcpStream::connect((server, 43)).map_err(|e| format!("Нет соединения с {server}: {e}"))?;
    stream
        .set_read_timeout(Some(Duration::from_secs(10)))
        .map_err(|e| e.to_string())?;
    stream
        .write_all(format!("{domain}\r\n").as_bytes())
        .map_err(|e| e.to_string())?;

    let mut buf = Vec::new();
    stream.read_to_end(&mut buf).map_err(|e| e.to_string())?;
    let text = String::from_utf8_lossy(&buf).to_string();
    let text = text.trim();
    if text.is_empty() {
        return Err("Сервер WHOIS вернул пустой ответ".into());
    }
    Ok(text.chars().take(20000).collect())
}
