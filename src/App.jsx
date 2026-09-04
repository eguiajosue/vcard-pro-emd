import { useEffect } from 'react';
import { useApp } from './store/AppStore.jsx';
import { VC_SECTIONS } from './data.js';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import FormPanel from './components/form/FormPanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import StatusBar from './components/StatusBar.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import LibraryModal from './components/modals/LibraryModal.jsx';
import BatchModal from './components/modals/BatchModal.jsx';
import TemplatesModal from './components/modals/TemplatesModal.jsx';
import ExportModal from './components/modals/ExportModal.jsx';
import HelpOverlay from './components/help/HelpOverlay.jsx';

export default function App() {
  const {
    state, setSection, saveCurrentCard, newCard, openModal, closeModal,
    generateQR, toggleTheme, setCmdOpen, setHelpOpen,
  } = useApp();

  // First-time visitor gets the help overlay automatically
  useEffect(() => {
    if (!localStorage.getItem('vcp_help_seen')) setHelpOpen(true);
  }, [setHelpOpen]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeydown = e => {
      const mod = e.metaKey || e.ctrlKey;
      if (e.key === 'k' && mod) { e.preventDefault(); setCmdOpen(v => !v); return; }
      if (e.key === 's' && mod) { e.preventDefault(); saveCurrentCard(); return; }
      if (e.key === 'n' && mod) { e.preventDefault(); newCard(); return; }
      if (e.key === 'l' && mod) { e.preventDefault(); openModal('library'); return; }
      if (e.key === 'e' && mod) { e.preventDefault(); openModal('export'); return; }
      if (e.key === 'd' && mod) { e.preventDefault(); toggleTheme(); return; }
      if (e.key === 'Enter' && mod) { e.preventDefault(); generateQR(); return; }
      if (e.key === 'ArrowRight' && mod) {
        e.preventDefault();
        const idx = VC_SECTIONS.indexOf(state.currentSection);
        if (idx >= 0 && idx < VC_SECTIONS.length - 1) {
          setSection(VC_SECTIONS[idx + 1]);
          document.getElementById(`sec-${VC_SECTIONS[idx + 1]}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      if (e.key === 'ArrowLeft' && mod) {
        e.preventDefault();
        const idx = VC_SECTIONS.indexOf(state.currentSection);
        if (idx > 0) {
          setSection(VC_SECTIONS[idx - 1]);
          document.getElementById(`sec-${VC_SECTIONS[idx - 1]}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      if (e.key === '?' && !mod) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { setHelpOpen(true); }
        return;
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        closeModal();
        setHelpOpen(false);
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [state.currentSection, setSection, saveCurrentCard, newCard, openModal, closeModal, toggleTheme, generateQR, setCmdOpen, setHelpOpen]);

  return (
    <>
      <TopBar />
      <main className="main">
        <Sidebar />
        <FormPanel />
        <PreviewPanel />
      </main>
      <StatusBar />
      <CommandPalette />
      <LibraryModal />
      <BatchModal />
      <TemplatesModal />
      <ExportModal />
      <HelpOverlay />
    </>
  );
}
