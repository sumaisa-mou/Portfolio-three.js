import * as THREE from 'three';
import './game.css';

/* ---------- Story stops ---------- */
const PAL = [0xff2d95, 0x00e5ff, 0xffd400, 0x7c4dff, 0x00ff9d, 0xff7a00];
const hex = (n) => '#' + n.toString(16).padStart(6, '0');

const STATIONS = [
  {
    label: 'Hello', icon: '👋', tag: 'Start here',
    html: `<h2>Hi, I'm Sumaisa!</h2>
      <p><b>Senior Software Engineer</b> from Dhaka. I build production SaaS — backend systems and APIs in Laravel, Node.js and Python, with modern frontends in Vue 3, React and TypeScript.</p>
      <p style="margin-top:6px">Keep driving to ride through my career →</p>`,
  },
  {
    label: 'About', icon: '💡', tag: 'About me',
    html: `<h2>What I do</h2>
      <p>Full-stack engineer across cloud infrastructure, microservices, platform integrations and user-facing features — improving scalability, operational efficiency and product evolution.</p>
      <div class="chips"><span>99%+ uptime</span><span>100K+ jobs/day</span><span>~200ms queries</span></div>`,
  },
  {
    label: 'Sokrio', icon: '🏢', tag: '07/2021 – 12/2021',
    html: `<h2>Software Engineer <em>· Sokrio Technologies</em></h2>
      <p>Contributed to <b>multi-tenant SaaS architecture</b> — backend tenant isolation (dynamic DB provisioning, connection switching, queue context) and a TypeScript Vue 2 frontend with the Repository pattern, modular Vuex and RBAC.</p>`,
  },
  {
    label: 'weDevs', icon: '🚀', tag: '01/2022 – 12/2025',
    html: `<h2>Software Engineer <em>· weDevs</em></h2>
      <ul>
        <li>Async pipelines on <b>Redis &amp; Google Cloud Tasks</b> — up to <b>100K+ jobs/day</b>.</li>
        <li>Moved search from <b>Elasticsearch to MySQL</b>: ~<b>200ms</b> queries, no external infra cost.</li>
        <li>Built a <b>Vue 3 email builder package</b> used as an internal npm dependency.</li>
        <li>Shipped <b>AppSumo licensing</b> and <b>WooCommerce automation</b>.</li>
      </ul>`,
  },
  {
    label: 'Level up', icon: '⚡', tag: '01/2026 – 06/2026',
    html: `<h2>Software Engineer III <em>· weDevs</em></h2>
      <ul>
        <li><b>Laravel REST APIs</b> and <b>Node.js microservices</b> on MySQL &amp; DynamoDB, <b>99%+ uptime</b>.</li>
        <li><b>Vue 2 → Vue 3 → React migration</b> with TanStack Query/Table, Radix UI, Tailwind and shadcn/ui.</li>
      </ul>`,
  },
  {
    label: 'iBox Lab', icon: '🧪', tag: '08/2026 – Present',
    html: `<h2>Senior Software Engineer <em>· iBox Lab</em></h2>
      <p>Designing and building scalable software systems, with a focus on <b>system architecture</b> and <b>backend engineering</b>.</p>`,
  },
  {
    label: 'Skills', icon: '🛠️', tag: 'Toolbox',
    html: `<h2>My toolbox</h2>
      <div class="chips">
        ${['PHP', 'JavaScript', 'TypeScript', 'Python', 'Laravel', 'Node.js', 'Django', 'FastAPI', 'Vue 3', 'React 19', 'Tailwind', 'GCP', 'AWS', 'MySQL', 'PostgreSQL', 'DynamoDB', 'Redis', 'Elasticsearch', 'PHPUnit', 'RAG', 'ChromaDB', 'Ollama', 'Claude Code']
          .map((s) => `<span>${s}</span>`).join('')}
      </div>`,
  },
  {
    label: 'Projects', icon: '🎯', tag: 'Side quests',
    html: `<h2>Projects &amp; Education</h2>
      <ul>
        <li><b>DharNow</b> — product rental marketplace (Django REST, Celery, PostgreSQL, S3).</li>
        <li><b>Baayosh</b> — property rental platform (Laravel).</li>
        <li>Open source: RAG document retrieval &amp; a React email builder.</li>
        <li><b>B.Sc. CSE</b>, AIUB · CGPA 3.81/4.00</li>
      </ul>`,
  },
  {
    label: 'Contact', icon: '💌', tag: 'Finish line',
    html: `<h2>Let's build something! 🏁</h2>
      <p><a href="mailto:mousumaisa@gmail.com">mousumaisa@gmail.com</a> · 01843465335</p>
      <div class="links">
        <a href="https://linkedin.com/in/sumaisa-mou" target="_blank" rel="noopener">LinkedIn ↗</a>
        <a href="https://github.com/sumaisa-mou" target="_blank" rel="noopener">GitHub ↗</a>
        <a href="https://leetcode.com/u/Sumaisa" target="_blank" rel="noopener">LeetCode ↗</a>
        <a href="/">Classic view ↗</a>
      </div>`,
  },
];

