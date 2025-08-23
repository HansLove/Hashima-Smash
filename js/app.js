// App bootstrap: screens, state, and 3D scene orchestration (globals via script tags)

// Game constants - Smash Bros style
const ARENA_HALF_WIDTH = 8;
const GROUND_Y = 0;
const HORIZ_SPEED = 0.15;
const HORIZ_ACCEL = 0.008;
const HORIZ_FRICTION = 0.85;
const GRAVITY = 0.012;
const JUMP_VELOCITY = 0.25;
const MAX_FALL_SPEED = 0.3;
const ATTACK_COOLDOWN_FRAMES = 8;
const HITSTUN_FRAMES = 8;
const DAMAGE_STALING = 0.95;
const BASE_KNOCKBACK = 0.8;
const KNOCKBACK_GROWTH = 0.12;
const SHIELD_FRAMES = 30;
const ROLL_FRAMES = 20;
const ROLL_SPEED = 0.2;
const ROLL_INVINCIBILITY = 15;
const FAST_FALL_MULTIPLIER = 1.5;
const COMBO_WINDOW = 15;
const AIR_ATTACK_MULTIPLIER = 0.8;
const PERFECT_SHIELD_FRAMES = 3;

// Screens
const screenMenu = document.getElementById('menu-screen');
const screenSelect = document.getElementById('select-screen');
const screenGame = document.getElementById('game-screen');


// HUD
const hudP1 = document.getElementById('hud-p1');
const hudP2 = document.getElementById('hud-p2');
const hudTimer = document.getElementById('hud-timer');
const hudResult = document.getElementById('hud-result');
const statusP1 = document.getElementById('status-p1');
const statusP2 = document.getElementById('status-p2');
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
const p1Breed = document.getElementById('p1-breed');
const p2Breed = document.getElementById('p2-breed');
const btnBackMenu = document.getElementById('btn-back-menu');
const btnStartGame = document.getElementById('btn-start-game');

// 3D Renderer
const root = document.getElementById('three-root');
const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;
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
const hemi = new THREE.HemisphereLight(0xffffff, 0x141414, 1.2);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.3);
dir.position.set(4, 8, 4);
dir.castShadow = true;
dir.shadow.mapSize.width = 2048;
dir.shadow.mapSize.height = 2048;
dir.shadow.camera.near = 0.5;
dir.shadow.camera.far = 50;
dir.shadow.camera.left = -10;
dir.shadow.camera.right = 10;
dir.shadow.camera.top = 10;
dir.shadow.camera.bottom = -10;
scene.add(dir);

// Add ambient light for better bubble visibility
const ambient = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambient);

// Add point lights for dramatic bubble effects
const pointLight1 = new THREE.PointLight(0x00aaff, 0.8, 15);
pointLight1.position.set(-3, 3, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff00aa, 0.6, 12);
pointLight2.position.set(3, 2, -2);
scene.add(pointLight2);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ 
    color: 0x0a0a0a, 
    roughness: 1,
    metalness: 0.1
  })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.25;
ground.receiveShadow = true;
scene.add(ground);

// Add subtle fog for depth
scene.fog = new THREE.Fog(0x000000, 15, 50);

// Add floating background bubbles for atmosphere
const backgroundBubbles = new THREE.Group();
for (let i = 0; i < 20; i++) {
  const bubbleSize = 0.1 + Math.random() * 0.3;
  const bubbleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.3, 0.6),
    transparent: true,
    opacity: 0.3,
    metalness: 0.8,
    roughness: 0.1
  });
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(bubbleSize, 16, 16), bubbleMat);
  bubble.position.set(
    (Math.random() - 0.5) * 40,
    Math.random() * 20 - 5,
    (Math.random() - 0.5) * 40
  );
  bubble.userData = { 
    originalY: bubble.position.y,
    speed: 0.01 + Math.random() * 0.02,
    rotationSpeed: (Math.random() - 0.5) * 0.02
  };
  backgroundBubbles.add(bubble);
}
scene.add(backgroundBubbles);

// Character factory (three distinct bubble breeds)
const HASHIMA_COLORS = [0x00aa55, 0x3d77ff, 0xff3d8e, 0xffb100, 0x9a6cff, 0x00d4aa, 0xff6b35, 0x8e44ad, 0x16a085, 0xe74c3c];

// Breed definitions with unique characteristics
const BUBBLE_BREEDS = {
  HUMAN: {
    name: "Human",
    description: "Balanced bubble creatures with human-like features",
    bodyScale: { x: 1, y: 1.2, z: 0.9 },
    coreScale: 0.65,
    features: ['arms', 'legs', 'nose', 'mouth', 'particles'],
    accessories: ['halo', 'horns', 'stripe'],
    animationSpeed: 1.0
  },
  CAT: {
    name: "Cat",
    description: "Agile bubble creatures with cat-like features",
    bodyScale: { x: 0.9, y: 1.1, z: 0.8 },
    coreScale: 0.6,
    features: ['arms', 'legs', 'nose', 'mouth', 'particles', 'ears', 'tail'],
    accessories: ['collar', 'whiskers', 'stripe'],
    animationSpeed: 1.3
  },
  DRAGON: {
    name: "Dragon",
    description: "Majestic bubble creatures with dragon-like features",
    bodyScale: { x: 1.1, y: 1.3, z: 1.0 },
    coreScale: 0.7,
    features: ['arms', 'legs', 'nose', 'mouth', 'particles', 'wings', 'spikes'],
    accessories: ['halo', 'horns', 'stripe', 'scales'],
    animationSpeed: 0.8
  }
};

