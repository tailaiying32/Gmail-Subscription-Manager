import { test, expect } from './fixtures/extension';
import { openPopup, seedStorage, readStorage } from './fixtures/helpers';
import { ALL_SEED_DATA } from './fixtures/seedData';

test.describe('Popup — subscription list', () => {
  test('shows subscriptions after seeding storage', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openPopup(context, extensionId);

    // Should show "3" as the headline count
    await expect(page.locator('.text-headline-sm').filter({ hasText: '3' })).toBeVisible();

    // Should render all three subscription cards
    await expect(page.getByText('Weekly Digest')).toBeVisible();
    await expect(page.getByText('Big Store Deals')).toBeVisible();
    await expect(page.getByText('GitHub', { exact: true })).toBeVisible();
  });

  test('gear icon opens settings panel', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openPopup(context, extensionId);

    // Click settings gear
    await page.getByLabel('Settings').click();

    // Settings panel should be visible
    await expect(page.getByText('Auto-scan')).toBeVisible();
    await expect(page.getByText('Badge count')).toBeVisible();
    await expect(page.getByText('New subscriptions', { exact: true })).toBeVisible();
  });

  test('back button returns to subscription list', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openPopup(context, extensionId);

    await page.getByLabel('Settings').click();
    await expect(page.getByText('Auto-scan')).toBeVisible();

    await page.getByLabel('Back').click();
    await expect(page.getByText('Weekly Digest')).toBeVisible();
  });
});

test.describe('Popup — settings persistence', () => {
  test('toggling badge count persists to storage', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openPopup(context, extensionId);

    await page.getByLabel('Settings').click();

    // Click the badge count toggle by its aria-label
    await page.getByLabel('Toggle badge count').click();

    // Verify it persisted
    await page.waitForTimeout(500);
    const settings = (await readStorage(context, extensionId, 'settings')) as Record<string, unknown>;
    expect(settings.showBadgeCount).toBe(false);
  });

  test('changing scan frequency persists to storage', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openPopup(context, extensionId);

    await page.getByLabel('Settings').click();

    // Click "1 hour" frequency option
    await page.getByRole('button', { name: '1 hour' }).click();

    await page.waitForTimeout(500);
    const settings = (await readStorage(context, extensionId, 'settings')) as Record<string, unknown>;
    expect(settings.scanFrequencyMinutes).toBe(60);
  });
});
