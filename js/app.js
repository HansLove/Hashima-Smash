// App bootstrap: screens, state, and 3D scene orchestration (ES6 modules)

// Import Three.js and controls with error handling
let THREE;

function loadThreeJS() {
  return new Promise((resolve, reject) => {
    // Check if Three.js is already loaded
    if (window.THREE) {
      THREE = window.THREE;
      OrbitControls = window.THREE.OrbitControls;
      console.log('Three.js loaded from global scope');
      resolve(true);
      return;
    }

    // Load Three.js via script tag
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
    script.onload = () => {
      THREE = window.THREE;
      
      console.log('Three.js loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Three.js');
      reject(new Error('Three.js failed to load'));
    };
    document.head.appendChild(script);
  });
}

// Next-Generation Monster Factory
import { createNextGenHashima, setThreeJS, getThreeJS } from './monster-factory.js';

// Animation Controller for frame-based animations
class AnimationController {
  constructor(monster) {
    this.monster = monster;
    this.currentState = ANIMATION_STATES.IDLE;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.isGrounded = true;
    this.facingRight = true;
    this.velocity = { x: 0, y: 0 };
    this.animationQueue = [];
  }

  setState(newState, force = false) {
    const currentPriority = FRAME_DATA[this.currentState]?.priority || 0;
    const newPriority = FRAME_DATA[newState]?.priority || 0;
    
    if (force || newPriority >= currentPriority) {
      this.currentState = newState;
      this.currentFrame = 0;
      this.frameTimer = 0;
    }
  }

  update(deltaTime) {
    const frameData = FRAME_DATA[this.currentState];
    if (!frameData) return;

    this.frameTimer += deltaTime * 60; // 60 FPS
    
    if (this.frameTimer >= 1) {
      this.currentFrame++;
      this.frameTimer = 0;
      
      if (this.currentFrame >= frameData.frames) {
        if (frameData.loop) {
          this.currentFrame = 0;
        } else {
          // Animation finished, return to idle or next queued animation
          this.setState(ANIMATION_STATES.IDLE);
        }
      }
    }

    this.applyAnimation();
  }

  applyAnimation() {
    const frameData = FRAME_DATA[this.currentState];
    const progress = this.currentFrame / frameData.frames;
    
    switch (this.currentState) {
      case ANIMATION_STATES.IDLE:
        this.applyIdleAnimation(progress);
        break;
      case ANIMATION_STATES.WALK:
        this.applyWalkAnimation(progress);
        break;
      case ANIMATION_STATES.RUN:
        this.applyRunAnimation(progress);
        break;
      case ANIMATION_STATES.JUMP:
        this.applyJumpAnimation(progress);
        break;
      case ANIMATION_STATES.FALL:
        this.applyFallAnimation(progress);
        break;
      case ANIMATION_STATES.ATTACK_NEUTRAL:
        this.applyAttackNeutralAnimation(progress);
        break;
      case ANIMATION_STATES.ATTACK_SIDE:
        this.applyAttackSideAnimation(progress);
        break;
      case ANIMATION_STATES.ATTACK_UP:
        this.applyAttackUpAnimation(progress);
        break;
      case ANIMATION_STATES.ATTACK_DOWN:
        this.applyAttackDownAnimation(progress);
        break;
      case ANIMATION_STATES.HIT:
        this.applyHitAnimation(progress);
        break;
      case ANIMATION_STATES.SHIELD:
        this.applyShieldAnimation(progress);
        break;
    }
  }

  applyIdleAnimation(progress) {
    // Gentle breathing and subtle movements
    const breathe = Math.sin(progress * Math.PI * 2) * 0.02;
    this.monster.position.y = breathe;
    
    // Slight head movement
    if (this.monster.userData.eyeSystem) {
      const headBob = Math.sin(progress * Math.PI * 4) * 0.01;
      this.monster.userData.eyeSystem.eyes.position.y = headBob;
    }
  }

  applyWalkAnimation(progress) {
    const walkCycle = Math.sin(progress * Math.PI * 2) * 0.1;
    const legSwing = Math.sin(progress * Math.PI * 2) * 0.3;
    
    // Animate legs
    if (this.monster.userData.legs) {
      const legChildren = this.monster.userData.legs.children;
      if (legChildren.length >= 6) {
        // Left leg
        legChildren[0].rotation.x = legSwing;
        legChildren[1].rotation.x = legSwing * 0.5;
        
        // Right leg (opposite phase)
        legChildren[3].rotation.x = -legSwing;
        legChildren[4].rotation.x = -legSwing * 0.5;
      }
    }
    
    // Body bob
    this.monster.position.y = walkCycle * 0.05;
  }

  applyRunAnimation(progress) {
    const runCycle = Math.sin(progress * Math.PI * 4) * 0.15;
    const legSwing = Math.sin(progress * Math.PI * 4) * 0.4;
    
    // Animate legs more aggressively
    if (this.monster.userData.legs) {
      const legChildren = this.monster.userData.legs.children;
      if (legChildren.length >= 6) {
        legChildren[0].rotation.x = legSwing;
        legChildren[1].rotation.x = legSwing * 0.6;
        legChildren[3].rotation.x = -legSwing;
        legChildren[4].rotation.x = -legSwing * 0.6;
      }
    }
    
    // More pronounced body movement
    this.monster.position.y = runCycle * 0.08;
  }

