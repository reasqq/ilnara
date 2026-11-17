// The same sculpted silhouette, pre-rendered as SVG points: no canvas or GPU required.
export function FallbackArt({ scene }: { scene: number }) {
  return <div className={`fallback-art fallback-art--${scene + 1}`} aria-hidden="true">
    <img src={`${import.meta.env.BASE_URL}heart-fallback.svg`} alt="" />
    {scene === 2 && <><img className="satellite satellite-one" src={`${import.meta.env.BASE_URL}heart-fallback.svg`} alt="" /><img className="satellite satellite-two" src={`${import.meta.env.BASE_URL}heart-fallback.svg`} alt="" /></>}
  </div>;
}
