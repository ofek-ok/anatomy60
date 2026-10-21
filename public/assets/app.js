// AnatoMe Mobile Engine — Mobile-Only Architecture
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

  // Scroll to top of app screen
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

  $('#region-title').textContent = regionNames[key];
  $('#region-latin').textContent = muscles[0] ? muscles[0].latin : "Systema Musculoskeletale";

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

  $('#region-content').innerHTML = contentHTML;
  $$('.mobile-pin').forEach(p => p.classList.toggle('selected', p.dataset.region === key));

  // Expand bottom sheet if collapsed
  const sheet = $('#bottom-sheet');
  if (sheet) {
    sheet.style.display = 'block';
    sheet.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}

$$('.mobile-pin').forEach(b => b.onclick = () => selectRegion(b.dataset.region));

// Anterior / Posterior View Switch
$$('.pill-btn').forEach(b => b.onclick = () => {
  playCozySound('pop');
  const back = b.dataset.viewbody === 'back';
  $$('.pill-btn').forEach(x => x.classList.toggle('selected', x === b));
  $('.body-figure').classList.toggle('back', back);
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

    const figure = $('#figure-wrap');
    figure.classList.remove('layer-skeleton-only', 'layer-deep-only', 'layer-superficial-only');

    if (layer === 0) {
      figure.classList.add('layer-skeleton-only');
      toast('Layer 0: Skeleton Only (206 Bones)');
    } else if (layer === 1) {
      figure.classList.add('layer-deep-only');
      toast('Layer 1: Deep Muscles & Stabilizers');
    } else if (layer === 2) {
      figure.classList.add('layer-superficial-only');
      toast('Layer 2: Superficial Movers');
    } else {
      toast('Layer 3: Skin & Silhouette Outline');
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

    const figure = $('.human-svg');
    if (isPlayingAction) {
      figure.style.transform = 'scale(1.04)';
      figure.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      toast('✦ Action State: Muscle shortening & force loop');
    } else {
      figure.style.transform = 'scale(1)';
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

    const bones = $$('.human-svg .bone, .human-svg .bone-line');
    const muscles = $$('.human-svg .muscle');
    if (isIsolated) {
      muscles.forEach(m => m.style.opacity = '0.15');
      bones.forEach(b => b.style.opacity = '0.35');
      toast('⊞ Isolation Mode: Active structure only');
    } else {
      muscles.forEach(m => m.style.opacity = '');
      bones.forEach(b => b.style.opacity = '');
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

// Initialize
renderStats();
