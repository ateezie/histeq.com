const { chromium } = require('playwright');

async function viewDebugSite() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        console.log('Navigating to debug WordPress site...');

        // Navigate to the site
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

        // Take screenshot
        await page.screenshot({ path: 'debug-site-screenshot.png', fullPage: true });
        console.log('Screenshot saved as debug-site-screenshot.png');

        // Get page title and check content
        const title = await page.title();
        console.log('Page Title:', title);

        // Check if our debug info shows
        const bodyText = await page.textContent('body');
        console.log('Contains Historic Equity?', bodyText.includes('Historic Equity'));
        console.log('Contains Debug Mode?', bodyText.includes('Debug Mode'));

        // Check for any obvious issues
        const h1Text = await page.textContent('h1');
        console.log('Main heading:', h1Text);

        // Wait for manual inspection
        console.log('Browser will stay open for 30 seconds for inspection...');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.error('Error viewing site:', error);
        await page.screenshot({ path: 'debug-error.png' });
    }

    await browser.close();
}

viewDebugSite();