(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static/.test(location.search);
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = !reduce && hasGsap;
  root.classList.toggle('motion', motion);

  /* ---------- Content ---------- */
  const posters = Array.from({ length: 25 }, (_, i) => `assets/web/posters/poster-${String(i + 1).padStart(2, '0')}.webp`);
  const posterBtn = (src, i, dup) =>
    `<button data-full="${src}" data-group="posters"${dup ? ' tabindex="-1" aria-hidden="true"' : ` aria-label="View poster ${i + 1} of ${posters.length}"`}><img src="${src}" alt="${dup ? '' : `Church social media poster ${i + 1}`}" loading="lazy"></button>`;
  const fillRail = (el, list, offset) => {
    const items = list.map((s, i) => posterBtn(s, i + offset, false)).join('');
    el.innerHTML = reduce ? items : items + list.map((s, i) => posterBtn(s, i + offset, true)).join('');
  };
  fillRail(document.getElementById('rail-a'), posters.slice(0, 13), 0);
  fillRail(document.getElementById('rail-b'), posters.slice(13), 13);

  const tools = [
    ['wix', 'Wix'], ['google-workspace', 'Google Workspace'], ['shopify', 'Shopify'], ['quickbooks', 'QuickBooks'],
    ['slack', 'Slack'], ['zoho', 'Zoho'], ['calendly', 'Calendly'], ['mailerlite', 'MailerLite'],
    ['capcut', 'CapCut'], ['filmora', 'Wondershare Filmora'], ['sermonshots', 'SermonShots'], ['buffer', 'Buffer'],
    ['sendible', 'Sendible'], ['facebook-business', 'Facebook Business Manager'], ['chatgpt', 'ChatGPT'], ['gemini', 'Gemini']
  ];
  const logo = ([f, n], dup) => `<li${dup ? ' aria-hidden="true"' : ''}><img class="tool--${f}" src="assets/web/tools/${f}.webp" alt="${dup ? '' : n}" loading="lazy"></li>`;
  document.getElementById('logos').innerHTML = tools.map(t => logo(t)).join('') + (reduce ? '' : tools.map(t => logo(t, true)).join(''));

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Nav ---------- */
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
    nav.classList.toggle('menu-open', open);
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  let lastY = 0;
  const onScroll = y => {
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > 600 && y > lastY && !links.classList.contains('is-open'));
    lastY = y;
    const darkUnder = [...document.querySelectorAll('.dark, .stats, .footer')].some(s => { const r = s.getBoundingClientRect(); return r.top <= 40 && r.bottom >= 40; });
    nav.classList.toggle('nav--dark', darkUnder);
    const mid = y + innerHeight * 0.4;
    links.querySelectorAll('a[href^="#"]').forEach(a => {
      const s = document.querySelector(a.getAttribute('href'));
      a.classList.toggle('is-active', !!s && s.offsetTop <= mid && s.offsetTop + s.offsetHeight > mid);
    });
  };

  /* ---------- Anchor links ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#home' || id === '#top' ? 0 : document.querySelector(id);
    if (target === null) return;
    e.preventDefault();
    setMenu(false);
    const behavior = reduce ? 'auto' : 'smooth';
    if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.4 });
    else if (target === 0) window.scrollTo({ top: 0, behavior });
    else target.scrollIntoView({ behavior });
  });

  /* ---------- Videos play only while visible ---------- */
  const vio = new IntersectionObserver(entries => entries.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting && !reduce) {
      if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
      v.play().catch(() => {});
    } else if (!v.paused) v.pause();
  }), { threshold: 0.3 });
  document.querySelectorAll('video[data-autoplay]').forEach(v => vio.observe(v));

  document.querySelectorAll('.sound').forEach(btn => btn.addEventListener('click', () => {
    const v = btn.parentElement.querySelector('video');
    const turnOn = v.muted;
    document.querySelectorAll('.sound').forEach(b => {
      b.parentElement.querySelector('video').muted = true;
      b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Turn sound on');
    });
    if (turnOn) { v.muted = false; v.play().catch(() => {}); btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Turn sound off'); }
  }));

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    const state = b.querySelector('.copy__state');
    try { await navigator.clipboard.writeText(b.dataset.copy); state.textContent = 'Copied ✓'; }
    catch { state.textContent = 'Select & copy'; }
    setTimeout(() => (state.textContent = 'Copy'), 2200);
  }));

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  let group = [], idx = 0;
  const show = i => { idx = (i + group.length) % group.length; lbImg.src = group[idx].dataset.full; lbImg.alt = group[idx].querySelector('img')?.alt || ''; };
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-full]');
    if (!t) return;
    const g = t.dataset.group;
    group = g ? [...document.querySelectorAll(`[data-group="${g}"]:not([aria-hidden])`)] : [t];
    const base = t.getAttribute('aria-hidden') ? group.find(x => x.dataset.full === t.dataset.full) : t;
    lb.toggleAttribute('data-single', group.length < 2);
    show(Math.max(0, group.indexOf(base)));
    lb.showModal(); window.__lenis?.stop();
  });
  lb.addEventListener('close', () => window.__lenis?.start());
  lb.querySelector('.lightbox__close').addEventListener('click', () => lb.close());
  lb.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lightbox__nav--next').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });

  /* ---------- Service card spotlight ---------- */
  document.querySelectorAll('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--x', `${e.clientX - r.left}px`); c.style.setProperty('--y', `${e.clientY - r.top}px`);
  }));

  /* ---------- No-motion path ---------- */
  if (!motion) {
    window.addEventListener('scroll', () => onScroll(scrollY), { passive: true });
    onScroll(scrollY);
    return;
  }

  /* ================= MOTION ================= */
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.__lenis = lenis;
    lenis.on('scroll', ({ scroll }) => { ScrollTrigger.update(); onScroll(scroll); });
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  }

  // Split headings into masked words
  document.querySelectorAll('[data-split]').forEach(el => {
    const walk = node => [...node.childNodes].map(n => {
      if (n.nodeType === 3) return n.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : w ? `<span class="split-line" style="display:inline-block"><span class="split-word">${w}</span></span>` : '').join('');
      const inner = walk(n);
      return `<${n.tagName.toLowerCase()}>${inner}</${n.tagName.toLowerCase()}>`;
    }).join('');
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = walk(el);
    el.querySelectorAll('.split-line').forEach(s => s.setAttribute('aria-hidden', 'true'));
  });

  // Intro curtain → hero
  const curtain = document.querySelector('.curtain');
  const heroWords = document.querySelectorAll('.hero__title .split-word');
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set('.arch', { clipPath: 'inset(100% 0 0 0 round 999px 999px 28px 28px)' });
  gsap.set('.chip, .hero__sign', { opacity: 0, y: 20 });
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .to('.curtain__sign', { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power2.inOut' })
    .to('.curtain__line', { scaleX: 1, duration: .9, ease: 'power2.inOut' }, '<.1')
    .to(curtain, { yPercent: -100, duration: 1, ease: 'power4.inOut' }, '+=.15')
    .set(curtain, { display: 'none' })
    .from('.nav__brand, .nav__toggle, .nav__links li', { y: -20, opacity: 0, duration: .8, stagger: .06, clearProps: 'transform,opacity' }, '-=.55')
    .to(heroWords, { yPercent: 0, duration: 1.1, stagger: .05, ease: 'power4.out' }, '-=.7')
    .to('[data-hero]', { opacity: 1, y: 0, duration: .9, stagger: .1 }, '-=.8')
    .fromTo('[data-hero]', { y: 24 }, { y: 0, duration: .9, stagger: .1 }, '<')
    .to('.arch', { clipPath: 'inset(0% 0 0 0 round 999px 999px 28px 28px)', duration: 1.3, ease: 'power4.inOut' }, '-=1.3')
    .from('.arch img', { scale: 1.15, duration: 1.6, ease: 'power3.out' }, '<.2')
    .to('.chip, .hero__sign', { opacity: 1, y: 0, duration: .8, stagger: .12 }, '-=.8');
  curtain.addEventListener('click', () => intro.progress(1));

  // Floating chips
  gsap.utils.toArray('[data-float]').forEach((c, i) => gsap.to(c, { y: i % 2 ? 10 : -10, duration: 2.6 + i * .4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.5 }));
  // Hero parallax
  gsap.to('.arch', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__glow', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Split headings below the fold
  document.querySelectorAll('[data-split]:not(.hero__title)').forEach(h => {
    gsap.from(h.querySelectorAll('.split-word'), { yPercent: 110, duration: 1.1, stagger: .045, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });

  // Generic reveals
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: els => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .09, overwrite: true })
  });

  // Stat counters
  document.querySelectorAll('[data-count]').forEach(b => {
    const end = +b.dataset.count, dec = +(b.dataset.decimals || 0), suf = b.dataset.suffix || '';
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 90%' }, onUpdate: () => (b.textContent = o.v.toFixed(dec) + suf) });
  });

  // Process line
  const steps = document.querySelector('.steps');
  ScrollTrigger.create({ trigger: steps, start: 'top 70%', end: 'bottom 60%', scrub: true, onUpdate: s => steps.style.setProperty('--progress', s.progress.toFixed(3)) });

  // About photo parallax
  gsap.fromTo('.about__photo img', { yPercent: 6 }, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });

  // Horizontal work reel (desktop only)
  ScrollTrigger.matchMedia({
    '(min-width: 1024px)': () => {
      const track = document.querySelector('.work__track');
      const dist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.work__pin', pin: true, scrub: 1, start: 'top top', end: () => '+=' + dist(), invalidateOnRefresh: true,
          onUpdate: s => gsap.set('.work__progress span', { scaleX: s.progress })
        }
      });
      gsap.utils.toArray('.panel:not(.panel--intro)').forEach(p => {
        gsap.from(p.querySelectorAll('.panel__meta, .phone, .laptop, .shot'), {
          y: 60, opacity: 0, stagger: .08, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 85%' }
        });
      });
    }
  });

  // Magnetic buttons
  if (matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: .6, ease: 'power3' });
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .25); yTo((e.clientY - r.top - r.height / 2) * .35); });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  // Contact
  gsap.from('.contact__photo', { yPercent: 18, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.contact', start: 'top 70%' } });
  gsap.to('.contact__sun', { scale: 1.25, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