const SPACING = 36;
const FIRST = 40;
const gateX = (i) => FIRST + i * SPACING;
const END_X = gateX(STATIONS.length - 1) + 45;
const ROAD_HALF = 5;

/* ---------- Renderer / scene ---------- */
const canvas = document.getElementById('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const FOG = 0x7a2f9e;
scene.background = new THREE.Color(FOG);
scene.fog = new THREE.Fog(FOG, 40, 260);
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 700);

scene.add(new THREE.HemisphereLight(0xffa6dc, 0x2a0f6b, 1.15));
const sunLight = new THREE.DirectionalLight(0xffb36b, 1.4);
sunLight.position.set(80, 40, -30);
scene.add(sunLight);
const rim = new THREE.DirectionalLight(0x6fe9ff, 1.0);
rim.position.set(-40, 25, 20);
scene.add(rim);

/* ---------- Sky: gradient dome, sun, stars ---------- */
const sky = new THREE.Group();
scene.add(sky);
sky.add(
  new THREE.Mesh(
    new THREE.SphereGeometry(400, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP;
        void main(){
          float h = clamp(normalize(vP).y, 0.0, 1.0);
          vec3 c = mix(vec3(1.0,0.78,0.35), vec3(1.0,0.25,0.62), smoothstep(0.0,0.08,h));
          c = mix(c, vec3(0.55,0.2,0.85), smoothstep(0.06,0.28,h));
          c = mix(c, vec3(0.13,0.05,0.38), smoothstep(0.22,0.65,h));
          c = mix(c, vec3(0.04,0.01,0.16), smoothstep(0.6,1.0,h));
          gl_FragColor = vec4(c,1.0);
        }`,
    })
  )
);
const sun = new THREE.Mesh(
  new THREE.CircleGeometry(70, 64),
  new THREE.ShaderMaterial({
    side: THREE.DoubleSide, fog: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv;
      void main(){
        vec2 p = vUv - 0.5;
        if (length(p) > 0.5) discard;
        float y = vUv.y;
        if (y < 0.55 && fract(y * 14.0) < (0.55 - y) * 1.3) discard;
        gl_FragColor = vec4(mix(vec3(1.0,0.2,0.55), vec3(1.0,0.9,0.25), y), 1.0);
      }`,
  })
);
sun.position.set(300, 52, 0);
sun.rotation.y = -Math.PI / 2;
sky.add(sun);
{
  const n = 500, p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, e = 0.25 + Math.random() * 1.2, r = 380;
    p[i * 3] = Math.cos(a) * Math.cos(e) * r;
    p[i * 3 + 1] = Math.sin(e) * r;
    p[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  sky.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2.4, color: 0xffffff, fog: false, sizeAttenuation: false })));
}

/* ---------- Ground & road ---------- */
function canvasTex(w, h, draw, rx, ry) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  return t;
}
const L = END_X + 400;
const CX = END_X / 2 + 60;

