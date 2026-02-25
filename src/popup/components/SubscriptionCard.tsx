import React, { useState } from 'react';
import type { Subscription } from '../../shared/types';
import { Icon, Button, StatusChip } from '../../components/md3';
import { sendMessage } from '../../hooks/useMessage';

interface Props { subscription: Subscription }

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : `${Math.floor(d / 30)}mo ago`;
}

const categoryIcon: Record<string, string> = {
  newsletter: 'newspaper', marketing: 'sell', notification: 'notifications', other: 'mail',
};

export function SubscriptionCard({ subscription: sub }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  async function handleUnsubscribe() {
    setState('loading');
    const res = await sendMessage({ type: 'UNSUBSCRIBE_EXECUTE', payload: { subscriptionId: sub.id } });
    if (res.success) { setState('done'); }
    else { setState('error'); showToast(res.error ?? 'Failed'); setTimeout(() => setState('idle'), 3000); }
  }

  async function handleArchive() {
    const res = await sendMessage({ type: 'ARCHIVE_ALL', payload: { subscriptionId: sub.id } });
    showToast(res.success ? 'Archived' : `Failed: ${res.error}`);
  }

  async function handleKeep() {
    await sendMessage({ type: 'WHITELIST_ADD', payload: { subscriptionId: sub.id } });
    setState('done');
  }

  if (state === 'done') return null;

  return (
    // Elevated card: surface-container-low + shadow — no border
    <div className={`mx-3 mb-2 rounded-xl bg-surface-container-low overflow-hidden transition-opacity ${state === 'loading' ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Favicon in primary container circle */}
        <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
          {imgError ? (
            <Icon name={categoryIcon[sub.category] ?? 'mail'} size={20} className="text-primary" />
          ) : (
            <img src={sub.faviconUrl} alt="" className="h-6 w-6 object-contain"
              onError={() => setImgError(true)}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-title-sm text-surface-on truncate">{sub.senderName}</p>
          <p className="text-body-sm text-surface-on-variant truncate">{sub.senderEmail}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-label-lg font-medium text-surface-on">{sub.emailCount}</p>
          <p className="text-label-sm text-surface-on-variant">emails</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pb-2">
        <StatusChip label={sub.category} color={sub.category === 'newsletter' ? 'blue' : sub.category === 'marketing' ? 'red' : 'gray'} />
        <span className="text-body-sm text-surface-on-variant">· {timeAgo(sub.lastReceived)}</span>
      </div>

      <div className="flex gap-2 px-3 pb-3">
        <Button variant="filled"   onClick={handleUnsubscribe} disabled={state === 'loading'} className="flex-1 py-1.5 text-label-md">Unsubscribe</Button>
        <Button variant="tonal"    onClick={handleArchive}     className="flex-1 py-1.5 text-label-md">Archive</Button>
        <Button variant="text"     onClick={handleKeep}        className="flex-1 py-1.5 text-label-md">Keep</Button>
      </div>

      {toast && (
        <div className={`px-4 py-2 text-body-sm ${state === 'error' ? 'bg-error-container text-error-on-container' : 'bg-secondary-container text-secondary-on-container'}`}>
          {toast}
        </div>
      )}
    </div>
  );
}
