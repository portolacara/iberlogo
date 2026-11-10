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

  /* ---- Contacto con Turnstile + mailto (estática + Cloudflare) ---- */
  function injectTurnstileScript() {
    if (document.querySelector('script[data-turnstile]')) return;
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-turnstile', 'true');
    document.head.appendChild(script);
  }

  function injectTurnstileStyles() {
    if (document.getElementById('ib-turnstile-styles')) return;
    var style = document.createElement('style');
    style.id = 'ib-turnstile-styles';
    style.textContent = '.cf-turnstile{display:flex;justify-content:flex-start;margin-top:.5rem}.cf-turnstile iframe{max-width:100%}';
    document.head.appendChild(style);
  }

  function renderTurnstile() {
    if (!window.turnstile) {
      setTimeout(renderTurnstile, 250);
      return;
    }
    var widget = document.querySelector('.cf-turnstile');
    if (!widget) return;
    if (widget.querySelector('iframe')) return;
    window.turnstile.render(widget, {
      sitekey: '1x00000000000000000000AA',
      theme: 'light'
    });
  }

  var contactForm = $('form[data-demo-form]');
  if (contactForm) {
    injectTurnstileStyles();
    injectTurnstileScript();

    var turnstileWrap = contactForm.querySelector('.cf-turnstile');
    if (!turnstileWrap) {
      turnstileWrap = document.createElement('div');
      turnstileWrap.className = 'cf-turnstile';
      contactForm.appendChild(turnstileWrap);
    }

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = (contactForm.querySelector('[name="name"]') || {}).value || '';
      var email = (contactForm.querySelector('[name="email"]') || {}).value || '';
      var tel = (contactForm.querySelector('[name="tel"]') || {}).value || '';
      var subject = (contactForm.querySelector('[name="subject"]') || {}).value || '';
      var message = (contactForm.querySelector('[name="msg"]') || contactForm.querySelector('[name="message"]') || {}).value || '';
      var topic = (contactForm.querySelector('input[name="topic"]:checked') || {}).value || 'general';

      name = name.trim();
      email = email.trim();
      tel = tel.trim();
      subject = subject.trim();
      message = message.trim();

      if (!name || !email || !subject || !message) {
        alert('Completa nombre, email, asunto y mensaje antes de enviar.');
        return;
      }

      var widget = document.querySelector('.cf-turnstile');
      var turnstileResponse = widget && window.turnstile ? window.turnstile.getResponse(widget) : null;
      if (!turnstileResponse) {
        alert('Completa la verificación anti-spam de Cloudflare antes de enviar.');
        return;
      }

      var body = [
        'Nombre: ' + name,
        'Email: ' + email,
        'Teléfono: ' + (tel || 'No indicado'),
        'Tema: ' + topic,
        'Asunto: ' + subject,
        '',
        'Mensaje:',
        message
      ].join('\n');

      var mailto = 'mailto:info@iberlogo.com?subject=' + encodeURIComponent('Consulta web - ' + subject) + '&body=' + encodeURIComponent(body);
      window.location.href = mailto;

      var success = contactForm.parentElement.querySelector('[data-success]');
      if (success) success.hidden = false;
      var hide = contactForm.querySelector('[data-hide-on-sent]');
      if (hide) hide.hidden = true;
    });

    renderTurnstile();
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
