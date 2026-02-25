export const GMAIL_BASE = 'https://www.googleapis.com/gmail/v1/users/me';
export const BATCH_URL = 'https://www.googleapis.com/batch/gmail/v1';
export const TOKEN_INFO_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
export const FAVICON_URL = 'https://www.google.com/s2/favicons';

export const BATCH_SIZE = 50;
export const BATCH_DELAY_MS = 1000;
export const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_HISTORY_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const MAX_UNSUBSCRIBE_HISTORY = 100;
export const UNDO_WINDOW_MS = 10_000;

export const SCAN_QUERIES = [
  'in:inbox has:list-unsubscribe',
  'in:inbox from:(noreply OR no-reply OR newsletter OR subscriptions OR updates)',
] as const;

export const INCREMENTAL_SYNC_ALARM = 'incrementalSync';
