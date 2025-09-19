const { chromium } = require('playwright');

async function viewSite() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        console.log('Navigating to WordPress site...');

        // First, check the main page
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

        // Take screenshot of current state
        await page.screenshot({ path: 'current-homepage.png', fullPage: true });
        console.log('Homepage screenshot saved');

        // Get page title and content info
        const title = await page.title();
        const bodyText = await page.textContent('body');

        console.log('Page Title:', title);
        console.log('Page contains Historic Equity?', bodyText.includes('Historic Equity'));

        // Check if it's a WordPress error or installation page
        if (bodyText.includes('Error establishing a database connection') ||
            bodyText.includes('WordPress › Error')) {
            console.log('WordPress needs database setup or has errors');

            // Try to go to install page
            await page.goto('http://localhost:8080/wp-admin/install.php');
            await page.screenshot({ path: 'install-page.png', fullPage: true });
            console.log('Install page screenshot saved');
        }

        // Wait a bit for manual inspection
        console.log('Keeping browser open for 30 seconds for inspection...');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.error('Error:', error);
        await page.screenshot({ path: 'error-view.png' });
    }

    await browser.close();
}

viewSite();