const groundTex = canvasTex(128, 128, (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#2a0f5e'); grad.addColorStop(1, '#4a1580');
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ff2d95'; g.fillRect(0, 0, w, 3);
  g.fillStyle = '#00e5ff'; g.fillRect(0, 0, 3, h);
}, L / 6, 800 / 6);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(L, 800), new THREE.MeshBasicMaterial({ map: groundTex }));
ground.rotation.x = -Math.PI / 2;
ground.position.set(CX, 0, 0);
scene.add(ground);

const roadTex = canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = '#1d1a3a'; g.fillRect(0, 0, w, h);
  const seg = ['#ff2d95', '#ffd400', '#00e5ff', '#7c4dff'];
  for (let i = 0; i < 4; i++) {
    g.fillStyle = seg[i];
    g.fillRect(i * 64, 0, 64, 12);
    g.fillRect(i * 64, h - 12, 64, 12);
  }
  g.fillStyle = '#fff'; g.fillRect(0, 17, w, 3); g.fillRect(0, h - 20, w, 3);
  g.fillStyle = '#ffffffcc';
  g.fillRect(0, 51, 110, 3); g.fillRect(0, 105, 110, 3);
  g.fillStyle = '#ffd400'; g.fillRect(0, 77, 130, 6);
}, L / 8, 1);
const road = new THREE.Mesh(new THREE.PlaneGeometry(L, ROAD_HALF * 2), new THREE.MeshBasicMaterial({ map: roadTex }));
road.rotation.x = -Math.PI / 2;
road.position.set(CX, 0.03, 0);
scene.add(road);
for (const z of [-ROAD_HALF - 0.15, ROAD_HALF + 0.15]) {
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.5), new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.set(CX, 0.04, z * 1.04);
  scene.add(glow);
}

/* ---------- Colorful scenery ---------- */
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const trunkM = new THREE.MeshStandardMaterial({ color: 0x8a4b7a, flatShading: true });
const leafMs = [0x00ff9d, 0x00e5ff, 0xffd400].map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.25, flatShading: true }));

function palm(x, z) {
  const g = new THREE.Group();
  const h = rnd(3, 5);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, h, 6), trunkM);
  trunk.position.y = h / 2;
  g.add(trunk);
  const lm = pick(leafMs);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.2, 4), lm);
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.9, h + 0.1, Math.sin(a) * 0.9);
    leaf.rotation.set(Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25);
    g.add(leaf);
  }
  const nut = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff2d95, emissive: 0xff2d95, emissiveIntensity: 0.4 }));
  nut.position.y = h - 0.1;
  g.add(nut);
  g.position.set(x, 0, z);
  g.rotation.y = Math.random() * 6;
  return g;
}
function tower(x, z) {
  const c = pick(PAL);
  const w = rnd(2.5, 5), h = rnd(5, 17), d = rnd(2.5, 5);
  const geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.28, roughness: 0.5 }));
  m.position.y = h / 2;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff }));
  edges.position.y = h / 2;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, 0.25, d * 1.05), new THREE.MeshBasicMaterial({ color: pick(PAL) }));
  cap.position.y = h + 0.1;
  const g = new THREE.Group();
  g.add(m, edges, cap);
  g.position.set(x, 0, z);
  return g;
}
function crystal(x, z) {
  const c = pick(PAL);
  const m = new THREE.Mesh(
    new THREE.OctahedronGeometry(rnd(1, 2.2)),
    new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6, flatShading: true })
  );
  m.scale.y = rnd(1.5, 2.6);
  m.position.set(x, m.scale.y * 1.4 + 0.4, z);
  m.userData.spin = rnd(0.3, 0.9);
  return m;
}
const spinners = [];
for (let x = -30; x < END_X + 140; x += 5.5) {
  for (const side of [-1, 1]) {
    const z = side * (ROAD_HALF + rnd(3, 6) + (Math.random() < 0.55 ? 0 : rnd(5, 24)));
    const r = Math.random();
    const o = r < 0.5 ? palm(x + rnd(-2, 2), z) : r < 0.82 ? tower(x + rnd(-2, 2), side * rnd(14, 36)) : crystal(x + rnd(-2, 2), side * rnd(10, 30));
    if (o.userData.spin) spinners.push(o);
    scene.add(o);
  }
}
for (let x = -60; x < END_X + 200; x += 38) {
  for (const side of [-1, 1]) {
    const c = pick([0x3a1a8c, 0x8a2fbf, 0xc2308e, 0x1d6fd1]);
    const r = rnd(18, 34);
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, r * rnd(1.1, 1.8), 5), new THREE.MeshStandardMaterial({ color: c, flatShading: true }));
    m.position.set(x + rnd(-10, 10), r * 0.5, side * rnd(80, 130));
    scene.add(m);
  }
}

