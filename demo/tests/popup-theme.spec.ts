import { test, expect } from '@playwright/test';

// #74: the event popup portals to document.body, escaping the themed timeline
// root. Before the fix its CSS variables fell back to the light defaults even
// under the dark theme. This drives the real demo: switch the Theming timeline
// to dark, open a popup, and assert its background actually computes dark.

test.describe('popup theming (#74)', () => {
  test('the popup renders dark under the dark theme', async ({ page }) => {
    await page.goto('/');
    const theming = page.locator('[data-testid="timeline-container"]').nth(1);
    await theming.locator('.timeline-event[role="button"]').first().waitFor();

    // Switch the Theming demo timeline to the dark theme.
    await page.getByRole('button', { name: 'Dark', exact: true }).click();
    await page.waitForTimeout(300);

    // Open a popup from that timeline.
    await theming.locator('.timeline-event[role="button"]').first().click();
    const popup = page.locator('.timeline-popup');
    await expect(popup).toBeVisible();

    const bg = await popup.evaluate((el) => getComputedStyle(el).backgroundColor);
    const [r, g, b] = bg.match(/\d+/g)!.map(Number);
    // Dark theme popup background is #2a2a2a; every channel is low. A light
    // fallback (#ffffff) would put all channels near 255.
    expect(Math.max(r, g, b)).toBeLessThan(90);
  });
});
