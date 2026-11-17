import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { createParticleHeart } from './ParticleHeart';
import { createAmbientParticles } from './AmbientParticles';
import { initialQuality, QUALITY, type Quality } from '../hooks/useQualitySettings';
import type { CinematicState } from './story';

export default function ExperienceCanvas({ model, onReady, onFailure }: {
  model: RefObject<CinematicState>; onReady: () => void; onFailure: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch { onFailure(); return; }
    renderer.setClearColor(0x0b080d, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    let quality: Quality = initialQuality();
    const heart = createParticleHeart(QUALITY[quality].count);
    const ambient = createAmbientParticles(QUALITY[quality].ambient);
    scene.add(heart.points, ambient.points);
    let width = 1, height = 1, landscape = false;
    let stopped = false, firstFrame = true, previous = 0, elapsed = 0, slowFrames = 0, sampleFrames = 0;
    let pointerX = 0, pointerY = 0;
    const updateQuality = () => {
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, QUALITY[quality].dpr));
      heart.geometry.setDrawRange(0, Math.min(heart.geometry.getAttribute('position').count, QUALITY[quality].count));
      ambient.geometry.setDrawRange(0, Math.min(ambient.geometry.getAttribute('position').count, QUALITY[quality].ambient));
      heart.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      ambient.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      host.dataset.quality = quality;
    };
    const resize = () => {
      width = host.clientWidth; height = host.clientHeight;
      landscape = width / height > 1.4 && height < 600;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateQuality();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || model.current.reduced) return;
      pointerX = (event.clientX / width - 0.5) * 0.06;
      pointerY = (event.clientY / height - 0.5) * 0.035;
    };
    window.addEventListener('pointermove', move, { passive: true });
    const frame = (now: number) => {
      if (stopped) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.1) : 0;
      previous = now;
      elapsed += delta;
      const state = model.current;
      camera.position.z = state.camera;
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * camera.position.z;
      const viewWidth = viewHeight * camera.aspect;
      const referenceHeight = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * 5.8;
      const referenceWidth = referenceHeight * camera.aspect;
      const size = landscape ? Math.min(referenceHeight * 0.26, referenceWidth * 0.16) : Math.min(referenceWidth * 0.31, referenceHeight * 0.17);
      heart.points.scale.setScalar(size);
      heart.points.position.set(landscape ? -viewWidth * 0.255 : 0, landscape ? viewHeight * 0.025 : viewHeight * 0.135, 0);
      heart.points.rotation.y += (pointerX - heart.points.rotation.y) * 0.025;
      heart.points.rotation.x += (pointerY - heart.points.rotation.x) * 0.025;
      const u = heart.material.uniforms;
      u.uTime.value = elapsed; u.uFrom.value = state.from; u.uTo.value = state.to;
      u.uMorph.value = state.morph; u.uReveal.value = state.reveal; u.uLight.value = state.light;
      u.uReduced.value = state.reduced ? 1 : 0;
      ambient.material.uniforms.uTime.value = elapsed;
      ambient.material.uniforms.uReduced.value = state.reduced ? 1 : 0;
      const calm = state.to === 3 ? 0.12 : state.to === 1 ? 0.8 : 0.42;
      ambient.material.uniforms.uOpacity.value += (calm - ambient.material.uniforms.uOpacity.value) * 0.025;
      try { renderer.render(scene, camera); } catch { fail(); return; }
      if (firstFrame) { firstFrame = false; onReady(); }
      // Sustained frame pressure only: lower draw counts and fill rate without reallocating buffers.
      if (delta > 0 && elapsed > 5 && quality !== 'low') {
        sampleFrames++;
        if (delta > 0.027) slowFrames++;
        if (sampleFrames >= 150) {
          if (slowFrames > 80) { quality = quality === 'high' ? 'medium' : 'low'; updateQuality(); }
          sampleFrames = 0; slowFrames = 0;
        }
      }
    };
    const fail = () => { stopped = true; renderer.setAnimationLoop(null); onFailure(); };
    renderer.debug.onShaderError = fail;
    const lost = (event: Event) => { event.preventDefault(); fail(); };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    const visibility = () => {
      previous = 0;
      renderer.setAnimationLoop(document.hidden || stopped ? null : frame);
    };
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
      stopped = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      window.removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      heart.geometry.dispose(); heart.material.dispose(); ambient.geometry.dispose(); ambient.material.dispose();
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, [model, onReady, onFailure]);
  return <div className="canvas-container" ref={container} aria-hidden="true" />;
}
