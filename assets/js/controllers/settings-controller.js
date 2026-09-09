Cubo.controllers.initSettings = function() {
  'use strict';
  const model = Cubo.models.settings;
  const view = Cubo.views.createSettings();
  const update = () => {
    view.render(model.get());
    view.persistence(model.save());
  };

  view.bind({
    theme(value) { model.setTheme(value); update(); },
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
    }
  };
};
