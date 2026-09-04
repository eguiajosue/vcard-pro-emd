import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store/AppStore.jsx';
import { MOD } from '../lib/os.js';

export default function CommandPalette() {
  const app = useApp();
  const { cmdOpen, setCmdOpen, setMode, setSection, saveCurrentCard, newCard, openModal, generateQR, toggleTheme, setHelpOpen } = app;
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const COMMANDS = useMemo(() => [
    { label: 'Nueva Tarjeta',    sc: [MOD, 'N'], icon: 'fa-plus',          action: () => newCard() },
    { label: 'Guardar Tarjeta',  sc: [MOD, 'S'], icon: 'fa-floppy-disk',   action: () => saveCurrentCard() },
    { label: 'Generar QR',       sc: [MOD, '↵'], icon: 'fa-qrcode',        action: () => generateQR() },
    { label: 'Mis Tarjetas',     sc: [MOD, 'L'], icon: 'fa-address-book',  action: () => openModal('library') },
    { label: 'Exportar',         sc: [MOD, 'E'], icon: 'fa-download',      action: () => app.openExportModal() },
    { label: 'Importar CSV',     sc: [],         icon: 'fa-file-csv',      action: () => openModal('batch') },
    { label: 'Plantillas',       sc: [],         icon: 'fa-palette',       action: () => openModal('templates') },
    { label: 'Cambiar Tema',     sc: [MOD, 'D'], icon: 'fa-moon',          action: () => toggleTheme() },
    { label: 'Modo Social QR',   sc: [],         icon: 'fa-share-nodes',   action: () => setMode('social') },
    { label: 'Modo vCard',       sc: [],         icon: 'fa-address-card',  action: () => setMode('vcard') },
    { label: 'Ayuda / Tutorial', sc: ['?'],      icon: 'fa-circle-question', action: () => setHelpOpen(true) },
    { label: 'Sec. Datos',       sc: [],         icon: 'fa-user',          action: () => { setMode('vcard'); setSection('datos'); } },
    { label: 'Sec. Trabajo',     sc: [],         icon: 'fa-briefcase',     action: () => { setMode('vcard'); setSection('trabajo'); } },
    { label: 'Sec. Direccion',   sc: [],         icon: 'fa-location-dot',  action: () => { setMode('vcard'); setSection('direccion'); } },
    { label: 'Sec. Marca',       sc: [],         icon: 'fa-palette',       action: () => { setMode('vcard'); setSection('marca'); } },
    { label: 'Sec. Redes',       sc: [],         icon: 'fa-hashtag',       action: () => { setMode('vcard'); setSection('redes'); } },
  ], [newCard, saveCurrentCard, generateQR, openModal, app, toggleTheme, setMode, setHelpOpen, setSection]);

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  const close = () => { setCmdOpen(false); setQuery(''); setFocusIdx(0); };

  useEffect(() => {
    if (cmdOpen) { setTimeout(() => inputRef.current?.focus(), 50); }
  }, [cmdOpen]);

  useEffect(() => { setFocusIdx(0); }, [query]);

  useEffect(() => {
    listRef.current?.children[focusIdx]?.scrollIntoView({ block: 'nearest' });
  }, [focusIdx]);

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[focusIdx]) { close(); filtered[focusIdx].action(); }
    }
  };

  if (!cmdOpen) return null;

  return (
    <div className="cmd-overlay open" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="cmd-box">
        <div className="cmd-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input ref={inputRef} type="text" placeholder="Buscar acciones..." autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown} />
        </div>
        <div className="cmd-results" ref={listRef}>
          {filtered.length === 0 && <div style={{ padding: 18, textAlign: 'center', fontSize: '.77rem', color: 'var(--t2)' }}>Sin resultados</div>}
          {filtered.map((c, i) => (
            <div key={c.label} className={`cmd-item${i === focusIdx ? ' focused' : ''}`} onClick={() => { close(); c.action(); }}>
              <div className="cmd-ico"><i className={`fa-solid ${c.icon}`}></i></div>
              <span className="cmd-lbl">{c.label}</span>
              {c.sc.length > 0 && <div className="cmd-sc">{c.sc.map((k, ki) => <kbd key={ki}>{k}</kbd>)}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
