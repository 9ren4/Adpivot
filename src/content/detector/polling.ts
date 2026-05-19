import { isAdShowing } from '../../utils/youtube'
import type { DetectorCallback } from './mutation'

const POLL_INTERVAL_MS = 2000

export interface PollingDetector {
  activate: () => void
  deactivate: () => void
}

export function createPollingDetector(onStateChange: DetectorCallback): PollingDetector {
  let intervalId: ReturnType<typeof setInterval> | null = null

  const activate = () => {
    if (intervalId !== null) return
    intervalId = setInterval(() => {
      const player = document.querySelector('#movie_player')
      const isAd = player ? isAdShowing(player) : false
      onStateChange(isAd)
    }, POLL_INTERVAL_MS)
  }

  const deactivate = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return { activate, deactivate }
}
