import type { UserSettings } from '@shared/types';
import { STORAGE_KEYS } from '@shared/messages';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  autoScanEnabled: true,
  scanFrequencyMinutes: 30,
  showBadgeCount: true,
  notifyOnNewSubscriptions: false,
};

export async function getSettings(): Promise<UserSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const stored = result[STORAGE_KEYS.SETTINGS] as Partial<UserSettings> | undefined;
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

export async function patchSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...patch };
  await saveSettings(updated);
  return updated;
}
