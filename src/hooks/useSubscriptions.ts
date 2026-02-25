import type { Subscription, ScanProgress, AuthState } from '@shared/types';
import { STORAGE_KEYS } from '@shared/messages';
import { useStorage } from './useStorage';

export function useSubscriptions() {
  const subscriptionsMap = useStorage<Record<string, Subscription>>(STORAGE_KEYS.SUBSCRIPTIONS, {});
  const scanProgress = useStorage<ScanProgress | null>(STORAGE_KEYS.SCAN_PROGRESS, null);
  const auth = useStorage<AuthState | null>(STORAGE_KEYS.AUTH, null);

  const subscriptions = Object.values(subscriptionsMap);
  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');

  return {
    subscriptions,
    activeSubscriptions,
    scanProgress,
    auth,
    isAuthenticated: auth?.isAuthenticated ?? false,
    isScanning: scanProgress?.status === 'scanning',
    hasScanData: scanProgress?.status === 'complete' || scanProgress?.status === 'error',
  };
}