function seededRandom(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

function createBubbleHashima(color, breedType = 'HUMAN', seed = 1) {
  const rand = seededRandom(seed);
  const breed = BUBBLE_BREEDS[breedType];
  const group = new THREE.Group();

  // Enhanced body with breed-specific proportions
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color, 
    metalness: 0.3, 
    roughness: 0.4,
    transparent: true,
    opacity: 0.9
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 64), bodyMat);
  body.scale.set(breed.bodyScale.x, breed.bodyScale.y, breed.bodyScale.z);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Enhanced inner core with breed-specific sizing
  const coreColor = new THREE.Color(color).offsetHSL(0, 0, 0.15);
  const coreMat = new THREE.MeshStandardMaterial({ 
    color: coreColor.getHex(), 
    emissive: coreColor.getHex(), 
    emissiveIntensity: 0.6, 
    metalness: 0.2, 
    roughness: 0.7,
    transparent: true,
    opacity: 0.8
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(breed.coreScale, 48, 48), coreMat);
  core.castShadow = false;
  group.add(core);

  // Enhanced eyes with breed-specific positioning
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.3,
    metalness: 0.1
  });
  const eyeDarkMat = new THREE.MeshStandardMaterial({ 
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.2
  });
  const eyeHighlightMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    emissive: 0xffffff, 
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8
  });
  
  const eyeWhiteGeo = new THREE.SphereGeometry(0.18, 24, 24);
  const eyeDarkGeo = new THREE.SphereGeometry(0.08, 20, 20);
  const eyeHighlightGeo = new THREE.SphereGeometry(0.04, 16, 16);

  // Eye positioning varies by breed
  const eyeOffset = breedType === 'CAT' ? 0.25 : 0.28;
  const eyeHeight = breedType === 'DRAGON' ? 0.2 : 0.15;

  // Left eye
  const eL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat); 
  eL.position.set(-eyeOffset, eyeHeight, 0.78);
  const eLi = new THREE.Mesh(eyeDarkGeo, eyeDarkMat); 
  eLi.position.set(-eyeOffset, eyeHeight - 0.03, 0.92);
  const eLh = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat); 
  eLh.position.set(-eyeOffset - 0.04, eyeHeight + 0.03, 0.82);
  
  // Right eye
  const eR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat); 
  eR.position.set(eyeOffset, eyeHeight, 0.78);
  const eRi = new THREE.Mesh(eyeDarkGeo, eyeDarkMat); 
  eRi.position.set(eyeOffset, eyeHeight - 0.03, 0.92);
  const eRh = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat); 
  eRh.position.set(eyeOffset + 0.04, eyeHeight + 0.03, 0.82);
  
  for (const m of [eL, eLi, eLh, eR, eRi, eRh]) { 
    m.castShadow = true; 
    group.add(m); 
  }

  // Enhanced mouth with breed-specific expressions
  const mouthMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a, 
    roughness: 0.4,
    metalness: 0.1
  });
  
  let mouth;
  if (breedType === 'CAT') {
    // Cat mouth - smaller and more delicate
    mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 24), mouthMat);
    mouth.position.set(0, -0.06, 0.88);
  } else if (breedType === 'DRAGON') {
    // Dragon mouth - larger and more prominent
    mouth = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 12, 32), mouthMat);
    mouth.position.set(0, -0.1, 0.88);
  } else {
    // Human mouth - standard
    mouth = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 12, 32), mouthMat);
    mouth.position.set(0, -0.08, 0.88);
  }
  group.add(mouth);

  // Nose with breed-specific styling
  if (breed.features.includes('nose')) {
    const noseMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, -0.1, 0.1).getHex(),
      transparent: true,
      opacity: 0.7
    });
    
    let nose;
    if (breedType === 'CAT') {
      // Cat nose - small triangle-like
      nose = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 8), noseMat);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 0.08, 0.92);
    } else if (breedType === 'DRAGON') {
      // Dragon nose - larger and more prominent
      nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), noseMat);
      nose.position.set(0, 0.12, 0.9);
    } else {
      // Human nose - standard
      nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), noseMat);
      nose.position.set(0, 0.05, 0.9);
    }
    group.add(nose);
  }

  // Cat ears
  if (breedType === 'CAT' && breed.features.includes('ears')) {
    const earMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, 0, 0.1).getHex(),
      transparent: true,
      opacity: 0.8
    });
    
    const leftEar = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), earMat);
    const rightEar = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), earMat);
    
    leftEar.position.set(-0.2, 0.8, 0.4);
    leftEar.rotation.z = -0.3;
    leftEar.rotation.x = -0.2;
    
    rightEar.position.set(0.2, 0.8, 0.4);
    rightEar.rotation.z = 0.3;
    rightEar.rotation.x = -0.2;
    
    leftEar.castShadow = true;
    rightEar.castShadow = true;
    group.add(leftEar, rightEar);
  }

  // Dragon wings
  if (breedType === 'DRAGON' && breed.features.includes('wings')) {
    const wingMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(),
      transparent: true,
      opacity: 0.7,
      metalness: 0.4,
      roughness: 0.3
    });
    
    // Left wing
    const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2, 8, 12), wingMat);
    leftWing.position.set(-0.8, 0.3, 0.2);
    leftWing.rotation.y = -0.8;
    leftWing.rotation.z = 0.3;
    
    // Right wing
    const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2, 8, 12), wingMat);
    rightWing.position.set(0.8, 0.3, 0.2);
    rightWing.rotation.y = 0.8;
    rightWing.rotation.z = -0.3;
    
    leftWing.castShadow = true;
    rightWing.castShadow = true;
    group.add(leftWing, rightWing);
  }

  // Dragon spikes
  if (breedType === 'DRAGON' && breed.features.includes('spikes')) {
    const spikeMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, 0, 0.3).getHex(),
      metalness: 0.6,
      roughness: 0.2
    });
    
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 8), spikeMat);
      spike.position.set(0, 0.9 + i * 0.08, 0.3);
      spike.castShadow = true;
      group.add(spike);
    }
  }

  // Cat tail
  if (breedType === 'CAT' && breed.features.includes('tail')) {
    const tailMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, 0, 0.05).getHex(),
      transparent: true,
      opacity: 0.8
    });
    
    const tailSegments = 4;
    for (let i = 0; i < tailSegments; i++) {
      const segment = new THREE.Mesh(new THREE.SphereGeometry(0.08 - i * 0.01, 12, 12), tailMat);
      segment.position.set(0.4 + i * 0.1, -0.3 - i * 0.1, 0.2);
      segment.castShadow = true;
      group.add(segment);
    }
    
    // Tail tip
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), tailMat);
    tailTip.position.set(0.8, -0.7, 0.2);
    tailTip.castShadow = true;
    group.add(tailTip);
  }

  // Cat whiskers
  if (breedType === 'CAT' && breed.accessories.includes('whiskers')) {
    const whiskerMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    });
    
    for (let i = 0; i < 3; i++) {
      const leftWhisker = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.3, 4), whiskerMat);
      const rightWhisker = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.3, 4), whiskerMat);
      
      leftWhisker.position.set(-0.3, 0.05 + i * 0.02, 0.85);
      leftWhisker.rotation.z = -0.2 + i * 0.1;
      
      rightWhisker.position.set(0.3, 0.05 + i * 0.02, 0.85);
      rightWhisker.rotation.z = 0.2 - i * 0.1;
      
      group.add(leftWhisker, rightWhisker);
    }
  }

  // Cat collar
  if (breedType === 'CAT' && breed.accessories.includes('collar')) {
    const collarMat = new THREE.MeshStandardMaterial({ 
      color: 0xff6b35,
      metalness: 0.8,
      roughness: 0.2
    });
    
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 16, 64), collarMat);
    collar.position.y = -0.1;
    collar.rotation.x = Math.PI / 2;
    group.add(collar);
  }

  // Dragon scales
  if (breedType === 'DRAGON' && breed.accessories.includes('scales')) {
    const scaleMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, 0, 0.1).getHex(),
      metalness: 0.7,
      roughness: 0.2
    });
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 3; j++) {
        const scale = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), scaleMat);
        scale.position.set(
          (i - 4) * 0.15,
          -0.2 + j * 0.15,
          0.95
        );
        scale.scale.set(1, 0.6, 0.8);
        group.add(scale);
      }
    }
  }

  // Enhanced stripe patterns with breed-specific variety
  let stripe = null;
  if (rand() > 0.3) {
    const stripeColor = new THREE.Color(color).offsetHSL(0.08, 0.15, 0.2);
    const stripeMat = new THREE.MeshStandardMaterial({ 
      color: stripeColor.getHex(), 
      metalness: 0.3, 
      roughness: 0.3,
      emissive: stripeColor.getHex(),
      emissiveIntensity: 0.1
    });
    
    if (breedType === 'CAT') {
      // Cat stripes - vertical and more numerous
      stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 16), stripeMat);
      stripe.rotation.z = Math.PI / 2;
      stripe.rotation.y = Math.PI * rand();
      stripe.position.y = 0.1;
    } else if (breedType === 'DRAGON') {
      // Dragon stripes - diagonal and dramatic
      stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 16), stripeMat);
      stripe.rotation.z = Math.PI / 2;
      stripe.rotation.y = Math.PI * 0.25 + rand() * 0.5;
      stripe.position.y = 0.2;
    } else {
      // Human stripes - horizontal
      if (rand() > 0.5) {
        stripe = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.04, 16, 64), stripeMat);
        stripe.rotation.x = Math.PI * (0.1 + rand() * 0.4);
      } else {
        stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 16), stripeMat);
        stripe.rotation.z = Math.PI / 2;
        stripe.rotation.y = Math.PI * rand();
      }
    }
    group.add(stripe);
  }

  // Enhanced accessories with breed-specific variety
  let halo = null; 
  let horns = [];
  let antennae = [];
  
  if (rand() > 0.6) {
    // Enhanced halo with breed-specific styling
    const haloMat = new THREE.MeshStandardMaterial({ 
      color: 0xffee88, 
      emissive: 0xffdd66, 
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2
    });
    
    if (breedType === 'DRAGON') {
      // Dragon halo - larger and more dramatic
      halo = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 16, 64), haloMat);
      halo.position.y = 1.0;
    } else {
      // Standard halo
      halo = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 12, 64), haloMat);
      halo.position.y = 0.8;
    }
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
  } else if (rand() > 0.4) {
    // Enhanced horns with breed-specific styling
    const hornMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      roughness: 0.15, 
      metalness: 0.3,
      transparent: true,
      opacity: 0.9
    });
    
    if (breedType === 'DRAGON') {
      // Dragon horns - larger and more dramatic
      const hornGeo = new THREE.ConeGeometry(0.18, 0.4, 16);
      const h1 = new THREE.Mesh(hornGeo, hornMat);
      const h2 = new THREE.Mesh(hornGeo, hornMat);
      h1.position.set(-0.35, 0.8, 0.4); 
      h1.rotation.z = Math.PI * -0.15; 
      h1.rotation.x = Math.PI * -0.3;
      h2.position.set(0.35, 0.8, 0.4);  
      h2.rotation.z = Math.PI * 0.15;  
      h2.rotation.x = Math.PI * -0.3;
      for (const h of [h1, h2]) { 
        h.castShadow = true; 
        group.add(h); 
        horns.push(h); 
      }
    } else {
      // Standard horns
      const hornGeo = new THREE.ConeGeometry(0.14, 0.3, 16);
      const h1 = new THREE.Mesh(hornGeo, hornMat);
      const h2 = new THREE.Mesh(hornGeo, hornMat);
      h1.position.set(-0.28, 0.6, 0.4); 
      h1.rotation.z = Math.PI * -0.12; 
      h1.rotation.x = Math.PI * -0.25;
      h2.position.set(0.28, 0.6, 0.4);  
      h2.rotation.z = Math.PI * 0.12;  
      h2.rotation.x = Math.PI * -0.25;
      for (const h of [h1, h2]) { 
        h.castShadow = true; 
        group.add(h); 
        horns.push(h); 
      }
    }
  } else if (rand() > 0.3 && breedType !== 'CAT') {
    // Antennae (not for cats)
    const antennaMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, 0, 0.1).getHex(),
      metalness: 0.6,
      roughness: 0.2
    });
    const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    const a1 = new THREE.Mesh(antennaGeo, antennaMat);
    const a2 = new THREE.Mesh(antennaGeo, antennaMat);
    a1.position.set(-0.2, 0.7, 0.3);
    a1.rotation.z = Math.PI * -0.15;
    a2.position.set(0.2, 0.7, 0.3);
    a2.rotation.z = Math.PI * 0.15;
    
    // Antenna tips
    const tipMat = new THREE.MeshStandardMaterial({ 
      color: 0xffff00, 
      emissive: 0xffff00, 
      emissiveIntensity: 0.4
    });
    const tip1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), tipMat);
    const tip2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), tipMat);
    tip1.position.set(-0.25, 0.9, 0.25);
    tip2.position.set(0.25, 0.9, 0.25);
    
    for (const item of [a1, a2, tip1, tip2]) {
      item.castShadow = true;
      group.add(item);
    }
    antennae = [a1, a2, tip1, tip2];
  }

  // Enhanced arms with breed-specific articulation
  if (breed.features.includes('arms')) {
    const arms = new THREE.Group();
    const armMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, -0.08, 0.08).getHex(), 
      roughness: 0.4,
      metalness: 0.2,
      transparent: true,
      opacity: 0.8
    });
    
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const s = 0.2 + rand() * 0.08;
      
      // Upper arm
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.4, 12), armMat);
      upperArm.position.set(side * 0.8, -0.1, 0.1);
      upperArm.rotation.z = side * 0.3;
      upperArm.castShadow = true;
      arms.add(upperArm);
      
      // Lower arm
      const lowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.35, 12), armMat);
      lowerArm.position.set(side * 1.1, -0.3, 0.15);
      lowerArm.rotation.z = side * 0.6;
      lowerArm.castShadow = true;
      arms.add(lowerArm);
      
      // Hand
      const hand = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 20), armMat);
      hand.position.set(side * 1.3, -0.45, 0.2);
      hand.castShadow = true;
      arms.add(hand);
    }
    group.add(arms);
  }

  // Legs with breed-specific styling
  if (breed.features.includes('legs')) {
    const legs = new THREE.Group();
    const legMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, -0.1, 0.05).getHex(), 
      roughness: 0.5,
      metalness: 0.1,
      transparent: true,
      opacity: 0.7
    });
    
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      
      // Upper leg
      const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 12), legMat);
      upperLeg.position.set(side * 0.3, -0.8, 0);
      upperLeg.castShadow = true;
      legs.add(upperLeg);
      
      // Lower leg
      const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.4, 12), legMat);
      lowerLeg.position.set(side * 0.3, -1.25, 0);
      lowerLeg.castShadow = true;
      legs.add(lowerLeg);
      
      // Foot
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), legMat);
      foot.position.set(side * 0.3, -1.45, 0.1);
      foot.scale.set(1, 0.6, 1.2);
      foot.castShadow = true;
      legs.add(foot);
    }
    group.add(legs);
  }

  // Floating particles around the Hashima
  if (breed.features.includes('particles')) {
    const particles = new THREE.Group();
    const particleMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(color).offsetHSL(0, 0, 0.3).getHex(),
      emissive: new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7
    });
    
    const particleCount = breedType === 'DRAGON' ? 8 : 6;
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(new THREE.SphereGeometry(0.03 + rand() * 0.02, 8, 8), particleMat);
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.2 + rand() * 0.3;
      particle.position.set(
        Math.cos(angle) * radius,
        -0.5 + rand() * 0.5,
        Math.sin(angle) * radius
      );
      particles.add(particle);
    }
    group.add(particles);
  }

  // Store anim parts with breed information
  group.userData = {
    breed: breedType,
    breedData: breed,
    idle: { t: Math.random() * Math.PI * 2 },
    blinkT: rand() * Math.PI * 2,
    pupils: [eLi, eRi],
    core,
    halo,
    stripe,
    horns,
    antennae,
    arms: group.children.find(child => child.type === 'Group' && child.children.length >= 6),
    legs: group.children.find(child => child.type === 'Group' && child.children.length >= 6 && child !== group.children.find(child => child.type === 'Group' && child.children.length >= 6)),
    particles: group.children.find(child => child.type === 'Group' && child.children.length > 0 && child.children[0].geometry && child.children[0].geometry.type === 'SphereGeometry'),
    originalScale: new THREE.Vector3(breed.bodyScale.x, breed.bodyScale.y, breed.bodyScale.z)
  };
  return group;
}

