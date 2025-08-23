// Three.js will be loaded by the main app
let THREE;

// Function to set THREE.js reference
function setThreeJS(threeJS) {
  THREE = threeJS;
}

// Alternative: get THREE from global scope if available
function getThreeJS() {
  if (!THREE && window.THREE) {
    THREE = window.THREE;
  }
  return THREE;
}

function seededRandom(seed) {
  let s = (seed >>> 0) || 1;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

function createBubbleMaterial(color, options = {}) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const {
    opacity = 0.9,
    metalness = 0.3,
    roughness = 0.4,
    emissive = null,
    emissiveIntensity = 0,
    transparent = true
  } = options;

  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    transparent,
    opacity,
    emissive: emissive || color,
    emissiveIntensity,
    envMapIntensity: 0.8
  });
}

function createComplexEyes(color, eyeType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const eyes = new THREE.Group();

  const eyeTypes = {
    NORMAL: { size: 0.18, irisSize: 0.08, highlightSize: 0.04, style: 'round' },
    CAT: { size: 0.16, irisSize: 0.09, highlightSize: 0.05, style: 'slit' },
    DRAGON: { size: 0.22, irisSize: 0.12, highlightSize: 0.06, style: 'reptile' },
    ALIEN: { size: 0.20, irisSize: 0.15, highlightSize: 0.08, style: 'glowing' },
    ROBOT: { size: 0.19, irisSize: 0.10, highlightSize: 0.03, style: 'geometric' },
    DEMON: { size: 0.21, irisSize: 0.13, highlightSize: 0.07, style: 'menacing' },
    BUG: { size: 0.17, irisSize: 0.11, highlightSize: 0.05, style: 'compound' },
    GHOST: { size: 0.23, irisSize: 0.14, highlightSize: 0.09, style: 'ethereal' }
  };

  const type = eyeTypes[eyeType] || eyeTypes.NORMAL;

  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1
  });

  const irisColor = new THREE.Color(color).offsetHSL(0.1, 0.2, -0.1);
  const eyeIrisMat = new THREE.MeshStandardMaterial({
    color: irisColor.getHex(),
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

  let eyeWhiteGeo, eyeIrisGeo, eyeHighlightGeo;

  switch (type.style) {
    case 'geometric':
      eyeWhiteGeo = new THREE.BoxGeometry(type.size * 2, type.size * 2, type.size * 2);
      eyeIrisGeo = new THREE.BoxGeometry(type.irisSize * 2, type.irisSize * 2, type.irisSize * 2);
      eyeHighlightGeo = new THREE.BoxGeometry(type.highlightSize * 2, type.highlightSize * 2, type.highlightSize * 2);
      break;
    case 'compound':
      eyeWhiteGeo = new THREE.SphereGeometry(type.size, 6, 6);
      eyeIrisGeo = new THREE.SphereGeometry(type.irisSize, 6, 6);
      eyeHighlightGeo = new THREE.SphereGeometry(type.highlightSize, 6, 6);
      break;
    default:
      eyeWhiteGeo = new THREE.SphereGeometry(type.size, 24, 24);
      eyeIrisGeo = new THREE.SphereGeometry(type.irisSize, 20, 20);
      eyeHighlightGeo = new THREE.SphereGeometry(type.highlightSize, 16, 16);
  }

  const eyeLeft = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  eyeLeft.position.set(-0.22, 0.35, 0.7);
  const eyeLeftIris = new THREE.Mesh(eyeIrisGeo, eyeIrisMat);
  eyeLeftIris.position.set(-0.22, 0.33, 0.84);
  const eyeLeftHighlight = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat);
  eyeLeftHighlight.position.set(-0.22, 0.33, 0.82);

  const eyeRight = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
  eyeRight.position.set(0.22, 0.35, 0.7);
  const eyeRightIris = new THREE.Mesh(eyeIrisGeo, eyeIrisMat);
  eyeRightIris.position.set(0.22, 0.33, 0.84);
  const eyeRightHighlight = new THREE.Mesh(eyeHighlightGeo, eyeHighlightMat);
  eyeRightHighlight.position.set(0.22, 0.33, 0.82);

  if (type.style === 'glowing') {
    eyeLeftIris.material.emissive = irisColor.getHex();
    eyeLeftIris.material.emissiveIntensity = 0.4;
    eyeRightIris.material.emissive = irisColor.getHex();
    eyeRightIris.material.emissiveIntensity = 0.4;
  } else if (type.style === 'menacing') {
    eyeLeftIris.geometry = new THREE.CylinderGeometry(type.irisSize, type.irisSize, type.irisSize * 0.3, 8);
    eyeRightIris.geometry = new THREE.CylinderGeometry(type.irisSize, type.irisSize, type.irisSize * 0.3, 8);
    eyeLeftIris.rotation.z = Math.PI / 2;
    eyeRightIris.rotation.z = Math.PI / 2;
  } else if (type.style === 'ethereal') {
    eyeLeft.material.transparent = true;
    eyeLeft.material.opacity = 0.6;
    eyeRight.material.transparent = true;
    eyeRight.material.opacity = 0.6;
    eyeLeftIris.material.emissive = irisColor.getHex();
    eyeLeftIris.material.emissiveIntensity = 0.6;
    eyeRightIris.material.emissive = irisColor.getHex();
    eyeRightIris.material.emissiveIntensity = 0.6;
  }

  for (const m of [eyeLeft, eyeLeftIris, eyeLeftHighlight, eyeRight, eyeRightIris, eyeRightHighlight]) {
    m.castShadow = true;
    eyes.add(m);
  }

  return { eyes, irises: [eyeLeftIris, eyeRightIris], highlights: [eyeLeftHighlight, eyeRightHighlight] };
}

