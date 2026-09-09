Cubo.views.createPrConfirm = function() {
  'use strict';
  const dialog = document.getElementById('pr-confirm-dialog');
  let onAccept = null;

  document.getElementById('pr-confirm-add').addEventListener('click', () => {
    if (!onAccept) return;
    const accept = onAccept;
    onAccept = null;
    accept();
    dialog.close();
  });
  document.getElementById('pr-confirm-no').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    onAccept = null;
    document.getElementById('timer-pad').focus({ preventScroll: true });
  });
  // Let Enter/Space operate the modal buttons without reaching timer shortcuts.
  for (const type of ['keydown', 'keyup']) dialog.addEventListener(type, event => event.stopPropagation());

  return {
    show(elapsed, accept) {
      if (dialog.open) return;
      onAccept = accept;
      document.getElementById('pr-confirm-time').textContent = `${(elapsed / 1000).toFixed(2)} s`;
      dialog.showModal();
    }
  };
};
