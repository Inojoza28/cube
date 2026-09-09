Cubo.views.createTimer = function() {
'use strict';
const {format}=Cubo.models.solves;
  const tabCube = document.getElementById('tab-cube');
  const tabTimer = document.getElementById('tab-timer');
  const appTitle = document.getElementById('app-title');
  const appSubtitle = document.getElementById('app-subtitle');
  const sectionKicker = document.getElementById('section-kicker');
  const sectionBadge = document.getElementById('section-badge');
  const scrambleEl = document.getElementById('timer-scramble');
  const scrambleBox = document.querySelector('.scramble-box');
  const scrambleSyncState = document.getElementById('scramble-sync-state');
  const scrambleAttempt = document.getElementById('scramble-attempt');
  const copyCurrentScramble = document.getElementById('copy-current-scramble');
  const copyIconMarkup = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path></svg>';
  const copiedIconMarkup = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>';
  const pad = document.getElementById('timer-pad');
  const display = document.getElementById('timer-display');
  const instruction = document.getElementById('timer-instruction');
  const finishedScramble = document.getElementById('finished-scramble');
  const finishedScrambleText = document.getElementById('finished-scramble-text');
  const copyFinishedScramble = document.getElementById('copy-finished-scramble');
  const stateBadge = document.getElementById('timer-state');
  const status = document.getElementById('timer-status');
  const startButton = document.getElementById('timer-start');
  const pauseButton = document.getElementById('timer-pause');
  const continueButton = document.getElementById('timer-continue');
  const finishButton = document.getElementById('timer-finish');
  const resetButton = document.getElementById('timer-reset');
  const restartResultButton = document.getElementById('timer-restart');
  const saveResultButton = document.getElementById('timer-save');
  const newScrambleButton = document.getElementById('new-scramble');
  const input = document.getElementById('seq-input');
  const apply = document.getElementById('apply-scramble');
  const historyEl = document.getElementById('timer-history');

  function stats(times){
    const {best,ao5}=Cubo.models.solves.summarize(times);
    document.getElementById('clear-times').hidden = !times.length;
    document.getElementById('stat-best').textContent=best===null?'—':format(best);
    document.getElementById('stat-ao5').textContent=ao5===null?'—':format(ao5);
    document.getElementById('stat-count').textContent=String(times.length);
    historyEl.innerHTML='<div class="history-title"><span>Histórico:</span></div>' + (times.slice().reverse().map((t,i)=>`<div class="history-row"><span>#${times.length-i}</span><strong>${format(t)} s</strong></div>`).join('') || '<p class="text-[12px] text-muted py-3 text-center">Seus tempos aparecerão aqui.</p>');
  }
  function setState(kind){
    document.body.classList.toggle('timer-running', kind==='running');
    document.body.classList.toggle('timer-holding', kind==='holding' || kind==='ready');
    document.body.classList.toggle('timer-finished', kind==='finished');
    stateBadge.className='timer-state '+kind;
    stateBadge.textContent=kind==='running'?'Cronometrando':kind==='finished'?'Finalizado':'Pronto';
    pad.classList.toggle('running',kind==='running');
    pad.classList.toggle('holding',kind==='holding');
    pad.classList.toggle('ready',kind==='ready');
    display.classList.toggle('ready',kind==='ready');
    startButton.hidden = true;
    pauseButton.hidden = true;
    continueButton.hidden = true;
    finishButton.hidden = true;
    resetButton.hidden = true;
    resetButton.classList.toggle('result-action',kind==='finished');
    resetButton.textContent = kind==='finished' ? 'Preparar próximo' : '↻';
    resetButton.setAttribute('aria-label',kind==='finished'?'Preparar próximo tempo':'Reiniciar cronômetro');
    instruction.textContent = kind==='running'?'Pressione Espaço para finalizar':kind==='holding'?'Continue segurando':kind==='ready'?'Solte para iniciar':kind==='finished'?'Solve finalizada · Enter salva':'Segure Espaço para preparar';
    pad.setAttribute('aria-label',instruction.textContent);
  }
  function resetCopyButtons(){
    copyFinishedScramble.classList.remove('is-copied');
    copyFinishedScramble.innerHTML=copyIconMarkup;
    copyFinishedScramble.setAttribute('aria-label','Copiar scramble da solve');
    copyFinishedScramble.title='Copiar scramble da solve';
    copyCurrentScramble.classList.remove('is-copied');
    copyCurrentScramble.innerHTML=copyIconMarkup;
    copyCurrentScramble.setAttribute('aria-label','Copiar scramble atual');
    copyCurrentScramble.title='Copiar scramble atual';
  }
return {tabCube,tabTimer,appTitle,appSubtitle,sectionKicker,sectionBadge,scrambleEl,scrambleBox,scrambleSyncState,scrambleAttempt,copyCurrentScramble,copyIconMarkup,copiedIconMarkup,pad,display,instruction,finishedScramble,finishedScrambleText,copyFinishedScramble,stateBadge,status,startButton,pauseButton,continueButton,finishButton,resetButton,restartResultButton,saveResultButton,newScrambleButton,input,apply,historyEl,stats,setState,resetCopyButtons};
};
