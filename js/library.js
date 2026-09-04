import { showToast } from './toast.js';
import { collectFormData, getPhoneEntries } from './preview.js';
import { switchPreviewTab, updatePreview } from './preview.js';
import { addPhoneRow, addEmailRow, clearPhoneRows, clearEmailRows, addSocialRow } from './fields.js';
import { SOCIAL_NETWORKS } from './data.js';
import { applyClientColor } from './brand.js';
import { state } from './state.js';
import { unlockQRTab } from './qr.js';
import { buildVCardString, slugify, downloadBlob } from './vcard.js';
import { renderQRCanvas } from './qr.js';

const LIB_KEY = 'emd_vcard_library_v1';

export function getLibrary() {
  try { return JSON.parse(localStorage.getItem(LIB_KEY) || '[]'); } catch { return []; }
}
export function setLibrary(cards) {
  localStorage.setItem(LIB_KEY, JSON.stringify(cards));
  updateLibBadge();
}
export function updateLibBadge() {
  const b = document.getElementById('library-count');
  if (b) b.textContent = getLibrary().length;
}

export function initLibrary() {
  document.getElementById('btn-library')?.addEventListener('click', openLibrary);
  document.getElementById('library-search')?.addEventListener('input', e => renderLibraryList(e.target.value));
  document.getElementById('btn-export-zip')?.addEventListener('click', exportLibraryZip);
  document.getElementById('btn-guardar-tarjeta')?.addEventListener('click', saveCurrentCard);
  document.getElementById('btn-guardar-mobile')?.addEventListener('click', saveCurrentCard);
  document.getElementById('btn-new-card')?.addEventListener('click', newCard);
  updateLibBadge();
}

export function openLibrary() {
  renderLibraryList('');
  openModal('library-overlay');
  document.getElementById('library-search').value = '';
  setTimeout(() => document.getElementById('library-search').focus(), 100);
}

