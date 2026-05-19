type Handler = () => void
let invalidationHandler: Handler | null = null

export function onContextInvalidated(handler: Handler): void {
  invalidationHandler = handler
}

function isContextValid(): boolean {
  return !!chrome.runtime?.id
}

function handleInvalidation(): void {
  invalidationHandler?.()
  invalidationHandler = null
}

function isTransientError(err: unknown): boolean {
  return err instanceof Error && err.message.includes('Receiving end does not exist')
}

export function sendAdState(isAd: boolean, attempt = 0): void {
  if (!isContextValid()) {
    handleInvalidation()
    return
  }
  try {
    chrome.runtime
      .sendMessage({ type: isAd ? 'ad-started' : 'ad-ended' })
      .catch((err: unknown) => {
        if (err instanceof Error && err.message.includes('context invalidated')) {
          handleInvalidation()
          return
        }
        // Service worker was sleeping — retry once after a short delay
        if (isTransientError(err) && attempt === 0) {
          setTimeout(() => sendAdState(isAd, 1), 200)
        }
      })
  } catch {
    handleInvalidation()
  }
}
