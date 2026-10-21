Shader "AnatoMe/CozyToonSurface"
{
    Properties
    {
        [Header(1. Color and 2-Tone Ramp Lighting)]
        _BaseColor ("Base Color (Vinyl / Ceramic)", Color) = (0.95, 0.62, 0.56, 1.0)
        _ShadowColor ("Pastel Shadow Color (Warm Rose / Lavender)", Color) = (0.85, 0.49, 0.42, 1.0)
        _RampSmoothness ("Soft Gradient Width", Range(0.05, 0.7)) = 0.42
        _RampOffset ("Ramp Bias", Range(-1.0, 1.0)) = 0.02

        [Header(2. Soft Ambient Occlusion and Crevices)]
        _CreviceColor ("Groove / Crevice Tint", Color) = (0.58, 0.28, 0.24, 1.0)
        _CreviceDepth ("Inner Crevice Depth", Range(0.0, 1.0)) = 0.55
        _ContactAO ("Contact Shadow Depth", Range(0.0, 1.0)) = 0.4

        [Header(3. Soft Pastel Fresnel Rim Glow)]
        _FresnelColor ("Fresnel Rim Glow Tint", Color) = (1.0, 0.94, 0.90, 1.0)
        _FresnelPower ("Fresnel Wrap Exponent", Range(0.5, 6.0)) = 2.0
        _FresnelIntensity ("Fresnel Intensity", Range(0.0, 2.5)) = 1.25

        [Header(4. Screen Door Dither Opacity)]
        _DitherFade ("Layer Peeling Visibility", Range(0.0, 1.0)) = 1.0

        [Header(5. Soft Tinted Inverted Hull Outline)]
        _OutlineColor ("Softer Outline Color (Never Pure Black)", Color) = (0.66, 0.37, 0.33, 1.0)
        _OutlineWidth ("Outline Thickness (Half-Width)", Range(0.0005, 0.008)) = 0.0014
    }

    SubShader
    {
        Tags 
        { 
            "RenderType" = "Opaque" 
            "RenderPipeline" = "UniversalPipeline" 
            "Queue" = "Geometry"
        }

        // ========================================================
        // PASS 1: SOFTER, DISTANCE-ADAPTIVE INVERTED HULL OUTLINE
        // ========================================================
        Pass
        {
            Name "Outline"
            Tags { "LightMode" = "SRPDefaultUnlit" }
            Cull Front
            ZWrite On
            ZTest LEqual

            HLSLPROGRAM
            #pragma vertex vertOutline
            #pragma fragment fragOutline
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS   : NORMAL;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
            };

            CBUFFER_START(UnityPerMaterial)
                float4 _OutlineColor;
                float _OutlineWidth;
                float _DitherFade;
            CBUFFER_END

            static const float bayer4x4[16] = {
                 0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
                12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
                 3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
                15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
            };

            Varyings vertOutline(Attributes input)
            {
                Varyings output;
                float3 normalWS = TransformObjectToWorldNormal(input.normalOS);
                float3 worldPos = TransformObjectToWorld(input.positionOS.xyz);
                
                // Adaptive outline width: smoothly thins down in close-up inspection
                float dist = length(GetCameraPositionWS() - worldPos);
                float adaptiveWidth = _OutlineWidth * clamp(dist * 0.4, 0.4, 1.2);
                
                float3 extrudedWS = worldPos + normalWS * adaptiveWidth;
                output.positionCS = TransformWorldToHClip(extrudedWS);
                return output;
            }

            half4 fragOutline(Varyings input) : SV_Target
            {
                int2 screenPixel = int2(input.positionCS.xy) % 4;
                float threshold = bayer4x4[screenPixel.y * 4 + screenPixel.x];
                clip(_DitherFade - threshold - 0.001);

                return _OutlineColor;
            }
            ENDHLSL
        }

        // ========================================================
        // PASS 2: COZY TOON + CONTACT AO + CREVICE + WIDE FRESNEL
        // ========================================================
        Pass
        {
            Name "UniversalForward"
            Tags { "LightMode" = "UniversalForward" }
            Cull Back
            ZWrite On
            ZTest LEqual

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS   : NORMAL;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 positionWS : TEXCOORD0;
                float3 normalWS   : TEXCOORD1;
            };

            CBUFFER_START(UnityPerMaterial)
                float4 _BaseColor;
                float4 _ShadowColor;
                float _RampSmoothness;
                float _RampOffset;
                float4 _CreviceColor;
                float _CreviceDepth;
                float _ContactAO;
                float4 _FresnelColor;
                float _FresnelPower;
                float _FresnelIntensity;
                float _DitherFade;
            CBUFFER_END

            static const float bayer4x4[16] = {
                 0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
                12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
                 3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
                15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
            };

            Varyings vert(Attributes input)
            {
                Varyings output;
                output.positionWS = TransformObjectToWorld(input.positionOS.xyz);
                output.normalWS = TransformObjectToWorldNormal(input.normalOS);
                output.positionCS = TransformWorldToHClip(output.positionWS);
                return output;
            }

            half4 frag(Varyings input) : SV_Target
            {
                // 1. Screen-Door Dithered Opacity (Bayer Matrix)
                int2 screenPixel = int2(input.positionCS.xy) % 4;
                float threshold = bayer4x4[screenPixel.y * 4 + screenPixel.x];
                clip(_DitherFade - threshold - 0.001);

                // 2. Normal, Light & View vectors
                float3 normalWS = normalize(input.normalWS);
                Light mainLight = GetMainLight();
                float3 lightDirWS = normalize(mainLight.direction);
                float3 viewDirWS = normalize(GetCameraPositionWS() - input.positionWS);

                // 3. Wide Half-Lambert Soft Gradient Ramp (Rich Matte Plumpness)
                float NdotL = dot(normalWS, lightDirWS);
                float halfLambert = NdotL * 0.5 + 0.5;
                float ramp = smoothstep(_RampOffset, _RampOffset + _RampSmoothness, halfLambert);
                float3 surfaceColor = lerp(_ShadowColor.rgb, _BaseColor.rgb, ramp);

                // 4. Contact Ambient Occlusion (Self-Grounding & Organic Depth)
                float groundOcclusion = saturate(normalWS.y * 0.5 + 0.5);
                float ao = lerp(1.0 - _ContactAO, 1.0, groundOcclusion);
                surfaceColor *= ao;

                // 5. Inter-Muscular Crevice Groove Darkening
                float curvature = length(fwidth(normalWS)) * 0.5;
                float crevice = saturate(curvature * _CreviceDepth);
                surfaceColor = lerp(surfaceColor, _CreviceColor.rgb, crevice);

                // 6. Warm Pastel Fresnel Glow (Soft Living-Vinyl SSS)
                float NdotV = 1.0 - saturate(dot(normalWS, viewDirWS));
                float fresnel = pow(NdotV, _FresnelPower) * _FresnelIntensity;
                float3 rimGlow = _FresnelColor.rgb * fresnel;

                // 7. Final Composite
                float3 finalColor = (surfaceColor * mainLight.color.rgb) + rimGlow;
                return half4(finalColor, 1.0);
            }
            ENDHLSL
        }

        // ========================================================
        // PASS 3: SHADOW CASTER
        // ========================================================
        Pass
        {
            Name "ShadowCaster"
            Tags { "LightMode" = "ShadowCaster" }
            ZWrite On
            ZTest LEqual
            Cull Back

            HLSLPROGRAM
            #pragma vertex vertShadow
            #pragma fragment fragShadow
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS   : NORMAL;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
            };

            CBUFFER_START(UnityPerMaterial)
                float _DitherFade;
            CBUFFER_END

            static const float bayer4x4[16] = {
                 0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
                12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
                 3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
                15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
            };

            Varyings vertShadow(Attributes input)
            {
                Varyings output;
                float3 positionWS = TransformObjectToWorld(input.positionOS.xyz);
                output.positionCS = TransformWorldToHClip(positionWS);
                return output;
            }

            half4 fragShadow(Varyings input) : SV_Target
            {
                int2 screenPixel = int2(input.positionCS.xy) % 4;
                float threshold = bayer4x4[screenPixel.y * 4 + screenPixel.x];
                clip(_DitherFade - threshold - 0.001);
                return 0;
            }
            ENDHLSL
        }
    }
}
