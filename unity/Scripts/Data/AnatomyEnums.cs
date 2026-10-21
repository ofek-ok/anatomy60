using System;

namespace AnatoMe.Data
{
    public enum AnatomyLayer
    {
        Skeleton = 0,           // Complete Bones & Landmarks
        DeepMuscle = 1,         // Deep Stabilizers & Intrinsic Muscles
        SuperficialMuscle = 2,  // Prime Movers & Superficial Muscles
        Skin = 3                // Soft outer silhouette / boundary
    }

    public enum JointActionType
    {
        Flexion,
        Extension,
        Abduction,
        Adduction,
        InternalRotation,
        ExternalRotation,
        Pronation,
        Supination,
        Dorsiflexion,
        Plantarflexion,
        Elevation,
        Depression,
        Retraction,
        Protraction,
        Inversion,
        Eversion
    }

    public enum AnatomyRegion
    {
        Region1_CraniumAndSpine,
        Region2_ShoulderAndBrachium,
        Region3_ForearmAndHand,
        Region4_ThoraxAndSpine,
        Region5_PelvisAndGluteal,
        Region6_ThighAndKnee,
        Region7_CrurisAndFoot
    }
}
