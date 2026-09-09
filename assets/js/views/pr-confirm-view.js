Cubo.views.createPrConfirm = function() {
  'use strict';
  const dialog = document.getElementById('pr-confirm-dialog');
  let onAccept = null;
  let confetti = null;
  let confettiTimer = null;

  function clearConfetti() {
    clearTimeout(confettiTimer);
    confettiTimer = null;
    confetti?.remove();
    confetti = null;
  }

  function celebrate() {
    clearConfetti();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    confetti = document.createElement('span');
    confetti.className = 'pr-confetti';
    confetti.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 56; i++) {
      const piece = document.createElement('span');
      piece.className = 'pr-confetti-piece';
      const direction = i % 2 ? 1 : -1;
      piece.style.left = direction > 0 ? '58%' : '42%';
      piece.style.setProperty('--confetti-x', `${direction * (30 + Math.random() * 160)}px`);
      piece.style.setProperty('--confetti-y', `${-dialog.clientHeight * (.6 + Math.random() * .45)}px`);
      piece.style.setProperty('--confetti-turn', `${direction * (540 + Math.random() * 900)}deg`);
      piece.style.setProperty('--confetti-color', `var(--celebration-${i % 4})`);
      piece.style.animationDuration = `${950 + Math.random() * 600}ms`;
      piece.style.animationDelay = `${(i < 28 ? 0 : 120) + Math.random() * 60}ms`;
      confetti.appendChild(piece);
    }
    dialog.appendChild(confetti);
    confettiTimer = setTimeout(clearConfetti, 1900);
  }

  document.getElementById('pr-confirm-add').addEventListener('click', () => {
    if (!onAccept) return;
    const accept = onAccept;
    onAccept = null;
    accept();
    dialog.close();
  });
  document.getElementById('pr-confirm-no').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    clearConfetti();
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
      celebrate();
    }
  };
};
