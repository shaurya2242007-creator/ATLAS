import { useEffect, useState } from 'react'
import { MODES } from '../atlas/modes'
import type { Mode, OrbState } from '../atlas/types'

interface TopBarProps {
  mode: Mode
  orbState: OrbState
}

export function TopBar({ mode, orbState }: TopBarProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="brand-dot" />
        ATLAS_OS<sup>™</sup>
      </div>
      <div className="topbar-center">
        <span className="status-mode">{MODES[mode].label.toUpperCase()}</span>
        <span className="status-sep">•</span>
        <span className="status-state" data-state={orbState}>
          {orbState.toUpperCase()}
        </span>
      </div>
      <div className="topbar-right">{time}</div>
    </header>
  )
}
