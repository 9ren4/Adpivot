import React, { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../../storage'
import type { Settings as SettingsType, UrlEntry } from '../../types/settings'
import UrlLibrary from './UrlLibrary'
import Toggles from './Toggles'

const MANIFEST = chrome.runtime.getManifest()

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 10,
  padding: 20,
  marginBottom: 16,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

const headingStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#9ca3af',
  marginBottom: 14,
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  async function patch(changes: Partial<SettingsType>) {
    const updated = await updateSettings(changes)
    setSettings(updated)
  }

  function handleSelect(id: string) {
    patch({ activeUrlId: id })
  }

  function handleAdd(entry: Omit<UrlEntry, 'id' | 'createdAt'>) {
    if (!settings) return
    const newEntry: UrlEntry = {
      id: crypto.randomUUID(),
      label: entry.label,
      url: entry.url,
      createdAt: Date.now(),
    }
    const urls = [...settings.urls, newEntry]
    const activeUrlId = settings.activeUrlId ?? newEntry.id
    patch({ urls, activeUrlId })
  }

  function handleDelete(id: string) {
    if (!settings) return
    const urls = settings.urls.filter(u => u.id !== id)
    const activeUrlId = settings.activeUrlId === id
      ? (urls[0]?.id ?? null)
      : settings.activeUrlId
    patch({ urls, activeUrlId })
  }

  if (!settings) {
    return (
      <div style={{ padding: 40, color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>
        Loading…
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '32px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#111827' }}>
        ⚡ AdRedirect Settings
      </h1>

      <section style={sectionStyle} aria-labelledby="destinations-heading">
        <h2 id="destinations-heading" style={headingStyle}>Redirect Destination</h2>
        <UrlLibrary
          urls={settings.urls}
          activeUrlId={settings.activeUrlId}
          onSelect={handleSelect}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      </section>

      <section style={sectionStyle} aria-labelledby="behaviour-heading">
        <h2 id="behaviour-heading" style={headingStyle}>Behaviour</h2>
        <Toggles
          autoReturn={settings.autoReturn}
          notifyOnEnd={settings.notifyOnEnd}
          enabled={settings.enabled}
          onAutoReturnChange={v => patch({ autoReturn: v })}
          onNotifyOnEndChange={v => patch({ notifyOnEnd: v })}
          onEnabledChange={v => patch({ enabled: v })}
        />
      </section>

      <section style={sectionStyle} aria-labelledby="about-heading">
        <h2 id="about-heading" style={headingStyle}>About</h2>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
          AdRedirect v{MANIFEST.version} · Open source · No data collected · Zero analytics
        </p>
        <div style={{ marginTop: 10, display: 'flex', gap: 16 }}>
          <a
            href="https://github.com/your-username/ad-redirect"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: '#6366f1' }}
          >
            View on GitHub
          </a>
          <a
            href="https://github.com/your-username/ad-redirect/issues"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: '#6366f1' }}
          >
            Report an issue
          </a>
        </div>
      </section>
    </div>
  )
}
