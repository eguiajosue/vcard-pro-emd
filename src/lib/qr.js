import QRious from 'qrious';

export async function renderQRCanvas(value, logoDataUrl, targetCanvas, levelOverride) {
  const canvas = targetCanvas || document.createElement('canvas');
  const hasLogo = !!logoDataUrl;
  const level = levelOverride || (hasLogo ? 'H' : 'L');
  new QRious({ element: canvas, value, size: 512, level, background: '#ffffff', foreground: '#000000' });
  if (hasLogo) {
    try {
      const img = await loadImage(logoDataUrl);
      const ctx = canvas.getContext('2d');
      const ls = canvas.width * .2;
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const pad = ls * .22;
      ctx.save();
      roundRect(ctx, cx - ls / 2 - pad, cy - ls / 2 - pad, ls + pad * 2, ls + pad * 2, 14);
      ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
      ctx.drawImage(img, cx - ls / 2, cy - ls / 2, ls, ls);
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

export function cropLogoToSquare(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('not-image')); return; }
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
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
