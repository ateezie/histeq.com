const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation and Accessibility Tests', () => {
  test('Mobile navigation should work with hamburger menu', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hamburgerButton = page.locator('[data-testid="mobile-nav-toggle"]');
    await expect(hamburgerButton).toBeVisible();

    await hamburgerButton.click();
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();

    const menuItems = mobileMenu.locator('a');
    await expect(menuItems.first()).toBeVisible();
  });

  test('Keyboard navigation should work throughout site', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/');

    await page.keyboard.press('Tab');
    const firstFocusable = page.locator(':focus');
    await expect(firstFocusable).toBeVisible();

    // Skip link should be present
    await page.keyboard.press('Tab');
    const skipLink = page.locator('[data-testid="skip-link"]');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toContainText(/skip to content|skip navigation/i);
    }
  });

  test('ARIA landmarks and screen reader support', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/');

    await expect(page.locator('main')).toHaveAttribute('role', 'main');
    await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');

    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    await expect(headings.first()).toBeVisible();
  });
});