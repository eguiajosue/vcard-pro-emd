import { useEffect, useState } from 'react';
import { useApp, collectFormData } from '../store/AppStore.jsx';
import { useToast } from '../store/ToastProvider.jsx';
import { slugify } from '../lib/vcard.js';
import { SOCIAL_NETWORKS } from '../data.js';

const SOCIAL_META = Object.fromEntries(SOCIAL_NETWORKS.map(n => [n.id, n]));

function ContactRow({ icon, label, value }) {
  return (
    <div className="pv-contact-item">
      <div className="pv-contact-icon"><i className={`fa-solid ${icon}`}></i></div>
      <div className="pv-contact-content">
        <div className="pv-contact-label">{label}</div>
        <div className="pv-contact-value">{value}</div>
      </div>
    </div>
  );
}

function ContactCard() {
  const { state } = useApp();
  const d = collectFormData(state.form);
  const hasAny = d.nombre || d.apellidos || d.phones.length || d.emails.length || d.empresa || d.puesto;
  const initials = ((d.nombre[0] || '') + (d.apellidos[0] || '')).toUpperCase() || 'JD';
  const job = d.puesto && d.empresa ? `${d.puesto} · ${d.empresa}` : (d.puesto || d.empresa);
  const addr = [d.calle, d.ciudad, d.estado].filter(Boolean).join(', ');

  return (
    <div id="view-preview">
      <div className="contact-card">
        <div className="cc-head">
          <div className="cc-avatar" id="pv-avatar">{initials}</div>
          <div className="cc-name">{`${d.nombre} ${d.apellidos}`.trim() || 'Nombre Apellido'}</div>
          {job && <div className="cc-job">{job}</div>}
          <div className="cc-qactions">
            {d.phones.length > 0 && <div className="pv-action-btn"><i className="fa-solid fa-phone"></i></div>}
            {d.emails.length > 0 && <div className="pv-action-btn"><i className="fa-solid fa-envelope"></i></div>}
            {d.web && <div className="pv-action-btn"><i className="fa-solid fa-globe"></i></div>}
          </div>
        </div>
        <div className="cc-body">
          {!hasAny && <p className="cc-empty">Completa el formulario para ver tu tarjeta en tiempo real.</p>}
          {hasAny && (
            <div className="pv-contact-card">
              {d.phones.map((p, i) => <ContactRow key={`p${i}`} icon="fa-phone" label={p.type} value={p.value} />)}
              {d.emails.map((e, i) => <ContactRow key={`e${i}`} icon="fa-envelope" label={e.type} value={e.value} />)}
              {d.web && <ContactRow icon="fa-globe" label="Sitio Web" value={d.web} />}
              {addr && <ContactRow icon="fa-location-dot" label="Direccion" value={addr} />}
              {d.nota && <ContactRow icon="fa-align-left" label="Biografia" value={d.nota} />}
            </div>
          )}
          {d.socials.length > 0 && (
            <div className="pv-social-list">
              {d.socials.map(s => {
                const user = s.value.replace(/\/$/, '').split('/').pop().split('?')[0] || 'Enlace';
                const net = SOCIAL_META[s.network];
                return (
                  <div className="pv-social-item" key={s.network}>
                    <div className="pv-social-icon" style={{ background: net?.color }}><i className={`fa-brands ${net?.icon}`}></i></div>
                    <div className="pv-social-text-container">
                      <div className="pv-social-name">{s.network[0].toUpperCase() + s.network.slice(1)}</div>
                      <div className="pv-social-user">{user}</div>
                    </div>
                    <i className="fa-solid fa-angle-right pv-social-arrow"></i>
                  </div>
                );
              })}
            </div>
          )}
          <button className="cc-save-btn"><i className="fa-regular fa-address-card"></i> Guardar Contacto</button>
        </div>
      </div>
    </div>
  );
}

