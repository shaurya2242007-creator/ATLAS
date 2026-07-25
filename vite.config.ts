import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import { buildSystem } from './src/atlas/persona'
import type { Mode } from './src/atlas/types'

// ---------------------------------------------------------------------------
// Tiny helpers for the dev/preview API middleware.
// ---------------------------------------------------------------------------
const MAX_BODY_BYTES = 1_000_000 // 1 MB cap — these routes only ever receive small JSON.

function readJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('request body too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function noContent(res: ServerResponse) {
  res.statusCode = 204
  res.end()
}

// Persona-flavored offline answer used whenever the live model can't be reached.
function demoAnswer(question: string, mode: Mode): string {
  const q = (question || 'your question').trim().slice(0, 400)
  return (
    `[ATLAS · offline demo mode — ${mode.toUpperCase()}]\n\n` +
    `My live model is unreachable right now, so this is a canned demo response rather than a real synthesis — the interface is fully wired, only the upstream call failed.\n\n` +
    `On "${q}": start from mechanism, not memory. Strip the question down to the two or three variables that actually move the outcome, reason about how they interact, then deliberately test your conclusion against the one case where your intuition usually breaks. That loop out-performs recall almost every time, because it survives contact with situations you've never seen.\n\n` +
    `One cross-domain connection to take with you: an immune system gets stronger from small, repeated, survivable challenges rather than from a sterile environment — treat your own beliefs the same way, exposing them to frequent little counterexamples so they're robust before the stakes are real.\n\n` +
    `(Add a valid GROQ_API_KEY or OPENROUTER_API_KEY in .env, then restart, to switch me back to live mode.)`
  )
}

// Call any OpenAI-compatible chat-completions API (Groq, OpenRouter, OpenAI, …).
// The persona system prompt leads as a system message; the reply text is read
// from choices[0].message.content. Throws on any non-2xx / empty completion.
async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  system: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      // Attribution headers recommended by OpenRouter (harmlessly ignored elsewhere).
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'ATLAS',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    throw new Error(`llm ${r.status} @ ${baseUrl}: ${t.slice(0, 300)}`)
  }
  const data = await r.json()
  const text = String(data?.choices?.[0]?.message?.content ?? '').trim()
  if (!text) throw new Error('empty completion')
  return text
}

async function tavilySearch(apiKey: string, query: string): Promise<any> {
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      include_answer: true,
      search_depth: 'advanced',
    }),
  })
  return r.json()
}

// A ranked, de-duplicated web source used by the Deep Research pipeline.
type ResearchSource = { title: string; url: string; snippet: string; score: number }

