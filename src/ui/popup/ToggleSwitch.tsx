interface Props {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  disabled?: boolean
}

export default function ToggleSwitch({ checked, onChange, label, disabled = false }: Props) {
  const trackColor = checked ? '#6366f1' : '#d1d5db'

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        background: trackColor,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        transition: 'background 0.2s',
        outline: 'none',
        flexShrink: 0,
      }}
      onFocus={e => (e.currentTarget.style.boxShadow = `0 0 0 3px rgba(99,102,241,0.4)`)}
      onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <span
        style={{
          position: 'absolute',
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }}
      />
    </button>
  )
}
