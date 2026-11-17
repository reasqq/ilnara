import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { createCinematicState, chapters } from '../experience/story';

export function useSceneController(ready: boolean, reduced: boolean) {
  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');
  const copy = useRef<HTMLDivElement>(null);
  const model = useRef(createCinematicState());
  const locked = useRef(true);
  const current = useRef(0);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);

  const unlock = useCallback(() => {
    if (!mounted.current) return;
    clearTimeout(watchdog.current);
    locked.current = false;
    setPhase('idle');
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      timeline.current?.kill();
      clearTimeout(watchdog.current);
    };
  }, []);

  useEffect(() => { model.current.reduced = reduced; }, [reduced]);

  // One timeline owns entry, exit, text, camera and particle state. No competing tweens.
  useEffect(() => {
    if (!ready || !copy.current) return;
    locked.current = true;
    setPhase('enter');
    const el = copy.current;
    const lines = el.querySelectorAll('.text-line');
    const ornament = el.querySelector('.chapter-label');
    const button = el.querySelector('button');
    const duration = reduced ? 0.25 : scene === 4 ? 3.8 : scene === 0 ? 3.2 : 1.65;
    timeline.current?.kill();
    gsap.set(el, { opacity: 1, y: 0 });
    gsap.set([ornament, ...lines, button], { opacity: 0, y: reduced ? 0 : 14, filter: reduced ? 'none' : 'blur(7px)' });
    const tl = gsap.timeline({ onComplete: () => {
      unlock();
      if (current.current !== 0) el.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    } });
    timeline.current = tl;
    tl.to(model.current, { reveal: 1, camera: scene === 4 ? 5.3 : 5.8, light: scene === 4 ? 1.25 : 1, duration, ease: 'power2.out' }, 0)
      .to(ornament, { opacity: 1, y: 0, filter: 'blur(0px)', duration: reduced ? 0.15 : 0.8 }, reduced ? 0 : duration * 0.35)
      .to(lines, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: reduced ? 0 : 0.22, duration: reduced ? 0.18 : 1.1, ease: 'power3.out' }, reduced ? 0 : duration * 0.46)
      .to(button, { opacity: 1, y: 0, filter: 'blur(0px)', duration: reduced ? 0.15 : 0.7, ease: 'power2.out' }, reduced ? 0.12 : duration - 0.5);
    // If a browser throttles or interrupts the timeline, the story remains usable.
    watchdog.current = setTimeout(() => {
      tl.progress(1);
      unlock();
    }, (duration + 2) * 1000);
    return () => { tl.kill(); clearTimeout(watchdog.current); };
  }, [scene, ready, reduced, unlock]);

  const next = useCallback(() => {
    if (locked.current || !ready) return;
    locked.current = true;
    setPhase('exit');
    const previous = current.current;
    const target = (previous + 1) % chapters.length;
    const state = model.current;
    state.from = previous;
    state.to = target;
    state.morph = 0;
    timeline.current?.kill();
    clearTimeout(watchdog.current);
    const finish = () => {
      if (!mounted.current) return;
      state.from = target;
      state.to = target;
      state.morph = 1;
      state.reveal = target === 0 || target === 4 ? 0 : 0.8;
      current.current = target;
      setScene(target);
    };
    const duration = reduced ? 0.18 : 1.65;
    const tl = gsap.timeline({ onComplete: finish });
    timeline.current = tl;
    tl.to(copy.current, { opacity: 0, y: reduced ? 0 : -12, duration: reduced ? 0.1 : 0.5, ease: 'power2.in' }, 0)
      .to(state, { light: 1.8, duration: duration * 0.3, ease: 'sine.out' }, 0)
      .to(state, { morph: 1, camera: reduced ? state.camera : 4.8, duration, ease: 'power2.inOut' }, 0)
      .to(state, { light: target === 4 ? 0.15 : 0.75, duration: duration * 0.6 }, duration * 0.4);
    watchdog.current = setTimeout(() => { tl.progress(1); }, (duration + 2) * 1000);
  }, [ready, reduced]);

  return { scene, phase, copy, model, next };
}
