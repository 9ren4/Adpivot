import { getSettings, updateSettings } from '../storage'
import { getState, setState, resetState } from './state'
import { openRedirect, focusYouTubeTab, closeRedirectTab } from './tab-manager'
import { notifyAdEnded } from './notification'
import { isValidMessage } from '../types/messages'

chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install') {
    const settings = await getSettings()
    if (!settings.onboardingComplete) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL('src/ui/onboarding/onboarding.html'),
      })
    }
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isValidMessage(message)) return false

  handleMessage(message, sender)
    .then(response => {
      if (response !== undefined) sendResponse(response)
    })
    .catch(err => {
      console.error('[AdRedirect] message handler error:', err)
    })

  return true
})

async function handleMessage(
  message: { type: string },
  sender: chrome.runtime.MessageSender
): Promise<unknown> {
  if (message.type === 'ad-started') {
    const { adActive } = getState()
    if (adActive) return

    const settings = await getSettings()
    if (!settings.enabled || !settings.activeUrlId) return

    const activeUrl = settings.urls.find(u => u.id === settings.activeUrlId)
    if (!activeUrl) return

    setState({ adActive: true, ytTabId: sender.tab?.id ?? null })
    await openRedirect(activeUrl.url)
    return
  }

  if (message.type === 'ad-ended') {
    const { adActive } = getState()
    if (!adActive) return

    setState({ adActive: false })
    const settings = await getSettings()

    if (settings.notifyOnEnd) notifyAdEnded()
    if (settings.autoReturn) await focusYouTubeTab()
    await closeRedirectTab()
    resetState()
    return
  }

  if (message.type === 'get-status') {
    const settings = await getSettings()
    const { adActive } = getState()
    return { type: 'status-response', enabled: settings.enabled, adActive }
  }
}

chrome.tabs.onRemoved.addListener(tabId => {
  const { redirectTabId } = getState()
  if (tabId === redirectTabId) {
    // User closed the redirect tab manually — full reset so the next ad works
    resetState()
  }
})

export async function setEnabled(enabled: boolean): Promise<void> {
  await updateSettings({ enabled })
}
