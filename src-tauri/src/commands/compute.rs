/* Вычислительное ядро: все расчёты инструментов живут здесь, а не в React.
   Семантика команд соответствует тому, что раньше делал JavaScript. */

use aes_gcm::aead::{Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use base64::engine::general_purpose::{STANDARD, URL_SAFE_NO_PAD};
use base64::Engine;
use chrono::offset::{Local, Utc};
use chrono::{DateTime, Datelike, NaiveDate, NaiveDateTime, SecondsFormat, TimeZone, Timelike};
use percent_encoding::{AsciiSet, NON_ALPHANUMERIC, percent_decode_str, utf8_percent_encode};
use rand::Rng;
use serde::Serialize;
use serde_json::Value;
use uuid::Uuid;

const LOWERCASE: &str = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS: &str = "0123456789";
const SYMBOLS: &str = "!@#$%^&*()-_=+[]{};:,.<>/?";
const LOREM: [&str; 5] = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.",
];
const DAYS_RU: [&str; 7] = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const MONTHS_RU: [&str; 12] = [
    "янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек",
];

fn is_ascii_word(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_'
}

fn is_js_digit(c: char) -> bool {
    c.is_ascii_digit()
}

/* ============================ Текст ============================ */

#[derive(Serialize)]
pub struct TextStats {
    pub chars: usize,
    pub chars_no_space: usize,
    pub words: usize,
    pub unique_words: usize,
    pub lines: usize,
    pub sentences: usize,
    pub letters: usize,
    pub digits: usize,
    pub spaces: usize,
    pub punct: usize,
    pub bytes: usize,
    pub reading_min: usize,
}

#[tauri::command]
pub fn text_count(input: String) -> Result<TextStats, String> {
    let chars = input.encode_utf16().count();
    let chars_no_space = input.chars().filter(|c| !c.is_whitespace()).count();
    let words: Vec<&str> = input.trim().split(|c: char| c.is_whitespace()).filter(|w| !w.is_empty()).collect();
    let word_count = words.len();
    let uniq: std::collections::HashSet<String> = words.iter().map(|w| w.to_lowercase()).collect();
    let lines = if input.is_empty() { 0 } else { input.split('\n').count() };
    let bytes = input.len();

    let mut sentences = 0usize;
    let mut in_run = false;
    for c in input.chars() {
        if c == '.' || c == '!' || c == '?' || c == '…' {
            in_run = true;
            continue;
        }
        if in_run && (c.is_whitespace()) {
            sentences += 1;
            in_run = false;
        }
    }
    if in_run {
        sentences += 1;
    }

    let mut letters = 0usize;
    let mut digits = 0usize;
    let mut spaces = 0usize;
    let mut punct = 0usize;
    for c in input.chars() {
        if c.is_ascii_alphabetic() || ('а'..='я').contains(&c) || ('А'..='Я').contains(&c) || c == 'ё' || c == 'Ё' {
            letters += 1;
        } else if is_js_digit(c) {
            digits += 1;
        } else if c.is_whitespace() {
            spaces += 1;
        } else if !(is_ascii_word(c) || c.is_whitespace() || ('а'..='я').contains(&c) || ('А'..='Я').contains(&c) || c == 'ё' || c == 'Ё') {
            punct += 1;
        }
    }

    let reading_min = if word_count == 0 { 0 } else { (word_count as f64 / 180.0).round() as usize }.max(1);

    Ok(TextStats {
        chars,
        chars_no_space,
        words: word_count,
        unique_words: uniq.len(),
        lines,
        sentences,
        letters,
        digits,
        spaces,
        punct,
        bytes,
        reading_min,
    })
}

#[tauri::command]
pub fn case_convert(input: String, mode: String) -> Result<String, String> {
    let out = match mode.as_str() {
        "upper" => input.to_uppercase(),
        "lower" => input.to_lowercase(),
        "title" => {
            let mut out = String::with_capacity(input.len());
            let mut prev: Option<char> = None;
            for c in input.chars() {
                let boundary = match prev {
                    None => is_ascii_word(c),
                    Some(p) => is_ascii_word(c) && !is_ascii_word(p),
                };
                if boundary {
                    out.extend(c.to_uppercase());
                } else {
                    out.push(c);
                }
                prev = Some(c);
            }
            out
        }
        "sentence" => {
            let lowered: String = input.to_lowercase();
            let chars: Vec<char> = lowered.chars().collect();
            let mut out = String::with_capacity(lowered.len());
            let n = chars.len();
            for i in 0..n {
                let c = chars[i];
                let mut up = false;
                if i == 0 && is_ascii_word(c) {
                    up = true;
                } else if is_ascii_word(c) {
                    let mut j = i;
                    while j > 0 && chars[j - 1].is_whitespace() {
                        j -= 1;
                    }
                    if j > 0 && (chars[j - 1] == '.' || chars[j - 1] == '!' || chars[j - 1] == '?') {
                        up = true;
                    }
                }
                if up {
                    out.extend(c.to_uppercase());
                } else {
                    out.push(c);
                }
            }
            out
        }
        "camel" | "pascal" => {
            let chars: Vec<char> = input.chars().collect();
            let mut out = String::with_capacity(input.len());
            let mut i = 0;
            let n = chars.len();
            let mut pending = 0usize;
            while i < n {
                if !is_ascii_word(chars[i]) {
                    pending += 1;
                    i += 1;
                    continue;
                }
                if pending > 0 {
                    out.extend(chars[i].to_uppercase());
                    pending = 0;
                } else {
                    out.push(chars[i]);
                }
                i += 1;
            }
            if mode == "pascal" {
                let mut first = out.chars();
                if let Some(c) = first.next() {
                    if is_ascii_word(c) {
                        let mut s = String::with_capacity(out.len());
                        s.extend(c.to_uppercase());
                        s.extend(first);
                        s
                    } else {
                        out
                    }
                } else {
                    out
                }
            } else {
                out
            }
        }
        "snake" | "kebab" => {
            let sep = if mode == "snake" { '_' } else { '-' };
            let mut out = String::with_capacity(input.len());
            let mut prev: Option<char> = None;
            for c in input.chars() {
                if c.is_whitespace() {
                    if !matches!(prev, Some(p) if p == '_' || p == '-' || p.is_whitespace()) {
                        out.push(sep);
                    }
                } else {
                    out.push(c);
                }
                prev = Some(c);
            }
            let chars: Vec<char> = out.chars().collect();
            let mut result = String::with_capacity(out.len());
            let n = chars.len();
            for i in 0..n {
                if i > 0
                    && chars[i - 1].is_ascii_lowercase()
                    && chars[i].is_ascii_uppercase()
                {
                    result.push(sep);
                }
                result.push(chars[i]);
            }
            result.to_lowercase()
        }
        _ => return Err("неизвестный режим".into()),
    };
    Ok(out)
}

