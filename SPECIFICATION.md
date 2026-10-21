# Comprehensive Technical Specification & Master Implementation Prompt: AnatoMe

## 1. Project Overview & Aesthetic Direction
We are developing **AnatoMe**, a mobile 3D anatomy and kinesiology application for medical students, clinicians, and physical therapists.

### The Core Paradigm: Medical Rigor meets "Cozy Game" Aesthetic
- **Completeness:** 100% comprehensive anatomical coverage of the human musculoskeletal system (all ~206 bones, all ~600+ skeletal muscles, discrete muscle bellies/heads, tendons, origins, insertions, innervations, and joint actions). No missing structures or clinical shortcuts.
- **No Monolithic Meshes:** Muscles must NOT look like a fused, blurry single body mesh. Every single muscle, belly, head, and major tendon must be an individually cut, physically separate 3D mesh with visible anatomical definition and crevice depth.
- **Aesthetic:** A warm, inviting, tactile look inspired by cozy games (*Animal Crossing*, *Cozy Grove*). Soft pastel palettes, matte ceramic/vinyl textures, warm rim lighting, and rounded tactile UI.

---

## 2. 3D Model Source & Direct Download Links (Open-Source / CC-BY-SA)
Do NOT model anatomy from scratch. We are using the **Z-Anatomy** open-source project, which maps 100% of the human anatomy according to **Terminologia Anatomica 2 (TA2)** with pre-separated meshes:

