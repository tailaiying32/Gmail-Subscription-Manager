import { getSubscription } from '../subscriptions/store';
import { GmailClient } from '../gmail/gmailClient';
import { sleep } from '@shared/utils';

export async function archiveAll(
  subscriptionId: string,
  client: GmailClient
): Promise<{ archivedCount: number }> {
  const sub = await getSubscription(subscriptionId);
  if (!sub) throw new Error('Subscription not found');

  let archivedCount = 0;

  for (const id of sub.messageIds) {
    await client.modifyMessage(id, [], ['INBOX']);
    archivedCount++;
    await sleep(100); // 10 requests/sec max
  }

  return { archivedCount };
}