function createLobsterHands(color, seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const hands = new THREE.Group();

  const handMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, -0.08, 0.08).getHex(), {
    opacity: 0.8,
    metalness: 0.2,
    roughness: 0.4
  });

  const clawMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, -0.1, 0.1).getHex(), {
    opacity: 0.9,
    metalness: 0.4,
    roughness: 0.3
  });

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const handGroup = new THREE.Group();

    const handBody = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), handMat);
    handBody.position.set(side * 1.3, -0.45, 0.2);
    handBody.castShadow = true;
    handGroup.add(handBody);

    const primaryClaw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 8), clawMat);
    primaryClaw.position.set(side * (1.3 + 0.15), -0.45, 0.2);
    primaryClaw.rotation.z = side * 0.3;
    primaryClaw.castShadow = true;
    handGroup.add(primaryClaw);

    const secondaryClaw = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 8), clawMat);
    secondaryClaw.position.set(side * (1.3 + 0.1), -0.45, 0.15);
    secondaryClaw.rotation.z = side * 0.2;
    secondaryClaw.castShadow = true;
    handGroup.add(secondaryClaw);

    for (let j = 0; j < 3; j++) {
      const pincer = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), clawMat);
      pincer.position.set(side * (1.3 + 0.05 + j * 0.02), -0.45 + j * 0.02, 0.25 + j * 0.02);
      pincer.rotation.z = side * (0.1 + j * 0.05);
      pincer.castShadow = true;
      handGroup.add(pincer);
    }

    const appendage = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6), clawMat);
    appendage.position.set(side * (1.3 + 0.2), -0.45, 0.1);
    appendage.rotation.z = side * 0.4;
    appendage.castShadow = true;
    handGroup.add(appendage);

    hands.add(handGroup);
  }

  return hands;
}