// Game state
const state = {
  scene: 'menu', // 'menu' | 'select' | 'game'
  p1Index: 0,
  p2Index: 1,
  p1Breed: 'HUMAN',
  p2Breed: 'CAT',
  p1Health: 100,
  p2Health: 100,
  timer: 60,
  timerId: 0,
  gameRunning: false, // New flag to track if game is actually running
  entities: {
    p1: null,
    p2: null
  }
};

// Helper: screen switching
function showScreen(name) {
  // If switching away from game, stop the game
  if (state.scene === 'game' && name !== 'game') {
    state.gameRunning = false;
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = 0;
    }
  }
  
  const on = (el, v) => { 
    el.classList.toggle('visible', v); 
    el.classList.toggle('hidden', !v); 
  };
  
  on(screenMenu, name === 'menu');
  on(screenSelect, name === 'select');
  on(screenGame, name === 'game');
  
  // Update state
  state.scene = name;
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

// Breed selection handlers
p1Breed.addEventListener('change', () => { 
  state.p1Breed = p1Breed.value; 
  refreshSelectPreview(); 
});

p2Breed.addEventListener('change', () => { 
  state.p2Breed = p2Breed.value; 
  refreshSelectPreview(); 
});

btnBackMenu.addEventListener('click', () => { state.scene = 'menu'; showScreen('menu'); });
btnStartGame.addEventListener('click', startGame);