/* ---------- Gates ---------- */
function drawSign(ctx, i, color) {
  const w = 1024, h = 256, c = hex(color);
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#1a0838'); grad.addColorStop(1, '#3a0f6e');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.roundRect(10, 10, w - 20, h - 20, 40); ctx.fill();
  ctx.lineWidth = 12; ctx.strokeStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 30; ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.roundRect(40, 40, 176, 176, 34); ctx.fill();
  ctx.font = '96px system-ui, "Apple Color Emoji", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(STATIONS[i].icon, 128, 134);
  ctx.textAlign = 'left';
  ctx.font = '600 38px "Space Grotesk", system-ui, sans-serif';
  ctx.fillStyle = c;
  ctx.fillText(`STOP ${i + 1} / ${STATIONS.length}`, 250, 82);
  ctx.font = '700 104px "Space Grotesk", system-ui, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(STATIONS[i].label, 250, 160);
}
const gates = STATIONS.map((st, i) => {
  const color = PAL[i % PAL.length];
  const g = new THREE.Group();
  g.position.x = gateX(i);
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.3 });
  for (const z of [-ROAD_HALF - 0.6, ROAD_HALF + 0.6]) {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.45, 7, 0.45), mat);
    pil.position.set(0, 3.5, z);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 7, 16, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    beam.position.set(0, 3.5, z);
    g.add(pil, beam);
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, ROAD_HALF * 2 + 1.7), mat);
  top.position.y = 7;
  g.add(top);

  const cv = document.createElement('canvas');
  cv.width = 1024; cv.height = 256;
  const ctx = cv.getContext('2d');
  drawSign(ctx, i, color);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, side: THREE.DoubleSide }));
  sign.rotation.y = -Math.PI / 2;
  sign.position.y = 8.9;
  g.add(sign);

  const line = new THREE.Mesh(new THREE.PlaneGeometry(1.4, ROAD_HALF * 2), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.06;
  g.add(line);
  scene.add(g);
  return { g, mat, line, color, tex, ctx, i };
});
document.fonts?.ready.then(() => gates.forEach((o) => { drawSign(o.ctx, o.i, o.color); o.tex.needsUpdate = true; }));

/* ---------- Confetti burst ---------- */
const NB = 240;
const bPos = new Float32Array(NB * 3), bCol = new Float32Array(NB * 3), bVel = new Float32Array(NB * 3);
const bGeo = new THREE.BufferGeometry();
bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
bGeo.setAttribute('color', new THREE.BufferAttribute(bCol, 3));
const burst = new THREE.Points(bGeo, new THREE.PointsMaterial({ size: 0.45, vertexColors: true, transparent: true, depthWrite: false, fog: false }));
burst.frustumCulled = false;
scene.add(burst);
let burstLife = 0;
function fireBurst(x) {
  const col = new THREE.Color();
  for (let i = 0; i < NB; i++) {
    bPos.set([x, 7 + rnd(-0.5, 0.5), rnd(-ROAD_HALF, ROAD_HALF)], i * 3);
    bVel.set([rnd(-3, 7), rnd(4, 11), rnd(-6, 6)], i * 3);
    col.setHex(pick(PAL));
    bCol.set([col.r, col.g, col.b], i * 3);
  }
  bGeo.attributes.color.needsUpdate = true;
  burstLife = 2.2;
}

/* ---------- The car + driver ---------- */
const car = new THREE.Group();
const rig = new THREE.Group(); // pitch/roll live here
car.add(rig);

