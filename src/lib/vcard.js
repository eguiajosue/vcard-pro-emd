import { PT_MAP, ET_MAP } from '../data.js';

export function buildVCardString(data) {
  let v = 'BEGIN:VCARD\nVERSION:3.0\n';
  v += `N:${data.apellidos || ''};${data.nombre || ''};;;\n`;
  v += `FN:${`${data.nombre || ''} ${data.apellidos || ''}`.trim()}\n`;
  (data.phones || []).forEach((p, i) =>
    v += `TEL;TYPE=${PT_MAP[p.type] || 'VOICE'}${i === 0 ? ',PREF' : ''}:${p.value}\n`);
  if (data.empresa) v += `ORG:${data.empresa}\n`;
  if (data.puesto)  v += `TITLE:${data.puesto}\n`;
  (data.emails || []).forEach((e, i) =>
    v += `EMAIL;TYPE=${ET_MAP[e.type] || 'INTERNET'}${i === 0 ? ',PREF' : ''}:${e.value}\n`);
  if (data.web)  v += `URL:${data.web}\n`;
  if (data.nota) v += `NOTE:${data.nota}\n`;
  if (data.calle || data.ciudad || data.estado || data.zip || data.pais)
    v += `ADR;TYPE=WORK:;;${data.calle || ''};${data.ciudad || ''};${data.estado || ''};${data.zip || ''};${data.pais || ''}\n`;
  let idx = 1;
  (data.socials || []).forEach(s => {
    if (!s.value) return;
    const user  = s.value.replace(/\/$/, '').split('/').pop().split('?')[0];
    const label = s.network[0].toUpperCase() + s.network.slice(1);
    v += `X-SOCIALPROFILE;type=${s.network.toLowerCase()};x-user=${user}:${s.value}\n`;
    v += `item${idx}.URL:${s.value}\nitem${idx}.X-ABLabel:${label}\n`;
    idx++;
  });
  v += 'END:VCARD';
  return v;
}

export function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

export function downloadBlob(blob, filename) {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
}
