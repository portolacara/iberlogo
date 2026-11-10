/* Iberlogo — interacciones propias (torres, transiciones de página, año y contacto) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Torres: hotspots + acordeón ---- */
  var root = $('[data-towers]');
  if (root) {
    var stage = $('.tstage', root), items = $$('.tw', root), spots = $$('.hs', root), cap = $('[data-tower-cap]', root);
    var caps = {
      academia: ['Torre I · Academia', 'Tower I · Academy'],
      traduccion: ['Torre II · Traducción', 'Tower II · Translation'],
      espanol: ['Torre III · Español online', 'Tower III · Online Spanish'],
      contacto: ['Torre IV · Contacto', 'Tower IV · Contact']
    };
    var current = null;
    function setCap(id) {
      if (!cap) return;
      var en = document.documentElement.lang === 'en';
      cap.textContent = id && caps[id] ? caps[id][en ? 1 : 0] : (en ? 'Choose a tower' : 'Elige una torre');
    }
    function open(id) {
      current = id;
      items.forEach(function (it) {
        var on = it.getAttribute('data-tower') === id;
        it.classList.toggle('is-open', on);
        var button = $('.tw__btn', it);
        if (button) button.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      spots.forEach(function (spot) {
        var on = spot.getAttribute('data-for') === id;
        spot.classList.toggle('is-active', on);
        spot.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (stage) stage.setAttribute('data-active', id || '');
      setCap(id);
    }
    items.forEach(function (it) {
      var id = it.getAttribute('data-tower');
      var button = $('.tw__btn', it);
      if (button) button.addEventListener('click', function () { open(current === id ? null : id); });
    });
    spots.forEach(function (spot, i) {
      var id = spot.getAttribute('data-for');
      spot.addEventListener('click', function () {
        open(id);
        if (window.matchMedia('(max-width:959px)').matches) {
          var item = items[i];
          if (item) item.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        }
      });
      spot.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = spots[(i + 1) % spots.length];
        else if (e.key === 'ArrowLeft') next = spots[(i - 1 + spots.length) % spots.length];
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
    document.addEventListener('ib:lang', function () { setCap(current); });
    open('academia');
  }

  /* ---- Contacto: sustituye el formulario por un enlace directo a WhatsApp ---- */
  var contactForm = $('form[data-demo-form]');
  if (contactForm && $('#c-msg', contactForm) && $('#c-mail', contactForm)) {
    var contactPanel = contactForm.parentElement;
    contactPanel.innerHTML = '<p class="muted" data-en="Send us a message on WhatsApp and we will get back to you as soon as possible.">Escríbenos por WhatsApp y te responderemos lo antes posible.</p>' +
      '<a class="btn btn--yellow" href="https://wa.me/34678292709?text=Hola%20Iberlogo%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n." target="_blank" rel="noopener" aria-label="Contactar con Iberlogo por WhatsApp (se abre en una pestaña nueva)" data-en-aria-label="Contact Iberlogo on WhatsApp (opens in a new tab)">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.34.15 11.92c0 2.1.55 4.15 1.6 5.96L.05 24l6.27-1.64a11.9 11.9 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.49-8.43ZM12.09 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.43-9.88 9.88-9.88a9.8 9.8 0 0 1 6.99 2.9 9.8 9.8 0 0 1 2.89 6.99c0 5.45-4.43 9.87-9.89 9.87Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>' +
      '<span data-en="Contact us on WhatsApp">Contactar por WhatsApp</span><span class="ar" aria-hidden="true">→</span></a>';
  }

  /* ---- Transición de salida (fallback si no hay View Transitions entre documentos) ---- */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var crossVT = window.CSS && CSS.supports && CSS.supports('selector(:target-text)') && 'startViewTransition' in document && 'onpagereveal' in window;
  if (!crossVT && !reduce) {
    $$('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^(mailto:|tel:|https?:)/.test(h) || a.target === '_blank') return;
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        document.body.classList.add('is-leaving');
        setTimeout(function () { location.href = a.href; }, 240);
      });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('is-leaving'); });
  }

  /* ---- Año ---- */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
