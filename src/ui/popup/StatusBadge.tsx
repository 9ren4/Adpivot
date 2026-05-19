export type StatusType = 'watching' | 'ad' | 'redirected' | 'no-youtube' | 'no-destination' | 'disabled'

const STATUS_CONFIG: Record<StatusType, { color: string; bg: string; text: string }> = {
  watching:       { color: '#15803d', bg: '#dcfce7', text: 'Watching video' },
  ad:             { color: '#b45309', bg: '#fef3c7', text: 'Ad detected — redirecting' },
  redirected:     { color: '#1d4ed8', bg: '#dbeafe', text: 'Waiting for ad to end' },
  'no-youtube':   { color: '#6b7280', bg: '#f3f4f6', text: 'No YouTube tab open' },
  'no-destination': { color: '#6b7280', bg: '#f3f4f6', text: 'No destination set' },
  disabled:       { color: '#6b7280', bg: '#f3f4f6', text: 'Extension disabled' },
}

interface Props {
  status: StatusType
}

export default function StatusBadge({ status }: Props) {
  const { color, bg, text } = STATUS_CONFIG[status]
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        background: bg,
        fontSize: 12,
        fontWeight: 500,
        color,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {text}
    </div>
  )
}
