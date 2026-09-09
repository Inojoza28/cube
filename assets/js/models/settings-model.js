Cubo.models.settings = (() => {
  'use strict';
  const key = 'cubo-embaralhado-settings-v1';
  const themes = ['light', 'black', 'blue'];
  const validTime = value => Number.isSafeInteger(value) && value > 0 && value <= 3599990;
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
  const state = {
    theme: themes.includes(stored.theme) ? stored.theme : 'light',
    resolutionMode: stored.resolutionMode === true,
    current: validTime(stored.current) ? stored.current : null,
    target: validTime(stored.target) ? stored.target : null
  };

  function parseTime(raw) {
    const value = raw.trim().replace(',', '.');
    if (!value) return { valid: true, value: null };
    const match = /^(?:(\d{1,2}):([0-5]\d)|(\d{1,4}))(?:\.(\d{1,2}))?$/.exec(value);
    const seconds = match ? (match[1] ? Number(match[1]) * 60 + Number(match[2]) : Number(match[3])) + Number(`0.${match[4] || '0'}`) : NaN;
    const milliseconds = Math.round(seconds * 1000);
    return { valid: validTime(milliseconds), value: milliseconds };
  }

  return {
    get: () => ({ ...state }),
    parseTime,
    setTheme(theme) {
      if (themes.includes(theme)) state.theme = theme;
    },
    setResolutionMode(enabled) {
      state.resolutionMode = enabled === true;
    },
    setTime(name, raw) {
      if (!['current', 'target'].includes(name)) return false;
      const result = parseTime(raw);
      if (result.valid) state[name] = result.value;
      return result.valid;
    },
    isPersonalRecord(elapsed) {
      return state.current !== null && Number.isFinite(elapsed) && elapsed > 0 && Math.round(elapsed / 10) * 10 < state.current;
    },
    save() {
      try { localStorage.setItem(key, JSON.stringify(state)); return true; }
      catch { return false; }
    }
  };
})();
