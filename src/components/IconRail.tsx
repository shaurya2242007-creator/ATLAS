import { MODE_ORDER, MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

interface IconRailProps {
  mode: Mode
  onMode: (m: Mode) => void
}

const MODE_ICON: Record<Mode, string> = {
  quick: '⚡',
  deep: '🔎',
  visual: '◈',
}

export function IconRail({ mode, onMode }: IconRailProps) {
  return (
    <nav className="icon-rail" aria-label="ATLAS navigation">
      <div className="rail-logo" title="ATLAS" aria-hidden="true">
        ◆
      </div>

      {MODE_ORDER.map((m) => {
        const cfg = MODES[m]
        const active = mode === m
        return (
          <button
            key={m}
            type="button"
            className={`rail-btn ${active ? 'active' : ''}`}
            title={`${cfg.label} mode (${cfg.hotkey})`}
            aria-label={`${cfg.label} mode`}
            aria-pressed={active}
            onClick={() => onMode(m)}
            style={active ? { borderColor: cfg.colorB, boxShadow: `0 0 18px ${cfg.colorB}66` } : undefined}
          >
            {MODE_ICON[m]}
          </button>
        )
      })}

      <div className="rail-spacer" />

      <button type="button" className="rail-btn decorative" title="Memory (coming soon)" aria-label="Memory (coming soon)">
        ▤
      </button>
      <button type="button" className="rail-btn decorative" title="Settings (coming soon)" aria-label="Settings (coming soon)">
        ⚙
      </button>
    </nav>
  )
}