function QRCard() {
  const { state, canvasRef } = useApp();
  const showToast = useToast();

  const buildQRFileName = ext => {
    const parts = [state.form.nombre.trim(), state.form.apellidos.trim()].filter(Boolean).map(slugify).join('-');
    return parts ? `${parts}-qr.${ext}` : `contacto-qr.${ext}`;
  };

  const descargarQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = buildQRFileName('png');
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const compartirQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const nombre = state.form.nombre.trim() || 'Contacto';
    canvas.toBlob(async blob => {
      const file = new File([blob], buildQRFileName('png'), { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: `Contacto de ${nombre}`, text: 'Escanea para guardar.' }); }
        catch (err) { if (err.name !== 'AbortError') descargarQR(); }
      } else { descargarQR(); showToast('Descargado (compartir no disponible).', 'info'); }
    }, 'image/png');
  };

  return (
    <div id="view-qr">
      <div className="qr-card">
        <div id="qr-result" className={state.qr.hasQR ? 'has-qr' : ''} style={state.qr.outdated ? { opacity: .45 } : undefined} title={state.qr.outdated ? 'Genera de nuevo para actualizar' : ''}>
          {!state.qr.hasQR && (
            <div className="qr-placeholder" id="qr-placeholder">
              <i className="fa-solid fa-qrcode"></i>
              <span>{state.mode === 'social' ? 'Selecciona una red y escribe tu dato' : 'Genera el QR con Cmd+Enter'}</span>
            </div>
          )}
          <canvas id="qr-canvas" ref={canvasRef} style={{ display: state.qr.hasQR ? 'block' : 'none' }}></canvas>
        </div>
        <p className="qr-instr" id="qr-instruction">{state.qr.instruction}</p>
        <div className="qr-acts">
          <button className="qr-act-btn" onClick={descargarQR} disabled={!state.qr.hasQR}><i className="fa-solid fa-download"></i> Descargar</button>
          <button className="qr-act-btn" onClick={compartirQR} disabled={!state.qr.hasQR}><i className="fa-solid fa-share-nodes"></i> Compartir</button>
        </div>
      </div>
    </div>
  );
}

const SAVE_STATUS_LABEL = { clean: 'Sin cambios', editing: 'Editando...', dirty: 'Sin guardar', saved: 'Guardado' };

export default function PreviewPanel() {
  const { state, newCard, saveStatus } = useApp();
  const [activeView, setActiveView] = useState('preview');

  // Jump the mobile tab switcher to QR right after a code is generated,
  // and back to the card once it's cleared (new/loaded card).
  useEffect(() => { setActiveView(state.qr.hasQR ? 'qr' : 'preview'); }, [state.qr.hasQR]);

  const dotClass = saveStatus === 'editing' ? 'sdot saving' : saveStatus === 'saved' ? 'sdot' : 'sdot idle';

  return (
    <div className="preview-panel">
      <div className="preview-area">
        <div className="view-tabs">
          <button className={`vtb${activeView === 'preview' ? ' active' : ''}`} onClick={() => setActiveView('preview')}>Tarjeta</button>
          <button className={`vtb${activeView === 'qr' ? ' active' : ''}`} disabled={!state.qr.hasQR} onClick={() => state.qr.hasQR && setActiveView('qr')}>
            QR {!state.qr.hasQR && <i className="fa-solid fa-lock" id="qr-lock-icon" style={{ fontSize: '.64rem' }}></i>}
          </button>
        </div>
        <div className="preview-wrap" data-active-view={activeView}>
          <ContactCard />
          <QRCard />
        </div>
      </div>
      <div className="preview-foot">
        <div className="save-status">
          <span className={dotClass}></span>
          <span>{SAVE_STATUS_LABEL[saveStatus]}</span>
        </div>
        <button className="sa" onClick={newCard} title="Nueva tarjeta (Cmd+N)"><i className="fa-solid fa-plus"></i></button>
      </div>
    </div>
  );
}
