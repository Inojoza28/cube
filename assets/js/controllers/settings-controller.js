Cubo.controllers.initSettings = function() {
  'use strict';
  const model = Cubo.models.settings;
  const view = Cubo.views.createSettings();
  const prConfirm = Cubo.views.createPrConfirm();
  const update = () => {
    view.render(model.get());
    view.persistence(model.save());
  };

  view.bind({
    theme(value) { model.setTheme(value); update(); },
    resolutionMode(enabled) { model.setResolutionMode(enabled); update(); },
    time(name, value) {
      const valid = model.setTime(name, value);
      view.validation(name, valid);
      if (valid) update();
    },
    blur(name) { view.normalize(name, model.get()[name]); }
  });
  view.populate(model.get());
  view.render(model.get());

  Cubo.controllers.settings = {
    clearFeedback: view.clearFeedback,
    onSolveFinished(elapsed) {
      view.clearFeedback();
      if (model.isPersonalRecord(elapsed)) view.showFeedback();
    },
    onSolveSaved(elapsed) {
      const time = (elapsed / 1000).toFixed(2);
      if (!model.isPersonalRecord(elapsed) || !model.parseTime(time).valid) return;
      prConfirm.show(elapsed, () => {
        if (!model.isPersonalRecord(elapsed)) return;
        model.setTime('current', time);
        view.populate(model.get());
        view.validation('current', true);
        update();
      });
    }
  };
};
