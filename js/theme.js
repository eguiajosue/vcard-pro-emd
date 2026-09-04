// Theme management (dark / light + system detection)
export function initTheme() {
  const saved = localStorage.getItem('theme');
  const sysLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = saved || (sysLight ? 'light' : 'dark');
  applyTheme(theme);
  // Buttons
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  document.getElementById('theme-nav-btn')?.addEventListener('click', toggleTheme);
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const icon = theme === 'light' ? 'fa-moon' : 'fa-sun';
  ['theme-icon','theme-nav-icon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = `fa-solid ${icon}`;
  });
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'light' ? 'dark' : 'light');
}
