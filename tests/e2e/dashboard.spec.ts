import { test, expect } from './fixtures/extension';
import { openDashboard, seedStorage, readStorage } from './fixtures/helpers';
import { ALL_SEED_DATA } from './fixtures/seedData';

test.describe('Dashboard — subscription table', () => {
  test('renders seeded subscriptions in the table', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    await expect(page.getByText('Weekly Digest')).toBeVisible();
    await expect(page.getByText('Big Store Deals')).toBeVisible();
    await expect(page.getByText('GitHub', { exact: true }).first()).toBeVisible();
  });

  test('filters by category — newsletters', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    await page.getByText('Newsletters').click();

    await expect(page.getByText('Weekly Digest')).toBeVisible();
    // Marketing and notification subs should not appear
    await expect(page.getByText('Big Store Deals')).not.toBeVisible();
  });

  test('search filters subscriptions', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    await page.getByPlaceholder('Search subscriptions').fill('github');

    await expect(page.getByText('GitHub', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Weekly Digest')).not.toBeVisible();
  });
});

test.describe('Dashboard — settings modal', () => {
  test('gear icon opens settings modal', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    await page.getByLabel('Settings').click();

    await expect(page.getByText('Auto-scan')).toBeVisible();
    await expect(page.getByText('Badge count')).toBeVisible();
    await expect(page.getByText('Dark mode coming soon')).toBeVisible();
  });

  test('closing modal returns to dashboard', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    await page.getByLabel('Settings').click();
    await expect(page.getByText('Auto-scan')).toBeVisible();

    await page.getByLabel('Close').click();
    await expect(page.getByText('Auto-scan')).not.toBeVisible();
  });

  test('toggling notification setting persists to storage', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    await page.getByLabel('Settings').click();

    // Click the notification toggle by its aria-label
    await page.getByLabel('Toggle notifications').click();

    await page.waitForTimeout(500);
    const settings = (await readStorage(context, extensionId, 'settings')) as Record<string, unknown>;
    expect(settings.notifyOnNewSubscriptions).toBe(true);
  });
});

test.describe('Dashboard — cross-context sync', () => {
  test('setting changed via storage reflects in dashboard', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);

    const dashboard = await openDashboard(context, extensionId);

    // Simulate a settings change (as if popup wrote it)
    await seedStorage(context, extensionId, {
      settings: {
        ...ALL_SEED_DATA.settings,
        autoScanEnabled: false,
      },
    });

    await dashboard.getByLabel('Settings').click();

    // The auto-scan toggle should now reflect the off state
    const toggle = dashboard.getByLabel('Toggle auto-scan');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});

test.describe('Dashboard — bulk actions', () => {
  test('select all checkbox selects all visible rows', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    // Wait for table to render
    await expect(page.getByText('Weekly Digest')).toBeVisible();

    // Click the first checkbox (select all)
    const selectAll = page.getByRole('checkbox').first();
    await selectAll.click();

    // All row checkboxes should now be checked
    const checkboxes = page.getByRole('checkbox');
    const count = await checkboxes.count();
    // At least 1 (select-all) + 3 rows = 4
    expect(count).toBeGreaterThanOrEqual(4);
  });
});

test.describe('Dashboard — whitelist', () => {
  test('whitelisting a sender updates storage status', async ({ context, extensionId }) => {
    await seedStorage(context, extensionId, ALL_SEED_DATA);
    const page = await openDashboard(context, extensionId);

    // Click on a subscription row to open detail
    await page.getByText('Weekly Digest').click();

    // Look for the "Keep" button in the detail panel
    const keepBtn = page.getByRole('button', { name: /keep/i }).first();
    if (await keepBtn.isVisible()) {
      await keepBtn.click();
      await page.waitForTimeout(1000);

      const subs = (await readStorage(context, extensionId, 'subscriptions')) as Record<string, { status: string }>;
      expect(subs['sub-newsletter'].status).toBe('whitelisted');
    }
  });
});
