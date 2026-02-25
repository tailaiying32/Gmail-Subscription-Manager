import { INCREMENTAL_SYNC_ALARM } from '@shared/constants';
import { handleMessage } from './messageHandler';

export function registerAlarms(): void {
  chrome.alarms.create(INCREMENTAL_SYNC_ALARM, { periodInMinutes: 30 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === INCREMENTAL_SYNC_ALARM) {
      handleMessage({ type: 'SCAN_START', payload: { fullScan: false } });
    }
  });
}
