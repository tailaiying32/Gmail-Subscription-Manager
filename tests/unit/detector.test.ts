import { describe, it, expect, beforeEach } from 'vitest';
import { resetChromeStorage } from '../setup';
import { SubscriptionDetector } from '../../src/background/subscriptions/detector';
import type { GmailMessage } from '../../src/shared/types';
import { STORAGE_KEYS } from '../../src/shared/messages';

function makeMessage(overrides: {
  id?: string;
  from?: string;
  subject?: string;
  date?: string;
  listUnsubscribe?: string;
  listUnsubscribePost?: string;
}): GmailMessage {
  const headers: { name: string; value: string }[] = [];
  if (overrides.from) headers.push({ name: 'From', value: overrides.from });
  if (overrides.subject) headers.push({ name: 'Subject', value: overrides.subject });
  if (overrides.date) headers.push({ name: 'Date', value: overrides.date });
  if (overrides.listUnsubscribe) headers.push({ name: 'List-Unsubscribe', value: overrides.listUnsubscribe });
  if (overrides.listUnsubscribePost) headers.push({ name: 'List-Unsubscribe-Post', value: overrides.listUnsubscribePost });

  return {
    id: overrides.id ?? 'msg-1',
    threadId: 'thread-1',
    payload: { headers },
  };
}

describe('SubscriptionDetector', () => {
  let detector: SubscriptionDetector;

  beforeEach(() => {
    resetChromeStorage();
    detector = new SubscriptionDetector();
  });

  it('parses "Name <email>" format', async () => {
    await detector.processMessages([
      makeMessage({
        from: 'Newsletter Team <news@example.com>',
        listUnsubscribe: '<https://example.com/unsub>',
      }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = Object.values(result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, { senderName: string; senderEmail: string }>);
    expect(subs).toHaveLength(1);
    expect(subs[0].senderName).toBe('Newsletter Team');
    expect(subs[0].senderEmail).toBe('news@example.com');
  });

  it('parses bare email format', async () => {
    await detector.processMessages([
      makeMessage({
        from: 'updates@service.com',
        listUnsubscribe: '<https://service.com/unsub>',
      }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = Object.values(result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, { senderEmail: string }>);
    expect(subs).toHaveLength(1);
    expect(subs[0].senderEmail).toBe('updates@service.com');
  });

  it('classifies noreply email as notification', async () => {
    await detector.processMessages([
      makeMessage({
        from: 'noreply@company.com',
        listUnsubscribe: '<https://company.com/unsub>',
      }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = Object.values(result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, { category: string }>);
    expect(subs[0].category).toBe('notification');
  });

  it('classifies newsletter keyword in subject as newsletter', async () => {
    await detector.processMessages([
      makeMessage({
        from: 'editor@blog.com',
        subject: 'Weekly Newsletter #42',
        listUnsubscribe: '<https://blog.com/unsub>',
      }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = Object.values(result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, { category: string }>);
    expect(subs[0].category).toBe('newsletter');
  });

  it('classifies marketing keywords in email as marketing', async () => {
    await detector.processMessages([
      makeMessage({
        from: 'marketing@store.com',
        subject: 'Sale ends today',
        listUnsubscribe: '<https://store.com/unsub>',
      }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = Object.values(result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, { category: string }>);
    expect(subs[0].category).toBe('marketing');
  });

  it('skips messages without unsubscribe options', async () => {
    await detector.processMessages([
      makeMessage({ from: 'friend@example.com' }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, unknown> | undefined;
    expect(subs ? Object.keys(subs).length : 0).toBe(0);
  });

  it('skips messages without From header', async () => {
    await detector.processMessages([
      { id: 'msg-1', threadId: 't-1', payload: { headers: [{ name: 'List-Unsubscribe', value: '<https://x.com/unsub>' }] } },
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, unknown> | undefined;
    expect(subs ? Object.keys(subs).length : 0).toBe(0);
  });

  it('groups by senderEmail — upserts correctly without duplicates', async () => {
    await detector.processMessages([
      makeMessage({
        id: 'msg-1',
        from: 'Newsletter <news@example.com>',
        listUnsubscribe: '<https://example.com/unsub>',
        date: 'Mon, 01 Jan 2024 10:00:00 GMT',
      }),
      makeMessage({
        id: 'msg-2',
        from: 'Newsletter <news@example.com>',
        listUnsubscribe: '<https://example.com/unsub>',
        date: 'Tue, 02 Jan 2024 10:00:00 GMT',
      }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = Object.values(result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, { emailCount: number; messageIds: string[] }>);
    expect(subs).toHaveLength(1);
    expect(subs[0].emailCount).toBe(2);
    expect(subs[0].messageIds).toContain('msg-1');
    expect(subs[0].messageIds).toContain('msg-2');
  });

  it('creates separate entries for different senders', async () => {
    await detector.processMessages([
      makeMessage({
        id: 'msg-1',
        from: 'news@alpha.com',
        listUnsubscribe: '<https://alpha.com/unsub>',
      }),
      makeMessage({
        id: 'msg-2',
        from: 'news@beta.com',
        listUnsubscribe: '<https://beta.com/unsub>',
      }),
    ]);

    const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
    const subs = Object.values(result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, unknown>);
    expect(subs).toHaveLength(2);
  });
});
