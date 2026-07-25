import { useEffect, useRef } from 'react'

function getSR(): any {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

interface Opts { enabled: boolean; paused: boolean; phrases: string[]; onWake: () => void }

export function useWakeWord({ enabled, paused, phrases, onWake }: Opts) {
  const recRef = useRef<any>(null)
  const activeRef = useRef(false)
  const restartTimer = useRef<number | null>(null)
  const onWakeRef = useRef(onWake); onWakeRef.current = onWake
  const phrasesRef = useRef(phrases); phrasesRef.current = phrases

  useEffect(() => {
    const SR = getSR()
    const shouldRun = enabled && !paused && !!SR
    const stop = () => {
      activeRef.current = false
      if (restartTimer.current !== null) { window.clearTimeout(restartTimer.current); restartTimer.current = null }
      if (recRef.current) { try { recRef.current.onend = null; recRef.current.onerror = null; recRef.current.onresult = null; recRef.current.stop() } catch { /* ignore */ } recRef.current = null }
    }
    if (!shouldRun) { stop(); return }
    let cancelled = false
    const start = () => {
      if (cancelled || recRef.current) return
      const rec = new SR()
      rec.lang = 'en-US'; rec.continuous = true; rec.interimResults = true
      rec.onresult = (e: any) => {
        let text = ''
        for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript
        const t = text.toLowerCase()
        if (phrasesRef.current.some((p) => t.includes(p))) onWakeRef.current()
      }
      rec.onend = () => { recRef.current = null; if (!cancelled && activeRef.current) restartTimer.current = window.setTimeout(start, 400) }
      rec.onerror = () => { /* onend follows; restart handled there */ }
      recRef.current = rec
      activeRef.current = true
      try { rec.start() } catch { /* retry via onend */ }
    }
    start()
    return () => { cancelled = true; stop() }
  }, [enabled, paused])

  return { supported: !!getSR() }
}
