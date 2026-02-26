import type { UserSettings } from '../shared/types';
import { STORAGE_KEYS } from '../shared/messages';
import { useStorage } from './useStorage';
import { sendMessage } from './useMessage';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  autoScanEnabled: true,
  scanFrequencyMinutes: 30,
  showBadgeCount: true,
  notifyOnNewSubscriptions: false,
};

export function useSettings(): [UserSettings, (patch: Partial<UserSettings>) => void] {
  const settings = useStorage<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

  function updateSettings(patch: Partial<UserSettings>) {
    sendMessage({ type: 'SETTINGS_UPDATE', payload: patch });
  }

  return [settings, updateSettings];
}
