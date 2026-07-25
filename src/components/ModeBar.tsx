import { MODE_ORDER, MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

interface ModeBarProps {
  mode: Mode
  onMode: (m: Mode) => void
}

export function ModeBar({ mode, onMode }: ModeBarProps) {
  return (
    <div className="mode-bar" role="group" aria-label="Response mode">
      {MODE_ORDER.map((m) => {
        const cfg = MODES[m]
        const active = mode === m
        return (
          <button
            key={m}
            type="button"
            aria-pressed={active}
            aria-label={`${cfg.label} mode (hotkey ${cfg.hotkey})`}
            className={`mode-chip ${active ? 'active' : ''}`}
            onClick={() => onMode(m)}
            style={
              active
                ? {
                    borderColor: cfg.colorB,
                    background: `linear-gradient(135deg, ${cfg.colorA}22, ${cfg.colorB}22)`,
                    boxShadow: `0 0 22px ${cfg.colorB}55`,
                  }
                : undefined
            }
          >
            <span className="chip-dot" style={{ background: `linear-gradient(135deg, ${cfg.colorA}, ${cfg.colorB})` }} />
            <span className="chip-label">{cfg.label}</span>
          </button>
        )
      })}
    </div>
  )
}
