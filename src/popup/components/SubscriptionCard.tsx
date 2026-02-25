import React, { useState } from 'react';
import type { Subscription } from '../../shared/types';
import { sendMessage } from '../../hooks/useMessage';

interface Props {
  subscription: Subscription;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SubscriptionCard({ subscription: sub }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleUnsubscribe() {
    setStatus('loading');
    const res = await sendMessage({ type: 'UNSUBSCRIBE_EXECUTE', payload: { subscriptionId: sub.id } });
    if (res.success) {
      setStatus('done');
      showToast('Unsubscribed successfully');
    } else {
      setStatus('error');
      showToast(`Failed: ${res.error}`);
    }
  }

  async function handleArchive() {
    const res = await sendMessage({ type: 'ARCHIVE_ALL', payload: { subscriptionId: sub.id } });
    showToast(res.success ? 'All emails archived' : `Failed: ${res.error}`);
  }

  async function handleKeep() {
    await sendMessage({ type: 'WHITELIST_ADD', payload: { subscriptionId: sub.id } });
    showToast('Added to keep list');
  }

  if (status === 'done') return null;

  return (
    <div className={`border-b border-gray-100 p-3 ${status === 'loading' ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <img
          src={sub.faviconUrl}
          alt=""
          className="mt-0.5 h-6 w-6 rounded"
          onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-gray-900">{sub.senderName}</span>
            <span className="shrink-0 text-xs text-gray-400">{sub.emailCount} emails</span>
          </div>
          <p className="text-xs text-gray-400">last {timeAgo(sub.lastReceived)}</p>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={handleUnsubscribe}
          disabled={status === 'loading'}
          className="rounded bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          Unsubscribe
        </button>
        <button
          onClick={handleArchive}
          className="rounded bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
        >
          Archive All
        </button>
        <button
          onClick={handleKeep}
          className="rounded bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 hover:bg-green-100"
        >
          Keep
        </button>
      </div>

      {toast && (
        <p className="mt-1.5 text-xs text-gray-500">{toast}</p>
      )}
    </div>
  );
}