function createComplexTail(color, tailType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const tail = new THREE.Group();

  const tailMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.05).getHex(), {
    opacity: 0.8,
    metalness: 0.2,
    roughness: 0.4
  });

  const tailTypes = {
    NORMAL: { segments: 4, size: 0.08, length: 0.8, style: 'smooth' },
    LONG: { segments: 8, size: 0.06, length: 1.2, style: 'flowing' },
    SPIKED: { segments: 6, size: 0.09, length: 1.0, style: 'dangerous' },
    FEATHERED: { segments: 5, size: 0.07, length: 0.9, style: 'elegant' },
    SCALED: { segments: 7, size: 0.08, length: 1.1, style: 'armored' },
    TENTACLE: { segments: 10, size: 0.05, length: 1.5, style: 'squishy' },
    CRYSTAL: { segments: 5, size: 0.1, length: 0.8, style: 'geometric' },
    FLAME: { segments: 6, size: 0.08, length: 1.0, style: 'flickering' }
  };

  const type = tailTypes[tailType] || tailTypes.NORMAL;

  for (let i = 0; i < type.segments; i++) {
    const segmentSize = type.size - i * 0.01;
    let segmentGeo;

    switch (type.style) {
      case 'geometric':
        segmentGeo = new THREE.BoxGeometry(segmentSize * 2, segmentSize * 2, segmentSize * 2);
        break;
      case 'crystal':
        segmentGeo = new THREE.OctahedronGeometry(segmentSize);
        break;
      default:
        segmentGeo = new THREE.SphereGeometry(segmentSize, 12, 12);
    }

    const segment = new THREE.Mesh(segmentGeo, tailMat);
    segment.position.set(0.4 + i * 0.12, -0.3 - i * 0.08, 0.2);
    segment.castShadow = true;
    tail.add(segment);

    if (tailType === 'SPIKED' && i % 2 === 0) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 6), tailMat);
      spike.position.set(0.4 + i * 0.12, -0.3 - i * 0.08, 0.3);
      spike.rotation.x = Math.PI / 2;
      spike.castShadow = true;
      tail.add(spike);
    }

    if (tailType === 'FEATHERED' && i > 0) {
      const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.15, 4, 4), tailMat);
      feather.position.set(0.4 + i * 0.12, -0.3 - i * 0.08, 0.3);
      feather.rotation.z = Math.PI / 2;
      feather.castShadow = true;
      tail.add(feather);
    }

    if (tailType === 'SCALED') {
      for (let j = 0; j < 2; j++) {
        const scale = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), tailMat);
        scale.position.set(0.4 + i * 0.12 + (j - 0.5) * 0.08, -0.3 - i * 0.08, 0.25);
        scale.scale.set(1, 0.5, 0.8);
        scale.castShadow = true;
        tail.add(scale);
      }
    }

    if (tailType === 'TENTACLE' && i % 2 === 0) {
      const sucker = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.01, 4, 8), tailMat);
      sucker.position.set(0.4 + i * 0.12, -0.3 - i * 0.08, 0.25);
      sucker.rotation.x = Math.PI / 2;
      sucker.castShadow = true;
      tail.add(sucker);
    }

    if (tailType === 'CRYSTAL') {
      for (let j = 0; j < 3; j++) {
        const facet = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05, 1, 1), tailMat);
        facet.position.set(
          0.4 + i * 0.12 + Math.cos(j * Math.PI * 2 / 3) * 0.08,
          -0.3 - i * 0.08,
          0.2 + Math.sin(j * Math.PI * 2 / 3) * 0.08
        );
        facet.rotation.y = j * Math.PI * 2 / 3;
        facet.castShadow = true;
        tail.add(facet);
      }
    }
  }

  let tipGeo;
  switch (type.style) {
    case 'geometric':
      tipGeo = new THREE.ConeGeometry(type.size * 0.8, type.size * 1.2, 6);
      break;
    case 'crystal':
      tipGeo = new THREE.TetrahedronGeometry(type.size * 0.7);
      break;
    default:
      tipGeo = new THREE.SphereGeometry(type.size * 0.7, 12, 12);
  }

  const tailTip = new THREE.Mesh(tipGeo, tailMat);
  tailTip.position.set(0.4 + type.segments * 0.12, -0.3 - type.segments * 0.08, 0.2);
  tailTip.castShadow = true;
  tail.add(tailTip);

  return tail;
}

