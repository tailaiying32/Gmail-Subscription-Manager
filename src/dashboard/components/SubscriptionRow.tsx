import React, { useState } from 'react';
import type { Subscription } from '../../shared/types';
import { Icon, StatusChip } from '../../components/md3';
import { useDashboardStore } from '../store/dashboardStore';
import { sendMessage } from '../../hooks/useMessage';

interface Props { subscription: Subscription }

const categoryIcon: Record<string, string> = {
  newsletter: 'newspaper', marketing: 'sell', notification: 'notifications', other: 'mail',
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export function SubscriptionRow({ subscription: sub }: Props) {
  const { selectedIds, toggleSelected, openDetail, optimisticUpdate } = useDashboardStore();
  const isSelected = selectedIds.has(sub.id);
  const [loading, setLoading] = useState(false);

  async function handleUnsubscribe(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    optimisticUpdate(sub.id, 'unsubscribed');
    await sendMessage({ type: 'UNSUBSCRIBE_EXECUTE', payload: { subscriptionId: sub.id } });
    setLoading(false);
  }

  async function handleArchive(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    await sendMessage({ type: 'ARCHIVE_ALL', payload: { subscriptionId: sub.id } });
    setLoading(false);
  }

  async function handleKeep(e: React.MouseEvent) {
    e.stopPropagation();
    optimisticUpdate(sub.id, 'whitelisted');
    await sendMessage({ type: 'WHITELIST_ADD', payload: { subscriptionId: sub.id } });
  }

  return (
    <div
      onClick={() => openDetail(sub.id)}
      className={`
        group flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors duration-100
        ${isSelected ? 'bg-secondary-container' : 'hover:bg-surface-container-low'}
        ${loading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelected(sub.id)}
        onClick={(e) => e.stopPropagation()}
        className="h-4 w-4 rounded accent-primary shrink-0"
      />

      {/* Favicon in tonal container */}
      <div className="h-9 w-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={sub.faviconUrl} alt="" className="h-5 w-5 object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = 'none';
            el.parentElement!.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;color:#1A6DD4">${categoryIcon[sub.category] ?? 'mail'}</span>`;
          }}
        />
      </div>

      {/* Sender info */}
      <div className="flex-1 min-w-0">
        <p className="text-body-lg text-surface-on font-medium truncate">{sub.senderName}</p>
        <p className="text-body-sm text-surface-on-variant truncate">{sub.senderEmail}</p>
      </div>

      {/* Category */}
      <div className="hidden md:flex w-28">
        <StatusChip
          label={sub.category}
          color={sub.category === 'newsletter' ? 'blue' : sub.category === 'marketing' ? 'red' : 'gray'}
        />
      </div>

      {/* Count */}
      <div className="w-16 text-right shrink-0">
        <p className="text-title-sm text-surface-on">{sub.emailCount}</p>
        <p className="text-label-sm text-surface-on-variant">emails</p>
      </div>

      {/* Last seen */}
      <div className="w-20 text-right hidden lg:block shrink-0">
        <p className="text-body-sm text-surface-on-variant">{timeAgo(sub.lastReceived)}</p>
      </div>

      {/* Hover actions */}
      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity w-24 justify-end shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleUnsubscribe} title="Unsubscribe"
          className="flex h-8 w-8 items-center justify-center rounded-full text-error hover:bg-error-container transition-colors">
          <Icon name="unsubscribe" size={18} />
        </button>
        <button onClick={handleArchive} title="Archive all"
          className="flex h-8 w-8 items-center justify-center rounded-full text-surface-on-variant hover:bg-surface-container-high transition-colors">
          <Icon name="archive" size={18} />
        </button>
        <button onClick={handleKeep} title="Keep"
          className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary-container transition-colors">
          <Icon name="bookmark_add" size={18} />
        </button>
      </div>
    </div>
  );
}
