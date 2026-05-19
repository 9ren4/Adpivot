import React, { useState } from 'react'
import type { UrlEntry } from '../../types/settings'
import { isValidHttpsUrl } from '../../utils/youtube'

interface Props {
  urls: UrlEntry[]
  activeUrlId: string | null
  onSelect: (id: string) => void
  onAdd: (entry: Omit<UrlEntry, 'id' | 'createdAt'>) => void
  onDelete: (id: string) => void
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '7px 10px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
}

const btnStyle = (primary: boolean): React.CSSProperties => ({
  padding: '7px 14px',
  borderRadius: 6,
  border: primary ? 'none' : '1px solid #d1d5db',
  background: primary ? '#6366f1' : '#fff',
  color: primary ? '#fff' : '#374151',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
})

export default function UrlLibrary({ urls, activeUrlId, onSelect, onAdd, onDelete }: Props) {
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  function handleAdd() {
    if (!label.trim()) { setError('Label is required.'); return }
    if (!isValidHttpsUrl(url)) { setError('Please enter a valid https:// URL.'); return }
    setError(null)
    onAdd({ label: label.trim(), url: url.trim() })
    setLabel('')
    setUrl('')
    setShowForm(false)
  }

  return (
    <div>
      {urls.length === 0 && (
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>
          No destinations saved yet. Add your first one below.
        </p>
      )}

      {urls.map(entry => (
        <div
          key={entry.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 0',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <input
            type="radio"
            id={`url-${entry.id}`}
            name="active-url"
            checked={activeUrlId === entry.id}
            onChange={() => onSelect(entry.id)}
            aria-label={`Select ${entry.label} as redirect destination`}
            style={{ accentColor: '#6366f1', cursor: 'pointer' }}
          />
          <label
            htmlFor={`url-${entry.id}`}
            style={{ flex: 1, cursor: 'pointer' }}
          >
            <div style={{ fontWeight: 500, fontSize: 14 }}>{entry.label}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', wordBreak: 'break-all' }}>{entry.url}</div>
          </label>
          <button
            onClick={() => onDelete(entry.id)}
            aria-label={`Delete ${entry.label}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ef4444',
              fontSize: 16,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            ×
          </button>
        </div>
      ))}

      {showForm ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            placeholder="Label (e.g. Gmail)"
            value={label}
            onChange={e => setLabel(e.target.value)}
            aria-label="Destination label"
            style={inputStyle}
            autoFocus
          />
          <input
            type="url"
            placeholder="URL (e.g. https://mail.google.com)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            aria-label="Destination URL"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          {error && <p style={{ color: '#ef4444', fontSize: 12 }} role="alert">{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAdd} style={btnStyle(true)}>Save</button>
            <button onClick={() => { setShowForm(false); setError(null) }} style={btnStyle(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{ ...btnStyle(false), marginTop: 12 }}
          aria-label="Add new redirect destination"
        >
          + Add destination
        </button>
      )}
    </div>
  )
}
