import { describe, it, expect, beforeEach } from 'vitest'
import { isYouTubeUrl, isValidHttpsUrl, isAdShowing } from '../../src/utils/youtube'

describe('isYouTubeUrl', () => {
  it('returns true for www.youtube.com', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=abc')).toBe(true)
  })

  it('returns true for youtube.com without www', () => {
    expect(isYouTubeUrl('https://youtube.com/watch?v=abc')).toBe(true)
  })

  it('returns false for other domains', () => {
    expect(isYouTubeUrl('https://google.com')).toBe(false)
  })

  it('returns false for invalid URLs', () => {
    expect(isYouTubeUrl('not-a-url')).toBe(false)
  })
})

describe('isValidHttpsUrl', () => {
  it('returns true for https URLs', () => {
    expect(isValidHttpsUrl('https://mail.google.com')).toBe(true)
  })

  it('returns false for http URLs', () => {
    expect(isValidHttpsUrl('http://example.com')).toBe(false)
  })

  it('returns false for javascript: URLs', () => {
    expect(isValidHttpsUrl('javascript:alert(1)')).toBe(false)
  })

  it('returns false for invalid strings', () => {
    expect(isValidHttpsUrl('not-a-url')).toBe(false)
  })
})

describe('isAdShowing', () => {
  let player: HTMLDivElement

  beforeEach(() => {
    player = document.createElement('div')
  })

  it('returns true when player has ad-showing class', () => {
    player.classList.add('ad-showing')
    expect(isAdShowing(player)).toBe(true)
  })

  it('returns true when player has ad-interrupting class', () => {
    player.classList.add('ad-interrupting')
    expect(isAdShowing(player)).toBe(true)
  })

  it('returns false when player has no ad classes', () => {
    player.classList.add('playing-mode')
    expect(isAdShowing(player)).toBe(false)
  })

  it('returns false for an empty player element', () => {
    expect(isAdShowing(player)).toBe(false)
  })
})
