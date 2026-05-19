import { describe, it, expect } from 'vitest'
import { getSettings, saveSettings, updateSettings } from '../src/storage'
import { DEFAULT_SETTINGS } from '../src/types/settings'

describe('getSettings', () => {
  it('returns defaults when storage is empty', async () => {
    const settings = await getSettings()
    expect(settings).toEqual(DEFAULT_SETTINGS)
  })

  it('merges stored values over defaults', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, enabled: false, autoReturn: false })
    const settings = await getSettings()
    expect(settings.enabled).toBe(false)
    expect(settings.autoReturn).toBe(false)
    expect(settings.notifyOnEnd).toBe(true)
  })
})

describe('saveSettings', () => {
  it('persists settings to storage', async () => {
    const custom = { ...DEFAULT_SETTINGS, enabled: false }
    await saveSettings(custom)
    const loaded = await getSettings()
    expect(loaded.enabled).toBe(false)
  })
})

describe('updateSettings', () => {
  it('merges patch onto existing settings', async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, enabled: true, autoReturn: true })
    const updated = await updateSettings({ autoReturn: false })
    expect(updated.enabled).toBe(true)
    expect(updated.autoReturn).toBe(false)
  })

  it('returns the full updated settings object', async () => {
    const updated = await updateSettings({ notifyOnEnd: false })
    expect(updated).toMatchObject({ ...DEFAULT_SETTINGS, notifyOnEnd: false })
  })
})
