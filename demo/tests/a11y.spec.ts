import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Automated WCAG 2.1 A/AA gate (§1.1). Scans the core demo states and fails on
// any violation. Complements — does not replace — the manual keyboard and
// screen-reader checks; axe covers the machine-detectable slice (contrast,
// names, roles, ARIA misuse).
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function scan(page: import('@playwright/test').Page) {
  // Let the 0.2s event/popup fade-ins finish so contrast is measured against
  // the settled frame, not a mid-animation opacity.
  await page.waitForTimeout(500);
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

test.describe('accessibility (axe)', () => {
  test('default page — inline data, multi-band, hot zones', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="timeline-container"]').first().waitFor();
    const results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations.map((v) => v.id))).toEqual([]);
  });

  test('dark theme', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="timeline-container"]').first().waitFor();
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    const results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations.map((v) => v.id))).toEqual([]);
  });

  test('event popup open', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="timeline-container"]').first().waitFor();
    await page.locator('.timeline-event[role="button"]').first().click();
    await expect(page.locator('.timeline-popup')).toBeVisible();
    const results = await scan(page);
    expect(results.violations, JSON.stringify(results.violations.map((v) => v.id))).toEqual([]);
  });
});
