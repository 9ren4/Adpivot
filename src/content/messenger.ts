export function sendAdState(isAd: boolean): void {
  const message = { type: isAd ? 'ad-started' : 'ad-ended' }
  chrome.runtime.sendMessage(message).catch(() => {
    // Background worker may not be ready yet — safe to ignore
  })
}