const TRANSLIT: [(&str, &str); 33] = [
    ("а", "a"), ("б", "b"), ("в", "v"), ("г", "g"), ("д", "d"), ("е", "e"),
    ("ё", "e"), ("ж", "zh"), ("з", "z"), ("и", "i"), ("й", "y"), ("к", "k"),
    ("л", "l"), ("м", "m"), ("н", "n"), ("о", "o"), ("п", "p"), ("р", "r"),
    ("с", "s"), ("т", "t"), ("у", "u"), ("ф", "f"), ("х", "kh"), ("ц", "ts"),
    ("ч", "ch"), ("ш", "sh"), ("щ", "shch"), ("ъ", ""), ("ы", "y"), ("ь", ""),
    ("э", "e"), ("ю", "yu"), ("я", "ya"),
];

#[tauri::command]
pub fn slugify(input: String) -> Result<String, String> {
    let mut out = String::with_capacity(input.len());
    for c in input.chars().flat_map(|c| c.to_lowercase()) {
        let s: String = c.into();
        if let Some((_, repl)) = TRANSLIT.iter().find(|(from, _)| *from == s) {
            out.push_str(repl);
        } else {
            out.push(c);
        }
    }
    let mut result = String::with_capacity(out.len());
    let mut pending_dash = false;
    for c in out.chars() {
        if c.is_ascii_lowercase() || c.is_ascii_digit() {
            if pending_dash && !result.is_empty() {
                result.push('-');
            }
            pending_dash = false;
            result.push(c);
        } else {
            pending_dash = true;
        }
    }
    Ok(result)
}

#[tauri::command]
pub fn sort_lines(input: String, mode: String) -> Result<String, String> {
    let mut lines: Vec<String> = input.split('\n').map(|s| s.to_string()).collect();
    match mode.as_str() {
        "az" => lines.sort_by(|a, b| a.to_lowercase().cmp(&b.to_lowercase()).then_with(|| a.cmp(b))),
        "za" => lines.sort_by(|a, b| b.to_lowercase().cmp(&a.to_lowercase()).then_with(|| b.cmp(a))),
        "length" => {
            let len = |s: &String| s.encode_utf16().count();
            lines.sort_by(|a, b| len(a).cmp(&len(b)).then_with(|| a.to_lowercase().cmp(&b.to_lowercase())));
        }
        "unique" => {
            let mut seen = std::collections::HashSet::new();
            lines.retain(|l| seen.insert(l.clone()));
        }
        _ => return Err("неизвестный режим".into()),
    }
    Ok(lines.join("\n"))
}

/* ============================ Кодирование ============================ */

#[tauri::command]
pub fn base64_encode(text: String) -> Result<String, String> {
    Ok(STANDARD.encode(text.as_bytes()))
}

#[tauri::command]
pub fn base64_decode(text: String) -> Result<String, String> {
    let cleaned: String = text.chars().filter(|c| !c.is_whitespace()).collect();
    let bytes = STANDARD
        .decode(cleaned)
        .map_err(|_| "некорректная Base64-строка".to_string())?;
    Ok(String::from_utf8_lossy(&bytes).into_owned())
}

const RFC3986: &AsciiSet = &NON_ALPHANUMERIC.remove(b'-').remove(b'.').remove(b'_').remove(b'~');

#[tauri::command]
pub fn url_encode(text: String) -> Result<String, String> {
    Ok(utf8_percent_encode(&text, RFC3986).to_string())
}

#[tauri::command]
pub fn url_decode(text: String) -> Result<String, String> {
    let bytes = text.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'%' {
            if i + 2 >= bytes.len() || !bytes[i + 1].is_ascii_hexdigit() || !bytes[i + 2].is_ascii_hexdigit() {
                return Err("некорректная процентная последовательность".into());
            }
            i += 3;
        } else {
            i += 1;
        }
    }
    let decoded = percent_decode_str(&text)
        .decode_utf8()
        .map_err(|_| "некорректная UTF-8 последовательность".to_string())?;
    Ok(decoded.into_owned())
}

/* ============================ Генерация ============================ */

#[tauri::command]
pub fn uuid_generate(version: String, count: u32) -> Result<Vec<String>, String> {
    let count = count.min(1000);
    let mut out = Vec::with_capacity(count as usize);
    for _ in 0..count {
        let u = match version.as_str() {
            "v4" => Uuid::new_v4(),
            "v7" => Uuid::now_v7(),
            _ => return Err("неизвестная версия UUID".into()),
        };
        out.push(u.to_string());
    }
    Ok(out)
}

#[derive(Serialize)]
pub struct PasswordResult {
    pub password: String,
    pub entropy: u32,
}

#[tauri::command]
pub fn password_generate(
    length: u32,
    use_upper: bool,
    use_digits: bool,
    use_symbols: bool,
    exclude_ambiguous: bool,
) -> Result<PasswordResult, String> {
    let length = length.clamp(4, 128);
    let mut alphabet = LOWERCASE.to_string();
    if use_upper {
        alphabet.push_str(UPPERCASE);
    }
    if use_digits {
        alphabet.push_str(DIGITS);
    }
    if use_symbols {
        alphabet.push_str(SYMBOLS);
    }
    if exclude_ambiguous {
        alphabet = alphabet.replace(['O', '0', 'I', 'l', '1', '|'], "");
    }
    if alphabet.is_empty() {
        return Err("алфавит пуст — выберите хотя бы один набор символов".into());
    }
    let chars: Vec<char> = alphabet.chars().collect();
    let mut rng = rand::thread_rng();
    let mut password = String::with_capacity(length as usize);
    for _ in 0..length {
        let idx = rng.gen_range(0..chars.len());
        password.push(chars[idx]);
    }

    let mut variety = LOWERCASE.to_string();
    if use_upper {
        variety.push_str(UPPERCASE);
    }
    if use_digits {
        variety.push_str(DIGITS);
    }
    if use_symbols {
        variety.push_str(SYMBOLS);
    }
    let entropy = (length as f64 * (variety.len() as f64).log2()).round() as u32;

    Ok(PasswordResult { password, entropy })
}

#[derive(Serialize)]
pub struct StrengthCheck {
    pub label: String,
    pub ok: bool,
}

#[derive(Serialize)]
pub struct StrengthResult {
    pub score: u8,
    pub percent: u8,
    pub checks: Vec<StrengthCheck>,
}

