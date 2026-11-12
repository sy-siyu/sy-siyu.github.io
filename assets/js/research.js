(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const year = document.querySelector('[data-year]');

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  const closeNav = () => {
    nav?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    const label = toggle?.querySelector('.sr-only');
    if (label) label.textContent = 'Open navigation';
    document.body.classList.remove('nav-open');
  };

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.querySelector('.sr-only').textContent = open ? 'Open navigation' : 'Close navigation';
    nav?.classList.toggle('is-open', !open);
    document.body.classList.toggle('nav-open', !open);
  });

  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
  document.addEventListener('keydown', (event) => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      closeNav();
      toggle.focus();
    }
    if (event.key === 'Tab') {
      const links = nav?.querySelectorAll('a');
      const firstLink = links?.[0];
      const lastLink = links?.[links.length - 1];
      if (event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault();
        toggle.focus();
      } else if (!event.shiftKey && document.activeElement === toggle) {
        event.preventDefault();
        firstLink?.focus();
      } else if (!event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        toggle.focus();
      } else if (event.shiftKey && document.activeElement === toggle) {
        event.preventDefault();
        lastLink?.focus();
      }
    }
  });
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) closeNav();
  });
  updateHeader();

  if (year) year.textContent = String(new Date().getFullYear());

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionToggle = document.querySelector('[data-motion-toggle]');
  const portrait = document.querySelector('.hero-portrait');
  const motionScenes = [...document.querySelectorAll('[data-motion-scene]')];
  const visibleScenes = new Set();
  let motionPaused = false;
  let pointerFrame = 0;
  let pointerPosition;

  try {
    motionPaused = localStorage.getItem('siyu-decorative-motion') === 'paused';
  } catch { /* Storage can be unavailable in privacy-restricted browsers. */ }

  const resetPointer = () => {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    portrait?.style.removeProperty('--portrait-x');
    portrait?.style.removeProperty('--portrait-y');
  };
  const canAnimate = () => !motionPaused && !motionPreference.matches && !document.hidden;
  const entranceSelector = '.hero-copy > *, .portrait-control, .harbour-scene, .reveal.is-visible, .portrait-leaf path';
  const finishEntrances = () => {
    document.querySelectorAll(entranceSelector).forEach((element) => element.classList.add('has-entered'));
  };
  // Completed arrivals never restart when a visitor resumes ambient motion.
  document.addEventListener('animationend', (event) => {
    if (['content-arrive', 'print-arrive', 'harbour-arrive', 'leaf-draw'].includes(event.animationName)
      && event.target.matches(entranceSelector)) event.target.classList.add('has-entered');
  });
  const updateMotion = () => {
    const enabled = canAnimate();
    if (motionPaused || motionPreference.matches) finishEntrances();
    document.documentElement.classList.toggle('motion-paused', motionPaused);
    document.documentElement.classList.toggle('motion-suspended', document.hidden);
    motionScenes.forEach((scene) => {
      scene.classList.toggle('is-motion-active', enabled && visibleScenes.has(scene));
    });
    if (motionToggle) {
      motionToggle.disabled = motionPreference.matches;
      motionToggle.setAttribute('aria-pressed', String(!motionPaused && !motionPreference.matches));
      motionToggle.title = motionPreference.matches
        ? 'Decorative motion is off to match your device preference'
        : `Click to ${motionPaused ? 'resume' : 'pause'} decorative motion`;
    }
    if (!enabled || !visibleScenes.has(portrait) || !finePointer.matches) resetPointer();
  };

  if ('IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleScenes.add(entry.target);
        else visibleScenes.delete(entry.target);
      });
      updateMotion();
    }, { threshold: 0, rootMargin: '-66px 0px 0px 0px' });
    motionScenes.forEach((scene) => sceneObserver.observe(scene));
  }
  // Without observation support, leave recurring decorative animation stopped.
  motionToggle?.addEventListener('click', () => {
    motionPaused = !motionPaused;
    try {
      localStorage.setItem('siyu-decorative-motion', motionPaused ? 'paused' : 'playing');
    } catch { /* The preference still works for the current page. */ }
    updateMotion();
  });
  motionPreference.addEventListener('change', updateMotion);
  finePointer.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  window.addEventListener('pagehide', resetPointer);
  window.addEventListener('resize', resetPointer);
  portrait?.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || !canAnimate() || !visibleScenes.has(portrait) || event.pointerType === 'touch') return;
    pointerPosition = { x: event.clientX, y: event.clientY };
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!canAnimate() || !visibleScenes.has(portrait) || !finePointer.matches) return;
      const bounds = portrait.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (pointerPosition.x - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointerPosition.y - bounds.top) / bounds.height * 2 - 1));
      portrait.style.setProperty('--portrait-x', `${(-y * 3).toFixed(2)}deg`);
      portrait.style.setProperty('--portrait-y', `${(x * 4).toFixed(2)}deg`);
    });
  });
  portrait?.addEventListener('pointerleave', resetPointer);
  portrait?.addEventListener('pointercancel', resetPointer);
  updateMotion();

  // Rough Notation 0.5.1 (MIT): a few hand-drawn editorial accents.
  // Content and its native underline remain readable if the library is unavailable.
  const setupAnnotations = () => {
    if (!window.RoughNotation?.annotate) return;
    const annotations = [];
    const draw = (element) => {
      const circle = element.dataset.noteMark === 'circle';
      const annotation = window.RoughNotation.annotate(element, {
        type: circle ? 'circle' : 'underline',
        color: circle ? '#b64630' : '#c56043',
        strokeWidth: circle ? 1.3 : 1.8,
        padding: circle ? [4, 9] : 1,
        iterations: 2,
        multiline: !circle,
        animationDuration: element.classList.contains('name-mark') ? 1050 : 650,
        animate: !motionPreference.matches && !motionPaused,
      });
      annotation.show();
      element.classList.add('has-ink-mark');
      annotations.push(annotation);
      const graphic = element.nextElementSibling;
      if (graphic?.classList.contains('rough-annotation')) {
        graphic.setAttribute('aria-hidden', 'true');
        graphic.setAttribute('focusable', 'false');
      }
    };
    const marks = document.querySelectorAll('[data-note-mark]');
    if ('IntersectionObserver' in window) {
      const inkObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          draw(entry.target);
          inkObserver.unobserve(entry.target);
        });
      }, { threshold: 0.1 });
      marks.forEach((element) => inkObserver.observe(element));
    } else {
      marks.forEach(draw);
    }
    motionPreference.addEventListener('change', (event) => {
      annotations.forEach((annotation) => {
        annotation.animate = !event.matches && !motionPaused;
        if (event.matches) annotation.show();
      });
    });
  };
  (document.fonts?.ready ?? Promise.resolve()).then(setupAnnotations);

  const reveals = document.querySelectorAll('.reveal:not(.is-visible)');
  let observer;
  const showAll = () => {
    observer?.disconnect();
    reveals.forEach((element) => element.classList.add('is-visible', 'has-entered'));
  };

  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (motionPaused || motionPreference.matches) entry.target.classList.add('has-entered');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px 32px 0px', threshold: 0.01 });

  reveals.forEach((element) => observer.observe(element));
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) showAll();
  });
})();
