#if UNITY_EDITOR
using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using AnatoMe.Data;

namespace AnatoMe.Editor
{
    [Serializable]
    public class TA2JsonMuscleDTO
    {
        public string structureId;
        public string nameEnglish;
        public string nameLatin;
        public string region;
        public int layer;
        public List<TA2JsonAttachmentDTO> origins;
        public List<TA2JsonAttachmentDTO> insertions;
        public List<TA2JsonActionDTO> actions;
        public string innervation;
        public string clinicalNotes;
        public string meshAddressableKey;
        public ColorDTO cozyTint;
    }

    [Serializable]
    public class TA2JsonAttachmentDTO
    {
        public string boneId;
        public string landmarkName;
        public string anchorSocketName;
        public Vector3DTO localOffset;
    }

    [Serializable]
    public class TA2JsonActionDTO
    {
        public string actionType;
        public string targetJoint;
        public string animationClipKey;
        public float blendShapeWeight;
    }

    [Serializable]
    public class Vector3DTO
    {
        public float x;
        public float y;
        public float z;
        public Vector3 ToVector3() => new Vector3(x, y, z);
    }

    [Serializable]
    public class ColorDTO
    {
        public float r;
        public float g;
        public float b;
        public float a;
        public Color ToColor() => new Color(r, g, b, a);
    }

    [Serializable]
    public class TA2RegionalDataPackage
    {
        public string region;
        public string regionName;
        public string ta2StandardVersion;
        public string source;
        public List<TA2JsonMuscleDTO> muscles;
    }

    public static class TA2DataImporter
    {
        private const string OutputAssetFolder = "Assets/AnatoMe/Data/ShoulderAndBrachium";

        [MenuItem("AnatoMe/Import TA2 Regional Data (Shoulder & Brachium)")]
        public static void ImportShoulderAndBrachium()
        {
            // Locate the JSON file
            string jsonRelativePath = "Resources/Data/ShoulderAndBrachium_TA2.json";
            string fullPath = Path.Combine(Application.dataPath, jsonRelativePath);

            if (!File.Exists(fullPath))
            {
                // Fallback search in project
                string[] foundFiles = Directory.GetFiles(Application.dataPath, "ShoulderAndBrachium_TA2.json", SearchOption.AllDirectories);
                if (foundFiles.Length > 0)
                {
                    fullPath = foundFiles[0];
                }
                else
                {
                    Debug.LogError($"[AnatoMe Importer] Could not find 'ShoulderAndBrachium_TA2.json' at {fullPath}");
                    return;
                }
            }

            string jsonContent = File.ReadAllText(fullPath);
            ImportFromJsonString(jsonContent);
        }

        public static void ImportFromJsonString(string jsonString)
        {
            TA2RegionalDataPackage package = JsonUtility.FromJson<TA2RegionalDataPackage>(jsonString);
            if (package == null || package.muscles == null)
            {
                Debug.LogError("[AnatoMe Importer] Failed to parse TA2 JSON package.");
                return;
            }

            if (!AssetDatabase.IsValidFolder("Assets/AnatoMe"))
                AssetDatabase.CreateFolder("Assets", "AnatoMe");
            if (!AssetDatabase.IsValidFolder("Assets/AnatoMe/Data"))
                AssetDatabase.CreateFolder("Assets/AnatoMe", "Data");
            if (!AssetDatabase.IsValidFolder(OutputAssetFolder))
                AssetDatabase.CreateFolder("Assets/AnatoMe/Data", "ShoulderAndBrachium");

            int importedCount = 0;

            foreach (var dto in package.muscles)
            {
                string assetPath = $"{OutputAssetFolder}/{dto.structureId}.asset";
                MuscleData muscleAsset = AssetDatabase.LoadAssetAtPath<MuscleData>(assetPath);

                bool isNew = (muscleAsset == null);
                if (isNew)
                {
                    muscleAsset = ScriptableObject.CreateInstance<MuscleData>();
                }

                // Map DTO to ScriptableObject
                muscleAsset.structureId = dto.structureId;
                muscleAsset.nameEnglish = dto.nameEnglish;
                muscleAsset.nameLatin = dto.nameLatin;
                muscleAsset.innervation = dto.innervation;
                muscleAsset.clinicalNotes = dto.clinicalNotes;
                muscleAsset.meshAddressableKey = dto.meshAddressableKey;
                muscleAsset.layer = (AnatomyLayer)dto.layer;

                if (Enum.TryParse(dto.region, out AnatomyRegion parsedRegion))
                {
                    muscleAsset.region = parsedRegion;
                }
                else
                {
                    muscleAsset.region = AnatomyRegion.Region2_ShoulderAndBrachium;
                }

                if (dto.cozyTint != null)
                {
                    muscleAsset.cozyTint = dto.cozyTint.ToColor();
                }

                // Map Origins
                muscleAsset.origins = new List<AttachmentPoint>();
                if (dto.origins != null)
                {
                    foreach (var o in dto.origins)
                    {
                        muscleAsset.origins.Add(new AttachmentPoint
                        {
                            boneId = o.boneId,
                            landmarkName = o.landmarkName,
                            anchorSocketName = o.anchorSocketName,
                            localOffset = o.localOffset != null ? o.localOffset.ToVector3() : Vector3.zero
                        });
                    }
                }

                // Map Insertions
                muscleAsset.insertions = new List<AttachmentPoint>();
                if (dto.insertions != null)
                {
                    foreach (var ins in dto.insertions)
                    {
                        muscleAsset.insertions.Add(new AttachmentPoint
                        {
                            boneId = ins.boneId,
                            landmarkName = ins.landmarkName,
                            anchorSocketName = ins.anchorSocketName,
                            localOffset = ins.localOffset != null ? ins.localOffset.ToVector3() : Vector3.zero
                        });
                    }
                }

                // Map Actions
                muscleAsset.actions = new List<KinesiologyAction>();
                if (dto.actions != null)
                {
                    foreach (var act in dto.actions)
                    {
                        if (Enum.TryParse(act.actionType, out JointActionType parsedAction))
                        {
                            muscleAsset.actions.Add(new KinesiologyAction
                            {
                                actionType = parsedAction,
                                targetJoint = act.targetJoint,
                                animationClipKey = act.animationClipKey,
                                blendShapeWeight = act.blendShapeWeight,
                                mechanicalDeformationCurve = AnimationCurve.EaseInOut(0f, 0f, 1f, 1f)
                            });
                        }
                    }
                }

                if (isNew)
                {
                    AssetDatabase.CreateAsset(muscleAsset, assetPath);
                }
                else
                {
                    EditorUtility.SetDirty(muscleAsset);
                }
                importedCount++;
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"<color=#7CD9C8><b>[AnatoMe Importer]</b></color> Successfully imported {importedCount} TA2 MuscleData ScriptableObjects into <i>{OutputAssetFolder}</i>!");
        }
    }
}
#endif
