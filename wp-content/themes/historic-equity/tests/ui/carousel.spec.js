const { test, expect } = require('@playwright/test');

test.describe('Building carousel navigation', () => {
  test('clicking next advances slide and logs click', async ({ page }) => {
  // Use BASE_URL env var if provided so tests can target different dev ports
  const base = process.env.BASE_URL || 'http://localhost:8000/';
  await page.goto(base);

    // Wait for carousel to initialize
    await page.waitForSelector('.building-carousel-container');

    const next = await page.$('.carousel-next');
    expect(next).not.toBeNull();

    // Click next and wait a short moment for animation
    await next.click();
    await page.waitForTimeout(600);

    // Expect the next button to have been marked (data-clicked)
    const clicked = await page.getAttribute('.carousel-next', 'data-clicked');
    expect(clicked).toBe('true');

    // Expect one of the indicators to be active
    const activeIndicator = await page.$('.carousel-indicator.active');
    expect(activeIndicator).not.toBeNull();
  });
});
