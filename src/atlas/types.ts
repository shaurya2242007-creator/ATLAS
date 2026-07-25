// Shared ATLAS type definitions.

export type Mode = 'quick' | 'deep' | 'visual'

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

export type MessageSource = 'live' | 'demo'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  /** Currently visible text (assistant messages reveal via typewriter). */
  content: string
  /** Complete text for assistant messages (used by the typewriter + TTS). */
  full?: string
  source?: MessageSource
  streaming?: boolean
  sources?: Source[]
  /** Deep Research trace: which sub-queries ran, how many hops, how many sources. */
  research?: { subQueries: string[]; hops: number; sourceCount: number }
}

export interface ModeConfig {
  id: Mode
  label: string
  hotkey: string
  colorA: string
  colorB: string
  systemAppend: string
}

export interface Source { title: string; url: string; snippet: string }
export interface Topic { id: string; label: string; ts: number }
