/**
 * Utility functions + OS detection
 */

// ── OS / Keyboard detection ──────────────────────────────────────
export const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform) ||
  navigator.userAgent.includes('Macintosh');

export const isWindows = /Win/.test(navigator.platform) ||
  navigator.userAgent.includes('Windows');

export const isLinux = /Linux/.test(navigator.platform) &&
  !navigator.userAgent.includes('Android');

// Modifier key label
export const MOD = isMac ? '⌘' : 'Ctrl';

// Keyboard modifier check (works for both Mac Cmd and Win/Linux Ctrl)
export const hasModifier = (e) => e.metaKey || e.ctrlKey;

// Human-readable OS name
export const OS_NAME = isMac ? 'macOS'
  : isWindows ? 'Windows'
  : isLinux   ? 'Linux'
  : 'Sistema';

// OS icon class
export const OS_ICON = isMac ? 'fa-apple'
  : isWindows ? 'fa-windows'
  : 'fa-linux';

/**
 * Apply correct modifier key labels to all [data-mod="KEY"] elements.
 * Mac → ⌘KEY, Windows/Linux → Ctrl+KEY
 */
export function applyModifierLabels() {
  document.querySelectorAll('[data-mod]').forEach(el => {
    const key = el.dataset.mod;
    el.textContent = isMac ? `⌘${key}` : `Ctrl+${key}`;
  });

  // Update aria / title attributes
  document.querySelectorAll('[data-mod-aria]').forEach(el => {
    const key = el.dataset.modAria;
    const existing = el.getAttribute('title') || key;
    // Only update if it looks like a bare action label
    const modLabel = isMac ? `⌘${key}` : `Ctrl+${key}`;
    el.setAttribute('title', existing.includes('(') ? existing : `${existing} (${modLabel})`);
  });

  // OS badge in status bar
  const badge = document.getElementById('sb-os-badge');
  if (badge) {
    badge.innerHTML = `<i class="fa-brands ${OS_ICON}" style="margin-right:3px;opacity:.6;font-size:.75rem;"></i>${OS_NAME}`;
  }

  // Cmd palette trigger tooltip
  const trigger = document.getElementById('cmd-trigger');
  if (trigger) {
    trigger.setAttribute('title', `Paleta de comandos (${isMac ? '⌘K' : 'Ctrl+K'})`);
  }
}
