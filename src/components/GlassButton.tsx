interface Props { children: React.ReactNode; disabled: boolean; replay?: boolean; onClick: () => void }
export function GlassButton({ children, disabled, replay, onClick }: Props) {
  return <button className="glass-button" disabled={disabled} onClick={onClick}>
    <span>{children}</span>
    {replay ? <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8a8 8 0 1 1-1 8M5 3v5h5" /></svg> :
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>}
  </button>;
}
