import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetChromeStorage } from '../setup';
import { executeUnsubscribe } from '../../src/background/actions/unsubscribe';
import { STORAGE_KEYS } from '../../src/shared/messages';
import type { Subscription } from '../../src/shared/types';

function makeSub(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 'sub-1',
    senderName: 'Test Sender',
    senderEmail: 'sender@example.com',
    senderDomain: 'example.com',
    emailCount: 5,
    firstSeen: Date.now() - 86400000,
    lastReceived: Date.now(),
    unsubscribeOptions: { mailto: null, http: null, isOneClick: false },
    category: 'newsletter',
    status: 'active',
    messageIds: ['m1', 'm2'],
    faviconUrl: 'https://example.com/favicon.ico',
    ...overrides,
  };
}

async function seedSubscription(sub: Subscription) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.SUBSCRIPTIONS]: { [sub.id]: sub },
  });
}

describe('executeUnsubscribe', () => {
  beforeEach(() => {
    resetChromeStorage();
    vi.restoreAllMocks();
  });

  it('performs GET for standard HTTP URLs', async () => {
    const sub = makeSub({
      unsubscribeOptions: { http: 'https://example.com/unsub', mailto: null, isOneClick: false },
    });
    await seedSubscription(sub);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('OK', { status: 200 }));
    const sendMessage = vi.fn();

    const result = await executeUnsubscribe('sub-1', 'user@gmail.com', sendMessage);

    expect(result.success).toBe(true);
    expect(result.method).toBe('http-get');
    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/unsub', { method: 'GET' });
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('performs POST with correct body for one-click', async () => {
    const sub = makeSub({
      unsubscribeOptions: { http: 'https://example.com/unsub', mailto: null, isOneClick: true },
    });
    await seedSubscription(sub);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('OK', { status: 200 }));
    const sendMessage = vi.fn();

    const result = await executeUnsubscribe('sub-1', 'user@gmail.com', sendMessage);

    expect(result.success).toBe(true);
    expect(result.method).toBe('http-one-click');
    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/unsub', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
    });
  });

  it('builds correct message for mailto unsubscribe', async () => {
    const sub = makeSub({
      unsubscribeOptions: {
        http: null,
        mailto: { address: 'unsub@example.com', subject: 'Unsubscribe' },
        isOneClick: false,
      },
    });
    await seedSubscription(sub);

    const sendMessage = vi.fn().mockResolvedValue(undefined);

    const result = await executeUnsubscribe('sub-1', 'user@gmail.com', sendMessage);

    expect(result.success).toBe(true);
    expect(result.method).toBe('mailto');
    expect(sendMessage).toHaveBeenCalledOnce();

    // Decode the base64url message to verify RFC 2822 format
    const raw = sendMessage.mock.calls[0][0] as string;
    const decoded = decodeURIComponent(escape(atob(raw.replace(/-/g, '+').replace(/_/g, '/'))));
    expect(decoded).toContain('To: unsub@example.com');
    expect(decoded).toContain('From: user@gmail.com');
    expect(decoded).toContain('Subject: Unsubscribe');
  });

  it('returns failure for missing subscription', async () => {
    const result = await executeUnsubscribe('nonexistent', 'user@gmail.com', vi.fn());
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('returns failure on network error', async () => {
    const sub = makeSub({
      unsubscribeOptions: { http: 'https://example.com/unsub', mailto: null, isOneClick: false },
    });
    await seedSubscription(sub);

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const result = await executeUnsubscribe('sub-1', 'user@gmail.com', vi.fn());
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });

  it('returns failure on non-OK HTTP response', async () => {
    const sub = makeSub({
      unsubscribeOptions: { http: 'https://example.com/unsub', mailto: null, isOneClick: false },
    });
    await seedSubscription(sub);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Server Error', { status: 500 }));

    const result = await executeUnsubscribe('sub-1', 'user@gmail.com', vi.fn());
    expect(result.success).toBe(false);
    expect(result.error).toContain('500');
  });

  it('updates subscription status to unsubscribed on success', async () => {
    const sub = makeSub({
      unsubscribeOptions: { http: 'https://example.com/unsub', mailto: null, isOneClick: false },
    });
    await seedSubscription(sub);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('OK', { status: 200 }));

    await executeUnsubscribe('sub-1', 'user@gmail.com', vi.fn());

    const stored = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = stored[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, Subscription>;
    expect(subs['sub-1'].status).toBe('unsubscribed');
  });

  it('saves result to unsubscribe history', async () => {
    const sub = makeSub({
      unsubscribeOptions: { http: 'https://example.com/unsub', mailto: null, isOneClick: false },
    });
    await seedSubscription(sub);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('OK', { status: 200 }));

    await executeUnsubscribe('sub-1', 'user@gmail.com', vi.fn());

    const stored = await chrome.storage.local.get(STORAGE_KEYS.UNSUBSCRIBE_HISTORY);
    const history = stored[STORAGE_KEYS.UNSUBSCRIBE_HISTORY] as unknown[];
    expect(history).toHaveLength(1);
  });
});
