// App bootstrap: screens, state, and 3D scene orchestration (globals via script tags)

// Screens
const screenMenu = document.getElementById('menu-screen');
const screenSelect = document.getElementById('select-screen');
const screenGame = document.getElementById('game-screen');


// HUD
const hudP1 = document.getElementById('hud-p1');
const hudP2 = document.getElementById('hud-p2');
const hudTimer = document.getElementById('hud-timer');
const hudResult = document.getElementById('hud-result');
const postMatch = document.getElementById('post-match');
const btnRematch = document.getElementById('btn-rematch');
const btnSelect = document.getElementById('btn-select');
const btnMenu = document.getElementById('btn-menu');

// Menu elements
const btnPlay = document.getElementById('btn-play');
const btnHowto = document.getElementById('btn-howto');
const howtoModal = document.getElementById('howto-modal');
const btnHowtoClose = document.getElementById('btn-howto-close');

// Select elements
const p1Prev = document.getElementById('p1-prev');
const p1Next = document.getElementById('p1-next');
const p1Rand = document.getElementById('p1-rand');
const p2Prev = document.getElementById('p2-prev');
const p2Next = document.getElementById('p2-next');
const p2Rand = document.getElementById('p2-rand');
const btnBackMenu = document.getElementById('btn-back-menu');
const btnStartGame = document.getElementById('btn-start-game');

// 3D Renderer
const root = document.getElementById('three-root');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
root.appendChild(renderer.domElement);

// Scene graph
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
camera.position.set(0, 2.2, 9);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.set(0, 1.2, 0);

// Lighting and ground
const hemi = new THREE.HemisphereLight(0xffffff, 0x141414, 1.0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(4, 6, 4);
dir.castShadow = true;
scene.add(dir);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.25;
ground.receiveShadow = true;
scene.add(ground);

// Gameplay constants
const ARENA_HALF_WIDTH = 4.0;
const GROUND_Y = 0.0;
const HORIZ_SPEED = 0.12; // units per frame at 60fps
const HORIZ_ACCEL = 0.06;
const HORIZ_FRICTION = 0.85;
const GRAVITY = -0.12;
const JUMP_VELOCITY = 0.34;
const MAX_FALL_SPEED = -0.9;
const ATTACK_DURATION_FRAMES = 14;
const ATTACK_ACTIVE_START = 5;
const ATTACK_ACTIVE_END = 10;
const ATTACK_COOLDOWN_FRAMES = 26;
const ATTACK_RANGE = 1.1;
const ATTACK_DAMAGE = 8;
const HITSTUN_FRAMES = 18;
const KNOCKBACK_X = 0.25;
const KNOCKBACK_Y = 0.18;

// Character factory (richer bubble Hashimas)
const HASHIMA_COLORS = [0x00aa55, 0x3d77ff, 0xff3d8e, 0xffb100, 0x9a6cff, 0x00d4aa];

function seededRandom(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

function createBubbleHashima(color, seed = 1) {
  const rand = seededRandom(seed);
  const group = new THREE.Group();

  // Body: slightly stretched sphere for an egg-like silhouette
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.45 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 48, 48), bodyMat);
  body.scale.set(1, 1.15, 1);
  body.castShadow = true;
  group.add(body);

  // Inner emissive core
  const coreColor = new THREE.Color(color).offsetHSL(0, 0, 0.2);
  const coreMat = new THREE.MeshStandardMaterial({ color: coreColor.getHex(), emissive: coreColor.getHex(), emissiveIntensity: 0.4, metalness: 0.1, roughness: 0.8 });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), coreMat);
  core.castShadow = false;
  group.add(core);

  // Eyes and pupils
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const eyeDarkMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const eyeWhiteGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const eyeDarkGeo = new THREE.SphereGeometry(0.07, 16, 16);

  const eL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat); eL.position.set(-0.26, 0.12, 0.76);
  const eLi = new THREE.Mesh(eyeDarkGeo, eyeDarkMat); eLi.position.set(-0.26, 0.10, 0.9);
  const eR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat); eR.position.set(0.26, 0.12, 0.76);
  const eRi = new THREE.Mesh(eyeDarkGeo, eyeDarkMat); eRi.position.set(0.26, 0.10, 0.9);
  for (const m of [eL, eLi, eR, eRi]) { m.castShadow = true; group.add(m); }

  // Mouth (tiny ring)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 24), new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.3 }));
  mouth.position.set(0, -0.05, 0.85);
  group.add(mouth);

  // Optional stripe ring
  let stripe = null;
  if (rand() > 0.4) {
    const stripeColor = new THREE.Color(color).offsetHSL(0.06, 0.1, 0.15);
    stripe = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.03, 12, 64), new THREE.MeshStandardMaterial({ color: stripeColor.getHex(), metalness: 0.25, roughness: 0.35 }));
    stripe.rotation.x = Math.PI * (0.15 + rand() * 0.3);
    stripe.rotation.y = Math.PI * (rand() * 2);
    group.add(stripe);
  }

  // Optional halo or horns
  let halo = null; let horns = [];
  if (rand() > 0.6) {
    halo = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.02, 8, 48), new THREE.MeshStandardMaterial({ color: 0xffee88, emissive: 0xffdd66, emissiveIntensity: 0.5 }));
    halo.position.y = 0.75;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
  } else if (rand() > 0.5) {
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
    const hornGeo = new THREE.ConeGeometry(0.12, 0.25, 12);
    const h1 = new THREE.Mesh(hornGeo, hornMat);
    const h2 = new THREE.Mesh(hornGeo, hornMat);
    h1.position.set(-0.25, 0.55, 0.35); h1.rotation.z = Math.PI * -0.1; h1.rotation.x = Math.PI * -0.2;
    h2.position.set(0.25, 0.55, 0.35);  h2.rotation.z = Math.PI * 0.1;  h2.rotation.x = Math.PI * -0.2;
    for (const h of [h1, h2]) { h.castShadow = true; group.add(h); horns.push(h); }
  }

  // Floating appendages (arms)
  const arms = new THREE.Group();
  const armMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).offsetHSL(0, -0.05, 0.05).getHex(), roughness: 0.5 });
  for (let i = 0; i < 2; i++) {
    const s = 0.18 + rand() * 0.05;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 16), armMat);
    hand.position.set(i === 0 ? -1.2 : 1.2, 0.05, 0);
    hand.castShadow = true;
    arms.add(hand);
  }
  group.add(arms);

  // Store anim parts
  group.userData = {
    idle: { t: Math.random() * Math.PI * 2 },
    blinkT: rand() * Math.PI * 2,
    pupils: [eLi, eRi],
    core,
    halo,
    stripe,
    horns,
    arms
  };
  return group;
}

