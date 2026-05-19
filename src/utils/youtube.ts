export function isYouTubeUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com'
  } catch {
    return false
  }
}

export function isValidHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export function getPlayerElement(): Element | null {
  return document.querySelector('#movie_player')
}

export function getVideoElement(): HTMLVideoElement | null {
  return document.querySelector('video')
}

export function isAdShowing(player: Element): boolean {
  return player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting')
}
