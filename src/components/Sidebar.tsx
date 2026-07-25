import type { ReactNode } from 'react'
import { MODE_ORDER, MODES } from '../atlas/modes'
import type { Mode } from '../atlas/types'

const IC: Record<string, ReactNode> = {
  zap: <polygon points="13 2 4 14 12 14 11 22 20 10 12 10" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>,
  diamond: <path d="M12 2 22 12 12 22 2 12Z" />,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="14" y2="17" /></>,
  layers: <><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>,
  bars: <><line x1="6" y1="20" x2="6" y2="14" /><line x1="12" y1="20" x2="12" y2="8" /><line x1="18" y1="20" x2="18" y2="4" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.2V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>,
}
const MODE_ICON: Record<Mode, string> = { quick: 'zap', deep: 'target', visual: 'diamond' }

function Ic({ name }: { name: string }) {
  return (
    <svg className="nav-ic" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{IC[name]}</svg>
  )
}
interface SidebarProps { mode: Mode; onMode: (m: Mode) => void; knowledgeCount?: number }

export function Sidebar({ mode, onMode, knowledgeCount = 0 }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="ATLAS navigation">
      <div className="side-logo"><span className="logo-orb" aria-hidden="true" /><span className="logo-word">ATLAS</span></div>
      <nav className="side-nav">
        {MODE_ORDER.map((m) => {
          const active = mode === m
          return (
            <button key={m} type="button" className={`nav-item ${active ? 'active' : ''}`} aria-pressed={active} onClick={() => onMode(m)}>
              <Ic name={MODE_ICON[m]} /><span className="nav-label">{MODES[m].label}</span>{active && <span className="nav-live" aria-hidden="true" />}
            </button>
          )
        })}
        <div className="nav-sep" />
        <button type="button" className="nav-item"><Ic name="file" /><span className="nav-label">Sources</span></button>
        <button type="button" className="nav-item"><Ic name="layers" /><span className="nav-label">Knowledge</span>{knowledgeCount > 0 && <span className="nav-badge">{knowledgeCount}</span>}</button>
        <button type="button" className="nav-item"><Ic name="bars" /><span className="nav-label">Analytics</span></button>
        <button type="button" className="nav-item"><Ic name="gear" /><span className="nav-label">Settings</span></button>
      </nav>
      <div className="side-status">
        <div className="ss-label">System Status</div>
        <div className="ss-row"><span className="ss-dot" aria-hidden="true" />Operational</div>
        <div className="ss-kv"><div className="ss-k">Model</div><div className="ss-v">ATLAS · Groq 70B</div></div>
        <div className="ss-kv"><div className="ss-k">Uptime</div><div className="ss-v">99.98%</div></div>
      </div>
    </aside>
  )
}
