using System;
using System.Collections.Generic;
using UnityEngine;
using AnatoMe.Data;

namespace AnatoMe.Controllers
{
    public enum ViewerState
    {
        Navigation,
        Peeling,
        Selection,
        KinesiologyAction,
        Isolation
    }

    public class AnatomyFSM : MonoBehaviour
    {
        [Header("State")]
        public ViewerState currentState = ViewerState.Navigation;
        public MuscleData selectedMuscle;

        [Header("Peeling System")]
        [Range(0f, 3f)] public float currentPeelTier = 3f; // 0=Skeleton, 1=Deep, 2=Superficial, 3=Skin

        [Header("References")]
        public Transform dioramaPedestal;
        public Camera mainCamera;

        // Cached renderers per layer
        private Dictionary<AnatomyLayer, List<Renderer>> _layerRenderers = new Dictionary<AnatomyLayer, List<Renderer>>();
        private static readonly int DitherProp = Shader.PropertyToID("_DitherFade");
        private MaterialPropertyBlock _mpb;

        public event Action<ViewerState> OnStateChanged;
        public event Action<MuscleData> OnMuscleSelected;

        void Awake()
        {
            _mpb = new MaterialPropertyBlock();
            foreach (AnatomyLayer layer in Enum.GetValues(typeof(AnatomyLayer)))
            {
                _layerRenderers[layer] = new List<Renderer>();
            }
        }

        public void RegisterRenderer(AnatomyLayer layer, Renderer rend)
        {
            if (!_layerRenderers[layer].Contains(rend))
            {
                _layerRenderers[layer].Add(rend);
            }
        }

        // =====================================================================
        // STATE TRANSITIONS
        // =====================================================================

        public void EnterNavigationState()
        {
            currentState = ViewerState.Navigation;
            selectedMuscle = null;
            ResetIsolationRenderers();
            OnStateChanged?.Invoke(currentState);
        }

        public void SetPeelingLayer(float tier)
        {
            currentState = ViewerState.Peeling;
            currentPeelTier = Mathf.Clamp(tier, 0f, 3f);

            // Update dither on all layers
            for (int i = 0; i <= 3; i++)
            {
                AnatomyLayer layer = (AnatomyLayer)i;
                float visibility = Mathf.Clamp01(currentPeelTier - i + 1f);

                foreach (var rend in _layerRenderers[layer])
                {
                    if (rend == null) continue;
                    rend.GetPropertyBlock(_mpb);
                    _mpb.SetFloat(DitherProp, visibility);
                    rend.SetPropertyBlock(_mpb);
                    rend.enabled = (visibility > 0.001f);
                }
            }
            OnStateChanged?.Invoke(currentState);
        }

        public void SelectMuscle(MuscleData muscle, Transform muscleTransform)
        {
            currentState = ViewerState.Selection;
            selectedMuscle = muscle;

            // Dim unrelated muscles to 15% dither opacity
            DimUnrelatedMuscles(muscle.structureId);

            OnMuscleSelected?.Invoke(muscle);
            OnStateChanged?.Invoke(currentState);
        }

        public void PlayKinesiologyAction(KinesiologyAction action)
        {
            currentState = ViewerState.KinesiologyAction;
            // Triggers Animator & Blendshapes
            OnStateChanged?.Invoke(currentState);
        }

        public void ToggleIsolation(bool isolate)
        {
            if (selectedMuscle == null) return;

            currentState = isolate ? ViewerState.Isolation : ViewerState.Selection;

            if (isolate)
            {
                // Isolate: Disable MeshRenderers of all objects except selected muscle and connected bones
                HashSet<string> allowedBoneIds = new HashSet<string>();
                foreach (var o in selectedMuscle.origins) allowedBoneIds.Add(o.boneId);
                foreach (var i in selectedMuscle.insertions) allowedBoneIds.Add(i.boneId);

                foreach (var pair in _layerRenderers)
                {
                    foreach (var rend in pair.Value)
                    {
                        if (rend == null) continue;
                        bool isTarget = rend.gameObject.name.Contains(selectedMuscle.structureId);
                        bool isAttachedBone = false;
                        foreach (var bId in allowedBoneIds)
                        {
                            if (rend.gameObject.name.Contains(bId)) { isAttachedBone = true; break; }
                        }
                        rend.enabled = (isTarget || isAttachedBone);
                    }
                }
            }
            else
            {
                ResetIsolationRenderers();
            }
            OnStateChanged?.Invoke(currentState);
        }

        private void DimUnrelatedMuscles(string activeStructureId)
        {
            foreach (var pair in _layerRenderers)
            {
                if (pair.Key == AnatomyLayer.Skeleton) continue;

                foreach (var rend in pair.Value)
                {
                    if (rend == null) continue;
                    bool isTarget = rend.gameObject.name.Contains(activeStructureId);
                    rend.GetPropertyBlock(_mpb);
                    _mpb.SetFloat(DitherProp, isTarget ? 1.0f : 0.15f);
                    rend.SetPropertyBlock(_mpb);
                }
            }
        }

        private void ResetIsolationRenderers()
        {
            SetPeelingLayer(currentPeelTier);
        }
    }
}
