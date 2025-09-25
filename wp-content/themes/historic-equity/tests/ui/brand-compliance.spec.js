const { test, expect } = require('@playwright/test');

test.describe('Brand Compliance and Visual Tests', () => {
  test('Historic Equity brand colors should be consistently applied', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/');

    const primaryElements = page.locator('.bg-primary-600, .text-primary-600');
    await expect(primaryElements.first()).toBeVisible();

    const secondaryElements = page.locator('.bg-secondary-500, .text-secondary-500');
    await expect(secondaryElements.first()).toBeVisible();
  });

  test('Typography should use Montserrat and Sportscenter fonts', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/');

    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toHaveCSS('font-family', /montserrat/i);
  });
});