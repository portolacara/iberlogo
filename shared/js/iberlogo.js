/*! Iberlogo shared behaviours — sin dependencias, sin estilos.
 * Contrato por atributos data-*: cada diseño pone su propio HTML/CSS. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var lang = 'es';

  /* ---------- i18n ES/EN: [data-en] (y opcional [data-en-placeholder|aria-label|title|alt]) ---------- */
  function applyLang(l) {
    lang = l; document.documentElement.lang = l; store.set('ib-lang', l);
    $$('[data-en]').forEach(function (el) {
      if (el.__es === undefined) el.__es = el.innerHTML;
      el.innerHTML = l === 'en' ? el.getAttribute('data-en') : el.__es;
    });
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(function (a) {
      $$('[data-en-' + a + ']').forEach(function (el) {
        var k = '__es_' + a; if (el[k] === undefined) el[k] = el.getAttribute(a) || '';
        el.setAttribute(a, l === 'en' ? el.getAttribute('data-en-' + a) : el[k]);
      });
    });
    $$('[data-lang-toggle]').forEach(function (b) {
      var on = b.getAttribute('data-lang-toggle') === l;
      b.setAttribute('aria-pressed', on); b.classList.toggle('is-active', on);
    });
    document.dispatchEvent(new CustomEvent('ib:lang', { detail: l }));
  }
  function initLang() {
    $$('[data-lang-toggle]').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang-toggle')); });
    });
    var saved = store.get('ib-lang'); if (saved === 'en') applyLang('en');
    else $$('[data-lang-toggle]').forEach(function (b) { var on = b.getAttribute('data-lang-toggle') === 'es'; b.setAttribute('aria-pressed', on); b.classList.toggle('is-active', on); });
  }
  var t = function (es, en) { return lang === 'en' ? en : es; };

  /* ---------- Reveal: [data-reveal] -> .is-in ; [data-reveal-delay="120"] ms ---------- */
  function initReveal() {
    var els = $$('[data-reveal]'); if (!els.length) return;
    document.documentElement.classList.add('js-reveal');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { var d = x.target.getAttribute('data-reveal-delay'); if (d) x.target.style.transitionDelay = d + 'ms'; x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Parallax: [data-parallax="0.25"] (y), [data-parallax-x] opcional; también escribe --scroll en <html> ---------- */
  function initParallax() {
    var els = $$('[data-parallax]'); var ticking = false;
    function run() {
      var vh = window.innerHeight, y = window.scrollY;
      document.documentElement.style.setProperty('--scroll', y.toFixed(0));
      if (!reduce) els.forEach(function (el) {
        var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
        var s = parseFloat(el.getAttribute('data-parallax')) || 0.2, c = (r.top + r.height / 2 - vh / 2);
        el.style.setProperty('--py', (-c * s).toFixed(1) + 'px');
        el.style.transform = 'translate3d(0,' + (-c * s).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    window.addEventListener('resize', run); run();
  }

  /* ---------- Contadores: [data-counter="1234"] ---------- */
  function initCounters() {
    $$('[data-counter]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-counter')); if (isNaN(end)) return;
      function go() { if (reduce) { el.textContent = end.toLocaleString('es-ES'); return; } var t0 = performance.now(); (function f(n) { var p = Math.min(1, (n - t0) / 1400); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('es-ES'); if (p < 1) requestAnimationFrame(f); })(t0); }
      if (!('IntersectionObserver' in window)) return go();
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { go(); io.disconnect(); } }); io.observe(el);
    });
  }

  /* ---------- Tabs: [data-tabs] > [data-tab="id"] + [data-panel="id"] ---------- */
  function initTabs() {
    $$('[data-tabs]').forEach(function (root) {
      var tabs = $$('[data-tab]', root), panels = $$('[data-panel]', root);
      function show(id, focus) {
        tabs.forEach(function (b) { var on = b.getAttribute('data-tab') === id; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; b.classList.toggle('is-active', on); if (on && focus) b.focus(); });
        panels.forEach(function (p) { var on = p.getAttribute('data-panel') === id; p.hidden = !on; p.classList.toggle('is-active', on); });
      }
      tabs.forEach(function (b, i) {
        b.setAttribute('role', 'tab');
        b.addEventListener('click', function () { show(b.getAttribute('data-tab')); });
        b.addEventListener('keydown', function (e) {
          var k = e.key, n = null;
          if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length]; else if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (n) { e.preventDefault(); show(n.getAttribute('data-tab'), true); }
        });
      });
      panels.forEach(function (p) { p.setAttribute('role', 'tabpanel'); });
      var first = root.getAttribute('data-tabs') || (tabs[0] && tabs[0].getAttribute('data-tab')); if (first) show(first);
    });
  }

  /* ---------- Ciclo de idiomas: [data-lang-cycle] con data-words="Hola|Hello|Bonjour|…" ; click = siguiente ---------- */
  var HELLO = ['Hola', 'Hello', 'Bonjour', 'Привет', 'مرحبا', 'Hallo', 'Salut', 'Ciao', 'Olá'];
  function initCycle() {
    $$('[data-lang-cycle]').forEach(function (el) {
      var words = (el.getAttribute('data-words') || '').split('|').filter(Boolean); if (!words.length) words = HELLO;
      var i = 0, timer;
      function set(n) { i = n % words.length; el.classList.add('is-swap'); setTimeout(function () { el.textContent = words[i]; el.setAttribute('dir', words[i] === 'مرحبا' ? 'rtl' : 'ltr'); el.classList.remove('is-swap'); }, reduce ? 0 : 180); }
      function start() { if (!reduce) timer = setInterval(function () { set(i + 1); }, 2400); }
      el.addEventListener('click', function () { clearInterval(timer); set(i + 1); start(); });
      el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-live', 'polite');
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
      start();
    });
  }

  /* ---------- Test de nivel: [data-level-test] ----------
   * Hijos (todos opcionales salvo question/options): [data-lt-question] [data-lt-options] [data-lt-progress] (--p 0..1)
   * [data-lt-count] "3 / 10" [data-lt-start] [data-lt-intro] [data-lt-quiz] [data-lt-result] [data-lt-level] [data-lt-desc] [data-lt-restart]
   * Opciones: se crean <button type="button" data-lt-option> dentro de options. Clases: .is-correct/.is-wrong. */
  var QS = [
    ['She ___ a teacher.', ['is', 'are', 'am', 'be'], 0],
    ['How ___ brothers do you have?', ['much', 'many', 'any', 'long'], 1],
    ['I ___ to the cinema yesterday.', ['go', 'goes', 'went', 'gone'], 2],
    ['If it rains, we ___ at home.', ['will stay', 'stayed', 'would stayed', 'staying'], 0],
    ["I've lived here ___ 2015.", ['for', 'since', 'during', 'from'], 1],
    ['You ___ smoke in the hospital.', ['mustn’t', 'needn’t', 'don’t', 'hadn’t'], 0],
    ['By next year, she ___ her degree.', ['will finish', 'finishes', 'will have finished', 'is finishing'], 2],
    ['I wish I ___ more time.', ['have', 'had', 'will have', 'would have'], 1],
    ['Hardly ___ the door when the phone rang.', ['I opened', 'did I opened', 'had I opened', 'I had opened'], 2],
    ['The report, ___ findings were controversial, was withdrawn.', ['who', 'which', 'that', 'whose'], 3]
  ];
  var LV = [
    ['A1', 'Principiante', 'Beginner', 'Tienes una base inicial. Un curso desde cero te hará avanzar muy rápido.', 'You have a first foundation. A course from scratch will move you forward fast.'],
    ['A2', 'Elemental (Cambridge A2 Key)', 'Elementary (Cambridge A2 Key)', 'Te manejas en situaciones cotidianas. El siguiente objetivo natural es A2 Key.', 'You cope with everyday situations. A2 Key is your natural next goal.'],
    ['B1', 'Intermedio (Cambridge B1 Preliminary)', 'Intermediate (Cambridge B1 Preliminary)', 'Puedes comunicarte con soltura básica. Prepárate para B1 Preliminary.', 'You communicate with basic fluency. Get ready for B1 Preliminary.'],
    ['B2', 'Intermedio-alto (Cambridge B2 First)', 'Upper-intermediate (Cambridge B2 First)', 'Nivel muy demandado en trabajo y estudios. B2 First es tu certificación.', 'A level highly requested for work and study. B2 First is your certificate.'],
    ['C1', 'Avanzado (Cambridge C1 Advanced)', 'Advanced (Cambridge C1 Advanced)', 'Dominio avanzado. C1 Advanced es la certificación más alta que preparamos y te abre cualquier puerta.', 'Advanced command. C1 Advanced or C2 Proficiency open any door.']
  ];
  function initLevelTest() {
    $$('[data-level-test]').forEach(function (root) {
      var i = 0, score = 0, locked = false;
      var q = $('[data-lt-question]', root), opts = $('[data-lt-options]', root), prog = $('[data-lt-progress]', root), cnt = $('[data-lt-count]', root);
      var intro = $('[data-lt-intro]', root), quiz = $('[data-lt-quiz]', root), res = $('[data-lt-result]', root);
      function view(name) { if (intro) intro.hidden = name !== 'intro'; if (quiz) quiz.hidden = name !== 'quiz'; if (res) res.hidden = name !== 'result'; root.setAttribute('data-state', name); }
      function render() {
        var d = QS[i]; q.textContent = d[0]; opts.innerHTML = ''; locked = false;
        d[1].forEach(function (o, k) {
          var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-lt-option', ''); b.textContent = o;
          b.addEventListener('click', function () { if (locked) return; locked = true; var ok = k === d[2]; if (ok) score++; b.classList.add(ok ? 'is-correct' : 'is-wrong'); if (!ok) $$('[data-lt-option]', opts)[d[2]].classList.add('is-correct'); setTimeout(next, reduce ? 200 : 650); });
          opts.appendChild(b);
        });
        if (cnt) cnt.textContent = (i + 1) + ' / ' + QS.length; if (prog) prog.style.setProperty('--p', (i / QS.length).toFixed(2));
      }
      function next() { i++; if (i >= QS.length) return finish(); render(); }
      function finish() {
        var idx = score <= 2 ? 0 : score <= 4 ? 1 : score <= 6 ? 2 : score <= 8 ? 3 : 4, L = LV[idx];
        var set = function (s, v) { var e = $(s, root); if (e) e.textContent = v; };
        set('[data-lt-level]', L[0]); set('[data-lt-name]', t(L[1], L[2])); set('[data-lt-desc]', t(L[3], L[4])); set('[data-lt-score]', score + ' / ' + QS.length);
        if (prog) prog.style.setProperty('--p', 1); root.setAttribute('data-level', L[0]); view('result');
      }
      function start() { i = 0; score = 0; view('quiz'); render(); }
      var s = $('[data-lt-start]', root), r = $('[data-lt-restart]', root);
      if (s) s.addEventListener('click', start); if (r) r.addEventListener('click', function () { if (intro) view('intro'); else start(); });
      if (intro) view('intro'); else start();
    });
  }

  /* ---------- Presupuesto de traducción: [data-quote-form] ----------
   * Campos name: from,to,type,words,urgency,file,name,email,notes. Pasos opcionales: [data-step] + [data-next]/[data-prev] + [data-step-indicator].
   * Resumen: [data-quote-summary] (se rellena; sin precios ni envío real). Éxito: [data-success]. */
  function initQuote() {
    $$('[data-quote-form]').forEach(function (form) {
      var steps = $$('[data-step]', form), cur = 0;
      function show(n) { cur = Math.max(0, Math.min(steps.length - 1, n)); steps.forEach(function (s, k) { s.hidden = k !== cur; s.classList.toggle('is-active', k === cur); }); $$('[data-step-indicator]', form).forEach(function (d, k) { d.classList.toggle('is-active', k === cur); d.classList.toggle('is-done', k < cur); }); var p = $('[data-step-progress]', form); if (p) p.style.setProperty('--p', steps.length > 1 ? (cur / (steps.length - 1)).toFixed(2) : 1); summary(); }
      function val(n) { var e = form.elements[n]; if (!e) return ''; if (e.type === 'file') return e.files && e.files[0] ? e.files[0].name : ''; return e.value; }
      function label(n) { var e = form.elements[n]; return e && e.options ? e.options[e.selectedIndex].text : val(n); }
      function summary() {
        var o = $('[data-quote-summary]', form); if (!o) return;
        var rows = [[t('Idiomas', 'Languages'), label('from') + ' → ' + label('to')], [t('Tipo', 'Type'), label('type')], [t('Extensión', 'Length'), val('words') ? val('words') + ' ' + t('palabras', 'words') : '—'], [t('Plazo', 'Deadline'), label('urgency')], [t('Archivo', 'File'), val('file') || '—']];
        o.innerHTML = '<dl>' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd></dd></div>'; }).join('') + '</dl>';
        $$('dd', o).forEach(function (d, k) { d.textContent = rows[k][1]; });
      }
      $$('[data-next]', form).forEach(function (b) { b.addEventListener('click', function () { var s = steps[cur], ok = true; if (s) $$('input,select,textarea', s).forEach(function (f) { if (!f.checkValidity()) { f.reportValidity(); ok = false; } }); if (ok) show(cur + 1); }); });
      $$('[data-prev]', form).forEach(function (b) { b.addEventListener('click', function () { show(cur - 1); }); });
      form.addEventListener('input', summary); form.addEventListener('change', summary);
      var swap = $('[data-swap]', form); if (swap) swap.addEventListener('click', function () { var a = form.elements.from, b = form.elements.to, x = a.value; a.value = b.value; b.value = x; summary(); });
      form.addEventListener('submit', function (e) { e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } var ok = $('[data-success]', form.parentNode) || $('[data-success]', form); if (ok) { ok.hidden = false; } form.setAttribute('data-sent', ''); $$('[data-hide-on-sent]', form).forEach(function (x) { x.hidden = true; }); steps.forEach(function (s) { s.hidden = true; }); });
      if (steps.length) show(0); else summary();
    });
    /* Formularios simples (lista de espera, contacto): [data-demo-form] -> muestra [data-success] */
    $$('[data-demo-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) { e.preventDefault(); if (!form.checkValidity()) { form.reportValidity(); return; } var ok = $('[data-success]', form.parentNode) || $('[data-success]', form); if (ok) ok.hidden = false; form.setAttribute('data-sent', ''); $$('[data-hide-on-sent]', form).forEach(function (x) { x.hidden = true; }); });
    });
  }

  /* ---------- Menú móvil: [data-nav-toggle] controla [data-nav] (aria-expanded + .is-open) ---------- */
  function initNav() {
    $$('[data-nav-toggle]').forEach(function (b) {
      var nav = $('[data-nav]'); if (!nav) return;
      function set(o) { b.setAttribute('aria-expanded', o); nav.classList.toggle('is-open', o); document.documentElement.classList.toggle('nav-open', o); }
      b.setAttribute('aria-expanded', 'false');
      b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
      $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    });
    var h = $('[data-header]'); if (h) { var f = function () { h.classList.toggle('is-scrolled', window.scrollY > 24); }; window.addEventListener('scroll', f, { passive: true }); f(); }
  }

  /* ---------- Acordeón exclusivo opcional: <div data-accordion> con <details> ---------- */
  function initAccordion() {
    $$('[data-accordion]').forEach(function (root) {
      var ds = $$('details', root);
      ds.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) ds.forEach(function (o) { if (o !== d) o.open = false; }); }); });
    });
  }

  function init() { initLang(); initNav(); initReveal(); initParallax(); initCounters(); initTabs(); initCycle(); initLevelTest(); initQuote(); initAccordion(); }
  window.Iberlogo = { applyLang: applyLang, t: t };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
