// AnatoMe Interactive Engine
const titles = [
  "Anatomical Language & Planes", "The Skeletal Framework", "Joints & Kinesiology",
  "Muscle Foundations & Fiber Types", "The Shoulder Complex", "The Arm & Forearm",
  "The Hand & Precision Grip", "The Vertebral Column", "The Core Stabilizers",
  "The Pelvis & Hip Joint", "The Thigh & Femoral Mechanics", "The Knee & Ligamentous Stability",
  "The Lower Leg & Kinetic Chains", "The Foot & Longitudinal Arches", "Review & Clinical Integration"
];

const titlesHe = [
  "שפה אנטומית ומישורי תנועה", "מערכת השלד והעצמות", "מפרקים וקינזיולוגיה",
  "יסודות השריר וסוגי סיבים", "מכלול חגורת הכתף", "הזרוע והאמה",
  "כף היד ושורש כף היד", "עמוד השדרה והיציבה", "שרירי הליבה ומייצבי הגו",
  "אגן הירכיים ומפרק הירך", "הירך ומכניקת התנועה", "הברך ומערך הרצועות",
  "השוק והשרשרת הקינטית", "כף הרגל וקשתות הדריכה", "חזרה ואינטגרציה קלינית"
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
    // Audio context not allowed or not supported; fail gracefully
  }
}

// Persistent State
const state = JSON.parse(localStorage.getItem('anatome-progress') || '{"days":0,"xp":0,"streak":0,"lastDate":"","lessonProgress":0,"lang":"en","completed":[]}');
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let view = 'home';
let currentRegion = '';
let currentLayer = 3;
let isIsolated = false;
let isPlayingAction = false;

function save() {
  localStorage.setItem('anatome-progress', JSON.stringify(state));
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
  $('#lesson-title').textContent = (state.lang === 'he' ? titlesHe : titles)[titleIdx];
  $('#lesson-subtitle').textContent = descriptions[titleIdx];

  renderWeek();
  renderJourney();
}

function renderWeek() {
  const el = $('#week-strip');
  const days = state.lang === 'he' ? ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'] : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  el.innerHTML = days.map((d, i) => {
    const isToday = i === new Date().getDay() - 1;
    const isDone = i < state.streak;
    return `
      <div class="week-day ${isToday ? 'today' : ''} ${isDone ? 'done' : ''}">
        <span>${d}</span>
        <b>${isDone ? '✓' : i + 1}</b>
        <small>${isToday ? (state.lang === 'he' ? 'היום' : 'TODAY') : (state.lang === 'he' ? 'יום' : 'DAY')}</small>
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
          <h3>${state.lang === 'he' ? titlesHe[Math.min(i, titlesHe.length - 1)] : u[0]}</h3>
          <p>${state.lang === 'he' ? `ימים ${n}–${n + 5} · ` : ''}${u[1]}</p>
        </div>
        <span class="unit-status">${done ? (state.lang === 'he' ? 'הושלם' : 'COMPLETE') : current ? (state.lang === 'he' ? 'כעת' : 'IN PROGRESS') : (state.lang === 'he' ? `ימים ${n}–${n + 5}` : `DAYS ${n}–${n + 5}`)}</span>
        <button class="unit-action" data-unit="${i}">${current ? (state.lang === 'he' ? 'המשך' : 'OPEN') : (done ? (state.lang === 'he' ? 'חזרה' : 'REVIEW') : 'VIEW')}</button>
      </article>`;
  }).join('');

  list.querySelectorAll('[data-unit]').forEach(b => b.onclick = () => {
    playCozySound('pop');
    if (+b.dataset.unit === 0 || +b.dataset.unit <= Math.floor(state.days / 6)) {
      go('home');
      $('#continue-button').focus();
    } else {
      toast(state.lang === 'he' ? 'השלימו את השלב הנוכחי כדי לפתוח את הבא.' : 'Complete your current unit to unlock the next one.');
    }
  });
}

function go(next) {
  playCozySound('pop');
  view = next;
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== `view-${next}`));
  $$('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === next));
  if (next === 'explore') {
    $('#region-title').textContent = currentRegion ? regionNames[currentRegion][state.lang] : (state.lang === 'he' ? 'בחרו מבנה אנטומי' : 'Select an Organ');
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
      toast(state.lang === 'he' ? '✦ שיעור הושלם! כל הכבוד, צברת 25 XP!' : '✦ Lesson complete! Fantastic work, +25 XP!');
    } else {
      toast(state.lang === 'he' ? `התקדמות בשיעור: ${state.lessonProgress}%` : `Lesson progress: ${state.lessonProgress}%`);
    }
    save();
  }
};

$('#top-lang').onclick = () => setLang(state.lang === 'en' ? 'he' : 'en');
$$('.lang-choice').forEach(b => b.onclick = () => setLang(b.dataset.lang));

