import type { Settings } from '../types/settings'
import { DEFAULT_SETTINGS } from '../types/settings'

export async function getSettings(): Promise<Settings> {
  return new Promise(resolve => {
    chrome.storage.local.get('settings', result => {
      const stored = result['settings'] as Partial<Settings> | undefined
      resolve({ ...DEFAULT_SETTINGS, ...(stored ?? {}) })
    })
  })
}

export async function saveSettings(settings: Settings): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({ settings }, resolve)
  })
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const updated: Settings = { ...current, ...patch }
  await saveSettings(updated)
  return updated
}
