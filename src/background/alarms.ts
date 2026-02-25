import { INCREMENTAL_SYNC_ALARM } from '@shared/constants';
import type { Scanner } from './gmail/scanner';

export function registerAlarms(scanner: Scanner): void {
  chrome.alarms.create(INCREMENTAL_SYNC_ALARM, { periodInMinutes: 30 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === INCREMENTAL_SYNC_ALARM) {
      scanner.startIncrementalSync();
    }
  });
}
