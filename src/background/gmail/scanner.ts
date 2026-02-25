import type { ScanProgress } from '@shared/types';
import { STORAGE_KEYS } from '@shared/messages';
import { SCAN_QUERIES, MAX_HISTORY_AGE_MS } from '@shared/constants';
import { deduplicateIds } from '@shared/utils';
import { GmailClient } from './gmailClient';
import { SubscriptionDetector } from '../subscriptions/detector';

const DEFAULT_PROGRESS: ScanProgress = {
  status: 'idle',
  phase: 'listing',
  totalFound: 0,
  processed: 0,
  percentComplete: 0,
  error: null,
  lastHistoryId: null,
  lastCompletedAt: null,
};

async function updateProgress(patch: Partial<ScanProgress>): Promise<void> {
  const existing = await getProgress();
  await chrome.storage.local.set({
    [STORAGE_KEYS.SCAN_PROGRESS]: { ...existing, ...patch },
  });
}

async function getProgress(): Promise<ScanProgress> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SCAN_PROGRESS);
  return (result[STORAGE_KEYS.SCAN_PROGRESS] as ScanProgress) ?? DEFAULT_PROGRESS;
}

async function fetchAllIds(client: GmailClient, query: string): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const res = await client.listMessages({ q: query, maxResults: 500, pageToken });
    if (res.messages) ids.push(...res.messages.map((m) => m.id));
    pageToken = res.nextPageToken;
  } while (pageToken);

  return ids;
}

export class Scanner {
  private client: GmailClient;
  private detector: SubscriptionDetector;

  constructor(client: GmailClient) {
    this.client = client;
    this.detector = new SubscriptionDetector();
  }

  async startFullScan(): Promise<void> {
    await updateProgress({ status: 'scanning', phase: 'listing', totalFound: 0, processed: 0, percentComplete: 0, error: null });

    try {
      // Phase 1: collect message IDs
      const idSets = await Promise.all(SCAN_QUERIES.map((q) => fetchAllIds(this.client, q)));
      const allIds = deduplicateIds(idSets);

      await updateProgress({ phase: 'fetching', totalFound: allIds.length });

      // Phase 2: batch fetch metadata in chunks, process as we go
      const CHUNK_SIZE = 100;
      for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
        const chunk = allIds.slice(i, i + CHUNK_SIZE);
        const messages = await this.client.batchGetMessages(chunk);
        await this.detector.processMessages(messages);

        const processed = Math.min(i + CHUNK_SIZE, allIds.length);
        await updateProgress({
          processed,
          percentComplete: Math.round((processed / allIds.length) * 100),
        });
      }

      // Phase 3: store current historyId for incremental sync
      const profile = await this.client.getProfile();
      await updateProgress({
        status: 'complete',
        phase: 'done',
        percentComplete: 100,
        lastHistoryId: profile.historyId,
        lastCompletedAt: Date.now(),
      });
    } catch (err) {
      await updateProgress({ status: 'error', error: (err as Error).message });
    }
  }

  async startIncrementalSync(): Promise<void> {
    const progress = await getProgress();

    // Fall back to full scan if no baseline or baseline is too old
    if (
      !progress.lastHistoryId ||
      !progress.lastCompletedAt ||
      Date.now() - progress.lastCompletedAt > MAX_HISTORY_AGE_MS
    ) {
      return this.startFullScan();
    }

    try {
      const historyRes = await this.client.getHistory(progress.lastHistoryId);
      const newIds = (historyRes.history ?? [])
        .flatMap((h) => h.messagesAdded ?? [])
        .map((m) => m.message.id);

      if (newIds.length > 0) {
        const messages = await this.client.batchGetMessages(newIds);
        await this.detector.processMessages(messages);
      }

      await updateProgress({ lastHistoryId: historyRes.historyId, lastCompletedAt: Date.now() });
    } catch {
      // Silently fall back to full scan on history errors (e.g. historyId expired)
      return this.startFullScan();
    }
  }
}
