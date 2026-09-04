import { SOCIAL_NETWORKS } from './data.js';
import { state } from './state.js';

let autoSaveTimer;

export function updatePreview() {
  const g = id => document.getElementById(id);
  const val = id => g(id)?.value.trim() || '';

  const n      = val('v_nombre');
  const a      = val('v_apellidos');
  const emp    = val('v_empresa');
  const puesto = val('v_puesto');
  const phones = getPhoneEntries();
  const emails = getEmailEntries();
  const tel    = phones[0]?.value || '';
  const email  = emails[0]?.value || '';
  const web    = val('v_web');
  const nota   = val('v_nota');
  const calle  = val('v_calle');
  const ciudad = val('v_ciudad');
  const estado = val('v_estado');

  // Validation clear
  if (n) g('fg-nombre')?.classList.remove('field-error');
  if (tel) g('fg-telefonos')?.classList.remove('field-error');

  // Empty hint
  const hint = g('pv-empty-hint');
  if (hint) hint.style.display = (n||a||tel||email||emp||puesto) ? 'none' : 'block';

  updateNavDots();
  scheduleAutoSave();

  // Lock QR when form changes
  const btnQ = g('btn-tab-qr');
  const li   = g('qr-lock-icon');
  if (btnQ && !btnQ.disabled) {
    btnQ.disabled = true;
    if (li) li.style.display = '';
    if (g('download-btn')) g('download-btn').style.display = 'none';
    if (btnQ.classList.contains('active')) switchPreviewTab('preview');
  }

  // Avatar
  g('pv-avatar').innerText = ((n[0]||'') + (a[0]||'')).toUpperCase() || 'JD';
  // Name / job
  g('pv-name').innerText = `${n} ${a}`.trim() || 'Nombre Apellido';
  const job = puesto && emp ? `${puesto} · ${emp}` : puesto || emp;
  const pj = g('pv-job');
  pj.innerText = job;
  pj.style.display = job ? 'block' : 'none';

  // Quick action buttons
  let qa = '';
  if (tel)   qa += `<div class="pv-action-btn"><i class="fa-solid fa-phone"></i></div>`;
  if (email) qa += `<div class="pv-action-btn"><i class="fa-solid fa-envelope"></i></div>`;
  if (web)   qa += `<div class="pv-action-btn"><i class="fa-solid fa-globe"></i></div>`;
  g('pv-quick-actions').innerHTML = qa;

  // Contact rows
  let cc = '';
  phones.forEach(p => cc += contactRow('fa-phone', p.type, p.value));
  emails.forEach(e => cc += contactRow('fa-envelope', e.type, e.value));
  if (web) cc += contactRow('fa-globe', 'Sitio Web', web);
  const addr = [calle, ciudad, estado].filter(Boolean);
  if (addr.length) cc += contactRow('fa-location-dot', 'Direccion', addr.join(', '));
  if (nota) cc += contactRow('fa-align-left', 'Biografia', nota);
  const ccEl = g('pv-contact-card');
  ccEl.innerHTML = cc;
  ccEl.style.display = cc ? 'block' : 'none';

  // Social list
  const pvSL = g('pv-social-list');
  pvSL.innerHTML = '';
  document.querySelectorAll('.social-input').forEach(inp => {
    const net = SOCIAL_NETWORKS.find(s => s.id === inp.dataset.network);
    if (!net) return;
    const url  = inp.value.trim();
    const user = url ? url.replace(/\/$/, '').split('/').pop().split('?')[0] : 'Enlace';
    pvSL.innerHTML += `
      <div class="pv-social-item">
        <div class="pv-social-icon" style="background:${net.color}"><i class="fa-brands ${net.icon}"></i></div>
        <div class="pv-social-text-container">
          <div class="pv-social-name">${net.id[0].toUpperCase() + net.id.slice(1)}</div>
          <div class="pv-social-user">${user}</div>
        </div>
        <i class="fa-solid fa-angle-right pv-social-arrow"></i>
      </div>`;
  });
}

function contactRow(icon, label, value) {
  return `<div class="pv-contact-item">
    <div class="pv-contact-icon"><i class="fa-solid ${icon}"></i></div>
    <div class="pv-contact-content">
      <div class="pv-contact-label">${label}</div>
      <div class="pv-contact-value">${value}</div>
    </div>
  </div>`;
}

export function switchPreviewTab(tab) {
  const btnP = document.getElementById('btn-tab-preview');
  const btnQ = document.getElementById('btn-tab-qr');
  const vP   = document.getElementById('view-preview');
  const vQ   = document.getElementById('view-qr');
  if (tab === 'qr' && btnQ?.disabled) return;
  btnP.classList.toggle('active', tab === 'preview');
  btnQ.classList.toggle('active', tab === 'qr');
  vP.style.display = tab === 'preview' ? '' : 'none';
  vQ.style.display = tab === 'qr'      ? '' : 'none';
}

function scheduleAutoSave() {
  const dot = document.getElementById('save-dot');
  const lbl = document.getElementById('save-label');
  if (dot) dot.className = 'sdot saving';
  if (lbl) lbl.textContent = 'Editando...';
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (dot) dot.className = 'sdot idle';
    if (lbl) lbl.textContent = 'Sin guardar';
  }, 1500);
}

// Import here to avoid circular deps
function updateNavDots() {
  const FIELDS = {
    datos: ['v_nombre'], trabajo: ['v_empresa','v_puesto','v_web','v_nota'],
    direccion: ['v_calle','v_ciudad','v_estado','v_zip','v_pais'], marca: [], redes: [],
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

export function getPhoneEntries() {
  return Array.from(document.querySelectorAll('#phones-container .multi-row'))
    .map(r => ({ type: r.querySelector('.phone-type').value, value: r.querySelector('.phone-value').value.trim() }))
    .filter(p => p.value);
}

export function getEmailEntries() {
  return Array.from(document.querySelectorAll('#emails-container .multi-row'))
    .map(r => ({ type: r.querySelector('.email-type').value, value: r.querySelector('.email-value').value.trim() }))
    .filter(e => e.value);
}

export function collectFormData() {
  const v = id => document.getElementById(id)?.value.trim() || '';
  return {
    nombre: v('v_nombre'), apellidos: v('v_apellidos'),
    empresa: v('v_empresa'), puesto: v('v_puesto'),
    web: v('v_web'), nota: v('v_nota'),
    calle: v('v_calle'), ciudad: v('v_ciudad'),
    estado: v('v_estado'), zip: v('v_zip'), pais: v('v_pais'),
    phones: getPhoneEntries(), emails: getEmailEntries(),
    socials: Array.from(document.querySelectorAll('.social-input'))
      .map(i => ({ network: i.dataset.network, value: i.value.trim() }))
      .filter(s => s.value),
    logo: state.logoDataUrl,
    brandColor: state.brandColor,
  };
}