// Selection preview meshes
const preview = {
  p1: createBubbleHashima(HASHIMA_COLORS[state.p1Index], state.p1Breed, 101),
  p2: createBubbleHashima(HASHIMA_COLORS[state.p2Index], state.p2Breed, 202)
};
preview.p1.position.set(-2.1, 0, 0);
preview.p2.position.set(2.1, 0, 0);
scene.add(preview.p1, preview.p2);

function refreshSelectPreview() {
  // Replace materials/colors and breeds
  scene.remove(preview.p1, preview.p2);
  preview.p1 = createBubbleHashima(HASHIMA_COLORS[state.p1Index], state.p1Breed, 101);
  preview.p2 = createBubbleHashima(HASHIMA_COLORS[state.p2Index], state.p2Breed, 202);
  preview.p1.position.set(-2.1, 0, 0);
  preview.p2.position.set(2.1, 0, 0);
  scene.add(preview.p1, preview.p2);
}

// Start the game scene
function startGame() {
  console.log('Starting game...');
  
  // Set game state
  state.scene = 'game';
  state.gameRunning = true;
  
  // Reset all game values
  state.p1Health = 100; 
  state.p2Health = 100; 
  state.timer = 60;
  
  // Show game screen
  showScreen('game');
  
  // Reset HUD completely
  hudP1.style.width = '100%';
  hudP2.style.width = '100%';
  hudTimer.textContent = String(state.timer);
  
  // CRITICAL: Hide all result elements
  hudResult.classList.add('hidden');
  postMatch.classList.add('hidden');
  
  // Force hide any other elements that might be visible
  const allResults = document.querySelectorAll('.result, .overlay');
  allResults.forEach(el => {
    el.classList.add('hidden');
  });
  
  // Clear select previews
  scene.remove(preview.p1, preview.p2);

  // Spawn players
  state.entities.p1 = createBubbleHashima(HASHIMA_COLORS[state.p1Index], state.p1Breed, 1111 + state.p1Index);
  state.entities.p2 = createBubbleHashima(HASHIMA_COLORS[state.p2Index], state.p2Breed, 2222 + state.p2Index);
  const p1 = state.entities.p1; 
  const p2 = state.entities.p2;
  
  p1.position.set(-1.5, 0.0, 0);
  p2.position.set(1.5, 0.0, 0);
  
  // Initialize runtime physics state
  p1.userData.vx = 0; p1.userData.vy = 0; p1.userData.grounded = true; p1.userData.facing = 1;
  p2.userData.vx = 0; p2.userData.vy = 0; p2.userData.grounded = true; p2.userData.facing = -1;
  
  // Initialize attack/hit state with proper attack types
  p1.userData.attack = { frame: 0, cooldown: 0, type: 'NEUTRAL' };
  p2.userData.attack = { frame: 0, cooldown: 0, type: 'NEUTRAL' };
  p1.userData.hitstun = 0; p2.userData.hitstun = 0;
  
  // Initialize new mechanics
  p1.userData.shielding = false; p2.userData.shielding = false;
  p1.userData.rolling = false; p2.userData.rolling = false;
  p1.userData.invincible = false; p2.userData.invincible = false;
  p1.userData.landingLag = 0; p2.userData.landingLag = 0;
  p1.userData.moveStale = {}; p2.userData.moveStale = {};
  
  // Store original colors for shield effects
  p1.userData.originalColor = HASHIMA_COLORS[state.p1Index];
  p2.userData.originalColor = HASHIMA_COLORS[state.p2Index];
  
  scene.add(p1, p2);

  // Reset inputs
  inputs.reset();
  
  // Clear any existing timer
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = 0;
  }
  
  // Start new timer
  state.timerId = setInterval(() => {
    if (state.scene !== 'game' || !state.gameRunning) return;
    if (state.timer > 0) {
      state.timer -= 1;
      hudTimer.textContent = String(state.timer);
    } else {
      endGame();
    }
  }, 1000);
  

}

function endGame() {
  // Only end if game is actually running
  if (!state.gameRunning) {
    return;
  }
  
  // Stop the game
  state.gameRunning = false;
  
  // Clear timer
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = 0;
  }
  
  // Determine winner
  let resultText = 'Tie';
  if (state.p1Health > state.p2Health) {
    resultText = 'Player I Wins';
  } else if (state.p2Health > state.p1Health) {
    resultText = 'Player II Wins';
  }
  
  // Show results
  hudResult.textContent = resultText;
  hudResult.classList.remove('hidden');
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

// New attack functions for Smash Bros style
function beginAttack(entity, attackType) { 
  const a = entity.userData.attack; 
  if(a.cooldown > 0 || a.frame > 0 || entity.userData.hitstun > 0 || entity.userData.shielding) return; 
  a.frame = 1; 
  a.type = attackType;
}

// Shield mechanics
function toggleShield(entity, isShielding) {
  if (entity.userData.hitstun > 0) return;
  
  if (isShielding && !entity.userData.shielding) {
    entity.userData.shielding = true;
    entity.userData.shieldFrames = SHIELD_FRAMES;
    // Visual shield effect
    entity.scale.setScalar(0.9);
    if (entity.userData.core) {
      entity.userData.core.material.emissiveIntensity = 0.8;
      entity.userData.core.material.color.setHex(0x00aaff);
    }
  } else if (!isShielding && entity.userData.shielding) {
    entity.userData.shielding = false;
    entity.scale.copy(entity.userData.originalScale);
    if (entity.userData.core) {
      entity.userData.core.material.emissiveIntensity = 0.6;
      entity.userData.core.material.color.setHex(entity.userData.originalColor || 0xffffff);
    }
  }
  
  // Check for perfect shield timing
  if (isShielding) {
    checkPerfectShield(entity);
  }
}

// Roll mechanics
function beginRoll(entity, direction) {
  if (entity.userData.hitstun > 0 || entity.userData.rolling || entity.userData.shielding) return;
  
  entity.userData.rolling = true;
  entity.userData.rollFrames = ROLL_FRAMES;
  entity.userData.rollDirection = direction;
  entity.userData.invincible = true;
  entity.userData.invincibilityFrames = ROLL_INVINCIBILITY;
  
  // Roll movement
  entity.userData.vx = direction * ROLL_SPEED;
  entity.userData.vy = 0.1; // Small hop during roll
}

