(function () {
  var KEY = 'simhub_progress_networksims';

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem(KEY, JSON.stringify(p));
  }

  var SimHub = {
    init: function (simId, title, dashboardHref) {
      var p = loadProgress();
      if (!p[simId]) {
        p[simId] = { status: 'in-progress', started: Date.now() };
        saveProgress(p);
      }

      var style = document.createElement('style');
      style.textContent =
        '#simhub-bar{position:sticky;top:0;z-index:999;display:flex;align-items:center;gap:14px;' +
        'background:#0369a1;color:#fff;padding:10px 16px;font-family:Arial,"Segoe UI",sans-serif;' +
        'font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.18)}' +
        '#simhub-bar a.simhub-back{color:#fff;text-decoration:none;font-weight:700;padding:6px 12px;' +
        'border:1px solid rgba(255,255,255,.65);border-radius:6px;white-space:nowrap;flex-shrink:0}' +
        '#simhub-bar a.simhub-back:hover{background:rgba(255,255,255,.15)}' +
        '#simhub-bar .simhub-title{font-weight:600;opacity:.95;overflow:hidden;text-overflow:ellipsis;' +
        'white-space:nowrap}' +
        '@media (max-width:480px){#simhub-bar{font-size:12.5px;padding:8px 10px;gap:8px}' +
        '#simhub-bar .simhub-title{display:none}}';
      document.head.appendChild(style);

      var bar = document.createElement('div');
      bar.id = 'simhub-bar';
      var back = document.createElement('a');
      back.className = 'simhub-back';
      back.href = dashboardHref;
      back.textContent = '← Back to Dashboard';
      var titleSpan = document.createElement('span');
      titleSpan.className = 'simhub-title';
      titleSpan.textContent = title;
      bar.appendChild(back);
      bar.appendChild(titleSpan);

      document.addEventListener('DOMContentLoaded', function () {
        document.body.insertBefore(bar, document.body.firstChild);
      });
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        document.body.insertBefore(bar, document.body.firstChild);
      }
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