  applyJumpAnimation(progress) {
    // Jump preparation and takeoff
    const jumpPrep = Math.sin(progress * Math.PI * 0.5) * 0.1;
    this.monster.position.y = jumpPrep;
    
    // Legs compress for jump
    if (this.monster.userData.legs) {
      const legChildren = this.monster.userData.legs.children;
      if (legChildren.length >= 6) {
        const compression = (1 - progress) * 0.2;
        legChildren[0].scale.y = 1 - compression;
        legChildren[3].scale.y = 1 - compression;
      }
    }
  }

  applyFallAnimation(progress) {
    // Arms spread for balance
    if (this.monster.userData.arms) {
      const armChildren = this.monster.userData.arms.children;
      if (armChildren.length >= 6) {
        armChildren[0].rotation.z = -0.5; // Left arm spread
        armChildren[3].rotation.z = 0.5;  // Right arm spread
      }
    }
  }

  applyAttackNeutralAnimation(progress) {
    // Quick jab motion
    const attackPhase = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
    const punch = Math.sin(attackPhase * Math.PI) * 0.2;
    
    if (this.monster.userData.arms) {
      const armChildren = this.monster.userData.arms.children;
      if (armChildren.length >= 6) {
        // Right arm punch
        armChildren[3].rotation.z = punch;
        armChildren[4].rotation.z = punch * 0.8;
      }
    }
  }

  applyAttackSideAnimation(progress) {
    // Side attack with body rotation
    const attackPhase = progress < 0.4 ? progress / 0.4 : (1 - progress) / 0.6;
    const punch = Math.sin(attackPhase * Math.PI) * 0.4;
    const bodyTurn = Math.sin(attackPhase * Math.PI) * 0.3;
    
    this.monster.rotation.y = this.facingRight ? bodyTurn : -bodyTurn;
    
    if (this.monster.userData.arms) {
      const armChildren = this.monster.userData.arms.children;
      if (armChildren.length >= 6) {
        const attackArm = this.facingRight ? 3 : 0; // Right or left arm
        armChildren[attackArm].rotation.z = punch;
        armChildren[attackArm + 1].rotation.z = punch * 0.9;
      }
    }
  }

  applyAttackUpAnimation(progress) {
    // Upward attack
    const attackPhase = progress < 0.5 ? progress / 0.5 : (1 - progress) / 0.5;
    const uppercut = Math.sin(attackPhase * Math.PI) * 0.6;
    
    if (this.monster.userData.arms) {
      const armChildren = this.monster.userData.arms.children;
      if (armChildren.length >= 6) {
        // Both arms for uppercut
        armChildren[0].rotation.x = -uppercut;
        armChildren[3].rotation.x = -uppercut;
        armChildren[1].rotation.x = -uppercut * 0.8;
        armChildren[4].rotation.x = -uppercut * 0.8;
      }
    }
  }

  applyAttackDownAnimation(progress) {
    // Downward attack
    const attackPhase = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
    const slam = Math.sin(attackPhase * Math.PI) * 0.5;
    
    if (this.monster.userData.arms) {
      const armChildren = this.monster.userData.arms.children;
      if (armChildren.length >= 6) {
        // Both arms for downward slam
        armChildren[0].rotation.x = slam;
        armChildren[3].rotation.x = slam;
        armChildren[1].rotation.x = slam * 0.9;
        armChildren[4].rotation.x = slam * 0.9;
      }
    }
  }

  applyHitAnimation(progress) {
    // Hit reaction with body shake
    const shake = Math.sin(progress * Math.PI * 8) * 0.05;
    this.monster.position.x += shake;
    this.monster.position.y += shake * 0.5;
    
    // Arms flail
    if (this.monster.userData.arms) {
      const armChildren = this.monster.userData.arms.children;
      if (armChildren.length >= 6) {
        const flail = Math.sin(progress * Math.PI * 6) * 0.3;
        armChildren[0].rotation.z = flail;
        armChildren[3].rotation.z = -flail;
      }
    }
  }

  applyShieldAnimation(progress) {
    // Shield pose with arms up
    if (this.monster.userData.arms) {
      const armChildren = this.monster.userData.arms.children;
      if (armChildren.length >= 6) {
        const shieldPose = 0.8;
        armChildren[0].rotation.x = -shieldPose;
        armChildren[3].rotation.x = -shieldPose;
        armChildren[1].rotation.x = -shieldPose * 0.7;
        armChildren[4].rotation.x = -shieldPose * 0.7;
      }
    }
  }
}

// Game constants - Smash Bros style (upgraded)
const ARENA_HALF_WIDTH = 8;
const GROUND_Y = 0;
const HORIZ_SPEED = 0.18; // Increased for better movement
const HORIZ_ACCEL = 0.012; // Increased acceleration
const HORIZ_FRICTION = 0.88; // Better friction
const GRAVITY = 0.018; // Increased gravity for better jumping
const JUMP_VELOCITY = 0.32; // Increased jump power
const MAX_FALL_SPEED = 0.35; // Increased fall speed
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

// Frame-based animation system
const ANIMATION_STATES = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  LAND: 'land',
  ATTACK_NEUTRAL: 'attack_neutral',
  ATTACK_SIDE: 'attack_side',
  ATTACK_UP: 'attack_up',
  ATTACK_DOWN: 'attack_down',
  ATTACK_AIR: 'attack_air',
  HIT: 'hit',
  HITSTUN: 'hitstun',
  SHIELD: 'shield',
  ROLL: 'roll',
  DODGE: 'dodge',
  DEATH: 'death'
};

