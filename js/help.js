/**
 * Help / Onboarding module
 * Uses GSAP + ScrollTrigger for scroll animations
 */

let gsapLoaded = false;

// ── Dynamic script loader ──────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureGSAP() {
  if (gsapLoaded) return;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
  window.gsap.registerPlugin(window.ScrollTrigger);
  gsapLoaded = true;
}

// ── Init ───────────────────────────────────────────
export function initHelp() {
  buildHelpHTML();

  // Help button in topbar
  const btn = document.getElementById('btn-help');
  btn?.addEventListener('click', openHelp);

  // Close
  document.getElementById('help-close-btn')?.addEventListener('click', closeHelp);

  // CTA buttons inside help
  document.getElementById('help-start-btn')?.addEventListener('click', closeHelp);
  document.getElementById('help-scroll-btn')?.addEventListener('click', () => {
    document.getElementById('help-quickstart')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('help-overlay')?.classList.contains('open')) closeHelp();
  });

  // First-time visitor
  if (!localStorage.getItem('vcp_help_seen')) openHelp();
}

export async function openHelp() {
  const overlay = document.getElementById('help-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  document.getElementById('help-scroll-area').scrollTop = 0;
  localStorage.setItem('vcp_help_seen', '1');

  await ensureGSAP();
  setupAnimations();
  setupProgressBar();
  startIllustrationLoops();
}

function closeHelp() {
  document.getElementById('help-overlay')?.classList.remove('open');
  // Kill all ScrollTrigger instances for this overlay
  window.ScrollTrigger?.getAll().forEach(t => t.kill());
}

// ── Progress bar ───────────────────────────────────
function setupProgressBar() {
  const scroll = document.getElementById('help-scroll-area');
  const bar    = document.getElementById('help-progress-bar');
  if (!scroll || !bar) return;
  scroll.addEventListener('scroll', () => {
    const pct = (scroll.scrollTop / (scroll.scrollHeight - scroll.clientHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  });
}

// ── GSAP scroll animations ─────────────────────────
function setupAnimations() {
  const gsap = window.gsap;
  const ST   = window.ScrollTrigger;
  const scroller = document.getElementById('help-scroll-area');

  ST.defaults({ scroller });

  // Hero elements
  gsap.fromTo('.help-hero .hero-badge',
    { opacity: 0, y: -16 },
    { opacity: 1, y: 0, duration: .5, ease: 'back.out(1.4)' }
  );
  gsap.fromTo('.help-hero h1',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: .65, ease: 'power3.out', delay: .15 }
  );
  gsap.fromTo('.help-hero p',
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: .5, ease: 'power2.out', delay: .3 }
  );
  gsap.fromTo('.hero-cta',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: .45, ease: 'power2.out', delay: .45 }
  );

  // Generic reveal: .gsap-reveal
  gsap.utils.toArray('.gsap-reveal').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0, duration: .65, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      }
    );
  });

  // Left reveals
  gsap.utils.toArray('.gsap-reveal-left').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -28 },
      {
        opacity: 1, x: 0, duration: .6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  // Right reveals
  gsap.utils.toArray('.gsap-reveal-right').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 28 },
      {
        opacity: 1, x: 0, duration: .6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  // Scale reveals
  gsap.utils.toArray('.gsap-reveal-scale').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, scale: .88 },
      {
        opacity: 1, scale: 1, duration: .55, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  // Stagger children
  gsap.utils.toArray('[data-gsap-stagger]').forEach(parent => {
    const delay = parseFloat(parent.dataset.gsapDelay || 0);
    gsap.fromTo(parent.children,
      { opacity: 0, y: 22 },
      {
        opacity: 1, y: 0,
        duration: .5, ease: 'power2.out',
        stagger: parseFloat(parent.dataset.gsapStagger || .08),
        delay,
        scrollTrigger: { trigger: parent, start: 'top 85%' }
      }
    );
  });

  // Bento cards stagger
  gsap.utils.toArray('.bento-grid').forEach(grid => {
    gsap.fromTo(grid.children,
      { opacity: 0, y: 28, scale: .96 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: .5, ease: 'power2.out', stagger: .07,
        scrollTrigger: { trigger: grid, start: 'top 85%' }
      }
    );
  });

  // Shortcut rows stagger
  gsap.utils.toArray('.shortcuts-grid').forEach(grid => {
    gsap.fromTo(grid.children,
      { opacity: 0, x: -14 },
      {
        opacity: 1, x: 0,
        duration: .4, ease: 'power2.out', stagger: .05,
        scrollTrigger: { trigger: grid, start: 'top 85%' }
      }
    );
  });

  // Tips strip
  const tips = document.querySelector('.tips-strip');
  if (tips) {
    gsap.fromTo(tips.children,
      { opacity: 0, scale: .88, y: 10 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: .4, stagger: .06, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: tips, start: 'top 88%' }
      }
    );
  }

  // Parallax on hero blob
  gsap.to('.help-hero::before', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: { trigger: '.help-hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });

  ST.refresh();
}

// ── CSS Illustration loops ─────────────────────────
function startIllustrationLoops() {
  // Cycle nav items highlight
  const navItems = document.querySelectorAll('.illus-nav-item');
  if (navItems.length) {
    let ni = 0;
    setInterval(() => {
      navItems.forEach((el, i) => el.classList.toggle('act', i === ni));
      ni = (ni + 1) % navItems.length;
    }, 900);
  }

  // Cycle export pills
  const expPills = document.querySelectorAll('.illus-exp-pill');
  if (expPills.length) {
    let ep = 0;
    setInterval(() => {
      expPills.forEach((el, i) => el.classList.toggle('act', i === ep));
      ep = (ep + 1) % expPills.length;
    }, 1100);
  }

  // Animate key presses
  const keys = document.querySelectorAll('.illus-key');
  if (keys.length) {
    const keySeqs = [[0,1],[2],[0,1,2]];
    let ks = 0;
    setInterval(() => {
      keys.forEach(k => k.classList.remove('press'));
      const seq = keySeqs[ks % keySeqs.length];
      seq.forEach(i => keys[i]?.classList.add('press'));
      ks++;
    }, 800);
  }

  // Typing simulation in form fields
  const typeEls = document.querySelectorAll('.illus-field-text[data-text]');
  typeEls.forEach(el => {
    const text = el.dataset.text;
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(type, 80);
      } else {
        setTimeout(() => { i = 0; type(); }, 2000);
      }
    };
    setTimeout(type, Math.random() * 800);
  });
}

