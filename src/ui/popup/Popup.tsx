import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../../storage'
import StatusBadge, { StatusType } from './StatusBadge'
import ToggleSwitch from './ToggleSwitch'

export default function Popup() {
  const [enabled, setEnabled] = useState(true)
  const [status, setStatus] = useState<StatusType>('no-youtube')
  const [activeLabel, setActiveLabel] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const settings = await getSettings()
      setEnabled(settings.enabled)

      if (!settings.enabled) {
        setStatus('disabled')
        setLoading(false)
        return
      }

      if (!settings.activeUrlId || settings.urls.length === 0) {
        setStatus('no-destination')
        setLoading(false)
        return
      }

      const active = settings.urls.find(u => u.id === settings.activeUrlId)
      setActiveLabel(active?.label ?? null)

      const tabs = await chrome.tabs.query({ url: 'https://www.youtube.com/*' })
      if (tabs.length === 0) {
        setStatus('no-youtube')
        setLoading(false)
        return
      }

      try {
        const response = await chrome.runtime.sendMessage({ type: 'get-status' }) as
          | { type: string; adActive: boolean }
          | undefined
        if (response?.adActive) {
          setStatus('redirected')
        } else {
          setStatus('watching')
        }
      } catch {
        setStatus('watching')
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleToggle(value: boolean) {
    setEnabled(value)
    await updateSettings({ enabled: value })
    setStatus(value ? 'no-youtube' : 'disabled')
  }

  if (loading) {
    return (
      <div style={{ width: 280, padding: 16, color: '#9ca3af', fontSize: 13 }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ width: 280, padding: 16, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>⚡ AdRedirect</span>
        <ToggleSwitch checked={enabled} onChange={handleToggle} label="Enable AdRedirect" />
      </div>

      <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 -16px', marginBottom: 12 }} />

      <div style={{ marginBottom: 10 }}>
        <StatusBadge status={status} />
      </div>

      {activeLabel && enabled && (
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
          Redirect to:{' '}
          <strong style={{ color: '#111827' }}>{activeLabel}</strong>
        </div>
      )}

      {status === 'no-destination' && (
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
          Open Settings to add a redirect destination.
        </div>
      )}

      <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 -16px', marginTop: 4, marginBottom: 12 }} />

      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          color: '#6366f1',
          padding: 0,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
        aria-label="Open settings page"
      >
        ⚙ Settings
      </button>
    </div>
  )
}
