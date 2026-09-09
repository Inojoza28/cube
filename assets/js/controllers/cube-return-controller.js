Cubo.controllers.createCubeReturn = function(isComplete) {
  'use strict';
  const view = Cubo.views.createCubeReturn();
  const delay = 1500;
  const duration = 5000;
  let timeout = null;
  let deadline = 0;

  function cancel() {
    clearTimeout(timeout);
    timeout = null;
    deadline = 0;
    view.hide();
  }

  function canReturn() {
    return isComplete() && !document.hidden && !document.body.classList.contains('timer-mode') && !document.getElementById('settings-dialog').open;
  }

  function goToTimer() {
    const allowed = canReturn();
    cancel();
    if (!allowed) return;
    // Use the existing tab action; this never starts or resets a solve.
    document.getElementById('tab-timer').click();
    document.getElementById('timer-pad').focus({ preventScroll: true });
  }

  function tick() {
    if (!canReturn()) { cancel(); return; }
    const remaining = Math.max(0, deadline - performance.now());
    if (remaining === 0) { goToTimer(); return; }
    view.update(Math.ceil(remaining / 1000), remaining / duration);
    timeout = setTimeout(tick, Math.min(100, remaining));
  }

  view.bind({ stay: cancel, go: goToTimer });
  document.getElementById('tab-timer').addEventListener('click', cancel);
  document.getElementById('open-settings').addEventListener('click', cancel);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });

  return {
    cancel,
    start() {
      cancel();
      if (!canReturn()) return;
      timeout = setTimeout(() => {
        if (!canReturn()) { cancel(); return; }
        deadline = performance.now() + duration;
        view.show();
        tick();
      }, delay);
    }
  };
};
