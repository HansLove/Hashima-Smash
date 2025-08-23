// Advanced Three.js scene for next-generation Hashima color-bubble monsters
// Features complex designs: lobster hands, tails, wings, different eyes, complex body types

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 2.2, 6);

// Enhanced lighting for bubble effects
const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 1.0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(3, 5, 3);
dir.castShadow = true;
scene.add(dir);

// Add dramatic point lights for bubble shimmer
const pointLight1 = new THREE.PointLight(0x00aaff, 0.8, 15);
pointLight1.position.set(-3, 3, 2);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff00aa, 0.6, 12);
pointLight2.position.set(3, 2, -2);
scene.add(pointLight2);

// Ground with bubble texture
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ 
  color: 0x0b0b0b, 
  roughness: 1,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.2;
ground.receiveShadow = true;
scene.add(ground);

// Enhanced bubble material system
function createBubbleMaterial(color, opacity = 0.9, metalness = 0.3, roughness = 0.4) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    transparent: true,
    opacity,
    envMapIntensity: 0.8
  });
}

// Complex eye system with multiple designs
function createComplexEyes(color, eyeType = 'NORMAL', seed = 1) {
  const rand = seededRandom(seed);
  const eyes = new THREE.Group();
  
  const eyeTypes = {
    NORMAL: { size: 0.18, irisSize: 0.08, highlightSize: 0.04 },
    CAT: { size: 0.16, irisSize: 0.09, highlightSize: 0.05 },
    DRAGON: { size: 0.22, irisSize: 0.12, highlightSize: 0.06 },
    ALIEN: { size: 0.20, irisSize: 0.15, highlightSize: 0.08 },
    ROBOT: { size: 0.19, irisSize: 0.10, highlightSize: 0.03 },
    DEMON: { size: 0.21, irisSize: 0.13, highlightSize: 0.07 }
  };
  
  const type = eyeTypes[eyeType] || eyeTypes.NORMAL;
  
  // Eye white
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.3,
    metalness: 0.1
  });
  
  // Iris with color variation
  const irisColor = new THREE.Color(color).offsetHSL(0.1, 0.2, -0.1);
  const eyeIrisMat = new THREE.MeshStandardMaterial({ 
    color: irisColor.getHex(),
    roughness: 0.1,
    metalness: 0.2
  });
  
  // Highlight
  const eyeHighlightMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    emissive: 0xffffff, 
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8
  });
  
  const eyeWhiteGeo = new THREE.SphereGeometry(type.size, 24, 24);
  const eyeIrisGeo = new THREE.SphereGeometry(type.irisSize, 20, 20);
  const eyeHighlightGeo = new THREE.SphereGeometry(type.highlightSize, 16, 16);
  
  // Left eye
  const eyeLeft = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  eyeLeft.position.set(-0.22, 0.35, 0.7);
  const eyeLeftIris = new THREE.Mesh(eyeIrisGeo, eyeIrisMat);
  eyeLeftIris.position.set(-0.22, 0.33, 0.84);
  const eyeLeftHighlight = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat);
  eyeLeftHighlight.position.set(-0.22, 0.33, 0.82);
  
  // Right eye
  const eyeRight = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  eyeRight.position.set(0.22, 0.35, 0.7);
  const eyeRightIris = new THREE.Mesh(eyeIrisGeo, eyeIrisMat);
  eyeRightIris.position.set(0.22, 0.33, 0.84);
  const eyeRightHighlight = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat);
  eyeRightHighlight.position.set(0.22, 0.33, 0.82);
  
  // Add special eye effects based on type
  if (eyeType === 'ALIEN') {
    // Alien eyes - larger, glowing
    eyeLeftIris.material.emissive = irisColor.getHex();
    eyeLeftIris.material.emissiveIntensity = 0.4;
    eyeRightIris.material.emissive = irisColor.getHex();
    eyeRightIris.material.emissiveIntensity = 0.4;
  } else if (eyeType === 'ROBOT') {
    // Robot eyes - geometric, mechanical
    eyeLeft.geometry = new THREE.BoxGeometry(type.size * 2, type.size * 2, type.size * 2);
    eyeRight.geometry = new THREE.BoxGeometry(type.size * 2, type.size * 2, type.size * 2);
  } else if (eyeType === 'DEMON') {
    // Demon eyes - slitted, menacing
    eyeLeftIris.geometry = new THREE.CylinderGeometry(type.irisSize, type.irisSize, type.irisSize * 0.3, 8);
    eyeRightIris.geometry = new THREE.CylinderGeometry(type.irisSize, type.irisSize, type.irisSize * 0.3, 8);
    eyeLeftIris.rotation.z = Math.PI / 2;
    eyeRightIris.rotation.z = Math.PI / 2;
  }
  
  for (const m of [eyeLeft, eyeLeftIris, eyeLeftHighlight, eyeRight, eyeRightIris, eyeRightHighlight]) {
    m.castShadow = true;
    eyes.add(m);
  }
  
  return { eyes, irises: [eyeLeftIris, eyeRightIris], highlights: [eyeLeftHighlight, eyeRightHighlight] };
}

