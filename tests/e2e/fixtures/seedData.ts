/**
 * Pre-built fixture data for E2E tests.
 * Seeds auth state + subscriptions so tests don't need real Gmail access.
 */

export const AUTH_STATE = {
  isAuthenticated: true,
  userEmail: 'testuser@gmail.com',
  lastAuthCheck: Date.now(),
};

export const SCAN_PROGRESS = {
  status: 'complete' as const,
  phase: 'done' as const,
  totalFound: 3,
  processed: 3,
  percentComplete: 100,
  error: null,
  lastHistoryId: '12345',
  lastCompletedAt: Date.now(),
};

export const SUBSCRIPTIONS = {
  'sub-newsletter': {
    id: 'sub-newsletter',
    senderName: 'Weekly Digest',
    senderEmail: 'digest@newsletter.com',
    senderDomain: 'newsletter.com',
    emailCount: 24,
    firstSeen: Date.now() - 90 * 86400000,
    lastReceived: Date.now() - 86400000,
    unsubscribeOptions: {
      mailto: null,
      http: 'https://newsletter.com/unsub?token=abc',
      isOneClick: true,
    },
    category: 'newsletter',
    status: 'active',
    messageIds: ['m1', 'm2', 'm3'],
    faviconUrl: 'https://www.google.com/s2/favicons?domain=newsletter.com&sz=32',
  },
  'sub-marketing': {
    id: 'sub-marketing',
    senderName: 'Big Store Deals',
    senderEmail: 'deals@bigstore.com',
    senderDomain: 'bigstore.com',
    emailCount: 52,
    firstSeen: Date.now() - 180 * 86400000,
    lastReceived: Date.now() - 3600000,
    unsubscribeOptions: {
      mailto: { address: 'unsub@bigstore.com', subject: 'Unsubscribe' },
      http: 'https://bigstore.com/unsub',
      isOneClick: false,
    },
    category: 'marketing',
    status: 'active',
    messageIds: ['m4', 'm5'],
    faviconUrl: 'https://www.google.com/s2/favicons?domain=bigstore.com&sz=32',
  },
  'sub-notification': {
    id: 'sub-notification',
    senderName: 'GitHub',
    senderEmail: 'noreply@github.com',
    senderDomain: 'github.com',
    emailCount: 150,
    firstSeen: Date.now() - 365 * 86400000,
    lastReceived: Date.now() - 600000,
    unsubscribeOptions: {
      mailto: null,
      http: 'https://github.com/notifications/unsubscribe',
      isOneClick: false,
    },
    category: 'notification',
    status: 'active',
    messageIds: ['m6', 'm7', 'm8'],
    faviconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=32',
  },
};

export const SETTINGS = {
  theme: 'system' as const,
  autoScanEnabled: true,
  scanFrequencyMinutes: 30 as const,
  showBadgeCount: true,
  notifyOnNewSubscriptions: false,
};

/** All seed data in one object, keyed by STORAGE_KEYS values. */
export const ALL_SEED_DATA = {
  auth: AUTH_STATE,
  scanProgress: SCAN_PROGRESS,
  subscriptions: SUBSCRIPTIONS,
  settings: SETTINGS,
};
