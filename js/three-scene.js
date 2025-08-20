// Basic Three.js scene to render a green placeholder character
// Uses ESM via unpkg for quick bootstrap; can be switched to local deps later

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

// Lights
const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 1.0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(3, 5, 3);
dir.castShadow = true;
scene.add(dir);

// Ground
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.2;
ground.receiveShadow = true;
scene.add(ground);

// Placeholder Hashima character: capsule-like body + eyes
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00aa55, metalness: 0.2, roughness: 0.6 });
const bodyGeo = new THREE.CapsuleGeometry(0.8, 1.8, 8, 16);
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
scene.add(body);

// Eyes
const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
const eyeIrisMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const eyeWhiteGeo = new THREE.SphereGeometry(0.15, 16, 16);
const irisGeo = new THREE.SphereGeometry(0.07, 16, 16);

const eyeLeft = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
eyeLeft.position.set(-0.22, 0.35, 0.7);
const eyeLeftIris = new THREE.Mesh(irisGeo, eyeIrisMat);
eyeLeftIris.position.set(-0.22, 0.33, 0.84);

const eyeRight = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
eyeRight.position.set(0.22, 0.35, 0.7);
const eyeRightIris = new THREE.Mesh(irisGeo, eyeIrisMat);
eyeRightIris.position.set(0.22, 0.33, 0.84);

for (const m of [eyeLeft, eyeLeftIris, eyeRight, eyeRightIris]) {
  m.castShadow = true;
  scene.add(m);
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

let t = 0;
function animate() {
  requestAnimationFrame(animate);
  t += 0.02;
  body.position.y = Math.sin(t) * 0.05; // subtle idle bob
  body.rotation.y += 0.005;
  controls.update();
  renderer.render(scene, camera);
}
animate();

