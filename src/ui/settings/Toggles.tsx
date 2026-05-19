import ToggleSwitch from '../popup/ToggleSwitch'

interface ToggleRowProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '12px 0',
        borderBottom: '1px solid #f3f4f6',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{description}</div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

interface Props {
  autoReturn: boolean
  notifyOnEnd: boolean
  enabled: boolean
  onAutoReturnChange: (v: boolean) => void
  onNotifyOnEndChange: (v: boolean) => void
  onEnabledChange: (v: boolean) => void
}

export default function Toggles({
  autoReturn,
  notifyOnEnd,
  enabled,
  onAutoReturnChange,
  onNotifyOnEndChange,
  onEnabledChange,
}: Props) {
  return (
    <div>
      <ToggleRow
        label="Auto-return to YouTube"
        description="Automatically switch focus back to YouTube when the ad ends."
        checked={autoReturn}
        onChange={onAutoReturnChange}
      />
      <ToggleRow
        label="Show notification when ad ends"
        description="Display a browser notification so you know the ad is over."
        checked={notifyOnEnd}
        onChange={onNotifyOnEndChange}
      />
      <ToggleRow
        label="Extension enabled"
        description="Master switch — turn off to pause all redirection."
        checked={enabled}
        onChange={onEnabledChange}
      />
    </div>
  )
}
