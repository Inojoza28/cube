Cubo.views.createSettings = function() {
  'use strict';
  const byId = id => document.getElementById(id);
  const dialog = byId('settings-dialog');
  const openButton = byId('open-settings');
  const editButton = byId('edit-pr');
  const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];
  const fields = Object.fromEntries(['current', 'target'].map(name => [name, byId(`pr-${name}`)]));
  let returnFocus = openButton;
  let feedbackTimeout;
  const formatInput = value => value === null ? '' : (value / 1000).toFixed(2).replace('.', ',');

  function render(settings) {
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.classList.toggle('resolution-mode', settings.resolutionMode);
    byId('resolution-mode').checked = settings.resolutionMode;
    document.querySelector('meta[name="theme-color"]').content = { light: '#F2F4F3', black: '#111315', blue: '#101e32' }[settings.theme];
    themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === settings.theme)));
    byId('pr-card').hidden = settings.current === null && settings.target === null;
    for (const name of ['current', 'target']) {
      byId(`pr-${name}-item`).hidden = settings[name] === null;
      const value = settings[name];
      const minutes = Math.floor(value / 60000);
      const seconds = ((value % 60000) / 1000).toFixed(2);
      byId(`pr-${name}-value`).textContent = value === null ? '' : minutes ? `${minutes}:${seconds.padStart(5, '0')}` : seconds;
      byId(`pr-${name}-unit`).textContent = minutes ? 'min' : 's';
    }
  }

  function open(source, focusField) {
    returnFocus = source;
    dialog.showModal();
    if (focusField) fields[focusField].focus();
  }

  function clearFeedback() {
    clearTimeout(feedbackTimeout);
    byId('pr-feedback').hidden = true;
  }

  return {
    render,
    clearFeedback,
    showFeedback() {
      clearFeedback();
      byId('pr-feedback').hidden = false;
      feedbackTimeout = setTimeout(clearFeedback, 2400);
    },
    populate(settings) {
      for (const name of ['current', 'target']) fields[name].value = formatInput(settings[name]);
    },
    normalize(name, value) {
      if (fields[name].getAttribute('aria-invalid') !== 'true') fields[name].value = formatInput(value);
    },
    validation(name, valid) {
      fields[name].setAttribute('aria-invalid', String(!valid));
      byId(`pr-${name}-error`).textContent = valid ? '' : 'Informe um tempo entre 0,01 e 59:59,99, com até duas casas decimais.';
    },
    persistence(saved) {
      byId('settings-storage-status').textContent = saved
        ? 'Preferências salvas automaticamente neste navegador.'
        : 'Preferências aplicadas. O navegador não permitiu salvá-las para a próxima visita.';
    },
    bind(actions) {
      byId('resolution-mode').addEventListener('change', event => actions.resolutionMode(event.target.checked));
      openButton.addEventListener('click', () => open(openButton));
      for (const type of ['keydown', 'keyup']) openButton.addEventListener(type, event => {
        if (event.code === 'Space' || event.code === 'Enter') event.stopPropagation();
      });
      editButton.addEventListener('click', () => open(editButton, 'target'));
      byId('close-settings').addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => (returnFocus.closest('[hidden]') ? openButton : returnFocus).focus());
      dialog.addEventListener('click', event => {
        const bounds = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
      });
      // Prevent the timer's global shortcuts from handling input inside the modal.
      for (const type of ['keydown', 'keyup']) dialog.addEventListener(type, event => event.stopPropagation());
      themeButtons.forEach(button => button.addEventListener('click', () => actions.theme(button.dataset.themeChoice)));
      for (const name of ['current', 'target']) {
        fields[name].addEventListener('input', () => actions.time(name, fields[name].value));
        fields[name].addEventListener('blur', () => actions.blur(name));
      }
    }
  };
};
