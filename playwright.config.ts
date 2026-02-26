import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1, // Extensions require serial execution — no parallel contexts
  use: {
    headless: false, // Extensions only work in headed mode
  },
  projects: [
    {
      name: 'chromium',
      use: {
        // Playwright launches Chrome with the extension loaded via launchPersistentContext
        // in the test fixtures — not via the standard `use` config.
      },
    },
  ],
});
