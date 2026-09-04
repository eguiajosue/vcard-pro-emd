export const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform) ||
  navigator.userAgent.includes('Macintosh');

export const isWindows = /Win/.test(navigator.platform) ||
  navigator.userAgent.includes('Windows');

export const isLinux = /Linux/.test(navigator.platform) &&
  !navigator.userAgent.includes('Android');

export const MOD = isMac ? '⌘' : 'Ctrl';

export const hasModifier = (e) => e.metaKey || e.ctrlKey;

export const OS_NAME = isMac ? 'macOS'
  : isWindows ? 'Windows'
  : isLinux   ? 'Linux'
  : 'Sistema';

export const OS_ICON = isMac ? 'fa-apple'
  : isWindows ? 'fa-windows'
  : 'fa-linux';

export function modLabel(key) {
  return isMac ? `⌘${key}` : `Ctrl+${key}`;
}
