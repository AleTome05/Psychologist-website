// Chiara Sergenti — interazioni del sito (vanilla JS, nessuna dipendenza)
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Header: stato "compatto" dopo lo scroll ---------------------------
  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Menu mobile -------------------------------------------------------
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const toggleLabel = toggle?.querySelector('[data-menu-label]');

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Chiudi il menu' : 'Apri il menu';
    document.body.classList.toggle('is-locked', open);
    // Con il menu aperto il resto della pagina non è raggiungibile da tastiera
    document.querySelectorAll('main, footer, .wa-float').forEach((el) => { el.inert = open; });
    if (open) menu.querySelector('a')?.focus({ preventScroll: true });
  }

  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width: 1040px)').addEventListener('change', (e) => e.matches && setMenu(false));

  // Focus trap: Tab cicla tra toggle e link del menu
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !menu?.classList.contains('is-open')) return;
    const items = [toggle, ...menu.querySelectorAll('a, button')];
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // --- Dropdown "Servizi" (hover su desktop, click e tastiera ovunque) ----
  document.querySelectorAll('[data-dropdown]').forEach((item) => {
    const button = item.querySelector('.dropdown-toggle');
    let closeTimer;
    const set = (open) => {
      item.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    };
    // Se il menu è già aperto per hover, il click lo mantiene aperto invece di richiuderlo
    button.addEventListener('click', () => set(item.matches(':hover') || !item.classList.contains('is-open')));
    item.addEventListener('mouseenter', () => { clearTimeout(closeTimer); set(true); });
    item.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => set(false), 180); });
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) set(false); });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && item.classList.contains('is-open')) { set(false); button.focus(); }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  // --- Reveal allo scroll -------------------------------------------------
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target); // anima una volta sola
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  }

  // --- WhatsApp flottante: compare dopo l'hero, si nasconde sul footer ---
  const waFloat = document.querySelector('[data-wa-float]');
  const footer = document.querySelector('.site-footer');
  if (waFloat && footer && 'IntersectionObserver' in window) {
    let footerVisible = false;
    const update = () => waFloat.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6 && !footerVisible);
    new IntersectionObserver(([entry]) => { footerVisible = entry.isIntersecting; update(); }).observe(footer);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // --- Modulo contatti: compone una mail precompilata ---------------------
  const form = document.querySelector('[data-contact-form]');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = form.querySelector('[data-form-status]');
    const firstInvalid = [...form.elements].find((el) => el.willValidate && !el.checkValidity());
    if (firstInvalid) {
      status.textContent = firstInvalid.type === 'checkbox'
        ? 'Per proseguire conferma di aver letto l’informativa privacy.'
        : 'Compila i campi obbligatori: nome e messaggio.';
      firstInvalid.focus();
      return;
    }
    const data = new FormData(form);
    const subject = `Richiesta dal sito: ${data.get('argomento')}`;
    const body = [
      data.get('messaggio'),
      '',
      `${data.get('nome')}`,
      data.get('telefono') ? `Tel. ${data.get('telefono')}` : '',
    ].join('\n').trim();
    const to = form.getAttribute('action').replace('mailto:', '');
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Si sta aprendo il tuo programma di posta. Se non succede nulla, scrivimi direttamente all’indirizzo email indicato.';
  });

  // --- Anno corrente nel footer -------------------------------------------
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