* **Official Project Site & Downloads:** [https://www.z-anatomy.com/](https://www.z-anatomy.com/)
* **Official GitHub Repository (Blender Models & Template):** [https://github.com/Z-Anatomy/Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy)
* **Alternative Unity/Data Project Archive:** [https://github.com/moueza/Z-Anatomy](https://github.com/moueza/Z-Anatomy)

### Model Preparation Requirements:
1. **Mesh Separation:** Ensure every individual muscle (e.g., *Biceps Brachii Caput Longum* vs. *Caput Breve*), tendon, and bone is exported as an independent Submesh/GameObject matching its anatomical Latin/ID tag.
2. **Tendons & Aponeuroses:** Muscles must transition into distinct matte-white/ivory tendon geometry at their insertion and origin zones (e.g., Patellar tendon, Achilles tendon, Biceps tendon, Quadriceps tendon).
3. **Regional Chunking (Crucial for Mobile Performance & Detail):**
   Do not render the entire 600-muscle body in a single camera viewport. Partition the model into distinct **7 Regional Views** loaded asynchronously via Addressables:
   - **Region 1:** Cranium, Face & Cervical Spine
   - **Region 2:** Shoulder Girdle & Brachium
   - **Region 3:** Forearm & Hand (Intrinsic Muscles)
   - **Region 4:** Thorax, Abdominal Wall & Spine
   - **Region 5:** Pelvis & Gluteal Region
   - **Region 6:** Thigh & Knee
   - **Region 7:** Cruris (Lower Leg) & Foot

---

## 3. Visual & Tech-Art System (Cozy URP Shading Pipeline)
Set up the custom shader pipeline using **Unity URP Shader Graph** (or Godot 4 Custom Shader):

1. **Custom Toon Ramp Shading (Replacing PBR):**
   - No specular/glossy highlights (avoids wet, biological appearances). Fully matte (Roughness ~0.95).
   - **Smooth 2-Tone Ramp:** Soft gradient transition between lit and shadowed areas.
   - **Shadow Tint:** Never use black or gray shadows. Bones use soft lavender-ivory (`#EAE6F2`); muscles use warm rose-terracotta.
2. **Crevice Definition & Ambient Occlusion (Inner Cuts):**
   - Use an **Inner Crevice / Curvature / Screen-space AO pass** to render subtle, warm darkened lines in the grooves between adjacent muscle bellies. This makes every anatomical division crisp, physically separated, and clearly readable.
3. **Subsurface Scattering (Fake SSS) & Fresnel Glow:**
   - Gentle, light pastel Fresnel along mesh silhouettes for a soft, lively vinyl/ceramic appearance.
4. **Tinted Inverted-Hull Outlines:**
   - Clean, subtle outline colored as a darker tint of the organ itself (e.g., deep warm burgundy for muscles, sand-brown for bones). Never `#000000`.
5. **Dithered Screen-Door Transparency:**
   - When peeling layers or fading unselected muscles, use a **Screen-Door / Blue-Noise Dithered shader** in the Opaque pass to avoid mobile alpha-sorting bugs and overdraw penalties.

### Color Palette Reference:
- **Skeleton (Layer 0):** Warm Cream / Ivory (`#FDFBF7`), Matte roughness ~0.95.
- **Tendons & Aponeuroses:** Matte Porcelain White (`#F6F3ED`), clearly separating belly from bone.
- **Deep Muscles (Layer 1):** Muted Rose / Warm Coral (`#D97D7A`).
- **Superficial Muscles (Layer 2):** Soft Warm Peach (`#F29E8E`).
- **Origins (Anchors):** Glowing Mint-Turquoise pin (`#7CD9C8`).
- **Insertions (Anchors):** Glowing Butter-Yellow pin (`#FBE38E`).

---

## 4. Data Architecture & Schema

Implement a data-driven architecture using **ScriptableObjects (Unity)** or **Custom Resources / JSON (Godot)**. 

### Data Structure Specification (C#):

```csharp
using System;
using System.Collections.Generic;
using UnityEngine;

public enum AnatomyLayer
{
    Skeleton = 0,           // Complete Bones & Joints
    DeepMuscle = 1,         // Deep Stabilizers & Intrinsic Muscles
    SuperficialMuscle = 2,  // Prime Movers & Superficial Layer
    Skin = 3                // Soft silhouette / transparency boundary
}

public enum JointActionType
{
    Flexion, Extension, Abduction, Adduction,
    InternalRotation, ExternalRotation,
    Pronation, Supination, Dorsiflexion, Plantarflexion,
    Elevation, Depression, Retraction, Protraction, Inversion, Eversion
}

[Serializable]
public struct AttachmentPoint
{
    public string boneId;              // e.g. "bone_scapula_r"
    public string landmarkName;        // e.g. "Coracoid process"
    public string anchorSocketName;    // Transform child name: e.g. "anchor_coracoid_process"
}

[Serializable]
public struct KinesiologyAction
{
    public JointActionType actionType;
    public string targetJoint;         // e.g. "Glenohumeral Joint"
    public string animationClipKey;    // Trigger key in Animator: e.g. "anim_deltoid_abduction"
    public float blendShapeWeight;     // Target contraction blendshape intensity (0-100)
}

[CreateAssetMenu(fileName = "NewMuscleData", menuName = "AnatoMe/Data/Muscle")]
public class MuscleData : ScriptableObject
{
    [Header("Identifiers")]
    public string structureId;         // e.g. "m_biceps_brachii_r"
    public string nameEnglish;         // "Biceps Brachii"
    public string nameLatin;           // "Musculus biceps brachii"
    public string region;              // "Upper Limb / Anterior Arm"

    [Header("Hierarchy")]
    public AnatomyLayer layer;

    [Header("Attachments (Anchors)")]
    public List<AttachmentPoint> origins;
    public List<AttachmentPoint> insertions;

    [Header("Kinesiology")]
    public List<KinesiologyAction> actions;
    public string innervation;         // e.g. "Musculocutaneous nerve (C5-C6)"

    [Header("Assets")]
    public string meshAddressableKey;  // Key for asynchronous Addressable loading
}
```

---

## 4. Visual & Tech-Art System (The Cozy Shading Pipeline)

Set up the pipeline in **Unity URP (Universal Render Pipeline)**. The visual target is matte, tactile, warm, and friendly.

1. **Custom Toon Ramp Shading (Replacing Standard PBR):**
   - Do not use metallic/specular highlights that produce wet or slimy appearances.
   - Use a **Smooth 2-Tone Ramp**. Shadow bands must be wide and soft.
   - **Shadow Color Policy:** Shadows are NEVER pure black or gray. Bone shadows should be soft lavender-ivory (`#EAE6F2`); muscle shadows should be warm terracotta-rose.

2. **Fake Subsurface Scattering (SSS) & Rim Glow:**
   - Implement a subtle **Fresnel effect** around the silhouettes using soft pastel ambient tints to give structures a gentle, warm, living-ceramic finish.

3. **Tinted Inverted-Hull Outlines:**
   - Thin, screen-space consistent outlines.
   - Outline colors must be a darkened tint of the object's base color (deep warm burgundy for muscles, warm sand for bones). Never pure `#000000`.

4. **Mobile Optimization & Dithered Transparency:**
   - To prevent performance crashes and sorting errors on mobile GPUs during layer peeling, **do NOT use traditional Alpha Blending**.
   - Implement **Screen-Door / Blue-Noise Dithered Transparency** within the opaque/alpha-test pass.

### Color Palette Reference:
- **Skeleton (Layer 0):** Warm Cream / Ivory (`#FDFBF7`), Matte roughness ~0.95.
- **Deep Muscles (Layer 1):** Muted Rose / Warm Coral (`#D97D7A`).
- **Superficial Muscles (Layer 2):** Soft Warm Peach (`#F29E8E`).
- **Origins (Anchors):** Glowing Mint-Turquoise pin (`#7CD9C8`).
- **Insertions (Anchors):** Glowing Butter-Yellow pin (`#FBE38E`).

---

## 5. Interaction States & Core Logic

Implement a robust **Finite State Machine (FSM)** for the viewer:

1. **Default / Navigation State:**
   - 3D Orbit camera centered on the active body region with smooth Cinemachine dampening.
   - The model rests on an aesthetically pleasing floating diorama pedestal.

2. **Peeling Slider State:**
   - A vertical layer slider (Skin ➔ Superficial ➔ Deep ➔ Skeleton).
   - Sliding smoothly fades layers using the dithered transparency shader while triggering subtle haptic feedback (Taptic Engine) per tier.

3. **Selection State (Inspection):**
   - Tapping a muscle highlights it with an emissive pulse, dims unrelated muscles to 15% dithered opacity, and centers the camera using an elastic/spring tween curve.
   - Displays an animated, rounded frosted-glass info card displaying: English Name, Latin Name, Layer, Origins, Insertions, and Actions.

4. **Kinesiology / Action State:**
   - Selecting a movement action triggers the corresponding joint rotation animation loop.
   - The active muscle mesh fires a **Blendshape (Shape Key)** that dynamically swells/shortens in sync with the skeletal movement.
   - Glowing bezier curves or animated dashed paths pulse along the line of action between the Origin and Insertion socket points.

5. **Isolation State:**
   - A toggle that immediately disables the `MeshRenderer` of all objects except the selected muscle and the specific bones containing its origins and insertions.

---

## 6. Mobile Performance & Memory Guidelines

- **Modular Loading (Addressables):** Do not load all 600+ muscles into a single scene at once. Partition assets into regional bundles (Cranial, Torso, Spine, Upper Limb, Pelvis, Lower Limb) loaded asynchronously via Addressables.
- **Draw-Call Batching:** Ensure bones share a consolidated atlas/palette material to leverage GPU Instancing / SRP Batcher.
- **Attachment Sockets:** Anchor points on bones must be lightweight Empty GameObjects (`anchor_<landmark_id>`) childed under the relevant bone transform.

---

## 7. Deliverables Checklist for Phase 1

- [ ] Working URP Toon/Cozy Shader with custom color ramp, Fresnel, and Dithered Opacity.
- [ ] ScriptableObject data structure created and populated with sample regional data (e.g., Upper Limb / Rotator Cuff & Arm).
- [ ] Z-Anatomy dataset pipeline established (importing meshes and populating metadata).
- [ ] Diorama-based 3D scene with touch-based Orbit/Pan/Zoom camera.
- [ ] Layer Peeling slider and Muscle Selection/Isolation state logic implemented.
