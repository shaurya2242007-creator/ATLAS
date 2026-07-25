import { useCallback, useEffect, useRef, useState } from 'react'
import type { OrbState } from '../atlas/types'

interface UseVoiceOptions { setOrbState: (s: OrbState) => void }
function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null
}

export function useVoice({ setOrbState }: UseVoiceOptions) {
  const [enabled, setEnabled] = useState(false)
  const [listening, setListening] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const level = useRef(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const levelRafRef = useRef<number | null>(null)
  const supportsSTT = !!getSpeechRecognition()
  const toggleEnabled = useCallback(() => setEnabled((v) => !v), [])

  const stopLevelLoop = useCallback(() => {
    if (levelRafRef.current !== null) { cancelAnimationFrame(levelRafRef.current); levelRafRef.current = null }
    analyserRef.current = null; level.current = 0
  }, [])

  const cleanupAudio = useCallback(() => {
    stopLevelLoop()
    if (audioRef.current) { audioRef.current.onended = null; audioRef.current.onerror = null; audioRef.current.pause(); audioRef.current = null }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null }
  }, [stopLevelLoop])

  const stopSpeaking = useCallback(() => { cleanupAudio(); setOrbState('idle') }, [cleanupAudio, setOrbState])

  const speak = useCallback(async (text: string) => {
    const trimmed = (text || '').trim()
    if (!trimmed) { setOrbState('idle'); return }
    try {
      const res = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: trimmed }) })
      if (res.status === 204 || !res.ok) { setOrbState('idle'); return }
      const blob = await res.blob()
      if (!blob.size) { setOrbState('idle'); return }
      cleanupAudio()
      const url = URL.createObjectURL(blob); audioUrlRef.current = url
      const audio = new Audio(url); audioRef.current = audio
      try {
        const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
        if (AC) {
          if (!audioCtxRef.current) audioCtxRef.current = new AC()
          const ctx = audioCtxRef.current
          await ctx.resume().catch(() => {})
          const srcNode = ctx.createMediaElementSource(audio)
          const analyser = ctx.createAnalyser(); analyser.fftSize = 256
          srcNode.connect(analyser); analyser.connect(ctx.destination); analyserRef.current = analyser
          const data = new Uint8Array(analyser.frequencyBinCount)
          const tick = () => {
            const a = analyserRef.current; if (!a) return
            a.getByteTimeDomainData(data)
            let sum = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v }
            level.current = Math.min(1, Math.sqrt(sum / data.length) * 3.2)
            levelRafRef.current = requestAnimationFrame(tick)
          }
          levelRafRef.current = requestAnimationFrame(tick)
        }
      } catch { /* analyser optional */ }
      setOrbState('speaking')
      audio.onended = () => { cleanupAudio(); setOrbState('idle') }
      audio.onerror = () => { cleanupAudio(); setOrbState('idle') }
      await audio.play().catch(() => { cleanupAudio(); setOrbState('idle') })
    } catch { cleanupAudio(); setOrbState('idle') }
  }, [cleanupAudio, setOrbState])

  const stopDictation = useCallback(() => {
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
    recognitionRef.current = null; setListening(false)
  }, [])

  const startDictation = useCallback((onResult: (text: string) => void) => {
    const SR = getSpeechRecognition(); if (!SR) return false
    if (recognitionRef.current) { try { recognitionRef.current.stop() } catch { /* ignore */ } recognitionRef.current = null }
    const rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false
    let finalText = ''
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += chunk; else interim += chunk
      }
      onResult((finalText + interim).trim())
    }
    rec.onend = () => { recognitionRef.current = null; setListening(false) }
    rec.onerror = () => { recognitionRef.current = null; setListening(false) }
    recognitionRef.current = rec; setListening(true)
    try { rec.start() } catch { recognitionRef.current = null; setListening(false); return false }
    return true
  }, [])

  const captureUtterance = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const SR = getSpeechRecognition()
      if (!SR) { resolve(''); return }
      if (recognitionRef.current) { try { recognitionRef.current.stop() } catch { /* ignore */ } recognitionRef.current = null }
      const rec = new SR()
      rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false
      let finalText = ''
      let settled = false
      const done = (text: string) => { if (settled) return; settled = true; recognitionRef.current = null; setListening(false); resolve(text) }
      rec.onresult = (e: any) => { for (let i = e.resultIndex; i < e.results.length; i++) { if (e.results[i].isFinal) finalText += e.results[i][0].transcript } }
      rec.onend = () => done(finalText.trim())
      rec.onerror = () => done(finalText.trim())
      recognitionRef.current = rec
      setListening(true)
      try { rec.start() } catch { done('') }
    })
  }, [])

  useEffect(() => {
    return () => { cleanupAudio(); try { recognitionRef.current?.stop() } catch { /* ignore */ } }
  }, [cleanupAudio])

  return { enabled, toggleEnabled, listening, supportsSTT, speak, stopSpeaking, startDictation, stopDictation, captureUtterance, level }
}
