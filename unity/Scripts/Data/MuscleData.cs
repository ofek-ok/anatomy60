using System;
using System.Collections.Generic;
using UnityEngine;

namespace AnatoMe.Data
{
    [Serializable]
    public struct AttachmentPoint
    {
        [Tooltip("Exact Bone ID corresponding to Z-Anatomy TA2 naming, e.g., 'bone_scapula_r'")]
        public string boneId;

        [Tooltip("Palpable anatomical landmark name, e.g., 'Coracoid process'")]
        public string landmarkName;

        [Tooltip("Transform socket child on the bone: 'anchor_coracoid_process'")]
        public string anchorSocketName;

        [Tooltip("Local offset relative to bone socket")]
        public Vector3 localOffset;
    }

    [Serializable]
    public struct KinesiologyAction
    {
        [Tooltip("Type of joint action executed")]
        public JointActionType actionType;

        [Tooltip("Target joint affected, e.g., 'Glenohumeral Joint'")]
        public string targetJoint;

        [Tooltip("Trigger key in Animator: 'anim_deltoid_abduction'")]
        public string animationClipKey;

        [Range(0f, 100f)]
        [Tooltip("Target contraction blendshape weight (0-100)")]
        public float blendShapeWeight;

        [Tooltip("Optional custom animation curve for the bulge/shorten mechanical loop")]
        public AnimationCurve mechanicalDeformationCurve;
    }

    [CreateAssetMenu(fileName = "NewMuscleData", menuName = "AnatoMe/Data/Muscle")]
    public class MuscleData : ScriptableObject
    {
        [Header("Identifiers (Z-Anatomy TA2 Mapping)")]
        [Tooltip("Matches 1:1 with 3D GameObject/Mesh name: e.g., 'm_biceps_brachii_caput_longum'")]
        public string structureId;

        [Tooltip("Common English clinical name, e.g., 'Biceps Brachii (Long Head)'")]
        public string nameEnglish;

        [Tooltip("Official Latin Terminology, e.g., 'Musculus biceps brachii (Caput longum)'")]
        public string nameLatin;

        [Tooltip("Regional classification")]
        public AnatomyRegion region;

        [Header("Hierarchy & Peeling")]
        [Tooltip("Layer 0 (Skeleton), Layer 1 (Deep), Layer 2 (Superficial), Layer 3 (Skin)")]
        public AnatomyLayer layer;

        [Header("Attachments (Anchors)")]
        public List<AttachmentPoint> origins = new List<AttachmentPoint>();
        public List<AttachmentPoint> insertions = new List<AttachmentPoint>();

        [Header("Kinesiology & Clinical Reference")]
        public List<KinesiologyAction> actions = new List<KinesiologyAction>();

        [Tooltip("e.g., 'Musculocutaneous nerve (C5-C6)'")]
        public string innervation;

        [Tooltip("Clinical pearls or pathology notes, e.g., 'Popeye sign upon rupture'")]
        [TextArea(2, 4)]
        public string clinicalNotes;

        [Header("Mobile Asset Management")]
        [Tooltip("Addressables key for lazy regional loading on mobile devices")]
        public string meshAddressableKey;

        [Tooltip("Default warm cozy muscle tint")]
        public Color cozyTint = new Color(0.95f, 0.62f, 0.56f, 1f);
    }
}
