import { test, expect } from '@playwright/test';

test.describe('Timeline Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('demo app loads successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/React Simile Timeline/);

    // Check header is visible
    await expect(page.locator('h1')).toContainText('React Simile Timeline');
  });

  test('timeline component renders with inline data', async ({ page }) => {
    // Check that the timeline container exists
    const timeline = page.locator('[data-testid="timeline-container"]').first();
    await expect(timeline).toBeVisible();

    // Check that events are loaded (Sprint 0 scaffold shows event count)
    await expect(timeline).toContainText('events loaded');
  });

  test('timeline component renders with URL data source', async ({ page }) => {
    // Check that the second timeline (URL data) loads
    const timelines = page.locator('[data-testid="timeline-container"]');
    await expect(timelines).toHaveCount(2);

    // Second timeline should also show events
    const secondTimeline = timelines.nth(1);
    await expect(secondTimeline).toContainText('events loaded');
  });

  test('page has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out expected warnings (like React dev mode warnings)
    const unexpectedErrors = errors.filter(
      (e) => !e.includes('Download the React DevTools')
    );

    expect(unexpectedErrors).toHaveLength(0);
  });
});

test.describe('Library Import', () => {
  test('Timeline component is imported from workspace package', async ({ page }) => {
    // This test verifies the workspace:* dependency works correctly
    await page.goto('/');

    // The component should render without import errors
    const timeline = page.locator('[data-testid="timeline-container"]').first();
    await expect(timeline).toBeVisible();

    // Should not show any module resolution errors
    await expect(page.locator('body')).not.toContainText('Module not found');
    await expect(page.locator('body')).not.toContainText('Cannot find module');
  });
});
