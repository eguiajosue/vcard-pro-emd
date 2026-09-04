/**
 * vCard Pro — EMD Publicidad
 * Entry point: orchestrates all modules
 */
import { initTheme }    from './theme.js';
import { initNav }      from './nav.js';
import { initFields, initSocialGrid } from './fields.js';
import { initBrand }    from './brand.js';
import { initQR }       from './qr.js';
import { initLibrary }  from './library.js';
import { initBatch }    from './batch.js';
import { initExport }   from './export.js';
import { initSocialQR } from './social-qr.js';
import { initCommands } from './commands.js';
import { initModals }   from './modals.js';
import { initHelp }    from './help.js';
import { updatePreview } from './preview.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initFields();
  initSocialGrid();
  initBrand();
  initQR();
  initLibrary();
  initBatch();
  initExport();
  initSocialQR();
  initModals();
  initHelp();
  initCommands();
  updatePreview();

  console.log('%cvCard Pro — EMD Publicidad', 'color:#ea1585;font-weight:700;font-size:14px;');
  console.log('%cUI/UX: Josue Eguia | Nuevo Laredo, Tamps.', 'color:#888;font-size:11px;');
});
