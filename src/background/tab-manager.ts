import { getState, setState } from './state'

export async function openRedirect(url: string): Promise<void> {
  const tab = await chrome.tabs.create({ url, active: true })
  setState({ redirectTabId: tab.id ?? null })
}

export async function focusYouTubeTab(): Promise<void> {
  const { ytTabId } = getState()
  if (ytTabId === null) return
  try {
    const tab = await chrome.tabs.get(ytTabId)
    await chrome.tabs.update(ytTabId, { active: true })
    if (tab.windowId !== undefined) {
      await chrome.windows.update(tab.windowId, { focused: true })
    }
  } catch {
    setState({ ytTabId: null })
  }
}

export async function closeRedirectTab(): Promise<void> {
  const { redirectTabId } = getState()
  if (redirectTabId === null) return
  try {
    await chrome.tabs.remove(redirectTabId)
  } catch {
    // Already closed
  } finally {
    setState({ redirectTabId: null })
  }
}
