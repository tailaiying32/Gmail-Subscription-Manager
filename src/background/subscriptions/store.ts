import type { Subscription, SubscriptionStatus } from '@shared/types';
import { STORAGE_KEYS } from '@shared/messages';

async function getAll(): Promise<Record<string, Subscription>> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
  return (result[STORAGE_KEYS.SUBSCRIPTIONS] as Record<string, Subscription>) ?? {};
}

async function saveAll(subs: Record<string, Subscription>): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SUBSCRIPTIONS]: subs });
}

export async function upsertSubscription(sub: Subscription): Promise<void> {
  const all = await getAll();
  const existing = all[sub.id];

  if (existing) {
    all[sub.id] = {
      ...existing,
      emailCount: existing.emailCount + sub.emailCount,
      lastReceived: Math.max(existing.lastReceived, sub.lastReceived),
      firstSeen: Math.min(existing.firstSeen, sub.firstSeen),
      messageIds: [...new Set([...existing.messageIds, ...sub.messageIds])],
      // Preserve user-set status (don't overwrite 'whitelisted' or 'unsubscribed')
      status: existing.status === 'active' ? sub.status : existing.status,
      unsubscribeOptions: sub.unsubscribeOptions,
    };
  } else {
    all[sub.id] = sub;
  }

  await saveAll(all);
}

export async function updateStatus(id: string, status: SubscriptionStatus): Promise<void> {
  const all = await getAll();
  if (all[id]) {
    all[id] = { ...all[id], status };
    await saveAll(all);
  }
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  const all = await getAll();
  return all[id] ?? null;
}

export async function getAllSubscriptions(): Promise<Record<string, Subscription>> {
  return getAll();
}

export async function removeSubscription(id: string): Promise<void> {
  const all = await getAll();
  delete all[id];
  await saveAll(all);
}