function createAdvancedWings(color, wingType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const wings = new THREE.Group();

  const wingTypes = {
    NORMAL: { size: { x: 0.8, y: 1.2 }, segments: 8, style: 'membrane' },
    BAT: { size: { x: 1.0, y: 1.4 }, segments: 12, style: 'leathery' },
    BIRD: { size: { x: 0.9, y: 1.3 }, segments: 16, style: 'feathered' },
    DRAGON: { size: { x: 1.2, y: 1.6 }, segments: 10, style: 'scaled' },
    BUTTERFLY: { size: { x: 0.7, y: 1.0 }, segments: 6, style: 'delicate' },
    INSECT: { size: { x: 0.8, y: 1.1 }, segments: 4, style: 'crystalline' },
    ANGEL: { size: { x: 1.1, y: 1.5 }, segments: 20, style: 'ethereal' },
    DEMON: { size: { x: 1.0, y: 1.3 }, segments: 14, style: 'tattered' }
  };

  const type = wingTypes[wingType] || wingTypes.NORMAL;

  const wingMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(), {
    opacity: 0.7,
    metalness: 0.4,
    roughness: 0.3
  });

  const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(type.size.x, type.size.y, type.segments, type.segments), wingMat);
  leftWing.position.set(-0.8, 0.3, 0.2);
  leftWing.rotation.y = -0.8;
  leftWing.rotation.z = 0.3;
  leftWing.castShadow = true;
  wings.add(leftWing);

  const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(type.size.x, type.size.y, type.segments, type.segments), wingMat);
  rightWing.position.set(0.8, 0.3, 0.2);
  rightWing.rotation.y = 0.8;
  rightWing.rotation.z = -0.3;
  rightWing.castShadow = true;
  wings.add(rightWing);

  if (type.style === 'feathered') {
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
  } else if (type.style === 'crystalline') {
    for (let i = 0; i < 4; i++) {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.05), wingMat);
      crystal.position.set(
        (i - 2) * 0.3,
        0.3 + (i % 2) * 0.2,
        0.3
      );
      crystal.castShadow = true;
      wings.add(crystal);
    }
  } else if (type.style === 'ethereal') {
    const glowMat = createBubbleMaterial(color, {
      opacity: 0.4,
      emissive: color,
      emissiveIntensity: 0.8
    });

    for (let i = 0; i < 6; i++) {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), glowMat);
      glow.position.set(
        (i - 3) * 0.25,
        0.3 + Math.sin(i) * 0.1,
        0.4
      );
      wings.add(glow);
    }
  }

  return wings;
}

function createComplexBody(color, bodyType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const body = new THREE.Group();

  const bodyTypes = {
    NORMAL: { shape: 'sphere', scale: { x: 1, y: 1.2, z: 0.9 }, segments: 64, style: 'smooth' },
    ROUND: { shape: 'sphere', scale: { x: 1.1, y: 1.1, z: 1.1 }, segments: 48, style: 'plump' },
    OVAL: { shape: 'capsule', scale: { x: 0.9, y: 1.3, z: 0.8 }, segments: 32, style: 'streamlined' },
    SQUARE: { shape: 'box', scale: { x: 1, y: 1.2, z: 0.9 }, segments: 16, style: 'angular' },
    HEXAGONAL: { shape: 'cylinder', scale: { x: 1, y: 1.2, z: 1 }, segments: 6, style: 'geometric' },
    CRYSTAL: { shape: 'octahedron', scale: { x: 1, y: 1.2, z: 1 }, segments: 8, style: 'faceted' },
    ORGANIC: { shape: 'torus', scale: { x: 1, y: 1.2, z: 1 }, segments: 32, style: 'flowing' },
    MECHANICAL: { shape: 'dodecahedron', scale: { x: 1, y: 1.2, z: 1 }, segments: 12, style: 'industrial' }
  };

  const type = bodyTypes[bodyType] || bodyTypes.NORMAL;

  const bodyMat = createBubbleMaterial(color, {
    opacity: 0.9,
    metalness: 0.3,
    roughness: 0.4
  });

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
    case 'octahedron':
      bodyGeo = new THREE.OctahedronGeometry(1.0);
      break;
    case 'torus':
      bodyGeo = new THREE.TorusGeometry(0.9, 0.3, type.segments, 16);
      break;
    case 'dodecahedron':
      bodyGeo = new THREE.DodecahedronGeometry(1.0);
      break;
    default: // sphere
      bodyGeo = new THREE.SphereGeometry(0.9, type.segments, type.segments);
  }

  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.scale.set(type.scale.x, type.scale.y, type.scale.z);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  body.add(bodyMesh);

  if (bodyType === 'HEXAGONAL') {
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
  } else if (bodyType === 'CRYSTAL') {
    for (let i = 0; i < 8; i++) {
      const facet = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2, 1, 1), bodyMat);
      facet.position.set(
        Math.cos(i * Math.PI / 4) * 0.7,
        Math.sin(i * Math.PI / 4) * 0.3,
        0.8
      );
      facet.rotation.y = i * Math.PI / 4;
      facet.castShadow = true;
      body.add(facet);
    }
  } else if (bodyType === 'MECHANICAL') {
    for (let i = 0; i < 4; i++) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), bodyMat);
      bolt.position.set(
        Math.cos(i * Math.PI / 2) * 0.8,
        Math.sin(i * Math.PI / 2) * 0.3,
        0.8
      );
      bolt.rotation.x = Math.PI / 2;
      bolt.castShadow = true;
      body.add(bolt);
    }
  }

  return body;
}

