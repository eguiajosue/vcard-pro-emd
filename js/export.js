import { collectFormData } from './preview.js';
import { buildVCardString, slugify, downloadBlob } from './vcard.js';
import { showToast } from './toast.js';
import { openModal, closeModal } from './library.js';
import { state } from './state.js';

export function initExport() {
  document.getElementById('btn-exportar')?.addEventListener('click', openExportModal);
  document.getElementById('exp-vcf')?.addEventListener('click',  () => { exportAsVCF();  closeModal('export-overlay'); });
  document.getElementById('exp-pdf')?.addEventListener('click',  () => { exportAsPDF();  closeModal('export-overlay'); });
  document.getElementById('exp-html')?.addEventListener('click', () => { exportAsHTML(); closeModal('export-overlay'); });
  document.getElementById('exp-csv')?.addEventListener('click',  () => { exportAsCSV();  closeModal('export-overlay'); });

  // Load html2pdf lazily
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
  document.head.appendChild(s);
}

function openExportModal() {
  if (!document.getElementById('v_nombre')?.value.trim()) {
    showToast('Agrega un nombre antes de exportar.', 'warn');
    return;
  }
  openModal('export-overlay');
}

function exportAsVCF() {
  const d = collectFormData();
  downloadBlob(new Blob([buildVCardString(d)], { type: 'text/vcard;charset=utf-8' }), buildName('vcf'));
  showToast('vCard descargada.', 'success');
}

function exportAsCSV() {
  const d = collectFormData();
  const h = ['Nombre','Apellidos','Empresa','Puesto','Telefono','Email','Web','Direccion'];
  const v = [d.nombre, d.apellidos, d.empresa, d.puesto,
             d.phones[0]?.value||'', d.emails[0]?.value||'', d.web,
             [d.calle, d.ciudad, d.estado].filter(Boolean).join(', ')];
  const csv = [h, v].map(r => r.map(x => `"${(x||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), buildName('csv'));
  showToast('CSV descargado.', 'success');
}

function exportAsHTML() {
  const d = collectFormData();
  const nb = d.nombre || 'Contacto', ab = d.apellidos || '';
  const phones = d.phones.map(p => p.value).join(', ');
  const emails = d.emails.map(e => e.value).join(', ');
  // Note: we split the style/script closing tags to avoid HTML parser issues
  const styleOpen  = '<' + 'style>';
  const styleClose = '<' + '/style>';
  const html = `<!DOCTYPE html><html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${nb} ${ab}</title>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
${styleOpen}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:linear-gradient(135deg,#ea1585,#06b2e3);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:20px}
.card{background:#fff;border-radius:20px;padding:30px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25)}
.avatar{width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,#ea1585,#c0106e);color:#fff;display:flex;justify-content:center;align-items:center;font-size:1.6rem;font-weight:700;margin:0 auto 14px}
h1{text-align:center;font-size:1.4rem;color:#111;margin-bottom:4px}.sub{text-align:center;color:#787774;margin-bottom:20px;font-size:.86rem}
.item{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #eee}.item:last-child{border-bottom:none}
.ico{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#ea1585,#c0106e);color:#fff;display:flex;justify-content:center;align-items:center;flex-shrink:0;font-size:.78rem}
.info{flex:1}.lbl{font-size:.65rem;color:#8e8e93;text-transform:uppercase;letter-spacing:.3px}.val{font-weight:600;color:#111;word-break:break-word}
a{color:#ea1585;text-decoration:none}
${styleClose}
</head><body><div class="card">
<div class="avatar">${(nb[0]||'')+(ab[0]||'')}</div>
<h1>${nb} ${ab}</h1>
<p class="sub">${d.puesto||d.empresa||''}</p>
${phones ? `<div class="item"><div class="ico"><i class="fa-solid fa-phone"></i></div><div class="info"><div class="lbl">Telefono</div><div class="val">${phones}</div></div></div>` : ''}
${emails ? `<div class="item"><div class="ico"><i class="fa-solid fa-envelope"></i></div><div class="info"><div class="lbl">Email</div><div class="val"><a href="mailto:${d.emails[0]?.value}">${emails}</a></div></div></div>` : ''}
${d.web   ? `<div class="item"><div class="ico"><i class="fa-solid fa-globe"></i></div><div class="info"><div class="lbl">Web</div><div class="val"><a href="${d.web}" target="_blank">${d.web}</a></div></div></div>` : ''}
</div></body></html>`;
  downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), buildName('html'));
  showToast('HTML descargado.', 'success');
}

function exportAsPDF() {
  if (typeof html2pdf === 'undefined') { showToast('Libreria PDF no disponible. Reintenta en un momento.', 'warn'); return; }
  const d = collectFormData();
  const ini = ((d.nombre||'')[0]||(d.apellidos||'')[0]||'CD').toUpperCase();
  const phones = d.phones.map(p => p.value).join(', ');
  const emails = d.emails.map(e => e.value).join(', ');
  const el = document.createElement('div');
  el.innerHTML = `<div style="width:85mm;height:55mm;padding:8mm;font-family:-apple-system,sans-serif;background:#fff;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;">
    <div style="display:flex;gap:10px;align-items:flex-start;">
      <div style="width:20mm;height:20mm;border-radius:50%;background:linear-gradient(135deg,#ea1585,#c0106e);color:#fff;display:flex;justify-content:center;align-items:center;font-size:10px;font-weight:700;flex-shrink:0;">${ini}</div>
      <div style="flex:1;">
        <p style="font-size:11pt;font-weight:700;color:#111;margin:0;">${d.nombre||''} ${d.apellidos||''}</p>
        <p style="font-size:8pt;color:#787774;margin:2px 0 0;">${d.puesto||d.empresa||''}</p>
        <div style="font-size:7pt;color:#333;margin-top:6px;line-height:1.4;">
          ${phones ? `<span style="display:block;">&#128222; ${phones}</span>` : ''}
          ${emails ? `<span style="display:block;">&#9993; ${emails}</span>`   : ''}
          ${d.web  ? `<span style="display:block;">&#127760; ${d.web}</span>` : ''}
        </div>
      </div>
    </div>
    <div style="font-size:6pt;color:#8e8e93;border-top:1px solid #eee;padding-top:4px;">EMD Publicidad &middot; vCard Pro</div>
  </div>`;
  html2pdf().set({ margin:0, filename:buildName('pdf'), html2canvas:{scale:2}, jsPDF:{format:[85,55],unit:'mm',orientation:'landscape'} }).from(el).save();
  showToast('PDF descargado.', 'success');
}

function buildName(ext) {
  const n = document.getElementById('v_nombre')?.value.trim() || '';
  const a = document.getElementById('v_apellidos')?.value.trim() || '';
  const p = [n, a].filter(Boolean).map(slugify).join('-');
  return p ? `${p}-vcard.${ext}` : `contacto-vcard.${ext}`;
}
