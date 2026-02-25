import { useState, useEffect } from 'react';

export function useStorage<T>(key: string, defaultValue: T): T {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    // Initial load
    chrome.storage.local.get(key, (result) => {
      if (result[key] !== undefined) setValue(result[key] as T);
    });

    // React to future changes
    const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
      if (key in changes) setValue(changes[key].newValue as T);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key]);

  return value;
}
