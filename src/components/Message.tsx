import type { ChatMessage } from '../atlas/types'
import { Markdown } from './Markdown'

export function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`msg ${isUser ? 'msg-user' : 'msg-assistant'}`}>
      <div className="msg-role">
        <span>{isUser ? 'YOU' : 'ATLAS'}</span>
        {!isUser && message.source === 'demo' && <span className="badge-demo" title="Offline demo response">demo</span>}
      </div>
      <div className="msg-bubble">
        {isUser ? message.content : <Markdown text={message.content} sources={message.sources} />}
        {message.streaming && <span className="caret" aria-hidden="true" />}
      </div>
    </div>
  )
}
