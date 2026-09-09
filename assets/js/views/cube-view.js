Cubo.views.createCube = function(getState,actions) {
'use strict';
const {parseSequence} = Cubo.models.cube;
const {onPause,onBack,onRestart,onStop,onContinue,onTogglePausedLook,onNext,onNewSequence,onFreeRotate,onStartClick} = actions;
  const els = {
    input: document.getElementById('seq-input'),
    error: document.getElementById('seq-error'),
    inputPanel: document.getElementById('input-panel'),
    stripPanel: document.getElementById('strip-panel'),
    strip: document.getElementById('strip'),
    statusPanel: document.getElementById('status-panel'),
    moveCurrent: document.getElementById('move-current'),
    moveNext: document.getElementById('move-next'),
    progressBar: document.getElementById('progress-bar'),
    progressLabel: document.getElementById('progress-label'),
    controls: document.getElementById('controls'),
    countdownOverlay: document.getElementById('countdown-overlay'),
    countdownNum: document.getElementById('countdown-num'),
    completeOverlay: document.getElementById('complete-overlay'),
    completeSub: document.getElementById('complete-sub'),
    rotateHint: document.getElementById('rotate-hint'),
    modeSequence: document.getElementById('mode-opt-sequence'),
    modeStep: document.getElementById('mode-opt-step'),
    modeCaption: document.getElementById('mode-caption'),
  };

  const MODE_CAPTIONS = {
    sequence: 'Os movimentos avançam sozinhos; ajuste a velocidade no controle.',
    step: 'Você avança um movimento por vez, no seu ritmo.',
  };

  function paintModeSelect(){
    const {mode} = getState();
    els.modeSequence.setAttribute('aria-checked', String(mode === 'sequence'));
    els.modeStep.setAttribute('aria-checked', String(mode === 'step'));
    els.modeCaption.textContent = MODE_CAPTIONS[mode];
  }
  function buildStrip(){
    const {moves} = getState();
    els.strip.innerHTML = '';
    moves.forEach((m, i)=>{
      const chip = document.createElement('span');
      chip.className = 'chip flex-none px-2 py-1 rounded-md text-[13px] border border-transparent text-faint';
      chip.textContent = m.notation;
      chip.dataset.i = i;
      els.strip.appendChild(chip);
    });
  }

  function updateStrip(){
    const {idx} = getState();
    const chips = els.strip.children;
    for (let i=0;i<chips.length;i++){
      const chip = chips[i];
      chip.classList.remove('bg-ink','text-paper','text-faint','text-ink/40','opacity-40');
      if (i < idx){
        chip.className = 'chip flex-none px-2 py-1 rounded-md text-[13px] border border-transparent text-ink/30';
      } else if (i === idx){
        chip.className = 'chip flex-none px-2 py-1 rounded-md text-[13px] border border-ink bg-ink text-paper';
        chip.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
      } else {
        chip.className = 'chip flex-none px-2 py-1 rounded-md text-[13px] border border-transparent text-muted';
      }
    }
  }

  function updateStatus(){
    const {moves,idx} = getState();
    if (idx >= moves.length){
      els.moveCurrent.textContent = '—';
      els.moveNext.textContent = '';
    } else {
      els.moveCurrent.textContent = moves[idx].notation;
      els.moveNext.textContent = (idx+1 < moves.length) ? ('próximo ' + moves[idx+1].notation) : 'último movimento';
    }
    const total = moves.length;
    const current = Math.min(idx+1, total);
    els.progressLabel.textContent = total ? `${current} de ${total} movimentos` : '';
    const pct = total ? Math.round((idx/total)*100) : 0;
    els.progressBar.style.width = pct + '%';
  }

  function render(){
    const {appState,completionVisible,pausedFreeLook,dragEnabled} = getState();
    // panels
    els.inputPanel.classList.toggle('hidden', appState !== 'input');
    els.countdownOverlay.classList.toggle('hidden', appState !== 'countdown');
    els.countdownOverlay.classList.toggle('flex', appState === 'countdown');
    els.completeOverlay.classList.toggle('hidden', !completionVisible);
    els.completeOverlay.classList.toggle('flex', completionVisible);
    const showRotateHint = dragEnabled && (appState === 'input' || appState === 'free' || (appState === 'paused' && pausedFreeLook));
    els.rotateHint.style.opacity = showRotateHint ? '1' : '0';

    updateStrip();
    updateStatus();
    renderControls();
  }

  function makeBtn(label, onClick, opts){
    opts = opts || {};
    const b = document.createElement('button');
    b.textContent = label;
    let style = 'bg-white text-ink border border-line hover:border-ink/40';
    if (opts.variant === 'primary') style = 'bg-ink text-paper';
    else if (opts.variant === 'stop') style = 'bg-white text-red-600/90 border border-red-200 hover:border-red-300 hover:bg-red-50/60';
    b.className = 'ctl-btn px-4 py-2 rounded-lg text-[13px] font-medium tracking-wide ' + style;
    b.disabled = !!opts.disabled;
    b.addEventListener('click', onClick);
    return b;
  }

  const CONTROL_ICONS = {
    pause: '<rect x="7" y="5" width="3" height="14" rx="1"/><rect x="14" y="5" width="3" height="14" rx="1"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    back: '<path d="M9 7l-5 5 5 5"/><path d="M5 12h8a6 6 0 0 1 6 6"/>',
    restart: '<path d="M4 11a8 8 0 1 1 2.3 6"/><path d="M4 5v6h6"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    unlock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M9 10V7a4 4 0 0 1 7-2.6"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    next: '<path d="M5 5.5v13L15 12z"/><path d="M19 6v12"/>'
  };

  function makeIconBtn(label, icon, onClick, opts){
    opts = opts || {};
    const b = document.createElement('button');
    b.type = 'button';
    let variant = 'bg-transparent text-ink border border-line';
    if (opts.variant === 'primary') variant = 'icon-btn-primary border';
    else if (opts.variant === 'stop') variant = 'icon-btn-stop bg-transparent border';
    b.className = 'icon-btn ' + variant;
    b.disabled = !!opts.disabled;
    b.setAttribute('aria-label', label);
    b.title = label;
    b.innerHTML = `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CONTROL_ICONS[icon]}</svg>`;
    b.addEventListener('click', onClick);
    return b;
  }

  function controlsDivider(){
    const d = document.createElement('span');
    d.className = 'w-px h-5 bg-line mx-0.5 self-center hidden sm:inline-block';
    d.setAttribute('aria-hidden', 'true');
    return d;
  }

  function makeStartBtn(){
    const {inputValid} = getState();
    const parsed = inputValid ? parseSequence(els.input.value) : null;
    const count = parsed && parsed.ok ? parsed.moves.length : 0;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'start-btn w-full min-h-[52px] rounded-xl px-4 sm:px-5 flex items-center justify-between gap-4 bg-ink text-paper text-left';
    b.disabled = !inputValid;
    b.setAttribute('aria-describedby', 'mode-caption');

    const label = document.createElement('span');
    label.className = 'font-medium text-[14px] tracking-wide';
    label.textContent = inputValid ? 'Começar sequência' : 'Digite uma sequência para começar';

    const detail = document.createElement('span');
    detail.className = 'flex items-center gap-2 shrink-0 text-[11px] text-paper/65 tabular-nums';
    if (count){
      const countLabel = document.createElement('span');
      countLabel.className = 'hidden sm:inline';
      countLabel.textContent = `${count} ${count === 1 ? 'movimento' : 'movimentos'}`;
      detail.appendChild(countLabel);
    }
    const arrow = document.createElement('span');
    arrow.className = 'start-arrow text-[18px] leading-none';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    detail.appendChild(arrow);

    b.append(label, detail);
    b.addEventListener('click', onStartClick);
    return b;
  }

  function makeSpeedControl(){
    let {sequenceSpeed} = getState();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'speed-control';
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-live', 'polite');
    button.title = 'Clique para alterar a velocidade da sequência automática';

    const updateLabel = ()=>{
      const label = String(sequenceSpeed).replace('.', ',') + '×';
      button.textContent = label;
      button.setAttribute('aria-label', `Velocidade atual ${label}. Clique para alterar`);
    };
    updateLabel();

    button.addEventListener('click', ()=>{
      
      sequenceSpeed = actions.cycleSpeed();
      button.classList.remove('is-changing');
      void button.offsetWidth;
      button.classList.add('is-changing');
      updateLabel();
    });
    return button;
  }

  function renderControls(){
    const {idx,mode,appState,animating,pausedFreeLook} = getState();
    els.controls.innerHTML = '';
    els.controls.classList.toggle('justify-center', appState !== 'input');
    const canGoBack = idx > 0 && !animating;

    if (appState === 'input'){
      els.controls.appendChild(makeStartBtn());
      return;
    }

    if (appState === 'countdown' || appState === 'animating'){
      return; // sem controles durante a transição/movimento
    }

    if (mode === 'sequence' && (appState === 'playing' || appState === 'paused')){
      els.controls.appendChild(makeSpeedControl());
    }

    if (appState === 'playing'){
      els.controls.appendChild(makeIconBtn('Pausar', 'pause', onPause, { variant:'primary' }));
      els.controls.appendChild(makeIconBtn('Voltar', 'back', onBack, { disabled:!canGoBack }));
      els.controls.appendChild(makeIconBtn('Reiniciar', 'restart', onRestart));
      els.controls.appendChild(makeIconBtn('Parar', 'stop', onStop, { variant:'stop' }));
      return;
    }

    if (appState === 'paused'){
      els.controls.appendChild(makeIconBtn('Continuar', 'play', onContinue, { variant:'primary' }));
      const lookButton = makeIconBtn(pausedFreeLook ? 'Travar cubo' : 'Destravar cubo', pausedFreeLook ? 'unlock' : 'lock', onTogglePausedLook);
      lookButton.setAttribute('aria-pressed', String(pausedFreeLook));
      els.controls.appendChild(lookButton);
      els.controls.appendChild(makeIconBtn('Voltar', 'back', onBack, { disabled:!canGoBack }));
      els.controls.appendChild(makeIconBtn('Reiniciar', 'restart', onRestart));
      els.controls.appendChild(makeIconBtn('Parar', 'stop', onStop, { variant:'stop' }));
      return;
    }

    if (appState === 'step-waiting'){
      els.controls.appendChild(makeIconBtn('Próximo movimento', 'next', onNext, { variant:'primary' }));
      els.controls.appendChild(makeIconBtn('Voltar', 'back', onBack, { disabled:!canGoBack }));
      els.controls.appendChild(makeIconBtn('Reiniciar', 'restart', onRestart));
      els.controls.appendChild(makeIconBtn('Parar', 'stop', onStop, { variant:'stop' }));
      return;
    }

    if (appState === 'completed' || appState === 'free'){
      els.controls.appendChild(makeBtn('Reiniciar', onRestart, { variant:'primary' }));
      els.controls.appendChild(makeBtn('Nova sequência', onNewSequence));
      if (appState === 'completed'){
        els.controls.appendChild(makeBtn('Rotação livre', onFreeRotate));
      }
      return;
    }
  }

return {els,paintModeSelect,buildStrip,updateStatus,render};
};
