import { vi, beforeEach } from 'vitest'

const mockStorageData: Record<string, unknown> = {}

function makeMockStorage() {
  return {
    get: vi.fn((keys: string | string[], callback: (result: Record<string, unknown>) => void) => {
      const result: Record<string, unknown> = {}
      const ks = typeof keys === 'string' ? [keys] : keys
      ks.forEach(k => { result[k] = mockStorageData[k] })
      callback(result)
    }),
    set: vi.fn((items: Record<string, unknown>, callback?: () => void) => {
      Object.assign(mockStorageData, items)
      callback?.()
    }),
    remove: vi.fn((_keys: string | string[], callback?: () => void) => {
      callback?.()
    }),
  }
}

const mockStorage = makeMockStorage()

const mockTabsOnRemovedListeners: ((tabId: number) => void)[] = []

const chromeMock = {
  storage: {
    local: mockStorage,
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue(undefined),
    onMessage: { addListener: vi.fn() },
    onInstalled: { addListener: vi.fn() },
    getURL: vi.fn((path: string) => `chrome-extension://test-extension-id/${path}`),
    openOptionsPage: vi.fn(),
    lastError: undefined as chrome.runtime.LastError | undefined,
  },
  tabs: {
    create: vi.fn().mockResolvedValue({ id: 999, windowId: 1 }),
    update: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({ id: 1, windowId: 1 }),
    remove: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([]),
    onRemoved: {
      addListener: vi.fn((cb: (tabId: number) => void) => {
        mockTabsOnRemovedListeners.push(cb)
      }),
    },
  },
  windows: {
    update: vi.fn().mockResolvedValue({}),
  },
  notifications: {
    create: vi.fn(),
    clear: vi.fn(),
  },
}

beforeEach(() => {
  Object.keys(mockStorageData).forEach(k => delete mockStorageData[k])
  vi.clearAllMocks()

  mockStorage.get.mockImplementation(
    (keys: string | string[], callback: (result: Record<string, unknown>) => void) => {
      const result: Record<string, unknown> = {}
      const ks = typeof keys === 'string' ? [keys] : keys
      ks.forEach(k => { result[k] = mockStorageData[k] })
      callback(result)
    }
  )

  mockStorage.set.mockImplementation((items: Record<string, unknown>, callback?: () => void) => {
    Object.assign(mockStorageData, items)
    callback?.()
  })

  chromeMock.tabs.create.mockResolvedValue({ id: 999, windowId: 1 })
  chromeMock.tabs.get.mockResolvedValue({ id: 1, windowId: 1 })
  chromeMock.tabs.update.mockResolvedValue({})
  chromeMock.tabs.remove.mockResolvedValue(undefined)
  chromeMock.windows.update.mockResolvedValue({})
})

Object.defineProperty(globalThis, 'chrome', { value: chromeMock, writable: true })

export { chromeMock, mockStorageData, mockTabsOnRemovedListeners }
