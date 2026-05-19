import React, { useState } from 'react'
import { getSettings, updateSettings } from '../../storage'
import type { UrlEntry } from '../../types/settings'
import { isValidHttpsUrl } from '../../utils/youtube'

export default function Onboarding() {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) { setError('Please enter a label for this destination.'); return }
    if (!isValidHttpsUrl(url)) { setError('Please enter a valid https:// URL (e.g. https://mail.google.com).'); return }
    setError(null)

    const settings = await getSettings()
    const entry: UrlEntry = {
      id: crypto.randomUUID(),
      label: label.trim(),
      url: url.trim(),
      createdAt: Date.now(),
    }

    await updateSettings({
      urls: [...settings.urls, entry],
      activeUrlId: entry.id,
      onboardingComplete: true,
    })

    setDone(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    color: '#111827',
  }

  if (done) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          textAlign: 'center',
          padding: 32,
        }}
      >
        <div style={{ fontSize: 48 }}>✅</div>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>You're all set!</h1>
        <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 360, lineHeight: 1.6 }}>
          Next time a YouTube ad plays, we'll take you to <strong>{label}</strong>.
          When it ends, you'll get a notification and we'll bring you back.
        </p>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          You can add more destinations or change settings anytime via the extension icon.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 40,
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: '#111827' }}>
          AdRedirect
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, marginBottom: 8 }}>
          YouTube ads are unavoidable. So let's make that time count.
        </p>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, marginBottom: 28 }}>
          When an ad plays, we'll take you somewhere productive. When it ends, we'll bring you right back.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="onboarding-label"
            style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}
          >
            Destination name
          </label>
          <input
            id="onboarding-label"
            type="text"
            placeholder="e.g. Gmail, Notion, Flashcards"
            value={label}
            onChange={e => setLabel(e.target.value)}
            aria-describedby="onboarding-hint"
            style={{ ...inputStyle, marginBottom: 14 }}
            autoFocus
          />

          <label
            htmlFor="onboarding-url"
            style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}
          >
            URL
          </label>
          <input
            id="onboarding-url"
            type="url"
            placeholder="https://mail.google.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ ...inputStyle, marginBottom: 6 }}
          />
          <p id="onboarding-hint" style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
            Must start with https://
          </p>

          {error && (
            <p role="alert" style={{ fontSize: 13, color: '#ef4444', marginBottom: 16 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 0',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Get Started →
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 1.5 }}>
          You can add more destinations later in Settings.
        </p>
      </div>
    </div>
  )
}
