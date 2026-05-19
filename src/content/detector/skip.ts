const SKIP_SELECTORS = [
  '.ytp-ad-skip-button-modern',
  '.ytp-ad-skip-button',
]

const POLL_MS = 500

function findVisibleSkipButton(): HTMLElement | null {
  for (const sel of SKIP_SELECTORS) {
    const btn = document.querySelector<HTMLElement>(sel)
    if (btn && btn.offsetParent !== null) return btn
  }
  return null
}

export function createSkipDetector(): () => void {
  const id = setInterval(() => {
    const btn = findVisibleSkipButton()
    if (btn) btn.click()
  }, POLL_MS)

  return () => clearInterval(id)
}
