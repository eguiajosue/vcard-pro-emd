export function parseCSV(text) {
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
    if (inQ) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { result.push(cur); cur = ''; } else cur += ch; }
  }
  result.push(cur); return result.map(v => v.trim());
}

function normHeader(h) {
  return h.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, '');
}

export function rowToCard(row, brand) {
  const phones = [], emails = [];
  const tel = row['telefono'] || row['tel'] || row['celular'] || '';
  if (tel) phones.push({ type: 'Movil', value: tel });
  if (row['telefono2']) phones.push({ type: 'Oficina', value: row['telefono2'] });
  const email = row['email'] || row['correo'] || '';
  if (email) emails.push({ type: 'Trabajo', value: email });
  if (row['email2'] || row['correo2']) emails.push({ type: 'Personal', value: row['email2'] || row['correo2'] || '' });
  return {
    nombre: row['nombre'] || '', apellidos: row['apellidos'] || row['apellido'] || '',
    empresa: row['empresa'] || '', puesto: row['puesto'] || row['cargo'] || '',
    web: '', nota: '', calle: '', ciudad: '', estado: '', zip: '', pais: '',
    phones, emails, socials: [],
    logo: brand?.logo || null, brandColor: brand?.brandColor || null,
  };
}
