import { INCREMENTAL_SYNC_ALARM } from '@shared/constants';
import { getSettings } from './settings/store';

export async function registerAlarms(): Promise<void> {
  await chrome.alarms.clear(INCREMENTAL_SYNC_ALARM);

  const settings = await getSettings();
  if (settings.autoScanEnabled) {
    chrome.alarms.create(INCREMENTAL_SYNC_ALARM, {
      periodInMinutes: settings.scanFrequencyMinutes,
    });
  }
}