// Frame data for each animation state
const FRAME_DATA = {
  [ANIMATION_STATES.IDLE]: { frames: 60, loop: true, priority: 0 },
  [ANIMATION_STATES.WALK]: { frames: 20, loop: true, priority: 1 },
  [ANIMATION_STATES.RUN]: { frames: 16, loop: true, priority: 2 },
  [ANIMATION_STATES.JUMP]: { frames: 8, loop: false, priority: 3 },
  [ANIMATION_STATES.FALL]: { frames: 12, loop: true, priority: 3 },
  [ANIMATION_STATES.LAND]: { frames: 6, loop: false, priority: 4 },
  [ANIMATION_STATES.ATTACK_NEUTRAL]: { frames: 15, loop: false, priority: 5 },
  [ANIMATION_STATES.ATTACK_SIDE]: { frames: 24, loop: false, priority: 5 },
  [ANIMATION_STATES.ATTACK_UP]: { frames: 20, loop: false, priority: 5 },
  [ANIMATION_STATES.ATTACK_DOWN]: { frames: 30, loop: false, priority: 5 },
  [ANIMATION_STATES.ATTACK_AIR]: { frames: 18, loop: false, priority: 5 },
  [ANIMATION_STATES.HIT]: { frames: 12, loop: false, priority: 6 },
  [ANIMATION_STATES.HITSTUN]: { frames: 20, loop: false, priority: 7 },
  [ANIMATION_STATES.SHIELD]: { frames: 30, loop: true, priority: 4 },
  [ANIMATION_STATES.ROLL]: { frames: 20, loop: false, priority: 6 },
  [ANIMATION_STATES.DODGE]: { frames: 15, loop: false, priority: 6 },
  [ANIMATION_STATES.DEATH]: { frames: 40, loop: false, priority: 8 }
};

// Attack system - Smash Bros style (moved to top for access)
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

// Visual effects
function createHitParticles(position) {
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = (position.x + 4) * 50 + window.innerWidth / 2 + 'px';
    particle.style.top = (-position.y + 2) * 50 + window.innerHeight / 2 + 'px';
    particle.style.animationDelay = (i * 0.1) + 's';
    document.body.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 3000);
  }
}

function createScreenShake(intensity = 5) {
  const shake = () => {
    const x = (Math.random() - 0.5) * intensity;
    const y = (Math.random() - 0.5) * intensity;
    renderer.domElement.style.transform = `translate(${x}px, ${y}px)`;
  };
  
  let count = 0;
  const maxShakes = 10;
  const shakeInterval = setInterval(() => {
    shake();
    count++;
    if (count >= maxShakes) {
      clearInterval(shakeInterval);
      renderer.domElement.style.transform = 'translate(0, 0)';
    }
  }, 50);
}

// Enhanced camera effects
function updateCameraEffects() {
  if (state.scene === 'game' && state.gameRunning) {
    const p1 = state.entities.p1;
    const p2 = state.entities.p2;
    
    if (p1 && p2) {
      // Dynamic camera positioning based on player positions
      const centerX = (p1.position.x + p2.position.x) / 2;
      const centerY = Math.max(p1.position.y, p2.position.y) + 1.2;
      
      // Smooth camera follow
      camera.position.x += (centerX - camera.position.x) * 0.02;
      camera.position.y += (centerY - camera.position.y) * 0.02;
      
      // Update controls target
      controls.target.set(centerX, centerY - 0.5, 0);
    }
  }
}

// Animate background bubbles
function animateBackgroundBubbles() {
  if (scene && scene.userData.backgroundBubbles) {
    const backgroundBubbles = scene.userData.backgroundBubbles;
    backgroundBubbles.children.forEach(bubble => {
      if (bubble.userData) {
        // Float up and down
        bubble.position.y = bubble.userData.originalY + Math.sin(Date.now() * bubble.userData.speed) * 0.5;
        // Gentle rotation
        bubble.rotation.y += bubble.userData.rotationSpeed;
      }
    });
  }
}

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
const btnShowcase = document.getElementById('btn-showcase');
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
let root, renderer, scene, camera, controls;