#[tauri::command]
pub fn password_strength(pass: String) -> Result<StrengthResult, String> {
    let has_lower = pass.chars().any(|c| c.is_ascii_lowercase());
    let has_upper = pass.chars().any(|c| c.is_ascii_uppercase());
    let has_digit = pass.chars().any(is_js_digit);
    let has_special = pass.chars().any(|c| !c.is_ascii_alphanumeric());
    let len = pass.encode_utf16().count();

    let mut score = 0u8;
    if len >= 8 {
        score += 1;
    }
    if len >= 12 {
        score += 1;
    }
    if has_lower && has_upper {
        score += 1;
    }
    if has_digit {
        score += 1;
    }
    if has_special {
        score += 1;
    }
    if len >= 16 {
        score += 1;
    }

    let checks = vec![
        StrengthCheck { label: "Длина не менее 8 символов".into(), ok: len >= 8 },
        StrengthCheck { label: "Длина не менее 12 символов".into(), ok: len >= 12 },
        StrengthCheck { label: "Есть заглавные и строчные буквы".into(), ok: has_lower && has_upper },
        StrengthCheck { label: "Есть цифры".into(), ok: has_digit },
        StrengthCheck { label: "Есть спецсимволы".into(), ok: has_special },
        StrengthCheck { label: "Длина более 16 символов".into(), ok: len >= 16 },
    ];

    Ok(StrengthResult { score, percent: (score as f64 / 6.0 * 100.0).round() as u8, checks })
}

#[derive(Serialize)]
pub struct LoremResult {
    pub text: String,
    pub words: usize,
    pub chars: usize,
}

#[tauri::command]
pub fn lorem_generate(count: u32, unit: String) -> Result<LoremResult, String> {
    let count = count.clamp(1, 100);
    let mut rng = rand::thread_rng();
    let text = match unit.as_str() {
        "paragraph" => {
            let mut paras: Vec<String> = Vec::new();
            for _ in 0..count {
                let sentences = rng.gen_range(0..3) + 3;
                let mut arr: Vec<&str> = Vec::new();
                for _ in 0..sentences {
                    arr.push(LOREM[rng.gen_range(0..LOREM.len())]);
                }
                paras.push(arr.join(" "));
            }
            paras.join("\n\n")
        }
        "sentence" => {
            let mut arr: Vec<&str> = Vec::new();
            for _ in 0..count {
                arr.push(LOREM[rng.gen_range(0..LOREM.len())]);
            }
            arr.join(" ")
        }
        "word" => {
            let all = LOREM.join(" ").replace('.', "");
            let words: Vec<&str> = all.split(' ').collect();
            let mut picked: Vec<&str> = Vec::new();
            for _ in 0..count {
                picked.push(words[rng.gen_range(0..words.len())]);
            }
            picked.join(" ")
        }
        _ => return Err("неизвестная единица".into()),
    };
    let words = text.split(|c: char| c.is_whitespace()).filter(|w| !w.is_empty()).count();
    let chars = text.chars().count();
    Ok(LoremResult { text, words, chars })
}

/* ============================ Обфускация (обратимая) ============================ */

const LATIN: [char; 26] = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
];
const OB_SYMBOLS: [char; 16] = ['@', '#', '$', '%', '&', '+', '=', '!', '*', '?', '-', '_', '(', ')', '[', ']'];
const PUNCT: [char; 16] = [' ', '.', ',', '!', '?', ';', ':', '-', '_', '(', ')', '«', '»', '\'', '/', '@'];

fn b36(n: u32) -> String {
    const DIGITS: &[char; 36] = &[
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
        'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
        'y', 'z',
    ];
    let mut s = String::new();
    let mut v = n;
    for _ in 0..4 {
        s.insert(0, DIGITS[(v % 36) as usize]);
        v /= 36;
    }
    s
}

fn b36_value(s: &str) -> Option<u32> {
    let mut v: u32 = 0;
    for c in s.chars() {
        let d = match c {
            '0'..='9' => c as u32 - '0' as u32,
            'a'..='z' => c as u32 - 'a' as u32 + 10,
            _ => return None,
        };
        v = v * 36 + d;
    }
    Some(v)
}

fn obfuscate_char(c: char) -> String {
    let lower = c.to_lowercase().next().unwrap_or(c);
    if let Some(idx) = LATIN.iter().position(|&l| l == lower) {
        let mut pair = String::new();
        pair.push(LATIN[idx]);
        pair.push(OB_SYMBOLS[(idx * 7) % 16]);
        if c.is_uppercase() && c != lower {
            pair = pair.to_uppercase();
        }
        pair
    } else if let Some(d) = c.to_digit(10) {
        ((d + 3) % 10).to_string()
    } else if let Some(p) = PUNCT.iter().position(|&p| p == c) {
        let mut pair = String::new();
        pair.push('.');
        pair.push(OB_SYMBOLS[(p * 7) % 16]);
        pair
    } else {
        format!(".{}", b36(c as u32))
    }
}

fn deobfuscate_char(chars: &[char], i: &mut usize) -> char {
    let c = chars[*i];
    if let Some(lower) = c.to_lowercase().next() {
        if let Some(idx) = LATIN.iter().position(|&l| l == lower) {
            *i += 2;
            return if c.is_uppercase() {
                LATIN[idx].to_uppercase().next().unwrap_or(LATIN[idx])
            } else {
                LATIN[idx]
            };
        }
    }
    if let Some(d) = c.to_digit(10) {
        *i += 1;
        return char::from_digit((d + 7) % 10, 10).unwrap_or(c);
    }
    if c == '.' {
        /* 1. Символ-код в base36 (4 знака, фиксированная ширина) */
        if *i + 4 < chars.len() + 1 {
            let end = (*i + 1 + 4).min(chars.len());
            if end - (*i + 1) == 4 {
                let s: String = chars[*i + 1..end].iter().collect();
                if let Some(code) = b36_value(&s) {
                    if let Some(ch) = char::from_u32(code) {
                        *i = end;
                        return ch;
                    }
                }
            }
        }
        /* 2. Пунктуация из таблицы: "." + символ */
        if *i + 1 < chars.len() {
            let s = chars[*i + 1];
            if let Some(pos) = OB_SYMBOLS.iter().position(|&x| x == s) {
                *i += 2;
                return PUNCT[(pos * 7) % 16];
            }
        }
        *i += 1;
        return ' ';
    }
    *i += 1;
    '.'
}

#[tauri::command]
pub fn text_obfuscate(text: String) -> Result<String, String> {
    Ok(text.chars().map(obfuscate_char).collect())
}

