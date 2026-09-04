import { useEffect, useRef } from 'react';
import { useApp } from '../../store/AppStore.jsx';
import { SQR_NETWORKS } from '../../data.js';

export default function SocialQRSection() {
  const { state, setSqrSelected, setSqrValue, setSqrWa, generateSocialQR } = useApp();
  const { selectedId, value, wa } = state.sqr;
  const selected = SQR_NETWORKS.find(n => n.id === selectedId) || null;
  const isWa = selected?.type === 'whatsapp-chat';
  const wrapRef = useRef(null);
  const valueInputRef = useRef(null);
  const waPhoneRef = useRef(null);

  // Focus the relevant input + scroll the panel into view when a network is picked
  useEffect(() => {
    if (!selected) return;
    wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const t = setTimeout(() => (isWa ? waPhoneRef.current : valueInputRef.current)?.focus(), 100);
    return () => clearTimeout(t);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced auto-generate as the user types (mirrors the original 400ms debounce)
  useEffect(() => {
    if (!selected) return;
    let url = '', label;
    if (isWa) {
      if (!wa.telefono.trim()) return;
      const clean = wa.telefono.replace(/[\s+\-().]/g, '');
      url = `https://wa.me/${clean}`;
      if (wa.mensaje.trim()) url += `?text=${encodeURIComponent(wa.mensaje.trim())}`;
      label = wa.nombre.trim() ? `WhatsApp de ${wa.nombre.trim()}` : 'WhatsApp Chat';
    } else {
      if (!value.trim()) return;
      url = selected.urlFn(value.trim());
    }
    const t = setTimeout(() => generateSocialQR(url, label), 400);
    return () => clearTimeout(t);
  }, [selectedId, value, wa.nombre, wa.telefono, wa.mensaje]); // eslint-disable-line react-hooks/exhaustive-deps

  const onValueChange = raw => {
    setSqrValue(raw.startsWith('@') ? raw.slice(1) : raw);
  };

  const waUrl = (() => {
    if (!wa.telefono.trim()) return null;
    const clean = wa.telefono.replace(/[\s+\-().]/g, '');
    let url = `https://wa.me/${clean}`;
    if (wa.mensaje.trim()) url += `?text=${encodeURIComponent(wa.mensaje.trim())}`;
    return url;
  })();

  const standardUrl = selected && !isWa && value.trim() ? selected.urlFn(value.trim()) : null;

  return (
    <section className="fsec" id="sec-social-qr">
      <div className="sec-divider"><i className="fa-solid fa-qrcode"></i><span>Perfil Social QR</span></div>
      <p className="sec-desc">Elige una red, escribe tu username o URL y el QR se genera automaticamente.</p>
      <div className="sqr-grid" id="social-qr-network-grid">
        {SQR_NETWORKS.map(net => net.type === 'whatsapp-chat' ? (
          <button key={net.id} type="button" className={`sqr-btn wa-feat${selectedId === net.id ? ' selected' : ''}`}
            style={selectedId === net.id ? { borderColor: '#25D366', background: '#25D36616' } : undefined}
            onClick={() => setSqrSelected(net.id)}>
            <i className={net.icon}></i>
            <span className="wl"><strong>WhatsApp Chat directo</strong><small>Nombre, telefono y mensaje</small></span>
            <span className="wa-badge">Nuevo</span>
          </button>
        ) : (
          <button key={net.id} type="button" className={`sqr-btn${selectedId === net.id ? ' selected' : ''}`}
            title={net.name}
            style={{ borderColor: selectedId === net.id ? net.color : 'transparent', background: selectedId === net.id ? `${net.color}16` : undefined }}
            onClick={() => setSqrSelected(net.id)}>
            <i className={net.icon} style={{ color: net.color }}></i><span>{net.name}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="sqr-wrap" id="social-qr-input-wrap" ref={wrapRef}>
          <div className="sqr-sel-info">
            <div className="sqr-sel-ico" style={{ background: selected.gradient }}><i className={selected.icon}></i></div>
            <div><div className="sqr-sel-name">{selected.name}</div><div className="sqr-sel-sub">{selected.hint}</div></div>
          </div>

          {isWa ? (
            <div id="wa-chat-form">
              <div className="form-row">
                <div className="form-group"><label>Nombre <small>(opcional)</small></label>
                  <input type="text" placeholder="Maria Garcia" value={wa.nombre} onChange={e => setSqrWa({ nombre: e.target.value })} />
                </div>
                <div className="form-group"><label>Telefono <span className="req-star">*</span></label>
                  <input ref={waPhoneRef} type="tel" placeholder="+52 867 000 0000" value={wa.telefono} onChange={e => setSqrWa({ telefono: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Mensaje predefinido <small>(opcional)</small></label>
                <textarea rows="3" placeholder="Hola, me gustaria mas informacion..." value={wa.mensaje} onChange={e => setSqrWa({ mensaje: e.target.value })}></textarea>
                <span className="field-note">WhatsApp abrira con este mensaje al escanear.</span>
              </div>
              <div className="sqr-url-prev">
                <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i>
                {waUrl ? (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {(wa.nombre.trim() || wa.mensaje.trim()) && (
                      <div style={{ fontSize: '.67rem', color: 'var(--t2)', marginBottom: '1px' }}>
                        {wa.nombre.trim() && <strong>{wa.nombre.trim()}</strong>}
                        {wa.nombre.trim() && wa.mensaje.trim() && ' · '}
                        {wa.mensaje.trim() && `"${wa.mensaje.trim().length > 40 ? wa.mensaje.trim().slice(0, 40) + '…' : wa.mensaje.trim()}"`}
                      </div>
                    )}
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>{waUrl}</a>
                  </div>
                ) : <span style={{ opacity: .5 }}>Ingresa un numero para ver el enlace</span>}
              </div>
            </div>
          ) : (
            <div id="social-standard-form">
              <div className="form-group" style={{ marginBottom: '7px' }}>
                <label>{selected.prefix ? 'Username:' : 'URL / Enlace:'}</label>
                <div className="sqr-input-row">
                  {selected.prefix && <span className="sqr-prefix">{selected.prefix}</span>}
                  <input ref={valueInputRef} type="text" value={value} placeholder={selected.placeholder} onChange={e => onValueChange(e.target.value)} />
                </div>
                <span className="field-note"></span>
              </div>
              <div className="sqr-url-prev">
                {standardUrl
                  ? <><i className="fa-solid fa-link"></i><a href={standardUrl} target="_blank" rel="noopener noreferrer">{standardUrl}</a></>
                  : <><i className="fa-solid fa-link"></i><span style={{ opacity: .5 }}>Escribe tu username</span></>}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
