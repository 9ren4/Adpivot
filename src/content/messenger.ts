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

export function sendAdState(isAd: boolean): void {
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
        }
      })
  } catch {
    handleInvalidation()
  }
}