function initializeThreeJSScene() {
  root = document.getElementById('three-root');
  renderer = new THREE.WebGLRenderer({ 
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
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 3000);
  camera.position.set(0, 2.2, 9);

  // Create controls (always use fallback for now)
  controls = {
    enableDamping: () => {},
    enablePan: () => {},
    target: { set: () => {} },
    update: () => {}
  };
  console.log('Using fallback control system');

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
  
  // Store background bubbles for animation
  scene.userData.backgroundBubbles = backgroundBubbles;
  
  // Set THREE.js reference in monster factory
  setThreeJS(THREE);
  
  // Also set global reference for monster factory fallback
  window.THREE = THREE;
  
  // Create initial preview monsters
  createPreviewMonsters();
  
  console.log('Three.js scene initialized successfully');
}

// Enhanced color palette for next-gen monsters
const HASHIMA_COLORS = [
  0x00aa55, 0x3d77ff, 0xff3d8e, 0xffb100, 0x9a6cff, 0x00d4aa, 0xff6b35, 0x8e44ad, 
  0x16a085, 0xe74c3c, 0x9b59b6, 0x3498db, 0xe67e22, 0x2ecc71, 0xf1c40f, 0xe91e63
];

// Next-generation monster types with complex designs
const NEXT_GEN_MONSTERS = {
  BUBBLE: {
    name: "Classic Bubble",
    description: "Traditional bubble creatures with balanced features",
    style: "classic",
    rarity: "common"
  },
  LOBSTER: {
    name: "Lobster Claw",
    description: "Aquatic monsters with powerful lobster hands and spiked tails",
    style: "aquatic",
    rarity: "rare"
  },
  DRAGON: {
    name: "Dragon Lord",
    description: "Majestic creatures with dragon wings and flowing tails",
    style: "majestic",
    rarity: "epic"
  },
  CAT: {
    name: "Agile Cat",
    description: "Swift creatures with feathered tails and cat-like grace",
    style: "agile",
    rarity: "uncommon"
  },
  ALIEN: {
    name: "Alien Entity",
    description: "Otherworldly beings with geometric bodies and bat wings",
    style: "otherworldly",
    rarity: "legendary"
  },
  ROBOT: {
    name: "Mechanical Bot",
    description: "Industrial robots with square bodies and scaled tails",
    style: "mechanical",
    rarity: "rare"
  },
  DEMON: {
    name: "Dark Demon",
    description: "Menacing creatures with demonic eyes and tattered wings",
    style: "menacing",
    rarity: "epic"
  },
  BUTTERFLY: {
    name: "Ethereal Butterfly",
    description: "Delicate beings with butterfly wings and feathered tails",
    style: "delicate",
    rarity: "uncommon"
  },
  CRYSTAL: {
    name: "Crystal Guardian",
    description: "Crystalline entities with geometric bodies and insect wings",
    style: "crystalline",
    rarity: "legendary"
  },
  GHOST: {
    name: "Phantom Ghost",
    description: "Ethereal spirits with organic bodies and angel wings",
    style: "ethereal",
    rarity: "mythic"
  },
  MECHANICAL: {
    name: "Industrial Mech",
    description: "Advanced machines with mechanical bodies and industrial design",
    style: "industrial",
    rarity: "epic"
  },
  BUG: {
    name: "Chitinous Bug",
    description: "Insectoid creatures with compound eyes and crystalline wings",
    style: "chitinous",
    rarity: "rare"
  }
};

function seededRandom(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}








































// Game state
const state = {
  scene: 'menu', // 'menu' | 'select' | 'game'
  p1Index: 0,
  p2Index: 1,
  p1Breed: 'BUBBLE',
  p2Breed: 'CAT',
  p1Health: 100,
  p2Health: 100,
  timer: 60,
  timerId: 0,
  gameRunning: false, // New flag to track if game is actually running
  ready: false, // Flag to track if Three.js is fully initialized
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
    if (el) {
      el.classList.toggle('visible', v); 
      el.classList.toggle('hidden', !v); 
    }
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

btnShowcase.addEventListener('click', () => {
  window.open('monster-showcase.html', '_blank');
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

// Monster type selection handlers
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

// Selection preview meshes using next-gen monster factory
let preview = {
  p1: null,
  p2: null
};

function createPreviewMonsters() {
  if (!THREE || !scene) {
    console.log('Three.js or scene not ready for preview monsters');
    return;
  }
  
  try {
    // Remove existing previews if they exist
    if (preview.p1) scene.remove(preview.p1);
    if (preview.p2) scene.remove(preview.p2);
    
    // Create new preview monsters
    preview.p1 = createNextGenHashima(HASHIMA_COLORS[state.p1Index], state.p1Breed, 101);
    preview.p2 = createNextGenHashima(HASHIMA_COLORS[state.p2Index], state.p2Breed, 202);
    
    if (preview.p1 && preview.p2) {
      preview.p1.position.set(-2.1, 0, 0);
      preview.p2.position.set(2.1, 0, 0);

      // Initialize preview monsters
      preview.p1.userData.originalScale = new THREE.Vector3(1, 1, 1);
      preview.p2.userData.originalScale = new THREE.Vector3(1, 1, 1);
      preview.p1.userData.originalScale.copy(preview.p1.scale);
      preview.p2.userData.originalScale.copy(preview.p2.scale);

      scene.add(preview.p1, preview.p2);
      console.log('Preview monsters created successfully');
    } else {
      console.error('Failed to create preview monsters');
    }
  } catch (error) {
    console.error('Error creating preview monsters:', error);
  }
}

function refreshSelectPreview() {
  if (!THREE || !scene) return;
  createPreviewMonsters();
}

// Start the game scene
function startGame() {
  console.log('Starting game...');
  
  // Ensure everything is ready
  if (!state.ready || !THREE || !scene) {
    console.error('Game not ready. Three.js:', !!THREE, 'Scene:', !!scene, 'Ready:', state.ready);
    return;
  }
  
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
  if (scene && preview.p1 && preview.p2) {
    scene.remove(preview.p1, preview.p2);
  }

  // Spawn players using next-gen monster factory
  state.entities.p1 = createNextGenHashima(HASHIMA_COLORS[state.p1Index], state.p1Breed, 1111 + state.p1Index);
  state.entities.p2 = createNextGenHashima(HASHIMA_COLORS[state.p2Index], state.p2Breed, 2222 + state.p2Index);
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
  
  // Ensure originalScale is properly set
  if (!p1.userData.originalScale) {
    p1.userData.originalScale = new THREE.Vector3(1, 1, 1);
  }
  if (!p2.userData.originalScale) {
    p2.userData.originalScale = new THREE.Vector3(1, 1, 1);
  }
  
  // Store original scale for animations
  p1.userData.originalScale.copy(p1.scale);
  p2.userData.originalScale.copy(p2.scale);
  
  // Initialize animation controllers
  p1.userData.animationController = new AnimationController(p1);
  p2.userData.animationController = new AnimationController(p2);
  
  // Initialize additional movement state
  p1.userData.isGrounded = true;
  p1.userData.facingRight = true;
  p1.userData.velocity = { x: 0, y: 0 };
  p1.userData.health = 100;
  p1.userData.isAttacking = false;
  p1.userData.isHit = false;
  p1.userData.isShielding = false;
  p1.userData.attackCooldown = 0;
  p1.userData.hitstun = 0;
  
  p2.userData.isGrounded = true;
  p2.userData.facingRight = false;
  p2.userData.velocity = { x: 0, y: 0 };
  p2.userData.health = 100;
  p2.userData.isAttacking = false;
  p2.userData.isHit = false;
  p2.userData.isShielding = false;
  p2.userData.attackCooldown = 0;
  p2.userData.hitstun = 0;
  
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

// Enhanced health display with better formatting
function updateHealthDisplay() {
  if (state.entities.p1 && state.entities.p2) {
    // Ensure health is within bounds
    state.p1Health = Math.max(0, Math.min(100, state.p1Health));
    state.p2Health = Math.max(0, Math.min(100, state.p2Health));
    
    // Update health bars with smooth transitions
    hudP1.style.width = state.p1Health + '%';
    hudP2.style.width = state.p2Health + '%';
    
    // Add visual feedback for low health
    if (state.p1Health < 25) {
      hudP1.style.background = 'linear-gradient(90deg, #ff4444, #ff8888)';
    } else if (state.p1Health < 50) {
      hudP1.style.background = 'linear-gradient(90deg, #ffaa00, #ffdd44)';
    } else {
      hudP1.style.background = 'linear-gradient(90deg, #2d7efc, #5ff7ff)';
    }
    
    if (state.p2Health < 25) {
      hudP2.style.background = 'linear-gradient(90deg, #ff4444, #ff8888)';
    } else if (state.p2Health < 50) {
      hudP2.style.background = 'linear-gradient(90deg, #ffaa00, #ffdd44)';
    } else {
      hudP2.style.background = 'linear-gradient(90deg, #2d7efc, #5ff7ff)';
    }
  }
}

// Enhanced game validation
function validateGameState() {
  if (!state.entities.p1 || !state.entities.p2) {
    console.error('Missing game entities');
    return false;
  }
  
  if (isNaN(state.p1Health) || isNaN(state.p2Health)) {
    console.error('Invalid health values:', state.p1Health, state.p2Health);
    return false;
  }
  
  if (state.p1Health < 0 || state.p2Health < 0) {
    console.error('Negative health detected');
    state.p1Health = Math.max(0, state.p1Health);
    state.p2Health = Math.max(0, state.p2Health);
  }
  
  return true;
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
        
        // Ensure health bars are properly updated
        if (defender === state.entities.p2) {
          hudP2.style.width = Math.max(0, state.p2Health) + '%';
        } else {
          hudP1.style.width = Math.max(0, state.p1Health) + '%';
        }
        
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
        
        // Add damage flash effect to health bar
        if (defender === state.entities.p2) {
          hudP2.classList.add('damaged');
          setTimeout(() => hudP2.classList.remove('damaged'), 300);
        } else {
          hudP1.classList.add('damaged');
          setTimeout(() => hudP1.classList.remove('damaged'), 300);
        }
        
        // Create hit particles
        createHitParticles(defender.position);
        
        // Screen shake for powerful attacks
        if (damage > 8) {
          createScreenShake(3);
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
  
  // Ensure scene is properly initialized
  if (!scene || !state.entities.p1 || !state.entities.p2) {
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
    if(inputs.keys.has('a')){ p1.userData.velocity.x -= HORIZ_ACCEL; p1.userData.facing = -1; }
    if(inputs.keys.has('d')){ p1.userData.velocity.x += HORIZ_ACCEL; p1.userData.facing = 1; }
    
    // Jump
    if(inputs.keys.has('w') && p1.userData.isGrounded && p1.userData.landingLag <= 0){ 
      p1.userData.velocity.y = JUMP_VELOCITY; 
      p1.userData.isGrounded = false;
      // Set jump animation
      if (p1.userData.animationController) {
        p1.userData.animationController.setState(ANIMATION_STATES.JUMP);
      }
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
    
    // Special moves
    handleSpecialInputs(p1, true);
  }
  
  // Player 2 controls (Arrow Keys + Enter/R/T/Y + F/G)
  if (p2.userData.hitstun <= 0 && !p2.userData.rolling) {
    // Movement
    if(inputs.keys.has('ArrowLeft')){ p2.userData.velocity.x -= HORIZ_ACCEL; p2.userData.facing = -1; }
    if(inputs.keys.has('ArrowRight')){ p2.userData.velocity.x += HORIZ_ACCEL; p2.userData.facing = 1; }
    
    // Jump
    if(inputs.keys.has('ArrowUp') && p2.userData.isGrounded && p2.userData.landingLag <= 0){ 
      p2.userData.velocity.y = JUMP_VELOCITY; 
      p2.userData.isGrounded = false;
      // Set jump animation
      if (p2.userData.animationController) {
        p2.userData.animationController.setState(ANIMATION_STATES.JUMP);
      } 
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
    
    // Special moves
    handleSpecialInputs(p2, false);
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
  updateHealthDisplay(); // Call the new health display function
  
  // Validate game state
  if (!validateGameState()) {
    console.warn('Game state validation failed, attempting recovery...');
  }

  // Apply enhanced physics
  applyEnhancedPhysics(p1); 
  applyEnhancedPhysics(p2);
  
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

// Enhanced animation system using AnimationController
function animateMonster(node, time, deltaTime) {
  if (!node || !node.userData || !node.userData.animationController) return;
  
  // Update animation controller
  node.userData.animationController.update(deltaTime);
  
  // Update movement state
  updateMovementState(node);
  
  // Apply physics
  applyPhysicsForAnimation(node, deltaTime);
}

// Update movement state based on input and physics
function updateMovementState(node) {
  const controller = node.userData.animationController;
  if (!controller) return;
  
  // Update facing direction
  if (node.userData.velocity.x > 0.01) {
    controller.facingRight = true;
  } else if (node.userData.velocity.x < -0.01) {
    controller.facingRight = false;
  }
  
  // Update grounded state
  controller.isGrounded = node.userData.isGrounded;
  
  // Update velocity
  controller.velocity = { x: node.userData.velocity.x, y: node.userData.velocity.y };
  
  // Set animation state based on movement
  if (node.userData.isAttacking) {
    // Attack animations are handled by input system
  } else if (node.userData.isHit) {
    controller.setState(ANIMATION_STATES.HIT);
  } else if (node.userData.isShielding) {
    controller.setState(ANIMATION_STATES.SHIELD);
  } else if (!node.userData.isGrounded) {
    if (node.userData.velocity.y > 0) {
      controller.setState(ANIMATION_STATES.JUMP);
    } else {
      controller.setState(ANIMATION_STATES.FALL);
    }
  } else if (Math.abs(node.userData.velocity.x) > 0.1) {
    if (Math.abs(node.userData.velocity.x) > 0.3) {
      controller.setState(ANIMATION_STATES.RUN);
    } else {
      controller.setState(ANIMATION_STATES.WALK);
    }
  } else {
    controller.setState(ANIMATION_STATES.IDLE);
  }
}

// Apply physics to monster for animation system (renamed to avoid duplicate)
function applyPhysicsForAnimation(node, deltaTime) {
  if (!node.userData.velocity) return;
  
  // Apply gravity
  if (!node.userData.isGrounded) {
    node.userData.velocity.y -= GRAVITY * deltaTime * 60;
    if (node.userData.velocity.y < -MAX_FALL_SPEED) {
      node.userData.velocity.y = -MAX_FALL_SPEED;
    }
  }
  
  // Apply horizontal friction
  if (node.userData.isGrounded) {
    node.userData.velocity.x *= HORIZ_FRICTION;
    if (Math.abs(node.userData.velocity.x) < 0.01) {
      node.userData.velocity.x = 0;
    }
  }
  
  // Update position
  node.position.x += node.userData.velocity.x * deltaTime * 60;
  node.position.y += node.userData.velocity.y * deltaTime * 60;
  
  // Ground collision
  if (node.position.y <= GROUND_Y && node.userData.velocity.y <= 0) {
    node.position.y = GROUND_Y;
    node.userData.velocity.y = 0;
    node.userData.isGrounded = true;
    
    // Landing animation
    if (node.userData.animationController) {
      node.userData.animationController.setState(ANIMATION_STATES.LAND);
    }
  } else {
    node.userData.isGrounded = false;
  }
  
  // Arena boundaries
  if (node.position.x < -ARENA_HALF_WIDTH) {
    node.position.x = -ARENA_HALF_WIDTH;
    node.userData.velocity.x = 0;
  } else if (node.position.x > ARENA_HALF_WIDTH) {
    node.position.x = ARENA_HALF_WIDTH;
    node.userData.velocity.x = 0;
  }
}

// Legacy idle animation function (kept for compatibility)
function animateIdleLegacy(node, time) {
  if (!node || !node.userData) return;
  const breed = node.userData.breed;
  
  node.userData.idle.t += 0.02 * (node.userData.animationSpeed || 1.0);
  const t = node.userData.idle.t + time * 0.001;
  node.position.y = Math.sin(t * 2) * 0.06;
  // Removed constant spinning - characters should face their opponent

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

// Legacy idle animation function (kept for compatibility)
function animateIdle(node, time) {
  if (!node || !node.userData) return;
  const breed = node.userData.breed;
  
  node.userData.idle.t += 0.02 * (node.userData.animationSpeed || 1.0);
  const t = node.userData.idle.t + time * 0.001;
  node.position.y = Math.sin(t * 2) * 0.06;
  // Removed constant spinning - characters should face their opponent
}

// Enhanced monster animations with special effects
function animateMonsterSpecialEffects(entity, time) {
  if (!entity.userData) return;
  
  const breed = entity.userData.breed;
  const t = time * 0.001;
  
  // Special breed-specific effects
  if (breed === 'DRAGON') {
    // Dragon fire breath effect
    if (entity.userData.particles) {
      const particleChildren = entity.userData.particles.children;
      for (let i = 0; i < particleChildren.length; i++) {
        const particle = particleChildren[i];
        const fireIntensity = 0.6 + Math.sin(t * 3 + i) * 0.4;
        particle.material.emissiveIntensity = fireIntensity;
        particle.material.color.setHSL(0.05 + Math.sin(t * 2 + i) * 0.05, 0.8, 0.5);
      }
    }
  } else if (breed === 'GHOST') {
    // Ghost ethereal effect
    if (entity.userData.core) {
      const ethereal = 0.6 + Math.sin(t * 1.5) * 0.2;
      entity.userData.core.material.opacity = ethereal;
      entity.userData.core.material.emissiveIntensity = ethereal;
    }
  } else if (breed === 'CRYSTAL') {
    // Crystal shimmer effect
    if (entity.userData.particles) {
      const particleChildren = entity.userData.particles.children;
      for (let i = 0; i < particleChildren.length; i++) {
        const particle = particleChildren[i];
        const shimmer = Math.sin(t * 2 + i * 0.3) * 0.3;
        particle.material.emissiveIntensity = 0.7 + shimmer;
        particle.rotation.y += 0.02;
      }
    }
  }
}

// Special move system
function executeSpecialMove(entity, moveType) {
  if (!entity.userData || entity.userData.hitstun > 0) return;
  
  const breed = entity.userData.breed;
  
  switch (moveType) {
    case 'SPECIAL_NEUTRAL':
      if (breed === 'DRAGON') {
        // Dragon fire breath
        entity.userData.vx += entity.userData.facing * 0.3;
        entity.userData.vy += 0.2;
        createScreenShake(2);
      } else if (breed === 'GHOST') {
        // Ghost teleport
        entity.position.x += entity.userData.facing * 2;
        entity.userData.invincible = true;
        entity.userData.invincibilityFrames = 10;
      }
      break;
      
    case 'SPECIAL_SIDE':
      if (breed === 'CAT') {
        // Cat dash attack
        entity.userData.vx = entity.userData.facing * HORIZ_SPEED * 1.5;
        entity.userData.dashing = true;
      }
      break;
      
    case 'SPECIAL_UP':
      if (breed === 'BUTTERFLY') {
        // Butterfly double jump
        entity.userData.vy = JUMP_VELOCITY * 1.3;
      }
      break;
  }
}

// Enhanced input handling with special moves
function handleSpecialInputs(entity, isPlayer1) {
  if (entity.userData.hitstun > 0) return;
  
  if (isPlayer1) {
    // Player 1 special moves (WASD + Q/E)
    if (inputs.keys.has('q') && inputs.keys.has(' ')) {
      executeSpecialMove(entity, 'SPECIAL_NEUTRAL');
    }
    if (inputs.keys.has('e') && inputs.keys.has('Shift')) {
      executeSpecialMove(entity, 'SPECIAL_SIDE');
    }
    if (inputs.keys.has('q') && inputs.keys.has('Control')) {
      executeSpecialMove(entity, 'SPECIAL_UP');
    }
  } else {
    // Player 2 special moves (Arrow Keys + Enter/R/T/Y + F/G)
    if (inputs.keys.has('KeyF') && inputs.keys.has('Enter')) {
      executeSpecialMove(entity, 'SPECIAL_NEUTRAL');
    }
    if (inputs.keys.has('KeyG') && inputs.keys.has('KeyR')) {
      executeSpecialMove(entity, 'SPECIAL_SIDE');
    }
    if (inputs.keys.has('KeyF') && inputs.keys.has('KeyT')) {
      executeSpecialMove(entity, 'SPECIAL_UP');
    }
  }
}

// Game balance improvements
const GAME_BALANCE = {
  COMBO_DAMAGE_MULTIPLIER: 0.15, // 15% damage increase per combo hit
  PERFECT_SHIELD_REWARD: 0.8, // 80% damage reduction on perfect shield
  ROLL_INVINCIBILITY_FRAMES: 15,
  SHIELD_DRAIN_RATE: 0.5, // Shield depletes faster
  AIR_ATTACK_DAMAGE_PENALTY: 0.8, // Air attacks do 80% damage
  FAST_FALL_SPEED_MULTIPLIER: 1.8, // Faster falling
  LANDING_LAG_FRAMES: 6, // More landing lag for balance
  KNOCKBACK_SCALING: 0.15 // Knockback increases with damage
};

// Enhanced shield mechanics
function updateShieldMechanics(entity) {
  if (entity.userData.shielding) {
    // Shield drain over time
    entity.userData.shieldHealth = (entity.userData.shieldHealth || 100) - GAME_BALANCE.SHIELD_DRAIN_RATE;
    
    if (entity.userData.shieldHealth <= 0) {
      // Shield break!
      entity.userData.shielding = false;
      entity.userData.shieldBroken = true;
      entity.userData.shieldBrokenFrames = 60; // 1 second of vulnerability
      
      // Visual feedback
      if (entity.userData.core) {
        entity.userData.core.material.emissiveIntensity = 0;
        entity.userData.core.material.color.setHex(0xff0000);
      }
      
      // Screen shake for shield break
      createScreenShake(5);
    }
  } else if (entity.userData.shieldBroken) {
    entity.userData.shieldBrokenFrames--;
    if (entity.userData.shieldBrokenFrames <= 0) {
      entity.userData.shieldBroken = false;
      entity.userData.shieldHealth = 100;
      
      // Restore visual appearance
      if (entity.userData.core) {
        entity.userData.core.material.emissiveIntensity = 0.6;
        entity.userData.core.material.color.setHex(entity.userData.originalColor || 0xffffff);
      }
    }
  }
}

// Enhanced combo system
function updateComboSystem(entity) {
  if (entity.userData.combo && entity.userData.combo.timer > 0) {
    entity.userData.combo.timer--;
    
    // Combo window expires
    if (entity.userData.combo.timer <= 0) {
      entity.userData.combo.count = 0;
      entity.userData.combo.lastAttack = null;
    }
  }
}

// Enhanced movement physics
function applyEnhancedPhysics(entity) {
  // Apply gravity and movement
  entity.userData.vy = Math.max(MAX_FALL_SPEED, entity.userData.vy + GRAVITY*(1/60));
  entity.position.y += entity.userData.vy;
  
  // Ground collision
  const bodyBottom = entity.position.y - entity.userData.originalScale.y * 0.9 + 0.1;
  if (bodyBottom <= GROUND_Y - 1.25){ 
    entity.position.y = -1.25 + entity.userData.originalScale.y * 0.9 - 0.1; 
    entity.userData.vy = 0; 
    entity.userData.grounded = true;
    
    // Enhanced landing lag
    if (entity.userData.vy < -0.3) {
      entity.userData.landingLag = GAME_BALANCE.LANDING_LAG_FRAMES;
    }
  } else { 
    entity.userData.grounded = false; 
  }
  
  // Horizontal movement with momentum
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
  
  // Update shield mechanics
  updateShieldMechanics(entity);
  
  // Update combo system
  updateComboSystem(entity);
}

// Main loop
let last = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dtMs = now - last; 
  last = now; 
  const dt = Math.min(3.0, dtMs / 16.6667);

  try {
    if (controls) {
      controls.update();
    }

    // Update selection previews idle motion when in select scene
    if (state.scene === 'select' && preview && preview.p1 && preview.p2) {
      if (preview.p1 && preview.p1.userData) animateIdle(preview.p1, now);
      if (preview.p2 && preview.p2.userData) animateIdle(preview.p2, now);
    }

    // Update game entities with new animation system
    if (state.scene === 'game' && state.gameRunning) {
      if (state.entities.p1 && state.entities.p1.userData) {
        animateMonster(state.entities.p1, now, dt);
        animateMonsterSpecialEffects(state.entities.p1, now);
      }
      if (state.entities.p2 && state.entities.p2.userData) {
        animateMonster(state.entities.p2, now, dt);
        animateMonsterSpecialEffects(state.entities.p2, now);
      }
    }

    // Update game logic
    updateGame(dt);
    
    // Only render if scene is properly initialized
    if (scene && camera && renderer) {
      // Update camera effects
      updateCameraEffects();
      
      // Animate background bubbles
      animateBackgroundBubbles();
      
      // Update performance metrics
      updatePerformanceMetrics();

      renderer.render(scene, camera);
    }
  } catch (error) {
    console.error('Error in game loop:', error);
    // Try to recover gracefully
    if (state.scene === 'game' && !state.gameRunning) {
      console.log('Attempting to restart game...');
      try {
        startGame();
      } catch (restartError) {
        console.error('Failed to restart game:', restartError);
        attemptGameRecovery();
      }
    } else {
      // For other errors, attempt recovery
      attemptGameRecovery();
    }
  }
}

// Start the animation loop immediately
tick(performance.now());

// Initialize the app
async function initializeApp() {
  // Load Three.js first
  const threeLoaded = await loadThreeJS();
  if (!threeLoaded) {
    console.error('Failed to load Three.js. Game cannot start.');
    document.body.innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h1>Error Loading Game</h1><p>Failed to load Three.js library. Please check your internet connection and refresh the page.</p></div>';
    return;
  }
  
  // Initialize Three.js scene
  initializeThreeJSScene();
  
  // Wait a bit for everything to settle
  setTimeout(() => {
    // CRITICAL: Ensure no result elements are visible on startup
    const allResults = document.querySelectorAll('.result, .overlay');
    allResults.forEach(el => {
      el.classList.add('hidden');
    });
    
    // Ensure we start on menu screen
    state.scene = 'menu';
    state.gameRunning = false;
    
    // Initialize game state
    state.p1Health = 100;
    state.p2Health = 100;
    state.timer = 60;
    
    // Reset HUD
    if (hudP1) hudP1.style.width = '100%';
    if (hudP2) hudP2.style.width = '100%';
    if (hudTimer) hudTimer.textContent = '60';
    
    // Show menu screen
    showScreen('menu');
    
    // Add some ambient particles to the scene
    createAmbientParticles();
    
    // Mark as ready
    state.ready = true;
    
    console.log('Hashima Smash game initialized successfully!');
  }, 100);
}

// Create ambient particles for atmosphere
function createAmbientParticles() {
  const particleCount = 15;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = Math.random() * window.innerHeight + 'px';
    particle.style.animationDelay = Math.random() * 3 + 's';
    particle.style.animationDuration = (2 + Math.random() * 2) + 's';
    document.body.appendChild(particle);
  }
}

// Enhanced error recovery
function attemptGameRecovery() {
  console.log('Attempting game recovery...');
  
  try {
    // Clean up any existing game state
    cleanupGameEntities();
    
    // Reset game state
    state.p1Health = 100;
    state.p2Health = 100;
    state.timer = 60;
    state.gameRunning = false;
    
    // Return to menu
    state.scene = 'menu';
    showScreen('menu');
    
    console.log('Game recovery successful');
  } catch (error) {
    console.error('Game recovery failed:', error);
    // Last resort - reload the page
    if (confirm('Game recovery failed. Would you like to reload the page?')) {
      window.location.reload();
    }
  }
}

// Performance monitoring
let frameCount = 0;
let lastFpsTime = performance.now();
function updatePerformanceMetrics() {
  frameCount++;
  const now = performance.now();
  
  if (now - lastFpsTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastFpsTime));
    if (fps < 30) {
      console.warn('Low FPS detected:', fps);
    }
    frameCount = 0;
    lastFpsTime = now;
  }
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);


