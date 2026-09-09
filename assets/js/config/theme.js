// Restore before the first paint, including when opening index.html directly.
document.documentElement.dataset.theme = Cubo.models.settings.get().theme;
document.documentElement.classList.toggle('resolution-mode', Cubo.models.settings.get().resolutionMode);