function setLang(lang) {
  playCozySound('pop');
  state.lang = lang;
  $$('.region-point').forEach(p => p.setAttribute('aria-label', regionNames[p.dataset.region][lang]));
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  $$('[data-en]').forEach(el => el.textContent = el.dataset[lang]);
  $$('.lang-choice').forEach(el => el.classList.toggle('selected', el.dataset.lang === lang));
  $('#top-lang').textContent = lang === 'en' ? '🇮🇱 עב' : '🇺🇸 EN';
  renderStats();
  if (currentRegion) selectRegion(currentRegion);
  save();
}

// Complete Medical Data Structures
const regionData = {
  shoulders: {
    latin: "Musculi cinguli pectoralis (Deltoideus & Rotator Cuff)",
    enName: "Shoulder Girdle & Rotator Cuff",
    heName: "חגורת הכתף ושרירי השרוול המסובב",
    structures: ["Deltoid", "Supraspinatus", "Infraspinatus", "Teres Minor", "Subscapularis"],
    origins: [
      { bone: "Clavicle (lateral 1/3), Acromion, Scapular Spine", landmark: "Deltoid origin", type: "origin" },
      { bone: "Supraspinous fossa of scapula", landmark: "Supraspinatus origin", type: "origin" }
    ],
    insertions: [
      { bone: "Humerus (Deltoid Tuberosity)", landmark: "Deltoid insertion", type: "insertion" },
      { bone: "Greater tubercle of humerus", landmark: "Rotator cuff insertion", type: "insertion" }
    ],
    actions: ["Abduction (0°-15° Supraspinatus, 15°-90° Deltoid)", "External & Internal Rotation", "Glenohumeral dynamic stabilization"],
    actionsHe: ["הרחקה (0°-15° סופראספינטוס, 15°-90° דלטואיד)", "סיבוב חיצוני ופנימי של הזרוע", "ייצוב דינמי של ראש עצם הזרוע במפרק"],
    innervation: "Axillary nerve (C5, C6) & Suprascapular nerve (C5, C6)",
    kinesiologyNote: "The rotator cuff pulls the humeral head inferomedially into the glenoid cavity to prevent superior impingement during abduction.",
    kinesiologyNoteHe: "שרירי השרוול המסובב מהדקים את ראש הזרוע למשטח המפרקי למניעת צביטה בזמן הרמת היד."
  },
  chest: {
    latin: "Musculus pectoralis major et minor",
    enName: "Pectoral Region & Thoracic Wall",
    heName: "אזור החזה ושרירי בית החזה",
    structures: ["Pectoralis Major", "Pectoralis Minor", "Subclavius", "Serratus Anterior"],
    origins: [
      { bone: "Clavicle (medial half) & Sternum / Ribs 1-6", landmark: "Clavicular & sternocostal heads", type: "origin" }
    ],
    insertions: [
      { bone: "Humerus (Lateral lip of bicipital groove)", landmark: "Crest of greater tubercle", type: "insertion" }
    ],
    actions: ["Adduction & Medial Rotation of humerus", "Horizontal adduction (pushing mechanics)", "Deep inspiration accessory"],
    actionsHe: ["קירוב וסיבוב פנימי של הזרוע", "דחיפה לפנים", "שריר עזר לשאיפה עמוקה"],
    innervation: "Lateral & Medial pectoral nerves (C5-T1)",
    kinesiologyNote: "Serratus anterior pairs with the trapezius for upward rotation of the scapula, preventing scapular winging.",
    kinesiologyNoteHe: "הסראטוס אנטריור פועל בסינרגיה עם הטרפז לשמירה על הצמדת השכמה לצלעות."
  },
  arms: {
    latin: "Musculi brachii & antebrachii",
    enName: "Arm & Forearm Kinetic Chain",
    heName: "הזרוע והאמה",
    structures: ["Biceps Brachii", "Brachialis", "Triceps Brachii", "Brachioradialis"],
    origins: [
      { bone: "Scapula (Supraglenoid & Coracoid process)", landmark: "Long & short heads of Biceps", type: "origin" },
      { bone: "Scapula & Posterior Humerus", landmark: "Triceps 3 heads", type: "origin" }
    ],
    insertions: [
      { bone: "Radius (Radial tuberosity)", landmark: "Biceps insertion & bicipital aponeurosis", type: "insertion" },
      { bone: "Ulna (Olecranon process)", landmark: "Triceps insertion", type: "insertion" }
    ],
    actions: ["Elbow Flexion & Extension", "Forearm Supination (Biceps)", "Shoulder Flexion stabilization"],
    actionsHe: ["כיפוף ויישור המרפק", "סופינציה (סיבוב האמה כלפי מעלה)", "ייצוב קדמי של הכתף"],
    innervation: "Musculocutaneous nerve (C5-C7) & Radial nerve (C5-T1)",
    kinesiologyNote: "Biceps is the most powerful supinator of the flexed forearm, utilizing the radial tuberosity as a high-torque pulley.",
    kinesiologyNoteHe: "הבייספס הוא הסופינטור החזק ביותר של האמה כאשר המרפק כפוף."
  },
  core: {
    latin: "Musculi abdominis & stabilisatores trunci",
    enName: "Abdominal Core & Lumbar Stabilizers",
    heName: "שרירי הליבה ומייצבי הגו",
    structures: ["Rectus Abdominis", "External Oblique", "Internal Oblique", "Transversus Abdominis", "Multifidus"],
    origins: [
      { bone: "Pubic crest & symphysis", landmark: "Pubic crest attachment", type: "origin" },
      { bone: "Iliac crest & Thoracolumbar fascia", landmark: "Deep transverse belt", type: "origin" }
    ],
    insertions: [
      { bone: "Xiphoid process & Costal cartilages 5-7", landmark: "Sternal ribs", type: "insertion" },
      { bone: "Linea alba & Pubic pecten", landmark: "Anterior aponeurosis", type: "insertion" }
    ],
    actions: ["Trunk Flexion & Lateral rotation", "Intra-abdominal pressure modulation", "Lumbar spine shear protection"],
    actionsHe: ["כיפוף הגו ורוטציה", "ויסות לחץ תוך-בטני לייצוב הגב", "הגנה על חוליות מותניות"],
    innervation: "Thoracoabdominal nerves (T7-T11) & Subcostal nerve (T12)",
    kinesiologyNote: "Transversus abdominis acts like an anatomical corset, pre-activating 30ms before limb movements to protect the spine.",
    kinesiologyNoteHe: "הטרנסברסוס פועל כמחוך טבעי המתכווץ לפני תנועות גפיים לייצוב עמוד השדרה."
  },
  legs: {
    latin: "Musculi femoris & cruris",
    enName: "Thigh & Lower Leg Complex",
    heName: "הירך, השוק ושרשרת הדריכה",
    structures: ["Quadriceps Femoris", "Hamstrings group", "Gastrocnemius", "Soleus", "Tibialis Anterior"],
    origins: [
      { bone: "Anterior Inferior Iliac Spine (AIIS) & Femoral shaft", landmark: "Rectus femoris & vasti", type: "origin" },
      { bone: "Ischial tuberosity", landmark: "Hamstrings origin (sit bone)", type: "origin" }
    ],
    insertions: [
      { bone: "Tibia (Tibial Tuberosity via Patellar tendon)", landmark: "Quadriceps insertion", type: "insertion" },
      { bone: "Calcaneus via Achilles tendon", landmark: "Triceps surae insertion", type: "insertion" }
    ],
    actions: ["Knee Extension & Flexion", "Hip Flexion & Extension", "Plantarflexion (Achilles) & Dorsiflexion (Tibialis)"],
    actionsHe: ["יישור וכיפוף הברך", "יישור וכיפוף הירך", "פשיטה דורסלית ופלאנטרית של כף הרגל"],
    innervation: "Femoral nerve (L2-L4), Sciatic nerve (L4-S3) & Tibial nerve",
    kinesiologyNote: "The patella increases the mechanical leverage (moment arm) of the quadriceps muscle by up to 30%.",
    kinesiologyNoteHe: "פיקת הברך מרחיקה את גיד הארבע-ראשי מציר התנועה ומגדילה את מומנט הכוח ב-30%."
  }
};

