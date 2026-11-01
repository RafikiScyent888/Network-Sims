(function () {
  var KEY = 'simhub_progress_networksims';

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* storage off */ }
  }

  /* The "Back to Dashboard" bar. White on deep blue (over 7:1), a yellow focus ring.
     It is fixed across the top of the window and the page starts below it, whatever the page's own layout
     (margins, centring, side-by-side bodies); sticky: false lets it scroll away with the page instead.
     Its height is kept in --simhub-h. A page's own header pinned to the top moves down below the bar, and a
     full-height page that cannot scroll is shortened by the bar's height, so nothing is hidden or cut off. */
  function makeRoom(bar) {
    var h = bar.offsetHeight;
    document.documentElement.style.setProperty('--simhub-h', h + 'px');
    var all = document.body.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el === bar || bar.contains(el) || el.getAttribute('data-simhub-moved')) continue;
      var cs = getComputedStyle(el), top = parseFloat(cs.top);
      if (cs.position === 'sticky' && cs.top !== 'auto' && !isNaN(top)) { el.style.top = (top + h) + 'px'; el.setAttribute('data-simhub-moved', '1'); }
      else if (cs.position === 'fixed' && !isNaN(top) && top < h) {
        /* something pinned within the bar's band (a header, a toggle button): below the bar. A full-window overlay, such as a dialog, is left alone. */
        var r = el.getBoundingClientRect();
        if (r.height > 0 && r.height < innerHeight * 0.5) { el.style.top = (top + h) + 'px'; el.setAttribute('data-simhub-moved', '1'); }
      }
    }
    var b = document.body, de = document.documentElement;
    var noScroll = /hidden|clip/.test(getComputedStyle(b).overflowY) || /hidden|clip/.test(getComputedStyle(de).overflowY);
    if (noScroll && !b.getAttribute('data-simhub-moved') && b.getBoundingClientRect().height >= innerHeight - h - 2) {
      b.style.height = 'calc(100vh - ' + h + 'px)'; b.style.minHeight = '0'; b.setAttribute('data-simhub-moved', '1');
    }
  }

  function drawBar(title, dashboardHref, opts) {
    opts = opts || {};
    if (document.getElementById('simhub-bar')) return;
    var style = document.createElement('style');
    style.textContent =
      'html{padding-top:var(--simhub-h,42px)!important;scroll-padding-top:var(--simhub-h,42px)}' +
      '#simhub-bar{position:' + (opts.sticky === false ? 'absolute' : 'fixed') + ';top:0;left:0;right:0;z-index:45;display:flex;align-items:center;gap:14px;' +
      'background:#0c4a6e;color:#fff;padding:8px 16px;margin:0;font-family:Arial,"Segoe UI",sans-serif;' +
      'font-size:14px;line-height:1.4;box-shadow:0 2px 8px rgba(0,0,0,.18);box-sizing:border-box;text-align:left;letter-spacing:normal;word-spacing:normal}' +
      '#simhub-bar a.simhub-back{color:#fff;text-decoration:none;font-weight:700;padding:6px 12px;' +
      'border:1px solid rgba(255,255,255,.65);border-radius:6px;white-space:nowrap;flex-shrink:0}' +
      '#simhub-bar a.simhub-back:hover{background:rgba(0,0,0,.28)}' +
      '#simhub-bar a.simhub-back:focus-visible{outline:3px solid #fde047;outline-offset:2px}' +
      '#simhub-bar .simhub-title{font-weight:600;overflow:hidden;text-overflow:ellipsis;' +
      'white-space:nowrap}' +
      '@media (max-width:480px){#simhub-bar{font-size:12.5px;padding:8px 10px;gap:8px}' +
      '#simhub-bar .simhub-title{display:none}}';
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'simhub-bar';
    var back = document.createElement('a');
    back.className = 'simhub-back';
    back.href = dashboardHref;
    back.textContent = '\u2190 Back to Dashboard';   /* written as an escape, so a page with no declared character set still shows the arrow */
    var titleSpan = document.createElement('span');
    titleSpan.className = 'simhub-title';
    titleSpan.textContent = title;
    bar.appendChild(back);
    bar.appendChild(titleSpan);

    function place() {
      if (!document.body) return;
      if (bar.parentNode !== document.body || document.body.firstChild !== bar) document.body.insertBefore(bar, document.body.firstChild);
      makeRoom(bar);
    }
    document.addEventListener('DOMContentLoaded', place);
    /* styles that arrive late (a CSS library loaded from the web) are taken into account once the page has loaded */
    window.addEventListener('load', function () { place(); setTimeout(function () { makeRoom(bar); }, 600); });
    window.addEventListener('resize', function () { makeRoom(bar); });
    if (document.readyState === 'interactive' || document.readyState === 'complete') place();
  }

  var SimHub = {
    /* The bar, and this sim marked "In progress" on the dashboard (for a sim that calls markComplete when it is done). */
    init: function (simId, title, dashboardHref, opts) {
      var p = loadProgress();
      if (!p[simId]) {
        p[simId] = { status: 'in-progress', started: Date.now() };
        saveProgress(p);
      }
      drawBar(title, dashboardHref, opts);
    },
    /* The bar only: no progress kept (for a sim that never reports being finished). */
    bar: function (title, dashboardHref, opts) {
      drawBar(title, dashboardHref, opts);
    },
    markComplete: function (simId) {
      var p = loadProgress();
      var prevStarted = (p[simId] && p[simId].started) || Date.now();
      p[simId] = { status: 'completed', completed: Date.now(), started: prevStarted };
      saveProgress(p);
    }
  };

  window.SimHub = SimHub;
})();
