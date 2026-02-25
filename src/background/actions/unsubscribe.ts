import type { UnsubscribeResult, UnsubscribeMethod } from '@shared/types';
import { STORAGE_KEYS } from '@shared/messages';
import { MAX_UNSUBSCRIBE_HISTORY } from '@shared/constants';
import { toBase64Url } from '@shared/utils';
import { getSubscription, updateStatus } from '../subscriptions/store';

async function saveResult(result: UnsubscribeResult): Promise<void> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.UNSUBSCRIBE_HISTORY);
  const history = (stored[STORAGE_KEYS.UNSUBSCRIBE_HISTORY] as UnsubscribeResult[]) ?? [];
  history.unshift(result);
  if (history.length > MAX_UNSUBSCRIBE_HISTORY) history.pop();
  await chrome.storage.local.set({ [STORAGE_KEYS.UNSUBSCRIBE_HISTORY]: history });
}

async function httpUnsubscribe(url: string, isOneClick: boolean): Promise<void> {
  if (isOneClick) {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
    });
  } else {
    await fetch(url, { method: 'GET' });
  }
}

async function mailtoUnsubscribe(
  address: string,
  subject: string,
  fromEmail: string,
  sendMessage: (raw: string) => Promise<void>
): Promise<void> {
  const raw = [
    `To: ${address}`,
    `From: ${fromEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain',
    '',
    'Please unsubscribe me from this mailing list.',
  ].join('\r\n');

  await sendMessage(toBase64Url(raw));
}

export async function executeUnsubscribe(
  subscriptionId: string,
  fromEmail: string,
  sendMessage: (raw: string) => Promise<void>
): Promise<UnsubscribeResult> {
  const sub = await getSubscription(subscriptionId);
  if (!sub) {
    return { subscriptionId, method: 'http-get', success: false, error: 'Subscription not found', timestamp: Date.now() };
  }

  const { unsubscribeOptions } = sub;
  let method: UnsubscribeMethod = 'http-get';

  try {
    if (unsubscribeOptions.http) {
      method = unsubscribeOptions.isOneClick ? 'http-one-click' : 'http-get';
      await httpUnsubscribe(unsubscribeOptions.http, unsubscribeOptions.isOneClick);
    } else if (unsubscribeOptions.mailto) {
      method = 'mailto';
      await mailtoUnsubscribe(
        unsubscribeOptions.mailto.address,
        unsubscribeOptions.mailto.subject,
        fromEmail,
        sendMessage
      );
    } else {
      throw new Error('No unsubscribe method available');
    }

    await updateStatus(subscriptionId, 'unsubscribed');
    const result: UnsubscribeResult = { subscriptionId, method, success: true, timestamp: Date.now() };
    await saveResult(result);
    return result;
  } catch (err) {
    const result: UnsubscribeResult = {
      subscriptionId,
      method,
      success: false,
      error: (err as Error).message,
      timestamp: Date.now(),
    };
    await saveResult(result);
    return result;
  }
}
