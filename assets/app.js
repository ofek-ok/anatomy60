// AnatoMe Mobile Engine — Mobile-Only Architecture with Cozy 3D WebGL Diorama
const titles = [
  "Anatomical Language & Planes", "The Skeletal Framework", "Joints & Kinesiology",
  "Muscle Foundations & Fiber Types", "The Shoulder Complex", "The Arm & Forearm",
  "The Hand & Precision Grip", "The Vertebral Column", "The Core Stabilizers",
  "The Pelvis & Hip Joint", "The Thigh & Femoral Mechanics", "The Knee & Ligamentous Stability",
  "The Lower Leg & Kinetic Chains", "The Foot & Longitudinal Arches", "Review & Clinical Integration"
];

const descriptions = [
  "Anatomical position, directional planes, and patient orientation.",
  "Key bones, palpable landmarks, and structural load distribution.",
  "Articular kinematics, mechanical axes, and angular degrees of freedom.",
  "Sarcomere sliding, motor unit recruitment, and force vectors.",
  "Scapulohumeral rhythm, rotator cuff, and glenohumeral stabilizers.",
  "Brachial compartment, elbow flexion-extension, and radioulnar pronation.",
  "Thenar/hypothenar compartments, retinaculum, and intrinsic hand control.",
  "Vertebral curvature, intervertebral discs, and spinal cord channels.",
  "Intra-abdominal pressure, transverse abdominis, and lumbar protection.",
  "Acetabular mechanics, iliopsoas, gluteal complex, and gait stabilization.",
  "Quadriceps, hamstrings, adductor canal, and femoral triangle.",
  "Cruciate ligaments (ACL/PCL), meniscal shock absorption, and patellar tracking.",
  "Anterior/posterior compartments, fibular nerve paths, and tibial loading.",
  "Windlass mechanism, plantar fascia, and shock dissipation.",
  "Connecting anatomical landmarks into an intuitive, functional diagnostic map."
];

// Cozy Tactile SFX + Mobile Haptics
let audioCtx = null;
function triggerHapticFeedback(pattern = [15]) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) {
    // Unsupported or blocked
  }
}

function playCozySound(type = 'pop') {
  triggerHapticFeedback(type === 'chime' ? [20, 40, 20] : [12]);
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, now + i * 0.06);
        g.gain.setValueAtTime(0.12, now + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
        o.start(now + i * 0.06);
        o.stop(now + i * 0.06 + 0.25);
      });
    }
  } catch (e) {
    // Audio context suspended or muted
  }
}

// Persistent State
const state = JSON.parse(localStorage.getItem('anatome-mobile-state') || '{"days":0,"xp":0,"streak":0,"lastDate":"","lessonProgress":0,"completed":[]}');
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let currentView = 'home';
let currentRegion = '';
let currentLayer = 3;
let isIsolated = false;
let isPlayingAction = false;
let sheetExpanded = true;

function save() {
  localStorage.setItem('anatome-mobile-state', JSON.stringify(state));
  renderStats();
}

function renderStats() {
  const day = Math.min(state.days + 1, 60);
  ['#top-day-num', '#day-badge-num'].forEach(s => {
    if ($(s)) $(s).textContent = s.includes('badge') ? String(day).padStart(2, '0') : day;
  });
  ['#top-xp', '#profile-xp'].forEach(s => {
    if ($(s)) $(s).textContent = state.xp;
  });
  ['#streak-count', '#profile-streak'].forEach(s => {
    if ($(s)) $(s).textContent = state.streak;
  });
  ['#days-count', '#journey-days', '#profile-days'].forEach(s => {
    if ($(s)) $(s).textContent = state.days;
  });
  if ($('#mastered-count')) $('#mastered-count').textContent = state.completed.length;

  const pct = state.lessonProgress;
  if ($('#lesson-progress-fill')) $('#lesson-progress-fill').style.width = pct + '%';
  if ($('#lesson-progress-text')) $('#lesson-progress-text').textContent = `${pct}%`;
  if ($('#journey-progress-fill')) $('#journey-progress-fill').style.width = (state.days / 60 * 100) + '%';
  if ($('#journey-percent')) $('#journey-percent').textContent = `${Math.round(state.days / 60 * 100)}% Complete`;

  const titleIdx = Math.min(state.days, titles.length - 1);
  if ($('#lesson-title')) $('#lesson-title').textContent = titles[titleIdx];
  if ($('#lesson-subtitle')) $('#lesson-subtitle').textContent = descriptions[titleIdx];

  renderWeek();
  renderJourney();
}

function renderWeek() {
  const el = $('#week-strip');
  if (!el) return;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  el.innerHTML = days.map((d, i) => {
    const isToday = i === new Date().getDay() - 1;
    const isDone = i < state.streak;
    return `
      <div class="week-day ${isToday ? 'today' : ''} ${isDone ? 'done' : ''}">
        <span>${d}</span>
        <b>${isDone ? '✓' : i + 1}</b>
      </div>`;
  }).join('');
}

const units = [
  ['Anatomical Language & Axes', 'Spatial planes, orientations, and clinical terminology'],
  ['Skeletal Framework & Biomechanics', '206 bones, landmarks, and mechanical leverage'],
  ['Joint Kinesiology & Degrees of Freedom', 'Synovial joints, capsules, and ranges of motion'],
  ['Muscular Physiology & Actions', 'Sliding filament model, motor units, agonist/synergist pairs'],
  ['Shoulder Girdle Complex', 'Scapulohumeral rhythm, rotator cuff, and stability'],
  ['Arm, Elbow & Forearm', 'Flexion-extension, pronation-supination pathways'],
  ['Wrist & Precision Manual Grasp', 'Carpal kinematics, retinacula, and intrinsic hand control'],
  ['Vertebral Column & Axial Posture', 'Intervertebral mechanics, curves, and spinal canal'],
  ['Pelvis, Hip & Femoral Dynamics', 'Acetabular torque, iliopsoas, and gluteal force vectors'],
  ['Knee, Lower Leg & Gait Mechanics', 'Cruciate ligaments, meniscal loads, and propulsion']
];

