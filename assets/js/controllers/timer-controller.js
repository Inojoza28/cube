Cubo.controllers.initTimer = function(){
  'use strict';
  const view = Cubo.views.createTimer();
  const {tabCube,tabTimer,appTitle,appSubtitle,sectionKicker,sectionBadge,scrambleEl,scrambleBox,scrambleSyncState,scrambleAttempt,copyCurrentScramble,copyIconMarkup,copiedIconMarkup,pad,display,instruction,finishedScramble,finishedScrambleText,copyFinishedScramble,stateBadge,status,startButton,pauseButton,continueButton,finishButton,resetButton,restartResultButton,saveResultButton,newScrambleButton,input,apply,historyEl,setState,resetCopyButtons} = view;
  const {format} = Cubo.models.solves;
  const {makeFallback,wcaScramble} = Cubo.services.scramble;
  let times = Cubo.models.solves.load();
  let scramble = '';
  let scrambleApplied = false;
  let scrambleUsed = false;
  let scrambleAttemptNumber = 1;
  let phase = 'idle';
  let holdTimer = null;
  let activePress = false;
  let spacePressed = false;
  let saveFeedbackTimer = null;
  let prConfirmationTimer = null;
  let runStart = 0;
  let finishedElapsed = 0;
  let raf = null;
  const historyRemoval = Cubo.views.createHistoryRemoval(index => {
    if (phase !== 'idle' || !Number.isInteger(index) || index < 0 || index >= times.length) return;
    const elapsed = times[index];
    historyRemoval.show(index, elapsed, () => {
      if (times[index] !== elapsed) return false;
      const remaining = Cubo.models.solves.removeAt(times, index);
      try { Cubo.models.solves.save(remaining); }
      catch { return false; }
      times = remaining;
      stats();
      return true;
    });
  });

  function setScramble(value){
    scramble = value || makeFallback();
    scrambleApplied = false;
    scrambleUsed = false;
    scrambleAttemptNumber = 1;
    scrambleAttempt.textContent = '1ª tentativa';
    scrambleAttempt.classList.add('is-hidden');
    scrambleEl.textContent = scramble;
    scrambleBox.classList.remove('is-used','is-retry');
    scrambleSyncState.textContent = 'Pronto para aplicar';
    scrambleSyncState.className = 'scramble-sync-state';
    apply.disabled = false;
  }

  function markScrambleUsed(){
    scrambleUsed = true;
    scrambleBox.classList.add('is-used');
    scrambleSyncState.textContent = 'Usado nesta solve — gere um novo';
    scrambleSyncState.className = 'scramble-sync-state is-stale';
    apply.disabled = true;
  }

  function prepareRetry(){
    scrambleAttemptNumber += 1;
    scrambleAttempt.textContent = `${scrambleAttemptNumber}ª tentativa`;
    scrambleAttempt.classList.remove('is-hidden');
    scrambleUsed = false;
    scrambleBox.classList.remove('is-used');
    scrambleBox.classList.add('is-retry');
    scrambleSyncState.textContent = 'Nova tentativa com este scramble';
    scrambleSyncState.className = 'scramble-sync-state is-stale';
    apply.disabled = false;
  }

  function newScramble(){
    resetTimer();
    newScrambleButton.disabled=true;
    newScrambleButton.textContent='Gerando…';
    scrambleEl.textContent='Gerando scramble WCA…';
    status.textContent='Preparando um novo scramble…';
    wcaScramble().then(value=>{
      setScramble(value);
      newScrambleButton.disabled=false;
      newScrambleButton.textContent='Novo scramble';
      status.textContent='Novo scramble pronto — aplique-o no cubo antes de resolver';
    });
  }
  function stats(){ view.stats(times); }
  function save(){ Cubo.models.solves.save(times); stats(); }
  function currentElapsed(){ return phase === 'running' ? performance.now() - runStart : 0; }
  function tick(){ if(phase!=='running') return; display.textContent=format(currentElapsed()); raf=requestAnimationFrame(tick); }

  function resetTimer(){
    clearTimeout(prConfirmationTimer);
    prConfirmationTimer = null;
    Cubo.controllers.settings.clearFeedback();
    if(raf) cancelAnimationFrame(raf);
    if(holdTimer) clearTimeout(holdTimer);
    raf = null;
    holdTimer=null; activePress=false; spacePressed=false; finishedElapsed=0; phase='idle'; display.textContent='0.00'; status.textContent='';
    finishedScramble.hidden=true; finishedScrambleText.textContent='';
    resetCopyButtons();
    display.classList.remove('running','error'); setState('idle');
  }
  function beginHold(){
    if(phase==='running'){ finishTimer(); return; }
    if(phase==='finished') return;
    if(phase!=='idle' || activePress) return;
    clearTimeout(prConfirmationTimer);
    prConfirmationTimer = null;
    activePress=true; phase='holding'; display.textContent='0.00'; status.textContent=''; setState('holding');
    holdTimer=setTimeout(()=>{
      holdTimer=null;
      if(activePress && phase==='holding'){ phase='ready'; setState('ready'); }
    }, 550);
  }
  function releaseHold(){
    if(!activePress) return;
    activePress=false;
    if(holdTimer){ clearTimeout(holdTimer); holdTimer=null; }
    if(phase==='holding'){ phase='idle'; setState('idle'); return; }
    if(phase==='ready') startTimer();
  }
  function startTimer(){
    resetCopyButtons();
    phase='running'; runStart=performance.now(); display.textContent='0.00'; status.textContent='';
    display.classList.add('running'); setState('running'); tick();
  }
  function finishTimer(){
    if(phase!=='running') return;
    resetCopyButtons();
    const elapsed=Math.round(currentElapsed()); if(raf)cancelAnimationFrame(raf); raf=null;
    phase='finished'; finishedElapsed=elapsed;
    finishedScrambleText.textContent=scramble || 'Scramble indisponível';
    finishedScramble.hidden=false;
    markScrambleUsed();
    display.textContent=format(elapsed); display.classList.remove('running'); status.textContent=''; setState('finished');
    Cubo.controllers.settings.onSolveFinished(elapsed);
  }
  resetButton.addEventListener('click',resetTimer);
  restartResultButton.addEventListener('click',()=>{ resetTimer(); prepareRetry(); });
  async function copyScramble(button, label){
    if(!scramble) return;
    try {
      if(navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(scramble);
      } else {
        const helper=document.createElement('textarea');
        helper.value=scramble; helper.setAttribute('readonly','');
        helper.style.position='fixed'; helper.style.opacity='0';
        document.body.appendChild(helper); helper.select();
        document.execCommand('copy'); helper.remove();
      }
      button.classList.add('is-copied');
      button.innerHTML=copiedIconMarkup;
      button.setAttribute('aria-label',`Scramble ${label} copiado`);
      button.title='Copiado';
      setTimeout(()=>{
        button.classList.remove('is-copied');
        button.innerHTML=copyIconMarkup;
        button.setAttribute('aria-label',label);
        button.title=label;
      }, 1400);
    } catch {
      status.textContent='Não foi possível copiar automaticamente';
    }
  }
  copyCurrentScramble.addEventListener('click',()=>copyScramble(copyCurrentScramble,'Copiar scramble atual'));
  copyFinishedScramble.addEventListener('click',()=>copyScramble(copyFinishedScramble,'Copiar scramble da solve'));
  [copyCurrentScramble, copyFinishedScramble].forEach(button=>{
    button.addEventListener('pointerdown',event=>event.stopPropagation());
    button.addEventListener('pointerup',event=>event.stopPropagation());
  });
  saveResultButton.addEventListener('click',()=>{
    if(phase!=='finished' || !finishedElapsed || saveResultButton.disabled) return;
    const savedElapsed = finishedElapsed;
    times.push(finishedElapsed); save();
    saveResultButton.disabled=true;
    saveResultButton.textContent='Salvo';
    clearTimeout(saveFeedbackTimer);
    saveFeedbackTimer=setTimeout(()=>{
      saveResultButton.disabled=false;
      saveResultButton.textContent='Salvar tempo';
      resetTimer();
      scrambleAttempt.classList.add('is-hidden');
      scrambleSyncState.textContent='Solve salva — gere um novo scramble';
      scrambleSyncState.className='scramble-sync-state is-stale';
      prConfirmationTimer = setTimeout(() => {
        prConfirmationTimer = null;
        if (phase !== 'idle' || document.hidden || !document.body.classList.contains('timer-mode') || document.querySelector('dialog[open]')) return;
        Cubo.controllers.settings.onSolveSaved(savedElapsed);
      }, 500);
    }, 280);
  });
  pad.addEventListener('pointerdown',e=>{
    if(e.button!==undefined && e.button!==0) return;
    e.preventDefault();
    pad.setPointerCapture?.(e.pointerId);
    beginHold();
  });
  pad.addEventListener('pointerup',e=>{ e.preventDefault(); releaseHold(); });
  pad.addEventListener('pointercancel',releaseHold);
  window.addEventListener('keydown', e=>{
    if(!document.body.classList.contains('timer-mode') || e.code!=='Space') return;
    e.preventDefault();
    if(spacePressed) return;
    spacePressed=true;
    if(phase==='running') finishTimer();
    else beginHold();
  });
  window.addEventListener('keydown',e=>{
    if(e.code !== 'Enter' || phase !== 'finished' || e.repeat) return;
    e.preventDefault();
    saveResultButton.click();
  });
  window.addEventListener('keyup',e=>{
    if(document.body.classList.contains('timer-mode') && e.code==='Space'){
      e.preventDefault();
      if(!spacePressed) return;
      spacePressed=false;
      releaseHold();
    }
  });
  function cancelPreparation(){
    spacePressed=false;
    if(phase==='holding' || phase==='ready') resetTimer();
  }
  window.addEventListener('blur',cancelPreparation);
  document.addEventListener('visibilitychange',()=>{ if(document.hidden) cancelPreparation(); });
  newScrambleButton.addEventListener('click',newScramble);
  apply.addEventListener('click',()=>{
    if(!scramble || scrambleUsed || apply.disabled) return;
    apply.disabled=true;
    apply.classList.add('applied');
    const originalLabel=apply.textContent;
    apply.textContent='Aplicado';
    scrambleApplied = true;
    scrambleSyncState.textContent = 'Aplicado no cubo';
    scrambleSyncState.className = 'scramble-sync-state is-applied';
    window.dispatchEvent(new CustomEvent('scramble:apply',{ detail:{ value:scramble } }));
    setTimeout(()=>{
      apply.disabled=false;
      apply.classList.remove('applied');
      apply.textContent=originalLabel;
      tabCube.click();
    }, 180);
  });
  document.getElementById('clear-times').addEventListener('click',()=>{
    if(!times.length || !window.confirm('Apagar todos os tempos do histórico?')) return;
    times=[]; save(); resetTimer(); status.textContent='Histórico limpo';
  });
  function select(mode){
    const timer=mode==='timer';
    if (!timer) {
      clearTimeout(prConfirmationTimer);
      prConfirmationTimer = null;
    }
    if(!timer && phase==='running') finishTimer();
    document.body.classList.toggle('timer-mode',timer);
    tabCube.setAttribute('aria-selected',String(!timer));
    tabTimer.setAttribute('aria-selected',String(timer));

    const context = timer ? {
      title:'Cubo Timer',
      subtitle:'Cronometre suas solves com foco, clareza e ritmo.',
      kicker:'Treino de cubo mágico',
      badge:'WCA 3×3',
      documentTitle:'Cubo Timer · WCA 3×3'
    } : {
      title:'Cubo Embaralhado',
      subtitle:'Visualize e acompanhe cada movimento no seu cubo físico.',
      kicker:'Visualizador de scramble',
      badge:'CUBO 3×3',
      documentTitle:'Cubo Embaralhado'
    };
    appTitle.textContent=context.title;
    appSubtitle.textContent=context.subtitle;
    sectionKicker.textContent=context.kicker;
    sectionBadge.textContent=context.badge;
    document.title=context.documentTitle;

    if(timer){stats();if(!scramble)newScramble();}
  }
  tabCube.addEventListener('click',()=>select('cube')); tabTimer.addEventListener('click',()=>select('timer'));
  stats();
  setState('idle');
  select('timer');
};
