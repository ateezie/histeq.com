const { test, expect } = require('@playwright/test');

test.describe('Core Web Vitals Performance Tests', () => {
  test('Homepage should load in under 3 seconds', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('Largest Contentful Paint should be under 2.5 seconds', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            resolve(entries[entries.length - 1].startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        setTimeout(() => resolve(0), 5000);
      });
    });

    expect(lcp).toBeLessThan(2500);
  });
});