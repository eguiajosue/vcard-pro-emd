import { useRef, useState } from 'react';
import { useApp } from '../../store/AppStore.jsx';
import { useToast } from '../../store/ToastProvider.jsx';
import { parseCSV, rowToCard } from '../../lib/csv.js';

const COLS = ['nombre', 'apellidos', 'empresa', 'puesto', 'telefono', 'email'];
const LABELS = { nombre: 'Nombre', apellidos: 'Apellidos', empresa: 'Empresa', puesto: 'Puesto', telefono: 'Tel', email: 'Email' };

export default function BatchModal() {
  const { state, activeModal, closeModal, dispatch, openModal } = useApp();
  const showToast = useToast();
  const [filename, setFilename] = useState('Ningun archivo seleccionado');
  const [rows, setRows] = useState([]);
  const fileRef = useRef(null);
  const open = activeModal === 'batch';

  if (!open) return null;

  const close = () => { setRows([]); setFilename('Ningun archivo seleccionado'); if (fileRef.current) fileRef.current.value = ''; closeModal(); };

  const onFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (!parsed.length) { showToast('CSV sin filas validas.', 'warn'); return; }
        setRows(parsed);
      } catch { showToast('No se pudo leer el CSV.', 'warn'); }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const generate = () => {
    if (!rows.length) { showToast('Selecciona un CSV primero.', 'warn'); return; }
    const now = new Date().toISOString();
    const brand = { logo: state.form.logo, brandColor: state.form.brandColor };
    const created = [];
    rows.forEach(row => {
      if (!row['nombre']) return;
      created.push({ id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, createdAt: now, updatedAt: now, ...rowToCard(row, brand) });
    });
    if (created.length > 0) {
      const cards = [...created, ...state.library];
      localStorage.setItem('emd_vcard_library_v1', JSON.stringify(cards));
      dispatch({ type: 'SET_LIBRARY', cards });
      close();
      showToast(`${created.length} tarjeta(s) creadas.`, 'success');
      openModal('library');
    } else {
      showToast('Ninguna fila tenia nombre valido.', 'warn');
    }
  };

  const valid = rows.filter(r => r['nombre']).length;

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal-box">
        <div className="modal-hd"><h3><i className="fa-solid fa-file-csv"></i> Importar por Lote (CSV)</h3><button className="modal-close" onClick={close}><i className="fa-solid fa-xmark"></i></button></div>
        <p className="modal-desc">Columnas: <strong>Nombre, Apellidos, Telefono, Email, Empresa, Puesto</strong></p>
        <div className="batch-zone">
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} id="batch-csv-input" onChange={onFile} />
          <label htmlFor="batch-csv-input" className="btn-upload"><i className="fa-solid fa-upload"></i> Seleccionar CSV</label>
          <span className="field-note">{filename}</span>
        </div>
        {rows.length > 0 && (
          <div className="batch-prev">
            <div className="batch-sum">Detectadas <strong>{rows.length}</strong> fila(s), <strong>{valid}</strong> con nombre valido:</div>
            <div className="batch-tw">
              <table className="batch-tbl">
                <thead><tr>{COLS.map(c => <th key={c}>{LABELS[c]}</th>)}</tr></thead>
                <tbody>
                  {rows.slice(0, 50).map((r, i) => (
                    <tr key={i}>{COLS.map(c => <td key={c}>{r[c] || '-'}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {rows.length > 0 && (
          <div className="modal-foot">
            <button className="btn-upload" onClick={close}>Cancelar</button>
            <button className="btn-gen" style={{ width: 'auto', padding: '7px 14px', fontSize: '.78rem' }} onClick={generate}><i className="fa-solid fa-layer-group"></i> Crear Tarjetas</button>
          </div>
        )}
      </div>
    </div>
  );
}
