import { test, expect } from '@playwright/test';

// Screen-reader semantics (§1.3). Asserts the name/role/value data that a
// screen reader consumes: the timeline is a labelled region, the event
// collection is a named group, markers announce title + date, and the
// decorative mini-map / time axis are hidden from the accessibility tree so
// events are not announced two or three times. This is the automated proxy for
// the manual two-reader pass (VoiceOver + NVDA/Orca), not a replacement for it.

test.describe('screen-reader semantics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="timeline-container"]').first().waitFor();
  });

  test('the timeline is exposed as a labelled region', async ({ page }) => {
    await expect(
      page.getByRole('region', { name: 'Timeline visualization' }).first()
    ).toBeVisible();
  });

  test('the event collection is a named group', async ({ page }) => {
    await expect(
      page.getByRole('group', { name: /Timeline events, \d+ in view/ }).first()
    ).toBeVisible();
  });

  test('event markers announce their title and date', async ({ page }) => {
    const marker = page.locator('.timeline-event[role="button"]').first();
    await marker.waitFor();
    const name = await marker.getAttribute('aria-label');
    // Name carries a real calendar date (a four-digit year), not just a title.
    expect(name).toMatch(/\b\d{4}\b/);
  });

  test('the time axis is hidden from the accessibility tree', async ({ page }) => {
    // Every scale is decorative; the marker names carry the dates.
    const scales = page.locator('.timeline-scale');
    const count = await scales.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(scales.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('the overview mini-map is hidden from the accessibility tree', async ({ page }) => {
    const overviews = page.locator('.timeline-overview-markers');
    const count = await overviews.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(overviews.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('an annotated hot zone is exposed as a note', async ({ page }) => {
    // The Hot Zones demo carries annotated periods.
    await expect(page.getByRole('note').first()).toBeVisible();
  });
});