// Lobster hand system with multiple claws
function createLobsterHands(color, seed = 1) {
  const rand = seededRandom(seed);
  const hands = new THREE.Group();
  
  const handMat = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(color).offsetHSL(0, -0.08, 0.08).getHex(), 
    roughness: 0.4,
    metalness: 0.2,
    transparent: true,
    opacity: 0.8
  });
  
  const clawMat = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(color).offsetHSL(0, -0.1, 0.1).getHex(), 
    roughness: 0.3,
    metalness: 0.4,
    transparent: true,
    opacity: 0.9
  });
  
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const handGroup = new THREE.Group();
    
    // Main hand body
    const handBody = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), handMat);
    handBody.position.set(side * 1.3, -0.45, 0.2);
    handBody.castShadow = true;
    handGroup.add(handBody);
    
    // Primary claw
    const primaryClaw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), clawMat);
    primaryClaw.position.set(side * (1.3 + 0.15), -0.45, 0.2);
    primaryClaw.rotation.z = side * 0.3;
    primaryClaw.castShadow = true;
    handGroup.add(primaryClaw);
    
    // Secondary claw
    const secondaryClaw = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 8), clawMat);
    secondaryClaw.position.set(side * (1.3 + 0.1), -0.45, 0.15);
    secondaryClaw.rotation.z = side * 0.2;
    secondaryClaw.castShadow = true;
    handGroup.add(secondaryClaw);
    
    // Small pincers
    for (let j = 0; j < 3; j++) {
      const pincer = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), clawMat);
      pincer.position.set(side * (1.3 + 0.05 + j * 0.02), -0.45 + j * 0.02, 0.25 + j * 0.02);
      pincer.rotation.z = side * (0.1 + j * 0.05);
      pincer.castShadow = true;
      handGroup.add(pincer);
    }
    
    hands.add(handGroup);
  }
  
  return hands;
}

