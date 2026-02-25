import React from 'react';
import type { Subscription, ScanProgress } from '../../shared/types';
import { sendMessage } from '../../hooks/useMessage';
import { SubscriptionCard } from './SubscriptionCard';

interface Props {
  userEmail: string;
  subscriptions: Subscription[];
  scanProgress: ScanProgress | null;
}

export function SubscriptionList({ userEmail, subscriptions, scanProgress }: Props) {
  async function handleSignOut() {
    await sendMessage({ type: 'AUTH_REVOKE' });
  }

  async function handleRescan() {
    await sendMessage({ type: 'SCAN_START', payload: { fullScan: true } });
  }

  function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/dashboard.html') });
  }

  return (
    <div className="flex flex-col" style={{ maxHeight: 580 }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          <p className="text-sm font-medium text-gray-900">{subscriptions.length} subscriptions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRescan} className="text-xs text-blue-500 hover:text-blue-700">
            Rescan
          </button>
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">
            Sign out
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <p className="text-sm text-gray-500">No active subscriptions found.</p>
            <p className="text-xs text-gray-400">Try rescanning your inbox.</p>
          </div>
        ) : (
          subscriptions.map((sub) => <SubscriptionCard key={sub.id} subscription={sub} />)
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-2">
        <button
          onClick={openDashboard}
          className="w-full text-center text-xs text-blue-500 hover:text-blue-700"
        >
          Open Dashboard →
        </button>
      </div>
    </div>
  );
}
