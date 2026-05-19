const NOTIFICATION_ID = 'ad-redirect-ended'

export function notifyAdEnded(): void {
  chrome.notifications.create(NOTIFICATION_ID, {
    type: 'basic',
    iconUrl: chrome.runtime.getURL('public/icons/icon48.png'),
    title: 'AdRedirect',
    message: 'Ad finished — your video is ready.',
    silent: false,
  })
}
