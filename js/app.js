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

// Character factory (placeholder bubble Hashimas)
const HASHIMA_COLORS = [0x00aa55, 0x3d77ff, 0xff3d8e, 0xffb100, 0x9a6cff, 0x00d4aa];

function createBubbleHashima(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 48, 48),
    new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.5 })
  );
  body.castShadow = true;
  group.add(body);

  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const eyeDarkMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const eyeWhiteGeo = new THREE.SphereGeometry(0.16, 16, 16);
  const eyeDarkGeo = new THREE.SphereGeometry(0.07, 16, 16);

  const eL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat); eL.position.set(-0.26, 0.1, 0.75);
  const eLi = new THREE.Mesh(eyeDarkGeo, eyeDarkMat); eLi.position.set(-0.26, 0.08, 0.88);
  const eR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat); eR.position.set(0.26, 0.1, 0.75);
  const eRi = new THREE.Mesh(eyeDarkGeo, eyeDarkMat); eRi.position.set(0.26, 0.08, 0.88);
  for (const m of [eL, eLi, eR, eRi]) { m.castShadow = true; group.add(m); }

  // Simple idle motion
  group.userData.idle = { t: Math.random() * Math.PI * 2 };
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
  p1: createBubbleHashima(HASHIMA_COLORS[state.p1Index]),
  p2: createBubbleHashima(HASHIMA_COLORS[state.p2Index])
};
preview.p1.position.set(-2.1, 0, 0);
preview.p2.position.set(2.1, 0, 0);
scene.add(preview.p1, preview.p2);

function refreshSelectPreview() {
  // Replace materials/colors
  scene.remove(preview.p1, preview.p2);
  preview.p1 = createBubbleHashima(HASHIMA_COLORS[state.p1Index]);
  preview.p2 = createBubbleHashima(HASHIMA_COLORS[state.p2Index]);
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
  state.entities.p1 = createBubbleHashima(HASHIMA_COLORS[state.p1Index]);
  state.entities.p2 = createBubbleHashima(HASHIMA_COLORS[state.p2Index]);
  state.entities.p1.position.set(-1.5, 0, 0);
  state.entities.p2.position.set(1.5, 0, 0);
  scene.add(state.entities.p1, state.entities.p2);

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

function updateGame(dt) {
  if (state.scene !== 'game') return;
  const p1 = state.entities.p1;
  const p2 = state.entities.p2;
  if (!p1 || !p2) return;

  // Basic left/right
  const move = (node, left, right, jumpKey) => {
    const speed = 1.2;
    if (inputs.keys.has(left)) node.position.x -= speed * dt;
    if (inputs.keys.has(right)) node.position.x += speed * dt;
    if (inputs.keys.has(jumpKey)) node.position.y = Math.sin(Date.now() * 0.008) * 0.2; else node.position.y *= 0.9;
  };
  move(p1, 'a', 'd', 'w');
  move(p2, 'ArrowLeft', 'ArrowRight', 'ArrowUp');

  // Simple proximity damage when pressing attack
  const dist = p1.position.distanceTo(p2.position);
  if (dist < 1.2) {
    if (inputs.keys.has(' ')) {
      state.p2Health = Math.max(0, state.p2Health - 0.2);
      hudP2.style.width = state.p2Health + '%';
    }
    if (inputs.keys.has('Enter')) {
      state.p1Health = Math.max(0, state.p1Health - 0.2);
      hudP1.style.width = state.p1Health + '%';
    }
  }
  if (state.p1Health <= 0 || state.p2Health <= 0) endGame();
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
  node.position.y = Math.sin(t * 2) * 0.05;
  node.rotation.y += 0.004;
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


