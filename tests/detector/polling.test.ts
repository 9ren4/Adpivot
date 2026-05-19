import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPollingDetector } from '../../src/content/detector/polling'

describe('createPollingDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="movie_player"></div>'
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('does not call onStateChange before activation', () => {
    const cb = vi.fn()
    createPollingDetector(cb)
    vi.advanceTimersByTime(10_000)
    expect(cb).not.toHaveBeenCalled()
  })

  it('calls onStateChange on each poll interval after activate', () => {
    const cb = vi.fn()
    const { activate } = createPollingDetector(cb)
    activate()

    vi.advanceTimersByTime(2000)
    expect(cb).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(2000)
    expect(cb).toHaveBeenCalledTimes(2)
  })

  it('emits true when player has ad-showing class', () => {
    const player = document.getElementById('movie_player')!
    player.classList.add('ad-showing')

    const cb = vi.fn()
    const { activate } = createPollingDetector(cb)
    activate()

    vi.advanceTimersByTime(2000)
    expect(cb).toHaveBeenCalledWith(true)
  })

  it('emits false when player has no ad class', () => {
    const cb = vi.fn()
    const { activate } = createPollingDetector(cb)
    activate()

    vi.advanceTimersByTime(2000)
    expect(cb).toHaveBeenCalledWith(false)
  })

  it('emits false when player is not in DOM', () => {
    document.body.innerHTML = ''
    const cb = vi.fn()
    const { activate } = createPollingDetector(cb)
    activate()

    vi.advanceTimersByTime(2000)
    expect(cb).toHaveBeenCalledWith(false)
  })

  it('stops calling onStateChange after deactivate', () => {
    const cb = vi.fn()
    const { activate, deactivate } = createPollingDetector(cb)
    activate()
    vi.advanceTimersByTime(2000)
    deactivate()
    vi.advanceTimersByTime(10_000)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('activate is idempotent — does not create multiple intervals', () => {
    const cb = vi.fn()
    const { activate, deactivate } = createPollingDetector(cb)
    activate()
    activate()
    activate()
    vi.advanceTimersByTime(2000)
    expect(cb).toHaveBeenCalledTimes(1)
    deactivate()
  })
})
