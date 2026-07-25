// POST /api/tts — ElevenLabs text-to-speech (self-contained). 204 if unavailable.
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || ''
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || ''

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).end(); return }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const text = String(body?.text ?? '').trim()
    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID || !text) { res.status(204).end(); return }
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream?optimize_streaming_latency=2`,
      { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5', voice_settings: { stability: 0.4, similarity_boost: 0.8 } }) },
    )
    if (!upstream.ok || !upstream.body) { res.status(204).end(); return }
    const buf = Buffer.from(await upstream.arrayBuffer())
    res.setHeader('content-type', 'audio/mpeg')
    res.setHeader('content-length', String(buf.length))
    res.status(200).send(buf)
  } catch (err) {
    console.error('[atlas/tts] error:', err)
    res.status(204).end()
  }
}
