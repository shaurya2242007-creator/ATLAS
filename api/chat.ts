// POST /api/chat — self-contained (no cross-file imports; Vercel ESM functions
// don't bundle shared modules reliably). Mirrors vite.config.ts + persona.
type Mode = 'quick' | 'deep' | 'visual'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
const GROQ_BASE_URL = (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '')
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free'
const OPENROUTER_API_KEY_FALLBACK = process.env.OPENROUTER_API_KEY_FALLBACK || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ''

const ATLAS_SYSTEM = `You are ATLAS (Adaptive Total-recall Learning & Analysis System), an elite personal research intelligence built for one user. You are not a generic chatbot. You operate with the combined lens of a senior AI/ML engineer, research scientist, cognitive-performance coach, and cross-domain synthesizer. Your purpose: accelerate the user's learning at an elite level — surfacing insights most top practitioners have never encountered, synthesized from first principles, cutting-edge research, and cross-domain pattern recognition.

Rules:
- No filler. Never open with 'Great question' or 'Certainly.' Start with the answer.
- Simple language, complex ideas: explain hard topics the way a gifted teacher would to a curious 18-year-old; translate any jargon immediately.
- The 1% standard: for every query, silently ask 'Would a top-1% practitioner already know this?' If yes, go deeper — surface what's buried in meta-analyses, contrarian findings, and cross-domain analogies specialists miss.
- Precision and depth in plain human language. Don't hedge unnecessarily; don't water things down.
- Match register: if the user just greets you, thanks you, or makes small talk, reply briefly and warmly in-character (a sharp, friendly research partner) and invite what they'd like to explore — do NOT lecture, and do NOT force an insight or a cross-domain connection. Save the elite depth for real questions.
- For substantive questions ONLY, end with ONE non-obvious cross-domain connection the user can use (e.g., link a biology idea to sales or investing). Never bolt this onto greetings, small talk, or quick factual answers.
- Intellectual courage: when useful, say 'Most people get this wrong because…' and explain why.
- Honesty: never fabricate citations. If you lack a specific source, say so and reason from mechanism. Flag uncertainty plainly.
- Framing: treat medical/legal/financial content as education and exploration, not professional advice.
- Respect cognitive load: scaffold, don't dump.
- Write in clean spoken-cadence prose (short paragraphs, natural transitions), NOT bullet walls.
Domains of elite depth: biology/longevity/neuroscience; psychology/behavioral economics; finance/markets/macro; sales/persuasion/negotiation; systems & spatial dynamics; and cross-domain synthesis (your superpower).`

const MODE_APPEND: Record<Mode, string> = {
  quick: 'MODE: QUICK. Answer in ~120 words max. Punchy, high-signal, one insight, no preamble.',
  deep: "MODE: DEEP RESEARCH. Structure as three spoken sections: Overview -> Depth -> The Hidden Layer. Cite conversationally ('a 2023 MIT study found…'). If LIVE WEB RESULTS are supplied, synthesize + cite them and flag where sources conflict.",
  visual: 'MODE: VISUAL. Explain, and when the concept is spatial/structural/dynamic, vividly describe what a 3D visualization should show.',
}

function buildSystem(mode: Mode): string {
  return `${ATLAS_SYSTEM}\n\n${MODE_APPEND[mode] ?? ''}`
}

function demoAnswer(question: string, mode: Mode): string {
  const q = (question || 'your question').trim().slice(0, 400)
  return (
    `[ATLAS · offline demo mode — ${mode.toUpperCase()}]\n\n` +
    `My live model is unreachable right now, so this is a canned demo response rather than a real synthesis.\n\n` +
    `On "${q}": start from mechanism, not memory — isolate the two or three variables that actually move the outcome, reason about how they interact, then test against the one case where intuition breaks.`
  )
}

type Src = { title: string; url: string; snippet: string; score: number }

async function callOpenAICompatible(baseUrl: string, apiKey: string, model: string, system: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const r = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json', 'HTTP-Referer': 'https://atlas-flame-omega.vercel.app', 'X-Title': 'ATLAS' },
    body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: 'system', content: system }, ...messages] }),
  })
  if (!r.ok) throw new Error(`llm ${r.status} @ ${baseUrl}: ${(await r.text().catch(() => '')).slice(0, 200)}`)
  const data: any = await r.json()
  const text = String(data?.choices?.[0]?.message?.content ?? '').trim()
  if (!text) throw new Error('empty completion')
  return text
}

