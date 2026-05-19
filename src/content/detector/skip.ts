const SKIP_SELECTORS = [
  '.ytp-skip-ad-button',
  '.ytp-ad-skip-button-modern',
  '.ytp-ad-skip-button',
  '[id^="skip-button"]',
]

const POLL_MS = 300

function findVisibleSkipButton(): HTMLElement | null {
  for (const sel of SKIP_SELECTORS) {
    const btn = document.querySelector<HTMLElement>(sel)
    if (!btn) continue
    const rect = btn.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) return btn
  }
  return null
}

function simulateClick(el: HTMLElement): void {
  const opts: MouseEventInit = { bubbles: true, cancelable: true, view: window }
  el.dispatchEvent(new MouseEvent('mousedown', opts))
  el.dispatchEvent(new MouseEvent('mouseup', opts))
  el.dispatchEvent(new MouseEvent('click', opts))
}

export function createSkipDetector(): () => void {
  const id = setInterval(() => {
    const btn = findVisibleSkipButton()
    if (!btn) return
    simulateClick(btn)
    // Also try clicking the text child — some YouTube builds put the handler there
    const textChild = btn.querySelector<HTMLElement>('[class*="text"]')
    if (textChild) simulateClick(textChild)
  }, POLL_MS)

  return () => clearInterval(id)
}
