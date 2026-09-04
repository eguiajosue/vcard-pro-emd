import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastCtx = createContext(null);

const ICONS = { success: 'fa-circle-check', warn: 'fa-triangle-exclamation', info: 'fa-circle-info' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++counter.current;
    setToasts(t => [...t, { id, message, type, hiding: false }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, hiding: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300);
    }, 3200);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div id="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}${t.hiding ? ' hide' : ''}`}>
            <i className={`fa-solid ${ICONS[t.type] || ICONS.info}`}></i>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
