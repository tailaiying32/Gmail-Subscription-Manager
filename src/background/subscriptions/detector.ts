import type { GmailMessage, Subscription, SubscriptionCategory } from '@shared/types';
import { FAVICON_URL } from '@shared/constants';
import { emailToDomain, hashEmail } from '@shared/utils';
import { parseListUnsubscribe, getHeader } from '../gmail/headerParser';
import { upsertSubscription } from './store';
import { getSettings } from '../settings/store';

function parseFrom(fromHeader: string): { name: string; email: string } {
  // Handle: "Display Name <email@domain.com>" or bare "email@domain.com"
  const match = fromHeader.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].replace(/^["']|["']$/g, '').trim(), email: match[2].trim() };
  }
  return { name: fromHeader.trim(), email: fromHeader.trim() };
}

function classifySender(
  email: string,
  subject: string,
  hasListUnsubscribe: boolean
): SubscriptionCategory {
  const emailLower = email.toLowerCase();
  const subjectLower = subject.toLowerCase();

  if (emailLower.includes('noreply') || emailLower.includes('no-reply')) {
    return 'notification';
  }
  if (emailLower.includes('marketing') || emailLower.includes('promo') || emailLower.includes('deals')) {
    return 'marketing';
  }
  if (
    subjectLower.includes('newsletter') ||
    subjectLower.includes('digest') ||
    subjectLower.includes('weekly') ||
    subjectLower.includes('daily') ||
    subjectLower.includes('monthly')
  ) {
    return 'newsletter';
  }
  if (hasListUnsubscribe) return 'newsletter';
  return 'other';
}

export class SubscriptionDetector {
  async processMessages(messages: GmailMessage[]): Promise<void> {
    let newCount = 0;

    for (const message of messages) {
      const headers = message.payload?.headers ?? [];

      const fromHeader = getHeader(headers, 'From');
      const subjectHeader = getHeader(headers, 'Subject') ?? '';
      const dateHeader = getHeader(headers, 'Date');
      const listUnsub = getHeader(headers, 'List-Unsubscribe');
      const listUnsubPost = getHeader(headers, 'List-Unsubscribe-Post');

      if (!fromHeader) continue;

      const { name, email } = parseFrom(fromHeader);
      const unsubscribeOptions = parseListUnsubscribe(listUnsub, listUnsubPost);

      // Skip messages with no unsubscribe options and no subscription signals
      if (!unsubscribeOptions.http && !unsubscribeOptions.mailto) continue;

      const domain = emailToDomain(email);
      const id = await hashEmail(email);
      const timestamp = dateHeader ? new Date(dateHeader).getTime() : Date.now();

      const sub: Subscription = {
        id,
        senderName: name || email,
        senderEmail: email,
        senderDomain: domain,
        emailCount: 1,
        firstSeen: timestamp,
        lastReceived: timestamp,
        unsubscribeOptions,
        category: classifySender(email, subjectHeader, !!listUnsub),
        status: 'active',
        messageIds: [message.id],
        faviconUrl: `${FAVICON_URL}?domain=${domain}&sz=32`,
      };

      const { isNew } = await upsertSubscription(sub);
      if (isNew) newCount++;
    }

    if (newCount > 0) {
      const settings = await getSettings();
      if (settings.notifyOnNewSubscriptions) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: chrome.runtime.getURL('assets/icon-128.png'),
          title: 'New Subscriptions Found',
          message: `${newCount} new subscription${newCount === 1 ? '' : 's'} detected.`,
        });
      }
    }
  }
}
