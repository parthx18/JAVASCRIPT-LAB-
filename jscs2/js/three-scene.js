/* ==========================================================================
   AURA PENS - High-Precision Ultra-Realistic 3D Three.js Engine
   ========================================================================== */

// Global 3D State
let heroScene, heroCamera, heroRenderer, heroPenGroup, heroParticles, heroShadowPlane;
let customScene, customCamera, customRenderer, customPenGroup, customShadowPlane;
let customBarrelMesh, customCapMesh, customNibMesh, customClipMesh, customTrimRings = [];
let envTexture;

// Mouse Parallax for Hero
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener("DOMContentLoaded", () => {
  initStudioEnvironment();
  initHero3D();
  initCustomizer3D();
  setupWindowResize();
});

/* --------------------------------------------------------------------------
   0. Studio Environment Map Generator for Realistic Reflections
   -------------------------------------------------------------------------- */
function initStudioEnvironment() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Gradient background simulating a luxury photography softbox studio
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#101420');
  grad.addColorStop(0.3, '#303850');
  grad.addColorStop(0.5, '#ffffff'); // Softbox light bar
  grad.addColorStop(0.7, '#202435');
  grad.addColorStop(1, '#090a0f');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft reflection lights
  ctx.fillStyle = 'rgba(255, 242, 163, 0.4)';
  ctx.beginPath();
  ctx.arc(120, 80, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.beginPath();
  ctx.arc(380, 180, 90, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  envTexture = texture;
}

/* --------------------------------------------------------------------------
   1. Hero 3D Scene Initialization
   -------------------------------------------------------------------------- */
function initHero3D() {
  const container = document.getElementById("hero-3d-wrapper");
  const canvas = document.getElementById("hero-3d-canvas");
  if (!container || !canvas) return;

  // Scene & Camera
  heroScene = new THREE.Scene();
  heroCamera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  heroCamera.position.set(0, 0, 12);

  // Renderer with tone mapping and shadows
  heroRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  heroRenderer.setSize(container.clientWidth, container.clientHeight);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.shadowMap.enabled = true;
  heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  heroRenderer.toneMappingExposure = 1.2;

  // Lighting Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  heroScene.add(ambientLight);

  // Key Studio Soft Light
  const keyLight = new THREE.DirectionalLight(0xfff5cc, 2.5);
  keyLight.position.set(6, 12, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0001;
  heroScene.add(keyLight);

  // Rim Light for metallic edges
  const rimLight = new THREE.DirectionalLight(0xd4af37, 2.0);
  rimLight.position.set(-6, -4, -6);
  heroScene.add(rimLight);

  // Fill Light
  const fillLight = new THREE.PointLight(0xffffff, 1.2, 30);
  fillLight.position.set(0, -2, 6);
  heroScene.add(fillLight);

  // Soft Ground Shadow Plane
  const shadowGeo = new THREE.PlaneGeometry(6, 6);
  const shadowCanvas = createSoftShadowCanvas();
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.5,
    depthWrite: false
  });
  heroShadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  heroShadowPlane.rotation.x = -Math.PI / 2;
  heroShadowPlane.position.y = -3.2;
  heroScene.add(heroShadowPlane);

  // Build Ultra-Realistic Pen Model
  heroPenGroup = createRealistic3DPen(true);
  heroPenGroup.position.set(0, 0.2, 0);
  heroPenGroup.rotation.z = Math.PI / 5.5;
  heroPenGroup.rotation.y = -Math.PI / 4;
  heroScene.add(heroPenGroup);

  // Golden Particle Atmosphere
  heroParticles = createParticleField();
  heroScene.add(heroParticles);

  // Mouse Parallax Track
  window.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Render Animation Loop
  let startTime = Date.now();
  function animateHero() {
    requestAnimationFrame(animateHero);

    const elapsedTime = (Date.now() - startTime) * 0.001;

    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    if (heroPenGroup) {
      // Natural floating bob animation
      const hoverBob = Math.sin(elapsedTime * 1.5) * 0.18;
      heroPenGroup.position.y = 0.2 + hoverBob;

      // Dynamic rotation
      heroPenGroup.rotation.y += 0.005;
      heroPenGroup.rotation.x = Math.sin(elapsedTime * 0.8) * 0.1 + targetY * 0.25;
      heroPenGroup.rotation.z = Math.PI / 5.5 + targetX * 0.15;

      // Shadow breathing scale based on hover height
      if (heroShadowPlane) {
        const shadowScale = 1 - (hoverBob * 0.3);
        heroShadowPlane.scale.set(shadowScale, shadowScale, 1);
        heroShadowPlane.material.opacity = 0.45 - (hoverBob * 0.15);
      }
    }

    if (heroParticles) {
      heroParticles.rotation.y += 0.0008;
    }

    heroRenderer.render(heroScene, heroCamera);
  }
  animateHero();
}

