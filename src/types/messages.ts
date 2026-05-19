export type Message =
  | { type: 'ad-started' }
  | { type: 'ad-ended' }
  | { type: 'get-status' }
  | { type: 'status-response'; enabled: boolean; adActive: boolean }

export type IncomingMessage = { type: 'ad-started' } | { type: 'ad-ended' } | { type: 'get-status' }

export function isValidMessage(msg: unknown): msg is IncomingMessage {
  if (typeof msg !== 'object' || msg === null) return false
  const m = msg as Record<string, unknown>
  return (
    m['type'] === 'ad-started' ||
    m['type'] === 'ad-ended' ||
    m['type'] === 'get-status'
  )
}
