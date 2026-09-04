import { useEffect, useRef } from 'react';
import { useApp } from '../../store/AppStore.jsx';
import { VC_SECTIONS } from '../../data.js';
import { SectionDatos, SectionTrabajo, SectionDireccion, SectionMarca, SectionRedes } from './Sections.jsx';
import SocialQRSection from './SocialQRSection.jsx';

export default function FormPanel() {
  const { state, setSection, generateQR, saveCurrentCard, qrLoading, openExportModal } = useApp();
  const wrapRef = useRef(null);

  const scrollToSection = id => {
    setSection(id);
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Highlight the sidebar/crumb for whichever vCard section is scrolled into view
  useEffect(() => {
    const root = wrapRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setSection(entry.target.id.replace('sec-', ''));
      });
    }, { root, threshold: 0.3 });
    root.querySelectorAll('.fsec[id]').forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, [state.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const idx = VC_SECTIONS.indexOf(state.currentSection);
  const prevSection = () => { if (idx > 0) scrollToSection(VC_SECTIONS[idx - 1]); };
  const nextSection = () => { if (idx >= 0 && idx < VC_SECTIONS.length - 1) scrollToSection(VC_SECTIONS[idx + 1]); };

  return (
    <div className="form-panel">
      <div className="sections-wrap" ref={wrapRef}>
        <SectionDatos />
        <SectionTrabajo />
        <SectionDireccion />
        <SectionMarca />
        <SectionRedes />
        <SocialQRSection />
        <div className="dev-info">UI/UX por <strong>Josue Eguia</strong> &middot; Nuevo Laredo, Tamps.</div>
      </div>

      <div className="form-foot">
        <button className={`btn-gen${qrLoading ? ' loading' : ''}`} onClick={generateQR}>
          <span className="sp"></span>
          <i className="fa-solid fa-qrcode btn-lbl-icon"></i>
          <span className="btn-lbl">Generar QR</span>
        </button>
        <button className="ico-btn sv" onClick={saveCurrentCard} title="Guardar"><i className="fa-regular fa-floppy-disk"></i></button>
        <button className="ico-btn ex" onClick={openExportModal} title="Exportar"><i className="fa-solid fa-download"></i></button>
        <div className="sec-nav">
          <button className="sa" onClick={prevSection} title="Anterior" disabled={idx <= 0}><i className="fa-solid fa-chevron-left"></i></button>
          <button className="sa" onClick={nextSection} title="Siguiente" disabled={idx === -1 || idx >= VC_SECTIONS.length - 1}><i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  );
}
