import { writeFileSync } from 'node:fs';
let seed = 7319;
const random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let points = '';
for (let i = 0; i < 2800; i++) {
  const t = random() * Math.PI * 2;
  const r = random() > 0.35 ? 0.86 + random() * 0.14 : Math.sqrt(random());
  const x = 250 + 16 * Math.sin(t) ** 3 * 12 * r;
  const y = 230 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 12 * r;
  points += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.4 + random() * 1.2).toFixed(1)}" opacity="${(0.2 + random() * 0.65).toFixed(2)}"/>`;
}
writeFileSync(new URL('../public/heart-fallback.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><defs><radialGradient id="g"><stop stop-color="#71304c" stop-opacity=".25"/><stop offset="1" stop-color="#71304c" stop-opacity="0"/></radialGradient></defs><ellipse cx="250" cy="240" rx="250" ry="240" fill="url(#g)"/><g fill="#edb4cc">${points}</g></svg>`);
