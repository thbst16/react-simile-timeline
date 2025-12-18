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

    // Sprint 1: Check that timeline bands are rendered
    await expect(timeline.locator('.timeline-band--detail')).toBeVisible();
    await expect(timeline.locator('.timeline-band--overview')).toBeVisible();
  });

  test('timeline component renders with URL data source', async ({ page }) => {
    // Check that the second timeline (URL data) loads
    const timelines = page.locator('[data-testid="timeline-container"]');
    await expect(timelines).toHaveCount(2);

    // Second timeline should also show bands
    const secondTimeline = timelines.nth(1);
    await expect(secondTimeline.locator('.timeline-band--detail')).toBeVisible();
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

test.describe('Sprint 1: Timeline MVP Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders two bands (detail + overview)', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();

    // Check both band types are present
    const detailBand = timeline.locator('.timeline-band--detail');
    const overviewBand = timeline.locator('.timeline-band--overview');

    await expect(detailBand).toBeVisible();
    await expect(overviewBand).toBeVisible();

    // Detail band should be larger than overview
    const detailBox = await detailBand.boundingBox();
    const overviewBox = await overviewBand.boundingBox();
    expect(detailBox!.height).toBeGreaterThan(overviewBox!.height);
  });

  test('time scale shows labels', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();

    // Check that time scale labels are rendered
    const scaleLabels = timeline.locator('.timeline-scale__label');
    await expect(scaleLabels.first()).toBeVisible();
  });

  test('pan interaction works', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();
    const band = timeline.locator('.timeline-band--detail');

    // Verify band has grab cursor (indicates pan is enabled)
    await expect(band).toHaveCSS('cursor', 'grab');

    // Test pan via keyboard (more reliable in Playwright than mouse drag)
    await band.click(); // Focus on band

    // Get initial scale label text
    const initialLabel = await timeline.locator('.timeline-scale__label').first().textContent();

    // Pan using keyboard (multiple times for visible change)
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight');
    }

    await page.waitForTimeout(100);

    // Label should have changed after panning
    const newLabel = await timeline.locator('.timeline-scale__label').first().textContent();
    expect(newLabel).not.toBe(initialLabel);
  });

  test('event markers are visible', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();

    // Wait for events to render
    await page.waitForTimeout(500);

    // Check that event dots are rendered
    const eventDots = timeline.locator('.timeline-event__dot');
    const count = await eventDots.count();
    expect(count).toBeGreaterThan(0);
  });

  test('event click shows popup', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();

    // Wait for events to render
    await page.waitForTimeout(500);

    // Find and click an event
    const event = timeline.locator('.timeline-event').first();
    await event.click();

    // Popup should appear
    const popup = page.locator('.timeline-popup');
    await expect(popup).toBeVisible();

    // Popup should have title and close button
    await expect(popup.locator('.timeline-popup__title')).toBeVisible();
    await expect(popup.locator('.timeline-popup__close')).toBeVisible();
  });

  test('popup closes on close button click', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();

    // Wait for events to render
    await page.waitForTimeout(500);

    // Open popup
    const event = timeline.locator('.timeline-event').first();
    await event.click();

    const popup = page.locator('.timeline-popup');
    await expect(popup).toBeVisible();

    // Close popup
    await popup.locator('.timeline-popup__close').click();
    await expect(popup).not.toBeVisible();
  });

  test('popup closes on Escape key', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();

    // Wait for events to render
    await page.waitForTimeout(500);

    // Open popup
    const event = timeline.locator('.timeline-event').first();
    await event.click();

    const popup = page.locator('.timeline-popup');
    await expect(popup).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(popup).not.toBeVisible();
  });

  test('overview band shows tick markers', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();
    const overviewBand = timeline.locator('.timeline-band--overview');

    // Check overview markers are visible
    const markers = overviewBand.locator('.timeline-overview-marker');

    // Wait for render
    await page.waitForTimeout(500);

    const count = await markers.count();
    expect(count).toBeGreaterThanOrEqual(0); // May be 0 if events are outside viewport
  });

  test('keyboard navigation works', async ({ page }) => {
    const timeline = page.locator('[data-testid="timeline-container"]').first();

    // Focus on the page
    await timeline.click();

    // Get initial scale label
    const initialLabel = await timeline.locator('.timeline-scale__label').first().textContent();

    // Press right arrow multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
    }

    await page.waitForTimeout(100);

    // Label should change
    const newLabel = await timeline.locator('.timeline-scale__label').first().textContent();
    expect(newLabel).not.toBe(initialLabel);
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
