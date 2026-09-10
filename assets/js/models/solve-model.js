Cubo.models.solves = (() => {
  'use strict';
  const key = 'cubo-embaralhado-times-v1';
  const format = ms => (ms / 1000).toFixed(2);

  return {
    format,
    load() {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(data) ? data.filter(value => Number.isFinite(value) && value > 0) : [];
      } catch {
        return [];
      }
    },
    save(times) {
      localStorage.setItem(key, JSON.stringify(times));
    },
    removeAt(times, index) {
      if (!Number.isInteger(index) || index < 0 || index >= times.length) return times;
      return times.filter((_, position) => position !== index);
    },
    summarize(times) {
      const last5 = times.slice(-5);
      return {
        best: times.length ? Math.min(...times) : null,
        ao5: last5.length === 5 ? last5.reduce((a, b) => a + b, 0) / 5 : null
      };
    }
  };
})();
