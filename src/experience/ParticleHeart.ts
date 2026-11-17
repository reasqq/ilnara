import * as THREE from 'three';
import { createParticleGeometry } from './geometry';

export function createParticleHeart(count: number) {
  const geometry = createParticleGeometry(count);
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    uniforms: {
      uTime: { value: 0 }, uFrom: { value: 0 }, uTo: { value: 0 }, uMorph: { value: 1 },
      uReveal: { value: 0 }, uLight: { value: 1 }, uPixelRatio: { value: 1 }, uReduced: { value: 0 },
    },
    vertexShader: `
      attribute vec3 aTarget0, aTarget1, aTarget2, aTarget3, aTarget4, aScatter;
      attribute float aSeed, aSize, aCluster;
      uniform float uTime, uFrom, uTo, uMorph, uReveal, uPixelRatio, uReduced;
      varying vec3 vColor;
      varying float vAlpha;
      vec3 target(float scene) {
        if (scene < 0.5) return aTarget0;
        if (scene < 1.5) return aTarget1;
        if (scene < 2.5) return aTarget2;
        if (scene < 3.5) return aTarget3;
        return aTarget4;
      }
      void main() {
        float m = smoothstep(aSeed * 0.16, 0.82 + aSeed * 0.18, uMorph);
        vec3 p = mix(target(uFrom), target(uTo), m);
        float wave = sin(uMorph * 3.14159265) * (1.0 - uReduced);
        p += aScatter * wave * 0.28;
        float assembly = smoothstep(aSeed * 0.28, 0.74 + aSeed * 0.26, uReveal);
        float opening = uTo > 3.5 ? 0.65 : 1.0;
        p = mix(aScatter * opening, p, assembly);
        float motion = 1.0 - uReduced;
        float smallHearts = mix(uFrom == 2.0 ? 1.0 : 0.0, uTo == 2.0 ? 1.0 : 0.0, m);
        p.y += sin(uTime * (0.18 + aCluster * 0.055) + aCluster * 2.0) * 0.06 * smallHearts * motion;
        p.z += sin(uTime * 0.15 + aCluster) * 0.08 * smallHearts * motion;
        p *= 1.0 + sin(uTime * 1.45) * 0.012 * motion;
        float rot = sin(uTime * 0.16) * 0.13 * motion;
        p.xz = mat2(cos(rot), -sin(rot), sin(rot), cos(rot)) * p.xz;
        p += vec3(sin(uTime * 0.35 + aSeed * 40.0), cos(uTime * 0.3 + aSeed * 20.0), sin(uTime * 0.2 + aSeed * 60.0)) * 0.009 * motion;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(aSize * uPixelRatio * 15.0 / -mv.z, 1.0, 15.0);
        vColor = color;
        float scatterDim = mix(1.0, 0.32, step(0.5, uTo) * (1.0 - step(1.5, uTo)));
        float coreDim = mix(1.0, 0.15, step(2.5, uTo) * (1.0 - step(3.5, uTo)));
        vAlpha = (0.48 + 0.24 * sin(aSeed * 80.0 + uTime * motion * 0.7)) * scatterDim * coreDim;
        vAlpha *= smoothstep(0.0, 0.22, uReveal) * (0.45 + assembly * 0.55);
      }
    `,
    fragmentShader: `
      uniform float uLight;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float core = exp(-d * d * 20.0);
        float halo = exp(-d * d * 4.5) * 0.25;
        gl_FragColor = vec4(vColor, (core + halo) * vAlpha * uLight);
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, material, geometry };
}