// Complex tail system with multiple segments and types
function createComplexTail(color, tailType = 'NORMAL', seed = 1) {
  const rand = seededRandom(seed);
  const tail = new THREE.Group();
  
  const tailMat = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(color).offsetHSL(0, 0, 0.05).getHex(),
    transparent: true,
    opacity: 0.8
  });
  
  const tailTypes = {
    NORMAL: { segments: 4, size: 0.08, length: 0.8 },
    LONG: { segments: 8, size: 0.06, length: 1.2 },
    SPIKED: { segments: 6, size: 0.09, length: 1.0 },
    FEATHERED: { segments: 5, size: 0.07, length: 0.9 },
    SCALED: { segments: 7, size: 0.08, length: 1.1 }
  };
  
  const type = tailTypes[tailType] || tailTypes.NORMAL;
  
  // Main tail segments
  for (let i = 0; i < type.segments; i++) {
    const segmentSize = type.size - i * 0.01;
    const segment = new THREE.Mesh(new THREE.SphereGeometry(segmentSize, 12, 12), tailMat);
    segment.position.set(0.4 + i * 0.12, -0.3 - i * 0.08, 0.2);
    segment.castShadow = true;
    tail.add(segment);
    
    // Add spikes for spiked tail
    if (tailType === 'SPIKED' && i % 2 === 0) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 6), tailMat);
      spike.position.set(0.4 + i * 0.12, -0.3 - i * 0.08, 0.3);
      spike.rotation.x = Math.PI / 2;
      spike.castShadow = true;
      tail.add(spike);
    }
    
    // Add feathers for feathered tail
    if (tailType === 'FEATHERED' && i > 0) {
      const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.15, 4, 4), tailMat);
      feather.position.set(0.4 + i * 0.12, -0.3 - i * 0.08, 0.3);
      feather.rotation.z = Math.PI / 2;
      feather.castShadow = true;
      tail.add(feather);
    }
    
    // Add scales for scaled tail
    if (tailType === 'SCALED') {
      for (let j = 0; j < 2; j++) {
        const scale = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), tailMat);
        scale.position.set(0.4 + i * 0.12 + (j - 0.5) * 0.08, -0.3 - i * 0.08, 0.25);
        scale.scale.set(1, 0.5, 0.8);
        scale.castShadow = true;
        tail.add(scale);
      }
    }
  }
  
  // Tail tip
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(type.size * 0.7, 12, 12), tailMat);
  tailTip.position.set(0.4 + type.segments * 0.12, -0.3 - type.segments * 0.08, 0.2);
  tailTip.castShadow = true;
  tail.add(tailTip);
  
  return tail;
}

// Advanced wing system with multiple wing types
function createAdvancedWings(color, wingType = 'NORMAL', seed = 1) {
  const rand = seededRandom(seed);
  const wings = new THREE.Group();
  
  const wingTypes = {
    NORMAL: { size: { x: 0.8, y: 1.2 }, segments: 8, style: 'membrane' },
    BAT: { size: { x: 1.0, y: 1.4 }, segments: 12, style: 'leathery' },
    BIRD: { size: { x: 0.9, y: 1.3 }, segments: 16, style: 'feathered' },
    DRAGON: { size: { x: 1.2, y: 1.6 }, segments: 10, style: 'scaled' },
    BUTTERFLY: { size: { x: 0.7, y: 1.0 }, segments: 6, style: 'delicate' }
  };
  
  const type = wingTypes[wingType] || wingTypes.NORMAL;
  
  const wingMat = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(),
    transparent: true,
    opacity: 0.7,
    metalness: 0.4,
    roughness: 0.3
  });
  
  // Left wing
  const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(type.size.x, type.size.y, type.segments, type.segments), wingMat);
  leftWing.position.set(-0.8, 0.3, 0.2);
  leftWing.rotation.y = -0.8;
  leftWing.rotation.z = 0.3;
  leftWing.castShadow = true;
  wings.add(leftWing);
  
  // Right wing
  const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(type.size.x, type.size.y, type.segments, type.segments), wingMat);
  rightWing.position.set(0.8, 0.3, 0.2);
  rightWing.rotation.y = 0.8;
  rightWing.rotation.z = -0.3;
  rightWing.castShadow = true;
  wings.add(rightWing);
  
  // Add wing details based on type
  if (type.style === 'feathered') {
    // Add feather details
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 4; j++) {
        const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.12, 2, 2), wingMat);
        feather.position.set(
          (i - 4) * 0.15,
          0.3 + j * 0.2,
          0.2 + (i % 2) * 0.1
        );
        feather.rotation.z = (i % 2) * 0.1;
        feather.castShadow = true;
        wings.add(feather);
      }
    }
  } else if (type.style === 'scaled') {
    // Add scale details
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        const scale = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), wingMat);
        scale.position.set(
          (i - 3) * 0.2,
          0.3 + j * 0.25,
          0.25
        );
        scale.scale.set(1, 0.6, 0.8);
        scale.castShadow = true;
        wings.add(scale);
      }
    }
  }
  
  return wings;
}