const bodyM = new THREE.MeshStandardMaterial({ color: 0xff2d95, emissive: 0xff2d95, emissiveIntensity: 0.35, metalness: 0.2, roughness: 0.35 });
const darkM = new THREE.MeshStandardMaterial({ color: 0x1b0a38, roughness: 0.7 });
const whiteM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
const box = (w, h, d, m, x, y, z, rz = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.rotation.z = rz;
  rig.add(mesh);
  return mesh;
};
box(4.1, 0.4, 1.9, bodyM, 0, 0.5, 0);
box(1.5, 0.24, 1.8, bodyM, 1.3, 0.78, 0, -0.1);
box(1.3, 0.3, 1.8, bodyM, -1.4, 0.8, 0);
box(1.4, 0.03, 0.28, whiteM, 1.3, 0.91, 0, -0.1);
box(1.2, 0.03, 0.28, whiteM, -1.4, 0.96, 0);
box(0.9, 0.16, 1.2, darkM, -0.45, 0.72, 0); // seat
box(0.22, 0.75, 1.2, darkM, -0.95, 1.0, 0, 0.12); // seat back
box(0.45, 0.28, 1.6, darkM, 0.7, 0.88, 0); // dash
box(0.06, 0.55, 1.65, new THREE.MeshStandardMaterial({ color: 0x9ff4ff, emissive: 0x00e5ff, emissiveIntensity: 0.3, transparent: true, opacity: 0.4 }), 0.78, 1.15, 0, 0.7);
// spoiler
box(0.6, 0.07, 1.9, new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.6 }), -2.0, 1.22, 0);
for (const z of [-0.6, 0.6]) box(0.08, 0.42, 0.08, darkM, -1.95, 1.0, z);
// lights
const headM = new THREE.MeshBasicMaterial({ color: 0xfff6c8 });
const tailM = new THREE.MeshBasicMaterial({ color: 0xff1744 });
for (const z of [-0.65, 0.65]) {
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), headM);
  hl.scale.set(0.8, 0.7, 1.5);
  hl.position.set(2.05, 0.68, z);
  rig.add(hl);
  box(0.05, 0.12, 0.5, tailM, -2.07, 0.78, z * 0.95);
}
// underglow
const under = new THREE.Mesh(
  new THREE.PlaneGeometry(4.4, 2.3),
  new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })
);
under.rotation.x = -Math.PI / 2;
under.position.y = 0.06;
car.add(under);
const underLight = new THREE.PointLight(0xff2dff, 10, 9);
underLight.position.y = 0.4;
car.add(underLight);

// wheels
const tireM = new THREE.MeshStandardMaterial({ color: 0x111018, roughness: 0.9 });
const rimM = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.7, metalness: 0.8 });
const spinners2 = [];
const frontPivots = [];
for (const sx of [1.3, -1.3]) {
  for (const sz of [-1.0, 1.0]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx, 0.44, sz);
    const spin = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.34, 20), tireM);
    tire.rotation.x = Math.PI / 2;
    const rimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.36, 16), rimM);
    rimMesh.rotation.x = Math.PI / 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.38), whiteM);
    const spoke2 = spoke.clone(); spoke2.rotation.z = Math.PI / 2;
    spin.add(tire, rimMesh, spoke, spoke2);
    pivot.add(spin);
    rig.add(pivot);
    spinners2.push(spin);
    if (sx > 0) frontPivots.push(pivot);
  }
}
// exhaust flames
const flameM = new THREE.MeshBasicMaterial({ color: 0xff9a1f, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
const flames = [-0.5, 0.5].map((z) => {
  const f = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.0, 8), flameM);
  f.rotation.z = Math.PI / 2;
  f.position.set(-2.6, 0.55, z);
  rig.add(f);
  return f;
});

