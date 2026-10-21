Shader "AnatoMe/CozyToonSurface"
{
    Properties
    {
        [Header(Color and Lighting Ramp)]
        _BaseColor ("Base Color", Color) = (0.95, 0.62, 0.56, 1.0)
        _ShadowColor ("Pastel Shadow Color", Color) = (0.85, 0.49, 0.42, 1.0)
        _RampSmoothness ("Ramp Softness", Range(0.01, 0.6)) = 0.28
        _RampOffset ("Ramp Offset", Range(-1.0, 1.0)) = 0.05

        [Header(Inter-Muscular Crevice and Inner Cuts)]
        _CreviceColor ("Crevice Darkening Tint", Color) = (0.55, 0.24, 0.20, 1.0)
        _CreviceDepth ("Crevice Strength", Range(0.0, 1.0)) = 0.45

        [Header(Fake SSS and Fresnel Glow)]
        _FresnelColor ("Fresnel / SSS Tint", Color) = (1.0, 0.92, 0.88, 1.0)
        _FresnelPower ("Fresnel Exponent", Range(0.5, 8.0)) = 2.8
        _FresnelIntensity ("Fresnel Intensity", Range(0.0, 2.0)) = 0.85

        [Header(Screen Door Dither Opacity)]
        _DitherFade ("Layer Peeling Visibility", Range(0.0, 1.0)) = 1.0

        [Header(Inverted Hull Outline)]
        _OutlineColor ("Outline Color (Darkened Tint)", Color) = (0.65, 0.31, 0.25, 1.0)
        _OutlineWidth ("Outline Width", Range(0.0005, 0.015)) = 0.003
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
        // PASS 1: TINTED INVERTED HULL OUTLINE
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
                float3 positionWS = TransformObjectToWorld(input.positionOS.xyz) + normalWS * _OutlineWidth;
                output.positionCS = TransformWorldToHClip(positionWS);
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
        // PASS 2: COZY TOON SURFACE + CREVICE + SSS
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
                // 1. Screen-Door Dithered Opacity Clipping (Zero mobile sorting glitches)
                int2 screenPixel = int2(input.positionCS.xy) % 4;
                float threshold = bayer4x4[screenPixel.y * 4 + screenPixel.x];
                clip(_DitherFade - threshold - 0.001);

                // 2. Vectors
                float3 normalWS = normalize(input.normalWS);
                Light mainLight = GetMainLight();
                float3 lightDirWS = normalize(mainLight.direction);
                float3 viewDirWS = normalize(GetCameraPositionWS() - input.positionWS);

                // 3. Smooth 2-Tone Half-Lambert Ramp
                float NdotL = dot(normalWS, lightDirWS);
                float halfLambert = NdotL * 0.5 + 0.5;
                float rampFactor = smoothstep(_RampOffset, _RampOffset + _RampSmoothness, halfLambert);
                float3 surfaceColor = lerp(_ShadowColor.rgb, _BaseColor.rgb, rampFactor);

                // 4. Subtle Inter-Muscular Crevice / Curvature Darkening
                float curvature = length(fwidth(normalWS)) * 0.5;
                float creviceFactor = saturate(curvature * _CreviceDepth);
                surfaceColor = lerp(surfaceColor, _CreviceColor.rgb, creviceFactor);

                // 5. Pastel SSS Fresnel Glow
                float NdotV = 1.0 - saturate(dot(normalWS, viewDirWS));
                float fresnel = pow(NdotV, _FresnelPower) * _FresnelIntensity;
                float3 rimGlow = _FresnelColor.rgb * fresnel;

                // 6. Final Color Blend
                float3 finalColor = (surfaceColor * mainLight.color.rgb) + rimGlow;
                return half4(finalColor, 1.0);
            }
            ENDHLSL
        }

        // ========================================================
        // PASS 3: SHADOW CASTER (Supports Dither Dissolve)
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
