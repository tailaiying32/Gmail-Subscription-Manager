import React, { useState } from 'react';
import { Icon, Button, IconButton, StatusChip } from '../../components/md3';
import { useDashboardStore } from '../store/dashboardStore';
import { sendMessage } from '../../hooks/useMessage';

export function SubscriptionDetail() {
  const { detailId, subscriptions, closeDetail, optimisticUpdate } = useDashboardStore();
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [toast, setToast] = useState<string | null>(null);

  const sub = subscriptions.find((s) => s.id === detailId);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleUnsubscribe() {
    if (!sub) return;
    setActionState('loading');
    optimisticUpdate(sub.id, 'unsubscribed');
    const res = await sendMessage({ type: 'UNSUBSCRIBE_EXECUTE', payload: { subscriptionId: sub.id } });
    if (res.success) { setActionState('done'); showToast('Unsubscribed'); setTimeout(closeDetail, 1200); }
    else { setActionState('error'); showToast(`Failed: ${res.error}`); setTimeout(() => setActionState('idle'), 3000); }
  }

  async function handleArchive() {
    if (!sub) return;
    setActionState('loading');
    await sendMessage({ type: 'ARCHIVE_ALL', payload: { subscriptionId: sub.id } });
    setActionState('idle');
    showToast('All emails archived');
  }

  async function handleKeep() {
    if (!sub) return;
    optimisticUpdate(sub.id, 'whitelisted');
    await sendMessage({ type: 'WHITELIST_ADD', payload: { subscriptionId: sub.id } });
    showToast('Added to kept list');
    setTimeout(closeDetail, 900);
  }

  if (!detailId || !sub) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={closeDetail} />

      {/* Panel uses surface-container-low + elev-3 shadow — no side border */}
      <aside className="fixed right-0 top-0 h-screen w-[400px] bg-surface-container-low z-50 flex flex-col overflow-hidden">
        {/* Header — slightly elevated surface */}
        <div className="flex items-center gap-2 px-4 py-4 bg-surface-container">
          <IconButton icon="arrow_back" label="Close" onClick={closeDetail} />
          <h2 className="text-title-md text-surface-on flex-1 truncate">Details</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Sender hero */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
                <img src={sub.faviconUrl} alt="" className="h-8 w-8 object-contain"
                  onError={(e) => { const el = e.target as HTMLImageElement; el.style.display = 'none'; el.parentElement!.innerHTML = `<span class="material-symbols-outlined" style="font-size:28px;color:#1A6DD4">mail</span>`; }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-title-lg text-surface-on truncate">{sub.senderName}</p>
                <p className="text-body-md text-surface-on-variant truncate">{sub.senderEmail}</p>
                <div className="mt-1.5">
                  <StatusChip label={sub.category} color={sub.category === 'newsletter' ? 'blue' : sub.category === 'marketing' ? 'red' : 'gray'} />
                </div>
              </div>
            </div>

            {/* Stat tiles — tonal containers, no borders */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Emails',     value: sub.emailCount.toLocaleString(),                                                          icon: 'mail'     },
                { label: 'First seen', value: new Date(sub.firstSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),   icon: 'event'    },
                { label: 'Last email', value: new Date(sub.lastReceived).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),icon: 'schedule' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="rounded-xl bg-surface-container-high px-3 py-3 text-center">
                  <Icon name={icon} size={18} className="text-primary mx-auto mb-1" />
                  <p className="text-title-sm text-surface-on">{value}</p>
                  <p className="text-label-sm text-surface-on-variant">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Unsubscribe method — tonal card, no border */}
          <div className="px-6 pb-4 space-y-3">
            <p className="text-title-sm text-surface-on">Unsubscribe method</p>

            {sub.unsubscribeOptions.http && (
              <div className="rounded-xl bg-surface-container p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon name="link" size={16} className="text-primary" />
                  <span className="text-label-lg text-surface-on">
                    {sub.unsubscribeOptions.isOneClick ? 'One-click (RFC 8058)' : 'HTTP link'}
                  </span>
                  {sub.unsubscribeOptions.isOneClick && <StatusChip label="Instant" color="green" />}
                </div>
                <p className="text-body-sm text-surface-on-variant break-all pl-6">{sub.unsubscribeOptions.http}</p>
              </div>
            )}

            {sub.unsubscribeOptions.mailto && (
              <div className="rounded-xl bg-surface-container p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon name="email" size={16} className="text-surface-on-variant" />
                  <span className="text-label-lg text-surface-on">Email unsubscribe</span>
                </div>
                <p className="text-body-sm text-surface-on-variant pl-6">
                  Sends email to <strong>{sub.unsubscribeOptions.mailto.address}</strong>
                </p>
              </div>
            )}

            {!sub.unsubscribeOptions.http && !sub.unsubscribeOptions.mailto && (
              <div className="rounded-xl bg-error-container px-4 py-3 flex items-center gap-2">
                <Icon name="warning" size={16} className="text-error" />
                <span className="text-body-sm text-error-on-container">No unsubscribe method found</span>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`px-4 py-3 text-body-sm ${actionState === 'error' ? 'bg-error-container text-error-on-container' : 'bg-secondary-container text-secondary-on-container'}`}>
            {toast}
          </div>
        )}

        {/* Actions — surface-container separates from content via color, not border */}
        <div className="bg-surface-container px-4 py-4 space-y-2">
          {sub.status === 'active' && (
            <>
              <Button variant="filled" icon={actionState === 'loading' ? undefined : 'unsubscribe'}
                onClick={handleUnsubscribe} disabled={actionState === 'loading' || actionState === 'done'} className="w-full">
                {actionState === 'loading' ? 'Unsubscribing…' : actionState === 'done' ? 'Unsubscribed ✓' : 'Unsubscribe'}
              </Button>
              <div className="flex gap-2">
                <Button variant="tonal" icon="archive" onClick={handleArchive} disabled={actionState === 'loading'} className="flex-1">Archive all</Button>
                <Button variant="text" icon="bookmark_add" onClick={handleKeep} className="flex-1">Keep</Button>
              </div>
            </>
          )}
          {sub.status === 'whitelisted' && (
            <div className="flex items-center gap-2 justify-center py-2">
              <Icon name="bookmark" size={18} className="text-primary" filled />
              <span className="text-body-md text-surface-on-variant">This sender is kept</span>
            </div>
          )}
          {sub.status === 'unsubscribed' && (
            <div className="flex items-center gap-2 justify-center py-2">
              <Icon name="check_circle" size={18} className="text-green-600" filled />
              <span className="text-body-md text-surface-on-variant">Unsubscribed</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
