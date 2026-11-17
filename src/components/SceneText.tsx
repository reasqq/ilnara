import type { RefObject } from 'react';
import { chapters } from '../experience/story';
import { GlassButton } from './GlassButton';

export function SceneText({ scene, disabled, containerRef, onNext }: {
  scene: number; disabled: boolean; containerRef: RefObject<HTMLDivElement | null>; onNext: () => void;
}) {
  const chapter = chapters[scene];
  return <div ref={containerRef} className={`scene-copy scene-copy--${scene + 1}`}>
    <p className="chapter-label"><span />{chapter.label}<span /></p>
    <h1 tabIndex={-1} aria-label={chapter.lines.join(' ')}>
      {chapter.lines.map((line, i) => <span className={`text-line text-line--${i + 1}`} aria-hidden="true" key={line}>{line}</span>)}
    </h1>
    <GlassButton disabled={disabled} replay={scene === 4} onClick={onNext}>{chapter.button}</GlassButton>
  </div>;
}
