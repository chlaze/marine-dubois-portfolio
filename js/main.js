/* ==========================================================
   MARINE DUBOIS — Portfolio interactions
   ========================================================== */

(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- LENIS smooth scroll ---------- */
  let lenis;
  if (window.Lenis && !prefersReduced) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothTouch: false, touchMultiplier: 1.5 });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  }

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = $('[data-cursor]');
  const cursorLabel = $('[data-cursor-label]');
  const cursorState = { x: 0, y: 0, tx: 0, ty: 0 };

  if (cursor && !('ontouchstart' in window)) {
    window.addEventListener('mousemove', (e) => { cursorState.tx = e.clientX; cursorState.ty = e.clientY; });
    const tickCursor = () => {
      cursorState.x += (cursorState.tx - cursorState.x) * 0.18;
      cursorState.y += (cursorState.ty - cursorState.y) * 0.18;
      cursor.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0)`;
      requestAnimationFrame(tickCursor);
    };
    tickCursor();
    window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    window.addEventListener('mouseup',   () => cursor.classList.remove('is-down'));

    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest('[data-hover]');
      if (el) {
        cursor.classList.add('is-hover');
        cursorLabel.textContent = el.getAttribute('data-hover') || '';
      } else if (e.target.closest('a, button')) {
        cursor.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (!e.target.closest('a, button, [data-hover]')) {
        cursor.classList.remove('is-hover');
        cursorLabel.textContent = '';
      }
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!prefersReduced) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top  - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- LOADER ---------- */
  const loaderEl = $('[data-loader]');
  const loaderProgress = $('[data-loader-progress]');
  const loaderCount = $('[data-loader-count]');
  const loaderWords = $$('[data-loader-word]');

  const runLoader = () => new Promise((resolve) => {
    if (!loaderEl) return resolve();
    if (window.gsap) {
      gsap.set(loaderWords, { y: 80, opacity: 0 });
      gsap.to(loaderWords, { y: 0, opacity: 1, duration: .9, stagger: .12, ease: 'expo.out', delay: .15 });
    }
    let n = 0;
    const target = 100;
    const tick = () => {
      n += Math.random() * 5 + 2;
      if (n >= target) n = target;
      if (loaderProgress) loaderProgress.style.width = n + '%';
      if (loaderCount) loaderCount.textContent = String(Math.floor(n)).padStart(2, '0');
      if (n < target) {
        setTimeout(tick, 40 + Math.random() * 40);
      } else {
        setTimeout(() => {
          if (window.gsap) {
            gsap.to(loaderEl, {
              yPercent: -100, duration: 1.1, ease: 'expo.inOut',
              onComplete: () => {
                loaderEl.style.display = 'none';
                document.body.classList.remove('no-scroll');
                resolve();
              }
            });
          } else {
            loaderEl.style.display = 'none';
            document.body.classList.remove('no-scroll');
            resolve();
          }
        }, 400);
      }
    };
    tick();
  });

  /* ---------- HERO INTRO ---------- */
  const playHero = () => {
    if (!window.gsap) return;
    const words = $$('.display__word');
    // Hide via inline style only when GSAP confirmed ready, then animate in
    gsap.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: .1, ease: 'expo.out', delay: .15 });
    const fadeIn = ['.hero__meta--tl', '.hero__meta--tr', '.hero__sub', '.hero__actions', '.hero__portrait', '.hero__scroll', '.hero__daisy--1', '.hero__daisy--2'];
    fadeIn.forEach((sel, i) => {
      const el = $(sel);
      if (!el) return;
      gsap.from(el, { opacity: 0, y: 30, duration: 1.1, ease: 'expo.out', delay: .8 + i * .06 });
    });
    gsap.from('.hero__color', { scale: .4, opacity: 0, duration: 2, ease: 'expo.out', stagger: .15 });
    gsap.from('.nav > *', { y: -20, opacity: 0, duration: .8, stagger: .08, ease: 'expo.out', delay: 1.1 });
  };

  /* ---------- SCROLL REVEAL ---------- */
  const setupReveals = () => {
    // Word-by-word reveal (manifesto, etc)
    const wordTriggers = $$('[data-reveal-word]');
    if (wordTriggers.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
        });
      }, { threshold: 0.3 });
      wordTriggers.forEach(el => io.observe(el));
    }

    if (!window.gsap || !window.ScrollTrigger) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-revealed'); });
      }, { threshold: 0.15 });
      $$('[data-reveal]').forEach(el => io.observe(el));
      return;
    }
    $$('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  };

  /* ---------- PARALLAX ---------- */
  const setupParallax = () => {
    if (!window.gsap || !window.ScrollTrigger || prefersReduced) return;
    // Disable heavy parallax on mobile / small viewports — prevents overlap
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    $$('[data-parallax]').forEach((el) => {
      if (isMobile) return;
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      gsap.to(el, {
        y: () => -window.innerHeight * speed, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // Scattered daisies — independent Y + rotation parallax per element
    $$('[data-parallax-y]').forEach((el) => {
      const y = parseFloat(el.getAttribute('data-parallax-y')) || 0;
      const r = parseFloat(el.getAttribute('data-parallax-r')) || 0;
      // Snapshot the base rotation set inline by CSS so parallax adds to it
      const baseTransform = getComputedStyle(el).transform;
      const m = baseTransform && baseTransform !== 'none' ? baseTransform.match(/matrix\(([^)]+)\)/) : null;
      const baseRot = m ? Math.atan2(parseFloat(m[1].split(',')[1]), parseFloat(m[1].split(',')[0])) * 180 / Math.PI : 0;
      gsap.fromTo(el,
        { y: 0, rotate: baseRot },
        {
          y: y, rotate: baseRot + r, ease: 'none',
          scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
        }
      );
    });
  };

  /* ---------- INTERACTIVE DAISIES — click bounce + drag ---------- */
  const setupDaisies = () => {
    const daisies = $$('.daisy--scatter, .hero__daisy');
    daisies.forEach((d) => {
      // Click: bounce spin
      d.addEventListener('click', (e) => {
        if (!window.gsap) return;
        e.preventDefault(); e.stopPropagation();
        gsap.fromTo(d,
          { rotate: 0, scale: 1 },
          { rotate: 360, scale: 1.3, duration: .55, ease: 'back.out(1.7)',
            yoyo: true, repeat: 1 }
        );
      });

      // Simple drag with mouse — picks up and drops with elastic return
      let dragging = false, startX = 0, startY = 0, baseX = 0, baseY = 0;
      d.addEventListener('mousedown', (e) => {
        if (prefersReduced) return;
        dragging = true; startX = e.clientX; startY = e.clientY;
        const cs = getComputedStyle(d);
        const m = new DOMMatrixReadOnly(cs.transform);
        baseX = m.e; baseY = m.f;
        d.style.transition = 'none';
      });
      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        d.style.transform = `translate(${baseX + dx}px, ${baseY + dy}px) rotate(${dx * 0.3}deg)`;
      });
      window.addEventListener('mouseup', () => {
        if (!dragging) return;
        dragging = false;
        d.style.transition = '';
        if (window.gsap) {
          gsap.to(d, { x: 0, y: 0, rotate: 0, duration: 1, ease: 'elastic.out(1, .55)', clearProps: 'transform' });
        } else {
          d.style.transform = '';
        }
      });
    });
  };

  /* ---------- DISPLAY REVEAL ---------- */
  const setupDisplayReveals = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    $$('.display--sm, .h2').forEach((title) => {
      gsap.fromTo(title, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: title, start: 'top 85%', once: true }
      });
    });
  };

  /* ---------- CARDS STAGGER ---------- */
  const setupCardsReveal = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const grid = $('[data-work-grid]');
    if (!grid) return;
    const cards = $$('.card', grid);
    gsap.fromTo(cards, { opacity: 0, y: 80 }, {
      opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'expo.out',
      scrollTrigger: { trigger: grid, start: 'top 80%' }
    });
  };

  /* ---------- COUNTERS ---------- */
  const setupCounters = () => {
    const nums = $$('[data-count]');
    if (!nums.length) return;
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const dur = 1500;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toString();
        if (p < 1) requestAnimationFrame(tick); else el.textContent = String(target);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    nums.forEach(n => io.observe(n));
  };

  /* ---------- NAV SCROLL STATE ---------- */
  const setupNavScroll = () => {
    const nav = $('[data-nav]');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /* ---------- MOBILE MENU ---------- */
  const setupMobileMenu = () => {
    const burger = $('[data-burger]');
    const menu = $('[data-mobile-menu]');
    if (!burger || !menu) return;
    const close = () => {
      burger.classList.remove('is-open');
      menu.classList.remove('is-open');
      document.body.classList.remove('no-scroll');
      if (lenis) lenis.start();
    };
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('is-open');
      menu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
      if (lenis) isOpen ? lenis.stop() : lenis.start();
    });
    $$('a', menu).forEach(a => a.addEventListener('click', close));
  };

  /* ---------- ANCHOR LINKS ---------- */
  const setupAnchors = () => {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.5 });
        else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  /* ---------- WORK FILTERS ---------- */
  const setupFilters = () => {
    const buttons = $$('[data-filters] .filter');
    const grid = $('[data-work-grid]');
    if (!buttons.length || !grid) return;
    const cards = $$('.card', grid);
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        buttons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        cards.forEach((c) => {
          const cat = c.getAttribute('data-category');
          const show = filter === 'all' || cat === filter;
          if (window.gsap) {
            if (show) {
              c.classList.remove('is-hidden');
              gsap.fromTo(c, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out' });
            } else {
              gsap.to(c, { opacity: 0, y: 20, duration: .35, ease: 'power2.in', onComplete: () => c.classList.add('is-hidden') });
            }
          } else c.classList.toggle('is-hidden', !show);
        });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  };

  /* ---------- FORM ---------- */
  const setupForm = () => {
    const form = $('[data-form]');
    const note = $('[data-form-note]');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isEn = document.documentElement.getAttribute('data-lang') === 'en';
      const msg = isEn ? '✦ Thank you. Marine will reply within 48h.' : '✦ Merci. Marine vous répond sous 48h.';
      if (note) {
        note.textContent = msg;
        note.classList.add('is-visible');
        setTimeout(() => note.classList.remove('is-visible'), 5000);
      }
      form.reset();
    });
  };

  /* ---------- FOOTER CLOCK (Paris) ---------- */
  const setupClock = () => {
    const el = $('[data-clock]');
    if (!el) return;
    const tick = () => {
      const d = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Europe/Paris' };
      el.textContent = d.toLocaleTimeString('fr-FR', opts) + ' PAR';
    };
    tick();
    setInterval(tick, 1000);
  };

  /* ---------- MARQUEE SCROLL ---------- */
  const setupMarqueeScrollLink = () => {
    if (!window.gsap || !window.ScrollTrigger || prefersReduced) return;
    $$('.marquee__track').forEach((track) => {
      gsap.to(track, {
        x: '-15%', ease: 'none',
        scrollTrigger: { trigger: track, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  };

  /* ---------- LIGHTBOX ---------- */
  const setupLightbox = () => {
    const lb = $('[data-lightbox]');
    if (!lb) return;
    const lbImg     = $('[data-lightbox-img]', lb);
    const lbThumbs  = $('[data-lightbox-thumbs]', lb);
    const lbTitle   = $('[data-lightbox-title]', lb);
    const lbRole    = $('[data-lightbox-role]', lb);
    const lbYear    = $('[data-lightbox-year]', lb);
    const lbDesc    = $('[data-lightbox-desc]', lb);
    const lbClose   = $('[data-lightbox-close]', lb);
    const cards     = $$('.card[data-project]');

    const open = (card) => {
      const isEn = document.documentElement.getAttribute('data-lang') === 'en';
      const imgs = [
        card.dataset.img,
        card.dataset['img-2'],
        card.dataset['img-3'],
      ].filter(Boolean);

      const title = isEn && card.dataset.titleEn ? card.dataset.titleEn : card.dataset.title;
      const role  = isEn && card.dataset.roleEn  ? card.dataset.roleEn  : card.dataset.role;
      const desc  = isEn && card.dataset.descEn  ? card.dataset.descEn  : card.dataset.desc;

      lbTitle.textContent = title || '';
      lbRole.textContent  = role  || '';
      lbDesc.textContent  = desc  || '';
      lbYear.textContent  = card.dataset.year || '';

      // Pick up the project's accent color from the card and apply to lightbox
      const cardStyles = getComputedStyle(card);
      const accent  = cardStyles.getPropertyValue('--accent').trim() || '#FF5E1F';
      const accent2 = cardStyles.getPropertyValue('--accent-2').trim() || accent;
      lb.style.setProperty('--accent', accent);
      lb.style.setProperty('--accent-2', accent2);

      lbThumbs.innerHTML = '';
      if (imgs.length > 0) {
        lbImg.style.display = '';
        lbImg.src = imgs[0];
        lbImg.alt = title || '';
        if (imgs.length > 1) {
          imgs.forEach((src, i) => {
            const t = document.createElement('button');
            t.className = 'lightbox__thumb' + (i === 0 ? ' is-active' : '');
            const im = document.createElement('img');
            im.src = src;
            im.alt = '';
            t.appendChild(im);
            t.addEventListener('click', () => {
              lbImg.src = src;
              $$('.lightbox__thumb', lbThumbs).forEach(b => b.classList.remove('is-active'));
              t.classList.add('is-active');
            });
            lbThumbs.appendChild(t);
          });
        }
      } else {
        lbImg.style.display = 'none';
      }

      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      if (lenis) lenis.stop();
    };

    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (lenis) lenis.start();
    };

    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        // Allow click anywhere on card except links inside
        if (e.target.closest('a, button')) return;
        open(card);
      });
    });

    lbClose.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  };

  /* ---------- I18N EN/FR ---------- */
  const setupI18n = () => {
    const root = document.documentElement;
    const btns = $$('[data-lang-btn]');
    const STORE = 'mdLang';

    const apply = (lang) => {
      root.setAttribute('lang', lang);
      root.setAttribute('data-lang', lang);

      // textContent swaps
      $$('[data-en]').forEach((el) => {
        if (el.hasAttribute('data-en-html')) return; // skip — handled below
        if (!el.dataset.fr) el.dataset.fr = el.textContent;
        el.textContent = lang === 'en' ? el.dataset.en : el.dataset.fr;
      });

      // innerHTML swaps (with em, strong, br, etc)
      $$('[data-en-html]').forEach((el) => {
        if (!el.dataset.frHtml) el.dataset.frHtml = el.innerHTML;
        el.innerHTML = lang === 'en' ? el.dataset.enHtml : el.dataset.frHtml;
      });

      // placeholder swaps
      $$('[data-en-placeholder]').forEach((el) => {
        if (!el.dataset.frPlaceholder) el.dataset.frPlaceholder = el.getAttribute('placeholder') || '';
        el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPlaceholder : el.dataset.frPlaceholder);
      });

      // Toggle active state on lang buttons (both nav + mobile menu)
      btns.forEach((b) => {
        b.classList.toggle('is-active', b.getAttribute('data-lang-btn') === lang);
      });

      try { localStorage.setItem(STORE, lang); } catch {}
    };

    btns.forEach((b) => {
      b.addEventListener('click', () => apply(b.getAttribute('data-lang-btn')));
    });

    let initial = 'fr';
    try { initial = localStorage.getItem(STORE) || 'fr'; } catch {}
    apply(initial);
  };

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const setupScrollProgress = () => {
    const bar = $('[data-scroll-progress]');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    if (lenis) lenis.on('scroll', update);
    update();
  };

  /* ---------- BACK TO TOP ---------- */
  const setupBackToTop = () => {
    const btn = $('[data-back-to-top]');
    if (!btn) return;
    const toggle = () => {
      if (window.scrollY > window.innerHeight * 0.6) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    };
    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.6 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  };

  /* ---------- AUTO COPYRIGHT YEAR ---------- */
  const setupAutoYear = () => {
    const year = new Date().getFullYear();
    $$('.footer__brand').forEach((el) => {
      el.textContent = el.textContent.replace(/©\s*\d{4}/, `© ${year}`);
    });
  };

  /* ---------- INIT ---------- */
  const init = async () => {
    setupNavScroll();
    setupMobileMenu();
    setupAnchors();
    setupReveals();
    setupParallax();
    setupDisplayReveals();
    setupCardsReveal();
    setupCounters();
    setupFilters();
    setupForm();
    setupClock();
    setupMarqueeScrollLink();
    setupLightbox();
    setupI18n();
    setupDaisies();
    setupScrollProgress();
    setupBackToTop();
    setupAutoYear();

    // Safety net: even if GSAP / loader hang, free the page after 5s
    const safety = setTimeout(() => {
      document.body.classList.remove('no-scroll');
      const l = $('[data-loader]');
      if (l) l.style.display = 'none';
    }, 5000);

    try {
      await runLoader();
      document.body.classList.add('intro-played');
      playHero();
    } finally {
      clearTimeout(safety);
      document.body.classList.remove('no-scroll');
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