// Game state
const state = {
  scene: 'menu', // 'menu' | 'select' | 'game'
  p1Index: 0,
  p2Index: 1,
  p1Health: 100,
  p2Health: 100,
  timer: 60,
  timerId: 0,
  entities: {
    p1: null,
    p2: null
  }
};

// Helper: screen switching
function showScreen(name) {
  const on = (el, v) => { el.classList.toggle('visible', v); el.classList.toggle('hidden', !v); };
  on(screenMenu, name === 'menu');
  on(screenSelect, name === 'select');
  on(screenGame, name === 'game');
}

// Menu handlers
btnPlay.addEventListener('click', () => {
  state.scene = 'select';
  showScreen('select');
  refreshSelectPreview();
});

btnHowto.addEventListener('click', () => { howtoModal.classList.remove('hidden'); });
btnHowtoClose.addEventListener('click', () => { howtoModal.classList.add('hidden'); });

// Selection handlers
function wrapIndex(i) { return (i + HASHIMA_COLORS.length) % HASHIMA_COLORS.length; }

p1Prev.addEventListener('click', () => { state.p1Index = wrapIndex(state.p1Index - 1); refreshSelectPreview(); });
p1Next.addEventListener('click', () => { state.p1Index = wrapIndex(state.p1Index + 1); refreshSelectPreview(); });
p1Rand.addEventListener('click', () => { state.p1Index = Math.floor(Math.random() * HASHIMA_COLORS.length); refreshSelectPreview(); });

