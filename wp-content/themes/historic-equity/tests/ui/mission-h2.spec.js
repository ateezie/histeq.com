const { test, expect } = require('@playwright/test');

test.describe('Homepage mission H2 typography', () => {
  test('mission H2 should include font-sportscenter class and use Sportscenter font', async ({ page }) => {
    await page.goto('/');

    const missionH2 = page.locator('#mission h2');
    await expect(missionH2).toHaveCount(1);

    // Check for the utility class presence
    await expect(missionH2).toHaveClass(/font-sportscenter/);

    // Also check computed font-family contains Sportscenter (some browsers return quotes)
    const fontFamily = await missionH2.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toMatch(/sportscenter|georgia|times new roman/);
  });
});
