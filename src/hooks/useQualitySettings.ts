import { useEffect, useState } from 'react';

export type Quality = 'high' | 'medium' | 'low';
export const QUALITY = {
  high: { count: 18000, ambient: 1100, dpr: 1.75 },
  medium: { count: 10000, ambient: 650, dpr: 1.35 },
  low: { count: 4500, ambient: 300, dpr: 1 },
};

export function initialQuality(): Quality {
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (device.connection?.saveData || (device.deviceMemory ?? 8) <= 2 || navigator.hardwareConcurrency <= 2) return 'low';
  return matchMedia('(pointer: coarse)').matches || (device.deviceMemory ?? 8) <= 4 ? 'medium' : 'high';
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}