// ---------------------------------------------------------------------------
// Vite config with the ATLAS API middleware plugin.
// ---------------------------------------------------------------------------
export default defineConfig(({ mode }) => {
  // Empty prefix -> load ALL vars (including non-VITE_ ones) so secrets stay server-side.
  const env = loadEnv(mode, process.cwd(), '')

  const ELEVENLABS_API_KEY = env.ELEVENLABS_API_KEY || ''
  const ELEVENLABS_VOICE_ID = env.ELEVENLABS_VOICE_ID || ''
  const TAVILY_API_KEY = env.TAVILY_API_KEY || ''

  // Chat is served by a multi-provider chain of OpenAI-compatible endpoints. The
  // first configured provider wins; on any error callLLM() falls to the next.
  // Order: Groq (fast, primary) -> OpenRouter -> OpenRouter fallback key -> OpenAI.
  const GROQ_API_KEY = env.GROQ_API_KEY || ''
  const GROQ_MODEL = env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  const GROQ_BASE_URL = (env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '')
  const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY || ''
  const OPENROUTER_MODEL = env.OPENROUTER_MODEL || 'openrouter/free'
  const OPENROUTER_API_KEY_FALLBACK = env.OPENROUTER_API_KEY_FALLBACK || ''
  const OPENAI_API_KEY = env.OPENAI_API_KEY || ''
  const OPENAI_MODEL = env.OPENAI_MODEL || 'gpt-4o-mini'
  const OPENAI_BASE_URL = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')

  // -------------------------------------------------------------------------
  // Deep Research pipeline (OpenRouter LLM + Tavily search). These close over
  // the env-scoped keys above, so they live inside the config factory.
  // -------------------------------------------------------------------------

  // Multi-provider LLM call. Builds a chain of the configured OpenAI-compatible
  // providers (first configured wins) and, on any error, falls through to the
  // next. Throws only when every configured provider fails.
  async function callLLM(system: string, messages: Array<{ role: string; content: string }>): Promise<string> {
    const chain: Array<[string, string, string, string]> = []
    if (GROQ_API_KEY) chain.push(['groq', GROQ_BASE_URL, GROQ_API_KEY, GROQ_MODEL])
    if (OPENROUTER_API_KEY) chain.push(['openrouter', 'https://openrouter.ai/api/v1', OPENROUTER_API_KEY, OPENROUTER_MODEL])
    if (OPENROUTER_API_KEY_FALLBACK) chain.push(['openrouter-fb', 'https://openrouter.ai/api/v1', OPENROUTER_API_KEY_FALLBACK, OPENROUTER_MODEL])
    if (OPENAI_API_KEY) chain.push(['openai', OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL])
    let lastErr: unknown
    for (const [name, base, key, model] of chain) {
      try {
        return await callOpenAICompatible(base, key, model, system, messages)
      } catch (e) {
        lastErr = e
        console.warn(`[atlas] provider ${name} failed: ${String(e).slice(0, 160)}`)
      }
    }
    throw lastErr || new Error('no LLM provider configured')
  }

  // PLANNER — decompose the question into 2-4 diverse search queries. Any failure
  // (LLM error or unparseable output) falls back to the original query.
  async function planSubQueries(query: string): Promise<string[]> {
    const sys =
      'You are a research planner. Break the user question into 2-4 specific, diverse web-search queries that TOGETHER fully cover it. Return ONLY a JSON array of strings, nothing else.'
    try {
      const raw = await callLLM(sys, [{ role: 'user', content: query }])
      const m = raw.match(/\[[\s\S]*\]/)
      const arr = JSON.parse(m ? m[0] : raw)
      if (Array.isArray(arr) && arr.length) return arr.slice(0, 4).map((s: unknown) => String(s))
    } catch {
      /* fall through to single-query fallback below */
    }
    return [query]
  }

  // SEARCH + MERGE — run every sub-query through Tavily in parallel, dedupe by
  // URL, rank by score, number the top results. Never throws (per-search catch).
  async function gather(queries: string[]): Promise<ResearchSource[]> {
    const batches = await Promise.all(
      queries.map((q) =>
        tavilySearch(TAVILY_API_KEY, q)
          .then((d: any) => (Array.isArray(d?.results) ? d.results : []))
          .catch(() => [] as any[]),
      ),
    )
    const seen = new Set<string>()
    const pool: ResearchSource[] = []
    for (const arr of batches) {
      for (const it of arr) {
        const url = String(it?.url || '')
        if (!url || seen.has(url)) continue
        seen.add(url)
        pool.push({
          title: String(it?.title || 'Untitled'),
          url,
          snippet: String(it?.content || it?.snippet || '').slice(0, 400),
          score: Number(it?.score || 0),
        })
      }
    }
    pool.sort((a, b) => b.score - a.score)
    return pool.slice(0, 8)
  }

  // SYNTHESIZE — grounded, structured, cited system prompt (NotebookLM x Perplexity).
  function researchSystem(sources: ResearchSource[], allowFollowup: boolean): string {
    const list = sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}\n${s.snippet}`).join('\n\n')
    return [
      'You are ATLAS Deep Research. You are given NUMBERED web sources.',
      'RULES:',
      '1. Use ONLY these sources for factual claims. If something is not supported, say so plainly.',
      '2. Cite EVERY factual claim inline with its bracket number like [1] or [2][3]. Never invent numbers beyond the list.',
      '3. STRUCTURE your answer exactly: a one-line **TL;DR:** ; then 2-4 "## " sections with real depth; then a "## In plain terms" paragraph explaining it simply for a smart beginner; then "## Open questions" noting gaps or where sources disagree.',
      '4. Be thorough but clear and engaging.',
      allowFollowup
        ? '5. On the VERY LAST line output `FOLLOWUP: <one web search query>` if a crucial fact is still missing, otherwise `FOLLOWUP: none`.'
        : '',
      '\nSOURCES:\n' + list,
    ]
      .filter(Boolean)
      .join('\n')
  }

  // ORCHESTRATOR — decompose -> gather -> synthesize -> ONE optional follow-up hop.
  async function deepResearch(query: string): Promise<{
    text: string
    sources: ResearchSource[]
    research: { subQueries: string[]; hops: number; sourceCount: number }
  }> {
    const subQueries = await planSubQueries(query)
    let sources = await gather(subQueries)
    let hops = 1
    const draft = await callLLM(researchSystem(sources, true), [{ role: 'user', content: query }])
    const fm = draft.match(/FOLLOWUP:\s*(.+)\s*$/i)
    const followup = fm ? fm[1].trim() : 'none'
    let text = draft.replace(/\n?FOLLOWUP:\s*.*$/i, '').trim()
    if (followup && followup.toLowerCase() !== 'none' && hops < 2) {
      const more = await gather([followup])
      const seen = new Set(sources.map((s) => s.url))
      for (const s of more) if (!seen.has(s.url)) sources.push(s)
      sources = sources.slice(0, 10)
      hops = 2
      text = (await callLLM(researchSystem(sources, false), [{ role: 'user', content: query }]))
        .replace(/\n?FOLLOWUP:\s*.*$/i, '')
        .trim()
    }
    return { text, sources, research: { subQueries, hops, sourceCount: sources.length } }
  }

  // Register the three JSON/audio routes on any connect-style server (dev + preview).
  const register = (middlewares: { use: (path: string, fn: (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void) => void }) => {
    // --- POST /api/search : Tavily passthrough ---------------------------
    middlewares.use('/api/search', (req, res, next) => {
      if (req.method !== 'POST') return next()
      readJson(req)
        .then(async (body) => {
          const query = String(body?.query ?? '').trim()
          if (!TAVILY_API_KEY || !query) return sendJson(res, 200, { results: [] })
          const data = await tavilySearch(TAVILY_API_KEY, query)
          sendJson(res, 200, data)
        })
        .catch((err) => {
          console.error('[atlas/search] error:', err)
          sendJson(res, 200, { results: [] })
        })
    })

    // --- POST /api/chat : LLM with offline demo fallback -----------------
    middlewares.use('/api/chat', (req, res, next) => {
      if (req.method !== 'POST') return next()
      readJson(req)
        .then(async (body) => {
          const messages: Array<{ role: string; content: string }> = Array.isArray(body?.messages) ? body.messages : []
          const chatMode: Mode = (body?.mode as Mode) || 'quick'
          const useSearch = !!body?.useSearch
          const lastUser = [...messages].reverse().find((m) => m?.role === 'user')?.content ?? ''

          try {
            if (!GROQ_API_KEY && !OPENROUTER_API_KEY && !OPENROUTER_API_KEY_FALLBACK && !OPENAI_API_KEY) {
              throw new Error('no LLM provider configured')
            }

            // Deep Research: agentic pipeline (decompose -> parallel search ->
            // grounded synthesis -> one optional follow-up hop). Returns cited
            // text plus the numbered sources and a small research trace.
            if (chatMode === 'deep' && useSearch && TAVILY_API_KEY && lastUser) {
              const r = await deepResearch(lastUser)
              return sendJson(res, 200, { text: r.text, source: 'live', sources: r.sources, research: r.research })
            }

            // Quick / Visual: a single grounded LLM call, no web search.
            const system = buildSystem(chatMode)
            const cleanMessages = messages
              .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string' && m.content.length > 0)
              .map((m) => ({ role: m.role, content: m.content }))

            // Single grounded LLM call via the multi-provider chain (Groq -> OpenRouter -> OpenAI).
            const text = await callLLM(system, cleanMessages)
            if (!text) throw new Error('empty completion from upstream')

            sendJson(res, 200, { text, source: 'live', sources: [] })
          } catch (err) {
            console.error('[atlas/chat] falling back to demo mode:', (err as Error).message)
            sendJson(res, 200, { text: demoAnswer(String(lastUser), chatMode), source: 'demo', sources: [] })
          }
        })
        .catch((err) => {
          console.error('[atlas/chat] request error:', err)
          sendJson(res, 200, { text: demoAnswer('your question', 'quick'), source: 'demo' })
        })
    })

    // --- POST /api/tts : ElevenLabs streaming passthrough ----------------
    middlewares.use('/api/tts', (req, res, next) => {
      if (req.method !== 'POST') return next()
      readJson(req)
        .then(async (body) => {
          const text = String(body?.text ?? '').trim()
          if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID || !text) return noContent(res)

          const upstream = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream?optimize_streaming_latency=2`,
            {
              method: 'POST',
              headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'content-type': 'application/json' },
              body: JSON.stringify({
                text,
                model_id: 'eleven_turbo_v2_5',
                voice_settings: { stability: 0.4, similarity_boost: 0.8 },
              }),
            },
          )

          if (!upstream.ok || !upstream.body) {
            const errText = await upstream.text().catch(() => '')
            console.error(`[atlas/tts] upstream ${upstream.status}: ${errText.slice(0, 300)}`)
            return noContent(res)
          }

          const buf = Buffer.from(await upstream.arrayBuffer())
          res.statusCode = 200
          res.setHeader('content-type', 'audio/mpeg')
          res.setHeader('content-length', String(buf.length))
          res.end(buf)
        })
        .catch((err) => {
          console.error('[atlas/tts] error:', err)
          noContent(res)
        })
    })
  }

  const atlasApi: Plugin = {
    name: 'atlas-api-middleware',
    configureServer(server) {
      register(server.middlewares)
    },
    configurePreviewServer(server) {
      register(server.middlewares)
    },
  }

  // The /api/* routes are unauthenticated proxies that spend server-side API
  // keys, so bind to localhost by default. Opt into LAN exposure explicitly
  // (e.g. to test on a phone) with ATLAS_EXPOSE_LAN=1.
  const exposeLan = env.ATLAS_EXPOSE_LAN === '1'

  return {
    plugins: [react(), atlasApi],
    server: { port: 5173, host: exposeLan },
    preview: { port: 4173, host: exposeLan },
  }
})
