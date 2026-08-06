/* История буфера обмена: мониторинг выполняется на стороне Rust (clipboard-monitor).
   Здесь остаётся только событие о копировании, сделанном самим приложением. */

export function notifyForgekitCopy(): void {
  window.dispatchEvent(new CustomEvent("forgekit-copy"));
}