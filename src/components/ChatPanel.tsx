import { useEffect, useRef, useState } from 'react'
import type { ChatMessage, Mode, Source, Topic } from '../atlas/types'
import { Message } from './Message'

interface ChatPanelProps {
  messages: ChatMessage[]; isLoading: boolean; mode: Mode; voiceEnabled: boolean; listening: boolean; supportsSTT: boolean
  sources: Source[]; topics: Topic[]
  onSend: (text: string) => void; onStop: () => void; onToggleVoice: () => void
  startDictation: (onResult: (text: string) => void) => boolean; stopDictation: () => void
}
type Tab = 'chat' | 'sources' | 'knowledge'
function domainOf(url: string): string { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' } }

export function ChatPanel(props: ChatPanelProps) {
  const { messages, isLoading, mode, voiceEnabled, listening, supportsSTT, sources, topics,
    onSend, onStop, onToggleVoice, startDictation, stopDictation } = props
  // Research trace for the most recent Deep answer (sub-queries + source count).
  const lastResearch = [...messages].reverse().find((m) => m.role === 'assistant' && m.research)?.research
  const [input, setInput] = useState('')
  const [tab, setTab] = useState<Tab>('chat')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { const el = scrollRef.current; if (el && tab === 'chat') el.scrollTop = el.scrollHeight }, [messages, isLoading, tab])
  useEffect(() => { const el = inputRef.current; if (!el) return; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 120)}px` }, [input])

  const submit = () => { const text = input.trim(); if (!text || isLoading) return; setTab('chat'); onSend(text); setInput('') }
  const toggleMic = () => { if (listening) stopDictation(); else startDictation((t) => setInput(t)) }

  return (
    <aside className="chat-panel">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-title-main">You're talking to ATLAS</span>
          <span className="chat-title-sub">Adaptive Total-recall Learning &amp; Analysis System</span>
        </div>
        <button type="button" className={`voice-toggle ${voiceEnabled ? 'on' : ''}`} onClick={onToggleVoice} title="Toggle voice output (Alt+V)" aria-pressed={voiceEnabled}>
          {voiceEnabled ? '🔊' : '🔈'}<span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
        </button>
      </div>

      <div className="chat-tabs" role="tablist">
        <button className={`chat-tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>Chat</button>
        <button className={`chat-tab ${tab === 'sources' ? 'active' : ''}`} onClick={() => setTab('sources')}>Sources{sources.length ? ` (${sources.length})` : ''}</button>
        <button className={`chat-tab ${tab === 'knowledge' ? 'active' : ''}`} onClick={() => setTab('knowledge')}>Knowledge{topics.length ? ` (${topics.length})` : ''}</button>
      </div>

      {tab === 'chat' && (
        <div className="chat-messages" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="chat-empty">
              <p>Ask ATLAS anything.</p>
              <p className="chat-empty-hint"><kbd>1</kbd> Quick · <kbd>2</kbd> Deep · <kbd>3</kbd> Visual · <kbd>Esc</kbd> stop · <kbd>Alt</kbd>+<kbd>V</kbd> voice</p>
              <div className="suggestions">
                {['Analyze market trends', 'Explain quantum computing', 'Latest AI research'].map((s) => (
                  <button key={s} type="button" className="suggest-chip" onClick={() => { setTab('chat'); onSend(s) }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => <Message key={m.id} message={m} />)}
          {lastResearch && (
            <div className="research-trace">
              <span>🔎 {lastResearch.sourceCount} sources · {lastResearch.subQueries.length} searches{lastResearch.hops > 1 ? ' · +1 follow-up' : ''}</span>
              {lastResearch.subQueries.map((q, i) => <span key={i} className="rq">{q}</span>)}
            </div>
          )}
          {isLoading && <div className="thinking-row"><span>{mode === 'deep' ? 'Researching the web' : 'ATLAS is thinking'}</span><span className="dots"><span>.</span><span>.</span><span>.</span></span></div>}
        </div>
      )}

      {tab === 'sources' && (
        <div className="chat-scroll">
          {sources.length === 0 ? (
            <div className="panel-empty">Run a <strong>Deep</strong> query (press <kbd>2</kbd>) to gather cited sources.</div>
          ) : sources.map((s, i) => (
            <a key={i} className="source-card" href={/^https?:\/\//i.test(s.url) ? s.url : '#'} target="_blank" rel="noopener noreferrer">
              <div className="source-top"><span className="source-idx">{String(i + 1).padStart(2, '0')}</span><span className="source-domain">{domainOf(s.url)}</span></div>
              <div className="source-title">{s.title || 'Untitled source'}</div>
              {s.snippet && <div className="source-snippet">{s.snippet}</div>}
            </a>
          ))}
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="chat-scroll">
          {topics.length === 0 ? (
            <div className="panel-empty">Topics you explore appear here as glowing nodes — and as orbs around ATLAS.</div>
          ) : (
            <>
              <svg className="kgraph" viewBox="0 0 320 320" role="img" aria-label="Knowledge graph">
                {topics.map((t, i) => {
                  const a = (i / Math.max(1, topics.length)) * Math.PI * 2 - Math.PI / 2
                  const cx = 160, cy = 160, r = 110
                  const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r
                  return (
                    <g key={t.id}>
                      <line x1={cx} y1={cy} x2={x} y2={y} className="kgraph-edge" />
                      <circle cx={x} cy={y} r="6" className="kgraph-node" />
                      <text x={x} y={y - 12} textAnchor="middle" className="kgraph-label">{t.label}</text>
                    </g>
                  )
                })}
                <circle cx="160" cy="160" r="10" className="kgraph-core" />
                <text x="160" y="184" textAnchor="middle" className="kgraph-label kgraph-corelabel">ATLAS</text>
              </svg>
              <div className="topic-list">
                {topics.map((t) => <div key={t.id} className="topic-row"><span className="topic-dot" /><span className="topic-label">{t.label}</span></div>)}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <>
          <div className="chat-input-row">
            <button type="button" className={`mic-btn ${listening ? 'listening' : ''}`} onClick={toggleMic} disabled={!supportsSTT}
              title={supportsSTT ? (listening ? 'Stop dictation' : 'Dictate') : 'Speech recognition not supported in this browser'} aria-pressed={listening}>🎙</button>
            <textarea ref={inputRef} className="chat-input" aria-label="Message ATLAS" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }} placeholder="Message ATLAS…" rows={1} />
            {isLoading ? <button type="button" className="send-btn stop" onClick={onStop}>Stop</button>
              : <button type="button" className="send-btn" onClick={submit} disabled={!input.trim()}>Send</button>}
          </div>
          <div className="chat-disclaimer">ATLAS can make mistakes. Verify important info.</div>
        </>
      )}
    </aside>
  )
}
