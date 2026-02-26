import { vi } from 'vitest';

// ─── Chrome API mocks ────────────────────────────────────────────────────────
// Provide minimal stubs so background code that touches chrome.* doesn't crash.

const storageData: Record<string, unknown> = {};
const listeners: Array<(changes: Record<string, chrome.storage.StorageChange>, area: string) => void> = [];

const localStorageMock = {
  get: vi.fn(async (keys?: string | string[] | Record<string, unknown> | null) => {
    if (!keys) return { ...storageData };
    const keyList = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
    const result: Record<string, unknown> = {};
    for (const k of keyList) {
      if (k in storageData) result[k] = storageData[k];
    }
    return result;
  }),
  set: vi.fn(async (items: Record<string, unknown>) => {
    const changes: Record<string, chrome.storage.StorageChange> = {};
    for (const [key, value] of Object.entries(items)) {
      changes[key] = { oldValue: storageData[key], newValue: value };
      storageData[key] = value;
    }
    for (const fn of listeners) fn(changes, 'local');
  }),
  remove: vi.fn(async (keys: string | string[]) => {
    const keyList = typeof keys === 'string' ? [keys] : keys;
    for (const k of keyList) delete storageData[k];
  }),
  clear: vi.fn(async () => {
    for (const k of Object.keys(storageData)) delete storageData[k];
  }),
};

const chromeMock = {
  storage: {
    local: localStorageMock,
    session: {
      get: vi.fn(async () => ({})),
      set: vi.fn(async () => {}),
      remove: vi.fn(async () => {}),
    },
    onChanged: {
      addListener: vi.fn((fn: typeof listeners[0]) => listeners.push(fn)),
      removeListener: vi.fn((fn: typeof listeners[0]) => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      }),
    },
  },
  runtime: {
    getURL: vi.fn((path: string) => `chrome-extension://fake-id/${path}`),
    sendMessage: vi.fn(async () => ({ success: true, data: undefined })),
  },
  action: {
    setBadgeText: vi.fn(async () => {}),
    setBadgeBackgroundColor: vi.fn(async () => {}),
  },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(async () => true),
    getAll: vi.fn(async () => []),
    onAlarm: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  notifications: {
    create: vi.fn(),
  },
  identity: {
    getAuthToken: vi.fn(),
    removeCachedAuthToken: vi.fn(),
  },
};

// Assign to global
Object.assign(globalThis, { chrome: chromeMock });

// Helper to reset storage between tests
export function resetChromeStorage() {
  for (const k of Object.keys(storageData)) delete storageData[k];
  listeners.length = 0;
}

export { chromeMock, storageData };
