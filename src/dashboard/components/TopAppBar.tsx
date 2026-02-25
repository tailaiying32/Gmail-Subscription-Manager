import React from 'react';
import { Icon, IconButton } from '../../components/md3';
import { useDashboardStore } from '../store/dashboardStore';
import { sendMessage } from '../../hooks/useMessage';
import { useSubscriptions } from '../../hooks/useSubscriptions';

export function TopAppBar() {
  const { searchQuery, setSearchQuery, sortBy, setSortBy } = useDashboardStore();
  const { auth } = useSubscriptions();

  async function handleRescan() {
    await sendMessage({ type: 'SCAN_START', payload: { fullScan: true } });
  }

  return (
    // surface-container: elevation 2 — sits visually above the list below it
    <header className="flex items-center gap-3 bg-surface-container px-4 py-3 shrink-0">
      {/* MD3 Search bar — bg-surface-container-highest, no border */}
      <div className="flex-1 flex items-center gap-3 rounded-full bg-surface-container-highest px-4 py-2 focus-within:ring-2 focus-within:ring-primary transition-all">
        <Icon name="search" size={20} className="text-surface-on-variant shrink-0" />
        <input
          type="text"
          placeholder="Search subscriptions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-body-lg text-surface-on placeholder:text-surface-on-variant outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-surface-on-variant hover:text-surface-on">
            <Icon name="close" size={18} />
          </button>
        )}
      </div>

      {/* Sort — tonal chip style, no border */}
      <div className="flex items-center gap-1.5 rounded-full bg-surface-container-highest px-4 py-2">
        <Icon name="sort" size={18} className="text-surface-on-variant" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as Parameters<typeof setSortBy>[0])}
          className="bg-transparent text-label-lg text-surface-on outline-none cursor-pointer"
        >
          <option value="frequency">Most emails</option>
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest first</option>
          <option value="alphabetical">A – Z</option>
        </select>
      </div>

      <IconButton icon="refresh" label="Rescan inbox" onClick={handleRescan} />

      {/* User avatar */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-on text-label-lg font-medium cursor-pointer shrink-0"
        title={auth?.userEmail ?? ''}
      >
        {auth?.userEmail?.[0]?.toUpperCase() ?? 'U'}
      </div>
    </header>
  );
}
