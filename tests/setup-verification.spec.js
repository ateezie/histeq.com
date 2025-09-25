const { test, expect } = require('@playwright/test');

/**
 * Setup verification test for Historic Equity WordPress theme
 * Verifies that Playwright configuration and WordPress server are working
 */

test.describe('Playwright Setup Verification', () => {

  test('WordPress server is accessible', async ({ page }) => {
    await page.goto('/');

    // Verify page loads successfully
    await expect(page).toHaveTitle(/Historic Equity/i);

    // Verify no major JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check for critical errors only (ignore 404s for missing assets)
    const criticalErrors = errors.filter(error =>
      !error.includes('404') &&
      !error.includes('Failed to load resource')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('Meet Our Team page loads', async ({ page }) => {
    await page.goto('/meet-our-team/');

    // Page should load without 404
    await expect(page).not.toHaveTitle(/404|Not Found/i);

    // Wait for content to load
    await page.waitForLoadState('networkidle');
  });

  test('Contact Us page loads', async ({ page }) => {
    await page.goto('/contact-us/');

    // Page should load without 404
    await expect(page).not.toHaveTitle(/404|Not Found/i);

    // Wait for content to load
    await page.waitForLoadState('networkidle');
  });

  test('Responsive viewports work correctly', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const desktopViewport = page.viewportSize();
    expect(desktopViewport.width).toBe(1440);
    expect(desktopViewport.height).toBe(900);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    const mobileViewport = page.viewportSize();
    expect(mobileViewport.width).toBe(375);
    expect(mobileViewport.height).toBe(812);
  });

});