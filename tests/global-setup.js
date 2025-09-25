// Global setup for Playwright tests
// Ensures WordPress server is running and pages are accessible

const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Setting up Playwright test environment...');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test WordPress server availability
    console.log('🌐 Checking WordPress server availability...');

    const baseURL = config.use?.baseURL || 'http://localhost:8080';
    await page.goto(baseURL, { timeout: 30000 });

    console.log('✅ WordPress server is accessible');

    // Test critical pages exist
    const criticalPages = [
      '/',
      '/meet-our-team/',
      '/contact-us/'
    ];

    for (const pagePath of criticalPages) {
      try {
        const response = await page.goto(`${baseURL}${pagePath}`, { timeout: 15000 });
        const status = response?.status() || 0;

        if (status >= 200 && status < 400) {
          console.log(`✅ ${pagePath} - Status: ${status}`);
        } else {
          console.log(`⚠️  ${pagePath} - Status: ${status} (may need attention)`);
        }
      } catch (error) {
        console.log(`❌ ${pagePath} - Error: ${error.message}`);
      }
    }

    // Wait for any initial loading to complete
    await page.waitForTimeout(2000);

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = globalSetup;