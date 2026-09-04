import { showToast } from './toast.js';
import { openHelp } from './help.js';
import { MOD, hasModifier } from './utils.js';
import { toggleTheme } from './theme.js';
import { switchMode, switchSection, nextSection, prevSection } from './nav.js';
import { saveCurrentCard, newCard, openLibrary, openModal } from './library.js';
import { generarQR } from './qr.js';

const COMMANDS = [
  { label:'Nueva Tarjeta',    get sc() { return [MOD,'N']; }, icon:'fa-plus',         action: () => newCard() },
  { label:'Guardar Tarjeta',  get sc() { return [MOD,'S']; }, icon:'fa-floppy-disk',  action: () => saveCurrentCard() },
  { label:'Generar QR',       get sc() { return [MOD,'↵']; }, icon:'fa-qrcode',       action: () => generarQR() },
  { label:'Mis Tarjetas',     get sc() { return [MOD,'L']; }, icon:'fa-address-book', action: () => openLibrary() },
  { label:'Exportar',         get sc() { return [MOD,'E']; }, icon:'fa-download',     action: () => openModal('export-overlay') },
  { label:'Importar CSV',     sc:[],        icon:'fa-file-csv',     action: () => openModal('batch-overlay') },
  { label:'Plantillas',       sc:[],        icon:'fa-palette',      action: () => openModal('templates-overlay') },
  { label:'Cambiar Tema',     get sc() { return [MOD,'D']; }, icon:'fa-moon',         action: () => toggleTheme() },
  { label:'Modo Social QR',   sc:[],        icon:'fa-share-nodes',  action: () => switchMode('social') },
  { label:'Modo vCard',       sc:[],        icon:'fa-address-card', action: () => switchMode('vcard') },
  { label:'Ayuda / Tutorial',  sc:['?'],      icon:'fa-circle-question', action: () => openHelp() },
  { label:'Sec. Datos',       sc:[],        icon:'fa-user',         action: () => { switchMode('vcard'); switchSection('datos'); } },
  { label:'Sec. Trabajo',     sc:[],        icon:'fa-briefcase',    action: () => { switchMode('vcard'); switchSection('trabajo'); } },
  { label:'Sec. Direccion',   sc:[],        icon:'fa-location-dot', action: () => { switchMode('vcard'); switchSection('direccion'); } },
  { label:'Sec. Marca',       sc:[],        icon:'fa-palette',      action: () => { switchMode('vcard'); switchSection('marca'); } },
  { label:'Sec. Redes',       sc:[],        icon:'fa-hashtag',      action: () => { switchMode('vcard'); switchSection('redes'); } },
];

let focusIdx = 0;

export function initCommands() {
  document.getElementById('cmd-trigger')?.addEventListener('click', toggleCmd);
  document.getElementById('cmd-overlay')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeCmd(); });
  document.getElementById('cmd-input')?.addEventListener('input',   e => renderCmds(e.target.value));
  document.getElementById('cmd-input')?.addEventListener('keydown', cmdNav);

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    const mod = hasModifier(e);
    if (e.key === 'k' && mod) { e.preventDefault(); toggleCmd(); return; }
    if (e.key === 's' && mod) { e.preventDefault(); saveCurrentCard(); return; }
    if (e.key === 'n' && mod) { e.preventDefault(); newCard(); return; }
    if (e.key === 'l' && mod) { e.preventDefault(); openLibrary(); return; }
    if (e.key === 'e' && mod) { e.preventDefault(); openModal('export-overlay'); return; }
    if (e.key === 'd' && mod) { e.preventDefault(); toggleTheme(); return; }
    if (e.key === 'Enter' && mod) { e.preventDefault(); generarQR(); return; }
    if (e.key === 'ArrowRight' && mod) { e.preventDefault(); nextSection(); return; }
    if (e.key === 'ArrowLeft'  && mod) { e.preventDefault(); prevSection(); return; }
    if (e.key === 'Escape') {
      closeCmd();
      document.querySelectorAll('.modal-overlay.open, .cmd-overlay.open').forEach(m => m.classList.remove('open'));
    }
  });
}

function toggleCmd() {
  const ov = document.getElementById('cmd-overlay');
  if (ov.classList.contains('open')) { closeCmd(); }
  else { ov.classList.add('open'); renderCmds(''); setTimeout(() => document.getElementById('cmd-input')?.focus(), 50); }
}

function closeCmd() {
  document.getElementById('cmd-overlay')?.classList.remove('open');
  const inp = document.getElementById('cmd-input');
  if (inp) inp.value = '';
  focusIdx = 0;
}

function renderCmds(q) {
  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
  focusIdx = 0;
  const res = document.getElementById('cmd-results');
  res.innerHTML = filtered.length === 0
    ? `<div style="padding:18px;text-align:center;font-size:.77rem;color:var(--t2);">Sin resultados</div>`
    : filtered.map((c, i) => `
        <div class="cmd-item${i === 0 ? ' focused' : ''}" data-idx="${COMMANDS.indexOf(c)}">
          <div class="cmd-ico"><i class="fa-solid ${c.icon}"></i></div>
          <span class="cmd-lbl">${c.label}</span>
          ${c.sc.length ? `<div class="cmd-sc">${c.sc.map(k => `<kbd>${k}</kbd>`).join('')}</div>` : ''}
        </div>`).join('');
  res.addEventListener('click', e => {
    const item = e.target.closest('.cmd-item');
    if (item) { closeCmd(); COMMANDS[+item.dataset.idx]?.action(); }
  }, { once: true });
}

function cmdNav(e) {
  const items = document.querySelectorAll('.cmd-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx = Math.min(focusIdx + 1, items.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx = Math.max(focusIdx - 1, 0); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    const q = document.getElementById('cmd-input')?.value || '';
    const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
    if (filtered[focusIdx]) { closeCmd(); filtered[focusIdx].action(); }
    return;
  }
  items.forEach((el, i) => el.classList.toggle('focused', i === focusIdx));
  items[focusIdx]?.scrollIntoView({ block: 'nearest' });
}