function renderJourney() {
  const list = $('#journey-list');
  if (!list) return;
  list.innerHTML = units.map((u, i) => {
    const n = (i + 1) * 6 - 5;
    const done = state.days >= n + 5;
    const current = state.days >= n - 1 && !done;
    return `
      <div class="journey-item ${current ? 'current' : ''}" data-unit="${i}">
        <div class="journey-num">${done ? '✓' : String(i + 1).padStart(2, '0')}</div>
        <div class="journey-info">
          <h3>${u[0]}</h3>
          <p>${u[1]}</p>
        </div>
        <span class="journey-badge">${done ? 'DONE' : current ? 'NOW' : `D${n}–${n + 5}`}</span>
      </div>`;
  }).join('');

  list.querySelectorAll('.journey-item').forEach(b => b.onclick = () => {
    playCozySound('pop');
    if (+b.dataset.unit === 0 || +b.dataset.unit <= Math.floor(state.days / 6)) {
      goToTab('home');
      $('#continue-button').focus();
    } else {
      toast('Complete current unit to unlock the next one.');
    }
  });
}

// Thumb Bottom Navigation Controller
function goToTab(tabName) {
  playCozySound('pop');
  currentView = tabName;
  $$('.mobile-view').forEach(v => {
    const isTarget = v.id === `view-${tabName}`;
    v.classList.toggle('active', isTarget);
    v.classList.toggle('hidden', !isTarget);
  });
  $$('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === tabName));

  if (tabName === 'explore' && window.dioramaEngine) {
    window.dioramaEngine.handleResize();
  }

  const appScreen = $('#app-screen');
  if (appScreen) appScreen.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('.nav-tab').forEach(b => b.onclick = () => goToTab(b.dataset.view));
$$('[data-goto]').forEach(b => b.onclick = () => goToTab(b.dataset.goto));

// Toast Notification
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// Lesson Continue Button
const contBtn = $('#continue-button');
if (contBtn) {
  contBtn.onclick = () => {
    playCozySound('pop');
    if (state.lessonProgress < 100) {
      state.lessonProgress = Math.min(100, state.lessonProgress + 25);
      if (state.lessonProgress === 100) {
        playCozySound('chime');
        const today = new Date().toISOString().slice(0, 10);
        if (!state.completed.includes(state.days)) {
          state.completed.push(state.days);
          state.days = Math.min(60, state.days + 1);
          state.xp += 25;
          state.streak = state.lastDate === today ? state.streak : state.streak + 1;
          state.lastDate = today;
          state.lessonProgress = 0;
        }
        toast('✦ Lesson complete! +25 XP');
      } else {
        toast(`Lesson progress: ${state.lessonProgress}%`);
      }
      save();
    }
  };
}

// Medical Region Mapping
const regionNames = {
  shoulders: "Shoulder Girdle & Rotator Cuff",
  chest: "Chest & Thoracic Wall",
  arms: "Arm & Forearm Kinetic Chain",
  core: "Abdominal & Lumbar Stabilizers",
  legs: "Thigh, Knee & Lower Leg"
};

const regionRegistryMap = {
  shoulders: "shoulder",
  chest: "chest",
  arms: "arm",
  core: "core",
  legs: "hipAndThigh"
};

function selectRegion(key) {
  playCozySound('pop');
  currentRegion = key;
  const regKey = regionRegistryMap[key] || "shoulder";
  const muscles = (typeof ANATOMY_REGISTRY !== 'undefined' && ANATOMY_REGISTRY.muscles[regKey]) ? ANATOMY_REGISTRY.muscles[regKey] : [];

  if ($('#region-title')) $('#region-title').textContent = regionNames[key] || "Anatomy Inspection";
  if ($('#region-latin')) $('#region-latin').textContent = muscles[0] ? muscles[0].latin : "Systema Musculoskeletale";

  let contentHTML = '';
  muscles.forEach(m => {
    contentHTML += `
      <div class="detail-group">
        <h3 style="display:flex; justify-content:space-between; align-items:center;">
          <span>${m.english.toUpperCase()}</span>
          <span style="font-size:9px; background:#F0ECE6; padding:2px 8px; border-radius:10px; color:#5B7BA6;">Layer ${m.layer}</span>
        </h3>
        <p style="font-family:'Lora',serif; font-style:italic; font-size:12px; color:#5B7BA6; margin:0 0 6px;">${m.latin}</p>
        <div class="anchor-chip origin">● Origin: ${m.origin}</div>
        <div class="anchor-chip insertion">● Insertion: ${m.insertion}</div>
        <div style="margin-top:6px;">
          ${m.actions.map(a => `<span class="structure-chip">${a}</span>`).join('')}
        </div>
        <p style="font-size:11px; color:#7E8494; margin:4px 0 0;"><strong>Innervation:</strong> ${m.innervation}</p>
      </div>
      <hr style="border:0; border-top:1px dashed #EBE6DF; margin:10px 0;">
    `;
  });

  if ($('#region-content')) $('#region-content').innerHTML = contentHTML;

  // Sync with 3D Diorama
  if (window.dioramaEngine) {
    window.dioramaEngine.setActiveRegion(key);
  }

  // Expand bottom sheet if collapsed
  const sheet = $('#bottom-sheet');
  if (sheet) {
    sheet.style.display = 'block';
    sheet.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}

// Anterior / Posterior View Switch
$$('.pill-btn').forEach(b => b.onclick = () => {
  playCozySound('pop');
  const back = b.dataset.viewbody === 'back';
  $$('.pill-btn').forEach(x => x.classList.toggle('selected', x === b));
  if (window.dioramaEngine) {
    window.dioramaEngine.setTurntableAngle(back ? Math.PI : 0);
  }
  $('#figure-caption').textContent = back ? 'POSTERIOR VIEW' : 'ANTERIOR VIEW';
  toast(back ? 'Posterior view active' : 'Anterior view active');
});

// Chunky Thumb Layer Slider
$$('.peel-thumb-btn').forEach(btn => {
  btn.onclick = () => {
    playCozySound('pop');
    const layer = +btn.dataset.layer;
    currentLayer = layer;
    $$('.peel-thumb-btn').forEach(b => b.classList.toggle('selected', +b.dataset.layer === layer));

    if (window.dioramaEngine) {
      window.dioramaEngine.setPeelLayer(layer);
    }

    if (layer === 0) {
      toast('Layer 0: Skeleton Only (206 Bones)');
    } else if (layer === 1) {
      toast('Layer 1: Deep Muscles & Stabilizers');
    } else if (layer === 2) {
      toast('Layer 2: Superficial Movers');
    } else {
      toast('Layer 3: Skin & Silhouette Shell');
    }
  };
});

// Bottom Sheet Collapse Toggle
const sheetToggle = $('#sheet-toggle');
const sheetHandle = $('#sheet-handle');
function toggleSheet() {
  sheetExpanded = !sheetExpanded;
  playCozySound('pop');
  const content = $('#region-content');
  if (content) content.style.display = sheetExpanded ? 'flex' : 'none';
  if (sheetToggle) sheetToggle.textContent = sheetExpanded ? '▼' : '▲';
}
if (sheetToggle) sheetToggle.onclick = toggleSheet;
if (sheetHandle) sheetHandle.onclick = toggleSheet;

// Kinesiology Action Play
const actionBtn = $('#action-play-btn');
if (actionBtn) {
  actionBtn.onclick = () => {
    if (!currentRegion) {
      toast('Tap a pin on the body map first.');
      return;
    }
    isPlayingAction = !isPlayingAction;
    playCozySound(isPlayingAction ? 'chime' : 'pop');
    actionBtn.classList.toggle('active', isPlayingAction);

    if (window.dioramaEngine) {
      window.dioramaEngine.setKinesiologyPlaying(isPlayingAction);
    }

    if (isPlayingAction) {
      toast('✦ Action State: Muscle shortening & force loop');
    } else {
      toast('Action paused');
    }
  };
}

// Isolation Mode
const isolateBtn = $('#action-isolate-btn');
if (isolateBtn) {
  isolateBtn.onclick = () => {
    if (!currentRegion) {
      toast('Tap a pin on the body map first.');
      return;
    }
    isIsolated = !isIsolated;
    playCozySound('pop');
    isolateBtn.classList.toggle('active', isIsolated);

    if (window.dioramaEngine) {
      window.dioramaEngine.setIsolated(isIsolated, currentRegion);
    }

    if (isIsolated) {
      toast('⊞ Isolation Mode: Active structure only');
    } else {
      toast('Isolation exited');
    }
  };
}

// Reset Progress
const resetBtn = $('#reset-progress');
if (resetBtn) {
  resetBtn.onclick = () => {
    playCozySound('pop');
    state.days = 0;
    state.xp = 0;
    state.streak = 0;
    state.lastDate = '';
    state.lessonProgress = 0;
    state.completed = [];
    save();
    toast('Local progress reset.');
  };
}

// Regional Carousel Chunk Switcher
const chunkToRegionMap = {
  shoulder: "shoulders",
  forearm: "arms",
  chest: "chest",
  core: "core",
  pelvis: "legs",
  thigh: "legs",
  leg: "legs"
};

$$('.region-chip').forEach(chip => {
  chip.onclick = () => {
    playCozySound('pop');
    $$('.region-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const targetRegion = chunkToRegionMap[chip.dataset.chunk] || "shoulders";
    selectRegion(targetRegion);
    toast(`Viewing Region: ${chip.textContent.trim()}`);
  };
});

// =========================================================================
// 3D COZY WEBGL DIORAMA ENGINE (THREE.JS)
// =========================================================================
class AnatoMeDiorama {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.clientWidth || 320;
    this.height = canvas.clientHeight || 380;
    
    this.targetRotY = 0;
    this.targetRotX = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.hasMoved = false;

    this.currentPeelLayer = 3;
    this.isIsolated = false;
    this.activeRegion = '';
    this.isKinesiologyPlaying = false;
    this.actionPhase = 0;

    this.regionMeshes = {
      shoulders: [],
      arms: [],
      chest: [],
      core: [],
      legs: []
    };

    this.pins = [];
    this.allMaterials = [];

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 50);
    this.camera.position.set(0, 0.95, 3.8);
    this.camera.lookAt(0, 0.85, 0);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 3. Diorama Root Group
    this.dioramaGroup = new THREE.Group();
    this.scene.add(this.dioramaGroup);

    // 4. Raycaster for 3D Pin Interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 5. Build Scene Layers & Models
    this.createMaterials();
    this.buildPedestal();
    this.buildSkeletonLayer();
    this.buildDeepMusclesLayer();
    this.buildSuperficialMusclesLayer();
    this.buildSkinShell();
    this.buildPins();

    // 6. Setup Pointer Controls
    this.setupEvents();

    // 7. Render Loop
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createCozyShaderMaterial(baseHex, shadowHex, fresnelHex, outlineHex, options = {}) {
    const baseColor = new THREE.Color(baseHex);
    const shadowColor = new THREE.Color(shadowHex);
    const fresnelColor = new THREE.Color(fresnelHex || 0xfff0ea);
    const lightColor = new THREE.Color(0xfffaf5);
    const lightDir = new THREE.Vector3(0.5, 1.2, 0.8).normalize();

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: baseColor },
        uShadowColor: { value: shadowColor },
        uFresnelColor: { value: fresnelColor },
        uLightColor: { value: lightColor },
        uLightDir: { value: lightDir },
        uRampSmoothness: { value: options.rampSmoothness || 0.46 },
        uRampOffset: { value: options.rampOffset || 0.02 },
        uFresnelPower: { value: options.fresnelPower || 2.1 },
        uFresnelIntensity: { value: options.fresnelIntensity || 0.95 },
        uContactAO: { value: options.contactAO || 0.32 },
        uOpacity: { value: options.opacity !== undefined ? options.opacity : 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uBaseColor;
        uniform vec3 uShadowColor;
        uniform vec3 uFresnelColor;
        uniform vec3 uLightColor;
        uniform vec3 uLightDir;
        uniform float uRampSmoothness;
        uniform float uRampOffset;
        uniform float uFresnelPower;
        uniform float uFresnelIntensity;
        uniform float uContactAO;
        uniform float uOpacity;

        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);

          // Wide Half-Lambert soft gradient lighting
          float NdotL = dot(normal, uLightDir);
          float halfLambert = NdotL * 0.5 + 0.5;
          float ramp = smoothstep(uRampOffset, uRampOffset + uRampSmoothness, halfLambert);
          vec3 surfaceColor = mix(uShadowColor, uBaseColor, ramp);

          // Soft Contact Ambient Occlusion
          float ao = mix(1.0 - uContactAO, 1.0, clamp(normal.y * 0.5 + 0.5, 0.0, 1.0));
          surfaceColor *= ao;

          // Warm Pastel Fresnel Rim Glow
          float NdotV = 1.0 - clamp(dot(normal, viewDir), 0.0, 1.0);
          float fresnel = pow(NdotV, uFresnelPower) * uFresnelIntensity;
          vec3 rimGlow = uFresnelColor * fresnel;

          vec3 finalColor = surfaceColor * uLightColor + rimGlow;
          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `,
      transparent: true,
      depthWrite: true
    });

    this.allMaterials.push(mat);
    return mat;
  }

  createMaterials() {
    // Warm Porcelain Ivory Bone
    this.boneMat = this.createCozyShaderMaterial(0xFAF7F2, 0xE2DDD4, 0xFFFAF2, 0x9C8C7E, {
      fresnelIntensity: 0.8,
      contactAO: 0.35
    });

    // Matte White Fibrous Tendons
    this.tendonMat = this.createCozyShaderMaterial(0xF6F4EE, 0xDFD8CC, 0xFFFFFF, 0xA69B8F, {
      fresnelIntensity: 0.6,
      contactAO: 0.25
    });

    // Deep Muscles & Rotator Cuff (Warm Rose/Coral)
    this.deepMat = this.createCozyShaderMaterial(0xD97D7A, 0xB25855, 0xFFECE8, 0x6E3932, {
      fresnelIntensity: 1.1,
      contactAO: 0.38
    });

    // Superficial Movers (Soft Warm Peach)
    this.superficialMat = this.createCozyShaderMaterial(0xF29E8E, 0xD47668, 0xFFF2EC, 0x7D473E, {
      fresnelIntensity: 1.25,
      contactAO: 0.36
    });

    // Skin Silhouette Outer Shell
    this.skinMat = this.createCozyShaderMaterial(0xFBF4EA, 0xECE0D0, 0xFFFAF0, 0xC4B2A0, {
      opacity: 0.22,
      fresnelIntensity: 1.4,
      fresnelPower: 1.6
    });

    // Pedestal Travertine Plinth
    this.plinthMat = this.createCozyShaderMaterial(0xFAF8F5, 0xEBE3D8, 0xFFFAF2, 0x9C8C7E, {
      fresnelIntensity: 0.5,
      contactAO: 0.2
    });
  }

  buildPedestal() {
    const pedestalGroup = new THREE.Group();

    // 1. Beveled travertine cylinder
    const plinthGeom = new THREE.CylinderGeometry(1.35, 1.42, 0.16, 40);
    const plinth = new THREE.Mesh(plinthGeom, this.plinthMat);
    plinth.position.y = -0.08;
    pedestalGroup.add(plinth);

    // 2. Brass rim trim
    const rimGeom = new THREE.TorusGeometry(1.42, 0.014, 16, 40);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xD8B880 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.15;
    pedestalGroup.add(rim);

    // 3. Soft contact shadow plane directly on the plinth surface
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(80, 60, 50, 0.38)');
    grad.addColorStop(0.45, 'rgba(80, 60, 50, 0.18)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeom = new THREE.PlaneGeometry(2.1, 2.1);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.002;
    pedestalGroup.add(shadowMesh);

    this.dioramaGroup.add(pedestalGroup);
  }

  // Layer 0: Skeleton Framework (Matte Porcelain Ivory)
  buildSkeletonLayer() {
    this.layer0Group = new THREE.Group();

    // Cranium & Mandible
    const craniumGeom = new THREE.SphereGeometry(0.20, 24, 18);
    const cranium = new THREE.Mesh(craniumGeom, this.boneMat);
    cranium.scale.set(1.0, 1.15, 1.08);
    cranium.position.set(0, 1.84, 0);
    this.layer0Group.add(cranium);

    const mandibleGeom = new THREE.CylinderGeometry(0.08, 0.13, 0.10, 16);
    const mandible = new THREE.Mesh(mandibleGeom, this.boneMat);
    mandible.position.set(0, 1.70, 0.04);
    this.layer0Group.add(mandible);

    // Segmented Vertebral Column (Cervical, Thoracic, Lumbar beads)
    for (let i = 0; i < 9; i++) {
      const vertGeom = new THREE.CylinderGeometry(0.048 - i * 0.001, 0.052, 0.045, 14);
      const vert = new THREE.Mesh(vertGeom, this.boneMat);
      const yPos = 1.62 - i * 0.075;
      const zCurv = Math.sin((i / 8) * Math.PI) * -0.035;
      vert.position.set(0, yPos, zCurv);
      this.layer0Group.add(vert);
    }

    // Thoracic Ribcage & Sternum
    const ribGeom = new THREE.CylinderGeometry(0.24, 0.28, 0.44, 20);
    const ribMesh = new THREE.Mesh(ribGeom, this.boneMat);
    ribMesh.scale.set(1.0, 1.0, 0.78);
    ribMesh.position.set(0, 1.34, 0);
    this.layer0Group.add(ribMesh);

    const sternumGeom = new THREE.BoxGeometry(0.065, 0.32, 0.035);
    const sternum = new THREE.Mesh(sternumGeom, this.boneMat);
    sternum.position.set(0, 1.36, 0.14);
    this.layer0Group.add(sternum);

    // Clavicles (S-curved beams)
    [-1, 1].forEach(side => {
      const clavGeom = new THREE.CylinderGeometry(0.022, 0.025, 0.44, 14);
      const clav = new THREE.Mesh(clavGeom, this.boneMat);
      clav.rotation.z = side * 1.35;
      clav.rotation.y = side * 0.22;
      clav.position.set(side * 0.23, 1.55, 0.08);
      this.layer0Group.add(clav);
      this.regionMeshes.shoulders.push(clav);
    });

    // Scapulae (Posterior curved blades with Acromion spine)
    [-1, 1].forEach(side => {
      const scapGeom = new THREE.BoxGeometry(0.18, 0.25, 0.035);
      const scap = new THREE.Mesh(scapGeom, this.boneMat);
      scap.rotation.y = side * -0.35;
      scap.position.set(side * 0.26, 1.40, -0.13);
      this.layer0Group.add(scap);
      this.regionMeshes.shoulders.push(scap);
    });

    // Left Arm Bones (Static neutral)
    const leftHumerusGeom = new THREE.CylinderGeometry(0.042, 0.046, 0.40, 16);
    const leftHumerus = new THREE.Mesh(leftHumerusGeom, this.boneMat);
    leftHumerus.position.set(-0.52, 1.32, 0);
    this.layer0Group.add(leftHumerus);

    const leftForearmGeom = new THREE.CylinderGeometry(0.035, 0.038, 0.38, 16);
    const leftForearm = new THREE.Mesh(leftForearmGeom, this.boneMat);
    leftForearm.position.set(-0.54, 0.90, 0);
    this.layer0Group.add(leftForearm);

    // Right Arm Bone Rig (For genuine Kinesiology Action flexion)
    this.rightArmRig = new THREE.Group();
    this.rightArmRig.position.set(0.50, 1.54, 0);

    const rightHumerusGeom = new THREE.CylinderGeometry(0.042, 0.046, 0.40, 16);
    const rightHumerus = new THREE.Mesh(rightHumerusGeom, this.boneMat);
    rightHumerus.position.set(0.02, -0.22, 0);
    this.rightArmRig.add(rightHumerus);
    this.regionMeshes.arms.push(rightHumerus);

    // Right Elbow Joint (Rotates dynamically!)
    this.rightElbowJoint = new THREE.Group();
    this.rightElbowJoint.position.set(0.02, -0.42, 0);

    const rightForearmGeom = new THREE.CylinderGeometry(0.035, 0.038, 0.38, 16);
    const rightForearm = new THREE.Mesh(rightForearmGeom, this.boneMat);
    rightForearm.position.set(0.01, -0.19, 0);
    this.rightElbowJoint.add(rightForearm);
    this.regionMeshes.arms.push(rightForearm);

    // Tactile Hand
    const handGeom = new THREE.SphereGeometry(0.05, 14, 12);
    const rightHand = new THREE.Mesh(handGeom, this.boneMat);
    rightHand.position.set(0.01, -0.42, 0);
    this.rightElbowJoint.add(rightHand);

    this.rightArmRig.add(this.rightElbowJoint);
    this.layer0Group.add(this.rightArmRig);

    // Pelvis (Iliac crests, Sacrum, Pubic arch)
    const pelvisGeom = new THREE.CylinderGeometry(0.24, 0.20, 0.22, 18);
    const pelvis = new THREE.Mesh(pelvisGeom, this.boneMat);
    pelvis.scale.set(1.0, 1.0, 0.85);
    pelvis.position.set(0, 0.86, 0);
    this.layer0Group.add(pelvis);

    // Legs (Femurs, Patellae, Shins, Feet)
    [-1, 1].forEach(side => {
      const femurGeom = new THREE.CylinderGeometry(0.052, 0.058, 0.42, 16);
      const femur = new THREE.Mesh(femurGeom, this.boneMat);
      femur.position.set(side * 0.18, 0.60, 0);
      this.layer0Group.add(femur);
      this.regionMeshes.legs.push(femur);

      const patellaGeom = new THREE.SphereGeometry(0.04, 14, 12);
      const patella = new THREE.Mesh(patellaGeom, this.boneMat);
      patella.scale.set(1.0, 1.1, 0.6);
      patella.position.set(side * 0.18, 0.38, 0.07);
      this.layer0Group.add(patella);
      this.regionMeshes.legs.push(patella);

      const shinGeom = new THREE.CylinderGeometry(0.045, 0.048, 0.38, 16);
      const shin = new THREE.Mesh(shinGeom, this.boneMat);
      shin.position.set(side * 0.18, 0.18, 0);
      this.layer0Group.add(shin);
      this.regionMeshes.legs.push(shin);

      // Foot Plinth
      const footGeom = new THREE.BoxGeometry(0.09, 0.055, 0.16);
      const foot = new THREE.Mesh(footGeom, this.boneMat);
      foot.position.set(side * 0.18, 0.02, 0.04);
      this.layer0Group.add(foot);
    });

    this.dioramaGroup.add(this.layer0Group);
  }

  // Layer 1: Deep Muscles & Rotator Cuff (Warm Rose/Coral)
  buildDeepMusclesLayer() {
    this.layer1Group = new THREE.Group();

    // Brachialis (Deep elbow flexor directly under distal biceps)
    // Left Brachialis
    const leftBrachialisGeom = new THREE.CylinderGeometry(0.045, 0.05, 0.18, 16);
    const leftBrachialis = new THREE.Mesh(leftBrachialisGeom, this.deepMat);
    leftBrachialis.position.set(-0.52, 1.20, 0.035);
    this.layer1Group.add(leftBrachialis);

    // Right Brachialis (Inside right arm rig)
    const rightBrachialisGeom = new THREE.CylinderGeometry(0.045, 0.05, 0.18, 16);
    const rightBrachialis = new THREE.Mesh(rightBrachialisGeom, this.deepMat);
    rightBrachialis.position.set(0.02, -0.32, 0.035);
    this.rightArmRig.add(rightBrachialis);
    this.regionMeshes.arms.push(rightBrachialis);

    // Rotator Cuff (Supraspinatus, Subscapularis, Infraspinatus)
    [-1, 1].forEach(side => {
      // Supraspinatus
      const supraGeom = new THREE.BoxGeometry(0.14, 0.06, 0.08);
      const supra = new THREE.Mesh(supraGeom, this.deepMat);
      supra.position.set(side * 0.32, 1.54, -0.06);
      this.layer1Group.add(supra);
      this.regionMeshes.shoulders.push(supra);

      // Subscapularis
      const subscapGeom = new THREE.BoxGeometry(0.12, 0.18, 0.04);
      const subscap = new THREE.Mesh(subscapGeom, this.deepMat);
      subscap.position.set(side * 0.28, 1.38, 0.02);
      this.layer1Group.add(subscap);
      this.regionMeshes.shoulders.push(subscap);
    });

    // Deep Core / Transversus Abdominis
    const deepCoreGeom = new THREE.CylinderGeometry(0.24, 0.22, 0.28, 18);
    const deepCore = new THREE.Mesh(deepCoreGeom, this.deepMat);
    deepCore.scale.set(0.96, 1.0, 0.82);
    deepCore.position.set(0, 1.05, 0);
    this.layer1Group.add(deepCore);
    this.regionMeshes.core.push(deepCore);

    this.dioramaGroup.add(this.layer1Group);
  }

  // Layer 2: Superficial Movers (Soft Warm Peach with White Tendons & Discrete Bellies)
  buildSuperficialMusclesLayer() {
    this.layer2Group = new THREE.Group();

    // 1. White Matte Tendons
    // Right Distal Biceps Tendon (Inserting into radial tuberosity)
    const rightDistalTendonGeom = new THREE.CylinderGeometry(0.016, 0.02, 0.09, 12);
    const rightDistalTendon = new THREE.Mesh(rightDistalTendonGeom, this.tendonMat);
    rightDistalTendon.position.set(0.02, -0.04, 0.02);
    this.rightElbowJoint.add(rightDistalTendon);
    this.regionMeshes.arms.push(rightDistalTendon);

    // Right Proximal Biceps Tendons (White cords into shoulder socket)
    const longTendonGeom = new THREE.CylinderGeometry(0.012, 0.014, 0.12, 10);
    const rightLongTendon = new THREE.Mesh(longTendonGeom, this.tendonMat);
    rightLongTendon.position.set(0.05, -0.07, 0.03);
    this.rightArmRig.add(rightLongTendon);

    const shortTendonGeom = new THREE.CylinderGeometry(0.012, 0.014, 0.10, 10);
    const rightShortTendon = new THREE.Mesh(shortTendonGeom, this.tendonMat);
    rightShortTendon.position.set(-0.01, -0.08, 0.04);
    this.rightArmRig.add(rightShortTendon);

    // Patellar & Achilles Tendons
    [-1, 1].forEach(side => {
      const patTendonGeom = new THREE.CylinderGeometry(0.022, 0.024, 0.12, 12);
      const patTendon = new THREE.Mesh(patTendonGeom, this.tendonMat);
      patTendon.position.set(side * 0.18, 0.32, 0.065);
      this.layer2Group.add(patTendon);
      this.regionMeshes.legs.push(patTendon);

      const achillesGeom = new THREE.CylinderGeometry(0.018, 0.022, 0.14, 12);
      const achilles = new THREE.Mesh(achillesGeom, this.tendonMat);
      achilles.position.set(side * 0.18, 0.10, -0.045);
      this.layer2Group.add(achilles);
      this.regionMeshes.legs.push(achilles);
    });

    // 2. DISCRETE BICEPS BRACHII (Two Plump Separate Bellies!)
    // Rigged Right Biceps Group (Bulges dynamically during Kinesiology flexion!)
    this.rightBicepsGroup = new THREE.Group();
    this.rightBicepsGroup.position.set(0.02, -0.22, 0.045);

    // Caput Longum (Lateral Plump Belly)
    const bicepsLongGeom = new THREE.CylinderGeometry(0.038, 0.045, 0.22, 16);
    const bicepsLong = new THREE.Mesh(bicepsLongGeom, this.superficialMat);
    bicepsLong.position.set(0.028, 0, 0);
    bicepsLong.scale.set(1.0, 1.0, 1.15);
    this.rightBicepsGroup.add(bicepsLong);

    // Caput Breve (Medial Plump Belly)
    const bicepsBreveGeom = new THREE.CylinderGeometry(0.036, 0.044, 0.21, 16);
    const bicepsBreve = new THREE.Mesh(bicepsBreveGeom, this.superficialMat);
    bicepsBreve.position.set(-0.028, -0.01, 0);
    bicepsBreve.scale.set(1.0, 1.0, 1.15);
    this.rightBicepsGroup.add(bicepsBreve);

    this.rightArmRig.add(this.rightBicepsGroup);
    this.regionMeshes.arms.push(bicepsLong, bicepsBreve);

    // Right Triceps (Posterior Compartment)
    this.rightTricepsGroup = new THREE.Group();
    this.rightTricepsGroup.position.set(0.02, -0.20, -0.045);

    const tricepsLongGeom = new THREE.CylinderGeometry(0.042, 0.048, 0.24, 16);
    const tricepsLong = new THREE.Mesh(tricepsLongGeom, this.superficialMat);
    tricepsLong.position.set(-0.015, 0, 0);
    this.rightTricepsGroup.add(tricepsLong);

    const tricepsLatGeom = new THREE.CylinderGeometry(0.038, 0.044, 0.22, 16);
    const tricepsLat = new THREE.Mesh(tricepsLatGeom, this.superficialMat);
    tricepsLat.position.set(0.025, -0.02, 0);
    this.rightTricepsGroup.add(tricepsLat);

    this.rightArmRig.add(this.rightTricepsGroup);
    this.regionMeshes.arms.push(tricepsLong, tricepsLat);

    // Left Arm Muscles (Static)
    const leftBicepsGeom = new THREE.CylinderGeometry(0.05, 0.06, 0.24, 16);
    const leftBiceps = new THREE.Mesh(leftBicepsGeom, this.superficialMat);
    leftBiceps.position.set(-0.52, 1.32, 0.04);
    this.layer2Group.add(leftBiceps);

    // 3. DISCRETE DELTOID (Three Curving Heads wrapping Shoulder!)
    // Clavicular (Anterior), Acromial (Lateral), Spinalis (Posterior)
    [-1, 1].forEach(side => {
      const deltoidGroup = new THREE.Group();
      deltoidGroup.position.set(side * 0.48, 1.52, 0);

      // Anterior (Pars Clavicularis)
      const antGeom = new THREE.SphereGeometry(0.065, 16, 14);
      const antMesh = new THREE.Mesh(antGeom, this.superficialMat);
      antMesh.scale.set(0.85, 1.25, 0.85);
      antMesh.position.set(side * 0.02, 0, 0.055);
      deltoidGroup.add(antMesh);

      // Lateral (Pars Acromialis)
      const latGeom = new THREE.SphereGeometry(0.075, 16, 14);
      const latMesh = new THREE.Mesh(latGeom, this.superficialMat);
      latMesh.scale.set(0.85, 1.35, 0.95);
      latMesh.position.set(side * 0.06, -0.02, 0);
      deltoidGroup.add(latMesh);

      // Posterior (Pars Spinalis)
      const postGeom = new THREE.SphereGeometry(0.065, 16, 14);
      const postMesh = new THREE.Mesh(postGeom, this.superficialMat);
      postMesh.scale.set(0.85, 1.25, 0.85);
      postMesh.position.set(side * 0.02, 0, -0.055);
      deltoidGroup.add(postMesh);

      this.layer2Group.add(deltoidGroup);
      this.regionMeshes.shoulders.push(antMesh, latMesh, postMesh);
    });

    // 4. Pectoralis Major (Puffy contoured chest plates)
    [-1, 1].forEach(side => {
      const pectGeom = new THREE.BoxGeometry(0.20, 0.18, 0.06);
      const pect = new THREE.Mesh(pectGeom, this.superficialMat);
      pect.rotation.y = side * 0.20;
      pect.position.set(side * 0.14, 1.40, 0.15);
      this.layer2Group.add(pect);
      this.regionMeshes.chest.push(pect);
    });

    // 5. Rectus Abdominis (6 Rounded Vinyl Cushions!)
    for (let row = 0; row < 3; row++) {
      [-1, 1].forEach(col => {
        const absGeom = new THREE.BoxGeometry(0.09, 0.075, 0.04);
        const abs = new THREE.Mesh(absGeom, this.superficialMat);
        abs.position.set(col * 0.055, 1.18 - row * 0.085, 0.135);
        this.layer2Group.add(abs);
        this.regionMeshes.core.push(abs);
      });
    }

    // External Obliques (Flanks)
    [-1, 1].forEach(side => {
      const oblGeom = new THREE.CylinderGeometry(0.06, 0.07, 0.22, 14);
      const obl = new THREE.Mesh(oblGeom, this.superficialMat);
      obl.position.set(side * 0.24, 1.08, 0.03);
      this.layer2Group.add(obl);
      this.regionMeshes.core.push(obl);
    });

    // 6. Quadriceps & Hamstrings (Thighs)
    [-1, 1].forEach(side => {
      // Rectus Femoris (Central teardrop belly)
      const rfGeom = new THREE.CylinderGeometry(0.065, 0.075, 0.36, 16);
      const rf = new THREE.Mesh(rfGeom, this.superficialMat);
      rf.position.set(side * 0.18, 0.60, 0.04);
      this.layer2Group.add(rf);
      this.regionMeshes.legs.push(rf);

      // Vastus Medialis (Teardrop above knee)
      const vmGeom = new THREE.SphereGeometry(0.055, 14, 12);
      const vm = new THREE.Mesh(vmGeom, this.superficialMat);
      vm.position.set(side * 0.13, 0.44, 0.045);
      this.layer2Group.add(vm);
      this.regionMeshes.legs.push(vm);

      // Gastrocnemius (Dual calf bellies)
      const gastMedGeom = new THREE.CylinderGeometry(0.042, 0.052, 0.24, 14);
      const gastMed = new THREE.Mesh(gastMedGeom, this.superficialMat);
      gastMed.position.set(side * 0.16, 0.22, -0.025);
      this.layer2Group.add(gastMed);
      this.regionMeshes.legs.push(gastMed);
    });

    this.dioramaGroup.add(this.layer2Group);
  }

  // Layer 3: Skin Silhouette Shell (Translucent Soft Peach Glow)
  buildSkinShell() {
    this.layer3Group = new THREE.Group();

    const skinGeom = new THREE.CylinderGeometry(0.28, 0.26, 0.90, 20);
    const skinMesh = new THREE.Mesh(skinGeom, this.skinMat);
    skinMesh.scale.set(1.05, 1.0, 0.90);
    skinMesh.position.set(0, 1.25, 0);
    this.layer3Group.add(skinMesh);

    this.dioramaGroup.add(this.layer3Group);
  }

  // Tactile 3D Floating Pins (Hovering Collectibles)
  buildPins() {
    this.pinsGroup = new THREE.Group();

    const pinConfigs = [
      { key: 'shoulders', label: 'Deltoid', pos: new THREE.Vector3(0.52, 1.58, 0.16) },
      { key: 'arms', label: 'Biceps', pos: new THREE.Vector3(0.60, 1.25, 0.18) },
      { key: 'chest', label: 'Pectoralis', pos: new THREE.Vector3(0.16, 1.46, 0.25) },
      { key: 'core', label: 'Core', pos: new THREE.Vector3(0.0, 1.06, 0.22) },
      { key: 'legs', label: 'Quadriceps', pos: new THREE.Vector3(0.22, 0.52, 0.22) }
    ];

    pinConfigs.forEach((cfg, idx) => {
      const pinObj = new THREE.Group();
      pinObj.position.copy(cfg.pos);
      pinObj.userData = { key: cfg.key, basePos: cfg.pos.clone(), index: idx };

      // Pearl Head
      const headGeom = new THREE.SphereGeometry(0.046, 16, 12);
      const headMat = new THREE.MeshBasicMaterial({ color: 0x5ECDBB });
      const head = new THREE.Mesh(headGeom, headMat);
      pinObj.add(head);

      // Little Stem
      const stemGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = -0.04;
      pinObj.add(stem);

      // Glowing Pulsing Aura Ring at Base
      const ringGeom = new THREE.RingGeometry(0.042, 0.075, 18);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x98EADF,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.065;
      pinObj.add(ring);

      pinObj.head = head;
      pinObj.ring = ring;

      this.pins.push(pinObj);
      this.pinsGroup.add(pinObj);
    });

    this.dioramaGroup.add(this.pinsGroup);
  }

  setupEvents() {
    const el = this.canvas;

    const onPointerDown = e => {
      this.isDragging = true;
      this.hasMoved = false;
      this.dragStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      this.dragStartY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

      const hint = document.getElementById('diorama-hint');
      if (hint) hint.classList.add('fade-out');
    };

    const onPointerMove = e => {
      if (!this.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - this.dragStartX;
      const deltaY = clientY - this.dragStartY;

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        this.hasMoved = true;
      }

      this.targetRotY += deltaX * 0.009;
      this.targetRotX = Math.max(-0.25, Math.min(0.35, this.targetRotX + deltaY * 0.005));

      this.dragStartX = clientX;
      this.dragStartY = clientY;
    };

    const onPointerUp = e => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Tap / Click detection via Raycaster
      if (!this.hasMoved) {
        const rect = el.getBoundingClientRect();
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;

        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const pinHeads = this.pins.map(p => p.head);
        const intersects = this.raycaster.intersectObjects(pinHeads);

        if (intersects.length > 0) {
          const clickedHead = intersects[0].object;
          const parentPin = this.pins.find(p => p.head === clickedHead);
          if (parentPin && parentPin.userData && parentPin.userData.key) {
            selectRegion(parentPin.userData.key);
          }
        }
      }
    };

    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Responsive Canvas Resize
    window.addEventListener('resize', () => this.handleResize());
  }

  handleResize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth || 320;
    const h = parent.clientHeight || 380;
    if (w === 0 || h === 0) return;
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  setTurntableAngle(targetAngleY) {
    this.targetRotY = targetAngleY;
    this.targetRotX = 0;
  }

  setActiveRegion(regionKey) {
    this.activeRegion = regionKey;
    this.pins.forEach(pin => {
      const isActive = pin.userData.key === regionKey;
      pin.head.material.color.setHex(isActive ? 0xFCD45A : 0x5ECDBB);
      pin.ring.material.color.setHex(isActive ? 0xFFF2A8 : 0x98EADF);
    });

    if (this.isIsolated) {
      this.applyIsolationVisuals();
    }
  }

  setPeelLayer(layerNum) {
    this.currentPeelLayer = layerNum;

    // Layer 3 (Skin Shell)
    if (this.layer3Group) {
      this.layer3Group.visible = (layerNum === 3);
    }

    // Layer 2 (Superficial Muscles)
    if (this.layer2Group) {
      this.layer2Group.visible = (layerNum >= 2);
    }
    if (this.rightBicepsGroup) {
      this.rightBicepsGroup.visible = (layerNum >= 2);
    }
    if (this.rightTricepsGroup) {
      this.rightTricepsGroup.visible = (layerNum >= 2);
    }

    // Layer 1 (Deep Muscles)
    if (this.layer1Group) {
      this.layer1Group.visible = (layerNum >= 1);
    }

    // Layer 0 (Skeleton) is always visible as foundation
    if (this.layer0Group) {
      this.layer0Group.visible = true;
    }
  }

  setKinesiologyPlaying(isPlaying) {
    this.isKinesiologyPlaying = isPlaying;
    if (!isPlaying) {
      this.actionPhase = 0;
    }
  }

  setIsolated(isIsolated, regionKey) {
    this.isIsolated = isIsolated;
    this.activeRegion = regionKey;
    this.applyIsolationVisuals();
  }

  applyIsolationVisuals() {
    const isIso = this.isIsolated;
    const activeKey = this.activeRegion;

    Object.keys(this.regionMeshes).forEach(reg => {
      const isTarget = reg === activeKey;
      const meshes = this.regionMeshes[reg];
      meshes.forEach(m => {
        if (m.material && m.material.uniforms) {
          if (isIso) {
            m.material.uniforms.uOpacity.value = isTarget ? 1.0 : 0.14;
            m.material.uniforms.uFresnelIntensity.value = isTarget ? 1.8 : 0.4;
          } else {
            m.material.uniforms.uOpacity.value = 1.0;
            m.material.uniforms.uFresnelIntensity.value = 0.95;
          }
        }
      });
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Spring Turntable Orbit
    this.dioramaGroup.rotation.y += (this.targetRotY - this.dioramaGroup.rotation.y) * 0.12;
    this.dioramaGroup.rotation.x += (this.targetRotX - this.dioramaGroup.rotation.x) * 0.12;

    // 2. Floating Tactile 3D Pins Animation (Sine-wave bobbing + ring pulse)
    this.pins.forEach(pin => {
      const idx = pin.userData.index;
      pin.position.y = pin.userData.basePos.y + Math.sin(elapsedTime * 2.8 + idx * 0.9) * 0.022;
      const ringScale = 1.0 + Math.sin(elapsedTime * 3.5 + idx) * 0.14;
      pin.ring.scale.set(ringScale, ringScale, 1.0);
    });

    // 3. Kinesiology Action Kinematics (Elbow Joint Flexion + Biceps Bulge)
    if (this.rightElbowJoint && this.rightBicepsGroup) {
      if (this.isKinesiologyPlaying) {
        this.actionPhase += dt * 3.2;
        // Oscillate flexion between 0 and -1.8 rad (~105 deg flexion)
        const flexionCycle = (Math.sin(this.actionPhase) * 0.5 + 0.5);
        const targetFlexion = flexionCycle * -1.78;
        this.rightElbowJoint.rotation.x = THREE.MathUtils.lerp(this.rightElbowJoint.rotation.x, targetFlexion, 0.2);

        // Biceps Bulge (physiological shortening on Y, radial expansion on X/Z)
        const bulge = flexionCycle;
        this.rightBicepsGroup.scale.set(1.0 + bulge * 0.36, 1.0 - bulge * 0.24, 1.0 + bulge * 0.36);

        // Triceps stretch & lengthen
        if (this.rightTricepsGroup) {
          this.rightTricepsGroup.scale.set(1.0 - bulge * 0.14, 1.0 + bulge * 0.20, 1.0 - bulge * 0.14);
        }
      } else {
        // Smoothly return to anatomical neutral extension
        this.rightElbowJoint.rotation.x = THREE.MathUtils.lerp(this.rightElbowJoint.rotation.x, 0, 0.12);
        this.rightBicepsGroup.scale.set(
          THREE.MathUtils.lerp(this.rightBicepsGroup.scale.x, 1.0, 0.12),
          THREE.MathUtils.lerp(this.rightBicepsGroup.scale.y, 1.0, 0.12),
          THREE.MathUtils.lerp(this.rightBicepsGroup.scale.z, 1.0, 0.12)
        );
        if (this.rightTricepsGroup) {
          this.rightTricepsGroup.scale.set(
            THREE.MathUtils.lerp(this.rightTricepsGroup.scale.x, 1.0, 0.12),
            THREE.MathUtils.lerp(this.rightTricepsGroup.scale.y, 1.0, 0.12),
            THREE.MathUtils.lerp(this.rightTricepsGroup.scale.z, 1.0, 0.12)
          );
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate Diorama Engine on Load
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('diorama-canvas');
  if (canvas && typeof THREE !== 'undefined') {
    window.dioramaEngine = new AnatoMeDiorama(canvas);
  }
});

// Initialize UI Stats
renderStats();
