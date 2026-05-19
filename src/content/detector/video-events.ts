import { isAdShowing } from '../../utils/youtube'
import type { DetectorCallback } from './mutation'

const AD_MAX_DURATION_SECONDS = 120

export function createVideoEventDetector(onStateChange: DetectorCallback): () => void {
  const video = document.querySelector('video')
  if (!video) return () => undefined

  let lastState: boolean | null = null

  const handler = () => {
    const player = document.querySelector('#movie_player')
    if (!player) return

    const isAd =
      isAdShowing(player) &&
      !video.paused &&
      isFinite(video.duration) &&
      video.duration < AD_MAX_DURATION_SECONDS

    if (isAd !== lastState) {
      lastState = isAd
      onStateChange(isAd)
    }
  }

  video.addEventListener('timeupdate', handler)
  return () => video.removeEventListener('timeupdate', handler)
}
