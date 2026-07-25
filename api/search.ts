// POST /api/search — Tavily passthrough (self-contained).
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ''

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).json({ results: [] }); return }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const query = String(body?.query ?? '').trim()
    if (!TAVILY_API_KEY || !query) { res.status(200).json({ results: [] }); return }
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ api_key: TAVILY_API_KEY, query, max_results: 5, include_answer: true, search_depth: 'advanced' }),
    })
    res.status(200).json(await r.json())
  } catch (err) {
    console.error('[atlas/search] error:', err)
    res.status(200).json({ results: [] })
  }
}
