import { describe, it, expect, vi, afterEach } from 'vitest'
import { createVideoEventDetector } from '../../src/content/detector/video-events'

function setupDOM(playerClasses: string[] = [], videoDuration = 30, videoPaused = false) {
  document.body.innerHTML = `
    <div id="movie_player" class="${playerClasses.join(' ')}"></div>
    <video></video>
  `
  const video = document.querySelector('video') as HTMLVideoElement
  Object.defineProperty(video, 'duration', { value: videoDuration, writable: true, configurable: true })
  Object.defineProperty(video, 'paused', { value: videoPaused, writable: true, configurable: true })
  return video
}

describe('createVideoEventDetector', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns no-op cleanup when no video element exists', () => {
    document.body.innerHTML = ''
    const cb = vi.fn()
    const cleanup = createVideoEventDetector(cb)
    expect(() => cleanup()).not.toThrow()
  })

  it('emits true when player has ad-showing, video playing, short duration', () => {
    const video = setupDOM(['ad-showing'], 30, false)
    const cb = vi.fn()
    createVideoEventDetector(cb)

    video.dispatchEvent(new Event('timeupdate'))

    expect(cb).toHaveBeenCalledWith(true)
  })

  it('emits false when video is paused', () => {
    const video = setupDOM(['ad-showing'], 30, true)
    const cb = vi.fn()
    createVideoEventDetector(cb)

    video.dispatchEvent(new Event('timeupdate'))

    expect(cb).toHaveBeenCalledWith(false)
  })

  it('emits false when video duration exceeds 120s', () => {
    const video = setupDOM(['ad-showing'], 300, false)
    const cb = vi.fn()
    createVideoEventDetector(cb)

    video.dispatchEvent(new Event('timeupdate'))

    expect(cb).toHaveBeenCalledWith(false)
  })

  it('emits false when player has no ad class', () => {
    const video = setupDOM(['playing-mode'], 30, false)
    const cb = vi.fn()
    createVideoEventDetector(cb)

    video.dispatchEvent(new Event('timeupdate'))

    expect(cb).toHaveBeenCalledWith(false)
  })

  it('does not emit duplicate events for same state', () => {
    const video = setupDOM(['ad-showing'], 30, false)
    const cb = vi.fn()
    createVideoEventDetector(cb)

    video.dispatchEvent(new Event('timeupdate'))
    video.dispatchEvent(new Event('timeupdate'))

    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('cleanup removes the event listener', () => {
    const video = setupDOM(['ad-showing'], 30, false)
    const cb = vi.fn()
    const cleanup = createVideoEventDetector(cb)
    cleanup()

    video.dispatchEvent(new Event('timeupdate'))

    expect(cb).not.toHaveBeenCalled()
  })
})
