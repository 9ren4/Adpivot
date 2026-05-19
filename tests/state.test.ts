import { describe, it, expect, beforeEach } from 'vitest'
import { getState, setState, resetState } from '../src/background/state'

beforeEach(() => { resetState() })

describe('getState', () => {
  it('returns initial state', () => {
    expect(getState()).toEqual({ adActive: false, ytTabId: null, redirectTabId: null })
  })

  it('returns a copy, not the live reference', () => {
    const s = getState()
    ;(s as Record<string, unknown>)['adActive'] = true
    expect(getState().adActive).toBe(false)
  })
})

describe('setState', () => {
  it('merges partial updates', () => {
    setState({ adActive: true, ytTabId: 5 })
    expect(getState()).toEqual({ adActive: true, ytTabId: 5, redirectTabId: null })
  })

  it('overwrites only the specified keys', () => {
    setState({ ytTabId: 10 })
    setState({ redirectTabId: 20 })
    expect(getState().ytTabId).toBe(10)
    expect(getState().redirectTabId).toBe(20)
  })
})

describe('resetState', () => {
  it('clears all state back to initial values', () => {
    setState({ adActive: true, ytTabId: 3, redirectTabId: 7 })
    resetState()
    expect(getState()).toEqual({ adActive: false, ytTabId: null, redirectTabId: null })
  })
})
