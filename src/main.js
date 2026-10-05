import * as THREE from 'three';
import './style.css';

/* ---------- Three.js background ---------- */
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07070d, 0.035);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
camera.position.z = 14;

// Central wireframe icosahedron with a glowing inner core
const group = new THREE.Group();
scene.add(group);

const shell = new THREE.Mesh(
  new THREE.IcosahedronGeometry(3.4, 1),
  new THREE.MeshBasicMaterial({ color: 0x8b7cff, wireframe: true, transparent: true, opacity: 0.5 })
);
const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.8, 2),
  new THREE.MeshBasicMaterial({ color: 0x38e1c6, wireframe: true, transparent: true, opacity: 0.35 })
);
group.add(shell, core);

// Orbiting rings
const ringMat = new THREE.MeshBasicMaterial({ color: 0x38e1c6, transparent: true, opacity: 0.25 });
const rings = [5.2, 6.4].map((r, i) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), ringMat);
  ring.rotation.x = Math.PI / 2.4 + i * 0.6;
  ring.rotation.y = i * 0.8;
  group.add(ring);
  return ring;
});

// Particle field
const COUNT = 1600;
const pos = new Float32Array(COUNT * 3);
const col = new Float32Array(COUNT * 3);
const c1 = new THREE.Color(0x8b7cff);
const c2 = new THREE.Color(0x38e1c6);
for (let i = 0; i < COUNT; i++) {
  const r = 8 + Math.random() * 40;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  pos[i * 3 + 1] = (r * Math.sin(phi) * Math.sin(theta)) * 0.8;
  pos[i * 3 + 2] = r * Math.cos(phi) - 10;
  const c = c1.clone().lerp(c2, Math.random());
  col.set([c.r, c.g, c.b], i * 3);
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
const particles = new THREE.Points(
  pGeo,
  new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false })
);
scene.add(particles);

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // push the object to the right on wide screens so text stays readable
  group.position.x = w > 900 ? 4.5 : 0;
  group.scale.setScalar(w > 900 ? 1 : 0.7);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const mouse = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = new THREE.Clock();
let scrollY = 0;

function tick() {
  const t = clock.getElapsedTime();
  const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
  const progress = window.scrollY / maxScroll;
  scrollY += (progress - scrollY) * 0.06;

  shell.rotation.y = t * 0.12 + scrollY * 6;
  shell.rotation.x = t * 0.07;
  core.rotation.y = -t * 0.2;
  core.rotation.z = t * 0.1;
  rings.forEach((r, i) => (r.rotation.z = t * (0.1 + i * 0.07)));
  group.position.y = Math.sin(t * 0.6) * 0.25 + scrollY * 3;
  particles.rotation.y = t * 0.01 + scrollY * 1.2;

  camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04;
  camera.position.y += (-mouse.y * 1.0 - camera.position.y) * 0.04;
  camera.position.z = 14 - scrollY * 4;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  if (!reduceMotion) requestAnimationFrame(tick);
}
tick();

/* ---------- Scroll reveal & counters ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

function countUp(el) {
  const target = +el.dataset.count;
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 1400;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

document.getElementById('year').textContent = new Date().getFullYear();
