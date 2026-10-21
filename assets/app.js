// AnatoMe Mobile Engine — Full-Body Real Z-Anatomy 3D Architecture
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
let currentRegion = 'fullbody';
let currentLayer = 2;
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

// Medical Region Names
const regionNames = {
  fullbody: "Complete Human Musculoskeletal Atlas",
  shoulder: "Shoulder Girdle & Rotator Cuff",
  forearm: "Forearm, Wrist & Hand Chain",
  chest: "Thorax, Ribcage & Vertebral Column",
  core: "Abdominal Wall & Lumbar Spine",
  pelvis: "Pelvic Girdle & Gluteal Synergies",
  thigh: "Thigh, Femoral Triangle & Knee",
  leg: "Lower Leg, Ankle & Foot Arches"
};

const regionRegistryMap = {
  fullbody: "shoulder",
  shoulder: "shoulder",
  forearm: "arm",
  chest: "chest",
  core: "core",
  pelvis: "hipAndThigh",
  thigh: "hipAndThigh",
  leg: "hipAndThigh"
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

  // Sync with 3D Diorama Camera Focus
  if (window.dioramaEngine) {
    window.dioramaEngine.focusRegion(key);
  }

  // Update carousel chip UI
  $$('.region-chip').forEach(c => c.classList.toggle('active', c.dataset.chunk === key));

  // Expand bottom sheet
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
      toast('Layer 0: Scanned Skeleton (All 206 Bones)');
    } else if (layer === 1) {
      toast('Layer 1: Deep Muscles & Stabilizers');
    } else if (layer === 2) {
      toast('Layer 2: Superficial Movers (Full Muscular System)');
    } else {
      toast('Layer 3: Complete Anatomical View');
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
    isIsolated = !isIsolated;
    playCozySound('pop');
    isolateBtn.classList.toggle('active', isIsolated);

    if (window.dioramaEngine) {
      window.dioramaEngine.setIsolated(isIsolated, currentRegion);
    }

    if (isIsolated) {
      toast('⊞ Isolation Mode: Active structure highlighted');
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
$$('.region-chip').forEach(chip => {
  chip.onclick = () => {
    selectRegion(chip.dataset.chunk);
  };
});

// =========================================================================
// 3D COZY WEBGL DIORAMA ENGINE (FULL BODY REAL Z-ANATOMY)
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

    this.currentPeelLayer = 2;
    this.isIsolated = false;
    this.activeRegion = 'fullbody';
    this.isKinesiologyPlaying = false;
    this.actionPhase = 0;

    // Camera Navigation Focus Presets
    this.cameraPresets = {
      fullbody: { target: new THREE.Vector3(0, 0.60, 0), camPos: new THREE.Vector3(0, 0.70, 2.85) },
      shoulder: { target: new THREE.Vector3(-0.16, 1.28, 0), camPos: new THREE.Vector3(-0.16, 1.30, 1.20) },
      forearm: { target: new THREE.Vector3(-0.22, 0.92, 0), camPos: new THREE.Vector3(-0.22, 0.95, 1.15) },
      chest: { target: new THREE.Vector3(0, 1.28, 0.05), camPos: new THREE.Vector3(0, 1.30, 1.20) },
      core: { target: new THREE.Vector3(0, 0.95, 0.05), camPos: new THREE.Vector3(0, 0.98, 1.15) },
      pelvis: { target: new THREE.Vector3(0, 0.72, 0), camPos: new THREE.Vector3(0, 0.75, 1.20) },
      thigh: { target: new THREE.Vector3(0, 0.35, 0.05), camPos: new THREE.Vector3(0, 0.38, 1.30) },
      leg: { target: new THREE.Vector3(0, -0.15, 0.05), camPos: new THREE.Vector3(0, -0.10, 1.30) }
    };

    this.currentCamPos = new THREE.Vector3(0, 0.70, 2.85);
    this.targetCamPos = new THREE.Vector3(0, 0.70, 2.85);
    this.currentLookAt = new THREE.Vector3(0, 0.60, 0);
    this.targetLookAt = new THREE.Vector3(0, 0.60, 0);

    this.allMeshes = [];
    this.regionMeshes = {
      fullbody: [],
      shoulder: [],
      forearm: [],
      chest: [],
      core: [],
      pelvis: [],
      thigh: [],
      leg: []
    };

    this.pins = [];
    this.forearmBones = [];
    this.bicepsBellies = [];
    this.tricepsBellies = [];

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 50);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

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

    // 4. Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 5. Materials
    this.createMaterials();

    // 6. Plinth Pedestal
    this.buildPedestal();

    // 7. Load Real Z-Anatomy Full-Body Model
    this.loadFullBodyModel();

    // 8. Setup Pointer Controls
    this.setupEvents();

    // 9. Render Loop
    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createCozyShaderMaterial(baseHex, shadowHex, fresnelHex, options = {}) {
    const baseColor = new THREE.Color(baseHex);
    const shadowColor = new THREE.Color(shadowHex);
    const fresnelColor = new THREE.Color(fresnelHex || 0xfff0ea);
    const lightColor = new THREE.Color(0xfffaf5);
    const lightDir = new THREE.Vector3(0.5, 1.2, 0.9).normalize();

    return new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: baseColor },
        uShadowColor: { value: shadowColor },
        uFresnelColor: { value: fresnelColor },
        uLightColor: { value: lightColor },
        uLightDir: { value: lightDir },
        uRampSmoothness: { value: options.rampSmoothness || 0.45 },
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

          // Contact Ambient Occlusion
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
  }

  createMaterials() {
    // 1. Warm Porcelain Ivory Bone
    this.boneMat = this.createCozyShaderMaterial(0xFAF7F2, 0xE0D9CF, 0xFFFAF4, {
      fresnelIntensity: 0.85,
      contactAO: 0.38
    });

    // 2. Deep Muscles & Rotator Cuff (Warm Rose/Coral)
    this.deepMat = this.createCozyShaderMaterial(0xD97D7A, 0xB05652, 0xFFECE8, {
      fresnelIntensity: 1.15,
      contactAO: 0.40
    });

    // 3. Superficial Movers (Soft Warm Peach)
    this.superficialMat = this.createCozyShaderMaterial(0xF29E8E, 0xD27365, 0xFFF2EC, {
      fresnelIntensity: 1.30,
      contactAO: 0.36
    });

    // 4. Pedestal Travertine Plinth
    this.plinthMat = this.createCozyShaderMaterial(0xFAF8F5, 0xECE4DA, 0xFFFAF2, {
      fresnelIntensity: 0.5,
      contactAO: 0.2
    });
  }

  buildPedestal() {
    const pedestalGroup = new THREE.Group();

    // 1. Beveled travertine cylinder
    const plinthGeom = new THREE.CylinderGeometry(0.85, 0.92, 0.10, 48);
    const plinth = new THREE.Mesh(plinthGeom, this.plinthMat);
    plinth.position.y = -0.54;
    pedestalGroup.add(plinth);

    // 2. Brass rim trim
    const rimGeom = new THREE.TorusGeometry(0.92, 0.012, 16, 48);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xD8B880 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.59;
    pedestalGroup.add(rim);

    // 3. Soft contact shadow plane
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(80, 60, 50, 0.38)');
    grad.addColorStop(0.5, 'rgba(80, 60, 50, 0.16)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeom = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.485;
    pedestalGroup.add(shadowMesh);

    this.dioramaGroup.add(pedestalGroup);
  }

  loadFullBodyModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
      console.error('THREE.GLTFLoader not loaded');
      return;
    }

    const loader = new THREE.GLTFLoader();

    // Hook up DRACOLoader
    if (typeof THREE.DRACOLoader !== 'undefined') {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('/assets/draco/');
      loader.setDRACOLoader(dracoLoader);
    }

    loader.load('/assets/full_body.glb', (gltf) => {
      this.model = gltf.scene;
      
      // Categorization keywords
      const boneKeywords = ['bone', 'clavicle', 'scapula', 'humerus', 'radius', 'ulna', 'femur', 'patella', 'tibia', 'fibula', 'sternum', 'rib', 'vertebra', 'sacrum', 'ilium', 'ischium', 'pubis', 'parietal', 'frontal', 'occipital', 'temporal', 'sphenoid', 'mandible', 'maxilla', 'incus', 'malleus', 'stapes', 'metatarsal', 'metacarpal', 'phalanx', 'tarsal', 'carpal'];
      const deepKeywords = ['subscapularis', 'supraspinatus', 'infraspinatus', 'teres minor', 'teres major', 'brachialis', 'coracobrachialis', 'transversus abdominis', 'quadratus lumborum', 'iliopsoas', 'piriformis', 'obturator', 'gemellus', 'pectoralis minor', 'levator scapulae', 'rhomboid', 'soleus', 'tibialis posterior', 'deep'];
      
      this.model.traverse(child => {
        if (child.isMesh) {
          const name = child.name.toLowerCase();
          child.castShadow = true;
          child.receiveShadow = true;

          // Categorize by Layer (0: Bone, 1: Deep, 2: Superficial)
          if (boneKeywords.some(k => name.includes(k))) {
            child.material = this.boneMat.clone();
            child.userData.layer = 0;
            child.userData.category = 'bone';
          } else if (deepKeywords.some(k => name.includes(k))) {
            child.material = this.deepMat.clone();
            child.userData.layer = 1;
            child.userData.category = 'deep';
          } else {
            child.material = this.superficialMat.clone();
            child.userData.layer = 2;
            child.userData.category = 'superficial';
          }

          // Map to Regional Chunks
          this.regionMeshes.fullbody.push(child);
          if (name.includes('deltoid') || name.includes('scapula') || name.includes('clavicle') || name.includes('supraspinatus') || name.includes('infraspinatus') || name.includes('subscapularis') || name.includes('teres')) {
            this.regionMeshes.shoulder.push(child);
          }
          if (name.includes('biceps') || name.includes('triceps') || name.includes('brachialis') || name.includes('humerus') || name.includes('radius') || name.includes('ulna') || name.includes('pronator') || name.includes('flexor carpi') || name.includes('extensor carpi')) {
            this.regionMeshes.forearm.push(child);
          }
          if (name.includes('pectoralis') || name.includes('sternum') || name.includes('rib') || name.includes('intercostal') || name.includes('thoracic') || name.includes('trapezius') || name.includes('latissimus')) {
            this.regionMeshes.chest.push(child);
          }
          if (name.includes('rectus abdominis') || name.includes('oblique') || name.includes('transversus') || name.includes('linea alba') || name.includes('lumbar')) {
            this.regionMeshes.core.push(child);
          }
          if (name.includes('pelvis') || name.includes('ilium') || name.includes('gluteus') || name.includes('sacrum') || name.includes('piriformis') || name.includes('psoas')) {
            this.regionMeshes.pelvis.push(child);
          }
          if (name.includes('femur') || name.includes('quadriceps') || name.includes('rectus femoris') || name.includes('vastus') || name.includes('hamstring') || name.includes('biceps femoris') || name.includes('semitendinosus') || name.includes('patella') || name.includes('gracilis') || name.includes('sartorius')) {
            this.regionMeshes.thigh.push(child);
          }
          if (name.includes('tibia') || name.includes('fibula') || name.includes('gastrocnemius') || name.includes('soleus') || name.includes('tibialis') || name.includes('achilles') || name.includes('foot') || name.includes('metatarsal')) {
            this.regionMeshes.leg.push(child);
          }

          // Kinesiology animation references
          if (name.includes('radius') || name.includes('ulna')) {
            this.forearmBones.push(child);
          }
          if (name.includes('biceps')) {
            this.bicepsBellies.push(child);
          }
          if (name.includes('triceps')) {
            this.tricepsBellies.push(child);
          }

          this.allMeshes.push(child);
        }
      });

      this.dioramaGroup.add(this.model);

      // Build Floating 3D Collectible Pins across all regions
      this.buildFullBodyPins();

      // Apply initial UI layer
      this.setPeelLayer(this.currentPeelLayer);
      this.focusRegion(this.activeRegion);

      toast('✦ Loaded Full-Body Z-Anatomy Atlas (960 Meshes)');
    }, undefined, (err) => {
      console.warn('Error loading full_body.glb, loading fallback shoulder model:', err);
      // Graceful fallback to shoulder_and_arm.glb if needed
      loader.load('/assets/shoulder_and_arm.glb', (fallbackGltf) => {
        this.model = fallbackGltf.scene;
        this.model.scale.setScalar(2.35);
        this.model.position.set(0.35, -0.45, 0);
        this.dioramaGroup.add(this.model);
        toast('Loaded Shoulder & Arm Dataset');
      });
    });
  }

  buildFullBodyPins() {
    this.pinsGroup = new THREE.Group();

    const pinConfigs = [
      { key: 'shoulder', label: 'Deltoid & Rotator Cuff', pos: new THREE.Vector3(-0.24, 1.34, 0.05) },
      { key: 'forearm', label: 'Biceps & Forearm', pos: new THREE.Vector3(-0.28, 1.02, 0.08) },
      { key: 'chest', label: 'Pectoralis Major', pos: new THREE.Vector3(0.08, 1.28, 0.12) },
      { key: 'core', label: 'Rectus Abdominis', pos: new THREE.Vector3(0.0, 0.96, 0.12) },
      { key: 'pelvis', label: 'Pelvis & Gluteals', pos: new THREE.Vector3(0.12, 0.74, 0.08) },
      { key: 'thigh', label: 'Quadriceps Femoris', pos: new THREE.Vector3(0.12, 0.38, 0.10) },
      { key: 'leg', label: 'Gastrocnemius & Tibia', pos: new THREE.Vector3(0.12, -0.12, 0.08) }
    ];

    pinConfigs.forEach((cfg, idx) => {
      const pinObj = new THREE.Group();
      pinObj.position.copy(cfg.pos);
      pinObj.userData = { key: cfg.key, basePos: cfg.pos.clone(), index: idx };

      // Pearl Head
      const headGeom = new THREE.SphereGeometry(0.026, 16, 12);
      const headMat = new THREE.MeshBasicMaterial({ color: 0x5ECDBB });
      const head = new THREE.Mesh(headGeom, headMat);
      pinObj.add(head);

      // Stem
      const stemGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.038, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.position.y = -0.022;
      pinObj.add(stem);

      // Glowing Pulsing Aura Ring
      const ringGeom = new THREE.RingGeometry(0.024, 0.044, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x98EADF,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.040;
      pinObj.add(ring);

      pinObj.head = head;
      pinObj.ring = ring;

      this.pins.push(pinObj);
      this.pinsGroup.add(pinObj);
    });

    this.dioramaGroup.add(this.pinsGroup);
  }

  // Camera Smooth Focus / Zoom Tween
  focusRegion(regionKey) {
    this.activeRegion = regionKey;
    const preset = this.cameraPresets[regionKey] || this.cameraPresets.fullbody;
    this.targetCamPos.copy(preset.camPos);
    this.targetLookAt.copy(preset.target);

    // Update 3D Pins visual state
    this.pins.forEach(pin => {
      const isActive = pin.userData.key === regionKey;
      pin.head.material.color.setHex(isActive ? 0xFCD45A : 0x5ECDBB);
      pin.ring.material.color.setHex(isActive ? 0xFFF2A8 : 0x98EADF);
    });

    if (this.isIsolated) {
      this.applyIsolationVisuals();
    }
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

        // 1. Check Pin clicks
        const pinHeads = this.pins.map(p => p.head);
        const pinIntersects = this.raycaster.intersectObjects(pinHeads);
        if (pinIntersects.length > 0) {
          const clickedHead = pinIntersects[0].object;
          const parentPin = this.pins.find(p => p.head === clickedHead);
          if (parentPin && parentPin.userData && parentPin.userData.key) {
            selectRegion(parentPin.userData.key);
            return;
          }
        }

        // 2. Direct Muscle Mesh Click Detection across 960 Anatomical Meshes
        if (this.allMeshes.length > 0) {
          const meshIntersects = this.raycaster.intersectObjects(this.allMeshes);
          if (meshIntersects.length > 0) {
            const hitMesh = meshIntersects[0].object;
            const hitName = hitMesh.name.toLowerCase();

            let targetChunk = 'fullbody';
            if (hitName.includes('biceps') || hitName.includes('triceps') || hitName.includes('radius') || hitName.includes('ulna') || hitName.includes('forearm')) {
              targetChunk = 'forearm';
            } else if (hitName.includes('deltoid') || hitName.includes('clavicle') || hitName.includes('scapula') || hitName.includes('rotator')) {
              targetChunk = 'shoulder';
            } else if (hitName.includes('pectoralis') || hitName.includes('sternum') || hitName.includes('rib') || hitName.includes('chest')) {
              targetChunk = 'chest';
            } else if (hitName.includes('rectus abdominis') || hitName.includes('oblique') || hitName.includes('lumbar')) {
              targetChunk = 'core';
            } else if (hitName.includes('pelvis') || hitName.includes('ilium') || hitName.includes('gluteus')) {
              targetChunk = 'pelvis';
            } else if (hitName.includes('femur') || hitName.includes('quadriceps') || hitName.includes('patella')) {
              targetChunk = 'thigh';
            } else if (hitName.includes('tibia') || hitName.includes('gastrocnemius') || hitName.includes('foot')) {
              targetChunk = 'leg';
            }

            selectRegion(targetChunk);
            toast(`✦ Selected: ${hitMesh.name.replace(/_/g, ' ').replace(/\.r/g, ' (R)').replace(/\.l/g, ' (L)')}`);
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

  setPeelLayer(layerNum) {
    this.currentPeelLayer = layerNum;

    // Globally filter all 960 meshes by layer
    this.allMeshes.forEach(mesh => {
      const meshLayer = mesh.userData.layer !== undefined ? mesh.userData.layer : 2;
      mesh.visible = (meshLayer <= layerNum);
    });
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
    const activeMeshes = (activeKey === 'fullbody') ? this.allMeshes : (this.regionMeshes[activeKey] || []);

    this.allMeshes.forEach(mesh => {
      const isTarget = activeMeshes.includes(mesh);
      if (mesh.material && mesh.material.uniforms) {
        if (isIso) {
          mesh.material.uniforms.uOpacity.value = isTarget ? 1.0 : 0.12;
          mesh.material.uniforms.uFresnelIntensity.value = isTarget ? 1.85 : 0.35;
        } else {
          mesh.material.uniforms.uOpacity.value = 1.0;
          mesh.material.uniforms.uFresnelIntensity.value = 1.1;
        }
      }
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smooth Camera Focus Transition (Tweening)
    this.currentCamPos.lerp(this.targetCamPos, 0.08);
    this.currentLookAt.lerp(this.targetLookAt, 0.08);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

    // 2. Smooth Spring Turntable Orbit
    this.dioramaGroup.rotation.y += (this.targetRotY - this.dioramaGroup.rotation.y) * 0.12;
    this.dioramaGroup.rotation.x += (this.targetRotX - this.dioramaGroup.rotation.x) * 0.12;

    // 3. Floating 3D Collectible Pins Animation (Sine-wave bobbing + ring pulse)
    this.pins.forEach(pin => {
      const idx = pin.userData.index;
      pin.position.y = pin.userData.basePos.y + Math.sin(elapsedTime * 2.8 + idx * 0.9) * 0.015;
      const ringScale = 1.0 + Math.sin(elapsedTime * 3.5 + idx) * 0.12;
      pin.ring.scale.set(ringScale, ringScale, 1.0);
    });

    // 4. Kinesiology Action Kinematics on Real Meshes
    if (this.isKinesiologyPlaying) {
      this.actionPhase += dt * 3.2;
      const flexionCycle = (Math.sin(this.actionPhase) * 0.5 + 0.5);

      this.bicepsBellies.forEach(belly => {
        belly.scale.set(1.0 + flexionCycle * 0.28, 1.0 - flexionCycle * 0.16, 1.0 + flexionCycle * 0.28);
      });

      this.tricepsBellies.forEach(belly => {
        belly.scale.set(1.0 - flexionCycle * 0.10, 1.0 + flexionCycle * 0.14, 1.0 - flexionCycle * 0.10);
      });

      this.forearmBones.forEach(bone => {
        bone.rotation.x = flexionCycle * 0.35;
      });
    } else {
      this.bicepsBellies.forEach(belly => {
        belly.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
      });
      this.tricepsBellies.forEach(belly => {
        belly.scale.lerp(new THREE.Vector3(1, 1, 1), 0.12);
      });
      this.forearmBones.forEach(bone => {
        bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, 0, 0.12);
      });
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