// ── HTML builder ───────────────────────────────────
function buildHelpHTML() {
  const overlay = document.createElement('div');
  overlay.id = 'help-overlay';
  overlay.className = 'help-overlay';
  overlay.innerHTML = helpContent();
  document.body.appendChild(overlay);
}

function helpContent() {
  return `
<!-- Help topbar -->
<div class="help-bar">
  <div class="help-bar-brand">
    <span class="logo-mark">Pro</span>
    <span class="help-bar-title">Guia de uso</span>
  </div>
  <div class="help-progress">
    <div class="help-progress-bar" id="help-progress-bar"></div>
  </div>
  <button class="help-close" id="help-close-btn">
    <i class="fa-solid fa-xmark"></i> Cerrar <kbd>Esc</kbd>
  </button>
</div>

<!-- Scrollable area -->
<div class="help-scroll" id="help-scroll-area">

  <!-- HERO -->
  <div class="help-hero">
    <span class="hero-badge"><i class="fa-solid fa-sparkles"></i> Guia completa de vCard Pro</span>
    <h1>Crea tarjetas digitales <em>profesionales</em> en segundos</h1>
    <p>Genera vCards con codigo QR, personaliza con la marca de tu cliente y exporta en multiples formatos. Todo desde una sola herramienta.</p>
    <div class="hero-cta">
      <button class="btn-hero-primary" id="help-scroll-btn">
        <i class="fa-solid fa-arrow-down"></i> Ver como funciona
      </button>
      <button class="btn-hero-secondary" id="help-start-btn">
        <i class="fa-solid fa-play"></i> Empezar ahora
      </button>
    </div>
  </div>

  <!-- QUICK START -->
  <div class="help-section" id="help-quickstart">
    <p class="section-eyebrow gsap-reveal">Inicio rapido</p>
    <h2 class="section-title gsap-reveal">3 pasos para tu primera tarjeta</h2>
    <p class="section-sub gsap-reveal">Desde cero hasta un QR escaneable en menos de un minuto.</p>

    <div class="steps-grid" data-gsap-stagger="1" data-gsap-delay="0">

      <div class="step-card">
        <div class="step-num" data-n="1">Datos del contacto</div>
        <h3>Llena el formulario</h3>
        <p>Navega entre secciones con el sidebar. Agrega nombre, telefonos, correos, empresa y redes sociales.</p>
        <div class="step-illus">
          <div class="illus-form">
            <div class="illus-field filled">
              <span class="illus-field-text" data-text="Josue Eguia">Josue Eguia</span>
            </div>
            <div class="illus-field filled">
              <span class="illus-field-text" data-text="+52 867 000 0000">+52 867 000 0000</span>
            </div>
            <div class="illus-field">
              <span class="illus-field-text" data-text="josue@emd.mx"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="step-num" data-n="2">Codigo QR</div>
        <h3>Genera el QR</h3>
        <p>Presiona <strong>Generar QR</strong> o usa <kbd style="font-family:var(--mono);font-size:.7rem;background:var(--bg-e);border:1px solid var(--br-s);border-radius:3px;padding:1px 5px;">&#8984;Enter</kbd>. El QR codifica todos tus datos de contacto en formato vCard 3.0.</p>
        <div class="step-illus">
          <div class="illus-qr">
            <div class="illus-qr-box">
              ${qrDotsHTML()}
            </div>
            <span style="font-size:.65rem;color:var(--t2);">vCard 3.0 · Alta resolucion</span>
          </div>
        </div>
      </div>

      <div class="step-card">
        <div class="step-num" data-n="3">Guardar y exportar</div>
        <h3>Distribuye tu tarjeta</h3>
        <p>Guarda en la libreria, descarga el QR como imagen o exporta en VCF, PDF, HTML o CSV.</p>
        <div class="step-illus">
          <div class="illus-exports">
            ${['fa-file-csv .VCF','fa-file-pdf .PDF','fa-globe .HTML','fa-table .CSV'].map((f,i) => {
              const [icon, label] = f.split(' ');
              return `<div class="illus-exp-pill${i===0?' act':''}"><i class="fa-solid ${icon}"></i>${label}</div>`;
            }).join('')}
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- FEATURES -->
  <div class="help-section full-w">
    <div style="padding:0 24px;max-width:1100px;margin:0 auto;">
      <p class="section-eyebrow gsap-reveal">Funciones</p>
      <h2 class="section-title gsap-reveal">Todo lo que puedes hacer</h2>
      <p class="section-sub gsap-reveal">Cada funcion esta disenada para ahorrar tiempo a agencias y profesionales.</p>
    </div>

    <div class="bento-grid">

      <!-- Sidebar nav -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-sidebar"></i></div>
        <h3>Navegacion por secciones</h3>
        <p>El sidebar izquierdo organiza el formulario en 5 secciones: Datos, Trabajo, Direccion, Marca y Redes. Un punto verde indica que la seccion tiene contenido.</p>
        <div class="illus-sidebar" style="margin-top:14px;">
          <div class="illus-nav">
            ${['fa-user','fa-briefcase','fa-location-dot','fa-palette','fa-hashtag'].map((ic,i) =>
              `<div class="illus-nav-item${i===0?' act':''}"><i class="fa-solid ${ic}"></i></div>`
            ).join('')}
          </div>
          <div class="illus-form-mini">
            <div class="illus-mini-field f"></div>
            <div class="illus-mini-field"></div>
            <div class="illus-mini-field f"></div>
          </div>
        </div>
      </div>

      <!-- Real-time preview -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-eye"></i></div>
        <h3>Vista previa en tiempo real</h3>
        <p>La tarjeta de contacto se actualiza instantaneamente mientras escribes. No necesitas hacer clic en nada para ver el resultado.</p>
        <div class="illus-card" style="margin-top:14px;">
          <div class="illus-avatar"></div>
          <div class="illus-name-bar"></div>
          <div class="illus-sub-bar"></div>
          <div class="illus-row"><i class="fa-solid fa-phone"></i><div class="illus-row-bar"></div></div>
          <div class="illus-row"><i class="fa-solid fa-envelope"></i><div class="illus-row-bar" style="width:65%;"></div></div>
        </div>
      </div>

      <!-- Logo + color brand -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-palette"></i></div>
        <h3>Marca del cliente</h3>
        <p>Sube el logo de tu cliente y elige su color de marca. El logo aparece centrado en el QR y el color tiñe la vista previa y el borde del codigo.</p>
        <div style="margin-top:14px;display:flex;gap:6px;flex-wrap:wrap;">
          ${['#ea1585','#06b2e3','#45e0a8','#ccf32e','#f59e0b','#8b5cf6'].map(c =>
            `<div style="width:22px;height:22px;background:${c};border-radius:50%;border:2px solid var(--bg-s);box-shadow:0 0 0 1px var(--br-s);"></div>`
          ).join('')}
          <span style="font-size:.67rem;color:var(--t2);align-self:center;margin-left:4px;">+ color personalizado</span>
        </div>
      </div>

      <!-- Social grid wide -->
      <div class="bento-card wide gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-hashtag"></i></div>
        <h3>Redes sociales</h3>
        <p>Selecciona cualquier red del grid y agrega tu URL. Aparece en la vista previa y se incluye en la vCard con metadatos de red social estandar (X-SOCIALPROFILE).</p>
        <div class="illus-social-grid" style="margin-top:14px;">
          ${[['fa-instagram','#E1306C'],['fa-facebook-f','#1877F2'],['fa-x-twitter','#111'],['fa-linkedin-in','#0A66C2'],['fa-youtube','#FF0000'],['fa-tiktok','#010101'],['fa-github','#333'],['fa-whatsapp','#25D366'],['fa-spotify','#1DB954'],['fa-twitch','#9146FF']].map(([ic, bg]) =>
            `<div class="illus-soc" style="background:${bg}"><i class="fa-brands ${ic}"></i></div>`
          ).join('')}
        </div>
      </div>

      <!-- Social QR mode -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-qrcode"></i></div>
        <h3>Modo Perfil Social QR</h3>
        <p>Genera un QR que lleva directo a cualquier red social o URL. Selecciona la red, escribe tu username y el QR se actualiza automaticamente.</p>
        <div class="illus-form" style="margin-top:14px;">
          <div class="illus-field filled" style="height:22px;">
            <span style="position:absolute;left:7px;top:50%;transform:translateY(-50%);font-size:.62rem;color:var(--t2);">instagram.com/</span>
            <span style="position:absolute;left:90px;top:50%;transform:translateY(-50%);font-size:.65rem;color:var(--t1);">emd_publicidad</span>
          </div>
        </div>
      </div>

      <!-- WhatsApp Chat -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon" style="background:rgba(37,211,102,.1);color:#25D366;"><i class="fa-brands fa-whatsapp"></i></div>
        <h3>WhatsApp Chat directo</h3>
        <p>Genera QR que abre un chat de WhatsApp con nombre, numero y mensaje predefinido. Ideal para campanas de marketing.</p>
        <div style="margin-top:14px;background:rgba(37,211,102,.08);border:1px solid #25D36640;border-radius:var(--r-sm);padding:8px;font-size:.7rem;color:#25D366;">
          <i class="fa-brands fa-whatsapp"></i> wa.me/528670001234?text=Hola%2C+me+gustaria...
        </div>
      </div>

      <!-- Library -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-address-book"></i></div>
        <h3>Libreria de tarjetas</h3>
        <p>Guarda tarjetas para todos tus clientes. Edita, duplica, elimina o descarga un ZIP con QR + vCard de todas las tarjetas.</p>
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:5px;">
          ${[['JE','Josue Eguia','Director · EMD'],['MG','Maria Garcia','CEO · Empresa'],['RL','Roberto L.','Marketing']].map((c,i) =>
            `<div style="display:flex;align-items:center;gap:8px;background:var(--bg-e);border:1px solid var(--br);border-radius:var(--r-sm);padding:6px 9px;animation:slideIn .3s ${i*.1}s both;">
              <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#ea1585,#c0106e);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700;flex-shrink:0;">${c[0]}</div>
              <div style="flex:1;overflow:hidden;"><div style="font-size:.74rem;font-weight:600;color:var(--t1);">${c[1]}</div><div style="font-size:.62rem;color:var(--t2);">${c[2]}</div></div>
            </div>`
          ).join('')}
        </div>
      </div>

      <!-- Batch CSV -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-file-csv"></i></div>
        <h3>Importacion por lote (CSV)</h3>
        <p>Sube un archivo CSV con hasta cientos de empleados. Se crean todas las tarjetas de una vez con el logo y color de marca configurados.</p>
        <div style="margin-top:14px;">
          <div class="illus-csv">
            <div class="illus-csv-row">
              <div class="illus-csv-cell h">Nombre</div>
              <div class="illus-csv-cell h">Empresa</div>
              <div class="illus-csv-cell h">Tel</div>
            </div>
            <div class="illus-csv-row">
              <div class="illus-csv-cell">Josue</div>
              <div class="illus-csv-cell">EMD</div>
              <div class="illus-csv-cell">867...</div>
            </div>
            <div class="illus-csv-row">
              <div class="illus-csv-cell">Maria</div>
              <div class="illus-csv-cell">Corp</div>
              <div class="illus-csv-cell">868...</div>
            </div>
          </div>
          <div class="illus-csv-arrow"><i class="fa-solid fa-arrow-right"></i> <span style="font-size:.65rem;color:var(--t2);">N tarjetas creadas</span></div>
        </div>
      </div>

      <!-- Export -->
      <div class="bento-card gsap-reveal-scale">
        <div class="bento-icon"><i class="fa-solid fa-download"></i></div>
        <h3>Multiples formatos de exportacion</h3>
        <p>Descarga en el formato que necesitas. VCF para contactos, PDF para imprimir, HTML para compartir como link o CSV para importar en Excel.</p>
        <div class="illus-exports" style="margin-top:14px;gap:6px;">
          ${[['fa-file-csv','VCF','iPhone / Android'],['fa-file-pdf','PDF','85×55mm print'],['fa-globe','HTML','Link web'],['fa-table','CSV','Excel / Sheets']].map(([ic,lbl,desc],i) =>
            `<div class="illus-exp-pill${i===0?' act':''}"><i class="fa-solid ${ic}"></i><div><div style="font-weight:700;">${lbl}</div><div style="font-size:.57rem;opacity:.7;">${desc}</div></div></div>`
          ).join('')}
        </div>
      </div>

    </div>

    <!-- Tips strip -->
    <div class="tips-strip" style="margin-top:28px;">
      ${[
        ['fa-lightbulb','El formato VCF es compatible con iPhone, Android, Outlook y Gmail.'],
        ['fa-sparkles','El logo en el QR se recorta en cuadrado con fondo blanco automaticamente.'],
        ['fa-arrows-rotate','La vista previa se sincroniza con el formulario sin recargar.'],
        ['fa-floppy-disk','Las tarjetas se guardan en el navegador (localStorage). No necesitas cuenta.'],
        ['fa-file-zipper','El ZIP incluye el .vcf y el .png del QR de cada tarjeta en la libreria.'],
        ['fa-moon','El tema oscuro / claro detecta la preferencia de tu sistema operativo.'],
      ].map(([ic, txt]) =>
        `<div class="tip-pill"><i class="fa-solid ${ic}"></i><span>${txt}</span></div>`
      ).join('')}
    </div>
  </div>

  <!-- KEYBOARD SHORTCUTS -->
  <div class="help-section">
    <p class="section-eyebrow gsap-reveal">Productividad</p>
    <h2 class="section-title gsap-reveal">Atajos de teclado</h2>
    <p class="section-sub gsap-reveal">Trabaja mas rapido sin tocar el raton. Todos los atajos usan <kbd style="font-family:var(--mono);font-size:.7rem;background:var(--bg-e);border:1px solid var(--br-s);border-radius:3px;padding:1px 5px;">Cmd</kbd> en Mac y <kbd style="font-family:var(--mono);font-size:.7rem;background:var(--bg-e);border:1px solid var(--br-s);border-radius:3px;padding:1px 5px;">Ctrl</kbd> en Windows.</p>

    <div class="shortcuts-grid">
      ${[
        ['Abrir paleta de comandos', ['⌘','K'], true],
        ['Guardar tarjeta',          ['⌘','S'], false],
        ['Nueva tarjeta',            ['⌘','N'], false],
        ['Generar codigo QR',        ['⌘','↵'], true],
        ['Abrir libreria',           ['⌘','L'], false],
        ['Abrir exportacion',        ['⌘','E'], false],
        ['Cambiar tema',             ['⌘','D'], false],
        ['Seccion siguiente',        ['⌘','→'], false],
        ['Seccion anterior',         ['⌘','←'], false],
        ['Cerrar modales / ayuda',   ['Esc'],    false],
      ].map(([label, keys, hl]) =>
        `<div class="shortcut-row${hl ? ' highlight' : ''}">
          <span class="shortcut-label">${label}</span>
          <div class="shortcut-keys">${keys.map(k => `<kbd>${k}</kbd>`).join('')}</div>
        </div>`
      ).join('')}
    </div>

    <!-- Animated key illustration -->
    <div style="margin-top:28px;display:flex;gap:6px;align-items:center;">
      <div class="illus-keys">
        <div class="illus-key">⌘</div>
        <div class="illus-key">K</div>
      </div>
      <span style="font-size:.78rem;color:var(--t2);margin-left:6px;">Abre la paleta de comandos con busqueda rapida de cualquier funcion</span>
    </div>
  </div>

  <!-- CMD PALETTE -->
  <div class="help-section">
    <p class="section-eyebrow gsap-reveal">Paleta de comandos</p>
    <h2 class="section-title gsap-reveal">Accede a todo con &#8984;K</h2>
    <p class="section-sub gsap-reveal">Escribe cualquier accion para filtrarla instantaneamente. Navega con las flechas del teclado y ejecuta con Enter.</p>

    <!-- Mini cmd palette mockup -->
    <div class="gsap-reveal-scale" style="max-width:460px;background:var(--bg-e);border:1px solid var(--br-s);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh);">
      <div style="display:flex;align-items:center;gap:9px;padding:12px 14px;border-bottom:1px solid var(--br);">
        <i class="fa-solid fa-magnifying-glass" style="color:var(--t2);font-size:.84rem;"></i>
        <span style="font-size:.86rem;color:var(--t2);">Buscar acciones...</span>
      </div>
      <div style="padding:5px;">
        ${[
          ['fa-plus','Nueva Tarjeta','⌘N',true],
          ['fa-floppy-disk','Guardar Tarjeta','⌘S',false],
          ['fa-qrcode','Generar QR','⌘↵',false],
          ['fa-address-book','Mis Tarjetas','⌘L',false],
          ['fa-download','Exportar','⌘E',false],
        ].map(([ic,lbl,sc,focused]) =>
          `<div style="display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:var(--r-sm);background:${focused?'var(--ac-bg)':'transparent'};">
            <div style="width:25px;height:25px;background:${focused?'rgba(234,21,133,.14)':'var(--bg-i)'};border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:.75rem;color:${focused?'var(--fuchsia)':'var(--t2)'};">
              <i class="fa-solid ${ic}"></i>
            </div>
            <span style="flex:1;font-size:.79rem;font-weight:500;color:var(--t1);">${lbl}</span>
            <kbd style="font-family:var(--mono);font-size:.59rem;background:var(--bg-i);border:1px solid var(--br-s);border-radius:3px;padding:1px 5px;color:var(--t2);">${sc}</kbd>
          </div>`
        ).join('')}
      </div>
    </div>
  </div>

  <!-- FINAL CTA -->
  <div class="help-cta-section">
    <p class="section-eyebrow gsap-reveal">Listo para empezar</p>
    <h2 class="gsap-reveal" style="font-size:clamp(1.5rem,3vw,2.2rem);font-weight:700;letter-spacing:-.04em;color:var(--t1);margin-bottom:12px;">Crea tu primera tarjeta ahora</h2>
    <p class="gsap-reveal" style="color:var(--t2);font-size:.9rem;margin-bottom:28px;">Todo lo que necesitas esta listo. El formulario, el QR y la exportacion en un solo lugar.</p>
    <div class="hero-cta gsap-reveal">
      <button class="btn-hero-primary" id="help-start-btn-2" onclick="document.getElementById('help-overlay').classList.remove('open')">
        <i class="fa-solid fa-arrow-right"></i> Ir a la aplicacion
      </button>
    </div>
    <div style="margin-top:48px;padding-top:24px;border-top:1px solid var(--br);font-size:.72rem;color:var(--t3);text-align:center;">
      UI/UX por <strong style="color:var(--t2);">Josue Eguia</strong> &middot; Nuevo Laredo, Tamaulipas &middot; EMD Publicidad
    </div>
  </div>

</div><!-- /.help-scroll -->
`;
}

// Mini QR dot pattern (decorative, not real QR)
function qrDotsHTML() {
  const pattern = [
    1,1,1,0,1,
    1,0,1,1,0,
    1,1,1,0,1,
    0,1,0,1,1,
    1,0,1,1,1,
  ];
  return pattern.map(d => `<div class="qr-dot${d?'':' w'}"></div>`).join('');
}
