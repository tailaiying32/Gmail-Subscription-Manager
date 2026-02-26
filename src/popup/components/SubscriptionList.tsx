import { useState } from 'react';
import type { Subscription, ScanProgress } from '../../shared/types';
import { Icon, IconButton } from '../../components/md3';
import { sendMessage } from '../../hooks/useMessage';
import { SubscriptionCard } from './SubscriptionCard';
import { SettingsPanel } from './SettingsPanel';

interface Props { userEmail: string; subscriptions: Subscription[]; scanProgress: ScanProgress | null }

export function SubscriptionList({ userEmail: _, subscriptions, scanProgress }: Props) {
  const [showSettings, setShowSettings] = useState(false);

  async function handleSignOut() { await sendMessage({ type: 'AUTH_REVOKE' }); }
  async function handleRescan()  { await sendMessage({ type: 'SCAN_START', payload: { fullScan: true } }); }

  function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/dashboard.html') });
  }

  if (showSettings) {
    return <SettingsPanel onBack={() => setShowSettings(false)} />;
  }

  const lastScan = scanProgress?.lastCompletedAt
    ? new Date(scanProgress.lastCompletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="flex flex-col" style={{ height: 600, maxHeight: 600 }}>
      {/* Top app bar — surface-container (elevation 2) */}
      <div className="bg-surface-container px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="mark_email_unread" size={20} filled className="text-primary" />
            <span className="text-title-sm text-surface-on">Subscriptions</span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton icon="refresh" label="Rescan" onClick={handleRescan} />
            <IconButton icon="settings" label="Settings" onClick={() => setShowSettings(true)} />
            <IconButton icon="logout" label="Sign out" onClick={handleSignOut} />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-headline-sm text-surface-on">{subscriptions.length}</span>
          <span className="text-body-sm text-surface-on-variant">
            {subscriptions.length === 1 ? 'subscription' : 'subscriptions'}
            {lastScan && ` · ${lastScan}`}
          </span>
        </div>
      </div>

      {/* Cards list — base surface, no borders between cards */}
      <div className="flex-1 overflow-y-auto py-2 bg-surface">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-6">
            <Icon name="inbox" size={48} className="text-surface-on-variant opacity-30" />
            <p className="text-title-sm text-surface-on-variant">No active subscriptions</p>
          </div>
        ) : (
          subscriptions.map((sub) => <SubscriptionCard key={sub.id} subscription={sub} />)
        )}
      </div>

      {/* Footer — surface-container-low lifts it above the list */}
      <div className="bg-surface-container-low px-4 py-2.5 shrink-0">
        <button
          onClick={openDashboard}
          className="w-full flex items-center justify-center gap-2 text-label-lg text-primary hover:bg-primary/8 rounded-full py-2 transition-colors"
        >
          <Icon name="open_in_new" size={16} />
          Open full dashboard
        </button>
      </div>
    </div>
  );
}
