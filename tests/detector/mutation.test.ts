import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMutationDetector } from '../../src/content/detector/mutation'

describe('createMutationDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div id="movie_player"></div>'
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('returns a no-op cleanup when player is not in the DOM', () => {
    document.body.innerHTML = ''
    const cb = vi.fn()
    const cleanup = createMutationDetector(cb)
    expect(() => cleanup()).not.toThrow()
    expect(cb).not.toHaveBeenCalled()
  })

  it('calls onStateChange(true) when ad-showing class is added', async () => {
    const cb = vi.fn()
    createMutationDetector(cb)

    const player = document.getElementById('movie_player')!
    player.classList.add('ad-showing')

    await Promise.resolve()
    vi.advanceTimersByTime(350)

    expect(cb).toHaveBeenCalledWith(true)
  })

  it('calls onStateChange(false) when ad-showing class is removed', async () => {
    const player = document.getElementById('movie_player')!
    player.classList.add('ad-showing')

    const cb = vi.fn()
    createMutationDetector(cb)

    player.classList.remove('ad-showing')

    await Promise.resolve()
    vi.advanceTimersByTime(350)

    expect(cb).toHaveBeenCalledWith(false)
  })

  it('does not emit duplicate events for the same state', async () => {
    const cb = vi.fn()
    createMutationDetector(cb)

    const player = document.getElementById('movie_player')!
    player.classList.add('ad-showing')
    await Promise.resolve()
    vi.advanceTimersByTime(350)

    player.classList.add('other-class')
    await Promise.resolve()
    vi.advanceTimersByTime(350)

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith(true)
  })

  it('cleanup disconnects the observer', async () => {
    const cb = vi.fn()
    const cleanup = createMutationDetector(cb)
    cleanup()

    const player = document.getElementById('movie_player')!
    player.classList.add('ad-showing')
    await Promise.resolve()
    vi.advanceTimersByTime(350)

    expect(cb).not.toHaveBeenCalled()
  })
})