// Complex body system with multiple body types
function createComplexBody(color, bodyType = 'NORMAL', seed = 1) {
  const rand = seededRandom(seed);
  const body = new THREE.Group();
  
  const bodyTypes = {
    NORMAL: { shape: 'sphere', scale: { x: 1, y: 1.2, z: 0.9 }, segments: 64 },
    ROUND: { shape: 'sphere', scale: { x: 1.1, y: 1.1, z: 1.1 }, segments: 48 },
    OVAL: { shape: 'capsule', scale: { x: 0.9, y: 1.3, z: 0.8 }, segments: 32 },
    SQUARE: { shape: 'box', scale: { x: 1, y: 1.2, z: 0.9 }, segments: 16 },
    HEXAGONAL: { shape: 'cylinder', scale: { x: 1, y: 1.2, z: 1 }, segments: 6 }
  };
  
  const type = bodyTypes[bodyType] || bodyTypes.NORMAL;
  
  const bodyMat = createBubbleMaterial(color, 0.9, 0.3, 0.4);
  
  let bodyGeo;
  switch (type.shape) {
    case 'capsule':
      bodyGeo = new THREE.CapsuleGeometry(0.9, 1.8, type.segments, 16);
      break;
    case 'box':
      bodyGeo = new THREE.BoxGeometry(1.8, 2.4, 1.8);
      break;
    case 'cylinder':
      bodyGeo = new THREE.CylinderGeometry(0.9, 0.9, 2.4, type.segments);
      break;
    default: // sphere
      bodyGeo = new THREE.SphereGeometry(0.9, type.segments, type.segments);
  }
  
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.scale.set(type.scale.x, type.scale.y, type.scale.z);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  body.add(bodyMesh);
  
  // Add body details based on type
  if (bodyType === 'HEXAGONAL') {
    // Add hexagonal pattern
    for (let i = 0; i < 6; i++) {
      const hex = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3, 1, 1), bodyMat);
      hex.position.set(
        Math.cos(i * Math.PI / 3) * 0.8,
        0,
        Math.sin(i * Math.PI / 3) * 0.8
      );
      hex.rotation.y = i * Math.PI / 3;
      hex.castShadow = true;
      body.add(hex);
    }
  }
  
  return body;
}

// Seeded random function
function seededRandom(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

// Create next-generation Hashima monster
function createNextGenHashima(color, monsterType = 'BUBBLE', seed = 1) {
  const rand = seededRandom(seed);
  const group = new THREE.Group();
  
  const monsterTypes = {
    BUBBLE: { body: 'NORMAL', eyes: 'NORMAL', hands: 'NORMAL', tail: 'NORMAL', wings: null },
    LOBSTER: { body: 'OVAL', eyes: 'ALIEN', hands: 'LOBSTER', tail: 'SPIKED', wings: null },
    DRAGON: { body: 'ROUND', eyes: 'DRAGON', hands: 'NORMAL', tail: 'LONG', wings: 'DRAGON' },
    CAT: { body: 'NORMAL', eyes: 'CAT', hands: 'NORMAL', tail: 'FEATHERED', wings: null },
    ALIEN: { body: 'HEXAGONAL', eyes: 'ALIEN', hands: 'NORMAL', tail: 'NORMAL', wings: 'BAT' },
    ROBOT: { body: 'SQUARE', eyes: 'ROBOT', hands: 'NORMAL', tail: 'SCALED', wings: null },
    DEMON: { body: 'OVAL', eyes: 'DEMON', hands: 'NORMAL', tail: 'SPIKED', wings: 'BAT' },
    BUTTERFLY: { body: 'ROUND', eyes: 'NORMAL', hands: 'NORMAL', tail: 'FEATHERED', wings: 'BUTTERFLY' }
  };
  
  const type = monsterTypes[monsterType] || monsterTypes.BUBBLE;
  
  // Create complex body
  const body = createComplexBody(color, type.body, seed);
  group.add(body);
  
  // Create complex eyes
  const eyeSystem = createComplexEyes(color, type.eyes, seed);
  group.add(eyeSystem.eyes);
  
  // Create hands (lobster or normal)
  if (type.hands === 'LOBSTER') {
    const hands = createLobsterHands(color, seed);
    group.add(hands);
  } else {
    // Normal hands
    const hands = new THREE.Group();
    const handMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, -0.08, 0.08).getHex(), 0.8);
    
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), handMat);
      hand.position.set(side * 1.3, -0.45, 0.2);
      hand.castShadow = true;
      hands.add(hand);
    }
    group.add(hands);
  }
  
  // Create complex tail
  if (type.tail) {
    const tail = createComplexTail(color, type.tail, seed);
    group.add(tail);
  }
  
  // Create advanced wings
  if (type.wings) {
    const wings = createAdvancedWings(color, type.wings, seed);
    group.add(wings);
  }
  
  // Add floating particles
  const particles = new THREE.Group();
  const particleMat = new THREE.MeshStandardMaterial({ 
    color: new THREE.Color(color).offsetHSL(0, 0, 0.3).getHex(),
    emissive: new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(),
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.7
  });
  
  const particleCount = monsterType === 'DRAGON' ? 10 : 6;
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
  
  // Store animation data
  group.userData = {
    monsterType,
    seed,
    particles,
    eyeSystem,
    idle: { t: Math.random() * Math.PI * 2 },
    blinkT: rand() * Math.PI * 2
  };
  
  return group;
}

