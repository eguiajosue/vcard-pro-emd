import { useApp } from '../../store/AppStore.jsx';
import { useToast } from '../../store/ToastProvider.jsx';

const TEMPLATES = [
  { id: 'minimalista', name: 'Minimalista', desc: 'Limpio y elegante.', bg: 'linear-gradient(135deg,#f8f8f6,#e8e8e6)' },
  { id: 'corporativo', name: 'Corporativo', desc: 'Formal y profesional.', bg: 'linear-gradient(135deg,#161616,#2a2a2a)' },
  { id: 'creativo',    name: 'Creativo',    desc: 'Audaz y moderno.',      bg: 'linear-gradient(135deg,#ea1585,#06b2e3,#45e0a8)' },
];

export default function TemplatesModal() {
  const { activeModal, closeModal } = useApp();
  const showToast = useToast();
  if (activeModal !== 'templates') return null;

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="modal-box">
        <div className="modal-hd"><h3><i className="fa-solid fa-palette"></i> Plantillas</h3><button className="modal-close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></button></div>
        <p className="modal-desc">Selecciona el diseno base. Personaliza colores y logo despues.</p>
        <div className="tpl-grid">
          {TEMPLATES.map(t => (
            <div className="tpl-card" key={t.id} onClick={() => { showToast(`Plantilla "${t.name}" aplicada.`, 'success'); closeModal(); }}>
              <div className="tpl-prev" style={{ background: t.bg }}></div>
              <h4>{t.name}</h4>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
