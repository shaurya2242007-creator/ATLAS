import { useEffect, useState } from 'react'

export function BootOverlay() {
  const [done, setDone] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 2600)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div className={`boot ${done ? 'boot-done' : ''}`} aria-hidden="true">
      <div className="boot-inner">
        <div className="boot-mark">ATLAS</div>
        <div className="boot-sub">INITIALIZING RESEARCH INTELLIGENCE</div>
        <div className="boot-bar"><span /></div>
      </div>
    </div>
  )
}
