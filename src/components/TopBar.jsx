import { useApp } from '../store/AppStore.jsx';
import { SECTION_META } from '../data.js';
import { MOD } from '../lib/os.js';

export default function TopBar() {
  const { state, toggleTheme, setCmdOpen, openModal, setHelpOpen } = useApp();
  const meta = SECTION_META[state.currentSection] || SECTION_META.datos;
  const editing = !!state.editingId;
  const currentCard = editing ? state.library.find(c => c.id === state.editingId) : null;
  const statusText = editing
    ? `Editando: ${currentCard?.nombre || ''} ${currentCard?.apellidos || ''}`.trim()
    : 'Tarjeta nueva';

  return (
    <header className="topbar">
      <div className="tl"><span className="logo-mark">Pro</span></div>
      <div className="tb-crumb">
        <i className={`fa-solid ${meta.icon}`}></i>
        <span>{meta.title}</span>
      </div>
      <div className="tb-right">
        <div className={`edit-st${editing ? ' editing' : ''}`}>
          <i className={editing ? 'fa-regular fa-pen-to-square' : 'fa-regular fa-file'}></i>
          <span>{statusText}</span>
        </div>
        <div className="tb-sep"></div>
        <button className="cmd-pill" onClick={() => setCmdOpen(true)} title={`Paleta de comandos (${MOD}K)`}>
          <i className="fa-solid fa-magnifying-glass"></i>
          Comandos
          <kbd>{MOD}K</kbd>
        </button>
        <button className="tb-btn" onClick={() => openModal('library')} title="Mis Tarjetas">
          <i className="fa-solid fa-address-book"></i>
          <span className="tb-badge">{state.library.length}</span>
        </button>
        <button className="tb-btn" onClick={() => openModal('batch')} title="Importar CSV">
          <i className="fa-solid fa-file-csv"></i>
        </button>
        <button className="tb-btn" onClick={() => openModal('templates')} title="Plantillas">
          <i className="fa-solid fa-palette"></i>
        </button>
        <div className="tb-sep"></div>
        <button className="tb-btn" onClick={() => setHelpOpen(true)} title="Ayuda (?)"><i className="fa-solid fa-circle-question"></i></button>
        <button className="tb-btn" onClick={toggleTheme} title="Cambiar tema">
          <i className={`fa-solid ${state.theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
        </button>
      </div>
    </header>
  );
}
