// AnatoMe Interactive Engine — Pure English Medical Edition
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

// Audio Synthesizer (Cozy Marimba / Tactile Pop SFX via Web Audio API)
let audioCtx = null;
function playCozySound(type = 'pop') {
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
    // Fail silently if audio context not permitted
  }
}

// Persistent State
const state = JSON.parse(localStorage.getItem('anatome-progress-v2') || '{"days":0,"xp":0,"streak":0,"lastDate":"","lessonProgress":0,"completed":[]}');
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let view = 'home';
let currentRegion = '';
let currentLayer = 3;
let isIsolated = false;
let isPlayingAction = false;

function save() {
  localStorage.setItem('anatome-progress-v2', JSON.stringify(state));
  renderStats();
}

function renderStats() {
  const day = Math.min(state.days + 1, 60);
  ['#side-day', '#day-badge-num'].forEach(s => {
    if ($(s)) $(s).textContent = s.includes('badge') ? String(day).padStart(2, '0') : day;
  });
  ['#side-xp', '#top-xp', '#profile-xp'].forEach(s => {
    if ($(s)) $(s).textContent = state.xp;
  });
  ['#streak-count', '#profile-streak'].forEach(s => {
    if ($(s)) $(s).textContent = state.streak;
  });
  ['#days-count', '#journey-days', '#profile-days'].forEach(s => {
    if ($(s)) $(s).textContent = state.days;
  });
  $('#mastered-count').textContent = state.completed.length;
  $('#lesson-day-label').textContent = `Day ${day} of 60`;

  const pct = state.lessonProgress;
  $('#lesson-progress-fill').style.width = pct + '%';
  $('#lesson-progress-text').textContent = `${pct}% complete`;
  $('#journey-progress-fill').style.width = (state.days / 60 * 100) + '%';
  $('#journey-percent').textContent = Math.round(state.days / 60 * 100) + '%';

  const titleIdx = Math.min(state.days, titles.length - 1);
  $('#lesson-title').textContent = titles[titleIdx];
  $('#lesson-subtitle').textContent = descriptions[titleIdx];

  renderWeek();
  renderJourney();
}

function renderWeek() {
  const el = $('#week-strip');
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  el.innerHTML = days.map((d, i) => {
    const isToday = i === new Date().getDay() - 1;
    const isDone = i < state.streak;
    return `
      <div class="week-day ${isToday ? 'today' : ''} ${isDone ? 'done' : ''}">
        <span>${d}</span>
        <b>${isDone ? '✓' : i + 1}</b>
        <small>${isToday ? 'TODAY' : 'DAY'}</small>
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
      <article class="journey-unit ${current ? 'current' : ''}">
        <div class="unit-number">${done ? '✓' : String(i + 1).padStart(2, '0')}</div>
        <div class="unit-copy">
          <h3>${u[0]}</h3>
          <p>${u[1]}</p>
        </div>
        <span class="unit-status">${done ? 'COMPLETE' : current ? 'IN PROGRESS' : `DAYS ${n}–${n + 5}`}</span>
        <button class="unit-action" data-unit="${i}">${current ? 'OPEN' : done ? 'REVIEW' : 'VIEW'}</button>
      </article>`;
  }).join('');

  list.querySelectorAll('[data-unit]').forEach(b => b.onclick = () => {
    playCozySound('pop');
    if (+b.dataset.unit === 0 || +b.dataset.unit <= Math.floor(state.days / 6)) {
      go('home');
      $('#continue-button').focus();
    } else {
      toast('Complete your current unit to unlock the next one.');
    }
  });
}