p2Prev.addEventListener('click', () => { state.p2Index = wrapIndex(state.p2Index - 1); refreshSelectPreview(); });
p2Next.addEventListener('click', () => { state.p2Index = wrapIndex(state.p2Index + 1); refreshSelectPreview(); });
p2Rand.addEventListener('click', () => { state.p2Index = Math.floor(Math.random() * HASHIMA_COLORS.length); refreshSelectPreview(); });

btnBackMenu.addEventListener('click', () => { state.scene = 'menu'; showScreen('menu'); });
btnStartGame.addEventListener('click', startGame);

// Selection preview meshes
const preview = {
  p1: createBubbleHashima(HASHIMA_COLORS[state.p1Index], 101),
  p2: createBubbleHashima(HASHIMA_COLORS[state.p2Index], 202)
};
preview.p1.position.set(-2.1, 0, 0);
preview.p2.position.set(2.1, 0, 0);
scene.add(preview.p1, preview.p2);

function refreshSelectPreview() {
  // Replace materials/colors
  scene.remove(preview.p1, preview.p2);
  preview.p1 = createBubbleHashima(HASHIMA_COLORS[state.p1Index], 101);
  preview.p2 = createBubbleHashima(HASHIMA_COLORS[state.p2Index], 202);
  preview.p1.position.set(-2.1, 0, 0);
  preview.p2.position.set(2.1, 0, 0);
  scene.add(preview.p1, preview.p2);
}

// Start the game scene
function startGame() {
  state.scene = 'game';
  showScreen('game');
  // 3D-only game; legacy 2D UI removed
  // Reset HUD and timer
  state.p1Health = 100; state.p2Health = 100; state.timer = 60;
  hudP1.style.width = '100%';
  hudP2.style.width = '100%';
  hudTimer.textContent = String(state.timer);
  hudResult.classList.add('hidden');
  postMatch.classList.add('hidden');

  // Clear select previews
  scene.remove(preview.p1, preview.p2);

  // Spawn players
  state.entities.p1 = createBubbleHashima(HASHIMA_COLORS[state.p1Index], 1111 + state.p1Index);
  state.entities.p2 = createBubbleHashima(HASHIMA_COLORS[state.p2Index], 2222 + state.p2Index);
  const p1 = state.entities.p1; const p2 = state.entities.p2;
  p1.position.set(-1.5, 0.0, 0);
  p2.position.set(1.5, 0.0, 0);
  // runtime physics state
  p1.userData.vx = 0; p1.userData.vy = 0; p1.userData.grounded = true; p1.userData.facing = 1;
  p2.userData.vx = 0; p2.userData.vy = 0; p2.userData.grounded = true; p2.userData.facing = -1;
  // attack/hit state
  p1.userData.attack = { frame: 0, cooldown: 0 };
  p2.userData.attack = { frame: 0, cooldown: 0 };
  p1.userData.hitstun = 0;
  p2.userData.hitstun = 0;
  scene.add(p1, p2);

  // Simple inputs for movement and attack placeholders
  inputs.reset();
  if (state.timerId) clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    if (state.scene !== 'game') return;
    if (state.timer > 0) {
      state.timer -= 1;
      hudTimer.textContent = String(state.timer);
    } else {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(state.timerId);
  state.timerId = 0;
  hudResult.classList.remove('hidden');
  if (state.p1Health === state.p2Health) hudResult.textContent = 'Tie';
  else if (state.p1Health > state.p2Health) hudResult.textContent = 'Player I Wins';
  else hudResult.textContent = 'Player II Wins';
  postMatch.classList.remove('hidden');
}

// Minimal physics and inputs for placeholders
const inputs = {
  keys: new Set(),
  reset() { this.keys.clear(); }
};

window.addEventListener('keydown', (e) => {
  inputs.keys.add(e.key);
  // Prevent browser scrolling on game controls
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
    e.preventDefault();
  }
  // Post-match shortcuts
  if (!postMatch.classList.contains('hidden')) {
    if (e.key === 'Enter') { e.preventDefault(); rematch(); }
    if (e.key.toLowerCase() === 'c') { e.preventDefault(); backToSelect(); }
    if (e.key === 'Escape') { e.preventDefault(); backToMenu(); }
  }
});
window.addEventListener('keyup', (e) => {
  inputs.keys.delete(e.key);
});

