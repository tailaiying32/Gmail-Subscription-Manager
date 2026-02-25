// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  lastAuthCheck: number;
}

export interface CachedToken {
  token: string;
  email: string;
  expiresAt: number; // Unix ms
  fetchedAt: number;
}

export interface TokenInfo {
  email: string;
  expiry_date: number;
  scope: string;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export type SubscriptionCategory =
  | 'newsletter'
  | 'marketing'
  | 'notification'
  | 'other';

export type SubscriptionStatus =
  | 'active'
  | 'unsubscribed'
  | 'whitelisted'
  | 'pending';

export interface UnsubscribeOptions {
  mailto: { address: string; subject: string } | null;
  http: string | null;
  isOneClick: boolean;
}

export interface Subscription {
  id: string;
  senderName: string;
  senderEmail: string;
  senderDomain: string;
  emailCount: number;
  firstSeen: number;
  lastReceived: number;
  unsubscribeOptions: UnsubscribeOptions;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  messageIds: string[];
  faviconUrl: string;
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

export type ScanPhase = 'listing' | 'fetching' | 'parsing' | 'done';
export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'error';

export interface ScanProgress {
  status: ScanStatus;
  phase: ScanPhase;
  totalFound: number;
  processed: number;
  percentComplete: number;
  error: string | null;
  lastHistoryId: string | null;
  lastCompletedAt: number | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type UnsubscribeMethod =
  | 'http-one-click'
  | 'http-get'
  | 'mailto';

export interface UnsubscribeResult {
  subscriptionId: string;
  method: UnsubscribeMethod;
  success: boolean;
  error?: string;
  timestamp: number;
}

// ─── Gmail API ───────────────────────────────────────────────────────────────

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  payload?: {
    headers: GmailHeader[];
  };
  internalDate?: string;
}

export interface GmailHistoryRecord {
  messages?: { id: string }[];
}

export interface GmailHistory {
  id: string;
  messagesAdded?: { message: { id: string } }[];
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export type ScanFrequency = 30 | 60 | 360 | 1440;

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  autoScanEnabled: boolean;
  scanFrequencyMinutes: ScanFrequency;
  showBadgeCount: boolean;
  notifyOnNewSubscriptions: boolean;
}
