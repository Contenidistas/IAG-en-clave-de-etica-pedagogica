// Storage is optional: blocked access or quota exhaustion must not stop a journey.
(function () {
  'use strict';
  function resilientStorage(name) {
    const fallback = new Map();
    return {
      getItem(key) {
        if (fallback.has(key)) return fallback.get(key);
        try { return window[name].getItem(key); }
        catch { return null; }
      },
      setItem(key, value) {
        const text = String(value);
        try {
          window[name].setItem(key, text);
          fallback.delete(key);
        } catch { fallback.set(key, text); }
      },
      removeItem(key) {
        try {
          window[name].removeItem(key);
          fallback.delete(key);
        } catch { fallback.set(key, null); }
      }
    };
  }
  window.appStorage = {
    local: resilientStorage('localStorage'),
    session: resilientStorage('sessionStorage')
  };
})();
