Cubo.views.createCubeReturn = function() {
  'use strict';
  const panel = document.getElementById('cube-return');
  const seconds = document.getElementById('cube-return-seconds');
  const unit = document.getElementById('cube-return-unit');
  const progress = document.getElementById('cube-return-progress');
  return {
    show() {
      seconds.textContent = '5';
      unit.textContent = 'segundos';
      progress.style.transform = 'scaleX(1)';
      panel.hidden = false;
    },
    update(value, fraction) {
      if (seconds.textContent !== String(value)) {
        seconds.textContent = String(value);
        unit.textContent = value === 1 ? 'segundo' : 'segundos';
      }
      progress.style.transform = `scaleX(${fraction})`;
    },
    hide() {
      if (panel.contains(document.activeElement)) document.getElementById('tab-cube').focus({ preventScroll: true });
      panel.hidden = true;
    },
    bind(actions) {
      document.getElementById('cube-return-stay').addEventListener('click', actions.stay);
      document.getElementById('cube-return-now').addEventListener('click', actions.go);
      panel.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); actions.stay(); }
        event.stopPropagation();
      });
      panel.addEventListener('keyup', event => event.stopPropagation());
    }
  };
};