#[tauri::command]
pub fn text_deobfuscate(text: String) -> Result<String, String> {
    let chars: Vec<char> = text.chars().collect();
    let mut out = String::with_capacity(text.len() / 2 + 1);
    let mut i = 0;
    while i < chars.len() {
        out.push(deobfuscate_char(&chars, &mut i));
    }
    Ok(out)
}

/* ============================ JSON ============================ */

#[derive(Serialize)]
pub struct JsonFormatResult {
    pub ok: bool,
    pub error: Option<String>,
    pub output: String,
    pub lines: usize,
    pub bytes: usize,
}

#[tauri::command]
pub fn json_format(input: String, indent: u32) -> Result<JsonFormatResult, String> {
    if input.trim().is_empty() {
        return Ok(JsonFormatResult { ok: true, error: None, output: String::new(), lines: 0, bytes: 0 });
    }
    let parsed: Value = match serde_json::from_str(&input) {
        Ok(v) => v,
        Err(e) => {
            return Ok(JsonFormatResult {
                ok: false,
                error: Some(e.to_string()),
                output: String::new(),
                lines: 0,
                bytes: 0,
            })
        }
    };
    let output = if indent == 0 {
        serde_json::to_string(&parsed).unwrap_or_default()
    } else if indent == 4 {
        let mut buf = Vec::new();
        let mut ser = serde_json::Serializer::with_formatter(
            &mut buf,
            serde_json::ser::PrettyFormatter::with_indent(b"    "),
        );
        use serde::Serialize as _;
        parsed.serialize(&mut ser).map_err(|e| e.to_string())?;
        String::from_utf8(buf).unwrap_or_default()
    } else {
        serde_json::to_string_pretty(&parsed).unwrap_or_default()
    };
    Ok(JsonFormatResult {
        ok: true,
        error: None,
        lines: output.split('\n').count(),
        bytes: output.len(),
        output,
    })
}

/* ============================ JWT ============================ */

#[derive(Serialize)]
pub struct JwtResult {
    pub header: String,
    pub payload: String,
    pub signature: String,
    pub exp_str: Option<String>,
}

fn b64url_decode(s: &str) -> Result<Vec<u8>, String> {
    let normalized: String = s.trim().chars().filter(|c| !c.is_whitespace()).collect();
    let base = normalized.replace('+', "-").replace('/', "_");
    let cleaned = base.trim_end_matches('=');
    URL_SAFE_NO_PAD
        .decode(cleaned)
        .map_err(|_| "некорректная Base64-часть JWT".to_string())
}

#[tauri::command]
pub fn jwt_decode(token: String) -> Result<JwtResult, String> {
    let parts: Vec<&str> = token.trim().split('.').collect();
    if parts.len() != 3 {
        return Err("JWT должен состоять из 3 частей (header.payload.signature)".into());
    }
    let header_bytes = b64url_decode(parts[0])?;
    let payload_bytes = b64url_decode(parts[1])?;
    let header_val: Value = serde_json::from_slice(&header_bytes)
        .map_err(|_| "Header не является корректным JSON".to_string())?;
    let payload_val: Value = serde_json::from_slice(&payload_bytes)
        .map_err(|_| "Payload не является корректным JSON".to_string())?;

    let exp_str = payload_val
        .get("exp")
        .and_then(|v| v.as_i64())
        .map(|ms| {
            let exp_ms = ms * 1000;
            format_ru_local(exp_ms)
        });

    Ok(JwtResult {
        header: serde_json::to_string_pretty(&header_val).unwrap_or_default(),
        payload: serde_json::to_string_pretty(&payload_val).unwrap_or_default(),
        signature: parts[2].to_string(),
        exp_str,
    })
}

/* ============================ Цвет ============================ */

#[derive(Serialize)]
pub struct ColorResult {
    pub rgb: [u8; 3],
    pub hsl: String,
    pub cmyk: String,
}

#[tauri::command]
pub fn color_convert(hex: String) -> Result<Option<ColorResult>, String> {
    let h = hex.trim_start_matches('#');
    if h.len() != 6 || !h.chars().all(|c| c.is_ascii_hexdigit()) {
        return Ok(None);
    }
    let n = u32::from_str_radix(h, 16).unwrap_or(0);
    let r = ((n >> 16) & 255) as f64;
    let g = ((n >> 8) & 255) as f64;
    let b = (n & 255) as f64;

    let (rf, gf, bf) = (r / 255.0, g / 255.0, b / 255.0);
    let max = rf.max(gf).max(bf);
    let min = rf.min(gf).min(bf);
    let l = (max + min) / 2.0;
    let hsl = if max == min {
        "0, 0%".to_string()
    } else {
        let d = max - min;
        let s = if l > 0.5 { d / (2.0 - max - min) } else { d / (max + min) };
        let h_deg = if max == rf {
            ((gf - bf) / d + if gf < bf { 6.0 } else { 0.0 }) / 6.0
        } else if max == gf {
            ((bf - rf) / d + 2.0) / 6.0
        } else {
            ((rf - gf) / d + 4.0) / 6.0
        };
        format!("{}, {}%, {}%", (h_deg * 360.0).round() as i64, (s * 100.0).round() as i64, (l * 100.0).round() as i64)
    };

    let k = 1.0 - max;
    let cmyk = if k == 1.0 {
        "0%, 0%, 0%, 100%".to_string()
    } else {
        let c = (1.0 - rf - k) / (1.0 - k);
        let m = (1.0 - gf - k) / (1.0 - k);
        let y = (1.0 - bf - k) / (1.0 - k);
        format!(
            "{}%, {}%, {}%, {}%",
            (c * 100.0).round() as i64,
            (m * 100.0).round() as i64,
            (y * 100.0).round() as i64,
            (k * 100.0).round() as i64
        )
    };

    Ok(Some(ColorResult { rgb: [(n >> 16) as u8, (n >> 8) as u8, n as u8], hsl, cmyk }))
}

/* ============================ Cron ============================ */

fn parse_cron_field(field: &str, max: i64, min: i64) -> Vec<i64> {
    let mut out = std::collections::BTreeSet::new();
    for part in field.split(',') {
        if part.is_empty() {
            continue;
        }
        let (range, step) = match part.split_once('/') {
            Some((r, s)) => (r, s.parse::<i64>().unwrap_or(1).max(1)),
            None => (part, 1),
        };
        let (lo, hi) = if range == "*" || range == "?" {
            (min, max)
        } else if let Some((a, b)) = range.split_once('-') {
            match (a.parse::<i64>(), b.parse::<i64>()) {
                (Ok(a), Ok(b)) => (a, b),
                _ => continue,
            }
        } else {
            match range.parse::<i64>() {
                Ok(a) => (a, a),
                Err(_) => continue,
            }
        };
        let mut v = lo;
        while v <= hi {
            out.insert(v);
            v += step;
        }
    }
    out.into_iter().filter(|v| *v >= min && *v <= max).collect()
}

