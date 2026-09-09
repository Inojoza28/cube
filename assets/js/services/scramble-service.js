Cubo.services.scramble = (() => {
let worker=null,workerId=0;
const fallbackFaces=['R','L','U','D','F','B'];
  function makeFallback(){
    const out=[]; let prev='';
    for(let i=0;i<20;i++){
      let f; do { f=fallbackFaces[Math.floor(Math.random()*6)]; } while(f===prev); prev=f;
      out.push(f + (Math.random()<.34 ? '2' : (Math.random()<.5 ? "'" : '')));
    }
    return out.join(' ');
  }
  function makeWorker(){
    if(worker) return worker;
    const url = 'https://unpkg.com/cstimer_module@0.1.5/cstimer_module.js';
    worker = { pending:new Map(), ready:false };
    fetch(url).then(r=>r.text()).then(code=>{
      const blob = new Blob([code], {type:'text/javascript'});
      const w = new Worker(URL.createObjectURL(blob));
      worker.instance = w; worker.ready = true;
      w.onmessage = e=>{ const [id, type, result]=e.data; const resolve=worker.pending.get(id); if(resolve){worker.pending.delete(id); resolve(result);} };
      worker.pending.forEach((resolve,id)=>w.postMessage([id,'scramble',['333']]));
    }).catch(()=>{ worker.failed=true; });
    return worker;
  }
  function wcaScramble(){
    const w=makeWorker();
    return new Promise(resolve=>{
      if(w.failed) return resolve(makeFallback());
      const id=++workerId;
      let settled=false;
      const finish=value=>{
        if(settled) return;
        settled=true;
        w.pending.delete(id);
        resolve(value || makeFallback());
      };
      const send=()=>{
        if(w.instance && !settled) w.instance.postMessage([id,'scramble',['333']]);
      };
      const fallbackTimer=setTimeout(()=>finish(makeFallback()), 1200);
      w.pending.set(id, value=>{ clearTimeout(fallbackTimer); finish(value); });
      if(w.ready) send();
    });
  }
return {makeFallback,wcaScramble};
})();
