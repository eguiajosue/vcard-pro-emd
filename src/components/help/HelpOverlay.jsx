import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApp } from '../../store/AppStore.jsx';
import { helpContent } from './helpContent.js';

gsap.registerPlugin(ScrollTrigger);

const SEEN_KEY = 'vcp_help_seen';

function setupAnimations(scroller) {
  const ST = ScrollTrigger;
  ST.defaults({ scroller });

  gsap.fromTo('.help-hero .hero-badge', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: .5, ease: 'back.out(1.4)' });
  gsap.fromTo('.help-hero h1', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .65, ease: 'power3.out', delay: .15 });
  gsap.fromTo('.help-hero p', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', delay: .3 });
  gsap.fromTo('.hero-cta', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out', delay: .45 });

  gsap.utils.toArray('.gsap-reveal').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 32 }, {
      opacity: 1, y: 0, duration: .65, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  gsap.utils.toArray('.gsap-reveal-left').forEach(el => {
    gsap.fromTo(el, { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: .6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  gsap.utils.toArray('.gsap-reveal-right').forEach(el => {
    gsap.fromTo(el, { opacity: 0, x: 28 }, { opacity: 1, x: 0, duration: .6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  gsap.utils.toArray('.gsap-reveal-scale').forEach(el => {
    gsap.fromTo(el, { opacity: 0, scale: .88 }, { opacity: 1, scale: 1, duration: .55, ease: 'back.out(1.4)', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  gsap.utils.toArray('[data-gsap-stagger]').forEach(parent => {
    const delay = parseFloat(parent.dataset.gsapDelay || 0);
    gsap.fromTo(parent.children, { opacity: 0, y: 22 }, {
      opacity: 1, y: 0, duration: .5, ease: 'power2.out',
      stagger: parseFloat(parent.dataset.gsapStagger || .08), delay,
      scrollTrigger: { trigger: parent, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.bento-grid').forEach(grid => {
    gsap.fromTo(grid.children, { opacity: 0, y: 28, scale: .96 }, {
      opacity: 1, y: 0, scale: 1, duration: .5, ease: 'power2.out', stagger: .07,
      scrollTrigger: { trigger: grid, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.shortcuts-grid').forEach(grid => {
    gsap.fromTo(grid.children, { opacity: 0, x: -14 }, {
      opacity: 1, x: 0, duration: .4, ease: 'power2.out', stagger: .05,
      scrollTrigger: { trigger: grid, start: 'top 85%' },
    });
  });

  const tips = document.querySelector('.tips-strip');
  if (tips) {
    gsap.fromTo(tips.children, { opacity: 0, scale: .88, y: 10 }, {
      opacity: 1, scale: 1, y: 0, duration: .4, stagger: .06, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: tips, start: 'top 88%' },
    });
  }

  gsap.to('.help-hero::before', {
    yPercent: 30, ease: 'none',
    scrollTrigger: { trigger: '.help-hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });

  ST.refresh();
}

function startIllustrationLoops(root, timers) {
  const navItems = root.querySelectorAll('.illus-nav-item');
  if (navItems.length) {
    let ni = 0;
    timers.push(setInterval(() => { navItems.forEach((el, i) => el.classList.toggle('act', i === ni)); ni = (ni + 1) % navItems.length; }, 900));
  }

  const expPills = root.querySelectorAll('.illus-exp-pill');
  if (expPills.length) {
    let ep = 0;
    timers.push(setInterval(() => { expPills.forEach((el, i) => el.classList.toggle('act', i === ep)); ep = (ep + 1) % expPills.length; }, 1100));
  }

  const keys = root.querySelectorAll('.illus-key');
  if (keys.length) {
    const keySeqs = [[0, 1], [2], [0, 1, 2]];
    let ks = 0;
    timers.push(setInterval(() => {
      keys.forEach(k => k.classList.remove('press'));
      keySeqs[ks % keySeqs.length].forEach(i => keys[i]?.classList.add('press'));
      ks++;
    }, 800));
  }

  root.querySelectorAll('.illus-field-text[data-text]').forEach(el => {
    const text = el.dataset.text;
    let i = 0;
    const type = () => {
      if (i <= text.length) { el.textContent = text.slice(0, i); i++; timers.push(setTimeout(type, 80)); }
      else { timers.push(setTimeout(() => { i = 0; type(); }, 2000)); }
    };
    timers.push(setTimeout(type, Math.random() * 800));
  });
}

export default function HelpOverlay() {
  const { helpOpen, setHelpOpen } = useApp();
  const rootRef = useRef(null);
  const html = useMemo(() => helpContent(), []);

  const close = () => setHelpOpen(false);

  useEffect(() => {
    if (!helpOpen) return;
    localStorage.setItem(SEEN_KEY, '1');
    const root = rootRef.current;
    const scroller = root.querySelector('#help-scroll-area');
    scroller.scrollTop = 0;

    const onProgress = () => {
      const bar = root.querySelector('#help-progress-bar');
      const pct = (scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight)) * 100;
      if (bar) bar.style.width = `${Math.min(pct, 100)}%`;
    };
    scroller.addEventListener('scroll', onProgress);

    const closeBtn = root.querySelector('#help-close-btn');
    const startBtn = root.querySelector('#help-start-btn');
    const startBtn2 = root.querySelector('#help-start-btn-2');
    const scrollBtn = root.querySelector('#help-scroll-btn');
    closeBtn?.addEventListener('click', close);
    startBtn?.addEventListener('click', close);
    startBtn2?.addEventListener('click', close);
    scrollBtn?.addEventListener('click', () => root.querySelector('#help-quickstart')?.scrollIntoView({ behavior: 'smooth' }));

    const onKeydown = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKeydown);

    setupAnimations(scroller);
    const timers = [];
    startIllustrationLoops(root, timers);

    return () => {
      scroller.removeEventListener('scroll', onProgress);
      document.removeEventListener('keydown', onKeydown);
      ScrollTrigger.getAll().forEach(t => t.kill());
      timers.forEach(t => { clearInterval(t); clearTimeout(t); });
    };
  }, [helpOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div id="help-overlay" className={`help-overlay${helpOpen ? ' open' : ''}`} ref={rootRef} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
