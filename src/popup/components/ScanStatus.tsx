import React, { useState } from 'react';
import type { ScanProgress } from '../../shared/types';
import { Button, Icon, LinearProgress, IconButton } from '../../components/md3';
import { sendMessage } from '../../hooks/useMessage';

interface Props {
  userEmail: string;
  scanProgress: ScanProgress | null;
  isScanning: boolean;
}

const phaseLabel: Record<string, string> = {
  listing: 'Finding subscriptions…',
  fetching: 'Reading email headers…',
  parsing: 'Grouping results…',
  done: 'Almost done…',
};

export function ScanStatus({ userEmail, scanProgress, isScanning }: Props) {
  const [starting, setStarting] = useState(false);

  async function handleScan() {
    setStarting(true);
    try {
      await sendMessage({ type: 'SCAN_START', payload: { fullScan: true } });
    } finally {
      setStarting(false);
    }
  }

  async function handleSignOut() {
    await sendMessage({ type: 'AUTH_REVOKE' });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top app bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-1">
        <div className="flex items-center gap-3">
          <Icon name="mark_email_unread" size={20} filled className="text-primary" />
          <span className="text-title-sm text-surface-on truncate max-w-[200px]">{userEmail}</span>
        </div>
        <IconButton icon="logout" label="Sign out" onClick={handleSignOut} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        {isScanning && scanProgress ? (
          <div className="w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center animate-pulse">
                <Icon name="radar" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-title-sm text-surface-on">Scanning inbox</p>
                <p className="text-body-sm text-surface-on-variant">
                  {phaseLabel[scanProgress.phase] ?? 'Processing…'}
                </p>
              </div>
            </div>

            <LinearProgress value={scanProgress.percentComplete} />

            <div className="flex justify-between text-label-md text-surface-on-variant">
              <span>{scanProgress.processed.toLocaleString()} processed</span>
              <span>{scanProgress.percentComplete}%</span>
            </div>

            {scanProgress.totalFound > 0 && (
              <div className="rounded-lg bg-secondary-container px-4 py-3 flex items-center gap-2">
                <Icon name="inbox" size={16} className="text-secondary-on-container" />
                <span className="text-body-sm text-secondary-on-container">
                  Found <strong>{scanProgress.totalFound.toLocaleString()}</strong> emails to check
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className={`flex h-20 w-20 mx-auto items-center justify-center rounded-full ${scanProgress?.status === 'error' ? 'bg-error-container' : 'bg-primary-container'}`}>
              <Icon name={scanProgress?.status === 'error' ? 'error' : 'manage_search'} size={40} className={scanProgress?.status === 'error' ? 'text-error' : 'text-primary'} />
            </div>
            <div className="space-y-1.5">
              <p className="text-title-md text-surface-on">{scanProgress?.status === 'error' ? 'Scan failed' : 'Ready to scan'}</p>
              <p className="text-body-md text-surface-on-variant max-w-[240px]">
                {scanProgress?.status === 'error'
                  ? (scanProgress.error ?? 'An error occurred during scanning. Try again.')
                  : 'Looks for emails with unsubscribe options in your inbox.'}
              </p>
            </div>
            <Button
              variant="filled"
              icon={starting ? undefined : 'search'}
              onClick={handleScan}
              disabled={starting}
              className="w-full"
            >
              {starting ? 'Starting…' : 'Scan My Inbox'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