const regionNames = {
  shoulders: { en: "Shoulder Girdle & Rotator Cuff", he: "חגורת הכתף והשרוול המסובב" },
  chest: { en: "Chest & Anterior Thorax", he: "אזור החזה ושרירי הנשימה" },
  arms: { en: "Arm & Forearm Chain", he: "הזרוע והאמה" },
  core: { en: "Abdominal & Lumbar Core", he: "שרירי הליבה ועמוד השדרה" },
  legs: { en: "Thigh, Knee & Calves", he: "ירכיים, ברכיים ושוקיים" }
};

function selectRegion(key) {
  playCozySound('pop');
  currentRegion = key;
  const data = regionData[key];
  const isHe = state.lang === 'he';

  $('#region-title').textContent = regionNames[key][state.lang];
  $('#region-latin').textContent = data.latin;
  $('#region-description').textContent = isHe ? data.kinesiologyNoteHe : data.kinesiologyNote;

  $('#region-content').innerHTML = `
    <div class="detail-group">
      <h3>${isHe ? 'מבנים עיקריים' : 'KEY MUSCLES & STRUCTURES'}</h3>
      ${data.structures.map(n => `<span class="structure-chip">${n}</span>`).join('')}
    </div>
    <div class="detail-group">
      <h3>${isHe ? 'נקודות מוצא (ORIGIN) — פין מנטה' : 'ORIGIN ANCHORS (TURQUOISE MINT PEGS)'}</h3>
      ${data.origins.map(o => `<div class="anchor-chip origin">● ${o.bone} (${o.landmark})</div>`).join('')}
    </div>
    <div class="detail-group">
      <h3>${isHe ? 'נקודות אחיזה (INSERTION) — פין צהוב' : 'INSERTION ANCHORS (BUTTER YELLOW PEGS)'}</h3>
      ${data.insertions.map(i => `<div class="anchor-chip insertion">● ${i.bone} (${i.landmark})</div>`).join('')}
    </div>
    <div class="detail-group">
      <h3>${isHe ? 'פעולות קינזיולוגיות' : 'KINESIOLOGICAL ACTIONS'}</h3>
      ${(isHe ? data.actionsHe : data.actions).map(a => `<div class="structure-chip">${a}</div>`).join('')}
    </div>
    <div class="detail-group">
      <h3>${isHe ? 'עצבוב קליני' : 'CLINICAL INNERVATION'}</h3>
      <p class="region-description">${data.innervation}</p>
    </div>
  `;

  $$('.region-point').forEach(p => p.classList.toggle('selected', p.dataset.region === key));
}