/* --------------------------------------------------------------------------
   2. Customizer 3D Scene Initialization
   -------------------------------------------------------------------------- */
function initCustomizer3D() {
  const container = document.getElementById("customizer-3d-viewport");
  const canvas = document.getElementById("customizer-3d-canvas");
  if (!container || !canvas) return;

  customScene = new THREE.Scene();
  customCamera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 1000);
  customCamera.position.set(0, 0, 10);

  customRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  customRenderer.setSize(container.clientWidth, container.clientHeight);
  customRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  customRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  customRenderer.toneMappingExposure = 1.25;

  const amb = new THREE.AmbientLight(0xffffff, 0.9);
  customScene.add(amb);

  const sun = new THREE.DirectionalLight(0xfff5cc, 2.5);
  sun.position.set(6, 8, 6);
  customScene.add(sun);

  const backLight = new THREE.DirectionalLight(0xd4af37, 1.8);
  backLight.position.set(-6, -4, -5);
  customScene.add(backLight);

  // Soft Ground Shadow
  const shadowGeo = new THREE.PlaneGeometry(6, 6);
  const shadowCanvas = createSoftShadowCanvas();
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.45, depthWrite: false });
  customShadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  customShadowPlane.rotation.x = -Math.PI / 2;
  customShadowPlane.position.y = -2.8;
  customScene.add(customShadowPlane);

  customPenGroup = createRealistic3DPen(false);
  customPenGroup.rotation.y = Math.PI / 3;
  customPenGroup.rotation.z = Math.PI / 14;
  customScene.add(customPenGroup);

  // Drag Control Variables
  let isDragging = false;
  let prevMouseX = 0, prevMouseY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener("mouseup", () => isDragging = false);

  canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;

    customPenGroup.rotation.y += deltaX * 0.008;
    customPenGroup.rotation.x += deltaY * 0.008;

    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  let startTime = Date.now();
  function animateCustomizer() {
    requestAnimationFrame(animateCustomizer);
    const elapsedTime = (Date.now() - startTime) * 0.001;

    if (!isDragging) {
      customPenGroup.rotation.y += 0.003;
      customPenGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.1;
    }
    customRenderer.render(customScene, customCamera);
  }
  animateCustomizer();
}

/* --------------------------------------------------------------------------
   3. Ultra-Detailed 3D Fountain Pen Model Generator
   -------------------------------------------------------------------------- */
