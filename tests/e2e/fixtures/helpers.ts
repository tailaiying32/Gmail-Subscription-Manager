import type { BrowserContext, Page } from '@playwright/test';

/**
 * Opens the extension popup in a regular tab (since Playwright can't interact
 * with the native popup bubble). Navigates to chrome-extension://<id>/src/popup/popup.html.
 */
export async function openPopup(context: BrowserContext, extensionId: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  await page.waitForLoadState('domcontentloaded');
  return page;
}

/**
 * Opens the full dashboard page.
 */
export async function openDashboard(context: BrowserContext, extensionId: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/src/dashboard/dashboard.html`);
  await page.waitForLoadState('domcontentloaded');
  return page;
}

/**
 * Seeds chrome.storage.local with data by evaluating in the service worker context.
 * Useful for bypassing the real Gmail auth/scan flow in tests.
 */
export async function seedStorage(
  context: BrowserContext,
  extensionId: string,
  data: Record<string, unknown>
): Promise<void> {
  // Evaluate in the extension's service worker
  const sw = context.serviceWorkers().find((w) => w.url().includes(extensionId));
  if (!sw) throw new Error('Service worker not found');
  await sw.evaluate((storageData: Record<string, unknown>) => {
    return chrome.storage.local.set(storageData);
  }, data);
}

/**
 * Reads from chrome.storage.local via the service worker.
 */
export async function readStorage(
  context: BrowserContext,
  extensionId: string,
  key: string
): Promise<unknown> {
  const sw = context.serviceWorkers().find((w) => w.url().includes(extensionId));
  if (!sw) throw new Error('Service worker not found');
  return sw.evaluate(async (k: string) => {
    const result = await chrome.storage.local.get(k);
    return result[k];
  }, key);
}
