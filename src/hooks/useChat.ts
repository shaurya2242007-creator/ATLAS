import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, Mode, MessageSource, OrbState, Source, Topic } from '../atlas/types'

let idCounter = 0
const nextId = () => `m${++idCounter}`
const TOPICS_KEY = 'atlas.topics'

function clientDemo(question: string, mode: Mode): string {
  const q = (question || 'your question').trim().slice(0, 300)
  return `[ATLAS · offline demo mode — ${mode.toUpperCase()}]\n\nI couldn't reach the ATLAS backend, so this is a local demo reply. On "${q}", reason from mechanism rather than memory: isolate the few variables that drive the outcome and test them against the case where intuition fails.\n\nCross-domain connection: like compound interest, small daily corrections to a mental model outrun rare heroic study sessions.`
}
function deriveTopic(text: string): string {
  const cleaned = text.replace(/[`*_#>[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
  const words = cleaned.split(' ').filter(Boolean).slice(0, 5).join(' ')
  const label = words.length > 30 ? words.slice(0, 30) + '…' : words
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : ''
}
function loadTopics(): Topic[] {
  try { const raw = localStorage.getItem(TOPICS_KEY); const arr = raw ? JSON.parse(raw) : []; return Array.isArray(arr) ? arr : [] } catch { return [] }
}

interface UseChatOptions {
  mode: Mode; useSearch: boolean; setOrbState: (s: OrbState) => void; voiceEnabled: boolean
  onAssistantComplete?: (text: string) => void
}

export function useChat({ mode, useSearch, setOrbState, voiceEnabled, onAssistantComplete }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sources, setSources] = useState<Source[]>([])
  const [topics, setTopics] = useState<Topic[]>(() => loadTopics())

  const messagesRef = useRef<ChatMessage[]>([]); messagesRef.current = messages
  const modeRef = useRef(mode); modeRef.current = mode
  const useSearchRef = useRef(useSearch); useSearchRef.current = useSearch
  const voiceEnabledRef = useRef(voiceEnabled); voiceEnabledRef.current = voiceEnabled
  const onCompleteRef = useRef(onAssistantComplete); onCompleteRef.current = onAssistantComplete
  const abortRef = useRef<AbortController | null>(null)
  const typewriterRef = useRef<number | null>(null)

  const stopTypewriter = useCallback(() => {
    if (typewriterRef.current !== null) { window.clearInterval(typewriterRef.current); typewriterRef.current = null }
  }, [])
  const finalizeStreaming = useCallback(() => {
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, content: m.full ?? m.content, streaming: false } : m)))
  }, [])
  const stop = useCallback(() => {
    abortRef.current?.abort(); abortRef.current = null; stopTypewriter(); finalizeStreaming(); setIsLoading(false); setOrbState('idle')
  }, [finalizeStreaming, setOrbState, stopTypewriter])

  const addTopic = useCallback((label: string) => {
    if (!label) return
    setTopics((prev) => {
      const filtered = prev.filter((t) => t.label.toLowerCase() !== label.toLowerCase())
      const next = [{ id: nextId(), label, ts: Date.now() }, ...filtered].slice(0, 6)
      try { localStorage.setItem(TOPICS_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    stopTypewriter(); finalizeStreaming()
    addTopic(deriveTopic(trimmed))
    const userMsg: ChatMessage = { id: nextId(), role: 'user', content: trimmed }
    const history = [...messagesRef.current, userMsg].map((m) => ({ role: m.role, content: m.full ?? m.content }))
    setMessages((prev) => [...prev, userMsg]); setIsLoading(true); setOrbState('thinking')
    const controller = new AbortController(); abortRef.current = controller
    let payload: { text: string; source: MessageSource; sources?: Source[]; research?: ChatMessage['research'] } | null = null
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, mode: modeRef.current, useSearch: useSearchRef.current }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`chat ${res.status}`)
      const json = await res.json()
      const responseSources = Array.isArray(json?.sources) ? json.sources : []
      const research = json?.research && Array.isArray(json.research?.subQueries) ? json.research : undefined
      setSources(responseSources)
      payload = { text: String(json?.text ?? '').trim() || clientDemo(trimmed, modeRef.current), source: json?.source === 'live' ? 'live' : 'demo', sources: responseSources, research }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return
      payload = { text: clientDemo(trimmed, modeRef.current), source: 'demo' }
    }
    abortRef.current = null; setIsLoading(false)
    if (!payload) { setOrbState('idle'); return }
    const assistantId = nextId(); const full = payload.text; const source = payload.source
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', full, source, streaming: true, sources: payload.sources, research: payload.research }])
    setOrbState('speaking')
    const totalMs = Math.min(3000, Math.max(1400, full.length * 10)); const start = performance.now()
    stopTypewriter()
    typewriterRef.current = window.setInterval(() => {
      const ratio = Math.min(1, (performance.now() - start) / totalMs)
      const chars = Math.floor(full.length * ratio)
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full.slice(0, chars) } : m)))
      if (ratio >= 1) {
        stopTypewriter()
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full, streaming: false } : m)))
        onCompleteRef.current?.(full)
        if (!voiceEnabledRef.current) setOrbState('idle')
      }
    }, 40)
  }, [isLoading, finalizeStreaming, setOrbState, stopTypewriter, addTopic])

  const clear = useCallback(() => { stop(); setMessages([]); setSources([]) }, [stop])

  useEffect(() => () => { if (typewriterRef.current !== null) window.clearInterval(typewriterRef.current); abortRef.current?.abort() }, [])

  return { messages, isLoading, send, stop, clear, sources, topics }
}
