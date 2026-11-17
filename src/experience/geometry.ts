import * as THREE from 'three';

export function seededRandom(seed = 7319) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

export function heartPoint(angle: number, radius: number, depth: number): [number, number, number] {
  const x = 16 * Math.sin(angle) ** 3 / 15;
  const y = (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 15;
  return [x * radius, (y + 0.12) * radius, depth * Math.sqrt(Math.max(0, 1 - radius * radius)) * 0.68];
}

export function createParticleGeometry(count: number) {
  const random = seededRandom();
  const geometry = new THREE.BufferGeometry();
  const targets = Array.from({ length: 5 }, () => new Float32Array(count * 3));
  const scatter = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const clusters = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const smallHearts = [[-1.1, 0.7, -0.8, 0.4], [0.9, 0.1, 0.2, 0.53], [-0.55, -0.65, 0.6, 0.27], [0.72, 1.1, -1.3, 0.23]];
  const color = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const t = random() * Math.PI * 2;
    const shell = random() > 0.32;
    const r = shell ? 0.87 + random() * 0.13 : Math.sqrt(random()) * 0.95;
    const p = heartPoint(t, r, (random() - 0.5) * 2);
    seeds[i] = random();
    clusters[i] = i % 4;
    sizes[i] = 0.65 + random() ** 3 * 2.5;
    color.setRGB(0.52 + seeds[i] * 0.45, 0.13 + seeds[i] * 0.37, 0.24 + seeds[i] * 0.39);
    color.toArray(colors, i * 3);
    targets[0].set(p, i * 3);
    // An open, lens-like constellation. The center stays airy.
    const spiral = t + r * 5;
    const spread = 0.65 + random() * 2.3;
    targets[1].set([Math.cos(spiral) * spread * 1.25, Math.sin(spiral) * spread * 0.72, (random() - 0.5) * 4], i * 3);
    const small = smallHearts[i % 4];
    targets[2].set([p[0] * small[3] + small[0], p[1] * small[3] + small[1], p[2] * small[3] + small[2]], i * 3);
    const bud = i % 3 === 0 ? 0.36 : 0.065;
    targets[3].set([p[0] * bud, p[1] * bud, p[2] * bud], i * 3);
    targets[4].set([p[0] * 1.14, p[1] * 1.14, p[2] * 1.22], i * 3);
    const distance = 2.0 + random() * 3;
    scatter.set([Math.cos(t + r * 4) * distance, Math.sin(t + r * 4) * distance * 0.7, (random() - 0.5) * 6], i * 3);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(targets[0], 3));
  targets.forEach((target, i) => geometry.setAttribute(`aTarget${i}`, new THREE.BufferAttribute(target, 3)));
  geometry.setAttribute('aScatter', new THREE.BufferAttribute(scatter, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aCluster', new THREE.BufferAttribute(clusters, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}