// driver
const skin = new THREE.MeshStandardMaterial({ color: 0xe8b894, roughness: 0.7 });
const hairM = new THREE.MeshStandardMaterial({ color: 0x1a1018, roughness: 0.5 });
const jacketM = new THREE.MeshStandardMaterial({ color: 0x00e5ff, roughness: 0.5, emissive: 0x00e5ff, emissiveIntensity: 0.15 });
function bar(a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 4, 10), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  rig.add(m);
  return m;
}
bar(new THREE.Vector3(-0.55, 0.85, 0), new THREE.Vector3(-0.42, 1.38, 0), 0.25, jacketM);
bar(new THREE.Vector3(-0.42, 1.42, 0.2), new THREE.Vector3(0.32, 1.02, 0.24), 0.07, skin);
bar(new THREE.Vector3(-0.42, 1.42, -0.2), new THREE.Vector3(0.32, 1.02, -0.24), 0.07, skin);
const wheelG = new THREE.Group();
wheelG.position.set(0.38, 1.02, 0);
wheelG.rotation.y = Math.PI / 2;
const wheelInner = new THREE.Group();
wheelInner.add(new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.035, 8, 24), darkM));
wheelInner.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), darkM));
wheelG.add(wheelInner);
rig.add(wheelG);

const head = new THREE.Group();
head.position.set(-0.38, 1.78, 0);
head.rotation.y = Math.PI / 2; // face +x
head.add(new THREE.Mesh(new THREE.SphereGeometry(0.31, 20, 20), skin));
const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.345, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.6), hairM);
hairTop.position.set(0, 0.04, -0.04); hairTop.rotation.x = -0.25;
const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.33, 16, 16), hairM);
hairBack.position.set(0, -0.02, -0.12); hairBack.scale.set(1, 1.05, 0.8);
const shadeM = new THREE.MeshStandardMaterial({ color: 0x120a1c, emissive: 0xff2d95, emissiveIntensity: 0.35, roughness: 0.2 });
for (const x of [-0.12, 0.12]) {
  const lens = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.05), shadeM);
  lens.position.set(x, 0.03, 0.3);
  head.add(lens);
}
head.add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.05), shadeM));
head.children[head.children.length - 1].position.set(0, 0.05, 0.3);
const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0xc2185b }));
smile.position.set(0, -0.12, 0.29); smile.rotation.z = Math.PI;
head.add(smile);
const tailG = new THREE.Group();
tailG.position.set(0, 0.12, -0.33);
const tailMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.7, 6, 12), hairM);
tailMesh.position.y = -0.38;
const bowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshStandardMaterial({ color: 0xffd400, emissive: 0xffd400, emissiveIntensity: 0.6 }));
tailG.add(tailMesh, bowMesh);
head.add(hairTop, hairBack, tailG);
rig.add(head);
scene.add(car);

