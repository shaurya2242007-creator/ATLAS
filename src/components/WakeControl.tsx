interface WakeControlProps { enabled: boolean; supported: boolean; conversation: boolean; listening: boolean; onToggle: () => void }
export function WakeControl({ enabled, supported, conversation, listening, onToggle }: WakeControlProps) {
  const status = conversation
    ? (listening ? 'Listening… say “stop” to end' : 'In conversation… say “stop” to end')
    : enabled ? 'Say “Hey Atlas” to wake' : 'Wake word off'
  return (
    <div className={`wake ${enabled ? 'on' : ''} ${conversation ? 'convo' : ''}`}>
      <button type="button" className="wake-btn" onClick={onToggle} disabled={!supported}
        title={supported ? 'Toggle wake word' : 'Wake word needs Chrome or Edge'} aria-pressed={enabled}>
        <span className="wake-ring" />{enabled ? 'ATLAS ● LIVE' : 'WAKE WORD'}
      </button>
      <span className="wake-status">{status}</span>
    </div>
  )
}