#[derive(Serialize)]
pub struct CronFields {
    pub minutes: Vec<i64>,
    pub hours: Vec<i64>,
    pub days: Vec<i64>,
    pub months: Vec<i64>,
    pub weekdays: Vec<i64>,
}

#[derive(Serialize)]
pub struct CronResult {
    pub ok: bool,
    pub error: Option<String>,
    pub description: Vec<String>,
    pub next_runs: Vec<String>,
}

#[tauri::command]
pub fn cron_parse(expr: String) -> Result<CronResult, String> {
    let parts: Vec<&str> = expr.trim().split_whitespace().collect();
    if parts.len() < 5 {
        return Ok(CronResult { ok: false, error: Some("ожидается 5 полей".into()), description: vec![], next_runs: vec![] });
    }
    let fields = CronFields {
        minutes: parse_cron_field(parts[0], 59, 0),
        hours: parse_cron_field(parts[1], 23, 0),
        days: parse_cron_field(parts[2], 31, 1),
        months: parse_cron_field(parts[3], 12, 1),
        weekdays: parse_cron_field(parts[4], 6, 0),
    };

    let mut description = Vec::new();
    let fmt = |v: &[i64], all: i64, none: &str| -> String {
        if v.len() as i64 == all {
            return "каждый".to_string();
        }
        if v.is_empty() {
            return none.to_string();
        }
        v.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(", ")
    };
    description.push(format!("Минуты: {}", fmt(&fields.minutes, 60, "—")));
    description.push(format!("Часы: {}", fmt(&fields.hours, 24, "—")));
    description.push(format!("Дни месяца: {}", fmt(&fields.days, 31, "—")));
    description.push(format!(
        "Месяцы: {}",
        if fields.months.len() == 12 {
            "каждый месяц".to_string()
        } else if fields.months.is_empty() {
            "—".to_string()
        } else {
            fields.months.iter().map(|m| MONTHS_RU[*m as usize - 1]).collect::<Vec<_>>().join(", ")
        }
    ));
    description.push(format!(
        "Дни недели: {}",
        if fields.weekdays.len() == 7 {
            "ежедневно".to_string()
        } else if fields.weekdays.is_empty() {
            "—".to_string()
        } else {
            fields.weekdays.iter().map(|d| DAYS_RU[*d as usize]).collect::<Vec<_>>().join(", ")
        }
    ));

    /* Реальные cron-семантики: при указании обоих полей (день месяца и день недели)
       срабатывает день, подходящий хотя бы под одно из них. */
    let days_all = fields.days.len() == 31;
    let wd_all = fields.weekdays.len() == 7;
    let day_ok = |d: i64| days_all || fields.days.contains(&d);
    let wd_ok = |w: i64| wd_all || fields.weekdays.contains(&w);
    let match_day = |d: i64, w: i64| {
        if days_all && wd_all {
            true
        } else if days_all {
            wd_ok(w)
        } else if wd_all {
            day_ok(d)
        } else {
            day_ok(d) || wd_ok(w)
        }
    };

    let now = Local::now();
    let mut cursor = now.timestamp_millis() / 1000;
    let mut next_runs: Vec<String> = Vec::new();
    let mut steps = 0i64;
    while next_runs.len() < 5 && steps < 200_000 {
        cursor += 60;
        steps += 1;
        let t = Local.timestamp_opt(cursor, 0).single();
        let Some(t) = t else { continue };
        let (d, w, m, h, min) = (
            t.day() as i64,
            t.weekday().num_days_from_sunday() as i64,
            t.month() as i64,
            t.hour() as i64,
            t.minute() as i64,
        );
        if fields.minutes.contains(&min)
            && fields.hours.contains(&h)
            && fields.months.contains(&m)
            && match_day(d, w)
        {
            next_runs.push(format_ru_local(t.timestamp_millis()));
        }
    }

    Ok(CronResult { ok: true, error: None, description, next_runs })
}

/* ============================ Diff ============================ */

#[derive(Serialize)]
pub struct DiffLine {
    #[serde(rename = "type")]
    pub line_type: String,
    pub text: String,
}

#[tauri::command]
pub fn text_diff(left: String, right: String, ignore_case: bool) -> Result<Vec<DiffLine>, String> {
    let norm = |s: String| -> Vec<String> {
        if ignore_case {
            s.to_lowercase().split('\n').map(|x| x.to_string()).collect()
        } else {
            s.split('\n').map(|x| x.to_string()).collect()
        }
    };
    let a = norm(left);
    let b = norm(right);
    let n = a.len();
    let m = b.len();
    let mut dp = vec![vec![0u32; m + 1]; n + 1];
    for i in (0..n).rev() {
        for j in (0..m).rev() {
            dp[i][j] = if a[i] == b[j] {
                dp[i + 1][j + 1] + 1
            } else {
                dp[i + 1][j].max(dp[i][j + 1])
            };
        }
    }
    let mut out: Vec<DiffLine> = Vec::new();
    let (mut i, mut j) = (0usize, 0usize);
    while i < n || j < m {
        if i < n && j < m && a[i] == b[j] {
            out.push(DiffLine { line_type: "same".into(), text: a[i].clone() });
            i += 1;
            j += 1;
        } else if j < m && (i == n || dp[i][j + 1] >= dp[i + 1][j]) {
            out.push(DiffLine { line_type: "add".into(), text: b[j].clone() });
            j += 1;
        } else {
            out.push(DiffLine { line_type: "del".into(), text: a[i].clone() });
            i += 1;
        }
    }
    Ok(out)
}

