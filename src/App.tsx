import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from './hooks/useQualitySettings';
import { useSceneController } from './hooks/useSceneController';
import { LoadingScreen } from './components/LoadingScreen';
import { SceneProgress } from './components/SceneProgress';
import { SceneText } from './components/SceneText';
import { FallbackArt } from './experience/FallbackArt';

const ExperienceCanvas = lazy(() => import('./experience/ExperienceCanvas').catch(() => ({ default: FailedCanvas })));
function FailedCanvas({ onFailure }: { onFailure: () => void }) {
  useEffect(onFailure, [onFailure]);
  return <></>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const reduced = useReducedMotion();
  const { scene, phase, copy, model, next } = useSceneController(ready, reduced);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFallback(true); setReady(true); }, []);
  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(onFailure, 7000);
    return () => clearTimeout(timeout);
  }, [ready, onFailure]);

  return <main className={`experience chapter-${scene + 1} ${reduced ? 'reduced-motion' : ''}`}
    data-scene={scene + 1} data-phase={phase} data-renderer={fallback ? 'fallback' : 'webgl'}>
    <div className="atmosphere" aria-hidden="true" />
    {fallback ? <FallbackArt scene={scene} /> : <Suspense fallback={null}>
      <ExperienceCanvas model={model} onReady={onReady} onFailure={onFailure} />
    </Suspense>}
    <div className="grain" aria-hidden="true" />
    <div className="wordmark" aria-hidden="true">ILNARA<span>A CINEMATIC LOVE EXPERIENCE</span></div>
    {ready && <>
      <SceneText scene={scene} disabled={phase !== 'idle'} containerRef={copy} onNext={next} />
      <SceneProgress scene={scene} />
    </>}
    {!ready && <LoadingScreen onContinue={onFailure} />}
  </main>;
}
