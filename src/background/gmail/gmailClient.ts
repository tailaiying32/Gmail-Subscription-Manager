import type { GmailMessage, GmailHistory } from '@shared/types';
import { GMAIL_BASE, BATCH_DELAY_MS } from '@shared/constants';
import { sleep } from '@shared/utils';
import { batchGetMessageMetadata } from './batchRequest';

export class GmailClient {
  constructor(private getToken: () => Promise<string>) {}

  private async fetch<T>(path: string, options?: RequestInit, attempt = 0): Promise<T> {
    const token = await this.getToken();
    const res = await fetch(`${GMAIL_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (res.status === 429 || res.status === 403) {
      if (attempt >= 4) throw new Error(`Rate limit exceeded after ${attempt + 1} attempts`);
      await sleep(BATCH_DELAY_MS * Math.pow(2, attempt));
      return this.fetch<T>(path, options, attempt + 1);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gmail API ${res.status}: ${body}`);
    }
    return res.json() as Promise<T>;
  }

  async listMessages(params: {
    q: string;
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ messages?: { id: string }[]; nextPageToken?: string }> {
    const query = new URLSearchParams({
      q: params.q,
      maxResults: String(params.maxResults ?? 500),
      ...(params.pageToken ? { pageToken: params.pageToken } : {}),
    });
    return this.fetch(`/messages?${query}`);
  }

  async getMessage(
    id: string,
    metadataHeaders: string[]
  ): Promise<GmailMessage> {
    const query = new URLSearchParams({ format: 'metadata' });
    metadataHeaders.forEach((h) => query.append('metadataHeaders', h));
    return this.fetch(`/messages/${id}?${query}`);
  }

  async batchGetMessages(ids: string[]): Promise<GmailMessage[]> {
    const token = await this.getToken();
    return batchGetMessageMetadata(ids, token);
  }

  async getHistory(startHistoryId: string): Promise<{ history?: GmailHistory[]; historyId: string }> {
    const query = new URLSearchParams({
      startHistoryId,
      historyTypes: 'messageAdded',
    });
    return this.fetch(`/history?${query}`);
  }

  async modifyMessage(
    id: string,
    addLabelIds: string[],
    removeLabelIds: string[]
  ): Promise<void> {
    await this.fetch(`/messages/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify({ addLabelIds, removeLabelIds }),
    });
  }

  async sendMessage(rawBase64url: string): Promise<void> {
    await this.fetch('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw: rawBase64url }),
    });
  }

  async getProfile(): Promise<{ emailAddress: string; historyId: string }> {
    return this.fetch('/profile');
  }
}