function createComplexArms(color, armType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const arms = new THREE.Group();

  const armMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, -0.08, 0.08).getHex(), {
    opacity: 0.8,
    metalness: 0.2,
    roughness: 0.4
  });

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    
    // Upper arm
    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.3, 8, 8), armMat);
    upperArm.position.set(side * 1.1, -0.2, 0.2);
    upperArm.rotation.z = side * 0.3;
    upperArm.castShadow = true;
    arms.add(upperArm);
    
    // Lower arm
    const lowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.25, 8, 8), armMat);
    lowerArm.position.set(side * (1.1 + side * 0.15), -0.4, 0.2);
    lowerArm.rotation.z = side * 0.6;
    lowerArm.castShadow = true;
    arms.add(lowerArm);
    
    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), armMat);
    hand.position.set(side * (1.1 + side * 0.3), -0.55, 0.2);
    hand.castShadow = true;
    arms.add(hand);
  }

  return arms;
}

function createComplexLegs(color, legType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const legs = new THREE.Group();

  const legMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, -0.08, 0.08).getHex(), {
    opacity: 0.8,
    metalness: 0.2,
    roughness: 0.4
  });

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    
    // Upper leg
    const upperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 8, 8), legMat);
    upperLeg.position.set(side * 0.4, -0.8, 0);
    upperLeg.rotation.x = 0.1;
    upperLeg.castShadow = true;
    legs.add(upperLeg);
    
    // Lower leg
    const lowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.35, 8, 8), legMat);
    lowerLeg.position.set(side * 0.4, -1.2, 0);
    lowerLeg.rotation.x = 0.1;
    lowerLeg.castShadow = true;
    legs.add(lowerLeg);
    
    // Foot
    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), legMat);
    foot.position.set(side * 0.4, -1.45, 0.1);
    foot.scale.set(1, 0.6, 1.2);
    foot.castShadow = true;
    legs.add(foot);
  }

  return legs;
}

function createAntennae(color, antennaType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const antennae = new THREE.Group();

  const antennaMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(), {
    opacity: 0.8,
    metalness: 0.3,
    roughness: 0.3
  });

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    
    // Base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), antennaMat);
    base.position.set(side * 0.3, 0.7, 0.6);
    base.rotation.z = side * 0.15;
    base.castShadow = true;
    antennae.add(base);
    
    // Tip
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), antennaMat);
    tip.position.set(side * 0.35, 0.9, 0.6);
    tip.castShadow = true;
    antennae.add(tip);
  }

  return antennae;
}

