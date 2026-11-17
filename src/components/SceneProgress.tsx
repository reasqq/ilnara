import { chapters } from '../experience/story';
export function SceneProgress({ scene }: { scene: number }) {
  return <div className="scene-progress" role="img" aria-label={`Мгновение ${scene + 1} из 5`}>
    {chapters.map((_, i) => <span key={i} className={i === scene ? 'active' : i < scene ? 'visited' : ''} />)}
  </div>;
}
