import { SECTION_META, VC_SECTIONS } from './data.js';
import { state } from './state.js';

export function initNav() {
  // Sidebar nav: scroll-to-section (not show/hide — all sections visible)
  document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
    btn.addEventListener('click', () => scrollToSection(btn.dataset.section));
  });

  // Mode pill
  document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  // Prev / Next arrows: scroll to prev/next section
  document.getElementById('btn-prev-sec')?.addEventListener('click', prevSection);
  document.getElementById('btn-next-sec')?.addEventListener('click', nextSection);

  // IntersectionObserver: highlight nav item for visible section
  initSectionObserver();
}

export function switchSection(id) {
  state.currentSection = id;
  scrollToSection(id);
}

export function scrollToSection(id) {
  state.currentSection = id;
  const el = document.getElementById(`sec-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  highlightNav(id);
  updateCrumb(id);
}

function highlightNav(id) {
  document.querySelectorAll('.nav-item[data-section]').forEach(b =>
    b.classList.toggle('active', b.dataset.section === id));
}

function updateCrumb(id) {
  const meta = SECTION_META[id];
  if (!meta) return;
  const icon = document.getElementById('crumb-icon');
  const title = document.getElementById('crumb-title');
  if (icon) icon.className = `fa-solid ${meta.icon}`;
  if (title) title.textContent = meta.title;
}

function initSectionObserver() {
  const wrap = document.querySelector('.sections-wrap');
  if (!wrap || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('sec-', '');
        highlightNav(id);
        updateCrumb(id);
        state.currentSection = id;
      }
    });
  }, { root: wrap, threshold: 0.3 });

  document.querySelectorAll('.fsec[id]').forEach(sec => observer.observe(sec));
}

export function nextSection() {
  const list = state.currentMode === 'vcard' ? VC_SECTIONS : ['social-qr'];
  const i = list.indexOf(state.currentSection);
  if (i < list.length - 1) scrollToSection(list[i + 1]);
}

export function prevSection() {
  const list = state.currentMode === 'vcard' ? VC_SECTIONS : ['social-qr'];
  const i = list.indexOf(state.currentSection);
  if (i > 0) scrollToSection(list[i - 1]);
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
  if (isVC) scrollToSection(state.currentSection === 'social-qr' ? 'datos' : state.currentSection);
  else       scrollToSection('social-qr');
}

export function updateNavDots() {
  const FIELDS = {
    datos:     ['v_nombre'],
    trabajo:   ['v_empresa','v_puesto','v_web','v_nota'],
    direccion: ['v_calle','v_ciudad','v_estado','v_zip','v_pais'],
    marca:     [], redes: [],
  };
  Object.entries(FIELDS).forEach(([sec, fields]) => {
    const el = document.getElementById(`nav-${sec}`);
    if (!el) return;
    const has = sec === 'redes'
      ? document.querySelectorAll('.social-input').length > 0
      : fields.some(id => document.getElementById(id)?.value.trim());
    el.classList.toggle('has-data', has);
  });
  const nd = document.getElementById('nav-datos');
  if (nd) nd.classList.toggle('has-data', !!(
    document.getElementById('v_nombre')?.value.trim() ||
    document.querySelectorAll('#phones-container .phone-value').length > 0
  ));
}