export function saveCurrentCard() {
  const data = collectFormData();
  if (!data.nombre || data.phones.length === 0) {
    import('./nav.js').then(({ switchSection }) => switchSection('datos'));
    if (!data.nombre) document.getElementById('fg-nombre')?.classList.add('field-error');
    if (!data.phones.length) document.getElementById('fg-telefonos')?.classList.add('field-error');
    showToast('Agrega Nombre y Telefono antes de guardar.', 'warn');
    return;
  }
  const cards = getLibrary();
  const now   = new Date().toISOString();
  if (state.currentEditingId) {
    const idx = cards.findIndex(c => c.id === state.currentEditingId);
    if (idx !== -1) {
      cards[idx] = { ...cards[idx], ...data, updatedAt: now };
      setLibrary(cards);
      setEditStatus(cards[idx]);
      renderLibraryList(document.getElementById('library-search')?.value || '');
      showToast('Tarjeta actualizada.', 'success');
      setSavedDot();
      return;
    }
  }
  const entry = { id: `card_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, createdAt: now, updatedAt: now, ...data };
  cards.unshift(entry);
  setLibrary(cards);
  setEditStatus(entry);
  showToast('Tarjeta guardada.', 'success');
  setSavedDot();
}

function setSavedDot() {
  const dot = document.getElementById('save-dot');
  const lbl = document.getElementById('save-label');
  if (dot) dot.className = 'sdot';
  if (lbl) lbl.textContent = 'Guardado';
}

export function newCard() {
  document.querySelectorAll('.form-panel input, .form-panel textarea').forEach(el => el.value = '');
  clearPhoneRows(); addPhoneRow();
  clearEmailRows();
  document.getElementById('active-socials-container').innerHTML = '';
  document.querySelectorAll('.social-btn').forEach(b => b.classList.remove('disabled'));
  state.logoDataUrl = null; state.brandColor = null;
  const li = document.getElementById('logo-preview');
  if (li) li.innerHTML = '<i class="fa-regular fa-image"></i>';
  document.getElementById('btn-remove-logo').style.display = 'none';
  const ci = document.getElementById('v_brand_color');
  if (ci) ci.value = '#06b2e3';
  applyClientColor(null);
  setEditStatus(null);
  const btnQ = document.getElementById('btn-tab-qr');
  if (btnQ) { btnQ.disabled = true; document.getElementById('qr-lock-icon').style.display = ''; }
  document.getElementById('download-btn').style.display = 'none';
  switchPreviewTab('preview');
  import('./nav.js').then(({ switchSection }) => switchSection('datos'));
  updatePreview();
  document.getElementById('v_nombre')?.focus();
  showToast('Formulario listo para nueva tarjeta.', 'info');
}

export function populateForm(data) {
  const fields = ['nombre','apellidos','empresa','puesto','web','nota','calle','ciudad','estado','zip','pais'];
  fields.forEach(k => { const el = document.getElementById(`v_${k}`); if (el) el.value = data[k] || ''; });
  clearPhoneRows();
  (data.phones?.length ? data.phones : [{ type:'Movil', value:'' }]).forEach(p => addPhoneRow(p.type, p.value));
  clearEmailRows();
  (data.emails || []).forEach(e => addEmailRow(e.type, e.value));
  document.getElementById('active-socials-container').innerHTML = '';
  document.querySelectorAll('.social-btn').forEach(b => b.classList.remove('disabled'));
  (data.socials || []).forEach(s => {
    const net = SOCIAL_NETWORKS.find(n => n.id === s.network);
    if (net) { addSocialRow(net, s.value); document.getElementById(`btn-social-${net.id}`)?.classList.add('disabled'); }
  });
  state.logoDataUrl = data.logo || null;
  state.brandColor  = data.brandColor || null;
  const lp = document.getElementById('logo-preview');
  if (lp) lp.innerHTML = state.logoDataUrl ? `<img src="${state.logoDataUrl}" alt="Logo">` : '<i class="fa-regular fa-image"></i>';
  document.getElementById('btn-remove-logo').style.display = state.logoDataUrl ? 'inline-flex' : 'none';
  const ci = document.getElementById('v_brand_color');
  if (ci) ci.value = state.brandColor || '#06b2e3';
  applyClientColor(state.brandColor);
  const btnQ = document.getElementById('btn-tab-qr');
  if (btnQ) { btnQ.disabled = true; document.getElementById('qr-lock-icon').style.display = ''; }
  document.getElementById('download-btn').style.display = 'none';
  switchPreviewTab('preview');
  updatePreview();
}

export function setEditStatus(card) {
  const sEl  = document.getElementById('toolbar-status');
  const sTxt = document.getElementById('toolbar-status-text');
  if (card) {
    state.currentEditingId = card.id;
    sEl?.classList.add('editing');
    if (sTxt) sTxt.textContent = `Editando: ${card.nombre || ''} ${card.apellidos || ''}`.trim();
  } else {
    state.currentEditingId = null;
    sEl?.classList.remove('editing');
    if (sTxt) sTxt.textContent = 'Tarjeta nueva';
  }
}

export function renderLibraryList(q = '') {
  const cards    = getLibrary();
  const filtered = cards.filter(c => `${c.nombre} ${c.apellidos} ${c.empresa}`.toLowerCase().includes(q.trim().toLowerCase()));
  const listEl   = document.getElementById('library-list');
  const emptyEl  = document.getElementById('library-empty');
  updateLibBadge();
  if (cards.length === 0) { listEl.innerHTML = ''; emptyEl.classList.add('show'); return; }
  emptyEl.classList.remove('show');
  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="text-align:center;padding:24px;font-size:.78rem;color:var(--t2);">Sin resultados</div>`;
    return;
  }
  listEl.innerHTML = filtered.map(c => {
    const ini = ((c.nombre||'')[0]+(c.apellidos||'')[0]).toUpperCase() || '??';
    const fn  = `${c.nombre||''} ${c.apellidos||''}`.trim() || 'Sin nombre';
    const sub = [c.puesto, c.empresa].filter(Boolean).join(' · ') || c.phones?.[0]?.value || '';
    const ae  = c.id === state.currentEditingId ? 'active-edit' : '';
    return `<div class="lib-card ${ae}" data-id="${c.id}">
      <div class="lib-av">${ini}</div>
      <div class="lib-info"><div class="lib-name">${fn}</div><div class="lib-sub">${sub}</div></div>
      <div class="lib-acts">
        <button class="lib-btn dp" data-action="dup" data-id="${c.id}" title="Duplicar"><i class="fa-regular fa-copy"></i></button>
        <button class="lib-btn dl" data-action="del" data-id="${c.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');

  // Delegated events
  listEl.addEventListener('click', handleLibraryClick, { once: true });
}

function handleLibraryClick(e) {
  const btn  = e.target.closest('[data-action]');
  const card = e.target.closest('.lib-card');
  if (btn) {
    e.stopPropagation();
    if (btn.dataset.action === 'dup') duplicateCard(btn.dataset.id);
    if (btn.dataset.action === 'del') deleteCard(btn.dataset.id);
    return;
  }
  if (card) editCard(card.dataset.id);
}

function editCard(id) {
  const card = getLibrary().find(c => c.id === id);
  if (!card) return;
  populateForm(card);
  setEditStatus(card);
  closeModal('library-overlay');
  showToast(`Editando: ${card.nombre}.`, 'info');
}

function duplicateCard(id) {
  const cards = getLibrary();
  const orig  = cards.find(c => c.id === id);
  if (!orig) return;
  const now  = new Date().toISOString();
  const copy = { ...orig, id: `card_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, apellidos: (orig.apellidos||'') + ' (copia)', createdAt: now, updatedAt: now };
  cards.unshift(copy);
  setLibrary(cards);
  renderLibraryList(document.getElementById('library-search')?.value || '');
  showToast('Tarjeta duplicada.', 'success');
}

function deleteCard(id) {
  const cards = getLibrary();
  const card  = cards.find(c => c.id === id);
  if (!card) return;
  if (!confirm(`Eliminar tarjeta de ${card.nombre}?`)) return;
  setLibrary(cards.filter(c => c.id !== id));
  if (state.currentEditingId === id) setEditStatus(null);
  renderLibraryList(document.getElementById('library-search')?.value || '');
  showToast('Tarjeta eliminada.', 'info');
}

async function exportLibraryZip() {
  if (typeof JSZip === 'undefined') { showToast('JSZip no disponible.', 'warn'); return; }
  const q     = document.getElementById('library-search')?.value || '';
  const cards = getLibrary().filter(c => `${c.nombre} ${c.apellidos} ${c.empresa}`.toLowerCase().includes(q.trim().toLowerCase()));
  if (!cards.length) { showToast('No hay tarjetas para exportar.', 'warn'); return; }
  showToast(`Generando ZIP con ${cards.length} tarjeta(s)...`, 'info');
  try {
    const zip = new JSZip();
    for (const card of cards) {
      const vcStr  = buildVCardString(card);
      const canvas = await renderQRCanvas(vcStr, card.logo);
      const blob   = await new Promise(res => canvas.toBlob(res, 'image/png'));
      const name   = [card.nombre, card.apellidos].filter(Boolean).map(slugify).join('-') || 'contacto';
      zip.file(`${name}.vcf`, vcStr);
      zip.file(`${name}-qr.png`, blob);
    }
    const zb = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zb, 'emd-tarjetas.zip');
    showToast('ZIP descargado.', 'success');
  } catch { showToast('Error al generar el ZIP.', 'warn'); }
}

// Modal helpers (shared)
export function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
export function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
