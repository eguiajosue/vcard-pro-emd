import { showToast } from './toast.js';
import { switchPreviewTab } from './preview.js';
import { collectFormData, getPhoneEntries } from './preview.js';
import { buildVCardString, slugify } from './vcard.js';
import { state } from './state.js';

export function initQR() {
  document.getElementById('btn-generar')?.addEventListener('click', generarQR);
  document.getElementById('btn-generar-mobile')?.addEventListener('click', generarQR);
  document.getElementById('btn-tab-preview')?.addEventListener('click', () => switchPreviewTab('preview'));
  document.getElementById('btn-tab-qr')?.addEventListener('click', () => switchPreviewTab('qr'));
  document.getElementById('btn-dl-qr')?.addEventListener('click', descargarQR);
  document.getElementById('btn-compartir')?.addEventListener('click', compartirQR);
}

export async function generarQR() {
  const n      = document.getElementById('v_nombre')?.value.trim();
  const phones = getPhoneEntries();

  document.getElementById('fg-nombre')?.classList.remove('field-error');
  document.getElementById('fg-telefonos')?.classList.remove('field-error');

  if (!n || phones.length === 0) {
    // Import nav lazily to avoid circular
    const { switchSection } = await import('./nav.js');
    switchSection('datos');
    if (!n) document.getElementById('fg-nombre')?.classList.add('field-error');
    if (!phones.length) document.getElementById('fg-telefonos')?.classList.add('field-error');
    showToast('Nombre y Telefono son obligatorios.', 'warn');
    return;
  }

  const btn  = document.getElementById('btn-generar');
  const btnM = document.getElementById('btn-generar-mobile');
  [btn, btnM].forEach(b => b?.classList.add('loading'));

  const data  = collectFormData();
  const vcStr = buildVCardString(data);

  setTimeout(async () => {
    try {
      const canvas = document.getElementById('qr-canvas');
      canvas.getContext('2d').clearRect(0, 0, 512, 512);
      await renderQRCanvas(vcStr, data.logo, canvas);
      unlockQRTab();
      switchPreviewTab('qr');
      showToast('QR generado correctamente.', 'success');
    } catch (e) {
      showToast('Error al generar el QR.', 'warn');
    } finally {
      [btn, btnM].forEach(b => b?.classList.remove('loading'));
    }
  }, 320);
}

export async function renderQRCanvas(value, logoDataUrl, targetCanvas) {
  const canvas = targetCanvas || document.createElement('canvas');
  const hasLogo = !!logoDataUrl;
  new QRious({ element: canvas, value, size: 512, level: hasLogo ? 'H' : 'L', background: '#ffffff', foreground: '#000000' });
  if (hasLogo) {
    try {
      const img = await loadImage(logoDataUrl);
      const ctx = canvas.getContext('2d');
      const ls = canvas.width * .2;
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const pad = ls * .22;
      ctx.save();
      roundRect(ctx, cx - ls/2 - pad, cy - ls/2 - pad, ls + pad*2, ls + pad*2, 14);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      ctx.drawImage(img, cx - ls/2, cy - ls/2, ls, ls);
    } catch (_) { /* logo failed — QR still valid */ }
  }
  return canvas;
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function unlockQRTab() {
  // Mark QR result as having content (shows canvas, hides placeholder)
  const qrEl = document.getElementById('qr-result');
  if (qrEl) {
    qrEl.classList.add('has-qr');
    qrEl.style.opacity = '1';
    qrEl.title = '';
    qrEl.classList.remove('qr-pop');
    void qrEl.offsetWidth;
    qrEl.classList.add('qr-pop');
  }
  // Show canvas, hide placeholder
  const canvas = document.getElementById('qr-canvas');
  if (canvas) canvas.style.display = 'block';
  const placeholder = document.getElementById('qr-placeholder');
  if (placeholder) placeholder.style.display = 'none';

  // Legacy: unlock tab button (mobile)
  const btnQ = document.getElementById('btn-tab-qr');
  const li   = document.getElementById('qr-lock-icon');
  if (btnQ) btnQ.disabled = false;
  if (li) li.style.display = 'none';
  document.getElementById('download-btn').style.display = 'block';
}

function descargarQR() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = buildQRFileName('png');
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
}

async function compartirQR() {
  const canvas = document.getElementById('qr-canvas');
  const nombre = document.getElementById('v_nombre')?.value.trim() || 'Contacto';
  canvas.toBlob(async blob => {
    const file = new File([blob], buildQRFileName('png'), { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: `Contacto de ${nombre}`, text: 'Escanea para guardar.' }); }
      catch (err) { if (err.name !== 'AbortError') descargarQR(); }
    } else { descargarQR(); showToast('Descargado (compartir no disponible).', 'info'); }
  }, 'image/png');
}

function buildQRFileName(ext) {
  const n = document.getElementById('v_nombre')?.value.trim() || '';
  const a = document.getElementById('v_apellidos')?.value.trim() || '';
  const parts = [n, a].filter(Boolean).map(slugify).join('-');
  return parts ? `${parts}-qr.${ext}` : `contacto-qr.${ext}`;
}
