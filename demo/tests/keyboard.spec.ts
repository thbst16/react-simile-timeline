import { test, expect } from '@playwright/test';

// Keyboard operability (§1.2, WCAG 2.1.1 / 2.4.3). Exercises the real thing in a
// browser: the timeline is reachable and driveable by keyboard alone, the
// pan/zoom shortcuts are scoped to the focused timeline rather than global, and
// the event popup is a proper modal — focus moves in, is trapped, and is
// restored to the opening marker on close.

const firstTimeline = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="timeline-container"]').first();

// Is the browser's active element inside the (portaled) popup dialog?
const focusIsInPopup = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const popup = document.querySelector('.timeline-popup');
    return !!popup && popup.contains(document.activeElement);
  });

test.describe('keyboard operability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('arrow keys pan only once the timeline band is focused', async ({ page }) => {
    const timeline = firstTimeline(page);
    const label = timeline.locator('.timeline-scale__label').first();
    await label.waitFor();

    const initial = await label.textContent();

    // Nothing in the timeline is focused yet — arrows must not pan it.
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    expect(await label.textContent()).toBe(initial);

    // Focus the primary band directly (keyboard-only path, no pointer) and pan.
    await timeline.locator('.timeline-band--detail').first().focus();
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.waitForTimeout(150);
    expect(await label.textContent()).not.toBe(initial);
  });

  test('+/- zoom only once the timeline band is focused', async ({ page }) => {
    const timeline = firstTimeline(page);
    const labels = timeline.locator('.timeline-scale__label');
    await labels.first().waitFor();

    const initial = await labels.allTextContents();

    // Not focused — zoom keys are ignored.
    await page.keyboard.press('+');
    await page.keyboard.press('+');
    await page.waitForTimeout(150);
    expect(await labels.allTextContents()).toEqual(initial);

    // Focused — zoom changes the scale granularity.
    await timeline.locator('.timeline-band--detail').first().focus();
    await page.keyboard.press('+');
    await page.keyboard.press('+');
    await page.waitForTimeout(200);
    expect(await labels.allTextContents()).not.toEqual(initial);
  });

  test('the timeline band is reachable as a tab stop', async ({ page }) => {
    const band = firstTimeline(page).locator('.timeline-band--detail').first();
    await band.waitFor();
    // A single tab stop with the pan/zoom shortcuts advertised to AT.
    await expect(band).toHaveAttribute('tabindex', '0');
    await expect(band).toHaveAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight + -');
  });

  test('marker opens the popup with Enter, traps focus, restores it on Escape', async ({
    page,
  }) => {
    const marker = page.locator('.timeline-event[role="button"]').first();
    await marker.waitFor();
    await marker.focus();
    const markerLabel = await marker.getAttribute('aria-label');

    // Enter on the focused marker opens the popup.
    await page.keyboard.press('Enter');
    const popup = page.locator('.timeline-popup');
    await expect(popup).toBeVisible();

    // Focus moved into the dialog.
    expect(await focusIsInPopup(page)).toBe(true);

    // Tab stays trapped inside the dialog.
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await focusIsInPopup(page)).toBe(true);
    }

    // Escape closes it and returns focus to the marker that opened it.
    await page.keyboard.press('Escape');
    await expect(popup).toHaveCount(0);
    const restored = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.getAttribute('aria-label') ?? null
    );
    expect(restored).toBe(markerLabel);
  });
});
