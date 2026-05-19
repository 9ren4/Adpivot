import { debounce } from '../../utils/debounce'
import { isAdShowing } from '../../utils/youtube'

export type DetectorCallback = (isAd: boolean) => void

export function createMutationDetector(onStateChange: DetectorCallback): () => void {
  const player = document.querySelector('#movie_player')
  if (!player) return () => undefined

  let lastState: boolean | null = null

  const check = debounce(() => {
    const isAd = isAdShowing(player)
    if (isAd !== lastState) {
      lastState = isAd
      onStateChange(isAd)
    }
  }, 300)

  const observer = new MutationObserver(check)
  observer.observe(player, { attributes: true, attributeFilter: ['class'] })
  // Fire once immediately so we catch an ad already showing when we attach
  check()

  return () => observer.disconnect()
}
