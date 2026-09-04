import { useEffect, useRef } from 'react';
import { useApp } from '../../store/AppStore.jsx';
import { useToast } from '../../store/ToastProvider.jsx';
import { PHONE_TYPES, EMAIL_TYPES, BRAND_PRESETS, SOCIAL_NETWORKS } from '../../data.js';
import { cropLogoToSquare } from '../../lib/qr.js';
import MultiRow from './MultiRow.jsx';

export function SectionDatos() {
  const { state, setField, addPhone, updatePhone, removePhone, addEmail, updateEmail, removeEmail } = useApp();
  const phonesRef = useRef(null);
  const emailsRef = useRef(null);

  useEffect(() => {
    const last = phonesRef.current?.querySelector('.multi-row:last-child .phone-value');
    if (last && !last.value) last.focus();
  }, [state.form.phones.length]);

  useEffect(() => {
    const last = emailsRef.current?.querySelector('.multi-row:last-child .email-value');
    if (last && !last.value) last.focus();
  }, [state.form.emails.length]);

  return (
    <section className="fsec active" id="sec-datos">
      <div className="sec-divider"><i className="fa-solid fa-user"></i><span>Datos Principales</span></div>
      <div className="form-row">
        <div className={`form-group${state.errors.nombre ? ' field-error' : ''}`} id="fg-nombre">
          <label>Nombre</label>
          <input type="text" placeholder="Josue" autoComplete="given-name" value={state.form.nombre} onChange={e => setField('nombre', e.target.value)} />
          <span className="field-err-msg">Campo obligatorio</span>
        </div>
        <div className="form-group">
          <label>Apellidos</label>
          <input type="text" placeholder="Eguia" autoComplete="family-name" value={state.form.apellidos} onChange={e => setField('apellidos', e.target.value)} />
        </div>
      </div>
      <div className={`multi-block${state.errors.telefonos ? ' field-error' : ''}`} id="fg-telefonos">
        <div className="multi-head">
          <label className="required">Telefono(s)</label>
          <button type="button" className="btn-add" onClick={addPhone}><i className="fa-solid fa-plus"></i> Anadir</button>
        </div>
        <div id="phones-container" ref={phonesRef}>
          {state.form.phones.map((p, i) => (
            <MultiRow key={p.id} isFirst={i === 0} type={p.type} value={p.value} types={PHONE_TYPES}
              inputType="tel" placeholder="+52 867 000 0000"
              onTypeChange={v => updatePhone(p.id, { type: v })}
              onValueChange={v => updatePhone(p.id, { value: v })}
              onRemove={() => removePhone(p.id)} />
          ))}
        </div>
        <span className="field-err-msg">Al menos un telefono es obligatorio</span>
      </div>
      <div className="multi-block">
        <div className="multi-head">
          <label>Correo(s)</label>
          <button type="button" className="btn-add" onClick={addEmail}><i className="fa-solid fa-plus"></i> Anadir</button>
        </div>
        <div id="emails-container" ref={emailsRef}>
          {state.form.emails.map((e, i) => (
            <MultiRow key={e.id} isFirst={i === 0} type={e.type} value={e.value} types={EMAIL_TYPES}
              inputType="email" placeholder="josue@emd.mx"
              onTypeChange={v => updateEmail(e.id, { type: v })}
              onValueChange={v => updateEmail(e.id, { value: v })}
              onRemove={() => removeEmail(e.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionTrabajo() {
  const { state, setField } = useApp();
  return (
    <section className="fsec" id="sec-trabajo">
      <div className="sec-divider"><i className="fa-solid fa-briefcase"></i><span>Trabajo &amp; Biografia</span></div>
      <div className="form-row">
        <div className="form-group"><label>Empresa</label><input type="text" placeholder="EMD Publicidad" autoComplete="organization" value={state.form.empresa} onChange={e => setField('empresa', e.target.value)} /></div>
        <div className="form-group"><label>Puesto</label><input type="text" placeholder="Director de Arte" value={state.form.puesto} onChange={e => setField('puesto', e.target.value)} /></div>
      </div>
      <div className="form-group"><label>Pagina Web</label><input type="url" placeholder="https://emd.mx" value={state.form.web} onChange={e => setField('web', e.target.value)} /></div>
      <div className="form-group"><label>Resumen / Biografia</label><textarea rows="4" placeholder="Especialista en branding y comunicacion visual..." value={state.form.nota} onChange={e => setField('nota', e.target.value)}></textarea></div>
    </section>
  );
}

export function SectionDireccion() {
  const { state, setField } = useApp();
  return (
    <section className="fsec" id="sec-direccion">
      <div className="sec-divider"><i className="fa-solid fa-location-dot"></i><span>Direccion</span></div>
      <div className="form-group"><label>Calle y Numero</label><input type="text" placeholder="Av. Guerrero 1234" value={state.form.calle} onChange={e => setField('calle', e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label>Ciudad</label><input type="text" placeholder="Nuevo Laredo" value={state.form.ciudad} onChange={e => setField('ciudad', e.target.value)} /></div>
        <div className="form-group"><label>Estado</label><input type="text" placeholder="Tamaulipas" value={state.form.estado} onChange={e => setField('estado', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Codigo Postal</label><input type="text" placeholder="88000" value={state.form.zip} onChange={e => setField('zip', e.target.value)} /></div>
        <div className="form-group"><label>Pais</label><input type="text" placeholder="Mexico" value={state.form.pais} onChange={e => setField('pais', e.target.value)} /></div>
      </div>
    </section>
  );
}

export function SectionMarca() {
  const { state, setLogo, removeLogo, setBrandColor, resetBrandColor } = useApp();
  const showToast = useToast();
  const fileInputRef = useRef(null);

  const onUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await cropLogoToSquare(file);
      setLogo(dataUrl);
      showToast('Logo cargado. Aparecera en el centro del QR.', 'success');
    } catch {
      showToast('Selecciona una imagen valida.', 'warn');
    }
  };

  const onRemove = () => {
    removeLogo();
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Logo eliminado.', 'info');
  };

  const onReset = () => {
    resetBrandColor();
    showToast('Color restablecido.', 'info');
  };

  return (
    <section className="fsec" id="sec-marca">
      <div className="sec-divider"><i className="fa-solid fa-palette"></i><span>Marca del Cliente</span></div>
      <div className="form-group">
        <label>Logo de la empresa</label>
        <div className="logo-row">
          <div className="logo-prev" id="logo-preview">
            {state.form.logo ? <img src={state.form.logo} alt="Logo" /> : <i className="fa-regular fa-image"></i>}
          </div>
          <div className="logo-acts">
            <label className="btn-upload"><i className="fa-solid fa-upload"></i> Subir logo
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onUpload} />
            </label>
            {state.form.logo && <button type="button" className="btn-rem" onClick={onRemove}><i className="fa-solid fa-trash"></i> Quitar</button>}
          </div>
        </div>
        <span className="field-note">Se dibuja centrado en el codigo QR.</span>
      </div>
      <div className="form-group">
        <label>Color de marca</label>
        <div className="color-row">
          <input type="color" value={state.form.brandColor || '#06b2e3'} onChange={e => setBrandColor(e.target.value)} />
          <div className="presets">
            {BRAND_PRESETS.map(c => (
              <button key={c} type="button" className="swatch" style={{ background: c }} title={c} onClick={() => setBrandColor(c)}></button>
            ))}
          </div>
          <button type="button" className="btn-reset-color" onClick={onReset}>Restablecer</button>
        </div>
        <span className="field-note">Colorea la vista previa y el marco del QR.</span>
      </div>
    </section>
  );
}

export function SectionRedes() {
  const { state, addSocial, updateSocial, removeSocial } = useApp();
  const active = new Set(state.form.socials.map(s => s.network));
  const rowsRef = useRef(null);

  useEffect(() => {
    const last = rowsRef.current?.querySelector('.social-active-row:last-child input');
    if (last && !last.value) last.focus();
  }, [state.form.socials.length]);

  return (
    <section className="fsec" id="sec-redes">
      <div className="sec-divider"><i className="fa-solid fa-hashtag"></i><span>Redes Sociales</span></div>
      <p className="sec-desc">Selecciona las redes que deseas anadir.</p>
      <div className="social-grid" id="social-grid">
        {SOCIAL_NETWORKS.map(net => (
          <button
            key={net.id}
            type="button"
            className={`social-btn${active.has(net.id) ? ' disabled' : ''}`}
            title={`Anadir ${net.id}`}
            onClick={() => { if (!active.has(net.id)) addSocial(net.id); }}
          >
            <i className={`fa-brands ${net.icon}`}></i>
          </button>
        ))}
      </div>
      <div id="active-socials-container" ref={rowsRef}>
        {state.form.socials.map(s => {
          const net = SOCIAL_NETWORKS.find(n => n.id === s.network);
          if (!net) return null;
          return (
            <div className="social-active-row" key={net.id}>
              <div className="social-ico" style={{ background: net.color }}><i className={`fa-brands ${net.icon}`}></i></div>
              <div className="form-group">
                <label>URL de {net.id[0].toUpperCase() + net.id.slice(1)}</label>
                <input type="url" className="social-input" value={s.value} placeholder={net.placeholder} onChange={e => updateSocial(net.id, e.target.value)} />
              </div>
              <button type="button" className="btn-del" onClick={() => removeSocial(net.id)}><i className="fa-solid fa-trash"></i></button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
