Cubo.views.createHistoryRemoval = function(onSelect) {
  'use strict';
  const history = document.getElementById('timer-history');
  const dialog = document.getElementById('history-remove-dialog');
  const error = document.getElementById('history-remove-error');
  let selectedIndex = null;
  let confirm = null;

  history.addEventListener('click', event => {
    const row = event.target.closest('[data-solve-index]');
    if (row && history.contains(row)) onSelect(Number(row.dataset.solveIndex));
  });
  // Keep keyboard activation on history rows and modal buttons out of timer shortcuts.
  for (const type of ['keydown', 'keyup']) {
    history.addEventListener(type, event => {
      if (event.code === 'Space' || event.code === 'Enter') event.stopPropagation();
    });
    dialog.addEventListener(type, event => event.stopPropagation());
  }
  document.getElementById('history-remove-cancel').addEventListener('click', () => dialog.close());
  document.getElementById('history-remove-confirm').addEventListener('click', () => {
    if (!confirm) return;
    if (confirm()) { confirm = null; dialog.close(); }
    else error.textContent = 'Não foi possível remover o tempo. Tente novamente.';
  });
  dialog.addEventListener('close', () => {
    confirm = null;
    const next = history.querySelector(`[data-solve-index="${selectedIndex}"]`) || history.querySelector('[data-solve-index]') || document.getElementById('timer-pad');
    next.focus({ preventScroll: true });
    selectedIndex = null;
  });

  return {
    show(index, elapsed, onConfirm) {
      if (dialog.open) return;
      selectedIndex = index;
      confirm = onConfirm;
      error.textContent = '';
      document.getElementById('history-remove-time').textContent = `#${index + 1} · ${Cubo.models.solves.format(elapsed)} s`;
      dialog.showModal();
    }
  };
};