function clamp(v, mn, mx){ return Math.max(mn, Math.min(mx, v)); }
function flipTowards(a,b){ return b.position.x >= a.position.x ? 1 : -1; }
function beginAttack(e){ const a=e.userData.attack; if(a.cooldown>0||a.frame>0||e.userData.hitstun>0) return; a.frame=1; }
function updateAttackAndDamage(attacker, defender){
  const atk = attacker.userData.attack;
  if (atk.cooldown>0){ atk.cooldown--; return; }
  if (atk.frame>0){
    atk.frame++;
    const core = attacker.userData.core; if(core) core.material.emissiveIntensity = 0.4 + Math.sin(atk.frame*0.4)*0.25;
    attacker.scale.set(1 + Math.sin(atk.frame*0.3)*0.05, 1 - Math.sin(atk.frame*0.3)*0.06, 1 + Math.sin(atk.frame*0.3)*0.05);
    if (atk.frame===ATTACK_ACTIVE_START){ attacker.userData.facing = flipTowards(attacker, defender); }
    if (atk.frame>=ATTACK_ACTIVE_START && atk.frame<=ATTACK_ACTIVE_END){
      const dist = attacker.position.distanceTo(defender.position);
      if (dist<ATTACK_RANGE && defender.userData.hitstun===0){
        if (defender===state.entities.p2){ state.p2Health=Math.max(0, state.p2Health-ATTACK_DAMAGE*0.1); hudP2.style.width=state.p2Health+'%'; }
        else { state.p1Health=Math.max(0, state.p1Health-ATTACK_DAMAGE*0.1); hudP1.style.width=state.p1Health+'%'; }
        defender.userData.hitstun=HITSTUN_FRAMES;
        const dir = Math.sign(defender.position.x - attacker.position.x) || 1;
        defender.userData.vx += dir*KNOCKBACK_X;
        defender.userData.vy += KNOCKBACK_Y;
        const dcore = defender.userData.core; if(dcore) dcore.material.emissiveIntensity=1.0;
        defender.scale.set(0.92, 1.08, 0.92);
      }
    }
    if (atk.frame>ATTACK_DURATION_FRAMES){ atk.frame=0; atk.cooldown=ATTACK_COOLDOWN_FRAMES; attacker.scale.set(1,1.15,1); const core=attacker.userData.core; if(core) core.material.emissiveIntensity=0.4; }
  }
}
function applyPhysics(e){
  e.userData.vy = Math.max(MAX_FALL_SPEED, e.userData.vy + GRAVITY*(1/60));
  e.position.y += e.userData.vy;
  const bodyBottom = e.position.y - 0.9*e.scale.y + 0.1;
  if (bodyBottom <= GROUND_Y - 1.25){ e.position.y = -1.25 + 0.9*e.scale.y - 0.1; e.userData.vy=0; e.userData.grounded=true; }
  else { e.userData.grounded=false; }
  e.position.x += e.userData.vx;
  e.position.x = clamp(e.position.x, -ARENA_HALF_WIDTH, ARENA_HALF_WIDTH);
  e.userData.vx *= HORIZ_FRICTION;
}
function updateGame(dt){
  if (state.scene!=='game') return;
  const p1=state.entities.p1, p2=state.entities.p2; if(!p1||!p2) return;
  const steer=(n,left,right,jump,atk)=>{ if(n.userData.hitstun>0) return; if(inputs.keys.has(left)){ n.userData.vx-=HORIZ_ACCEL; n.userData.facing=-1; } if(inputs.keys.has(right)){ n.userData.vx+=HORIZ_ACCEL; n.userData.facing=1; } if(inputs.keys.has(jump)&&n.userData.grounded){ n.userData.vy=JUMP_VELOCITY; n.userData.grounded=false; } if(inputs.keys.has(atk)) beginAttack(n); };
  steer(p1,'a','d','w',' ');
  steer(p2,'ArrowLeft','ArrowRight','ArrowUp','Enter');
  p1.userData.vx = clamp(p1.userData.vx, -HORIZ_SPEED, HORIZ_SPEED);
  p2.userData.vx = clamp(p2.userData.vx, -HORIZ_SPEED, HORIZ_SPEED);
  updateAttackAndDamage(p1,p2);
  updateAttackAndDamage(p2,p1);
  for (const n of [p1,p2]){ if(n.userData.hitstun>0) n.userData.hitstun--; n.scale.x += (1 - n.scale.x)*0.15; n.scale.y += (1.15 - n.scale.y)*0.15; n.scale.z += (1 - n.scale.z)*0.15; const core=n.userData.core; if(core) core.material.emissiveIntensity += (0.4 - core.material.emissiveIntensity)*0.1; }
  applyPhysics(p1); applyPhysics(p2);
  if (state.p1Health<=0 || state.p2Health<=0) endGame();
}

