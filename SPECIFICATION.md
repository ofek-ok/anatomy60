# Comprehensive Technical Specification & Master Implementation Prompt: AnatoMe

## 1. Project Overview & Vision
We are developing **AnatoMe**, a mobile 3D anatomy reference and interactive kinesiology application for medical students, clinicians, and physical therapists. 

### The Core Paradigm: Medical Rigor meets "Cozy Game" Aesthetic
- **Completeness:** 100% comprehensive anatomical coverage of the human musculoskeletal system (all ~206 bones and all ~600+ skeletal muscles, origins, insertions, innervations, and mechanical actions). No missing structures or clinical shortcuts.
- **Aesthetic:** Unlike cold, clinical, or gory medical software, the entire visual language, UI, and rendering must feel warm, tactile, and inviting—inspired by cozy games like *Animal Crossing* and *Cozy Grove* (soft pastel palettes, matte ceramic/vinyl textures, warm rim lighting, rounded tactile UI, and playful yet precise micro-interactions).

---

## 2. Full Anatomical Data Source (100% Coverage)
Do NOT manually type anatomical data from scratch. You will integrate an established, open-standard medical database:

1. **Primary Database & 3D Source:** Integrate data from the **Z-Anatomy project (Terminologia Anatomica 2 / TA2)**.
   - Website & Repositories: [https://www.z-anatomy.net/](https://www.z-anatomy.net/) / GitHub (`Z-Anatomy/Models-of-human-anatomy` & `LluisV/Z-Anatomy`).
   - It provides a complete, peer-reviewed, open-source hierarchy of every human muscle, bone, landmark, and innervation, with matching 3D meshes pre-separated and labeled.
2. **Alternative Data Tables:** If parsing directly from CSV/JSON, use the **Foundational Model of Anatomy (FMA)** or **OpenAnatomy** schema dumps.

Every anatomical asset in the engine must map 1:1 between its database entry (`structure_id`) and its 3D GameObject/Mesh name.

---

## 3. Data Architecture & Schema

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