/* ---------- Speed lines ---------- */
const lineMats = [0x00e5ff, 0xff2d95, 0xffd400].map((c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
const lineGeo = new THREE.BoxGeometry(10, 0.05, 0.05);
const streaks = [];
for (let i = 0; i < 70; i++) {
  const m = new THREE.Mesh(lineGeo, lineMats[i % 3]);
  m.userData = { off: Math.random() * 120, z: rnd(-9, 9), y: rnd(0.3, 5), scale: rnd(0.6, 1.6) };
  m.scale.set(m.userData.scale, 1, 1);
  scene.add(m);
  streaks.push(m);
}

/* ---------- Input ---------- */
const keys = {};
const touch = { l: false, r: false, gas: false, brake: false, nitro: false };
addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => (keys[e.code] = false));
for (const [id, k] of [['btnL', 'l'], ['btnR', 'r'], ['btnG', 'gas'], ['btnB', 'brake'], ['btnN', 'nitro']]) {
  const b = document.getElementById(id);
  b.addEventListener('pointerdown', (e) => { touch[k] = true; b.setPointerCapture(e.pointerId); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => (touch[k] = false));
}

const intro = document.getElementById('intro');
const hint = document.getElementById('hint');
let started = false;
function start() {
  if (started) return;
  started = true;
  intro.classList.add('hide');
  hint.classList.add('show');
}
document.getElementById('start').addEventListener('click', start);
addEventListener('keydown', (e) => { if (e.code === 'Enter' || e.code === 'Space') start(); });

/* ---------- HUD ---------- */
const panel = document.getElementById('panel');
const nodesEl = document.getElementById('nodes');
nodesEl.innerHTML = STATIONS.map((s, i) => `<i style="left:${(gateX(i) / END_X) * 100}%;--c:${hex(PAL[i % PAL.length])}">${s.icon}</i>`).join('');
const nodeEls = [...nodesEl.children];
const routeFill = document.getElementById('routeFill');
const carpin = document.getElementById('carpin');
const kmh = document.getElementById('kmh');
const arc = document.getElementById('arc');
const speedo = document.getElementById('speedo');
let active = -1;

function showStation(i) {
  if (i === active) return;
  const prev = active;
  active = i;
  nodeEls.forEach((n, k) => n.classList.toggle('hit', k <= i));
  if (i < 0) return panel.classList.remove('show');
  panel.style.setProperty('--c', hex(PAL[i % PAL.length]));
  const st = STATIONS[i];
  const fill = () => {
    panel.innerHTML = `<div class="badge">${st.icon}</div><div><div class="tag">Stop ${i + 1}/${STATIONS.length} · ${st.tag}</div>${st.html}</div>`;
    panel.classList.add('show');
  };
  if (prev < 0) fill();
  else { panel.classList.remove('show'); setTimeout(() => active === i && fill(), 280); }
  if (i > prev) fireBurst(gateX(i));
}

/* ---------- Loop ---------- */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

let v = 0, zVel = 0, steerVis = 0;
const MAX = 26, NITRO = 40;
const clock = new THREE.Clock();
const camTarget = new THREE.Vector3();
const look = new THREE.Vector3();
let shake = 0;

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  const gas = started && (keys.ArrowUp || keys.KeyW || touch.gas);
  const brake = keys.ArrowDown || keys.KeyS || touch.brake;
  const nitro = started && (keys.ShiftLeft || keys.ShiftRight || touch.nitro) && gas;
  let steer = 0;
  if (started) {
    if (keys.ArrowRight || keys.KeyD || touch.r) steer += 1;
    if (keys.ArrowLeft || keys.KeyA || touch.l) steer -= 1;
  }

  const top = nitro ? NITRO : MAX;
  if (gas) v += (v < top ? (nitro ? 26 : 14) : -12) * dt;
  else v -= (brake ? 34 : 5) * dt;
  if (brake && gas) v -= 20 * dt;
  v = THREE.MathUtils.clamp(v, 0, NITRO);
  if (car.position.x >= END_X) v = Math.max(0, v - 40 * dt);

  car.position.x = Math.min(END_X, car.position.x + v * dt);
  const steerPower = 3 + Math.min(v, 14) * 0.45;
  zVel += (steer * steerPower - zVel) * Math.min(1, dt * 8);
  if (v < 0.4) zVel *= 0.8;
  car.position.z = THREE.MathUtils.clamp(car.position.z + zVel * dt, -ROAD_HALF + 1.3, ROAD_HALF - 1.3);

  steerVis += (steer - steerVis) * Math.min(1, dt * 10);
  car.rotation.y = -steerVis * 0.18 * Math.min(1, v / 8);
  rig.rotation.x = steerVis * 0.05 * Math.min(1, v / 12);
  rig.rotation.z = gas ? 0.015 + (nitro ? 0.03 : 0) : brake && v > 2 ? -0.03 : 0;
  rig.position.y = Math.sin(t * 38) * 0.008 * Math.min(1, v / 10);
  frontPivots.forEach((p) => (p.rotation.y = -steerVis * 0.45));
  spinners2.forEach((s) => (s.rotation.z -= (v * dt) / 0.44));
  wheelInner.rotation.z = steerVis * 1.1;
  flames.forEach((f, k) => {
    const s = nitro ? 1.5 + Math.random() * 0.8 : gas && v > 4 ? 0.25 + Math.random() * 0.2 : 0.001;
    f.scale.set(1, s, 1);
    f.position.x = -2.1 - s * 0.5;
  });

  // hair & driver
  const wind = Math.min(v / MAX, 1.4);
  tailG.rotation.x = 0.15 + wind * 1.15 + Math.sin(t * 14) * 0.08 * wind;
  tailG.rotation.z = Math.sin(t * 9) * 0.12 * wind - steerVis * 0.25;
  head.rotation.x = Math.sin(t * 1.6) * 0.03;
  head.rotation.z = -steerVis * 0.08;
  underLight.intensity = 9 + Math.sin(t * 3) * 2;
  under.material.opacity = 0.45 + Math.sin(t * 3) * 0.12;

  // Sky follows camera; scenery spin
  sky.position.copy(camera.position);
  spinners.forEach((s) => (s.rotation.y += s.userData.spin * dt));

  // Speed lines
  const sl = Math.max(0, (v - 12) / 20);
  lineMats.forEach((m) => (m.opacity = Math.min(0.7, sl)));
  streaks.forEach((s) => {
    const u = s.userData;
    const rel = ((u.off - car.position.x * 1.0) % 120 + 120) % 120;
    s.position.set(car.position.x - 30 + rel * 1.0 + 8, u.y, car.position.z + u.z);
    s.visible = sl > 0.01;
  });

  // Gates & active stop
  let current = -1;
  gates.forEach((o, i) => {
    const d = car.position.x - o.g.position.x;
    if (d > -10) current = i;
    const near = Math.abs(d) < 14;
    o.mat.emissiveIntensity += ((near ? 2.2 : 0.9) - o.mat.emissiveIntensity) * 0.1;
    o.line.material.opacity += ((near ? 0.8 : 0.35) - o.line.material.opacity) * 0.1;
  });
  if (started) showStation(current);

  // Confetti
  if (burstLife > 0) {
    burstLife -= dt;
    for (let i = 0; i < NB; i++) {
      bVel[i * 3 + 1] -= 12 * dt;
      bPos[i * 3] += bVel[i * 3] * dt;
      bPos[i * 3 + 1] += bVel[i * 3 + 1] * dt;
      bPos[i * 3 + 2] += bVel[i * 3 + 2] * dt;
    }
    bGeo.attributes.position.needsUpdate = true;
    burst.material.opacity = Math.min(1, burstLife);
    burst.visible = true;
  } else burst.visible = false;

  // Camera
  const portrait = innerWidth < innerHeight;
  if (started) {
    shake = nitro ? 0.04 : 0;
    const back = (portrait ? 11 : 8) + v * 0.05;
    camTarget.set(car.position.x - back, portrait ? 4.2 : 3.2, car.position.z * 0.55);
    look.set(car.position.x + 9, 1.4, car.position.z * 0.7);
    camera.fov += ((portrait ? 72 : 60) + v * 0.55 + (nitro ? 8 : 0) - camera.fov) * Math.min(1, dt * 4);
  } else {
    const a = t * 0.35;
    camTarget.set(car.position.x + Math.sin(a) * 7.5, 2.6 + Math.sin(a * 0.7) * 0.4, car.position.z + Math.cos(a) * 7.5);
    look.set(car.position.x, 2.4, car.position.z);
    camera.fov += ((portrait ? 75 : 55) - camera.fov) * Math.min(1, dt * 4);
  }
  camera.position.lerp(camTarget, 1 - Math.exp(-dt * (started ? 5 : 2.5)));
  camera.position.x += (Math.random() - 0.5) * shake;
  camera.position.y += (Math.random() - 0.5) * shake;
  camera.updateProjectionMatrix();
  camera.lookAt(look);

  // HUD values
  kmh.textContent = Math.round(v * 5);
  arc.style.strokeDasharray = `${(Math.min(v, NITRO) / NITRO) * 245} 327`;
  speedo.classList.toggle('nitro', nitro && v > 28);
  const pct = (car.position.x / END_X) * 100;
  routeFill.style.width = pct + '%';
  carpin.style.left = pct + '%';
  if (v > 1 && hint.classList.contains('show')) hint.classList.remove('show');

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
camera.position.set(6, 2.6, 7);
frame();