function createRealistic3DPen(isHero) {
  const penGroup = new THREE.Group();

  // Premium Physical Materials with Clearcoat & Reflection Maps
  const blackResinMat = new THREE.MeshPhysicalMaterial({
    color: 0x090b10,
    roughness: 0.06,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMap: envTexture,
    envMapIntensity: 1.2
  });

  const goldTrimMat = new THREE.MeshPhysicalMaterial({
    color: 0xe5c158,
    roughness: 0.15,
    metalness: 0.98,
    clearcoat: 0.5,
    envMap: envTexture,
    envMapIntensity: 2.2
  });

  const nibGoldMat = new THREE.MeshPhysicalMaterial({
    color: 0xf5d77f,
    roughness: 0.1,
    metalness: 0.96,
    envMap: envTexture,
    envMapIntensity: 2.5
  });

  const nibFeedMat = new THREE.MeshStandardMaterial({
    color: 0x111115,
    roughness: 0.7,
    metalness: 0.1
  });

  // ------------------------------------------------------------------------
  // A. BARREL SECTION (Piston blind cap + Main Tapered Barrel)
  // ------------------------------------------------------------------------
  // 1. Blind Cap (Piston turning knob at bottom)
  const blindCapGeo = new THREE.CylinderGeometry(0.30, 0.28, 0.6, 64);
  const blindCapMesh = new THREE.Mesh(blindCapGeo, blackResinMat);
  blindCapMesh.position.y = -2.6;
  penGroup.add(blindCapMesh);

  // Gold Ring at Piston Knob
  const knobRingGeo = new THREE.TorusGeometry(0.305, 0.018, 16, 64);
  const knobRing = new THREE.Mesh(knobRingGeo, goldTrimMat);
  knobRing.position.y = -2.3;
  knobRing.rotation.x = Math.PI / 2;
  penGroup.add(knobRing);

  // 2. Main Barrel Body (Tapered)
  const barrelGeo = new THREE.CylinderGeometry(0.38, 0.31, 3.4, 64);
  const barrelMesh = new THREE.Mesh(barrelGeo, blackResinMat);
  barrelMesh.position.y = -0.55;
  penGroup.add(barrelMesh);

  if (!isHero) customBarrelMesh = barrelMesh;

  // Gold Barrel Center Ring
  const centerRingGeo = new THREE.TorusGeometry(0.385, 0.022, 16, 64);
  const centerRing = new THREE.Mesh(centerRingGeo, goldTrimMat);
  centerRing.position.y = 1.15;
  centerRing.rotation.x = Math.PI / 2;
  penGroup.add(centerRing);

  // ------------------------------------------------------------------------
  // B. GRIP SECTION & NIB HOUSING
  // ------------------------------------------------------------------------
  // Contoured Grip Section
  const gripPoints = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const y = t * 1.1;
    // Ergonomic concave curve shape
    const r = 0.35 - Math.sin(t * Math.PI) * 0.06;
    gripPoints.push(new THREE.Vector2(r, y));
  }
  const gripGeo = new THREE.LatheGeometry(gripPoints, 64);
  const gripMesh = new THREE.Mesh(gripGeo, blackResinMat);
  gripMesh.position.y = 1.15;
  penGroup.add(gripMesh);

  // Gold Collar Band around nib
  const collarRingGeo = new THREE.TorusGeometry(0.29, 0.02, 16, 64);
  const collarRing = new THREE.Mesh(collarRingGeo, goldTrimMat);
  collarRing.position.y = 2.25;
  collarRing.rotation.x = Math.PI / 2;
  penGroup.add(collarRing);

  // ------------------------------------------------------------------------
  // C. HANDCRAFTED FOUNTAIN PEN NIB (Intricate Tines & Breather Hole)
  // ------------------------------------------------------------------------
  const nibShape = new THREE.Shape();
  // Base
  nibShape.moveTo(-0.22, 0);
  nibShape.lineTo(0.22, 0);
  // Curve outwards to shoulders
  nibShape.bezierCurveTo(0.26, 0.3, 0.28, 0.6, 0.24, 0.85);
  // Taper sharply down to iridium point tip
  nibShape.bezierCurveTo(0.15, 1.2, 0.04, 1.45, 0, 1.55);
  nibShape.bezierCurveTo(-0.04, 1.45, -0.15, 1.2, -0.24, 0.85);
  nibShape.bezierCurveTo(-0.28, 0.6, -0.26, 0.3, -0.22, 0);

  // Cutout Breather Hole
  const holePath = new THREE.Path();
  holePath.absarc(0, 0.7, 0.04, 0, Math.PI * 2, true);
  nibShape.holes.push(holePath);

  const nibExtrudeSettings = { depth: 0.025, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.008, bevelThickness: 0.008 };
  const nibGeo = new THREE.ExtrudeGeometry(nibShape, nibExtrudeSettings);
  const nibMesh = new THREE.Mesh(nibGeo, nibGoldMat);
  nibMesh.position.set(0, 2.25, -0.01);
  penGroup.add(nibMesh);

  if (!isHero) customNibMesh = nibMesh;

  // Ebonite Feed under the Nib
  const feedGeo = new THREE.CylinderGeometry(0.18, 0.16, 1.1, 32);
  const feedMesh = new THREE.Mesh(feedGeo, nibFeedMat);
  feedMesh.position.set(0, 2.7, -0.08);
  penGroup.add(feedMesh);

  // ------------------------------------------------------------------------
  // D. CAP SECTION & POCKET CLIP (Positioned beside/on barrel for realistic display)
  // ------------------------------------------------------------------------
  const capGeo = new THREE.CylinderGeometry(0.42, 0.40, 3.3, 64);
  const capMesh = new THREE.Mesh(capGeo, blackResinMat);
  // Position cap slightly angled or stacked
  capMesh.position.set(0, -0.7, 0.1);
  penGroup.add(capMesh);

  if (!isHero) customCapMesh = capMesh;

  // Cap Crown (Montblanc style domed top)
  const crownGeo = new THREE.SphereGeometry(0.40, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const crownMesh = new THREE.Mesh(crownGeo, blackResinMat);
  crownMesh.position.y = 0.95;
  capMesh.add(crownMesh);

  // White Emblem Star on Cap Top
  const emblemGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const emblemMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
  emblemMesh.position.y = 1.15;
  emblemMesh.scale.set(1, 0.3, 1);
  capMesh.add(emblemMesh);

  // Triple Gold Cap Bands
  const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.422, 0.025, 16, 64), goldTrimMat);
  band1.position.y = -1.4;
  band1.rotation.x = Math.PI / 2;
  capMesh.add(band1);

  const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.422, 0.015, 16, 64), goldTrimMat);
  band2.position.y = -1.32;
  band2.rotation.x = Math.PI / 2;
  capMesh.add(band2);

  if (!isHero) customTrimRings.push(band1, band2, knobRing, centerRing, collarRing);

  // Sculpted 3D Pocket Clip with Teardrop Ball Tip
  const clipCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.42, 0.8, 0),
    new THREE.Vector3(0.55, 0.6, 0),
    new THREE.Vector3(0.54, -0.6, 0),
    new THREE.Vector3(0.48, -1.1, 0)
  ]);
  const clipGeo = new THREE.TubeGeometry(clipCurve, 32, 0.028, 12, false);
  const clipMesh = new THREE.Mesh(clipGeo, goldTrimMat);
  capMesh.add(clipMesh);

  // Teardrop clip ball tip
  const ballGeo = new THREE.SphereGeometry(0.05, 16, 16);
  const ballMesh = new THREE.Mesh(ballGeo, goldTrimMat);
  ballMesh.position.set(0.48, -1.12, 0);
  capMesh.add(ballMesh);

  if (!isHero) customClipMesh = clipMesh;

  return penGroup;
}

