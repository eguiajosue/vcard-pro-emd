import { BRAND_PRESETS } from './data.js';
import { state } from './state.js';
import { updatePreview } from './preview.js';
import { showToast } from './toast.js';

export function initBrand() {
  initColorPresets();
  document.getElementById('v_logo_input')?.addEventListener('change', handleLogoUpload);
  document.getElementById('btn-remove-logo')?.addEventListener('click', removeLogo);
  document.getElementById('v_brand_color')?.addEventListener('input', e => handleColorChange(e.target.value));
  document.getElementById('btn-reset-color')?.addEventListener('click', resetBrandColor);
}

function initColorPresets() {
  const wrap = document.getElementById('color-presets');
  if (!wrap) return;
  wrap.innerHTML = BRAND_PRESETS.map(c =>
    `<button type="button" class="swatch" style="background:${c};" data-color="${c}" title="${c}"></button>`
  ).join('');
  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.swatch');
    if (btn) handleColorChange(btn.dataset.color);
  });
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Selecciona una imagen valida.', 'warn'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const size = 300;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, size, size);
      const scale = Math.min(size / img.width, size / img.height) * .9;
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      state.logoDataUrl = canvas.toDataURL('image/png');
      updateLogoPreview();
      updatePreview();
      showToast('Logo cargado. Aparecera en el centro del QR.', 'success');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function updateLogoPreview() {
  const prev = document.getElementById('logo-preview');
  const rem  = document.getElementById('btn-remove-logo');
  if (!prev) return;
  if (state.logoDataUrl) {
    prev.innerHTML = `<img src="${state.logoDataUrl}" alt="Logo">`;
    if (rem) rem.style.display = 'inline-flex';
  } else {
    prev.innerHTML = `<i class="fa-regular fa-image"></i>`;
    if (rem) rem.style.display = 'none';
  }
}

function removeLogo() {
  state.logoDataUrl = null;
  const input = document.getElementById('v_logo_input');
  if (input) input.value = '';
  updateLogoPreview();
  updatePreview();
  showToast('Logo eliminado.', 'info');
}

export function handleColorChange(color) {
  state.brandColor = color;
  const ci = document.getElementById('v_brand_color');
  if (ci) ci.value = color;
  applyClientColor(color);
}

function resetBrandColor() {
  state.brandColor = null;
  const ci = document.getElementById('v_brand_color');
  if (ci) ci.value = '#06b2e3';
  applyClientColor(null);
  showToast('Color restablecido.', 'info');
}

export function applyClientColor(color) {
  if (color) document.documentElement.style.setProperty('--client-accent', color);
  else document.documentElement.style.removeProperty('--client-accent');
}