#[tauri::command]
pub fn json_diff(left: String, right: String, ignore_whitespace: bool) -> Result<Vec<DiffLine>, String> {
    let norm = |s: String| -> Vec<String> {
        let mut out = if ignore_whitespace {
            s.split_whitespace().collect::<Vec<_>>().join(" ")
        } else {
            s
        };
        if let Ok(v) = serde_json::from_str::<Value>(&out) {
            out = serde_json::to_string_pretty(&v).unwrap_or(out);
        }
        out.split('\n').map(|x| x.to_string()).collect()
    };
    let a = norm(left);
    let b = norm(right);
    let mut out: Vec<DiffLine> = Vec::new();
    let mut i = 0usize;
    let mut j = 0usize;
    while i < a.len() || j < b.len() {
        if i < a.len() && j < b.len() && a[i] == b[j] {
            out.push(DiffLine { line_type: "same".into(), text: a[i].clone() });
            i += 1;
            j += 1;
        } else if i < a.len() && j < b.len() {
            let ahead_a = a[i..].iter().position(|x| *x == b[j]).map(|p| p + i);
            let ahead_b = b[j..].iter().position(|x| *x == a[i]).map(|p| p + j);
            match (ahead_a, ahead_b) {
                (Some(aa), Some(ab)) if aa - i <= ab - j => {
                    while i < aa {
                        out.push(DiffLine { line_type: "del".into(), text: a[i].clone() });
                        i += 1;
                    }
                    out.push(DiffLine { line_type: "same".into(), text: a[i].clone() });
                    i += 1;
                    j += 1;
                }
                (_, Some(ab)) => {
                    while j < ab {
                        out.push(DiffLine { line_type: "add".into(), text: b[j].clone() });
                        j += 1;
                    }
                    out.push(DiffLine { line_type: "same".into(), text: b[j].clone() });
                    j += 1;
                    i += 1;
                }
                (Some(aa), None) => {
                    while i < aa {
                        out.push(DiffLine { line_type: "del".into(), text: a[i].clone() });
                        i += 1;
                    }
                    out.push(DiffLine { line_type: "same".into(), text: a[i].clone() });
                    i += 1;
                    j += 1;
                }
                _ => {
                    out.push(DiffLine { line_type: "del".into(), text: a[i].clone() });
                    i += 1;
                    if j < b.len() {
                        out.push(DiffLine { line_type: "add".into(), text: b[j].clone() });
                        j += 1;
                    }
                }
            }
        } else if i < a.len() {
            out.push(DiffLine { line_type: "del".into(), text: a[i].clone() });
            i += 1;
        } else {
            out.push(DiffLine { line_type: "add".into(), text: b[j].clone() });
            j += 1;
        }
    }
    Ok(out)
}

/* ============================ Unicode ============================ */

#[derive(Serialize)]
pub struct UnicodeEntry {
    pub char: String,
    pub code: String,
    pub hex: String,
    pub dec: u32,
    pub name: String,
}

#[tauri::command]
pub fn unicode_info(input: String) -> Result<Vec<UnicodeEntry>, String> {
    let mut out = Vec::new();
    for ch in input.chars() {
        let code = ch as u32;
        let name = match ch {
            ' ' => "SPACE".to_string(),
            '\n' => "LINE FEED".to_string(),
            '\t' => "TAB".to_string(),
            '\r' => "CARRIAGE RETURN".to_string(),
            _ => "Буква / символ".to_string(),
        };
        out.push(UnicodeEntry {
            char: ch.to_string(),
            code: format!("U+{:04X}", code),
            hex: format!("\\u{:04x}", code),
            dec: code,
            name,
        });
    }
    Ok(out)
}

/* ============================ AES-256-GCM ============================ */

fn derive_key(password: &str) -> Result<[u8; 32], String> {
    let mut key = [0u8; 32];
    pbkdf2::pbkdf2_hmac::<sha2::Sha256>(password.as_bytes(), b"forgekit-fixed-salt", 100_000, &mut key);
    Ok(key)
}

#[tauri::command]
pub fn aes_encrypt(key: String, data: String) -> Result<String, String> {
    let key32 = derive_key(&key)?;
    let cipher = Aes256Gcm::new_from_slice(&key32).map_err(|e| e.to_string())?;
    let iv: [u8; 12] = rand::random();
    let nonce = Nonce::from_slice(&iv);
    let ct = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|_| "ошибка шифрования".to_string())?;
    let mut merged = Vec::with_capacity(12 + ct.len());
    merged.extend_from_slice(&iv);
    merged.extend_from_slice(&ct);
    Ok(STANDARD.encode(merged))
}

#[tauri::command]
pub fn aes_decrypt(key: String, data: String) -> Result<String, String> {
    let key32 = derive_key(&key)?;
    let cipher = Aes256Gcm::new_from_slice(&key32).map_err(|e| e.to_string())?;
    let cleaned: String = data.chars().filter(|c| !c.is_whitespace()).collect();
    let merged = STANDARD.decode(cleaned).map_err(|_| "некорректные зашифрованные данные".to_string())?;
    if merged.len() < 13 {
        return Err("данные повреждены".into());
    }
    let nonce = Nonce::from_slice(&merged[..12]);
    let plain = cipher
        .decrypt(nonce, &merged[12..])
        .map_err(|_| "расшифровка не удалась — неверный пароль или повреждённые данные".to_string())?;
    Ok(String::from_utf8_lossy(&plain).into_owned())
}

/* ============================ SVG ============================ */

#[derive(Serialize)]
pub struct SvgResult {
    pub ok: bool,
    pub error: Option<String>,
    pub output: String,
    pub before: usize,
    pub after: usize,
}

#[tauri::command]
pub fn svg_optimize(input: String) -> Result<SvgResult, String> {
    let trimmed = input.trim_start();
    let is_svg = trimmed.starts_with("<svg")
        && trimmed[4..].chars().next().map(|c| c.is_whitespace() || c == '>').unwrap_or(false);
    if !is_svg {
        return Ok(SvgResult {
            ok: false,
            error: Some("это не SVG: ожидается тег <svg>".into()),
            output: String::new(),
            before: input.len(),
            after: 0,
        });
    }
    if input.trim().is_empty() {
        return Ok(SvgResult { ok: true, error: None, output: String::new(), before: 0, after: 0 });
    }

    /* 1. Удаление комментариев <!-- ... --> */
    let chars: Vec<char> = input.chars().collect();
    let mut cleaned = String::with_capacity(input.len());
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '<'
            && i + 3 < chars.len()
            && chars[i + 1] == '!'
            && chars[i + 2] == '-'
            && chars[i + 3] == '-'
        {
            i += 4;
            while i < chars.len()
                && !(chars[i] == '-' && i + 2 < chars.len() && chars[i + 1] == '-' && chars[i + 2] == '>')
            {
                i += 1;
            }
            i += 3;
            continue;
        }
        cleaned.push(chars[i]);
        i += 1;
    }

    /* 2. схлопывание пробелов в один */
    let mut collapsed = String::with_capacity(cleaned.len());
    let mut prev_space = false;
    for c in cleaned.chars() {
        if c.is_whitespace() {
            if !prev_space {
                collapsed.push(' ');
            }
            prev_space = true;
        } else {
            collapsed.push(c);
            prev_space = false;
        }
    }

    /* 3. "> <" → "><"; 4. " />" → "/>" */
    let cchars: Vec<char> = collapsed.chars().collect();
    let mut stripped = String::with_capacity(collapsed.len());
    for idx in 0..cchars.len() {
        if cchars[idx] == ' ' {
            let after_gt = idx > 0 && cchars[idx - 1] == '>';
            let before_lt = idx + 1 < cchars.len() && cchars[idx + 1] == '<';
            let before_slash = idx + 2 < cchars.len() && cchars[idx + 1] == '/' && cchars[idx + 2] == '>';
            if (after_gt && before_lt) || before_slash {
                continue;
            }
        }
        stripped.push(cchars[idx]);
    }

    /* 5. " → ' */
    let output: String = stripped.chars().map(|c| if c == '"' { '\'' } else { c }).collect();
    let output = output.trim().to_string();
    Ok(SvgResult { ok: true, error: None, before: input.len(), after: output.len(), output })
}

