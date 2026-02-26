import type { ExtensionMessage } from '@shared/messages';
import { STORAGE_KEYS } from '@shared/messages';
import { INCREMENTAL_SYNC_ALARM } from '@shared/constants';
import { handleMessage } from './messageHandler';
import { registerAlarms } from './alarms';
import { getSettings } from './settings/store';
import type { Subscription } from '@shared/types';

// ─── Message listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((err) => sendResponse({ success: false, error: (err as Error).message }));
    return true;
  }
);

// ─── Alarm listener (registered once at module level) ─────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === INCREMENTAL_SYNC_ALARM) {
    handleMessage({ type: 'SCAN_START', payload: { fullScan: false } });
  }
});

// ─── Badge logic ──────────────────────────────────────────────────────────────
async function updateBadge(): Promise<void> {
  const settings = await getSettings();
  if (!settings.showBadgeCount) {
    await chrome.action.setBadgeText({ text: '' });
    return;
  }

  const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
  const subs = Object.values(
    (result[STORAGE_KEYS.SUBSCRIPTIONS] ?? {}) as Record<string, Subscription>
  );
  const activeCount = subs.filter((s) => s.status === 'active').length;
  await chrome.action.setBadgeText({ text: activeCount > 0 ? String(activeCount) : '' });
  await chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes[STORAGE_KEYS.SUBSCRIPTIONS] || changes[STORAGE_KEYS.SETTINGS])) {
    updateBadge();
  }
});

// ─── Cold start ───────────────────────────────────────────────────────────────
registerAlarms();
updateBadge();
