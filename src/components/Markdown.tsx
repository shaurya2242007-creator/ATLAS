import type { ReactNode } from 'react'
import type { Source } from '../atlas/types'

// Minimal, dependency-free, XSS-safe markdown renderer for ATLAS replies.
function renderInline(text: string, sources?: Source[]): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(_[^_]+_)|(\[[^\]]+\]\([^)]+\))|(\[\d{1,2}\])/g
  let last = 0
  let key = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(<span key={key++}>{text.slice(last, m.index)}</span>)
    const tok = m[0]
    if (tok.startsWith('`')) nodes.push(<code key={key++} className="md-code">{tok.slice(1, -1)}</code>)
    else if (tok.startsWith('**')) nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith('*')) nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>)
    else if (tok.startsWith('_')) nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>)
    else if (tok.startsWith('[') && tok.includes('](')) {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok)
      if (mm) {
        const href = /^https?:\/\//i.test(mm[2]) ? mm[2] : '#'
        nodes.push(<a key={key++} href={href} target="_blank" rel="noopener noreferrer" className="md-link">{mm[1]}</a>)
      } else nodes.push(<span key={key++}>{tok}</span>)
    } else if (/^\[\d{1,2}\]$/.test(tok)) {
      const mm = /^\[(\d{1,2})\]$/.exec(tok)
      if (mm) {
        const idx = Number(mm[1]) - 1
        const src = sources && sources[idx]
        if (src) {
          nodes.push(<a key={key++} href={src.url} target="_blank" rel="noopener noreferrer" className="md-cite" title={src.title}>{mm[1]}</a>)
        } else {
          nodes.push(<sup key={key++} className="md-cite md-cite-dead">{mm[1]}</sup>)
        }
      } else nodes.push(<span key={key++}>{tok}</span>)
    } else nodes.push(<span key={key++}>{tok}</span>)
    last = m.index + tok.length
  }
  if (last < text.length) nodes.push(<span key={key++}>{text.slice(last)}</span>)
  return nodes
}

export function Markdown({ text, sources }: { text: string; sources?: Source[] }) {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let bk = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim().startsWith('```')) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++ }
      i++
      blocks.push(<pre key={bk++} className="md-pre"><code>{buf.join('\n')}</code></pre>)
      continue
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line)
    if (h) {
      const level = h[1].length
      const cls = `md-h md-h${level <= 2 ? 3 : 4}`
      blocks.push(level <= 2
        ? <h3 key={bk++} className={cls}>{renderInline(h[2], sources)}</h3>
        : <h4 key={bk++} className={cls}>{renderInline(h[2], sources)}</h4>)
      i++
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: ReactNode[] = []
      let li = 0
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(<li key={li++}>{renderInline(lines[i].replace(/^\s*[-*]\s+/, ''), sources)}</li>); i++ }
      blocks.push(<ul key={bk++} className="md-ul">{items}</ul>)
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: ReactNode[] = []
      let li = 0
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(<li key={li++}>{renderInline(lines[i].replace(/^\s*\d+\.\s+/, ''), sources)}</li>); i++ }
      blocks.push(<ol key={bk++} className="md-ol">{items}</ol>)
      continue
    }
    if (line.trim() === '') { i++; continue }
    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('```') &&
      !/^(#{1,4})\s+/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) { para.push(lines[i]); i++ }
    blocks.push(<p key={bk++} className="md-p">{renderInline(para.join(' '), sources)}</p>)
  }
  return <div className="md">{blocks}</div>
}
