/* Iberlogo D1 — interacciones propias (torres, transiciones de página, año) */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Torres: hotspots + acordeón ---- */
  var root = $('[data-towers]');
  if (root) {
    var stage = $('.tstage', root), items = $$('.tw', root), spots = $$('.hs', root), cap = $('[data-tower-cap]', root);
    var caps = { academia: ['Torre I · Academia', 'Tower I · Academy'], traduccion: ['Torre II · Traducción', 'Tower II · Translation'], espanol: ['Torre III · Español online', 'Tower III · Online Spanish'], contacto: ['Torre IV · Contacto', 'Tower IV · Contact'] };
    var current = null;
    function setCap(id) {
      if (!cap) return;
      var en = document.documentElement.lang === 'en';
      cap.textContent = id ? caps[id][en ? 1 : 0] : (en ? 'Choose a tower' : 'Elige una torre');
    }
    function open(id, focusPanel) {
      current = id;
      items.forEach(function (it) {
        var on = it.getAttribute('data-tower') === id;
        it.classList.toggle('is-open', on);
        $('.tw__btn', it).setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      spots.forEach(function (s) {
        var on = s.getAttribute('data-for') === id;
        s.classList.toggle('is-active', on); s.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      stage.setAttribute('data-active', id || '');
      setCap(id);
    }
    items.forEach(function (it) {
      var id = it.getAttribute('data-tower');
      $('.tw__btn', it).addEventListener('click', function () { open(current === id ? null : id); });
    });
    spots.forEach(function (s, i) {
      var id = s.getAttribute('data-for');
      s.addEventListener('click', function () {
        open(id);
        if (window.matchMedia('(max-width:959px)').matches) {
          var it = items[i]; if (it) it.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
        }
      });
      s.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = spots[(i + 1) % spots.length]; else if (e.key === 'ArrowLeft') n = spots[(i - 1 + spots.length) % spots.length];
        if (n) { e.preventDefault(); n.focus(); }
      });
    });
    document.addEventListener('ib:lang', function () { setCap(current); });
    open('academia');
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
        e.preventDefault(); document.body.classList.add('is-leaving');
        setTimeout(function () { location.href = a.href; }, 240);
      });
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('is-leaving'); });
  }

  /* ---- Año ---- */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
