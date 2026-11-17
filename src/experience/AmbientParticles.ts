import * as THREE from 'three';
import { seededRandom } from './geometry';

export function createAmbientParticles(count: number) {
  const random = seededRandom(22);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions.set([(random() - 0.5) * 15, (random() - 0.5) * 11, (random() - 0.5) * 9], i * 3);
    seeds[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 0.5 }, uReduced: { value: 0 } },
    vertexShader: `
      attribute float aSeed;
      uniform float uTime, uPixelRatio, uReduced;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.06 + aSeed * 25.0) * 0.22 * (1.0 - uReduced);
        p.y += sin(uTime * 0.1 + aSeed * 15.0) * 0.15 * (1.0 - uReduced);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp((1.0 + pow(aSeed, 12.0) * 24.0) * uPixelRatio * 5.0 / -mv.z, 1.0, 30.0);
        vAlpha = 0.12 + aSeed * 0.4;
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        gl_FragColor = vec4(0.76, 0.39, 0.53, exp(-d * d * 5.0) * vAlpha * uOpacity);
      }
    `,
  });
  return { points: new THREE.Points(geometry, material), material, geometry };
}
