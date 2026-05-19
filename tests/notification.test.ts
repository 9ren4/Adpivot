import { describe, it, expect } from 'vitest'
import { chromeMock } from './setup'
import { notifyAdEnded } from '../src/background/notification'

describe('notifyAdEnded', () => {
  it('calls chrome.notifications.create with correct parameters', () => {
    notifyAdEnded()
    expect(chromeMock.notifications.create).toHaveBeenCalledWith(
      'ad-redirect-ended',
      expect.objectContaining({
        type: 'basic',
        title: 'AdRedirect',
        message: 'Ad finished — your video is ready.',
      })
    )
  })
})
