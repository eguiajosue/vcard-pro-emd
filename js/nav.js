import { SECTION_META, VC_SECTIONS } from './data.js';
import { state } from './state.js';
import { updatePreview } from './preview.js';

export function initNav() {
  // Section buttons
  document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
  // Mode pill
  document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });
  // Prev / Next arrows
  document.getElementById('btn-prev-sec')?.addEventListener('click', prevSection);
  document.getElementById('btn-next-sec')?.addEventListener('click', nextSection);
}

export function switchSection(id) {
  state.currentSection = id;
  document.querySelectorAll('.fsec').forEach(s => s.classList.toggle('active', s.id === `sec-${id}`));
  document.querySelectorAll('.nav-item[data-section]').forEach(b => b.classList.toggle('active', b.dataset.section === id));
  const meta = SECTION_META[id];
  if (!meta) return;
  const setTxt = (elId, val) => { const e = document.getElementById(elId); if (e) e.textContent = val; };
  const setClass = (elId, cls) => { const e = document.getElementById(elId); if (e) e.className = `fa-solid ${cls}`; };
  setClass('fh-icon',    meta.icon);
  setTxt ('fh-title',   meta.title);
  setTxt ('fh-sub',     meta.sub);
  setClass('crumb-icon', meta.icon);
  setTxt ('crumb-title', meta.title);
}

export function nextSection() {
  const list = state.currentMode === 'vcard' ? VC_SECTIONS : ['social-qr'];
  const i = list.indexOf(state.currentSection);
  if (i < list.length - 1) switchSection(list[i + 1]);
}

export function prevSection() {
  const list = state.currentMode === 'vcard' ? VC_SECTIONS : ['social-qr'];
  const i = list.indexOf(state.currentSection);
  if (i > 0) switchSection(list[i - 1]);
}

export function switchMode(mode) {
  state.currentMode = mode;
  const isVC = mode === 'vcard';
  document.getElementById('mpill-vcard')?.classList.toggle('active', isVC);
  document.getElementById('mpill-social')?.classList.toggle('active', !isVC);
  const vn = document.getElementById('vcard-nav');
  if (vn) { vn.style.opacity = isVC ? '1' : '0.35'; vn.style.pointerEvents = isVC ? 'auto' : 'none'; }
  document.getElementById('btn-guardar-tarjeta').style.display = isVC ? '' : 'none';
  document.getElementById('btn-exportar').style.display        = isVC ? '' : 'none';
  if (isVC) switchSection(state.currentSection === 'social-qr' ? 'datos' : state.currentSection);
  else       switchSection('social-qr');
}

export function updateNavDots() {
  const FIELDS = {
    datos:     ['v_nombre'],
    trabajo:   ['v_empresa','v_puesto','v_web','v_nota'],
    direccion: ['v_calle','v_ciudad','v_estado','v_zip','v_pais'],
    marca:     [],
    redes:     [],
  };
  Object.entries(FIELDS).forEach(([sec, fields]) => {
    const el = document.getElementById(`nav-${sec}`);
    if (!el) return;
    const has = sec === 'redes'
      ? document.querySelectorAll('.social-input').length > 0
      : fields.some(id => document.getElementById(id)?.value.trim());
    el.classList.toggle('has-data', has);
  });
}
