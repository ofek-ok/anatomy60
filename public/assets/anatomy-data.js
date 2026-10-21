/**
 * AnatoMe — Comprehensive Musculoskeletal Registry
 * Complete Medical Reference: 206 Bones & Major Skeletal Muscles
 */

const ANATOMY_REGISTRY = {
  // =========================================================================
  // 1. OSTEOLOGY (THE 206 BONES OF THE HUMAN SKELETON)
  // =========================================================================
  skeleton: {
    totalBones: 206,
    axial: {
      count: 80,
      cranium: [
        { name: "Frontal bone", latin: "Os frontale", count: 1, type: "Flat", landmarks: ["Supraorbital margin", "Glabella"] },
        { name: "Parietal bones", latin: "Ossa parietalia", count: 2, type: "Flat", landmarks: ["Sagittal suture", "Superior temporal line"] },
        { name: "Temporal bones", latin: "Ossa temporalia", count: 2, type: "Irregular", landmarks: ["Mastoid process", "Styloid process", "Zygomatic process"] },
        { name: "Occipital bone", latin: "Os occipitale", count: 1, type: "Flat", landmarks: ["Foramen magnum", "External occipital protuberance", "Occipital condyles"] },
        { name: "Sphenoid bone", latin: "Os sphenoidale", count: 1, type: "Irregular", landmarks: ["Sella turcica", "Greater & lesser wings", "Pterygoid processes"] },
        { name: "Ethmoid bone", latin: "Os ethmoidale", count: 1, type: "Irregular", landmarks: ["Crista galli", "Cribriform plate", "Perpendicular plate"] }
      ],
      facial: [
        { name: "Mandible", latin: "Mandibula", count: 1, type: "Irregular", landmarks: ["Coronoid process", "Condylar process", "Mental protuberance"] },
        { name: "Maxillae", latin: "Maxillae", count: 2, type: "Irregular", landmarks: ["Infraorbital foramen", "Alveolar process", "Palatine process"] },
        { name: "Zygomatic bones", latin: "Ossa zygomatica", count: 2, type: "Irregular", landmarks: ["Temporal process", "Cheek prominence"] },
        { name: "Nasal bones", latin: "Ossa nasalia", count: 2, type: "Flat", landmarks: ["Bridge of nose"] },
        { name: "Lacrimal bones", latin: "Ossa lacrimalia", count: 2, type: "Flat", landmarks: ["Lacrimal groove"] },
        { name: "Palatine bones", latin: "Ossa palatina", count: 2, type: "Irregular", landmarks: ["Horizontal plate (posterior hard palate)"] },
        { name: "Inferior nasal conchae", latin: "Conchae nasales inferiores", count: 2, type: "Turbinate", landmarks: ["Lateral nasal wall"] },
        { name: "Vomer", latin: "Vomer", count: 1, type: "Plow-shaped", landmarks: ["Nasal septum (inferior/posterior)"] }
      ],
      auditoryOssicles: [
        { name: "Malleus (Hammer)", latin: "Malleus", count: 2, landmarks: ["Handle attached to tympanic membrane"] },
        { name: "Incus (Anvil)", latin: "Incus", count: 2, landmarks: ["Articulates with malleus & stapes"] },
        { name: "Stapes (Stirrup)", latin: "Stapes", count: 2, landmarks: ["Footplate in oval window"] }
      ],
      hyoid: [
        { name: "Hyoid bone", latin: "Os hyoideum", count: 1, type: "U-shaped sesamoid", landmarks: ["Body", "Greater cornua", "Lesser cornua"] }
      ],
      vertebralColumn: [
        { region: "Cervical (C1-C7)", count: 7, special: ["C1 Atlas (no body)", "C2 Axis (Dens / Odontoid process)", "C7 Vertebra prominens"], landmarks: ["Transverse foramina", "Bifid spinous processes"] },
        { region: "Thoracic (T1-T12)", count: 12, landmarks: ["Costal facets for rib heads", "Heart-shaped bodies", "Inferiorly angled spinous processes"] },
        { region: "Lumbar (L1-L5)", count: 5, landmarks: ["Massive kidney-shaped bodies", "Short blunt spinous processes", "Weight-bearing pillar"] },
        { region: "Sacrum (S1-S5 fused)", count: 1, landmarks: ["Sacral promontory", "Anterior & posterior sacral foramina", "Sacral hiatus"] },
        { region: "Coccyx (Co1-Co4 fused)", count: 1, landmarks: ["Tailbone apex & transverse processes"] }
      ],
      thoracicCage: [
        { name: "Sternum", latin: "Sternum", count: 1, parts: ["Manubrium (Jugular notch, Clavicular notches)", "Sternal angle of Louis", "Body", "Xiphoid process"] },
        { name: "Ribs (True 1-7)", latin: "Costae verae", count: 14, description: "Attach directly to sternum via costal cartilages" },
        { name: "Ribs (False 8-10)", latin: "Costae spuriae", count: 6, description: "Attach to cartilage of rib 7 above" },
        { name: "Ribs (Floating 11-12)", latin: "Costae fluctuantes", count: 4, description: "No anterior attachment, embed in abdominal wall" }
      ]
    },
    appendicular: {
      count: 126,
      pectoralGirdle: [
        { name: "Clavicle", latin: "Clavicula", count: 2, landmarks: ["Sternal end (sternoclavicular joint)", "Acromial end (acromioclavicular joint)", "Conoid tubercle"] },
        { name: "Scapula", latin: "Scapula", count: 2, landmarks: ["Spine", "Acromion", "Coracoid process", "Glenoid cavity", "Supraspinous / Infraspinous / Subscapular fossae"] }
      ],
      upperLimb: [
        { name: "Humerus", latin: "Humerus", count: 2, landmarks: ["Head", "Greater & Lesser tubercles", "Intertubercular sulcus", "Deltoid tuberosity", "Medial & lateral epicondyles", "Trochlea", "Capitulum", "Olecranon fossa"] },
        { name: "Radius", latin: "Radius", count: 2, landmarks: ["Head (articulates with capitulum)", "Radial tuberosity (Biceps)", "Styloid process", "Lister's tubercle"] },
        { name: "Ulna", latin: "Ulna", count: 2, landmarks: ["Olecranon process", "Coronoid process", "Trochlear notch", "Styloid process"] },
        { name: "Carpals (8 per wrist)", count: 16, proximal: ["Scaphoid", "Lunate", "Triquetrum", "Pisiform"], distal: ["Trapezium", "Trapezoid", "Capitate", "Hamate"] },
        { name: "Metacarpals (I-V)", count: 10, landmarks: ["Base, shaft, head (knuckles)"] },
        { name: "Phalanges (Upper)", count: 28, breakdown: "14 per hand (2 thumb, 3 per finger: proximal, middle, distal)" }
      ],
      pelvicGirdle: [
        { name: "Hip bone (Coxal bone)", latin: "Os coxae", count: 2, parts: ["Ilium (Iliac crest, ASIS, AIIS, Greater sciatic notch)", "Ischium (Ischial tuberosity, Ischial spine)", "Pubis (Body, superior/inferior rami, pubic crest)", "Acetabulum (socket for femoral head)", "Obturator foramen"] }
      ],
      lowerLimb: [
        { name: "Femur", latin: "Femur", count: 2, landmarks: ["Head with fovea capitis", "Neck", "Greater & lesser trochanters", "Linea aspera", "Medial & lateral condyles/epicondyles", "Patellar surface"] },
        { name: "Patella", latin: "Patella", count: 2, type: "Sesamoid bone", landmarks: ["Base", "Apex", "Articular facets for femoral condyles"] },
        { name: "Tibia", latin: "Tibia", count: 2, landmarks: ["Medial & lateral condyles", "Intercondylar eminence", "Tibial tuberosity (patellar ligament)", "Anterior border (shin)", "Medial malleolus"] },
        { name: "Fibula", latin: "Fibula", count: 2, landmarks: ["Head", "Neck (common fibular nerve sits here)", "Lateral malleolus"] },
        { name: "Tarsals (7 per foot)", count: 14, names: ["Talus (articulates with tibia/fibula)", "Calcaneus (heel bone, Achilles insertion)", "Navicular", "Cuboid", "Medial cuneiform", "Intermediate cuneiform", "Lateral cuneiform"] },
        { name: "Metatarsals (I-V)", count: 10, landmarks: ["Base, shaft, head; 1st metatarsal bears highest weight"] },
        { name: "Phalanges (Lower)", count: 28, breakdown: "14 per foot (2 hallux, 3 per toe: proximal, middle, distal)" }
      ]
    }
  },

  // =========================================================================
  // 2. MYOLOGY (COMPLETE SKELETAL MUSCLE COMPARTMENTS & ACTIONS)
  // =========================================================================
  muscles: {
    // -----------------------------------------------------------------------
    // A. SHOULDER & ROTATOR CUFF (DISCRETE HEADS & BELLIES)
    // -----------------------------------------------------------------------
    shoulder: [
      {
        id: "m_deltoideus_pars_clavicularis",
        english: "Deltoid (Anterior / Clavicular Part)",
        latin: "Musculus deltoideus (Pars clavicularis)",
        layer: 2, // Superficial
        origin: "Lateral 1/3 of clavicle (anterior border)",
        insertion: "Deltoid tuberosity of humerus",
        actions: ["Arm Flexion", "Medial (internal) rotation of humerus", "Horizontal adduction"],
        innervation: "Axillary nerve (C5, C6)"
      },
      {
        id: "m_deltoideus_pars_acromialis",
        english: "Deltoid (Middle / Acromial Part)",
        latin: "Musculus deltoideus (Pars acromialis)",
        layer: 2, // Superficial
        origin: "Lateral border and superior surface of acromion",
        insertion: "Deltoid tuberosity of humerus",
        actions: ["Powerful arm abduction (15°-90°)", "Stabilizes humeral head against downward force"],
        innervation: "Axillary nerve (C5, C6)"
      },
      {
        id: "m_deltoideus_pars_spinalis",
        english: "Deltoid (Posterior / Spinal Part)",
        latin: "Musculus deltoideus (Pars spinalis)",
        layer: 2, // Superficial
        origin: "Inferior lip of the spine of the scapula",
        insertion: "Deltoid tuberosity of humerus",
        actions: ["Arm Extension", "Lateral (external) rotation", "Horizontal abduction"],
        innervation: "Axillary nerve (C5, C6)"
      },
      {
        id: "m_supraspinatus",
        english: "Supraspinatus (Rotator Cuff)",
        latin: "Musculus supraspinatus",
        layer: 1, // Deep
        origin: "Supraspinous fossa of scapula",
        insertion: "Superior facet of greater tubercle of humerus",
        actions: ["Initiates arm abduction (0°-15°)", "Stabilizes humeral head in glenoid cavity"],
        innervation: "Suprascapular nerve (C5, C6)"
      },
      {
        id: "m_infraspinatus",
        english: "Infraspinatus (Rotator Cuff)",
        latin: "Musculus infraspinatus",
        layer: 1, // Deep
        origin: "Infraspinous fossa of scapula",
        insertion: "Middle facet of greater tubercle of humerus",
        actions: ["Lateral (external) rotation of arm", "Stabilizes glenohumeral joint"],
        innervation: "Suprascapular nerve (C5, C6)"
      },
      {
        id: "m_teres_minor",
        english: "Teres Minor (Rotator Cuff)",
        latin: "Musculus teres minor",
        layer: 1, // Deep
        origin: "Lateral border of scapula",
        insertion: "Inferior facet of greater tubercle of humerus",
        actions: ["Lateral (external) rotation of arm", "Adduction and glenohumeral stabilization"],
        innervation: "Axillary nerve (C5, C6)"
      },
      {
        id: "m_subscapularis",
        english: "Subscapularis (Rotator Cuff)",
        latin: "Musculus subscapularis",
        layer: 1, // Deep
        origin: "Subscapular fossa of anterior scapula",
        insertion: "Lesser tubercle of humerus & anterior capsule",
        actions: ["Medial (internal) rotation of arm", "Depresses and stabilizes humeral head"],
        innervation: "Upper and lower subscapular nerves (C5, C6)"
      },
      {
        id: "m_teres_major",
        english: "Teres Major",
        latin: "Musculus teres major",
        layer: 2, // Superficial
        origin: "Inferior angle of scapula",
        insertion: "Medial lip of intertubercular groove of humerus",
        actions: ["Adduction and medial rotation of arm", "Arm extension assist"],
        innervation: "Lower subscapular nerve (C5, C6, C7)"
      }
    ],

    // -----------------------------------------------------------------------
    // B. ARM & BRACHIUM (DISCRETE HEADS & BELLIES)
    // -----------------------------------------------------------------------
    arm: [
      {
        id: "m_biceps_brachii_caput_longum",
        english: "Biceps Brachii (Long Head)",
        latin: "Musculus biceps brachii (Caput longum)",
        layer: 2, // Superficial
        origin: "Supraglenoid tubercle of scapula (runs via bicipital groove)",
        insertion: "Radial tuberosity (posterior facet)",
        actions: ["Forearm Supination", "Elbow Flexion", "Shoulder joint stabilization"],
        innervation: "Musculocutaneous nerve (C5, C6)"
      },
      {
        id: "m_biceps_brachii_caput_breve",
        english: "Biceps Brachii (Short Head)",
        latin: "Musculus biceps brachii (Caput breve)",
        layer: 2, // Superficial
        origin: "Apex of coracoid process of scapula (conjoint tendon)",
        insertion: "Radial tuberosity & bicipital aponeurosis",
        actions: ["Elbow Flexion", "Forearm Supination", "Shoulder adduction & forward flexion"],
        innervation: "Musculocutaneous nerve (C5, C6)"
      },
      {
        id: "m_brachialis",
        english: "Brachialis",
        latin: "Musculus brachialis",
        layer: 1, // Deep
        origin: "Distal half of anterior shaft of humerus",
        insertion: "Coronoid process and tuberosity of ulna",
        actions: ["Primary and pure flexor of the elbow in all forearm positions (workhorse of elbow)"],
        innervation: "Musculocutaneous nerve (C5, C6) with small radial contribution (C7)"
      },
      {
        id: "m_coracobrachialis",
        english: "Coracobrachialis",
        latin: "Musculus coracobrachialis",
        layer: 1, // Deep
        origin: "Apex of coracoid process of scapula",
        insertion: "Medial aspect of humerus mid-shaft",
        actions: ["Flexion and adduction of arm at glenohumeral joint", "Resists downward humeral subluxation"],
        innervation: "Musculocutaneous nerve (pierced by it, C5-C7)"
      },
      {
        id: "m_triceps_brachii_caput_longum",
        english: "Triceps Brachii (Long Head)",
        latin: "Musculus triceps brachii (Caput longum)",
        layer: 2, // Superficial
        origin: "Infraglenoid tubercle of scapula",
        insertion: "Posterior surface of olecranon process of ulna via common triceps tendon",
        actions: ["Elbow Extension", "Arm Extension and Adduction at shoulder"],
        innervation: "Radial nerve (C6, C7, C8)"
      },
      {
        id: "m_triceps_brachii_caput_laterale",
        english: "Triceps Brachii (Lateral Head)",
        latin: "Musculus triceps brachii (Caput laterale)",
        layer: 2, // Superficial
        origin: "Posterior humerus superior to radial groove & lateral intermuscular septum",
        insertion: "Olecranon process of ulna",
        actions: ["Powerful elbow extension against resistance"],
        innervation: "Radial nerve (C6, C7, C8)"
      },
      {
        id: "m_triceps_brachii_caput_mediale",
        english: "Triceps Brachii (Medial Head)",
        latin: "Musculus triceps brachii (Caput mediale)",
        layer: 1, // Deep
        origin: "Posterior surface of humerus inferior to radial groove",
        insertion: "Olecranon process of ulna",
        actions: ["Workhorse of elbow extension (active in all forms of extension)"],
        innervation: "Radial nerve (C6, C7, C8)"
      },
      {
        id: "mus_brachioradialis",
        english: "Brachioradialis",
        latin: "Musculus brachioradialis",
        layer: 2, // Superficial
        origin: "Proximal 2/3 of lateral supracondylar ridge of humerus",
        insertion: "Lateral surface of distal radius (above styloid process)",
        actions: ["Elbow flexion in mid-prone position", "Returns forearm to neutral from full pronation/supination"],
        innervation: "Radial nerve (C5, C6)"
      },
      {
        id: "mus_pronator_teres",
        english: "Pronator Teres",
        latin: "Musculus pronator teres",
        layer: 2, // Superficial
        origin: "Humeral head: Medial epicondyle; Ulnar head: Coronoid process",
        insertion: "Middle of lateral surface of radius",
        actions: ["Forearm pronation", "Weak elbow flexion"],
        innervation: "Median nerve (C6, C7)"
      },
      {
        id: "mus_supinator",
        english: "Supinator",
        latin: "Musculus supinator",
        layer: 1, // Deep
        origin: "Lateral epicondyle of humerus, supinator crest of ulna",
        insertion: "Lateral, posterior, and anterior aspects of proximal third of radius",
        actions: ["Slow and unopposed supination of forearm (without resistance)"],
        innervation: "Deep branch of radial nerve / Posterior interosseous nerve (C7, C8)"
      }
    ],

    // -----------------------------------------------------------------------
    // C. THORAX & CHEST WALL
    // -----------------------------------------------------------------------
    chest: [
      {
        id: "mus_pectoralis_major",
        english: "Pectoralis Major",
        latin: "Musculus pectoralis major",
        layer: 2, // Superficial
        origin: "Clavicular head: Anterior medial clavicle; Sternocostal head: Anterior sternum, superior 6 costal cartilages",
        insertion: "Lateral lip of bicipital groove of humerus",
        actions: ["Adduction and medial rotation of arm", "Clavicular head flexes arm", "Sternocostal head extends flexed arm"],
        innervation: "Lateral and medial pectoral nerves (C5-T1)"
      },
      {
        id: "mus_pectoralis_minor",
        english: "Pectoralis Minor",
        latin: "Musculus pectoralis minor",
        layer: 1, // Deep
        origin: "Anterior surfaces of ribs 3-5 near costal cartilages",
        insertion: "Medial border and superior surface of coracoid process of scapula",
        actions: ["Depresses and protracts scapula", "Accessory muscle of inspiration"],
        innervation: "Medial pectoral nerve (C8, T1)"
      },
      {
        id: "mus_serratus_anterior",
        english: "Serratus Anterior",
        latin: "Musculus serratus anterior",
        layer: 1, // Deep
        origin: "External surfaces of lateral parts of ribs 1-8",
        insertion: "Anterior costal surface of medial border of scapula",
        actions: ["Protracts scapula (boxer's muscle)", "Upwardly rotates glenoid cavity for full overhead reach", "Holds scapula firmly against thoracic wall (prevents winging)"],
        innervation: "Long thoracic nerve of Bell (C5, C6, C7)"
      },
      {
        id: "mus_diaphragm",
        english: "Thoracic Diaphragm",
        latin: "Diaphragma",
        layer: 1, // Deep
        origin: "Xiphoid process, lower 6 costal cartilages and ribs, lumbar vertebrae (crura)",
        insertion: "Central tendon of diaphragm",
        actions: ["Primary muscle of respiration; contracts and flattens, increasing vertical thoracic volume"],
        innervation: "Phrenic nerve (C3, C4, C5: 'keeps the diaphragm alive')"
      }
    ],

    // -----------------------------------------------------------------------
    // D. ABDOMEN & TRUNK CORE
    // -----------------------------------------------------------------------
    core: [
      {
        id: "mus_rectus_abdominis",
        english: "Rectus Abdominis",
        latin: "Musculus rectus abdominis",
        layer: 2, // Superficial
        origin: "Pubic crest and pubic symphysis",
        insertion: "Xiphoid process and costal cartilages of ribs 5-7",
        actions: ["Flexion of lumbar spine", "Compresses abdominal viscera", "Stabilizes pelvis during ambulation"],
        innervation: "Thoracoabdominal nerves (T7-T11) and subcostal nerve (T12)"
      },
      {
        id: "mus_obliquus_externus",
        english: "External Oblique",
        latin: "Musculus obliquus externus abdominis",
        layer: 2, // Superficial
        origin: "External surfaces of ribs 5-12",
        insertion: "Linea alba, pubic tubercle, and anterior half of iliac crest",
        actions: ["Bilateral: Trunk flexion and abdominal compression; Unilateral: Contralateral trunk rotation"],
        innervation: "Thoracoabdominal nerves (T7-T11) and subcostal nerve (T12)"
      },
      {
        id: "mus_obliquus_internus",
        english: "Internal Oblique",
        latin: "Musculus obliquus internus abdominis",
        layer: 1, // Deep
        origin: "Thoracolumbar fascia, anterior 2/3 of iliac crest, lateral inguinal ligament",
        insertion: "Inferior borders of ribs 10-12, linea alba, and pecten pubis (conjoint tendon)",
        actions: ["Bilateral: Trunk flexion; Unilateral: Ipsilateral trunk rotation"],
        innervation: "Thoracoabdominal nerves (T7-T12), iliohypogastric and ilioinguinal nerves (L1)"
      },
      {
        id: "mus_transversus_abdominis",
        english: "Transversus Abdominis",
        latin: "Musculus transversus abdominis",
        layer: 1, // Deepest
        origin: "Internal surfaces of costal cartilages 7-12, thoracolumbar fascia, iliac crest",
        insertion: "Linea alba with aponeurosis of internal oblique, pubic crest",
        actions: ["Compresses and supports abdominal viscera", "Acts as an anatomical weight belt, stabilizing lumbar spine"],
        innervation: "Thoracoabdominal nerves (T7-T12), iliohypogastric and ilioinguinal nerves (L1)"
      },
      {
        id: "mus_quadratus_lumborum",
        english: "Quadratus Lumborum",
        latin: "Musculus quadratus lumborum",
        layer: 1, // Deep
        origin: "Medial half of inferior border of 12th rib and tips of lumbar transverse processes",
        insertion: "Iliolumbar ligament and internal lip of iliac crest",
        actions: ["Ipsilateral lateral flexion of lumbar spine", "Fixes 12th rib during inspiration"],
        innervation: "Ventral rami of T12 and L1-L4"
      }
    ],

    // -----------------------------------------------------------------------
    // E. BACK & POSTERIOR SPINE
    // -----------------------------------------------------------------------
    back: [
      {
        id: "mus_trapezius",
        english: "Trapezius",
        latin: "Musculus trapezius",
        layer: 2, // Superficial
        origin: "External occipital protuberance, nuchal ligament, spinous processes of C7-T12",
        insertion: "Lateral 1/3 of clavicle, acromion, and spine of scapula",
        actions: ["Descending fibers: Elevate scapula; Transverse fibers: Retract scapula; Ascending fibers: Depress scapula", "Upward rotation of glenoid"],
        innervation: "Spinal accessory nerve (CN XI, motor) and C3-C4 cervical plexus (sensory/proprioception)"
      },
      {
        id: "mus_latissimus_dorsi",
        english: "Latissimus Dorsi",
        latin: "Musculus latissimus dorsi",
        layer: 2, // Superficial
        origin: "Spinous processes of T7-T12, thoracolumbar fascia, iliac crest, inferior 3-4 ribs",
        insertion: "Floor of intertubercular groove of humerus",
        actions: ["Powerful extension, adduction, and medial rotation of humerus (swimmer's muscle)"],
        innervation: "Thoracodorsal nerve (C6, C7, C8)"
      },
      {
        id: "mus_erector_spinae",
        english: "Erector Spinae Group (Iliocostalis, Longissimus, Spinalis)",
        latin: "Musculus erector spinae",
        layer: 1, // Deep intrinsic
        origin: "Broad tendon from posterior sacrum, iliac crest, and lumbar spinous processes",
        insertion: "Ribs, transverse processes, and spinous processes up to cervical vertebrae and mastoid",
        actions: ["Chief extensor of the vertebral column", "Controls spinal flexion eccentrically", "Unilateral: Lateral flexion"],
        innervation: "Posterior rami of respective spinal nerves"
      }
    ],

    // -----------------------------------------------------------------------
    // F. HIP & THIGH
    // -----------------------------------------------------------------------
    hipAndThigh: [
      {
        id: "mus_gluteus_maximus",
        english: "Gluteus Maximus",
        latin: "Musculus gluteus maximus",
        layer: 2, // Superficial
        origin: "Posterior gluteal line of ilium, posterolateral sacrum and coccyx, sacrotuberous ligament",
        insertion: "Gluteal tuberosity of femur and iliotibial (IT) tract",
        actions: ["Powerful extensor of hip joint (climbing, standing from seated)", "Lateral rotation of thigh", "Stabilizes knee via IT band"],
        innervation: "Inferior gluteal nerve (L5, S1, S2)"
      },
      {
        id: "mus_gluteus_medius",
        english: "Gluteus Medius",
        latin: "Musculus gluteus medius",
        layer: 1, // Deep
        origin: "Lateral surface of ilium between anterior and posterior gluteal lines",
        insertion: "Lateral surface of greater trochanter of femur",
        actions: ["Major abductor of hip joint", "Prevents contralateral pelvic drop during unilateral stance (Trendelenburg sign)", "Medial rotation of thigh"],
        innervation: "Superior gluteal nerve (L4, L5, S1)"
      },
      {
        id: "mus_piriformis",
        english: "Piriformis",
        latin: "Musculus piriformis",
        layer: 1, // Deep
        origin: "Anterior surface of sacrum and sacrotuberous ligament",
        insertion: "Superior border of greater trochanter of femur",
        actions: ["Lateral rotation of extended thigh", "Abduction of flexed thigh", "Stabilizes acetabulofemoral joint"],
        innervation: "Nerve to piriformis (S1, S2)"
      },
      {
        id: "mus_psoas_major",
        english: "Psoas Major",
        latin: "Musculus psoas major",
        layer: 1, // Deep
        origin: "Transverse processes of lumbar vertebrae, sides of T12-L5 vertebral bodies and intervertebral discs",
        insertion: "Lesser trochanter of femur (with iliacus as iliopsoas tendon)",
        actions: ["Primary and strongest flexor of the hip joint", "Stabilizes lumbar lordosis during standing"],
        innervation: "Anterior rami of lumbar nerves (L1, L2, L3)"
      },
      {
        id: "mus_quadriceps_femoris",
        english: "Quadriceps Femoris (Rectus Femoris, Vastus Lateralis, Medialis, Intermedius)",
        latin: "Musculus quadriceps femoris",
        layer: 2, // Superficial
        origin: "Rectus femoris: AIIS & ilium above acetabulum; Vasti: Intertrochanteric line, linea aspera, and anterior shaft of femur",
        insertion: "Base of patella, and via patellar ligament into tibial tuberosity",
        actions: ["Great extensor of the knee joint", "Rectus femoris also assists in hip flexion"],
        innervation: "Femoral nerve (L2, L3, L4)"
      },
      {
        id: "mus_hamstrings",
        english: "Hamstrings (Biceps Femoris, Semitendinosus, Semimembranosus)",
        latin: "Musculi ischiocrurales",
        layer: 2, // Superficial
        origin: "Ischial tuberosity (sit bone) — short head of biceps femoris from linea aspera",
        insertion: "Tibia (medial condyle & pes anserinus) and fibular head",
        actions: ["Knee flexion", "Hip extension during locomotion", "Medial & lateral rotation of flexed knee"],
        innervation: "Sciatic nerve (Tibial division; common fibular division for short head of biceps)"
      }
    ],

    // -----------------------------------------------------------------------
    // G. LEG & ANKLE
    // -----------------------------------------------------------------------
    leg: [
      {
        id: "mus_tibialis_anterior",
        english: "Tibialis Anterior",
        latin: "Musculus tibialis anterior",
        layer: 2, // Superficial
        origin: "Lateral condyle and proximal 2/3 of lateral surface of tibia, interosseous membrane",
        insertion: "Medial and inferior surfaces of medial cuneiform and base of 1st metatarsal",
        actions: ["Dorsiflexion of the ankle", "Inversion of foot", "Dynamic support of medial longitudinal arch"],
        innervation: "Deep fibular (peroneal) nerve (L4, L5)"
      },
      {
        id: "mus_gastrocnemius",
        english: "Gastrocnemius",
        latin: "Musculus gastrocnemius",
        layer: 2, // Superficial
        origin: "Lateral head: Lateral aspect of lateral condyle of femur; Medial head: Popliteal surface of femur above medial condyle",
        insertion: "Posterior surface of calcaneus via calcaneal (Achilles) tendon",
        actions: ["Powerful plantarflexion of foot", "Assists in knee flexion during initial swing phase of gait"],
        innervation: "Tibial nerve (S1, S2)"
      },
      {
        id: "mus_soleus",
        english: "Soleus",
        latin: "Musculus soleus",
        layer: 1, // Deep
        origin: "Posterior aspect of head and proximal shaft of fibula, soleal line of tibia",
        insertion: "Posterior calcaneus via calcaneal (Achilles) tendon",
        actions: ["Plantarflexion of foot independent of knee angle (crucial for standing postural stability & running)", "Venous muscle pump"],
        innervation: "Tibial nerve (S1, S2)"
      },
      {
        id: "mus_tibialis_posterior",
        english: "Tibialis Posterior",
        latin: "Musculus tibialis posterior",
        layer: 1, // Deep
        origin: "Posterior interosseous membrane, adjacent posterior surfaces of tibia and fibula",
        insertion: "Tuberosity of navicular, cuneiforms, cuboid, and bases of 2nd-4th metatarsals",
        actions: ["Principal inverter of foot", "Plantarflexion assist", "Primary active supporter of medial longitudinal arch"],
        innervation: "Tibial nerve (L4, L5)"
      }
    ]
  }
};

// Freeze registry to prevent accidental mutations
Object.freeze(ANATOMY_REGISTRY);
