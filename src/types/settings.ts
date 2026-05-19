export interface UrlEntry {
  id: string
  label: string
  url: string
  createdAt: number
}

export interface Settings {
  enabled: boolean
  activeUrlId: string | null
  urls: UrlEntry[]
  autoReturn: boolean
  notifyOnEnd: boolean
  onboardingComplete: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  activeUrlId: null,
  urls: [],
  autoReturn: true,
  notifyOnEnd: true,
  onboardingComplete: false,
}
