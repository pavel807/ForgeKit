/* Разработка: хэширование строк */

use hex::encode;

#[tauri::command]
pub fn hash_string(text: String, algorithm: String) -> Result<String, String> {
    let bytes = text.as_bytes();
    let out = match algorithm.as_str() {
        "md5" => {
            use md5::{Digest, Md5};
            let mut hasher = Md5::new();
            hasher.update(bytes);
            encode(&hasher.finalize())
        }
        "sha1" => {
            use sha1::Sha1;
            use sha2::Digest;
            let mut hasher = Sha1::new();
            hasher.update(bytes);
            encode(&hasher.finalize())
        }
        "sha256" => {
            use sha2::{Digest, Sha256};
            let mut hasher = Sha256::new();
            hasher.update(bytes);
            encode(&hasher.finalize())
        }
        "sha512" => {
            use sha2::{Digest, Sha512};
            let mut hasher = Sha512::new();
            hasher.update(bytes);
            encode(&hasher.finalize())
        }
        other => return Err(format!("Неизвестный алгоритм: {other}")),
    };
    Ok(out)
}
