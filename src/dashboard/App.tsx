import React, { useEffect } from 'react';
import { NavigationDrawer } from './components/NavigationDrawer';
import { TopAppBar } from './components/TopAppBar';
import { BulkActions } from './components/BulkActions';
import { SubscriptionTable } from './components/SubscriptionTable';
import { SubscriptionDetail } from './components/SubscriptionDetail';
import { useDashboardStore } from './store/dashboardStore';
import { STORAGE_KEYS } from '../shared/messages';
import type { Subscription } from '../shared/types';

export function App() {
  const { loadFromStorage, syncFromStorage } = useDashboardStore();

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  useEffect(() => {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && changes[STORAGE_KEYS.SUBSCRIPTIONS]) {
        syncFromStorage(
          (changes[STORAGE_KEYS.SUBSCRIPTIONS].newValue ?? {}) as Record<string, Subscription>
        );
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [syncFromStorage]);

  return (
    // h-screen + overflow-hidden on the shell; scrolling happens inside SubscriptionTable only
    <div className="flex h-screen overflow-hidden bg-surface font-sans">
      <NavigationDrawer />

      {/* Right column: top bar + bulk actions + scrollable table */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <TopAppBar />
        <BulkActions />

        {/* This div is the scroll host — flex-1 + min-h-0 so it doesn't overflow its parent */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <SubscriptionTable />
        </div>
      </div>

      <SubscriptionDetail />
    </div>
  );
}