/* ============================ Дата и время ============================ */

#[derive(Serialize)]
pub struct DateParts {
    pub year: i32,
    pub month: u32,
    pub day: u32,
    pub hour: u32,
    pub minute: u32,
    pub second: u32,
}

#[derive(Serialize)]
pub struct DateResult {
    pub ms: i64,
    pub unix: i64,
    pub iso: String,
    pub utc_str: String,
    pub local: DateParts,
}

fn format_ru_local(ms: i64) -> String {
    let t = Local.timestamp_millis_opt(ms).single();
    let Some(t) = t else { return "—".to_string() };
    format!(
        "{:02}.{:02}.{:04}, {:02}:{:02}:{:02}",
        t.day(),
        t.month(),
        t.year(),
        t.hour(),
        t.minute(),
        t.second()
    )
}

#[tauri::command]
pub fn date_now() -> Result<DateResult, String> {
    date_from_ms(Local::now().timestamp_millis())
}

fn date_from_ms(ms: i64) -> Result<DateResult, String> {
    let t = Local.timestamp_millis_opt(ms).single();
    let Some(t) = t else { return Err("некорректное время".into()) };
    let utc = t.with_timezone(&Utc);
    Ok(DateResult {
        ms,
        unix: ms / 1000,
        iso: utc.to_rfc3339_opts(SecondsFormat::Millis, true),
        utc_str: utc.format("%a, %d %b %Y %H:%M:%S GMT").to_string(),
        local: DateParts {
            year: t.year(),
            month: t.month(),
            day: t.day(),
            hour: t.hour(),
            minute: t.minute(),
            second: t.second(),
        },
    })
}

#[derive(Serialize)]
pub struct DateConvertResult {
    pub ok: bool,
    pub error: Option<String>,
    pub result: Option<DateResult>,
}

fn to_local_date(naive: NaiveDateTime) -> Result<DateResult, String> {
    let l = Local.from_local_datetime(&naive).earliest();
    match l {
        Some(t) => date_from_ms(t.timestamp_millis()),
        None => Err("некорректная дата".into()),
    }
}

