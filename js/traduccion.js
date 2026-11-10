/* Iberlogo D1 — traducción: mapa de idiomas (adaptado del atlas del diseño 5) + formulario "siempre con español".
 * Se carga solo en traduccion.html, después de ../shared/js/iberlogo.js. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = function (es, en) { return (window.Iberlogo && window.Iberlogo.t) ? window.Iberlogo.t(es, en) : es; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- geometría del mapa (puntos de tierra generados desde polígonos simplificados) ---------- */
  var NS = 'http://www.w3.org/2000/svg';
  var LON0 = -16, LON1 = 52, LAT0 = 25, LAT1 = 61, W = 1000, H = 694;
  function px(lon, lat) { return [(lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H]; }
  var ZGZ = [-0.88, 41.65];
  var POLYS = [
    // Iberia
    [-9.5,43.0,-8,43.8,-1.8,43.4,3.2,42.4,3.1,41.9,0.9,41,-0.3,39.5,0,38.7,-0.8,37.6,-2.1,36.7,-4.4,36.7,-5.6,36,-6.3,36.8,-7.4,37.2,-8.9,37,-9.5,38.7,-9,40,-8.8,42],
    // Europa continental, Italia, Balcanes y Rusia occidental
    [-1.8,43.4,-1.2,46,-2.5,47.3,-4.6,48.2,-1.5,48.7,-1.2,49.7,1.5,50.2,3.5,51.3,4.8,53,7,53.5,8.6,54,8.7,55.5,8.2,57,10.5,57.7,10.3,56,9.8,55,11,54,14,54,18,54.8,21,55,21,57,24,57.3,23.5,59,28,59.6,30,60,34,66,60,66,60,46,52,46.5,48,45.5,47.2,43,43,43,40,43.6,38,45,37.5,47,35,46.2,33,45.5,32.5,46.5,30.7,46.4,29.7,45.2,28.8,44.3,28,43.5,27.8,42.2,26.5,41.7,26.2,40.6,24,40.8,23,40,23.6,38.5,22.5,36.5,21.3,38,20,39.7,19.5,41.5,18.5,42.5,16.5,43.5,15,44.5,14,45.3,13.6,45.7,12.3,45.3,12.4,44.3,13.5,43.5,14.5,42.2,16,41.9,17,41,18.5,40.2,17.2,39.9,16.7,39.2,16,38.3,15.7,38,15.8,39.5,15,40.2,14,40.8,12.5,41.5,11,42.5,10.3,43.8,8.8,44.4,7.5,43.8,6,43.1,4,43.4,3.2,42.4,1.8,42.4],
    // Escandinavia y Finlandia
    [5.5,58.8,8,58,10.5,59.2,11.8,58,12.8,56.2,14.4,56,16.5,57.5,18.5,59.5,17.2,60.5,18,62.5,5,62.5],
    [21,60,23,60,25,60.4,28,60.5,30,61,30,63,20,63,21,61],
    // Islas
    [-5.7,50,1.5,51,1.7,52.8,0,53.5,-2,55.8,-2.2,57.5,-4,58.6,-6,58,-5.5,56,-4.8,55,-3,54.7,-3.2,53.4,-4.8,52.7,-5.2,51.7],
    [-10,51.7,-6,52,-6,54.2,-5.5,55.2,-7.5,55.3,-10,54,-10,52],
    [12.5,38,15.6,38.2,15.1,36.7,12.5,37.6],
    [8.2,41,9.7,41,9.5,39,8.4,39],
    [8.6,42.5,9.5,42.9,9.4,41.4,8.7,41.6],
    [23.5,35.3,26.2,35.2,26,35,23.6,34.9],
    [32.3,35.1,34.5,35.6,34,34.9,32.5,34.7],
    // Turquía, Cáucaso, Irán, Oriente Medio y Arabia
    [29,41.2,31,41.2,35,42,38,41,41.5,41.5,41.5,43,47.2,43,49.5,41.5,50.3,40.3,49,38.5,50,37,53,36.8,54,37.3,62,37.3,62,25.3,57,25.8,56.3,27,54,26.7,52,27.5,50.6,29.5,48.8,30.2,48,29.4,48.8,28.3,49.7,26.8,50.2,26.1,51.2,26.1,51.6,24.6,54,24.2,56,25.5,56.6,24.6,58,23.5,62,20,62,10,45,12.5,43,13,42.7,16,41,19,39,21.5,37.5,25,35,28,34.9,29.5,34.2,31.3,35,33,35.9,35.5,36,36.5,34,36.2,32,36.2,30.5,36.6,28,36.7,27.3,37.5,26.4,39.3,26.5,40.1],
    // Norte de África
    [-6,35.8,-2.5,35.2,1,36.5,3,36.8,6,37,9.8,37.3,11,37.1,10.6,36.5,10.2,34.5,11.2,33.2,13,32.8,15,32.3,19,30.3,20,32.2,22,32.9,25,31.6,29,30.9,31,31.5,32.3,31.2,34.2,31.3,34.9,29.5,34.5,28,34.2,27.8,33.6,28.3,32.6,29.9,33.5,27.5,34.8,25,36.5,22,37.5,19,39,15,44,10,-20,10,-17,21,-13,27.5,-10,29.5,-9.5,32,-6.8,34]
  ];
  function inPoly(x, y, p) {
    var inside = false;
    for (var i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
      var xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function landPath() {
    var d = '', step = 11.5;
    for (var py = step / 2; py < H; py += step) {
      for (var pxx = step / 2; pxx < W; pxx += step) {
        var lon = LON0 + pxx / W * (LON1 - LON0), lat = LAT1 - py / H * (LAT1 - LAT0);
        for (var k = 0; k < POLYS.length; k++) { if (inPoly(lon, lat, POLYS[k])) { d += 'M' + pxx.toFixed(1) + ' ' + py.toFixed(1) + 'h.01'; break; } }
      }
    }
    return d;
  }

  /* Solo hay combinaciones con español: ES -> X o X -> ES. */
  var LANGS = [
    { id: 'en', nat: 'English', code: 'en', es: 'Inglés', en: 'English', word: 'Translation', city: [-0.12, 51.5], lab: [-14, -10, 'end'] },
    { id: 'fr', nat: 'Français', code: 'fr', es: 'Francés', en: 'French', word: 'Traduction', city: [2.35, 48.85], lab: [-14, 5, 'end'] },
    { id: 'ru', nat: 'Русский', code: 'ru', es: 'Ruso', en: 'Russian', word: 'Перевод', city: [37.6, 55.75], lab: [0, -18, 'middle'] },
    { id: 'ar', nat: 'العربية', code: 'ar', es: 'Árabe', en: 'Arabic', word: 'ترجمة', city: [31.2, 30.05], lab: [0, 30, 'middle'], rtl: true },
    { id: 'de', nat: 'Deutsch', code: 'de', es: 'Alemán', en: 'German', word: 'Übersetzung', city: [13.4, 52.5], lab: [0, -18, 'middle'] },
    { id: 'ro', nat: 'Română', code: 'ro', es: 'Rumano', en: 'Romanian', word: 'Traducere', city: [26.1, 44.4], lab: [0, 30, 'middle'] },
    { id: 'it', nat: 'Italiano', code: 'it', es: 'Italiano', en: 'Italian', word: 'Traduzione', city: [12.5, 41.9], lab: [0, 30, 'middle'] },
    { id: 'pt', nat: 'Português', code: 'pt', es: 'Portugués', en: 'Portuguese', word: 'Tradução', city: [-9.1, 38.7], lab: [-4, 30, 'middle'] }
  ];
  var BYID = {}; LANGS.forEach(function (L) { BYID[L.id] = L; });
  var TYPES = [['Jurada', 'Sworn'], ['Técnica', 'Technical'], ['Legal', 'Legal'], ['General', 'General'], ['Interpretación consecutiva', 'Consecutive interpreting']];
  var dirState = 'from-es'; /* 'from-es' = ES → X · 'to-es' = X → ES */

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- Formulario: dirección + idioma (el otro extremo es siempre español) ---------- */
  function formSync(form, opts) {
    var dir = ($('input[name="dir"]:checked', form) || {}).value || 'from-es';
    var L = BYID[form.elements.lang.value] || LANGS[0];
    form.elements.from.value = dir === 'from-es' ? 'Español' : L.nat;
    form.elements.to.value = dir === 'from-es' ? L.nat : 'Español';
    var pair = $('[data-pair]', form);
    if (pair) pair.innerHTML = '<span>' + (dir === 'from-es' ? 'Español' : L.nat) + '</span><i aria-hidden="true">→</i><span>' + (dir === 'from-es' ? L.nat : 'Español') + '</span>';
    if (!opts || !opts.silent) form.elements.from.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function initForm() {
    var form = $('[data-quote-form]'); if (!form || !form.elements.lang) return;
    form.addEventListener('change', function (e) { if (e.target.name === 'dir' || e.target.name === 'lang') formSync(form); });
    formSync(form, { silent: true });
    form.elements.from.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function prefillForm(dir, id) {
    var form = $('[data-quote-form]'); if (!form || !form.elements.lang) return;
    var r = $('input[name="dir"][value="' + dir + '"]', form); if (r) r.checked = true;
    form.elements.lang.value = id; formSync(form);
    var target = $('#presupuesto') || form;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { try { form.elements.lang.focus({ preventScroll: true }); } catch (e) {} }, reduce ? 0 : 650);
  }

  /* ---------- Mapa ---------- */
  function initAtlas() {
    var box = $('[data-atlas]'); if (!box) return;
    var ficha = $('[data-ficha]'), chips = $$('[data-chip]');
    var svg = el('svg', { viewBox: '0 40 ' + W + ' ' + (H - 54), 'class': 'atlas-svg', 'aria-hidden': 'true', focusable: 'false' });
    var g = el('g', {}, svg);
    for (var lo = -10; lo <= 50; lo += 10) { var a = px(lo, LAT0), b = px(lo, LAT1); el('path', { 'class': 'grat', d: 'M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] }, g); }
    for (var la = 30; la <= 60; la += 10) { var c = px(LON0, la), d2 = px(LON1, la); el('path', { 'class': 'grat', d: 'M' + c[0] + ' ' + c[1] + 'L' + d2[0] + ' ' + d2[1] }, g); }
    el('path', { 'class': 'land', d: landPath() }, svg);
    var routes = el('g', {}, svg), pl = el('circle', { 'class': 'plane', r: 5 }, svg);
    var origin = px(ZGZ[0], ZGZ[1]), marks = {};
    LANGS.forEach(function (L) {
      var p = px(L.city[0], L.city[1]); L.xy = p;
      var m = el('g', { 'class': 'mk', 'data-id': L.id }, svg);
      el('circle', { 'class': 'hit', cx: p[0], cy: p[1], r: 28 }, m);
      el('circle', { 'class': 'halo', cx: p[0], cy: p[1], r: 9 }, m);
      el('circle', { 'class': 'dot', cx: p[0], cy: p[1], r: 7 }, m);
      var tx = el('text', { x: p[0] + L.lab[0], y: p[1] + L.lab[1], 'text-anchor': L.lab[2] }, m); tx.textContent = L.nat;
      if (L.rtl) tx.setAttribute('direction', 'rtl');
      m.addEventListener('click', function () { select(L.id, true); });
      marks[L.id] = m;
    });
    var og = el('g', { 'class': 'mk origin' }, svg); og.style.cursor = 'default';
    el('circle', { 'class': 'dot', cx: origin[0], cy: origin[1], r: 8 }, og);
    var ot = el('text', { x: origin[0] + 4, y: origin[1] - 18, 'text-anchor': 'middle' }, og); ot.textContent = 'Zaragoza · Español';
    box.appendChild(svg);

    var cur = null, anim = 0, started = false;
    function curve(to) {
      var dx = to[0] - origin[0], dy = to[1] - origin[1], dist = Math.sqrt(dx * dx + dy * dy);
      var mx = (origin[0] + to[0]) / 2, my = (origin[1] + to[1]) / 2;
      var nx = -dy / dist, ny = dx / dist; if (ny > 0) { nx = -nx; ny = -ny; }
      var h = Math.max(36, dist * 0.32);
      return 'M' + origin[0].toFixed(1) + ' ' + origin[1].toFixed(1) + 'Q' + (mx + nx * h).toFixed(1) + ' ' + (my + ny * h).toFixed(1) + ' ' + to[0].toFixed(1) + ' ' + to[1].toFixed(1);
    }
    function drawRoute(L, animate) {
      routes.innerHTML = ''; cancelAnimationFrame(anim); pl.style.opacity = 0;
      var d = curve(L.xy);
      el('path', { 'class': 'arc-ghost', d: d }, routes);
      var arc = el('path', { 'class': 'arc', d: d, pathLength: 1 }, routes);
      if (!animate || reduce) { arc.classList.add('is-drawn'); return; }
      arc.getBoundingClientRect();
      requestAnimationFrame(function () { arc.classList.add('is-drawn'); });
      var len = arc.getTotalLength(), t0 = null, back = dirState === 'to-es';
      (function step(ts) {
        if (t0 === null) t0 = ts; var k = clamp((ts - t0) / 1250, 0, 1), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var pt = arc.getPointAtLength(len * (back ? 1 - e : e)); pl.setAttribute('cx', pt.x); pl.setAttribute('cy', pt.y); pl.style.opacity = k < 1 ? 1 : 0;
        if (k < 1) anim = requestAnimationFrame(step);
      })(performance.now());
    }
    var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    function fichaHTML(L) {
      var out = dirState === 'from-es';
      var pairTxt = out ? 'Español → ' + L.nat : L.nat + ' → Español';
      var types = TYPES.map(function (x) { return '<span>' + T(x[0], x[1]) + '</span>'; }).join('');
      var lang = ' lang="' + L.code + '"' + (L.rtl ? ' dir="rtl"' : '');
      var up = L.code.toUpperCase();
      return '<p class="kick">' + T('Ruta desde Zaragoza', 'Route from Zaragoza') + '</p>' +
        '<h3 class="ficha-native"' + lang + '>' + L.nat + '</h3>' +
        '<p class="ficha-es">' + T(L.es, L.en) + ' · «Traducción» → <span' + lang + '>' + L.word + '</span></p>' +
        '<div class="dirsw" role="group" aria-label="' + T('Dirección de la traducción', 'Translation direction') + '">' +
          '<button type="button" data-dir="from-es" aria-pressed="' + out + '">ES → ' + up + '</button>' +
          '<button type="button" data-dir="to-es" aria-pressed="' + !out + '">' + up + ' → ES</button></div>' +
        '<dl><div><dt>' + T('Combinación', 'Language pair') + '</dt><dd>' + pairTxt + '</dd></div>' +
        '<div><dt>' + T('Tipos de traducción', 'Translation types') + '</dt><dd class="types">' + types + '</dd></div>' +
        '<div><dt>' + T('Disponibilidad exacta', 'Exact availability') + '</dt><dd><span class="ph">' + T('[por validar]', '[to be confirmed]') + '</span></dd></div></dl>' +
        '<a class="btn btn--red" data-ficha-cta href="#presupuesto"><span>' + T('Pide presupuesto', 'Get a quote') + ' ' + (out ? 'ES → ' + up : up + ' → ES') + '</span> ' + ARROW + '</a>';
    }
    function renderFicha(swap) {
      if (!ficha || !cur) return;
      ficha.innerHTML = fichaHTML(cur);
      if (swap) { ficha.classList.remove('is-swap'); void ficha.offsetWidth; ficha.classList.add('is-swap'); }
    }
    function select(id, user, silent) {
      var L = BYID[id]; if (!L) return;
      cur = L; started = started || !!user;
      Object.keys(marks).forEach(function (k) { marks[k].classList.toggle('is-on', k === id); });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-chip') === id); });
      drawRoute(L, !silent); renderFicha(!silent);
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { select(c.getAttribute('data-chip'), true); }); });
    ficha && ficha.addEventListener('click', function (e) {
      var d = e.target.closest('[data-dir]');
      if (d) { dirState = d.getAttribute('data-dir'); renderFicha(false); drawRoute(cur, true); var nb = $('[data-dir="' + dirState + '"]', ficha); if (nb) nb.focus(); return; }
      var a = e.target.closest('[data-ficha-cta]');
      if (a && $('[data-quote-form]')) { e.preventDefault(); prefillForm(dirState, cur.id); }
    });
    document.addEventListener('ib:lang', function () { renderFicha(false); });
    select('en', false, true); /* estado inicial: ficha rellena y ruta trazada sin animar */
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); setTimeout(function () { if (!started) drawRoute(cur, true); }, 450); } }, { threshold: 0.45 });
      io.observe(box);
    }
  }

  function init() { initForm(); initAtlas(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
