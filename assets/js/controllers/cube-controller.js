Cubo.controllers.initCube = function() {
'use strict';
const {parseSequence,invertMove,STEP_INTERVAL,COMPLETE_VISIBLE_MS,COUNTDOWN_MS} = Cubo.models.cube;
  function waitForNextMove(startTime, isCanceled){
    return new Promise(resolve=>{
      const check = ()=>{
        if (isCanceled() || performance.now() - startTime >= STEP_INTERVAL / sequenceSpeed){
          resolve();
          return;
        }
        setTimeout(check, 32);
      };
      check();
    });
  }
  let moves = [];
  let idx = 0;
  let mode = 'sequence'; // 'sequence' | 'step'
  let appState = 'input'; // input | aligning | countdown | playing | paused | step-waiting | animating | completed | free
  let animating = false;
  let playToken = 0; // increments to cancel stale playback loops
  let inputValid = false;
  let completionVisible = false;
  let completionTimer = null;
  let pausedFreeLook = false;
  let sequenceSpeed = 1;
  const SPEED_OPTIONS = [1, 1.5, 2];
  const FIRST_MOVE_DELAY_MS = 1000;
  const timerReturn = Cubo.controllers.createCubeReturn(() => appState === 'completed');

  const scene = Cubo.views.createCubeScene();
  const {rebuildSolvedCube,playMove,setDragEnabled,resetOrientation} = scene;
  const view = Cubo.views.createCube(
    ()=>({moves,idx,mode,appState,animating,inputValid,completionVisible,pausedFreeLook,sequenceSpeed,dragEnabled:scene.isDragEnabled()}),
    {onPause,onBack,onRestart,onStop,onContinue,onTogglePausedLook,onNext,onNewSequence,onFreeRotate,onStartClick,cycleSpeed:()=>{sequenceSpeed=SPEED_OPTIONS[(SPEED_OPTIONS.indexOf(sequenceSpeed)+1)%SPEED_OPTIONS.length]; return sequenceSpeed;}}
  );
  const {els,paintModeSelect,buildStrip,updateStatus,render} = view;

  function clearCompletion(){
    timerReturn.cancel();
    completionVisible = false;
    if (completionTimer){
      clearTimeout(completionTimer);
      completionTimer = null;
    }
  }

  function setAppState(s){
    if (s !== 'completed') timerReturn.cancel();
    appState = s;
    render();
  }

  els.modeSequence.addEventListener('click', ()=>{ mode = 'sequence'; paintModeSelect(); render(); });
  els.modeStep.addEventListener('click', ()=>{ mode = 'step'; paintModeSelect(); render(); });
  paintModeSelect();

  els.input.addEventListener('input', ()=>{
    const v = els.input.value;
    if (!v.trim()){
      inputValid = false;
      els.error.classList.add('hidden');
      render();
      return;
    }
    const result = parseSequence(v);
    if (result.ok){
      els.error.classList.add('hidden');
      inputValid = true;
    } else {
      els.error.textContent = result.error;
      els.error.classList.remove('hidden');
      inputValid = false;
    }
    render();
  });

  window.addEventListener('scramble:apply', event=>{
    const value = event.detail && event.detail.value;
    if (!value) return;
    playToken++;
    clearCompletion();
    pausedFreeLook = false;
    rebuildSolvedCube();
    scene.resetRotation();
    moves = [];
    idx = 0;
    els.input.value = value;
    const result = parseSequence(value);
    inputValid = result.ok;
    if (result.ok){
      moves = result.moves;
      buildStrip();
      els.stripPanel.classList.remove('hidden');
      els.statusPanel.classList.remove('hidden');
      els.error.classList.add('hidden');
    } else {
      els.error.textContent = result.error;
      els.error.classList.remove('hidden');
      els.stripPanel.classList.add('hidden');
      els.statusPanel.classList.add('hidden');
    }
    setDragEnabled(true);
    setAppState('input');
  });

  els.input.addEventListener('keydown', e=>{
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && inputValid){
      e.preventDefault();
      onStartClick();
    }
  });

  function onStartClick(){
    const result = parseSequence(els.input.value);
    if (!result.ok) return;
    moves = result.moves;
    idx = 0;
    buildStrip();
    els.stripPanel.classList.remove('hidden');
    els.statusPanel.classList.remove('hidden');
    setDragEnabled(false);
    beginCountdown();
  }

  /* ---- actions ---- */
  function onPause(){
    pausedFreeLook = false;
    setDragEnabled(false);
    setAppState('paused');
  }
  function onTogglePausedLook(){
    pausedFreeLook = !pausedFreeLook;
    setDragEnabled(pausedFreeLook);
    render();
  }
  async function onContinue(){
    if (animating) return;
    pausedFreeLook = false;
    setDragEnabled(false);
    animating = true;
    setAppState('animating');
    await resetOrientation(480);
    animating = false;
    setAppState('playing');
    runSequenceLoop();
  }
  async function onNext(){
    if (animating || idx >= moves.length) return;
    animating = true; setAppState('animating');
    await playMove(moves[idx]);
    idx++;
    animating = false;
    if (idx >= moves.length){ onComplete(); }
    else { setAppState('step-waiting'); }
  }
  async function onBack(){
    if (animating || idx <= 0) return;
    pausedFreeLook = false;
    setDragEnabled(false);
    animating = true; setAppState('animating');
    await resetOrientation(380);
    await playMove(invertMove(moves[idx-1]));
    idx--;
    animating = false;
    setAppState(mode === 'sequence' ? 'paused' : 'step-waiting');
  }
  function onRestart(){
    playToken++; // cancel any running loop
    clearCompletion();
    pausedFreeLook = false;
    rebuildSolvedCube();
    scene.resetRotation();
    idx = 0;
    beginCountdown();
  }
  function onStop(){
    playToken++;
    clearCompletion();
    pausedFreeLook = false;
    rebuildSolvedCube();
    scene.resetRotation();
    idx = 0;
    els.stripPanel.classList.add('hidden');
    els.statusPanel.classList.add('hidden');
    setDragEnabled(true);
    setAppState('input');
  }
  function onNewSequence(){
    playToken++;
    clearCompletion();
    pausedFreeLook = false;
    rebuildSolvedCube();
    scene.resetRotation();
    moves = []; idx = 0;
    els.input.value = '';
    inputValid = false;
    els.error.classList.add('hidden');
    els.stripPanel.classList.add('hidden');
    els.statusPanel.classList.add('hidden');
    setDragEnabled(true);
    setAppState('input');
  }
  function onFreeRotate(){
    setDragEnabled(true);
    setAppState('free');
  }
  function onComplete(){
    els.completeSub.textContent = moves.length + ' movimentos realizados';
    setDragEnabled(false);
    clearCompletion();
    completionVisible = true;
    setAppState('completed');
    timerReturn.start();
    completionTimer = setTimeout(()=>{
      completionVisible = false;
      completionTimer = null;
      render();
    }, COMPLETE_VISIBLE_MS);
  }

  async function beginCountdown(){
    setDragEnabled(false);
    setAppState('aligning');
    await resetOrientation(480);
    setAppState('countdown');
    const start = performance.now();

    function frame(now){
      const elapsed = now - start;
      els.countdownNum.textContent = elapsed < 950 ? '2' : (elapsed < COUNTDOWN_MS ? '1' : '');
      if (elapsed < COUNTDOWN_MS){
        requestAnimationFrame(frame);
      } else {
        beginPlayback();
      }
    }
    requestAnimationFrame(frame);
  }

  function beginPlayback(){
    updateStatus();
    if (mode === 'sequence'){
      setAppState('playing');
      runSequenceLoop();
    } else {
      setAppState('step-waiting');
    }
  }

  async function runSequenceLoop(){
    // A fresh token prevents an older start/resume delay from playing a move.
    const token = ++playToken;
    await new Promise(resolve => setTimeout(resolve, FIRST_MOVE_DELAY_MS));
    while (appState === 'playing' && idx < moves.length && token === playToken){
      const t0 = performance.now();
      animating = true;
      await playMove(moves[idx]);
      animating = false;
      if (token !== playToken) return;
      idx++;
      if (idx >= moves.length){ onComplete(); return; }
      render();
      if (appState !== 'playing') return;
      await waitForNextMove(t0, ()=> appState !== 'playing' || token !== playToken);
    }
  }

  render();

};
