// Toast notification system
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success:'fa-circle-check', warn:'fa-triangle-exclamation', info:'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
