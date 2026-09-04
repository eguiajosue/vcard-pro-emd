import { MOD, OS_NAME, OS_ICON } from '../lib/os.js';

export default function StatusBar() {
  return (
    <footer className="status-bar">
      <div className="sb-l">
        <span className="sdot"></span><span>Listo</span>
        <span className="sb-os-badge"><i className={`fa-brands ${OS_ICON}`} style={{ marginRight: 3, opacity: .6, fontSize: '.75rem' }}></i>{OS_NAME}</span>
      </div>
      <div className="sb-c">vCard <span className="logo-accent">Pro</span> &middot; EMD Publicidad</div>
      <div className="sb-r">
        <kbd>{MOD}K</kbd> comandos &nbsp;&middot;&nbsp;
        <kbd>{MOD}S</kbd> guardar &nbsp;&middot;&nbsp;
        <kbd>{MOD}&#8629;</kbd> generar
      </div>
    </footer>
  );
}
