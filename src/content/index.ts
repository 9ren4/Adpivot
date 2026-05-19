import { createMutationDetector } from './detector/mutation'
import { createVideoEventDetector } from './detector/video-events'
import { createPollingDetector } from './detector/polling'
import { createSkipDetector } from './detector/skip'
import { sendAdState, onContextInvalidated } from './messenger'

const POLLING_FALLBACK_TIMEOUT_MS = 90_000
const PLAYER_WAIT_INTERVAL_MS = 1000

let adActive = false
let pollingTimeout: ReturnType<typeof setTimeout> | null = null
let cleanupMutation: (() => void) | null = null
let cleanupVideoEvents: (() => void) | null = null
let cleanupSkip: (() => void) | null = null

const polling = createPollingDetector(handleStateChange)

function handleStateChange(isAd: boolean): void {
  if (isAd === adActive) return
  adActive = isAd
  sendAdState(isAd)

  if (isAd) {
    cleanupSkip = createSkipDetector()
    pollingTimeout = setTimeout(() => polling.activate(), POLLING_FALLBACK_TIMEOUT_MS)
  } else {
    cleanupSkip?.()
    cleanupSkip = null
    if (pollingTimeout !== null) {
      clearTimeout(pollingTimeout)
      pollingTimeout = null
    }
    polling.deactivate()
  }
}

function teardown(): void {
  cleanupMutation?.()
  cleanupVideoEvents?.()
  cleanupSkip?.()
  cleanupSkip = null
  polling.deactivate()
  if (pollingTimeout !== null) {
    clearTimeout(pollingTimeout)
    pollingTimeout = null
  }
  adActive = false
}

function init(): void {
  const player = document.querySelector('#movie_player')
  if (!player) {
    setTimeout(init, PLAYER_WAIT_INTERVAL_MS)
    return
  }

  cleanupMutation = createMutationDetector(handleStateChange)
  cleanupVideoEvents = createVideoEventDetector(handleStateChange)
}

onContextInvalidated(teardown)

init()

// Re-initialise on YouTube SPA navigation
window.addEventListener('yt-navigate-finish', () => {
  teardown()
  init()
})
