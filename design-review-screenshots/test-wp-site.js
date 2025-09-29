const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Attempting to navigate to WordPress site...');

    // Try multiple potential URLs
    const urls = [
      'http://localhost:8080',
      'http://localhost:8080/wp-content/themes/historic-equity',
      'http://127.0.0.1:8080'
    ];

    let success = false;
    for (const url of urls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        console.log(`Successfully connected to: ${url}`);
        success = true;

        // Take screenshot
        await page.screenshot({ path: 'current-wp-state.png', fullPage: true });
        console.log('Screenshot saved as current-wp-state.png');

        // Check for WordPress content
        const title = await page.title();
        console.log('Page title:', title);

        // Check if it's a proper WordPress page
        const isWordPress = await page.evaluate(() => {
          return document.querySelector('body').className.includes('wordpress') ||
                 document.querySelector('meta[name="generator"]') !== null ||
                 document.querySelector('.wp-') !== null;
        });
        console.log('Is WordPress:', isWordPress);

        break;
      } catch (error) {
        console.log(`Failed to connect to ${url}:`, error.message);
      }
    }

    if (!success) {
      console.log('Could not connect to any WordPress URL');
    }

  } catch (error) {
    console.error('Error:', error);
  }

  await browser.close();
})();