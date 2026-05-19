const SKIP_SELECTORS = [
  '.ytp-skip-ad-button',
  '.ytp-ad-skip-button-modern',
  '.ytp-ad-skip-button',
  '[id^="skip-button"]',
]

const POLL_MS = 300

function isAdPlaying(): boolean {
  const player = document.querySelector('#movie_player')
  if (!player) return false
  return player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting')
}

function simulateClick(el: HTMLElement): void {
  const opts: MouseEventInit = { bubbles: true, cancelable: true, view: window }
  el.dispatchEvent(new MouseEvent('mousedown', opts))
  el.dispatchEvent(new MouseEvent('mouseup', opts))
  el.dispatchEvent(new MouseEvent('click', opts))
  el.click()
}

function tryClickSkipButton(): void {
  for (const sel of SKIP_SELECTORS) {
    const btn = document.querySelector<HTMLElement>(sel)
    if (!btn) continue
    simulateClick(btn)
    const textChild = btn.querySelector<HTMLElement>('[class*="text"]')
    if (textChild) simulateClick(textChild)
    return
  }
}

// Seeking the video to its end forces the ad to complete —
// this works from a content script because currentTime is a DOM property,
// not a JS-world variable, so the page's isTrusted checks don't apply.
function trySeekToEnd(): void {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (!video) return
  const dur = video.duration
  if (isFinite(dur) && dur > 0) {
    video.currentTime = dur
  }
}

export function createSkipDetector(): () => void {
  const id = setInterval(() => {
    if (!isAdPlaying()) return
    tryClickSkipButton()
    trySeekToEnd()
  }, POLL_MS)

  return () => clearInterval(id)
}