function createHorns(color, hornType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const horns = new THREE.Group();

  const hornMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.1).getHex(), {
    opacity: 0.9,
    metalness: 0.4,
    roughness: 0.2
  });

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 8), hornMat);
    horn.position.set(side * 0.2, 0.8, 0.5);
    horn.rotation.z = side * 0.1;
    horn.castShadow = true;
    horns.add(horn);
  }

  return horns;
}

function createHalo(color, haloType = 'NORMAL', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) return null;
  
  const rand = seededRandom(seed);
  const halo = new THREE.Group();

  const haloMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.3).getHex(), {
    opacity: 0.6,
    emissive: new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(),
    emissiveIntensity: 0.8,
    transparent: true
  });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 16), haloMat);
  ring.position.set(0, 0.8, 0);
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = false;
  halo.add(ring);

  return halo;
}

function createNextGenHashima(color, monsterType = 'BUBBLE', seed = 1) {
  const THREE = getThreeJS();
  if (!THREE) {
    console.error('THREE.js not available in monster factory');
    return null;
  }
  
  const rand = seededRandom(seed);
  const group = new THREE.Group();

  const monsterTypes = {
    BUBBLE: { body: 'NORMAL', eyes: 'NORMAL', hands: 'NORMAL', tail: 'NORMAL', wings: null, style: 'classic' },
    LOBSTER: { body: 'OVAL', eyes: 'ALIEN', hands: 'LOBSTER', tail: 'SPIKED', wings: null, style: 'aquatic' },
    DRAGON: { body: 'ROUND', eyes: 'DRAGON', hands: 'NORMAL', tail: 'LONG', wings: 'DRAGON', style: 'majestic' },
    CAT: { body: 'NORMAL', eyes: 'CAT', hands: 'NORMAL', tail: 'FEATHERED', wings: null, style: 'agile' },
    ALIEN: { body: 'HEXAGONAL', eyes: 'ALIEN', hands: 'NORMAL', tail: 'NORMAL', wings: 'BAT', style: 'otherworldly' },
    ROBOT: { body: 'SQUARE', eyes: 'ROBOT', hands: 'NORMAL', tail: 'SCALED', wings: null, style: 'mechanical' },
    DEMON: { body: 'OVAL', eyes: 'DEMON', hands: 'NORMAL', tail: 'SPIKED', wings: 'BAT', style: 'menacing' },
    BUTTERFLY: { body: 'ROUND', eyes: 'NORMAL', hands: 'NORMAL', tail: 'FEATHERED', wings: 'BUTTERFLY', style: 'delicate' },
    CRYSTAL: { body: 'CRYSTAL', eyes: 'GHOST', hands: 'NORMAL', tail: 'CRYSTAL', wings: 'INSECT', style: 'crystalline' },
    GHOST: { body: 'ORGANIC', eyes: 'GHOST', hands: 'NORMAL', tail: 'TENTACLE', wings: 'ANGEL', style: 'ethereal' },
    MECHANICAL: { body: 'MECHANICAL', eyes: 'ROBOT', hands: 'NORMAL', tail: 'SCALED', wings: null, style: 'industrial' },
    BUG: { body: 'OVAL', eyes: 'BUG', hands: 'NORMAL', tail: 'NORMAL', wings: 'INSECT', style: 'chitinous' }
  };

  const type = monsterTypes[monsterType] || monsterTypes.BUBBLE;

  // Create body
  const body = createComplexBody(color, type.body, seed);
  group.add(body);

  // Create core for shield effects
  const coreColor = new THREE.Color(color).offsetHSL(0, 0, 0.15);
  const coreMat = createBubbleMaterial(coreColor.getHex(), {
    emissive: coreColor.getHex(),
    emissiveIntensity: 0.6,
    opacity: 0.8
  });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 48), coreMat);
  core.castShadow = false;
  group.add(core);

  // Create eyes
  const eyeSystem = createComplexEyes(color, type.eyes, seed);
  group.add(eyeSystem.eyes);

  // Create arms
  const arms = createComplexArms(color, type.hands, seed);
  group.add(arms);

  // Create legs
  const legs = createComplexLegs(color, 'NORMAL', seed);
  group.add(legs);

  // Create hands
  if (type.hands === 'LOBSTER') {
    const hands = createLobsterHands(color, seed);
    group.add(hands);
  } else {
    const hands = new THREE.Group();
    const handMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, -0.08, 0.08).getHex(), {
      opacity: 0.8,
      metalness: 0.2,
      roughness: 0.4
    });

    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), handMat);
      hand.position.set(side * 1.3, -0.45, 0.2);
      hand.castShadow = true;
      hands.add(hand);
    }
    group.add(hands);
  }

  // Create tail
  if (type.tail) {
    const tail = createComplexTail(color, type.tail, seed);
    group.add(tail);
  }

  // Create wings
  if (type.wings) {
    const wings = createAdvancedWings(color, type.wings, seed);
    group.add(wings);
  }

  // Create antennae for certain types
  if (['ALIEN', 'BUG', 'GHOST'].includes(monsterType)) {
    const antennae = createAntennae(color, 'NORMAL', seed);
    group.add(antennae);
  }

  // Create horns for certain types
  if (['DRAGON', 'DEMON'].includes(monsterType)) {
    const horns = createHorns(color, 'NORMAL', seed);
    group.add(horns);
  }

  // Create halo for certain types
  if (['GHOST', 'ANGEL'].includes(monsterType)) {
    const halo = createHalo(color, 'NORMAL', seed);
    group.add(halo);
  }

  // Create floating particles
  const particles = new THREE.Group();
  const particleCount = monsterType === 'DRAGON' ? 12 :
                        monsterType === 'GHOST' ? 15 :
                        monsterType === 'CRYSTAL' ? 18 : 8;

  for (let i = 0; i < particleCount; i++) {
    let particleGeo, particleMat;

    if (type.style === 'crystalline') {
      particleGeo = new THREE.OctahedronGeometry(0.03 + rand() * 0.02);
      particleMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.3).getHex(), {
        opacity: 0.8,
        emissive: new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(),
        emissiveIntensity: 0.7
      });
    } else if (type.style === 'ethereal') {
      particleGeo = new THREE.SphereGeometry(0.04 + rand() * 0.03, 8, 8);
      particleMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.4).getHex(), {
        opacity: 0.6,
        emissive: new THREE.Color(color).offsetHSL(0, 0, 0.3).getHex(),
        emissiveIntensity: 0.9
      });
    } else {
      particleGeo = new THREE.SphereGeometry(0.03 + rand() * 0.02, 8, 8);
      particleMat = createBubbleMaterial(new THREE.Color(color).offsetHSL(0, 0, 0.3).getHex(), {
        opacity: 0.7,
        emissive: new THREE.Color(color).offsetHSL(0, 0, 0.2).getHex(),
        emissiveIntensity: 0.6
      });
    }

    const particle = new THREE.Mesh(particleGeo, particleMat);
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

  // Store animation data and references for game logic
  group.userData = {
    monsterType,
    breed: monsterType, // Add breed for compatibility
    style: type.style,
    seed,
    particles,
    eyeSystem,
    core,
    arms,
    legs,
    pupils: eyeSystem.irises,
    originalScale: new THREE.Vector3(1, 1, 1), // Add originalScale for animations
    idle: { t: Math.random() * Math.PI * 2 },
    blinkT: rand() * Math.PI * 2,
    animationSpeed: type.style === 'agile' ? 1.3 :
                    type.style === 'majestic' ? 0.8 :
                    type.style === 'ethereal' ? 1.5 : 1.0
  };

  // Store original scale for animations
  group.userData.originalScale.copy(group.scale);

  return group;
}

export {
  createNextGenHashima,
  createComplexEyes,
  createLobsterHands,
  createComplexTail,
  createAdvancedWings,
  createComplexBody,
  createComplexArms,
  createComplexLegs,
  createAntennae,
  createHorns,
  createHalo,
  createBubbleMaterial,
  setThreeJS,
  getThreeJS
};