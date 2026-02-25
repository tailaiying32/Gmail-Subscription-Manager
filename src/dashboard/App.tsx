import React from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';

// TODO (Phase 6): Replace this placeholder with the full dashboard layout:
// Sidebar (category filters) + FilterBar (search/sort) + BulkActions + SubscriptionTable

export function App() {
  const { subscriptions, auth, scanProgress } = useSubscriptions();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gmail Subscription Manager</h1>
        {auth?.userEmail && <p className="text-sm text-gray-500">{auth.userEmail}</p>}
      </header>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-600">
          {subscriptions.length > 0
            ? `${subscriptions.length} subscriptions found. Full dashboard UI coming in Phase 6.`
            : 'No subscriptions found yet. Use the extension popup to scan your inbox.'}
        </p>
        {scanProgress && (
          <p className="mt-2 text-sm text-gray-400">
            Last scan: {scanProgress.status} — {scanProgress.totalFound} emails found
          </p>
        )}
      </div>
    </div>
  );
}
