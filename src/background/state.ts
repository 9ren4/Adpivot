interface RuntimeState {
  adActive: boolean
  ytTabId: number | null
  redirectTabId: number | null
}

const state: RuntimeState = {
  adActive: false,
  ytTabId: null,
  redirectTabId: null,
}

export function getState(): Readonly<RuntimeState> {
  return { ...state }
}

export function setState(patch: Partial<RuntimeState>): void {
  Object.assign(state, patch)
}

export function resetState(): void {
  state.adActive = false
  state.ytTabId = null
  state.redirectTabId = null
}
