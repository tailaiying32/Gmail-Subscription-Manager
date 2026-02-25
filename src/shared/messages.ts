import type {
  AuthState,
  ScanProgress,
  Subscription,
  UnsubscribeResult,
} from './types';

// ─── Outbound messages (UI → Service Worker) ─────────────────────────────────

export type ExtensionMessage =
  | { type: 'AUTH_GET_TOKEN'; payload: { interactive: boolean } }
  | { type: 'AUTH_REVOKE' }
  | { type: 'AUTH_GET_STATUS' }
  | { type: 'SCAN_START'; payload: { fullScan: boolean } }
  | { type: 'SCAN_GET_PROGRESS' }
  | { type: 'UNSUBSCRIBE_EXECUTE'; payload: { subscriptionId: string } }
  | { type: 'UNSUBSCRIBE_BULK'; payload: { subscriptionIds: string[] } }
  | { type: 'ARCHIVE_ALL'; payload: { subscriptionId: string } }
  | { type: 'WHITELIST_ADD'; payload: { subscriptionId: string } }
  | { type: 'WHITELIST_REMOVE'; payload: { subscriptionId: string } };

// ─── Response types ───────────────────────────────────────────────────────────

export type MessageResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Response data types per message
export type AuthGetTokenResponse = MessageResponse<{ token: string }>;
export type AuthGetStatusResponse = MessageResponse<AuthState>;
export type ScanStartResponse = MessageResponse<void>;
export type ScanGetProgressResponse = MessageResponse<ScanProgress>;
export type UnsubscribeExecuteResponse = MessageResponse<UnsubscribeResult>;
export type UnsubscribeBulkResponse = MessageResponse<UnsubscribeResult[]>;
export type ArchiveAllResponse = MessageResponse<{ archivedCount: number }>;
export type WhitelistResponse = MessageResponse<void>;

// ─── Storage keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  AUTH: 'auth',
  SUBSCRIPTIONS: 'subscriptions',
  SCAN_PROGRESS: 'scanProgress',
  UNSUBSCRIBE_HISTORY: 'unsubscribeHistory',
  SETTINGS: 'settings',
} as const;

export const SESSION_KEYS = {
  CACHED_TOKEN: 'cachedToken',
} as const;

// ─── Type map for subscriptions storage ──────────────────────────────────────

export type SubscriptionsMap = Record<string, Subscription>;
