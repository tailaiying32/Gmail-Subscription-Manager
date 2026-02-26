import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_PATH = path.resolve(__dirname, '..', '..', '..', 'dist');

/**
 * Custom Playwright fixture that launches a persistent Chromium context
 * with the extension loaded. Extensions require:
 *  - headed mode (headless: false)
 *  - persistent context (launchPersistentContext)
 *  - the --load-extension flag
 */
export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${DIST_PATH}`,
        `--load-extension=${DIST_PATH}`,
        '--no-first-run',
        '--disable-default-apps',
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // Wait for the service worker to register and grab its extension ID
    let serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }
    const url = serviceWorker.url();
    const id = url.split('/')[2]; // chrome-extension://<id>/...
    await use(id);
  },
});

export const expect = test.expect;