// Create a showcase of different monster types
const monsterShowcase = [];
const colors = [0x00aa55, 0x3d77ff, 0xff3d8e, 0xffb100, 0x9a6cff, 0x00d4aa, 0xff6b35, 0x8e44ad];
const types = ['BUBBLE', 'LOBSTER', 'DRAGON', 'CAT', 'ALIEN', 'ROBOT', 'DEMON', 'BUTTERFLY'];

for (let i = 0; i < 8; i++) {
  const monster = createNextGenHashima(colors[i], types[i], 1000 + i);
  monster.position.set(
    (i - 4) * 2.5,
    0,
    0
  );
  monsterShowcase.push(monster);
  scene.add(monster);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.set(0, 0.6, 0);

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// Advanced animation system
function animateMonsters(time) {
  monsterShowcase.forEach((monster, index) => {
    const data = monster.userData;
    if (!data) return;
    
    data.idle.t += 0.02;
    const t = data.idle.t + time * 0.001;
    
    // Floating animation
    monster.position.y = Math.sin(t * 2 + index) * 0.1;
    monster.rotation.y += 0.005;
    
    // Blink animation
    if (data.blinkT !== undefined) {
      data.blinkT += 0.07;
      const blink = Math.max(0, Math.sin(data.blinkT)) ** 16;
      if (data.eyeSystem && data.eyeSystem.eyes) {
        data.eyeSystem.eyes.children.forEach(child => {
          if (child.geometry && child.geometry.type === 'SphereGeometry' && 
              child.material && child.material.color && 
              child.material.color.getHex() === 0xffffff) {
            child.scale.y = 1 - blink * 0.88;
          }
        });
      }
    }
    
    // Particle animation
    if (data.particles) {
      data.particles.children.forEach((particle, i) => {
        const angle = (i / data.particles.children.length) * Math.PI * 2;
        const radius = 1.2 + Math.sin(t * 0.5 + i) * 0.2;
        const height = -0.5 + Math.sin(t * 1.2 + i * 0.5) * 0.3;
        
        particle.position.set(
          Math.cos(angle + t * 0.3) * radius,
          height,
          Math.sin(angle + t * 0.3) * radius
        );
        
        particle.rotation.y += 0.02;
        particle.rotation.z += 0.01;
      });
    }
  });
}

let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.02;
  
  // Animate monsters
  animateMonsters(t * 1000);
  
  controls.update();
  renderer.render(scene, camera);
}
animate();

