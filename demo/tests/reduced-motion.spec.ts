import { test, expect } from '@playwright/test';

// Reduced motion (§1.4, WCAG 2.3.3). Verifies the library both animates by
// default and drops its animations/transitions when the visitor asks for
// reduced motion. Pan momentum is JavaScript-driven and disabled in usePan
// under the same preference; this suite covers the CSS-driven motion, which is
// what an emulated media query can assert deterministically.

const firstMarkerAnimation = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const el = document.querySelector('.timeline-event');
    return el ? getComputedStyle(el).animationName : null;
  });

test.describe('reduced motion', () => {
  test('animates event markers by default', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.locator('.timeline-event').first().waitFor();
    // The fade-in keyframe animation is active.
    expect(await firstMarkerAnimation(page)).toBe('event-fade-in');
  });

  test('removes animations and transitions when reduced motion is requested', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.timeline-event').first().waitFor();

    // Event fade-in is gone.
    expect(await firstMarkerAnimation(page)).toBe('none');

    // Theme-change transitions are gone on the themed root and bands.
    const transitions = await page.evaluate(() => {
      const root = document.querySelector('.timeline-root');
      const band = document.querySelector('.timeline-band');
      return {
        root: root ? getComputedStyle(root).transitionDuration : null,
        band: band ? getComputedStyle(band).transitionDuration : null,
      };
    });
    expect(transitions.root).toBe('0s');
    expect(transitions.band).toBe('0s');
  });

  test('removes the popup fade-in when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('.timeline-event[role="button"]').first().click();
    await expect(page.locator('.timeline-popup')).toBeVisible();
    const anim = await page.evaluate(() => {
      const el = document.querySelector('.timeline-popup');
      return el ? getComputedStyle(el).animationName : null;
    });
    expect(anim).toBe('none');
  });
});
