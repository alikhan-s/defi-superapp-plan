/**
 * plan-state.js
 * Persists every checkbox state in localStorage.
 * Works on GitHub Pages (static, no server needed).
 */

(function () {
  'use strict';

  const PREFIX = 'plan:checkbox:';

  /** Read a single checkbox state from localStorage */
  function load(id) {
    try {
      return localStorage.getItem(PREFIX + id) === 'true';
    } catch (e) {
      // Private browsing / storage disabled — fail silently
      return false;
    }
  }

  /** Write a single checkbox state to localStorage */
  function save(id, checked) {
    try {
      localStorage.setItem(PREFIX + id, checked ? 'true' : 'false');
    } catch (e) {
      // Quota exceeded or disabled — fail silently
    }
  }

  /** Apply saved state to all checkboxes that have an id */
  function restoreAll() {
    document.querySelectorAll('input[type="checkbox"][id]').forEach(function (cb) {
      cb.checked = load(cb.id);
    });
  }

  /** Listen for future changes and persist them */
  function watchAll() {
    document.addEventListener('change', function (e) {
      var el = e.target;
      if (el.type === 'checkbox' && el.id) {
        save(el.id, el.checked);
        // Optional: toggle a .done class on the parent card for styling
        var card = el.closest('.card');
        if (card) {
          card.classList.toggle('done', el.checked);
        }
        updateProgress();
      }
    });
  }

  /** Recalculate and render progress stats */
  function updateProgress() {
    var all      = document.querySelectorAll('input[type="checkbox"]');
    var done     = document.querySelectorAll('input[type="checkbox"]:checked');
    var total    = all.length;
    var complete = done.length;
    var pct      = total > 0 ? Math.round((complete / total) * 100) : 0;

    // Update stat elements if they exist in your HTML
    var elDone   = document.getElementById('stat-done');
    var elPct    = document.getElementById('stat-pct');
    var elFill   = document.getElementById('progress-fill');

    if (elDone)  elDone.textContent  = complete + ' / ' + total;
    if (elPct)   elPct.textContent   = pct + '%';
    if (elFill)  elFill.style.width  = pct + '%';

    // also update the small label below the bar
    var elLabel = document.getElementById('progress-pct-label');
    if (elLabel) elLabel.textContent = pct + '% complete';
  }

  /**
   * If your page renders checkboxes dynamically (e.g. via JS tab switching),
   * call window.planState.restore() after each render to re-apply saved states.
   *
   * Example:
   *   renderTab('contracts');
   *   window.planState.restore();
   */
  window.planState = {
    restore:        restoreAll,
    updateProgress: updateProgress,
    /** Clear all saved checkbox states (adds a reset button if you want one) */
    clearAll: function () {
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.startsWith(PREFIX); })
          .forEach(function (k) { localStorage.removeItem(k); });
        document.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
          cb.checked = false;
          var card = cb.closest('.card');
          if (card) card.classList.remove('done');
        });
        updateProgress();
      } catch (e) { /* silent */ }
    }
  };

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    restoreAll();
    watchAll();
    updateProgress();
  }
})();