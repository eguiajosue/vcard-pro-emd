import { SQR_NETWORKS } from './data.js';
import { state } from './state.js';
import { showToast } from './toast.js';
import { switchPreviewTab } from './preview.js';
import { unlockQRTab } from './qr.js';

let sqrDebounce = null;

export function initSocialQR() {
  const grid = document.getElementById('social-qr-network-grid');
  if (!grid) return;

  grid.innerHTML = SQR_NETWORKS.map(net => {
    if (net.type === 'whatsapp-chat') {
      return `<button type="button" class="sqr-btn wa-feat" id="sqr-${net.id}" data-sqr="${net.id}">
        <i class="${net.icon}"></i>
        <span class="wl"><strong>WhatsApp Chat directo</strong><small>Nombre, telefono y mensaje</small></span>
        <span class="wa-badge">Nuevo</span>
      </button>`;
    }
    return `<button type="button" class="sqr-btn" id="sqr-${net.id}" data-sqr="${net.id}" title="${net.name}" style="border-color:transparent;">
      <i class="${net.icon}" style="color:${net.color};"></i><span>${net.name}</span>
    </button>`;
  }).join('');

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-sqr]');
    if (btn) selectSQR(btn.dataset.sqr);
  });

  document.getElementById('wa-chat-nombre')?.addEventListener('input', onWaChatInput);
  document.getElementById('wa-chat-telefono')?.addEventListener('input', onWaChatInput);
  document.getElementById('wa-chat-mensaje')?.addEventListener('input', onWaChatInput);
  document.getElementById('social-qr-value')?.addEventListener('input', onSocialQRInput);
}

function selectSQR(id) {
  state.selectedSQR = SQR_NETWORKS.find(n => n.id === id);
  if (!state.selectedSQR) return;

  // Update button styles
  SQR_NETWORKS.forEach(n => {
    const b = document.getElementById(`sqr-${n.id}`);
    if (!b) return;
    if (n.id === id) { b.classList.add('selected'); b.style.borderColor = n.color; b.style.background = `${n.color}16`; }
    else { b.classList.remove('selected'); if (n.type !== 'whatsapp-chat') { b.style.borderColor = 'transparent'; b.style.background = ''; } }
  });

  // Show input section
  const wrap = document.getElementById('social-qr-input-wrap');
  wrap.style.display = 'block';

  document.getElementById('social-qr-selected-info').innerHTML = `
    <div class="sqr-sel-ico" style="background:${state.selectedSQR.gradient}"><i class="${state.selectedSQR.icon}"></i></div>
    <div><div class="sqr-sel-name">${state.selectedSQR.name}</div><div class="sqr-sel-sub">${state.selectedSQR.hint}</div></div>`;

  const isWa = state.selectedSQR.type === 'whatsapp-chat';
  document.getElementById('wa-chat-form').style.display       = isWa ? 'block' : 'none';
  document.getElementById('social-standard-form').style.display = isWa ? 'none' : 'block';

  if (isWa) {
    ['wa-chat-nombre','wa-chat-telefono','wa-chat-mensaje'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('wa-chat-url-preview').innerHTML = `<i class="fa-brands fa-whatsapp" style="color:#25D366;"></i><span style="opacity:.5;">Ingresa un numero para ver el enlace</span>`;
    setTimeout(() => document.getElementById('wa-chat-telefono')?.focus(), 100);
  } else {
    const pre = document.getElementById('social-qr-prefix');
    pre.textContent = state.selectedSQR.prefix || '';
    pre.style.display = state.selectedSQR.prefix ? 'flex' : 'none';
    const inp = document.getElementById('social-qr-value');
    inp.placeholder = state.selectedSQR.placeholder;
    inp.value = '';
    document.getElementById('social-qr-input-label').textContent = state.selectedSQR.prefix ? 'Username:' : 'URL / Enlace:';
    document.getElementById('social-qr-url-preview').innerHTML = `<i class="fa-solid fa-link"></i><span style="opacity:.5;">Escribe tu username</span>`;
    setTimeout(() => inp.focus(), 100);
  }
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function onWaChatInput() {
  clearTimeout(sqrDebounce);
  const tel   = document.getElementById('wa-chat-telefono')?.value.trim();
  const nombre = document.getElementById('wa-chat-nombre')?.value.trim();
  const msg    = document.getElementById('wa-chat-mensaje')?.value.trim();
  if (!tel) {
    document.getElementById('wa-chat-url-preview').innerHTML = `<i class="fa-brands fa-whatsapp" style="color:#25D366;"></i><span style="opacity:.5;">Ingresa un numero</span>`;
    return;
  }
  const clean = tel.replace(/[\s+\-().]/g, '');
  let url = `https://wa.me/${clean}`;
  if (msg) url += `?text=${encodeURIComponent(msg)}`;
  const parts = [];
  if (nombre) parts.push(`<strong>${nombre}</strong>`);
  if (msg) parts.push(`"${msg.length > 40 ? msg.slice(0, 40) + '…' : msg}"`);
  document.getElementById('wa-chat-url-preview').innerHTML = `
    <i class="fa-brands fa-whatsapp" style="color:#25D366;font-size:.93rem;"></i>
    <div style="flex:1;min-width:0;">
      ${parts.length ? `<div style="font-size:.67rem;color:var(--t2);margin-bottom:1px;">${parts.join(' · ')}</div>` : ''}
      <a href="${url}" target="_blank" rel="noopener" style="word-break:break-all;">${url}</a>
    </div>`;
  const label = nombre ? `WhatsApp de ${nombre}` : 'WhatsApp Chat';
  sqrDebounce = setTimeout(() => renderSQRPreview(url, label), 400);
}

function onSocialQRInput() {
  clearTimeout(sqrDebounce);
  const raw = document.getElementById('social-qr-value')?.value.trim();
  if (!raw || !state.selectedSQR) {
    document.getElementById('social-qr-url-preview').innerHTML = `<i class="fa-solid fa-link"></i><span style="opacity:.5;">Escribe tu username</span>`;
    return;
  }
  const clean = raw.startsWith('@') ? raw.slice(1) : raw;
  document.getElementById('social-qr-value').value = clean;
  const finalURL = state.selectedSQR.urlFn(clean);
  document.getElementById('social-qr-url-preview').innerHTML = `<i class="fa-solid fa-link"></i><a href="${finalURL}" target="_blank" rel="noopener">${finalURL}</a>`;
  sqrDebounce = setTimeout(() => renderSQRPreview(finalURL), 400);
}

async function renderSQRPreview(url, label) {
  if (!url) return;
  try {
    const canvas = document.getElementById('qr-canvas');
    canvas.getContext('2d').clearRect(0, 0, 512, 512);
    new QRious({ element: canvas, value: url, size: 512, level: 'M', background: '#ffffff', foreground: '#000000' });
    unlockQRTab();
    switchPreviewTab('qr');
    const instr = document.getElementById('qr-instruction');
    if (instr) instr.textContent = label ? `Escanea para abrir ${label}` : state.selectedSQR ? `Perfil de ${state.selectedSQR.name}` : 'Escanea el QR';
  } catch { showToast('Error al generar el QR.', 'warn'); }
}
