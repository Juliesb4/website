/* Julie Schøning Bennekov — single-stage router.
   One page; views swap on click. Each view shows all of its content. */
(function () {
  'use strict';

  var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var navButtons = Array.prototype.slice.call(document.querySelectorAll('[data-go]'));
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  var body = document.body;

  var DEFAULT = 'forside';
  var ids = views.map(function (v) { return v.dataset.view; });

  /* The browser restores the previous scroll position on reload, and it does
     so after our own scroll-to-top runs — which lands the visitor part way
     down the page. We place the view ourselves, so take that over. */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (err) {}

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    var label = document.querySelector('.nav-toggle-label');
    if (label) label.textContent = open ? 'Luk' : 'Menu';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!body.classList.contains('menu-open'));
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (body.classList.contains('menu-open')) {
      setMenu(false);
      if (toggle) toggle.focus();
    }
  });

  /* ---------- View router ---------- */
  var current = null;

  function go(id, opts) {
    opts = opts || {};
    if (ids.indexOf(id) === -1) id = DEFAULT;
    if (id === current) {
      if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    current = id;

    views.forEach(function (v) {
      var on = v.dataset.view === id;
      v.classList.toggle('is-active', on);
      if (on) {
        v.removeAttribute('inert');
        if (v.dataset.title) document.title = v.dataset.title;
      } else {
        v.setAttribute('inert', '');
      }
    });

    var view = document.getElementById('view-' + id);
    body.dataset.view = id;
    body.classList.toggle('is-dark', !!(view && view.hasAttribute('data-dark')));

    navButtons.forEach(function (b) {
      if (b.closest('.nav')) {
        if (b.dataset.go === id) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      }
    });

    if (!opts.silent) {
      /* pushState can throw when the page is opened straight from disk
         (file://), so fall back to a plain hash change */
      var url = id === DEFAULT ? location.pathname : '#' + id;
      try {
        if (opts.replace) history.replaceState(null, '', url);
        else history.pushState(null, '', url);
      } catch (err) {
        location.hash = id === DEFAULT ? '' : id;
      }
    }

    if (!opts.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
    setMenu(false);
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-go]');
    if (!trigger) return;
    e.preventDefault();
    go(trigger.dataset.go);
  });

  window.addEventListener('popstate', function () {
    go((location.hash || '').replace('#', '') || DEFAULT, { silent: true });
  });

  /* ---------- Footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Boot ---------- */
  go((location.hash || '').replace('#', '') || DEFAULT, { replace: true, silent: true });
})();