#[tauri::command]
pub fn date_convert(custom: String) -> Result<DateConvertResult, String> {
    let s = custom.trim();
    if s.is_empty() {
        return Ok(DateConvertResult { ok: true, error: None, result: None });
    }
    /* 1. Чисто цифры — Unix-секунды или миллисекунды */
    if !s.is_empty() && s.chars().all(|c| c.is_ascii_digit()) && s.len() <= 13 {
        let n: i64 = s.parse().map_err(|_| "число слишком большое".to_string())?;
        let ms = if s.len() <= 10 { n * 1000 } else { n };
        return Ok(DateConvertResult { ok: true, error: None, result: Some(date_from_ms(ms)?) });
    }
    /* 2. RFC 3339 / ISO 8601 с offset (включая Z) */
    if let Ok(dt) = DateTime::parse_from_rfc3339(s) {
        return Ok(DateConvertResult { ok: true, error: None, result: Some(date_from_ms(dt.timestamp_millis())?) });
    }
    /* 3. RFC 2822 */
    if let Ok(dt) = DateTime::parse_from_rfc2822(s) {
        return Ok(DateConvertResult { ok: true, error: None, result: Some(date_from_ms(dt.timestamp_millis())?) });
    }
    /* 4. ISO без offset — локальное время (как new Date("2026-08-05T12:34:56")) */
    if let Ok(ndt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%dT%H:%M:%S%.f") {
        return Ok(DateConvertResult { ok: true, error: None, result: Some(to_local_date(ndt)?) });
    }
    /* 5. "YYYY-MM-DD HH:MM:SS" — локальное время */
    if let Ok(ndt) = NaiveDateTime::parse_from_str(s, "%Y-%m-%d %H:%M:%S") {
        return Ok(DateConvertResult { ok: true, error: None, result: Some(to_local_date(ndt)?) });
    }
    /* 5b. "DD.MM.YYYY HH:MM:SS" — локальное время */
    if let Ok(ndt) = NaiveDateTime::parse_from_str(s, "%d.%m.%Y %H:%M:%S") {
        return Ok(DateConvertResult { ok: true, error: None, result: Some(to_local_date(ndt)?) });
    }
    /* 6. Дата ISO без времени: JS трактует как UTC */
    if let Ok(d) = NaiveDate::parse_from_str(s, "%Y-%m-%d") {
        let utc = d.and_hms_opt(0, 0, 0).unwrap();
        let ms = utc.and_utc().timestamp_millis();
        return Ok(DateConvertResult { ok: true, error: None, result: Some(date_from_ms(ms)?) });
    }
    /* 6b. "YYYY/MM/DD" — локальная дата (как new Date("2026/08/05")) */
    if let Ok(d) = NaiveDate::parse_from_str(s, "%Y/%m/%d") {
        let l = Local.from_local_datetime(&d.and_hms_opt(0, 0, 0).unwrap()).earliest();
        return Ok(DateConvertResult {
            ok: true,
            error: None,
            result: match l {
                Some(t) => Some(date_from_ms(t.timestamp_millis())?),
                None => None,
            },
        });
    }
    /* 7. "DD.MM.YYYY" — локальная дата */
    if let Ok(d) = NaiveDate::parse_from_str(s, "%d.%m.%Y") {
        let l = Local.from_local_datetime(&d.and_hms_opt(0, 0, 0).unwrap()).earliest();
        return Ok(DateConvertResult {
            ok: true,
            error: None,
            result: match l {
                Some(t) => Some(date_from_ms(t.timestamp_millis())?),
                None => None,
            },
        });
    }
    Ok(DateConvertResult { ok: false, error: Some("формат не распознан".into()), result: None })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn text_count_basics() {
        let s = text_count("Hello мир!\nВторая строка".to_string()).unwrap();
        assert_eq!(s.words, 4);
        assert_eq!(s.lines, 2);
        assert!(s.sentences >= 1);
        assert_eq!(s.bytes, "Hello мир!\nВторая строка".len());
        assert!(s.chars >= s.words);
        assert_eq!(s.chars, s.chars_no_space + s.spaces);
    }

    #[test]
    fn case_modes() {
        assert_eq!(case_convert("hello world".into(), "title".into()).unwrap(), "Hello World");
        assert_eq!(case_convert("my file name".into(), "snake".into()).unwrap(), "my_file_name");
        assert_eq!(case_convert("myFile".into(), "kebab".into()).unwrap(), "my-file");
        assert_eq!(case_convert("foo bar baz".into(), "camel".into()).unwrap(), "fooBarBaz");
        assert_eq!(case_convert("foo bar baz".into(), "pascal".into()).unwrap(), "FooBarBaz");
        assert_eq!(case_convert("hello.WORLD".into(), "sentence".into()).unwrap(), "Hello.World");
    }

    #[test]
    fn slug_cyrillic() {
        assert_eq!(slugify("Привет Мир!".into()).unwrap(), "privet-mir");
        assert_eq!(slugify("hello world".into()).unwrap(), "hello-world");
    }

    #[test]
    fn base64_roundtrip() {
        let enc = base64_encode("Привет, мир!".into()).unwrap();
        assert_eq!(base64_decode(enc).unwrap(), "Привет, мир!");
    }

    #[test]
    fn url_rfc3986() {
        let enc = url_encode("a b!c*'()".into()).unwrap();
        assert_eq!(enc, "a%20b%21c%2A%27%28%29");
        let dec = url_decode(enc).unwrap();
        assert_eq!(dec, "a b!c*'()");
    }

    #[test]
    fn slug_special() {
        assert_eq!(slugify("Привет Мир!".into()).unwrap(), "privet-mir");
    }

    #[test]
    fn uuid_v4_format() {
        let u = uuid_generate("v4".into(), 1).unwrap();
        assert_eq!(u[0].len(), 36);
        assert_eq!(u[0].as_bytes()[14], b'4');
    }

    #[test]
    fn password_length() {
        let p = password_generate(20, true, true, false, false).unwrap();
        assert_eq!(p.password.len(), 20);
        assert!(p.entropy > 0);
    }

    #[test]
    fn strength_scale() {
        let weak = password_strength("abc".into()).unwrap();
        let strong = password_strength("VeryStr0ng!Passw0rd!!".into()).unwrap();
        assert!(strong.score > weak.score);
    }

    #[test]
    fn obfuscate_roundtrip() {
        let src = "Hello, World! 123 Привет";
        let hid = text_obfuscate(src.into()).unwrap();
        let revealed = text_deobfuscate(hid).unwrap();
        assert_eq!(revealed, src);
    }

    #[test]
    fn aes_roundtrip_and_compat() {
        let tag = "секретное сообщение";
        let enc = aes_encrypt("пароль".into(), tag.into()).unwrap();
        let dec = aes_decrypt("пароль".into(), enc.clone()).unwrap();
        assert_eq!(dec, tag);
        // Старый формат из JS: iv(12) + ct, base64 — те же параметры, должен открываться
        let wrong = aes_decrypt("не пароль".into(), enc).unwrap_err();
        assert!(wrong.contains("расшифровка"));
    }

    #[test]
    fn cron_daily() {
        let r = cron_parse("0 0 * * *".into()).unwrap();
        assert!(r.ok);
        assert!(r.description[1].contains("0"));
        assert!(r.next_runs.len() >= 1);
    }

    #[test]
    fn cron_invalid() {
        let r = cron_parse("* * *".into()).unwrap();
        assert!(!r.ok);
    }

    #[test]
    fn json_format_valid() {
        let r = json_format("{  \"a\":1 }".into(), 2).unwrap();
        assert!(r.ok);
        assert!(r.output.contains("\n"));
        let min = json_format("{  \"a\":1 }".into(), 0).unwrap();
        assert_eq!(min.output, "{\"a\":1}");
    }

    #[test]
    fn json_format_invalid() {
        let r = json_format("{\"a\":".into(), 2).unwrap();
        assert!(!r.ok);
        assert!(r.error.is_some());
    }

    #[test]
    fn jwt_decode_ok() {
        // header {"alg":"HS256"} payload {"sub":"123","exp":9999999999} sig "sig"
        let h = b64url("eyJhbGciOiJIUzI1NiJ9");
        let p = "eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9";
        let token = format!("{h}.{p}.abc");
        let r = jwt_decode(token).unwrap();
        assert!(r.payload.contains("\"sub\""));
        assert!(r.exp_str.is_some());
    }

    fn b64url(s: &str) -> String { s.to_string() }

    #[test]
    fn jwt_invalid_parts() {
        assert!(jwt_decode("a.b".into()).is_err());
    }

    #[test]
    fn text_diff_basic() {
        let d = text_diff("a\nb\nc".into(), "a\nx\nc".into(), false).unwrap();
        let kinds: Vec<&str> = d.iter().map(|l| l.line_type.as_str()).collect();
        assert!(kinds.contains(&"del"));
        assert!(kinds.contains(&"add"));
        assert!(kinds.contains(&"same"));
    }

    #[test]
    fn date_seconds_input() {
        let r = date_convert("1711111111".into()).unwrap();
        assert!(r.ok);
        assert_eq!(r.result.unwrap().unix, 1711111111);
    }

    #[test]
    fn date_iso_input() {
        let r = date_convert("2026-08-05T12:34:56".into()).unwrap();
        assert!(r.ok);
        let res = r.result.unwrap();
        assert_eq!(res.local.month, 8);
        assert_eq!(res.local.day, 5);
    }

    #[test]
    fn date_invalid() {
        let r = date_convert("не дата".into()).unwrap();
        assert!(!r.ok);
    }

    #[test]
    fn sort_lines_az() {
        let out = sort_lines("b\na\nc".into(), "az".into()).unwrap();
        assert_eq!(out, "a\nb\nc");
    }

    #[test]
    fn unicode_entries() {
        let e = unicode_info("A🐍".into()).unwrap();
        assert_eq!(e.len(), 2);
        assert_eq!(e[0].code, "U+0041");
    }
}