$$('.region-point').forEach(b => b.onclick = () => selectRegion(b.dataset.region));

// Anterior / Posterior View Switch
$$('.body-tab').forEach(b => b.onclick = () => {
  playCozySound('pop');
  const back = b.dataset.viewbody === 'back';
  $$('.body-tab').forEach(x => x.classList.toggle('selected', x === b));
  $('.body-figure').classList.toggle('back', back);
  $('#figure-caption').textContent = back ? (state.lang === 'he' ? 'מבט אחורי' : 'POSTERIOR VIEW') : (state.lang === 'he' ? 'מבט קדמי' : 'ANTERIOR VIEW');
  toast(back ? (state.lang === 'he' ? 'מבט אחורי' : 'Posterior view active') : (state.lang === 'he' ? 'מבט קדמי' : 'Anterior view active'));
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
      toast(state.lang === 'he' ? 'שכבה 0: שלד מלא ועצמות' : 'Layer 0: Complete Skeleton & Bones');
    } else if (layer === 1) {
      figure.classList.add('layer-deep-only');
      toast(state.lang === 'he' ? 'שכבה 1: שרירים עמוקים ומייצבים' : 'Layer 1: Deep Stabilizing Muscles');
    } else if (layer === 2) {
      figure.classList.add('layer-superficial-only');
      toast(state.lang === 'he' ? 'שכבה 2: שרירים שטחיים ותנועתיים' : 'Layer 2: Superficial Movers');
    } else {
      toast(state.lang === 'he' ? 'שכבה 3: שכבת מעטפת הגוף' : 'Layer 3: Skin & Silhouette Outline');
    }
  };
});

// Kinesiology Action Play Button
$('#action-play-btn').onclick = () => {
  if (!currentRegion) {
    toast(state.lang === 'he' ? 'אנא בחרו איבר או שריר קודם.' : 'Please select an anatomical region first.');
    return;
  }
  isPlayingAction = !isPlayingAction;
  playCozySound(isPlayingAction ? 'chime' : 'pop');
  $('#action-play-btn').classList.toggle('active', isPlayingAction);

  const figure = $('.human-svg');
  if (isPlayingAction) {
    figure.style.transform = 'scale(1.04)';
    figure.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    toast(state.lang === 'he' ? '✦ מפעיל תנועה קינזיולוגית: כיווץ שריר ומסלול כוח' : '✦ Kinesiology Action: Muscle shortening & force vector');
  } else {
    figure.style.transform = 'scale(1)';
    toast(state.lang === 'he' ? 'תנועה הסתיימה' : 'Action loop paused');
  }
};

// Isolation Mode Button
$('#action-isolate-btn').onclick = () => {
  if (!currentRegion) {
    toast(state.lang === 'he' ? 'אנא בחרו איבר או שריר קודם.' : 'Please select an anatomical region first.');
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
    toast(state.lang === 'he' ? '⊞ מצב בידוד: רק המבנה והעצמות הרלוונטיות מוצגים' : '⊞ Isolation Mode: Solitary focus on active structures');
  } else {
    muscles.forEach(m => m.style.opacity = '');
    bones.forEach(b => b.style.opacity = '');
    toast(state.lang === 'he' ? 'מצב בידוד בוטל' : 'Isolation exited');
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
  toast(state.lang === 'he' ? 'ההתקדמות המקומית אופסה.' : 'Local progress reset.');
};

$('#mobile-menu').onclick = () => {
  playCozySound('pop');
  $('.sidebar').classList.toggle('open');
};

// Initialize
renderStats();
setLang(state.lang);