async function callLLM(system: string, messages: Array<{ role: string; content: string }>): Promise<string> {
  const chain: Array<[string, string, string, string]> = []
  if (GROQ_API_KEY) chain.push(['groq', GROQ_BASE_URL, GROQ_API_KEY, GROQ_MODEL])
  if (OPENROUTER_API_KEY) chain.push(['or', 'https://openrouter.ai/api/v1', OPENROUTER_API_KEY, OPENROUTER_MODEL])
  if (OPENROUTER_API_KEY_FALLBACK) chain.push(['or-fb', 'https://openrouter.ai/api/v1', OPENROUTER_API_KEY_FALLBACK, OPENROUTER_MODEL])
  if (OPENAI_API_KEY) chain.push(['openai', OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL])
  let lastErr: unknown
  for (const [name, base, key, model] of chain) {
    try { return await callOpenAICompatible(base, key, model, system, messages) } catch (e) { lastErr = e; console.warn(`[atlas] ${name} failed: ${String(e).slice(0, 120)}`) }
  }
  throw lastErr || new Error('no LLM provider configured')
}

async function tavily(query: string): Promise<any[]> {
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ api_key: TAVILY_API_KEY, query, max_results: 5, include_answer: true, search_depth: 'advanced' }),
  })
  const d: any = await r.json().catch(() => ({}))
  return Array.isArray(d?.results) ? d.results : []
}

async function gather(queries: string[]): Promise<Src[]> {
  const batches = await Promise.all(queries.map((q) => tavily(q).catch(() => [] as any[])))
  const seen = new Set<string>()
  const pool: Src[] = []
  for (const arr of batches) for (const it of arr) {
    const url = String(it?.url || '')
    if (!url || seen.has(url)) continue
    seen.add(url)
    pool.push({ title: String(it?.title || 'Untitled'), url, snippet: String(it?.content || it?.snippet || '').slice(0, 400), score: Number(it?.score || 0) })
  }
  pool.sort((a, b) => b.score - a.score)
  return pool.slice(0, 8)
}

function researchSystem(sources: Src[], allowFollowup: boolean): string {
  const list = sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}\n${s.snippet}`).join('\n\n')
  return [
    'You are ATLAS Deep Research. You are given NUMBERED web sources.',
    'RULES:',
    '1. Use ONLY these sources for factual claims. If unsupported, say so plainly.',
    '2. Cite EVERY factual claim inline with its bracket number like [1] or [2][3]. Never invent numbers beyond the list.',
    '3. STRUCTURE exactly: a one-line **TL;DR:** ; then 2-4 "## " sections with real depth; then a "## In plain terms" paragraph for a smart beginner; then "## Open questions" noting gaps or conflicts.',
    '4. Be thorough but clear and engaging.',
    allowFollowup ? '5. On the VERY LAST line output `FOLLOWUP: <one web search query>` if a crucial fact is still missing, otherwise `FOLLOWUP: none`.' : '',
    '\nSOURCES:\n' + list,
  ].filter(Boolean).join('\n')
}

async function planSubQueries(query: string): Promise<string[]> {
  try {
    const raw = await callLLM('You are a research planner. Break the user question into 2-4 specific, diverse web-search queries that TOGETHER fully cover it. Return ONLY a JSON array of strings, nothing else.', [{ role: 'user', content: query }])
    const m = raw.match(/\[[\s\S]*\]/)
    const arr = JSON.parse(m ? m[0] : raw)
    if (Array.isArray(arr) && arr.length) return arr.slice(0, 4).map((s: unknown) => String(s))
  } catch { /* fall through */ }
  return [query]
}

async function deepResearch(query: string) {
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
    text = (await callLLM(researchSystem(sources, false), [{ role: 'user', content: query }])).replace(/\n?FOLLOWUP:\s*.*$/i, '').trim()
  }
  return { text, sources, research: { subQueries, hops, sourceCount: sources.length } }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const messages: Array<{ role: string; content: string }> = Array.isArray(body?.messages) ? body.messages : []
  const chatMode: Mode = (body?.mode as Mode) || 'quick'
  const useSearch = !!body?.useSearch
  const lastUser = [...messages].reverse().find((m) => m?.role === 'user')?.content ?? ''
  try {
    if (!GROQ_API_KEY && !OPENROUTER_API_KEY && !OPENROUTER_API_KEY_FALLBACK && !OPENAI_API_KEY) throw new Error('no LLM provider configured')
    if (chatMode === 'deep' && useSearch && TAVILY_API_KEY && lastUser) {
      const r = await deepResearch(String(lastUser))
      res.status(200).json({ text: r.text, source: 'live', sources: r.sources, research: r.research })
      return
    }
    const clean = messages.filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string' && m.content.length > 0).map((m) => ({ role: m.role, content: m.content }))
    const text = await callLLM(buildSystem(chatMode), clean)
    res.status(200).json({ text, source: 'live', sources: [] })
  } catch (err) {
    console.error('[atlas/chat] demo fallback:', (err as Error).message)
    res.status(200).json({ text: demoAnswer(String(lastUser), chatMode), source: 'demo', sources: [] })
  }
}
