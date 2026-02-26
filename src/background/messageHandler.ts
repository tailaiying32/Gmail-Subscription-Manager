import type { ExtensionMessage, MessageResponse } from '@shared/messages';
import { getAccessToken, revokeToken } from './auth/tokenManager';
import { refreshAuthState, getAuthState } from './auth/authState';
import { GmailClient } from './gmail/gmailClient';
import { Scanner } from './gmail/scanner';
import { executeUnsubscribe } from './actions/unsubscribe';
import { archiveAll } from './actions/archive';
import { updateStatus } from './subscriptions/store';
import { patchSettings } from './settings/store';
import { registerAlarms } from './alarms';
import { STORAGE_KEYS } from '@shared/messages';

let activeScan: Promise<void> | null = null;

function makeClient(): GmailClient {
  return new GmailClient(() =>
    getAccessToken(false).then((t) => {
      if (!t) throw new Error('Not authenticated');
      return t;
    })
  );
}

export async function handleMessage(
  message: ExtensionMessage
): Promise<MessageResponse<unknown>> {
  try {
    switch (message.type) {
      case 'AUTH_GET_TOKEN': {
        const token = await getAccessToken(message.payload.interactive);
        if (!token) return { success: false, error: 'Authentication failed' };
        await refreshAuthState();
        return { success: true, data: { token } };
      }

      case 'AUTH_REVOKE': {
        await revokeToken();
        return { success: true, data: undefined };
      }

      case 'AUTH_GET_STATUS': {
        const state = await getAuthState();
        return { success: true, data: state };
      }

      case 'SCAN_START': {
        if (activeScan) {
          return { success: false, error: 'Scan already in progress' };
        }
        const client = makeClient();
        const scanner = new Scanner(client);
        const scanPromise = message.payload.fullScan
          ? scanner.startFullScan()
          : scanner.startIncrementalSync();
        activeScan = scanPromise.finally(() => { activeScan = null; });
        return { success: true, data: undefined };
      }

      case 'SCAN_GET_PROGRESS': {
        const result = await chrome.storage.local.get(STORAGE_KEYS.SCAN_PROGRESS);
        return { success: true, data: result[STORAGE_KEYS.SCAN_PROGRESS] ?? null };
      }

      case 'UNSUBSCRIBE_EXECUTE': {
        const client = makeClient();
        const authState = await getAuthState();
        const fromEmail = authState.userEmail ?? '';
        const result = await executeUnsubscribe(
          message.payload.subscriptionId,
          fromEmail,
          (raw) => client.sendMessage(raw)
        );
        return { success: true, data: result };
      }

      case 'UNSUBSCRIBE_BULK': {
        const client = makeClient();
        const authState = await getAuthState();
        const fromEmail = authState.userEmail ?? '';
        const results = [];
        for (const id of message.payload.subscriptionIds) {
          const result = await executeUnsubscribe(id, fromEmail, (raw) => client.sendMessage(raw));
          results.push(result);
        }
        return { success: true, data: results };
      }

      case 'ARCHIVE_ALL': {
        const client = makeClient();
        const result = await archiveAll(message.payload.subscriptionId, client);
        return { success: true, data: result };
      }

      case 'WHITELIST_ADD': {
        await updateStatus(message.payload.subscriptionId, 'whitelisted');
        return { success: true, data: undefined };
      }

      case 'WHITELIST_REMOVE': {
        await updateStatus(message.payload.subscriptionId, 'active');
        return { success: true, data: undefined };
      }

      case 'SETTINGS_UPDATE': {
        const updated = await patchSettings(message.payload);
        await registerAlarms();
        return { success: true, data: updated };
      }

      default:
        return { success: false, error: 'Unknown message type' };
    }
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
