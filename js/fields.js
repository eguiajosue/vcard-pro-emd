import { PHONE_TYPES, EMAIL_TYPES } from './data.js';
import { state } from './state.js';
import { updatePreview } from './preview.js';
import { SOCIAL_NETWORKS } from './data.js';

export function initFields() {
  addPhoneRow();
  document.getElementById('btn-add-phone')?.addEventListener('click', () => addPhoneRow());
  document.getElementById('btn-add-email')?.addEventListener('click', () => addEmailRow());
  document.querySelectorAll('.form-panel input, .form-panel textarea')
    .forEach(el => el.addEventListener('input', updatePreview));
}

export function addPhoneRow(type = 'Movil', value = '') {
  const cont = document.getElementById('phones-container');
  const id = `phone-${state.phoneCounter++}`;
  const isFirst = cont.children.length === 0;
  const row = document.createElement('div');
  row.className = 'multi-row' + (isFirst ? ' first-row' : '');
  row.id = id;
  row.innerHTML = `
    <select class="phone-type">${PHONE_TYPES.map(t => `<option${t===type?' selected':''}>${t}</option>`).join('')}</select>
    <input type="tel" class="phone-value" placeholder="+52 867 000 0000" value="${esc(value)}">
    <button type="button" class="btn-del" data-row="${id}" data-kind="phone"><i class="fa-solid fa-trash"></i></button>`;
  cont.appendChild(row);
  row.querySelector('.phone-value').addEventListener('input', updatePreview);
  row.querySelector('.phone-type').addEventListener('change', updatePreview);
  row.querySelector('.btn-del').addEventListener('click', e => removeRow(e.currentTarget.dataset.row, 'phone'));
  if (!value) setTimeout(() => row.querySelector('.phone-value').focus(), 50);
  return row;
}

export function addEmailRow(type = 'Personal', value = '') {
  const cont = document.getElementById('emails-container');
  const id = `email-${state.emailCounter++}`;
  const row = document.createElement('div');
  row.className = 'multi-row';
  row.id = id;
  row.innerHTML = `
    <select class="email-type">${EMAIL_TYPES.map(t => `<option${t===type?' selected':''}>${t}</option>`).join('')}</select>
    <input type="email" class="email-value" placeholder="josue@emd.mx" value="${esc(value)}">
    <button type="button" class="btn-del" data-row="${id}" data-kind="email"><i class="fa-solid fa-trash"></i></button>`;
  cont.appendChild(row);
  row.querySelector('.email-value').addEventListener('input', updatePreview);
  row.querySelector('.email-type').addEventListener('change', updatePreview);
  row.querySelector('.btn-del').addEventListener('click', e => removeRow(e.currentTarget.dataset.row, 'email'));
  if (!value) setTimeout(() => row.querySelector('.email-value').focus(), 50);
  return row;
}

function removeRow(id, kind) {
  const row = document.getElementById(id);
  if (row) row.remove();
  if (kind === 'phone') {
    document.getElementById('fg-telefonos')?.classList.remove('field-error');
    const pc = document.getElementById('phones-container');
    if (pc.children.length === 0) addPhoneRow();
    else pc.children[0].classList.add('first-row');
  }
  updatePreview();
}

export function clearPhoneRows() { document.getElementById('phones-container').innerHTML = ''; }
export function clearEmailRows() { document.getElementById('emails-container').innerHTML = ''; }

// Social network rows in vCard mode
export function initSocialGrid() {
  const grid = document.getElementById('social-grid');
  SOCIAL_NETWORKS.forEach(net => {
    const btn = document.createElement('button');
    btn.className = 'social-btn';
    btn.id = `btn-social-${net.id}`;
    btn.title = `Anadir ${net.id}`;
    btn.innerHTML = `<i class="fa-brands ${net.icon}"></i>`;
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('disabled')) {
        addSocialRow(net);
        btn.classList.add('disabled');
        updatePreview();
      }
    });
    grid.appendChild(btn);
  });
}

export function addSocialRow(net, value = '') {
  const cont = document.getElementById('active-socials-container');
  const row = document.createElement('div');
  row.className = 'social-active-row';
  row.id = `row-social-${net.id}`;
  row.innerHTML = `
    <div class="social-ico" style="background:${net.color}"><i class="fa-brands ${net.icon}"></i></div>
    <div class="form-group">
      <label>URL de ${net.id[0].toUpperCase() + net.id.slice(1)}</label>
      <input type="url" class="social-input" data-network="${net.id}" value="${esc(value)}" placeholder="${net.placeholder}">
    </div>
    <button type="button" class="btn-del" data-netid="${net.id}"><i class="fa-solid fa-trash"></i></button>`;
  cont.appendChild(row);
  row.querySelector('input').addEventListener('input', updatePreview);
  row.querySelector('.btn-del').addEventListener('click', e => removeSocialRow(e.currentTarget.dataset.netid));
  if (!value) setTimeout(() => row.querySelector('input').focus(), 50);
}

export function removeSocialRow(id) {
  document.getElementById(`row-social-${id}`)?.remove();
  document.getElementById(`btn-social-${id}`)?.classList.remove('disabled');
  updatePreview();
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
export { esc };
