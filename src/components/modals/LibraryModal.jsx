import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../store/AppStore.jsx';
import JSZip from 'jszip';
import { useToast } from '../../store/ToastProvider.jsx';
import { buildVCardString, slugify, downloadBlob } from '../../lib/vcard.js';
import { renderQRCanvas } from '../../lib/qr.js';

export default function LibraryModal() {
  const { state, activeModal, closeModal, loadCard, duplicateCard, deleteCard } = useApp();
  const showToast = useToast();
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);
  const open = activeModal === 'library';

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => searchRef.current?.focus(), 100); }
  }, [open]);

  if (!open) return null;

  const filtered = state.library.filter(c => `${c.nombre} ${c.apellidos} ${c.empresa}`.toLowerCase().includes(query.trim().toLowerCase()));

  const exportZip = async () => {
    if (!filtered.length) { showToast('No hay tarjetas para exportar.', 'warn'); return; }
    showToast(`Generando ZIP con ${filtered.length} tarjeta(s)...`, 'info');
    try {
      const zip = new JSZip();
      for (const card of filtered) {
        const vcStr = buildVCardString(card);
        const canvas = await renderQRCanvas(vcStr, card.logo);
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const name = [card.nombre, card.apellidos].filter(Boolean).map(slugify).join('-') || 'contacto';
        zip.file(`${name}.vcf`, vcStr);
        zip.file(`${name}-qr.png`, blob);
      }
      const zb = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zb, 'emd-tarjetas.zip');
      showToast('ZIP descargado.', 'success');
    } catch { showToast('Error al generar el ZIP.', 'warn'); }
  };

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="modal-box">
        <div className="modal-hd"><h3><i className="fa-solid fa-address-book"></i> Mis Tarjetas</h3><button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button></div>
        <div className="modal-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input ref={searchRef} type="text" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} />
          <button className="lib-btn ep" title="Descargar ZIP" onClick={exportZip}><i className="fa-solid fa-file-zipper"></i></button>
        </div>
        <div className="modal-list">
          {filtered.length === 0 && state.library.length > 0 && (
            <div style={{ textAlign: 'center', padding: 24, fontSize: '.78rem', color: 'var(--t2)' }}>Sin resultados</div>
          )}
          {filtered.map(c => {
            const ini = ((c.nombre || '')[0] + (c.apellidos || '')[0] || '').toUpperCase() || '??';
            const fn = `${c.nombre || ''} ${c.apellidos || ''}`.trim() || 'Sin nombre';
            const sub = [c.puesto, c.empresa].filter(Boolean).join(' · ') || c.phones?.[0]?.value || '';
            return (
              <div className={`lib-card${c.id === state.editingId ? ' active-edit' : ''}`} key={c.id} onClick={() => { loadCard(c); closeModal(); }}>
                <div className="lib-av">{ini}</div>
                <div className="lib-info"><div className="lib-name">{fn}</div><div className="lib-sub">{sub}</div></div>
                <div className="lib-acts">
                  <button className="lib-btn dp" title="Duplicar" onClick={e => { e.stopPropagation(); duplicateCard(c.id); }}><i className="fa-regular fa-copy"></i></button>
                  <button className="lib-btn dl" title="Eliminar" onClick={e => { e.stopPropagation(); deleteCard(c.id); }}><i className="fa-solid fa-trash"></i></button>
                </div>
              </div>
            );
          })}
        </div>
        {state.library.length === 0 && (
          <div className="modal-empty show"><i className="fa-regular fa-folder-open"></i><p>Sin tarjetas guardadas</p><span>Completa el formulario y presiona guardar.</span></div>
        )}
      </div>
    </div>
  );
}