function go(next) {
  playCozySound('pop');
  view = next;
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== `view-${next}`));
  $$('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === next));
  if (next === 'explore') {
    $('#region-title').textContent = currentRegion ? regionNames[currentRegion] : 'Select an Organ';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toast(t) {
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

$$('.nav-link').forEach(b => b.onclick = () => go(b.dataset.view));
$$('[data-goto]').forEach(b => b.onclick = () => go(b.dataset.goto));

$('#continue-button').onclick = () => {
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
      toast('✦ Lesson complete! Fantastic work, +25 XP!');
    } else {
      toast(`Lesson progress: ${state.lessonProgress}%`);
    }
    save();
  }
};

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
  $('#region-description').textContent = `Clinical region containing ${muscles.length} primary muscles and their articulated skeletal attachments.`;

  let contentHTML = '';
  muscles.forEach(m => {
    contentHTML += `
      <div class="detail-group">
        <h3 style="display:flex; justify-content:space-between; align-items:center;">
          <span>${m.english.toUpperCase()}</span>
          <span style="font-size:9px; background:#F0ECE6; padding:2px 8px; border-radius:10px; color:#5B7BA6;">Layer ${m.layer} (${m.layer === 1 ? 'Deep' : 'Superficial'})</span>
        </h3>
        <p style="font-family:'Lora',serif; font-style:italic; font-size:12px; color:#5B7BA6; margin:0 0 6px;">${m.latin}</p>
        <div class="anchor-chip origin">● Origin: ${m.origin}</div>
        <div class="anchor-chip insertion">● Insertion: ${m.insertion}</div>
        <div style="margin-top:6px;">
          ${m.actions.map(a => `<span class="structure-chip">${a}</span>`).join('')}
        </div>
        <p style="font-size:11px; color:#7E8494; margin:6px 0 0;"><strong>Innervation:</strong> ${m.innervation}</p>
      </div>
      <hr style="border:0; border-top:1px dashed #EBE6DF; margin:14px 0;">
    `;
  });

  $('#region-content').innerHTML = contentHTML;
  $$('.region-point').forEach(p => p.classList.toggle('selected', p.dataset.region === key));
}

$$('.region-point').forEach(b => b.onclick = () => selectRegion(b.dataset.region));

// Anterior / Posterior View Switch
$$('.body-tab').forEach(b => b.onclick = () => {
  playCozySound('pop');
  const back = b.dataset.viewbody === 'back';
  $$('.body-tab').forEach(x => x.classList.toggle('selected', x === b));
  $('.body-figure').classList.toggle('back', back);
  $('#figure-caption').textContent = back ? 'POSTERIOR VIEW' : 'ANTERIOR VIEW';
  toast(back ? 'Posterior view active' : 'Anterior view active');
});

// Chunky Layer Peeling Slider Controller
$$('.peel-step').forEach(btn => {
  btn.onclick = () => {
    playCozySound('pop');
    const layer = +btn.dataset.layer;
    currentLayer = layer;
    $$('.peel-step').forEach(b => b.classList.toggle('selected', +b.dataset.layer === layer));

    const figure = $('#figure-wrap');
    figure.classList.remove('layer-skeleton-only', 'layer-deep-only', 'layer-superficial-only');

    if (layer === 0) {
      figure.classList.add('layer-skeleton-only');
      toast('Layer 0: Complete Skeleton (206 Bones)');
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

// Kinesiology Action Play Button
$('#action-play-btn').onclick = () => {
  if (!currentRegion) {
    toast('Please select an anatomical region first.');
    return;
  }
  isPlayingAction = !isPlayingAction;
  playCozySound(isPlayingAction ? 'chime' : 'pop');
  $('#action-play-btn').classList.toggle('active', isPlayingAction);

  const figure = $('.human-svg');
  if (isPlayingAction) {
    figure.style.transform = 'scale(1.04)';
    figure.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    toast('✦ Kinesiology Action: Muscle shortening & mechanical force loop');
  } else {
    figure.style.transform = 'scale(1)';
    toast('Action loop paused');
  }
};

// Isolation Mode Button
$('#action-isolate-btn').onclick = () => {
  if (!currentRegion) {
    toast('Please select an anatomical region first.');
    return;
  }
  isIsolated = !isIsolated;
  playCozySound('pop');
  $('#action-isolate-btn').classList.toggle('active', isIsolated);

  const bones = $$('.human-svg .bone, .human-svg .bone-line');
  const muscles = $$('.human-svg .muscle');
  if (isIsolated) {
    muscles.forEach(m => m.style.opacity = '0.15');
    bones.forEach(b => b.style.opacity = '0.35');
    toast('⊞ Isolation Mode: Solitary focus on active structures');
  } else {
    muscles.forEach(m => m.style.opacity = '');
    bones.forEach(b => b.style.opacity = '');
    toast('Isolation exited');
  }
};

// Reset Progress
$('#reset-progress').onclick = () => {
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

$('#mobile-menu').onclick = () => {
  playCozySound('pop');
  $('.sidebar').classList.toggle('open');
};

// Initialize
renderStats();
