Cubo.views.createCubeScene = function() {
'use strict';
const {SPACING,CUBIE_SIZE,CUBIE_RADIUS,STICKER_SIZE,STICKER_RADIUS,STICKER_DEPTH,MOVE_DURATION,COLORS,rotatePos} = Cubo.models.cube;
  function easeInOutQuad(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }
  function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
  const canvas = document.getElementById('cube-canvas');
  const wrap = document.getElementById('cube-wrap');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(4.4, 3.6, 5.3);
  camera.lookAt(0,0,0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  scene.add(new THREE.AmbientLight(0xffffff, 0.72));
  const key = new THREE.DirectionalLight(0xffffff, 0.55);
  key.position.set(5, 8, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.28);
  fill.position.set(-6, -3, -4);
  scene.add(fill);

  const orientationGroup = new THREE.Group(); // user free-look / reset-to-standard
  const cubeGroup = new THREE.Group();        // holds the 27 cubies, logical solve state
  orientationGroup.add(cubeGroup);
  scene.add(orientationGroup);

  let cubies = [];

  function buildMaterials(x,y,z){
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z
    const mat = () => new THREE.MeshStandardMaterial({ color: COLORS.core, roughness: 0.68, metalness: 0 });
    return [mat(), mat(), mat(), mat(), mat(), mat()];
  }

  function createStickerGeometry(){
    const half = STICKER_SIZE / 2;
    const r = STICKER_RADIUS;
    const shape = new THREE.Shape();
    shape.moveTo(-half + r, -half);
    shape.lineTo(half - r, -half);
    shape.quadraticCurveTo(half, -half, half, -half + r);
    shape.lineTo(half, half - r);
    shape.quadraticCurveTo(half, half, half - r, half);
    shape.lineTo(-half + r, half);
    shape.quadraticCurveTo(-half, half, -half, half - r);
    shape.lineTo(-half, -half + r);
    shape.quadraticCurveTo(-half, -half, -half + r, -half);

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: STICKER_DEPTH,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.012,
      bevelThickness: 0.009,
      curveSegments: 6
    });
    geometry.translate(0, 0, -STICKER_DEPTH / 2);
    geometry.computeVertexNormals();
    return geometry;
  }

  function addSticker(cubie, color, position, rotation){
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.48, metalness: 0.015 });
    const sticker = new THREE.Mesh(createStickerGeometry(), material);
    sticker.position.copy(position);
    sticker.rotation.set(rotation.x, rotation.y, rotation.z);
    cubie.add(sticker);
  }

  function addExteriorStickers(cubie, x, y, z){
    const offset = CUBIE_SIZE / 2 + 0.012;
    if (x === 1) addSticker(cubie, COLORS.R, new THREE.Vector3(offset,0,0), new THREE.Euler(0,Math.PI/2,0));
    if (x === -1) addSticker(cubie, COLORS.L, new THREE.Vector3(-offset,0,0), new THREE.Euler(0,-Math.PI/2,0));
    if (y === 1) addSticker(cubie, COLORS.U, new THREE.Vector3(0,offset,0), new THREE.Euler(-Math.PI/2,0,0));
    if (y === -1) addSticker(cubie, COLORS.D, new THREE.Vector3(0,-offset,0), new THREE.Euler(Math.PI/2,0,0));
    if (z === 1) addSticker(cubie, COLORS.F, new THREE.Vector3(0,0,offset), new THREE.Euler(0,0,0));
    if (z === -1) addSticker(cubie, COLORS.B, new THREE.Vector3(0,0,-offset), new THREE.Euler(0,Math.PI,0));
  }

  function createRoundedBoxGeometry(size, radius, segments){
    const geometry = new THREE.BoxGeometry(size, size, size, segments, segments, segments);
    const position = geometry.attributes.position;
    const half = size / 2;
    const inner = half - radius;
    const vertex = new THREE.Vector3();
    const anchor = new THREE.Vector3();

    for (let i = 0; i < position.count; i++){
      vertex.fromBufferAttribute(position, i);
      anchor.set(
        THREE.MathUtils.clamp(vertex.x, -inner, inner),
        THREE.MathUtils.clamp(vertex.y, -inner, inner),
        THREE.MathUtils.clamp(vertex.z, -inner, inner)
      );
      vertex.sub(anchor);
      if (vertex.lengthSq() > 0) vertex.normalize().multiplyScalar(radius);
      vertex.add(anchor);
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }

  function rebuildSolvedCube(){
    // clear
    cubies.forEach(c => c.traverse(part => {
      if (part.geometry) part.geometry.dispose();
      if (Array.isArray(part.material)) part.material.forEach(m=>m.dispose());
      else if (part.material) part.material.dispose();
    }));
    cubeGroup.clear();
    cubies = [];

    const geo = createRoundedBoxGeometry(CUBIE_SIZE, CUBIE_RADIUS, 6);

    for (let x=-1;x<=1;x++){
      for (let y=-1;y<=1;y++){
        for (let z=-1;z<=1;z++){
          const mesh = new THREE.Mesh(geo, buildMaterials(x,y,z));
          mesh.position.set(x*SPACING, y*SPACING, z*SPACING);
          addExteriorStickers(mesh, x, y, z);
          mesh.userData.pos = { x, y, z };
          cubeGroup.add(mesh);
          cubies.push(mesh);
        }
      }
    }
  }
  rebuildSolvedCube();

  function resizeRenderer(){
    const size = wrap.clientWidth;
    if (!size) return;
    renderer.setSize(size, size, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resizeRenderer).observe(wrap);
  resizeRenderer();

  (function loop(){
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();

  /* ------------------------------------------------------------------ *
   *  Free rotation (drag) — only active while allowed
   * ------------------------------------------------------------------ */
  let dragEnabled = true;
  let dragging = false;
  let lastX = 0, lastY = 0;
  const DRAG_SENS = 0.008;

  function pointerDown(e){
    if (!dragEnabled) return;
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    lastX = p.clientX; lastY = p.clientY;
  }
  function pointerMove(e){
    if (!dragging || !dragEnabled) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - lastX, dy = p.clientY - lastY;
    lastX = p.clientX; lastY = p.clientY;
    const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), dx*DRAG_SENS);
    const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), dy*DRAG_SENS);
    orientationGroup.quaternion.premultiply(qy).premultiply(qx);
    if (e.touches) e.preventDefault();
  }
  function pointerUp(){ dragging = false; }

  canvas.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  canvas.addEventListener('touchstart', pointerDown, { passive:true });
  window.addEventListener('touchmove', pointerMove, { passive:false });
  window.addEventListener('touchend', pointerUp);

  function setDragEnabled(v){
    dragEnabled = v;
    canvas.classList.toggle('locked', !v);
    document.getElementById('rotate-hint').style.opacity = v ? '1' : '0';
  }

  /* ------------------------------------------------------------------ *
   *  Layer turn animation
   * ------------------------------------------------------------------ */

  function playMove(move){
    return new Promise(resolve=>{
      const { axis, layer, angle } = move;
      const layerCubies = cubies.filter(c => Math.round(c.userData.pos[axis]) === layer);
      const pivot = new THREE.Group();
      cubeGroup.add(pivot);
      layerCubies.forEach(c => pivot.attach(c));

      const targetRad = THREE.MathUtils.degToRad(angle);
      const start = performance.now();

      function frame(now){
        const t = Math.min((now-start)/MOVE_DURATION, 1);
        pivot.rotation[axis] = targetRad * easeInOutQuad(t);
        if (t < 1){
          requestAnimationFrame(frame);
        } else {
          layerCubies.forEach(c=>{
            cubeGroup.attach(c);
            c.userData.pos = rotatePos(c.userData.pos, axis, angle);
            c.userData.pos.x = Math.round(c.userData.pos.x);
            c.userData.pos.y = Math.round(c.userData.pos.y);
            c.userData.pos.z = Math.round(c.userData.pos.z);
            c.position.set(c.userData.pos.x*SPACING, c.userData.pos.y*SPACING, c.userData.pos.z*SPACING);
          });
          cubeGroup.remove(pivot);
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function resetOrientation(duration){
    return new Promise(resolve=>{
      const endQuat = new THREE.Quaternion();
      const startQuat = orientationGroup.quaternion.clone();
      const angle = startQuat.angleTo(endQuat);
      if (angle < 0.002){
        orientationGroup.quaternion.copy(endQuat);
        resolve();
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        orientationGroup.quaternion.copy(endQuat);
        resolve();
        return;
      }
      duration = Math.max(180, duration * Math.min(angle / Math.PI, 1));
      const start = performance.now();

      function frame(now){
        const t = Math.min((now-start)/duration, 1);
        orientationGroup.quaternion.slerpQuaternions(startQuat, endQuat, easeInOutCubic(t));
        if (t < 1){
          requestAnimationFrame(frame);
        } else {
          orientationGroup.quaternion.copy(endQuat);
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }
return {rebuildSolvedCube,playMove,setDragEnabled,resetOrientation,resetRotation:()=>orientationGroup.quaternion.identity(),isDragEnabled:()=>dragEnabled};
};
