/* Проверка обновлений: сравнение текущей версии с последним релизом GitHub */

import { invoke } from "@tauri-apps/api/core";

const FALLBACK_VERSION = "1.4.7";
const REPO = "pavel807/ForgeKit";

export type UpdateStatus = "checking" | "up-to-date" | "update" | "error";

export interface UpdateCheck {
  status: UpdateStatus;
  current: string;
  latest: string | null;
  releaseUrl: string | null;
}

function parseVersion(v: string): number[] {
  return v.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
}

export function isVersionNewer(a: string, b: string): boolean {
  const va = parseVersion(a);
  const vb = parseVersion(b);
  const len = Math.max(va.length, vb.length);
  for (let i = 0; i < len; i++) {
    const x = va[i] ?? 0;
    const y = vb[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

export async function getAppVersion(): Promise<string> {
  try {
    const v = await invoke<string>("get_app_version");
    if (v) return v;
  } catch {
    /* ignore */
  }
  return FALLBACK_VERSION;
}

export async function checkForUpdates(): Promise<UpdateCheck> {
  const current = await getAppVersion();
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const tag: string = data.tag_name ?? "";
    const url: string = data.html_url ?? `https://github.com/${REPO}/releases/latest`;
    return {
      status: isVersionNewer(tag, current) ? "update" : "up-to-date",
      current,
      latest: tag || null,
      releaseUrl: url,
    };
  } catch {
    return { status: "error", current, latest: null, releaseUrl: null };
  }
}