/* Secure submission for the contact form on the home page.
 * Turnstile is verified server-side by functions/api/contact.js. */
(function () {
  'use strict';

  var form = document.querySelector('form[data-demo-form]');
  if (!form || !form.querySelector('#c-mail') || !form.querySelector('#c-msg')) return;

  var submit = form.querySelector('button[type="submit"]');
  var success = form.parentElement.querySelector('[data-success]');
  if (!submit || !success) return;

  var widgetId = null;
  var turnstileReady = false;
  var status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.style.margin = '0';
  form.insertBefore(status, submit.closest('div') || submit);

  var honeypotWrap = document.createElement('div');
  honeypotWrap.setAttribute('aria-hidden', 'true');
  honeypotWrap.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
  honeypotWrap.innerHTML = '<label>Deja este campo vacío<input name="website" tabindex="-1" autocomplete="off"></label>';
  form.appendChild(honeypotWrap);

  var challenge = document.createElement('div');
  challenge.className = 'cf-turnstile';
  var buttonRow = submit.closest('div') || submit;
  form.insertBefore(challenge, buttonRow);

  function message(es, en) {
    status.textContent = document.documentElement.lang === 'en' ? en : es;
  }

  function loadTurnstile(siteKey) {
    window.onIberlogoTurnstileReady = function () {
      if (!window.turnstile) return;
      widgetId = window.turnstile.render(challenge, {
        sitekey: siteKey,
        action: 'contact',
        callback: function () { turnstileReady = true; },
        'expired-callback': function () { turnstileReady = false; },
        'error-callback': function () { turnstileReady = false; }
      });
      turnstileReady = true;
    };
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onIberlogoTurnstileReady&render=explicit';
    script.async = true;
    script.defer = true;
    script.onerror = function () {
      message('No se pudo cargar la protección antispam. Recarga la página para intentarlo de nuevo.', 'Spam protection could not be loaded. Reload the page and try again.');
    };
    document.head.appendChild(script);
  }

  fetch('/api/contact-config', { headers: { Accept: 'application/json' } })
    .then(function (response) {
      if (!response.ok) throw new Error('Contact form is not configured');
      return response.json();
    })
    .then(function (config) {
      if (!config.siteKey) throw new Error('Turnstile site key is missing');
      loadTurnstile(config.siteKey);
    })
    .catch(function () {
      message('El formulario aún no está configurado. También puedes llamarnos o escribirnos por WhatsApp.', 'The form is not configured yet. You can also call us or contact us on WhatsApp.');
    });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    if (!window.turnstile || widgetId === null || !turnstileReady || !window.turnstile.getResponse(widgetId)) {
      message('Completa la verificación antispam antes de enviar.', 'Complete the spam protection check before sending.');
      return;
    }

    var lang = document.documentElement.lang === 'en';
    var buttonText = submit.innerHTML;
    submit.disabled = true;
    message('Enviando…', 'Sending…');

    var payload = {
      topic: (new FormData(form).get('topic') || '').toString(),
      name: (new FormData(form).get('name') || '').toString(),
      email: (new FormData(form).get('email') || '').toString(),
      tel: (new FormData(form).get('tel') || '').toString(),
      msg: (new FormData(form).get('msg') || '').toString(),
      website: (new FormData(form).get('website') || '').toString(),
      turnstileToken: window.turnstile.getResponse(widgetId)
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) {
        if (!response.ok) throw new Error(body.error || 'Could not send message');
        return body;
      });
    }).then(function () {
      form.hidden = true;
      var heading = success.querySelector('h3');
      var paragraph = success.querySelector('p');
      if (heading) heading.textContent = lang ? 'Thank you!' : '¡Gracias!';
      if (paragraph) paragraph.textContent = lang ? 'Your message has been sent. We will reply as soon as possible.' : 'Tu mensaje se ha enviado. Te responderemos lo antes posible.';
      success.hidden = false;
      success.focus();
    }).catch(function (error) {
      message(error.message || (lang ? 'Could not send the message. Please try again.' : 'No se pudo enviar el mensaje. Inténtalo de nuevo.'));
      if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId);
      turnstileReady = false;
    }).finally(function () {
      submit.disabled = false;
      submit.innerHTML = buttonText;
    });
  }, true);
})();
