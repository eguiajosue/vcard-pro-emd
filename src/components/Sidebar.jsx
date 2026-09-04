import { useApp } from '../store/AppStore.jsx';

const NAV_ITEMS = [
  { id: 'datos',     icon: 'fa-user',          tip: 'Datos' },
  { id: 'trabajo',   icon: 'fa-briefcase',     tip: 'Trabajo' },
  { id: 'direccion', icon: 'fa-location-dot',  tip: 'Direccion' },
  { id: 'marca',     icon: 'fa-palette',       tip: 'Marca' },
  { id: 'redes',     icon: 'fa-hashtag',       tip: 'Redes' },
];

function hasData(id, form) {
  switch (id) {
    case 'datos':     return !!(form.nombre.trim() || form.phones.some(p => p.value.trim()));
    case 'trabajo':   return !!(form.empresa || form.puesto || form.web || form.nota);
    case 'direccion': return !!(form.calle || form.ciudad || form.estado || form.zip || form.pais);
    case 'marca':     return !!(form.logo || form.brandColor);
    case 'redes':     return form.socials.length > 0;
    default:          return false;
  }
}

export default function Sidebar() {
  const { state, setSection, setMode, toggleTheme } = useApp();
  const isVC = state.mode === 'vcard';

  return (
    <nav className="sidebar">
      <div className="nav-top" style={{ opacity: isVC ? 1 : 0.35, pointerEvents: isVC ? 'auto' : 'none' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item${state.currentSection === item.id && isVC ? ' active' : ''}${hasData(item.id, state.form) ? ' has-data' : ''}`}
            data-tip={item.tip}
            onClick={() => { setMode('vcard'); setSection(item.id); }}
          >
            <i className={`fa-solid ${item.icon}`}></i><span className="ndot"></span>
          </button>
        ))}
      </div>
      <div className="nav-sep"></div>
      <div className="nav-bot">
        <div className="mode-pill">
          <button className={`mode-btn${isVC ? ' active' : ''}`} onClick={() => setMode('vcard')}>VC</button>
          <button className={`mode-btn${!isVC ? ' active' : ''}`} onClick={() => setMode('social')}>QR</button>
        </div>
        <button className="theme-nav" onClick={toggleTheme} title="Tema">
          <i className={`fa-solid ${state.theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
        </button>
      </div>
    </nav>
  );
}
