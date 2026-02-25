import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, defaultValue: T): T {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    // Initial load
    chrome.storage.local.get(key, (result) => {
      if (result[key] !== undefined) setValue(result[key] as T);
    });

    // React to future changes — filter to 'local' area only
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string
    ) => {
      if (area !== 'local' || !(key in changes)) return;
      const newValue = changes[key].newValue;
      setValue(newValue !== undefined ? (newValue as T) : defaultValue);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key]);

  return value;
}
