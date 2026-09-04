import { showToast } from './toast.js';
import { getLibrary, setLibrary, openLibrary, openModal, closeModal } from './library.js';
import { state } from './state.js';

let parsedBatch = [];

export function initBatch() {
  document.getElementById('btn-batch-open')?.addEventListener('click', () => openModal('batch-overlay'));
  document.getElementById('batch-csv-input')?.addEventListener('change', handleCSVFile);
  document.getElementById('btn-batch-generate')?.addEventListener('click', processBatchImport);
}

function handleCSVFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('batch-filename').textContent = file.name;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const rows = parseCSV(ev.target.result);
      if (!rows.length) { showToast('CSV sin filas validas.', 'warn'); return; }
      parsedBatch = rows;
      renderBatchPreview(rows);
    } catch { showToast('No se pudo leer el CSV.', 'warn'); }
  };
  reader.readAsText(file, 'UTF-8');
}

function parseCSV(text) {
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map(normHeader);
  return lines.slice(1).map(line => {
    const cols = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => obj[h] = (cols[i] || '').trim());
    return obj;
  });
}

function splitCSVLine(line) {
  const result = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"') { if (line[i+1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { result.push(cur); cur = ''; } else cur += ch; }
  }
  result.push(cur); return result.map(v => v.trim());
}

function normHeader(h) {
  return h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
}

function renderBatchPreview(rows) {
  document.getElementById('batch-preview').style.display = 'block';
  document.getElementById('batch-footer').style.display  = 'flex';
  const valid = rows.filter(r => r['nombre']).length;
  document.getElementById('batch-summary').innerHTML = `Detectadas <strong>${rows.length}</strong> fila(s), <strong>${valid}</strong> con nombre valido:`;
  const cols   = ['nombre','apellidos','empresa','puesto','telefono','email'];
  const labels = { nombre:'Nombre', apellidos:'Apellidos', empresa:'Empresa', puesto:'Puesto', telefono:'Tel', email:'Email' };
  let html = '<thead><tr>' + cols.map(c => `<th>${labels[c]}</th>`).join('') + '</tr></thead><tbody>';
  rows.slice(0, 50).forEach(r => { html += '<tr>' + cols.map(c => `<td>${r[c]||'-'}</td>`).join('') + '</tr>'; });
  document.getElementById('batch-table').innerHTML = html + '</tbody>';
}

function rowToCard(row) {
  const phones = [], emails = [];
  const tel = row['telefono'] || row['tel'] || row['celular'] || '';
  if (tel) phones.push({ type:'Movil', value:tel });
  if (row['telefono2']) phones.push({ type:'Oficina', value:row['telefono2'] });
  const email = row['email'] || row['correo'] || '';
  if (email) emails.push({ type:'Trabajo', value:email });
  if (row['email2'] || row['correo2']) emails.push({ type:'Personal', value:row['email2']||row['correo2']||'' });
  return { nombre:row['nombre']||'', apellidos:row['apellidos']||row['apellido']||'', empresa:row['empresa']||'', puesto:row['puesto']||row['cargo']||'', web:'', nota:'', calle:'', ciudad:'', estado:'', zip:'', pais:'', phones, emails, socials:[], logo:state.logoDataUrl, brandColor:state.brandColor };
}

function processBatchImport() {
  if (!parsedBatch.length) { showToast('Selecciona un CSV primero.', 'warn'); return; }
  const cards = getLibrary();
  const now   = new Date().toISOString();
  let created = 0;
  parsedBatch.forEach(row => {
    if (!row['nombre']) return;
    cards.unshift({ id:`card_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, createdAt:now, updatedAt:now, ...rowToCard(row) });
    created++;
  });
  setLibrary(cards);
  closeModal('batch-overlay');
  parsedBatch = [];
  document.getElementById('batch-csv-input').value = '';
  document.getElementById('batch-preview').style.display = 'none';
  document.getElementById('batch-footer').style.display  = 'none';
  document.getElementById('batch-filename').textContent  = 'Ningun archivo seleccionado';
  if (created > 0) { showToast(`${created} tarjeta(s) creadas.`, 'success'); openLibrary(); }
  else showToast('Ninguna fila tenia nombre valido.', 'warn');
}
