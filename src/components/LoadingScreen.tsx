export function LoadingScreen({ onContinue }: { onContinue: () => void }) {
  return <div className="loading-screen" role="status">
    <span className="loading-spark" aria-hidden="true" />
    <p>Для тебя…</p>
    <button onClick={onContinue}>Открыть в мягком свете</button>
  </div>;
}
