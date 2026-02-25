import type { ExtensionMessage } from '@shared/messages';
import { handleMessage } from './messageHandler';
import { registerAlarms } from './alarms';
import { STORAGE_KEYS } from '@shared/messages';

// ─── Message listener ─────────────────────────────────────────────────────────
// CRITICAL: return true to keep the sendResponse channel open for async handlers
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((err) => sendResponse({ success: false, error: (err as Error).message }));
    return true;
  }
);

// ─── Alarm registration on SW startup ────────────────────────────────────────
registerAlarms();

// ─── Badge count ──────────────────────────────────────────────────────────────
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEYS.SUBSCRIPTIONS]) {
    const subs = Object.values(
      (changes[STORAGE_KEYS.SUBSCRIPTIONS].newValue ?? {}) as Record<string, { status: string }>
    );
    const activeCount = subs.filter((s) => s.status === 'active').length;
    chrome.action.setBadgeText({ text: activeCount > 0 ? String(activeCount) : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
});
