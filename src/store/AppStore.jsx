import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { reducer, initialState } from './reducer.js';
import { SQR_NETWORKS } from '../data.js';
import { buildVCardString } from '../lib/vcard.js';
import { renderQRCanvas } from '../lib/qr.js';
import { useToast } from './ToastProvider.jsx';

const LIB_KEY = 'emd_vcard_library_v1';
const AppCtx = createContext(null);

export function collectFormData(form) {
  return {
    ...form,
    phones: form.phones.filter(p => p.value.trim()).map(p => ({ type: p.type, value: p.value.trim() })),
    emails: form.emails.filter(e => e.value.trim()).map(e => ({ type: e.type, value: e.value.trim() })),
    socials: form.socials.filter(s => s.value.trim()).map(s => ({ network: s.network, value: s.value.trim() })),
  };
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const canvasRef = useRef(null);
  const [qrLoading, setQrLoading] = useState(false);
  const showToast = useToast();

  // ── UI-only state: modals, command palette, help overlay ──
  const [activeModal, setActiveModal] = useState(null); // null | 'library' | 'batch' | 'templates' | 'export'
  const [cmdOpen, setCmdOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const openModal = useCallback(name => setActiveModal(name), []);
  const closeModal = useCallback(() => setActiveModal(null), []);
  const openExportModal = useCallback(() => {
    if (!state.form.nombre.trim()) { showToast('Agrega un nombre antes de exportar.', 'warn'); return; }
    setActiveModal('export');
  }, [state.form.nombre, showToast]);

  // ── Theme: init from localStorage/system, keep <html data-theme> in sync ──
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const sysLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    dispatch({ type: 'SET_THEME', theme: saved || (sysLight ? 'light' : 'dark') });
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);
  const toggleTheme = useCallback(() => {
    dispatch({ type: 'SET_THEME', theme: state.theme === 'light' ? 'dark' : 'light' });
  }, [state.theme]);

  // ── Mode: mirror onto body[data-mode] so the existing CSS keeps working ──
  useEffect(() => { document.body.dataset.mode = state.mode; }, [state.mode]);

  // ── Brand color -> CSS var ──
  useEffect(() => {
    if (state.form.brandColor) document.documentElement.style.setProperty('--client-accent', state.form.brandColor);
    else document.documentElement.style.removeProperty('--client-accent');
  }, [state.form.brandColor]);

  // ── Library: load once, persist on every change ──
  useEffect(() => {
    try { dispatch({ type: 'SET_LIBRARY', cards: JSON.parse(localStorage.getItem(LIB_KEY) || '[]') }); }
    catch { /* corrupt storage — start empty */ }
  }, []);
  const saveLibrary = useCallback(cards => {
    localStorage.setItem(LIB_KEY, JSON.stringify(cards));
    dispatch({ type: 'SET_LIBRARY', cards });
  }, []);

  // ── Save status indicator: clean -> editing -> dirty, or -> saved on save ──
  const [saveStatus, setSaveStatus] = useState('clean');
  const isFirstVersion = useRef(true);
  useEffect(() => {
    if (isFirstVersion.current) { isFirstVersion.current = false; return; }
    setSaveStatus('editing');
    const t = setTimeout(() => setSaveStatus('dirty'), 1500);
    return () => clearTimeout(t);
  }, [state.formVersion]);

  // ── Form field helpers ──
  const setField = useCallback((field, value) => dispatch({ type: 'SET_FIELD', field, value }), []);
  const addPhone = useCallback(() => dispatch({ type: 'ADD_PHONE' }), []);
  const updatePhone = useCallback((id, patch) => dispatch({ type: 'UPDATE_PHONE', id, patch }), []);
  const removePhone = useCallback(id => dispatch({ type: 'REMOVE_PHONE', id }), []);
  const addEmail = useCallback(() => dispatch({ type: 'ADD_EMAIL' }), []);
  const updateEmail = useCallback((id, patch) => dispatch({ type: 'UPDATE_EMAIL', id, patch }), []);
  const removeEmail = useCallback(id => dispatch({ type: 'REMOVE_EMAIL', id }), []);
  const addSocial = useCallback(network => dispatch({ type: 'ADD_SOCIAL', network }), []);
  const updateSocial = useCallback((network, value) => dispatch({ type: 'UPDATE_SOCIAL', network, value }), []);
  const removeSocial = useCallback(network => dispatch({ type: 'REMOVE_SOCIAL', network }), []);
  const setLogo = useCallback(dataUrl => dispatch({ type: 'SET_LOGO', dataUrl }), []);
  const removeLogo = useCallback(() => dispatch({ type: 'REMOVE_LOGO' }), []);
  const setBrandColor = useCallback(color => dispatch({ type: 'SET_BRAND_COLOR', color }), []);
  const resetBrandColor = useCallback(() => dispatch({ type: 'RESET_BRAND_COLOR' }), []);

  const setMode = useCallback(mode => dispatch({ type: 'SET_MODE', mode }), []);
  const setSection = useCallback(id => dispatch({ type: 'SET_SECTION', id }), []);

  const setSqrSelected = useCallback(id => dispatch({ type: 'SET_SQR_SELECTED', id }), []);
  const setSqrValue = useCallback(value => dispatch({ type: 'SET_SQR_VALUE', value }), []);
  const setSqrWa = useCallback(patch => dispatch({ type: 'SET_SQR_WA', patch }), []);

  // ── QR generation ──
  const generateVCardQR = useCallback(async () => {
    const data = collectFormData(state.form);
    if (!data.nombre || data.phones.length === 0) {
      dispatch({ type: 'SET_SECTION', id: 'datos' });
      dispatch({ type: 'SET_ERRORS', errors: { nombre: !data.nombre, telefonos: data.phones.length === 0 } });
      showToast('Nombre y Telefono son obligatorios.', 'warn');
      return;
    }
    setQrLoading(true);
    await new Promise(r => setTimeout(r, 320));
    try {
      const vcStr = buildVCardString(data);
      await renderQRCanvas(vcStr, data.logo, canvasRef.current);
      dispatch({ type: 'SET_QR', patch: { hasQR: true, outdated: false, instruction: 'Escanea para guardar el contacto.' } });
      showToast('QR generado correctamente.', 'success');
    } catch {
      showToast('Error al generar el QR.', 'warn');
    } finally {
      setQrLoading(false);
    }
  }, [state.form, showToast]);

  const generateSocialQR = useCallback(async (url, label) => {
    if (!url) return;
    try {
      await renderQRCanvas(url, null, canvasRef.current, 'M');
      dispatch({
        type: 'SET_QR',
        patch: {
          hasQR: true, outdated: false,
          instruction: label ? `Escanea para abrir ${label}`
            : SQR_NETWORKS.find(n => n.id === state.sqr.selectedId)?.name
              ? `Perfil de ${SQR_NETWORKS.find(n => n.id === state.sqr.selectedId).name}`
              : 'Escanea el QR',
        },
      });
    } catch { showToast('Error al generar el QR.', 'warn'); }
  }, [state.sqr.selectedId, showToast]);

  // Social QR mode: vCard's own "Generar QR" doesn't apply here — it's
  // auto-generated as you type. Guard the shared trigger points.
  const generateQR = useCallback(() => {
    if (state.mode === 'social') {
      showToast('En Perfil Social QR el codigo se genera automaticamente al escribir.', 'info');
      return;
    }
    return generateVCardQR();
  }, [state.mode, generateVCardQR, showToast]);

  // ── Library actions ──
  const saveCurrentCard = useCallback(() => {
    const data = collectFormData(state.form);
    if (!data.nombre || data.phones.length === 0) {
      dispatch({ type: 'SET_MODE', mode: 'vcard' });
      dispatch({ type: 'SET_SECTION', id: 'datos' });
      dispatch({ type: 'SET_ERRORS', errors: { nombre: !data.nombre, telefonos: data.phones.length === 0 } });
      showToast('Agrega Nombre y Telefono antes de guardar.', 'warn');
      return;
    }
    const now = new Date().toISOString();
    if (state.editingId) {
      const idx = state.library.findIndex(c => c.id === state.editingId);
      if (idx !== -1) {
        const cards = [...state.library];
        cards[idx] = { ...cards[idx], ...data, updatedAt: now };
        saveLibrary(cards);
        setSaveStatus('saved');
        showToast('Tarjeta actualizada.', 'success');
        return;
      }
    }
    const entry = { id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, createdAt: now, updatedAt: now, ...data };
    saveLibrary([entry, ...state.library]);
    dispatch({ type: 'SET_EDITING', id: entry.id });
    setSaveStatus('saved');
    showToast('Tarjeta guardada.', 'success');
  }, [state.form, state.editingId, state.library, saveLibrary, showToast]);

  const newCard = useCallback(() => {
    dispatch({ type: 'NEW_CARD' });
    setSaveStatus('clean');
    showToast('Formulario listo para nueva tarjeta.', 'info');
  }, [showToast]);

  const loadCard = useCallback(card => {
    dispatch({ type: 'LOAD_CARD', card });
    dispatch({ type: 'SET_MODE', mode: 'vcard' });
    setSaveStatus('clean');
    showToast(`Editando: ${card.nombre}.`, 'info');
  }, [showToast]);

  const duplicateCard = useCallback(id => {
    const orig = state.library.find(c => c.id === id);
    if (!orig) return;
    const now = new Date().toISOString();
    const copy = { ...orig, id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, apellidos: (orig.apellidos || '') + ' (copia)', createdAt: now, updatedAt: now };
    saveLibrary([copy, ...state.library]);
    showToast('Tarjeta duplicada.', 'success');
  }, [state.library, saveLibrary, showToast]);

  const deleteCard = useCallback(id => {
    const card = state.library.find(c => c.id === id);
    if (!card) return;
    if (!confirm(`Eliminar tarjeta de ${card.nombre}?`)) return;
    saveLibrary(state.library.filter(c => c.id !== id));
    if (state.editingId === id) dispatch({ type: 'SET_EDITING', id: null });
    showToast('Tarjeta eliminada.', 'info');
  }, [state.library, state.editingId, saveLibrary, showToast]);

  const value = useMemo(() => ({
    state, dispatch, canvasRef, qrLoading,
    setField, addPhone, updatePhone, removePhone,
    addEmail, updateEmail, removeEmail,
    addSocial, updateSocial, removeSocial,
    setLogo, removeLogo, setBrandColor, resetBrandColor,
    setMode, setSection,
    setSqrSelected, setSqrValue, setSqrWa,
    generateVCardQR, generateSocialQR, generateQR,
    saveCurrentCard, newCard, loadCard, duplicateCard, deleteCard,
    toggleTheme,
    activeModal, openModal, closeModal, openExportModal,
    cmdOpen, setCmdOpen, helpOpen, setHelpOpen, saveStatus,
  }), [state, qrLoading, setField, addPhone, updatePhone, removePhone, addEmail, updateEmail, removeEmail,
    addSocial, updateSocial, removeSocial, setLogo, removeLogo, setBrandColor, resetBrandColor,
    setMode, setSection, setSqrSelected, setSqrValue, setSqrWa, generateVCardQR, generateSocialQR, generateQR,
    saveCurrentCard, newCard, loadCard, duplicateCard, deleteCard, toggleTheme,
    activeModal, openModal, closeModal, openExportModal, cmdOpen, helpOpen, saveStatus]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  return useContext(AppCtx);
}
