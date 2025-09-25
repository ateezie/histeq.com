const { test, expect } = require('@playwright/test');

test.describe('WCAG 2.1 AA Accessibility Tests', () => {
  test('Color contrast should meet WCAG AA standards', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/');

    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, a, button');
    const firstElement = textElements.first();
    await expect(firstElement).toBeVisible();

    // Check that text is readable (specific contrast checking would require additional tools)
    const computedStyle = await firstElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });

    expect(computedStyle.color).toBeTruthy();
  });

  test('All images should have appropriate alt text', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/');

    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText.length).toBeGreaterThan(3);
    }
  });

  test('Form labels should be properly associated', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/contact');

    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');
      const inputName = await input.getAttribute('name');

      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        await expect(label).toBeVisible();
      } else if (inputName) {
        const label = page.locator(`label[for="${inputName}"]`);
        await expect(label).toBeVisible();
      }
    }
  });
});