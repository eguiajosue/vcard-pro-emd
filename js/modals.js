// Generic modal initialization (close buttons, backdrop clicks, templates)
import { showToast } from './toast.js';
import { closeModal } from './library.js';

export function initModals() {
  // Close buttons with data-close attribute
  document.querySelectorAll('.modal-close[data-close], [data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });

  // Backdrop click to close
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('open'); });
  });

  // Templates
  document.querySelectorAll('.tpl-card[data-template]').forEach(card => {
    card.addEventListener('click', () => {
      showToast(`Plantilla "${card.querySelector('h4').textContent}" aplicada.`, 'success');
      closeModal('templates-overlay');
    });
  });

  document.getElementById('btn-templates-open')?.addEventListener('click', () => {
    import('./library.js').then(({ openModal }) => openModal('templates-overlay'));
  });
}