function cleanupGameEntities() {
  for (const key of ['p1', 'p2']) {
    const node = state.entities[key];
    if (node) { scene.remove(node); state.entities[key] = null; }
  }
}

function rematch() {
  if (state.scene !== 'game') return;
  cleanupGameEntities();
  startGame();
}

function backToSelect() {
  cleanupGameEntities();
  if (state.timerId) { clearInterval(state.timerId); state.timerId = 0; }
  state.scene = 'select';
  postMatch.classList.add('hidden');
  hudResult.classList.add('hidden');
  showScreen('select');
  refreshSelectPreview();
}

function backToMenu() {
  cleanupGameEntities();
  if (state.timerId) { clearInterval(state.timerId); state.timerId = 0; }
  state.scene = 'menu';
  postMatch.classList.add('hidden');
  hudResult.classList.add('hidden');
  showScreen('menu');
}

btnRematch.addEventListener('click', rematch);
btnSelect.addEventListener('click', backToSelect);
btnMenu.addEventListener('click', backToMenu);

// Resize
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// Idle animation for any hashima
function animateIdle(node, time) {
  if (!node || !node.userData) return;
  node.userData.idle.t += 0.02;
  const t = node.userData.idle.t + time * 0.001;
  node.position.y = Math.sin(t * 2) * 0.06;
  node.rotation.y += 0.004;

  // Pupils follow opponent/controls subtly
  const pupils = node.userData.pupils || [];
  for (const p of pupils) {
    p.position.x = Math.sign(Math.sin(t * 0.7)) * 0.26;
    p.position.y = 0.10 + Math.sin(t * 1.3) * 0.005;
    p.position.z = 0.9 + Math.cos(t * 1.1) * 0.005;
  }

  // Blink by scaling eyes on Y
  if (node.userData.blinkT !== undefined) {
    node.userData.blinkT += 0.07;
    const blink = Math.max(0, Math.sin(node.userData.blinkT)) ** 16; // spiky sine
    for (const child of node.children) {
      if (child.geometry && child.geometry.type === 'SphereGeometry' && child.material && child.material.color && child !== node.userData.core) {
        // Heuristic: treat small eye whites as blink targets near face front
        if (child.scale && child.position && child.position.z > 0.7 && child.geometry.parameters && child.geometry.parameters.radius < 0.2) {
          child.scale.y = 1 - blink * 0.88;
        }
      }
    }
  }

  // Arms float
  if (node.userData.arms) {
    const spread = 1.2 + Math.sin(t * 1.5) * 0.1;
    const bob = Math.sin(t * 2.1) * 0.05;
    node.userData.arms.children[0].position.set(-spread, 0.05 + bob, 0);
    node.userData.arms.children[1].position.set(spread, 0.05 - bob, 0);
  }

  // Halo gentle spin or horn subtle tilt
  if (node.userData.halo) node.userData.halo.rotation.z += 0.01;
  if (node.userData.horns && node.userData.horns.length) {
    for (const h of node.userData.horns) h.rotation.y += 0.002;
  }
}

// Main loop
let last = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dtMs = now - last; last = now; const dt = Math.min(3.0, dtMs / 16.6667);

  controls.update();

  // Update selection previews idle motion when in select scene
  if (state.scene === 'select') {
    animateIdle(preview.p1, now);
    animateIdle(preview.p2, now);
  }

  // Update game
  updateGame(dt);

  renderer.render(scene, camera);
}
showScreen('menu');
tick(performance.now());


