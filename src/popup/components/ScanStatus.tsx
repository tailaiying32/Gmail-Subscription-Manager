import React, { useState } from 'react';
import type { ScanProgress } from '../../shared/types';
import { sendMessage } from '../../hooks/useMessage';

interface Props {
  userEmail: string;
  scanProgress: ScanProgress | null;
  isScanning: boolean;
}

export function ScanStatus({ userEmail, scanProgress, isScanning }: Props) {
  const [starting, setStarting] = useState(false);

  async function handleScan() {
    setStarting(true);
    await sendMessage({ type: 'SCAN_START', payload: { fullScan: true } });
    setStarting(false);
  }

  async function handleSignOut() {
    await sendMessage({ type: 'AUTH_REVOKE' });
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 truncate">{userEmail}</span>
        <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">
          Sign out
        </button>
      </div>

      {isScanning && scanProgress ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Scanning…</span>
            <span className="text-gray-500 capitalize">{scanProgress.phase}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${scanProgress.percentComplete}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {scanProgress.processed} / {scanProgress.totalFound} messages processed
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            No scan data yet. Scanning looks at your inbox for emails with unsubscribe options.
          </p>
          <button
            onClick={handleScan}
            disabled={starting}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {starting ? 'Starting…' : 'Scan My Inbox'}
          </button>
        </div>
      )}
    </div>
  );
}