// Helper: Soft Shadow Texture Generator
function createSoftShadowCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return canvas;
}

// Particle Field
function createParticleField() {
  const particleCount = 220;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 18;
    positions[i + 1] = (Math.random() - 0.5) * 18;
    positions[i + 2] = (Math.random() - 0.5) * 18;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.075,
    transparent: true,
    opacity: 0.55
  });

  return new THREE.Points(geometry, material);
}

/* --------------------------------------------------------------------------
   4. Customizer Dynamic Material Controls
   -------------------------------------------------------------------------- */
function changeCustomizerFinish(finish) {
  if (!customBarrelMesh || !customCapMesh) return;

  const swatches = document.querySelectorAll(".color-swatch");
  swatches.forEach(s => s.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");

  let newMaterial;
  switch (finish) {
    case 'gold':
      newMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe5c158, roughness: 0.15, metalness: 0.98, envMap: envTexture, envMapIntensity: 2.2
      });
      break;
    case 'black':
      newMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x090b10, roughness: 0.06, metalness: 0.15, clearcoat: 1.0, envMap: envTexture, envMapIntensity: 1.2
      });
      break;
    case 'titanium':
      newMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xb5bac2, roughness: 0.3, metalness: 0.92, envMap: envTexture, envMapIntensity: 1.8
      });
      break;
    case 'red':
      newMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x700515, roughness: 0.1, metalness: 0.35, clearcoat: 1.0, envMap: envTexture, envMapIntensity: 1.5
      });
      break;
    case 'blue':
      newMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a1d3d, roughness: 0.08, metalness: 0.4, clearcoat: 1.0, envMap: envTexture, envMapIntensity: 1.5
      });
      break;
    default:
      newMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x090b10, roughness: 0.06, metalness: 0.15, clearcoat: 1.0, envMap: envTexture, envMapIntensity: 1.2
      });
  }

  customBarrelMesh.material = newMaterial;
  customCapMesh.material = newMaterial;
  showToast(`Customizer finish updated to ${finish.toUpperCase()}`);
}

function changeCustomizerNib(nibType) {
  if (!customNibMesh) return;

  const btns = document.querySelectorAll(".nib-btn");
  btns.forEach(b => b.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");

  if (nibType === '14k') {
    customNibMesh.material.color.setHex(0xd4af37);
  } else if (nibType === '18k') {
    customNibMesh.material.color.setHex(0xf5d77f);
  } else if (nibType === 'platinum') {
    customNibMesh.material.color.setHex(0xe0e0e0);
  }
  showToast(`Nib selection set to ${nibType.toUpperCase()}`);
}

// Window Resize Handler
function setupWindowResize() {
  window.addEventListener("resize", () => {
    const heroWrap = document.getElementById("hero-3d-wrapper");
    if (heroWrap && heroRenderer && heroCamera) {
      heroCamera.aspect = heroWrap.clientWidth / heroWrap.clientHeight;
      heroCamera.updateProjectionMatrix();
      heroRenderer.setSize(heroWrap.clientWidth, heroWrap.clientHeight);
    }

    const customWrap = document.getElementById("customizer-3d-viewport");
    if (customWrap && customRenderer && customCamera) {
      customCamera.aspect = customWrap.clientWidth / customWrap.clientHeight;
      customCamera.updateProjectionMatrix();
      customRenderer.setSize(customWrap.clientWidth, customWrap.clientHeight);
    }
  });
}