// Fast fall mechanics
function fastFall(entity) {
  if (entity.userData.vy < 0 && !entity.userData.grounded) {
    entity.userData.vy *= FAST_FALL_MULTIPLIER;
  }
}

// Update status indicators
function updateStatusIndicators() {
  const p1 = state.entities.p1;
  const p2 = state.entities.p2;
  
  if (p1 && p2) {
    // Player 1 status
    let p1Status = '';
    if (p1.userData.perfectShield) p1Status = 'Perfect Shield!';
    else if (p1.userData.shielding) p1Status = 'Shield';
    else if (p1.userData.rolling) p1Status = 'Roll';
    else if (p1.userData.invincible) p1Status = 'Invincible';
    else if (p1.userData.hitstun > 0) p1Status = 'Hitstun';
    else if (p1.userData.landingLag > 0) p1Status = 'Landing';
    else if (p1.userData.combo && p1.userData.combo.count > 1) p1Status = `Combo x${p1.userData.combo.count}`;
    else if (p1.userData.airAttack) p1Status = 'Air Attack';
    else if (p1.userData.dashing) p1Status = 'Dashing';
    else if (p1.userData.crouching) p1Status = 'Crouching';
    
    statusP1.textContent = p1Status;
    statusP1.className = 'status-indicator ' + (p1Status.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    
    // Player 2 status
    let p2Status = '';
    if (p2.userData.perfectShield) p2Status = 'Perfect Shield!';
    else if (p2.userData.shielding) p2Status = 'Shield';
    else if (p2.userData.rolling) p2Status = 'Roll';
    else if (p2.userData.invincible) p2Status = 'Invincible';
    else if (p2.userData.hitstun > 0) p2Status = 'Hitstun';
    else if (p2.userData.landingLag > 0) p2Status = 'Landing';
    else if (p2.userData.combo && p2.userData.combo.count > 1) p2Status = `Combo x${p2.userData.combo.count}`;
    else if (p2.userData.airAttack) p2Status = 'Air Attack';
    else if (p2.userData.dashing) p2Status = 'Dashing';
    else if (p2.userData.crouching) p2Status = 'Crouching';
    
    statusP2.textContent = p2Status;
    statusP2.className = 'status-indicator ' + (p2Status.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  }
}

// Enhanced attack system with better frame data
function updateAttackAndDamage(attacker, defender){
  const atk = attacker.userData.attack;
  if (atk.cooldown>0){ atk.cooldown--; return; }
  
  if (atk.frame>0){
    atk.frame++;
    const attackData = ATTACK_TYPES[atk.type];
    const core = attacker.userData.core; 
    
    if(core) core.material.emissiveIntensity = 0.6 + Math.sin(atk.frame*0.4)*0.4;
    
    // Enhanced attack scaling with breathing effect
    const attackScale = 1 + Math.sin(atk.frame*0.3)*0.08;
    const breathScale = Math.sin(atk.frame*0.2)*0.03;
    attacker.scale.set(
      attacker.userData.originalScale.x + attackScale + breathScale, 
      attacker.userData.originalScale.y + attackScale*0.8 + breathScale*0.5, 
      attacker.userData.originalScale.z + attackScale + breathScale
    );
    
    // Animate particles during attack
    if (attacker.userData.particles) {
      const particleChildren = attacker.userData.particles.children;
      for (let i = 0; i < particleChildren.length; i++) {
        const particle = particleChildren[i];
        const pulse = Math.sin(atk.frame * 0.5 + i) * 0.5;
        particle.material.emissiveIntensity = 0.6 + pulse * 0.4;
        particle.scale.setScalar(1 + pulse * 0.2);
      }
    }
    
    // Animate arms during attack
    if (attacker.userData.arms && atk.frame >= attackData.startup && atk.frame <= attackData.active) {
      const armChildren = attacker.userData.arms.children;
      if (armChildren.length >= 6) {
        const breed = attacker.userData.breed;
        
        if (breed === 'CAT') {
          // Cat attack pose - crouched and ready to pounce
          armChildren[0].rotation.z = -0.2; // Left upper arm
          armChildren[1].rotation.z = -0.4; // Left lower arm
          armChildren[3].rotation.z = 0.2;  // Right upper arm
          armChildren[4].rotation.z = 0.4;  // Right lower arm
          
          // Slight crouch effect
          attacker.scale.y = attacker.userData.originalScale.y * 0.95;
        } else if (breed === 'DRAGON') {
          // Dragon attack pose - wings spread, arms forward
          armChildren[0].rotation.z = -0.1; // Left upper arm
          armChildren[1].rotation.z = -0.2; // Left lower arm
          armChildren[3].rotation.z = 0.1;  // Right upper arm
          armChildren[4].rotation.z = 0.2;  // Right lower arm
          
          // Wings spread during attack
          const wings = attacker.children.filter(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry' && 
            child.position.y > 0.2
          );
          wings.forEach((wing, index) => {
            wing.rotation.z = index === 0 ? 0.5 : -0.5;
            wing.rotation.y = index === 0 ? -1.0 : 1.0;
          });
        } else {
          // Human attack pose - standard forward stance
          armChildren[0].rotation.z = -0.1; // Left upper arm
          armChildren[1].rotation.z = -0.3; // Left lower arm
          armChildren[3].rotation.z = 0.1;  // Right upper arm
          armChildren[4].rotation.z = 0.3;  // Right lower arm
        }
      }
    }
    
    // Attack hit detection
    if (atk.frame === attackData.startup){ 
      attacker.userData.facing = flipTowards(attacker, defender); 
      
      // Add combo tracking
      addCombo(attacker, atk.type);
      
      // Check if it's an air attack
      if (isAirAttack(attacker)) {
        attacker.userData.airAttack = true;
      }
    }
    
    if (atk.frame >= attackData.startup && atk.frame <= attackData.active){
      const dist = attacker.position.distanceTo(defender.position);
      if (dist < attackData.range && defender.userData.hitstun === 0 && !defender.userData.shielding){
        
        // Calculate damage with staling and modifiers
        let damage = attackData.damage * Math.pow(DAMAGE_STALING, attacker.userData.moveStale[atk.type] || 0);
        
        // Air attack penalty
        if (attacker.userData.airAttack) {
          damage *= AIR_ATTACK_MULTIPLIER;
        }
        
        // Combo bonus
        if (attacker.userData.combo && attacker.userData.combo.count > 1) {
          damage *= (1 + attacker.userData.combo.count * 0.1);
        }
        
        // Dash attack bonus
        if (attacker.userData.dashing) {
          damage *= 1.2;
        }
        
        // Ensure damage is positive and reasonable
        damage = Math.max(0.1, Math.min(damage, 50));
        
        // Update health with safety bounds
        if (defender === state.entities.p2){ 
          state.p2Health = Math.max(0, state.p2Health - damage * 0.1); 
          hudP2.style.width = state.p2Health + '%'; 
        } else { 
          state.p1Health = Math.max(0, state.p1Health - damage * 0.1); 
          hudP1.style.width = state.p1Health + '%'; 
        }
        
        // Debug: Log health after damage
        console.log('Health after attack:', state.p1Health, state.p2Health);
        
        // Apply hitstun and knockback
        defender.userData.hitstun = HITSTUN_FRAMES;
        const dir = Math.sign(defender.position.x - attacker.position.x) || 1;
        
        // Calculate knockback based on damage
        const defenderDamage = defender === state.entities.p2 ? (100 - state.p2Health) : (100 - state.p1Health);
        const knockbackMultiplier = BASE_KNOCKBACK + (defenderDamage * KNOCKBACK_GROWTH);
        let finalKnockback = attackData.knockback * knockbackMultiplier;
        
        // Combo knockback reduction
        if (attacker.userData.combo && attacker.userData.combo.count > 1) {
          finalKnockback *= (1 - attacker.userData.combo.count * 0.05);
        }
        
        defender.userData.vx += dir * finalKnockback;
        defender.userData.vy += finalKnockback * 0.5;
        
        // Visual hit effects
        const dcore = defender.userData.core; 
        if(dcore) dcore.material.emissiveIntensity = 1.0;
        defender.scale.set(0.9, 1.1, 0.9);
        
        // Flash particles on hit
        if (defender.userData.particles) {
          const particleChildren = defender.userData.particles.children;
          for (const particle of particleChildren) {
            particle.material.emissiveIntensity = 1.0;
            particle.material.color.setHex(0xffffff);
          }
        }
        
        // Increment move staling
        if (!attacker.userData.moveStale) attacker.userData.moveStale = {};
        attacker.userData.moveStale[atk.type] = (attacker.userData.moveStale[atk.type] || 0) + 1;
      }
    }
    
    // End attack
    if (atk.frame > attackData.endlag){ 
      atk.frame = 0; 
      atk.cooldown = ATTACK_COOLDOWN_FRAMES; 
      attacker.scale.copy(attacker.userData.originalScale); 
      const core = attacker.userData.core; if(core) core.material.emissiveIntensity = 0.6; 
      
      // Reset particles
      if (attacker.userData.particles) {
        const particleChildren = attacker.userData.particles.children;
        for (const particle of particleChildren) {
          particle.material.emissiveIntensity = 0.6;
          particle.scale.setScalar(1);
        }
      }
      
      // Reset arms to idle
      if (attacker.userData.arms) {
        const armChildren = attacker.userData.arms.children;
        if (armChildren.length >= 6) {
          armChildren[0].rotation.z = -0.3; // Left upper arm
          armChildren[1].rotation.z = -0.6; // Left lower arm
          armChildren[3].rotation.z = 0.3;  // Right upper arm
          armChildren[4].rotation.z = 0.6;  // Right lower arm
        }
      }
    }
  }
}
function applyPhysics(entity){
  // Handle rolling
  if (entity.userData.rolling) {
    entity.userData.rollFrames--;
    if (entity.userData.rollFrames <= 0) {
      entity.userData.rolling = false;
      entity.userData.invincible = false;
    }
  }
  
  // Handle shielding
  if (entity.userData.shielding) {
    entity.userData.shieldFrames--;
    if (entity.userData.shieldFrames <= 0) {
      toggleShield(entity, false); // Auto-release shield
    }
  }
  
  // Handle invincibility frames
  if (entity.userData.invincible) {
    entity.userData.invincibilityFrames--;
    if (entity.userData.invincibilityFrames <= 0) {
      entity.userData.invincible = false;
    }
    
    // Visual invincibility effect
    const flash = Math.floor(entity.userData.invincibilityFrames / 2) % 2;
    entity.visible = flash === 0;
  }
  
  // Apply gravity and movement
  entity.userData.vy = Math.max(MAX_FALL_SPEED, entity.userData.vy + GRAVITY*(1/60));
  entity.position.y += entity.userData.vy;
  
  // Ground collision
  const bodyBottom = entity.position.y - entity.userData.originalScale.y * 0.9 + 0.1;
  if (bodyBottom <= GROUND_Y - 1.25){ 
    entity.position.y = -1.25 + entity.userData.originalScale.y * 0.9 - 0.1; 
    entity.userData.vy = 0; 
    entity.userData.grounded = true;
    
    // Landing lag
    if (entity.userData.vy < -0.3) {
      entity.userData.landingLag = 4;
    }
  } else { 
    entity.userData.grounded = false; 
  }
  
  // Horizontal movement
  entity.position.x += entity.userData.vx;
  entity.position.x = clamp(entity.position.x, -ARENA_HALF_WIDTH, ARENA_HALF_WIDTH);
  
  // Apply friction (less friction when rolling)
  if (!entity.userData.rolling) {
    entity.userData.vx *= HORIZ_FRICTION;
  }
  
  // Handle landing lag
  if (entity.userData.landingLag > 0) {
    entity.userData.landingLag--;
    entity.userData.vx *= 0.5; // Reduced movement during landing lag
  }
}
function updateGame(dt){
  // Only update if we're in the game scene AND the game is actually running
  if (state.scene !== 'game' || !state.gameRunning) {
    return;
  }
  
  const p1 = state.entities.p1;
  const p2 = state.entities.p2;
  
  if (!p1 || !p2) {
    console.log('Missing entities, skipping update');
    return;
  }
  
  // Health validation check - ensure health is never negative
  if (state.p1Health < 0 || state.p2Health < 0 || isNaN(state.p1Health) || isNaN(state.p2Health)) {
    console.log('Health corruption detected, resetting:', state.p1Health, state.p2Health);
    state.p1Health = Math.max(0, state.p1Health);
    state.p2Health = Math.max(0, state.p2Health);
    hudP1.style.width = state.p1Health + '%';
    hudP2.style.width = state.p2Health + '%';
  }
  
  // Player 1 controls (WASD + Space/Shift/Ctrl/Alt)
  if (p1.userData.hitstun <= 0 && !p1.userData.rolling) {
    // Movement
    if(inputs.keys.has('a')){ p1.userData.vx -= HORIZ_ACCEL; p1.userData.facing = -1; }
    if(inputs.keys.has('d')){ p1.userData.vx += HORIZ_ACCEL; p1.userData.facing = 1; }
    
    // Jump
    if(inputs.keys.has('w') && p1.userData.grounded && p1.userData.landingLag <= 0){ 
      p1.userData.vy = JUMP_VELOCITY; 
      p1.userData.grounded = false; 
    }
    
    // Fast fall
    if(inputs.keys.has('s') && !p1.userData.grounded) {
      fastFall(p1);
    }
    
    // Attacks
    if(inputs.keys.has(' ')) beginAttack(p1, 'NEUTRAL'); // Neutral attack
    if(inputs.keys.has('Shift')) beginAttack(p1, 'SIDE'); // Side attack
    if(inputs.keys.has('Control')) beginAttack(p1, 'UP'); // Up attack
    if(inputs.keys.has('Alt')) beginAttack(p1, 'DOWN'); // Down attack
    
    // Shield
    if(inputs.keys.has('q')) {
      toggleShield(p1, true);
    } else if (p1.userData.shielding) {
      toggleShield(p1, false);
    }
    
    // Roll
    if(inputs.keys.has('e') && p1.userData.grounded) {
      beginRoll(p1, p1.userData.facing);
    }
  }
  
  // Player 2 controls (Arrow Keys + Enter/R/T/Y + F/G)
  if (p2.userData.hitstun <= 0 && !p2.userData.rolling) {
    // Movement
    if(inputs.keys.has('ArrowLeft')){ p2.userData.vx -= HORIZ_ACCEL; p2.userData.facing = -1; }
    if(inputs.keys.has('ArrowRight')){ p2.userData.vx += HORIZ_ACCEL; p2.userData.facing = 1; }
    
    // Jump
    if(inputs.keys.has('ArrowUp') && p2.userData.grounded && p2.userData.landingLag <= 0){ 
      p2.userData.vy = JUMP_VELOCITY; 
      p2.userData.grounded = false; 
    }
    
    // Fast fall
    if(inputs.keys.has('ArrowDown') && !p2.userData.grounded) {
      fastFall(p2);
    }
    
    // Attacks
    if(inputs.keys.has('Enter')) beginAttack(p2, 'NEUTRAL'); // Neutral attack
    if(inputs.keys.has('KeyR')) beginAttack(p2, 'SIDE'); // Side attack (R key)
    if(inputs.keys.has('KeyT')) beginAttack(p2, 'UP'); // Up attack (T key)
    if(inputs.keys.has('KeyY')) beginAttack(p2, 'DOWN'); // Down attack (Y key)
    
    // Shield
    if(inputs.keys.has('KeyF')) {
      toggleShield(p2, true);
    } else if (p2.userData.shielding) {
      toggleShield(p2, false);
    }
    
    // Roll
    if(inputs.keys.has('KeyG') && p2.userData.grounded) {
      beginRoll(p2, p2.userData.facing);
    }
  }
  
  // Apply speed limits
  p1.userData.vx = clamp(p1.userData.vx, -HORIZ_SPEED, HORIZ_SPEED);
  p2.userData.vx = clamp(p2.userData.vx, -HORIZ_SPEED, HORIZ_SPEED);
  
  // Update attacks and damage
  updateAttackAndDamage(p1, p2);
  updateAttackAndDamage(p2, p1);
  
  // Update entity states
  for (const entity of [p1, p2]){ 
    if(entity.userData.hitstun > 0) entity.userData.hitstun--; 
    
    // Update combo timer
    if (entity.userData.combo) {
      entity.userData.combo.timer++;
    }
    
    // Update perfect shield
    if (entity.userData.perfectShield) {
      entity.userData.perfectShieldFrames--;
      if (entity.userData.perfectShieldFrames <= 0) {
        entity.userData.perfectShield = false;
        if (entity.userData.core) {
          entity.userData.core.material.emissiveIntensity = 0.6;
          entity.userData.core.material.color.setHex(entity.userData.originalColor || 0xffffff);
        }
      }
    }
    
    // Add movement options
    addMovementOptions(entity);
    
    // Reset scale and effects
    entity.scale.x += (entity.userData.originalScale.x - entity.scale.x) * 0.15; 
    entity.scale.y += (entity.userData.originalScale.y - entity.scale.y) * 0.15; 
    entity.scale.z += (entity.userData.originalScale.z - entity.scale.z) * 0.15; 
    
    const core = entity.userData.core; 
    if(core) core.material.emissiveIntensity += (0.6 - core.material.emissiveIntensity) * 0.1; 
  }
  
  // Update status indicators
  updateStatusIndicators();

  // Apply physics
  applyPhysics(p1); 
  applyPhysics(p2);
  
  // Check for game end - ONLY if game is running and health is actually 0
  if (state.gameRunning && (state.p1Health <= 0 || state.p2Health <= 0)) {
    console.log('Health check triggered:', state.p1Health, state.p2Health);
    
    // Final safety check
    if (state.p1Health <= 0 || state.p2Health <= 0) {
      console.log('Game end condition met, calling endGame');
      endGame();
    }
  }
}

function cleanupGameEntities() {
  // Stop the game
  state.gameRunning = false;
  
  // Clear timer
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = 0;
  }
  
  // Remove entities from scene
  for (const key of ['p1', 'p2']) {
    const node = state.entities[key];
    if (node) { 
      scene.remove(node); 
      state.entities[key] = null; 
    }
  }
  
  // Hide all result elements
  hudResult.classList.add('hidden');
  postMatch.classList.add('hidden');
}

function rematch() {
  if (state.scene !== 'game') return;
  cleanupGameEntities();
  startGame();
}

function backToSelect() {
  cleanupGameEntities();
  state.scene = 'select';
  showScreen('select');
  refreshSelectPreview();
}

function backToMenu() {
  cleanupGameEntities();
  state.scene = 'menu';
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
  const breed = node.userData.breed;
  const breedData = node.userData.breedData;
  
  node.userData.idle.t += 0.02 * (breedData?.animationSpeed || 1.0);
  const t = node.userData.idle.t + time * 0.001;
  node.position.y = Math.sin(t * 2) * 0.06;
  node.rotation.y += 0.004;

  // Pupils follow opponent/controls subtly
  const pupils = node.userData.pupils || [];
  for (const p of pupils) {
    p.position.x = Math.sign(Math.sin(t * 0.7)) * (breed === 'CAT' ? 0.25 : 0.28);
    p.position.y = (breed === 'DRAGON' ? 0.2 : 0.15) + Math.sin(t * 1.3) * 0.005;
    p.position.z = 0.92 + Math.cos(t * 1.1) * 0.005;
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

  // Enhanced arms with more natural movement
  if (node.userData.arms) {
    const spread = 1.2 + Math.sin(t * 1.5) * 0.1;
    const bob = Math.sin(t * 2.1) * 0.05;
    const swing = Math.sin(t * 1.8) * 0.15;
    
    // Animate each arm segment
    const armChildren = node.userData.arms.children;
    if (armChildren.length >= 6) { // 2 arms × 3 segments each
      // Left arm
      armChildren[0].rotation.z = -0.3 + swing * 0.1; // Upper arm
      armChildren[1].rotation.z = -0.6 + swing * 0.15; // Lower arm
      armChildren[2].position.set(-spread, 0.05 + bob, 0.2); // Hand
      
      // Right arm
      armChildren[3].rotation.z = 0.3 - swing * 0.1; // Upper arm
      armChildren[4].rotation.z = 0.6 - swing * 0.15; // Lower arm
      armChildren[5].position.set(spread, 0.05 - bob, 0.2); // Hand
    }
  }

  // Animate legs for walking-like movement
  if (node.userData.legs) {
    const legChildren = node.userData.legs.children;
    if (legChildren.length >= 6) { // 2 legs × 3 segments each
      const walkCycle = Math.sin(t * 3) * 0.1;
      const bounce = Math.sin(t * 2) * 0.05;
      
      // Left leg
      legChildren[0].rotation.x = walkCycle; // Upper leg
      legChildren[1].rotation.x = walkCycle * 0.5; // Lower leg
      legChildren[2].position.y = -1.45 + bounce; // Foot
      
      // Right leg (opposite phase)
      legChildren[3].rotation.x = -walkCycle; // Upper leg
      legChildren[4].rotation.x = -walkCycle * 0.5; // Lower leg
      legChildren[5].position.y = -1.45 - bounce; // Foot
    }
  }

  // Breed-specific animations
  if (breed === 'CAT') {
    // Cat ear twitching
    const ears = node.children.filter(child => child.geometry && child.geometry.type === 'ConeGeometry' && child.position.y > 0.7);
    ears.forEach((ear, index) => {
      const twitch = Math.sin(t * 4 + index) * 0.02;
      ear.rotation.z += twitch;
    });

    // Cat tail wagging
    const tailParts = node.children.filter(child => 
      child.geometry && child.geometry.type === 'SphereGeometry' && 
      child.position.x > 0.3 && child.position.y < -0.2
    );
    tailParts.forEach((part, index) => {
      const wag = Math.sin(t * 2 + index * 0.5) * 0.1;
      part.rotation.z = wag;
      part.rotation.y = Math.sin(t * 1.5 + index) * 0.05;
    });

    // Cat whisker movement
    const whiskers = node.children.filter(child => 
      child.geometry && child.geometry.type === 'CylinderGeometry' && 
      child.geometry.parameters.radius < 0.01
    );
    whiskers.forEach((whisker, index) => {
      const wiggle = Math.sin(t * 3 + index) * 0.02;
      whisker.rotation.z += wiggle;
    });
  }

  if (breed === 'DRAGON') {
    // Dragon wing flapping
    const wings = node.children.filter(child => 
      child.geometry && child.geometry.type === 'PlaneGeometry' && 
      child.position.y > 0.2
    );
    wings.forEach((wing, index) => {
      const flap = Math.sin(t * 1.5 + index * Math.PI) * 0.3;
      wing.rotation.z = (index === 0 ? 0.3 : -0.3) + flap;
      wing.rotation.y = (index === 0 ? -0.8 : 0.8) + Math.sin(t * 0.8) * 0.1;
    });

    // Dragon spike movement
    const spikes = node.children.filter(child => 
      child.geometry && child.geometry.type === 'ConeGeometry' && 
      child.position.y > 0.8
    );
    spikes.forEach((spike, index) => {
      const sway = Math.sin(t * 0.8 + index * 0.3) * 0.01;
      spike.rotation.z += sway;
    });

    // Dragon scale shimmer
    const scales = node.children.filter(child => 
      child.geometry && child.geometry.type === 'SphereGeometry' && 
      child.position.z > 0.9
    );
    scales.forEach((scale, index) => {
      const shimmer = Math.sin(t * 2 + index * 0.2) * 0.1;
      scale.material.emissiveIntensity = 0.1 + shimmer * 0.05;
    });
  }

  // Animate floating particles
  if (node.userData.particles) {
    const particleChildren = node.userData.particles.children;
    for (let i = 0; i < particleChildren.length; i++) {
      const particle = particleChildren[i];
      const angle = (i / particleChildren.length) * Math.PI * 2;
      const radius = 1.2 + Math.sin(t * 0.5 + i) * 0.2;
      const height = -0.5 + Math.sin(t * 1.2 + i * 0.5) * 0.3;
      
      particle.position.set(
        Math.cos(angle + t * 0.3) * radius,
        height,
        Math.sin(angle + t * 0.3) * radius
      );
      
      // Gentle rotation
      particle.rotation.y += 0.02;
      particle.rotation.z += 0.01;
    }
  }

  // Halo gentle spin or horn subtle tilt
  if (node.userData.halo) {
    node.userData.halo.rotation.z += 0.01;
    node.userData.halo.position.y = (breed === 'DRAGON' ? 1.0 : 0.8) + Math.sin(t * 1.5) * 0.02;
  }
  
  if (node.userData.horns && node.userData.horns.length) {
    for (const h of node.userData.horns) {
      h.rotation.y += 0.002;
      h.rotation.z += Math.sin(t * 0.8) * 0.001;
    }
  }

  // Animate antennae if present
  if (node.userData.antennae && node.userData.antennae.length >= 4) {
    const antennae = node.userData.antennae;
    const wiggle = Math.sin(t * 2.5) * 0.05;
    
    // Left antenna
    antennae[0].rotation.z = -0.15 + wiggle;
    antennae[2].position.y = 0.9 + Math.sin(t * 3) * 0.02; // Tip
    
    // Right antenna
    antennae[1].rotation.z = 0.15 - wiggle;
    antennae[3].position.y = 0.9 + Math.sin(t * 3 + Math.PI) * 0.02; // Tip
  }

  // Gentle breathing effect on the body
  const breath = Math.sin(t * 1.2) * 0.02;
  node.scale.x = node.userData.originalScale.x + breath;
  node.scale.y = node.userData.originalScale.y + breath * 0.5;
  node.scale.z = node.userData.originalScale.z + breath;
}

// Main loop
let last = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dtMs = now - last; 
  last = now; 
  const dt = Math.min(3.0, dtMs / 16.6667);

  controls.update();

  // Update selection previews idle motion when in select scene
  if (state.scene === 'select') {
    if (preview.p1) animateIdle(preview.p1, now);
    if (preview.p2) animateIdle(preview.p2, now);
  }

  // Update game entities idle animation when in game scene
  if (state.scene === 'game' && state.gameRunning) {
    if (state.entities.p1) animateIdle(state.entities.p1, now);
    if (state.entities.p2) animateIdle(state.entities.p2, now);
  }

  // Update game logic
  updateGame(dt);

  renderer.render(scene, camera);
}

// Start the animation loop immediately
tick(performance.now());

// Attack system - Smash Bros style
const ATTACK_TYPES = {
  NEUTRAL: { 
    name: 'Neutral', 
    damage: 6, 
    knockback: 0.6, 
    startup: 3, 
    active: 4, 
    endlag: 8, 
    range: 1.0,
    description: 'Quick jab, low knockback'
  },
  SIDE: { 
    name: 'Side', 
    damage: 12, 
    knockback: 1.2, 
    startup: 6, 
    active: 8, 
    endlag: 16, 
    range: 1.6,
    description: 'Forward strike, good knockback'
  },
  UP: { 
    name: 'Up', 
    damage: 10, 
    knockback: 1.0, 
    startup: 5, 
    active: 7, 
    endlag: 14, 
    range: 1.4,
    description: 'Upward strike, vertical knockback'
  },
  DOWN: { 
    name: 'Down', 
    damage: 16, 
    knockback: 1.5, 
    startup: 10, 
    active: 12, 
    endlag: 24, 
    range: 1.2,
    description: 'Powerful downward strike, high knockback'
  }
};

// Gameplay constants - Smash Bros style

// Enhanced fighting mechanics (constants defined at top of file)

// Combo system
function addCombo(entity, attackType) {
  if (!entity.userData.combo) entity.userData.combo = { count: 0, lastAttack: null, timer: 0 };
  
  if (entity.userData.combo.lastAttack === attackType && entity.userData.combo.timer < COMBO_WINDOW) {
    entity.userData.combo.count++;
    entity.userData.combo.timer = 0;
  } else {
    entity.userData.combo.count = 1;
    entity.userData.combo.timer = 0;
  }
  
  entity.userData.combo.lastAttack = attackType;
}

// Perfect shield system
function checkPerfectShield(entity) {
  if (entity.userData.shielding && entity.userData.shieldFrames >= SHIELD_FRAMES - PERFECT_SHIELD_FRAMES) {
    entity.userData.perfectShield = true;
    entity.userData.perfectShieldFrames = 5;
    // Visual feedback for perfect shield
    if (entity.userData.core) {
      entity.userData.core.material.emissiveIntensity = 1.2;
      entity.userData.core.material.color.setHex(0x00ffff);
    }
  }
}

// Air attack system
function isAirAttack(entity) {
  return !entity.userData.grounded;
}

// Enhanced movement options
function addMovementOptions(entity) {
  // Dash attack (running + attack)
  if (Math.abs(entity.userData.vx) > HORIZ_SPEED * 0.8 && entity.userData.grounded) {
    entity.userData.dashing = true;
  } else {
    entity.userData.dashing = false;
  }
  
  // Crouch (hold down while grounded)
  if (entity.userData.grounded && entity.userData.vy < 0) {
    entity.userData.crouching = true;
    entity.scale.y = entity.userData.originalScale.y * 0.8;
  } else {
    entity.userData.crouching = false;
  }
}

// Initialize the app
function initializeApp() {
  // CRITICAL: Ensure no result elements are visible on startup
  const allResults = document.querySelectorAll('.result, .overlay');
  allResults.forEach(el => {
    el.classList.add('hidden');
  });
  
  // Ensure we start on menu screen
  state.scene = 'menu';
  state.gameRunning = false;
  
  // Show menu screen
  showScreen('menu');
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);


