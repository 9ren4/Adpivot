import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSkipDetector } from '../../src/content/detector/skip'

describe('createSkipDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('clicks the skip button when it becomes visible', () => {
    document.body.innerHTML = '<button class="ytp-ad-skip-button-modern" style="display:block"></button>'
    const btn = document.querySelector<HTMLElement>('.ytp-ad-skip-button-modern')!
    const clickSpy = vi.spyOn(btn, 'click')

    // offsetParent is null in jsdom — patch it so the button is considered visible
    Object.defineProperty(btn, 'offsetParent', { value: document.body, configurable: true })

    createSkipDetector()
    vi.advanceTimersByTime(500)

    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('does not click when no skip button is present', () => {
    createSkipDetector()
    vi.advanceTimersByTime(2000)
    // no throw, no click — just verifies it doesn't crash on empty DOM
  })

  it('falls back to legacy .ytp-ad-skip-button selector', () => {
    document.body.innerHTML = '<button class="ytp-ad-skip-button" style="display:block"></button>'
    const btn = document.querySelector<HTMLElement>('.ytp-ad-skip-button')!
    Object.defineProperty(btn, 'offsetParent', { value: document.body, configurable: true })
    const clickSpy = vi.spyOn(btn, 'click')

    createSkipDetector()
    vi.advanceTimersByTime(500)

    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('cleanup stops the interval', () => {
    document.body.innerHTML = '<button class="ytp-ad-skip-button-modern"></button>'
    const btn = document.querySelector<HTMLElement>('.ytp-ad-skip-button-modern')!
    Object.defineProperty(btn, 'offsetParent', { value: document.body, configurable: true })
    const clickSpy = vi.spyOn(btn, 'click')

    const cleanup = createSkipDetector()
    cleanup()
    vi.advanceTimersByTime(2000)

    expect(clickSpy).not.toHaveBeenCalled()
  })
})
