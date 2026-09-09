Cubo.models.cube = (() => {
  const SPACING = 1.03;
  const CUBIE_SIZE = 0.94;
  const CUBIE_RADIUS = 0.045;
  const STICKER_SIZE = 0.87;
  const STICKER_RADIUS = 0.095;
  const STICKER_DEPTH = 0.018;
  const MOVE_DURATION = 520;   // ms per quarter/half turn
  const STEP_INTERVAL = 2500;  // ms between move starts in sequence mode
  const COMPLETE_VISIBLE_MS = 3000;
  const COUNTDOWN_MS = 1900;

  const COLORS = {
    U: 0xF7F7F5, // white
    D: 0xFFD84D, // yellow
    F: 0x3FA34D, // green
    B: 0x2F6FED, // blue
    R: 0xE0432B, // red
    L: 0xFF8A1E, // orange
    core: 0x111114
  };

  // face -> {axis, layer, angle(deg) for a CLOCKWISE quarter turn}
  const MOVES = {
    U: { axis: 'y', layer:  1, angle: -90 },
    D: { axis: 'y', layer: -1, angle:  90 },
    R: { axis: 'x', layer:  1, angle: -90 },
    L: { axis: 'x', layer: -1, angle:  90 },
    F: { axis: 'z', layer:  1, angle: -90 },
    B: { axis: 'z', layer: -1, angle:  90 },
  };

  const TOKEN_RE = /^([UDLRFB])(2|'|’)?$/;

  function parseSequence(raw){
    const rawTokens = raw.trim().split(/\s+/).filter(Boolean);
    if (rawTokens.length === 0) return { ok:false, error:'Digite ao menos um movimento.' };
    const moves = [];
    for (let i=0;i<rawTokens.length;i++){
      const tok = rawTokens[i].replace('’',"'");
      const m = TOKEN_RE.exec(tok);
      if (!m){
        return { ok:false, error:`Movimento inválido: "${rawTokens[i]}" (posição ${i+1}). Use letras F B R L U D, sozinhas ou seguidas de ' ou 2.` };
      }
      const face = m[1];
      const suffix = m[2] ? m[2].replace('’',"'") : '';
      const base = MOVES[face];
      let angle = base.angle;
      if (suffix === "'") angle = -angle;
      else if (suffix === '2') angle = angle * 2;
      const notation = face + (suffix === "'" ? '\u2032' : suffix);
      moves.push({ face, suffix, axis: base.axis, layer: base.layer, angle, notation });
    }
    return { ok:true, moves };
  }
  function rotatePos(pos, axis, angleDeg){
    const rad = angleDeg * Math.PI/180;
    const cos = Math.round(Math.cos(rad));
    const sin = Math.round(Math.sin(rad));
    let { x, y, z } = pos;
    if (axis === 'x') return { x, y: y*cos - z*sin, z: y*sin + z*cos };
    if (axis === 'y') return { x: x*cos + z*sin, y, z: -x*sin + z*cos };
    return { x: x*cos - y*sin, y: x*sin + y*cos, z };
  }
  function invertMove(move){
    return { axis: move.axis, layer: move.layer, angle: -move.angle };
  }
return { SPACING,CUBIE_SIZE,CUBIE_RADIUS,STICKER_SIZE,STICKER_RADIUS,STICKER_DEPTH,MOVE_DURATION,STEP_INTERVAL,COMPLETE_VISIBLE_MS,COUNTDOWN_MS,COLORS,parseSequence,rotatePos,invertMove };
})();
