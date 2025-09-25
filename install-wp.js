const { chromium } = require('playwright');

async function installWordPress() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        console.log('Navigating to WordPress installation...');
        await page.goto('http://localhost:8080/wp-admin/install.php');

        // Wait for page to load
        await page.waitForSelector('#weblog_title', { timeout: 10000 });

        // Fill out installation form
        await page.fill('#weblog_title', 'Historic Equity Inc.');
        await page.fill('#user_name', 'admin');
        await page.fill('#pass1', 'admin123');
        await page.fill('#pass2', 'admin123');
        await page.fill('#admin_email', 'admin@histeq.com');

        // Submit installation
        await page.click('#submit');

        // Wait for success page
        await page.waitForSelector('.step', { timeout: 30000 });

        console.log('WordPress installed successfully!');

        // Navigate to admin and activate our theme
        await page.goto('http://localhost:8080/wp-login.php');
        await page.fill('#user_login', 'admin');
        await page.fill('#user_pass', 'admin123');
        await page.click('#wp-submit');

        // Wait for dashboard
        await page.waitForSelector('#wpadminbar', { timeout: 10000 });

        // Go to themes page
        await page.goto('http://localhost:8080/wp-admin/themes.php');

        // Look for Historic Equity theme and activate if available
        const themeExists = await page.$('.theme[data-slug="historic-equity"]');
        if (themeExists) {
            await page.click('.theme[data-slug="historic-equity"] .activate');
            console.log('Historic Equity theme activated!');
        } else {
            console.log('Historic Equity theme not found, using default theme');
        }

        // Navigate to homepage
        await page.goto('http://localhost:8080/');

        // Take screenshot
        await page.screenshot({ path: 'current-site.png', fullPage: true });
        console.log('Screenshot saved as current-site.png');

        console.log('WordPress setup complete! Keeping browser open for viewing...');

        // Keep browser open for manual inspection
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    } catch (error) {
        console.error('Error during installation:', error);
        await page.screenshot({ path: 'error-screenshot.png' });
    }

    await browser.close();
}

installWordPress();