import { useCallback, useEffect, useRef, useState } from 'react'
import { Scene } from './components/Scene'
import { Sidebar } from './components/Sidebar'
import { ModeBar } from './components/ModeBar'
import { ChatPanel } from './components/ChatPanel'
import { BootOverlay } from './components/BootOverlay'
import { WakeControl } from './components/WakeControl'
import { useChat } from './hooks/useChat'
import { useVoice } from './hooks/useVoice'
import { useWakeWord } from './hooks/useWakeWord'
import { useHotkeys } from './hooks/useHotkeys'
import { MODES } from './atlas/modes'
import type { Mode, OrbState } from './atlas/types'

export default function App() {
  const [mode, setMode] = useState<Mode>('quick')
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const voice = useVoice({ setOrbState })
  const chat = useChat({ mode, useSearch: mode === 'deep', setOrbState, voiceEnabled: voice.enabled,
    onAssistantComplete: (text: string) => { if (voice.enabled) voice.speak(text) } })
  const handleSend = useCallback((text: string) => { voice.stopSpeaking(); voice.stopDictation(); chat.send(text) }, [chat.send, voice.stopSpeaking, voice.stopDictation])
  const handleStop = useCallback(() => { chat.stop(); voice.stopSpeaking(); voice.stopDictation() }, [chat.stop, voice.stopSpeaking, voice.stopDictation])
  useHotkeys({ onMode: setMode, onStop: handleStop, onToggleVoice: voice.toggleEnabled })
  useEffect(() => { if (voice.listening) setOrbState('listening'); else setOrbState((s) => (s === 'listening' ? 'idle' : s)) }, [voice.listening])
  useEffect(() => { const cfg = MODES[mode]; document.documentElement.style.setProperty('--accent', cfg.colorB); document.documentElement.style.setProperty('--accent-a', cfg.colorA) }, [mode])

  const [wakeEnabled, setWakeEnabled] = useState(false)
  const [conversation, setConversation] = useState(false)
  const conversationRef = useRef(false); conversationRef.current = conversation
  const capturingRef = useRef(false)
  const GREETING = 'So, what do you want to cook now? Ready for cooking something like that?'

  const wake = useWakeWord({
    enabled: wakeEnabled, paused: conversation, phrases: ['atlas', 'wake up'],
    onWake: () => { if (conversationRef.current) return; setConversation(true); voice.speak(GREETING) },
  })

  const toggleWake = useCallback(() => {
    setWakeEnabled((v) => {
      const next = !v
      if (next && !voice.enabled) voice.toggleEnabled()
      if (!next) setConversation(false)
      return next
    })
  }, [voice.enabled, voice.toggleEnabled])

  useEffect(() => {
    if (!conversation || chat.isLoading || voice.listening || orbState === 'speaking' || capturingRef.current) return
    let cancelled = false
    capturingRef.current = true
    const run = async () => {
      await new Promise((r) => setTimeout(r, 350))
      if (cancelled || !conversationRef.current) { capturingRef.current = false; return }
      const text = (await voice.captureUtterance()).trim()
      capturingRef.current = false
      if (cancelled || !conversationRef.current || !text) return
      if (/\bstop\b/i.test(text)) { setConversation(false); voice.speak('Okay, stopping. Call me when you need me.'); return }
      handleSend(text)
    }
    run()
    return () => { cancelled = true }
  }, [conversation, chat.isLoading, voice.listening, orbState, handleSend])

  return (
    <div className="app">
      <BootOverlay />
      <div className="scene-layer"><Scene mode={mode} orbState={orbState} level={voice.level} satelliteCount={Math.min(4, chat.topics.length)} /></div>
      <div className="hud">
        <WakeControl enabled={wakeEnabled} supported={wake.supported} conversation={conversation} listening={voice.listening} onToggle={toggleWake} />
        <Sidebar mode={mode} onMode={setMode} knowledgeCount={chat.topics.length} />
        <ChatPanel messages={chat.messages} isLoading={chat.isLoading} mode={mode} voiceEnabled={voice.enabled} listening={voice.listening}
          supportsSTT={voice.supportsSTT} sources={chat.sources} topics={chat.topics} onSend={handleSend} onStop={handleStop}
          onToggleVoice={voice.toggleEnabled} startDictation={voice.startDictation} stopDictation={voice.stopDictation} />
        <ModeBar mode={mode} onMode={setMode} />
      </div>
    </div>
  )
}
