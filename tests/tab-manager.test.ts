import { describe, it, expect, beforeEach } from 'vitest'
import { chromeMock } from './setup'
import { openRedirect, focusYouTubeTab, closeRedirectTab } from '../src/background/tab-manager'
import { getState, resetState, setState } from '../src/background/state'

beforeEach(() => { resetState() })

describe('openRedirect', () => {
  it('creates a tab with the given URL and stores its id', async () => {
    chromeMock.tabs.create.mockResolvedValue({ id: 42, windowId: 1 })
    await openRedirect('https://mail.google.com')
    expect(chromeMock.tabs.create).toHaveBeenCalledWith({ url: 'https://mail.google.com', active: true })
    expect(getState().redirectTabId).toBe(42)
  })
})

describe('focusYouTubeTab', () => {
  it('does nothing when ytTabId is null', async () => {
    await focusYouTubeTab()
    expect(chromeMock.tabs.get).not.toHaveBeenCalled()
  })

  it('focuses the YouTube tab and its window', async () => {
    setState({ ytTabId: 10 })
    chromeMock.tabs.get.mockResolvedValue({ id: 10, windowId: 5 })
    await focusYouTubeTab()
    expect(chromeMock.tabs.update).toHaveBeenCalledWith(10, { active: true })
    expect(chromeMock.windows.update).toHaveBeenCalledWith(5, { focused: true })
  })

  it('clears ytTabId when the tab no longer exists', async () => {
    setState({ ytTabId: 99 })
    chromeMock.tabs.get.mockRejectedValue(new Error('No tab'))
    await focusYouTubeTab()
    expect(getState().ytTabId).toBeNull()
  })
})

describe('closeRedirectTab', () => {
  it('does nothing when redirectTabId is null', async () => {
    await closeRedirectTab()
    expect(chromeMock.tabs.remove).not.toHaveBeenCalled()
  })

  it('removes the redirect tab and clears state', async () => {
    setState({ redirectTabId: 55 })
    await closeRedirectTab()
    expect(chromeMock.tabs.remove).toHaveBeenCalledWith(55)
    expect(getState().redirectTabId).toBeNull()
  })

  it('clears redirectTabId even if tab was already closed', async () => {
    setState({ redirectTabId: 55 })
    chromeMock.tabs.remove.mockRejectedValue(new Error('No tab'))
    await closeRedirectTab()
    expect(getState().redirectTabId).toBeNull()
  })
})
