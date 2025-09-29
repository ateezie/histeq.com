const { chromium } = require('playwright');
const path = require('path');

async function testMobileNavigation() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security']
    });

    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE size
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('🔍 Testing mobile navigation functionality...');

    try {
        // Test the dedicated mobile nav file
        const filePath = path.resolve('/Users/alexthip/Projects/histeq.com/wp-content/themes/historic-equity', 'test-mobile-nav.html');
        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Take initial screenshot
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-nav-closed.png',
            fullPage: true
        });

        console.log('📸 Initial mobile nav screenshot taken');

        // Look for mobile menu toggle button
        const menuToggle = await page.locator('#mobile-menu-toggle, .mobile-menu-btn, .hamburger').first();

        if (await menuToggle.count() > 0) {
            console.log('✅ Mobile menu toggle button found');

            // Check if button is visible and clickable
            const isVisible = await menuToggle.isVisible();
            const isEnabled = await menuToggle.isEnabled();

            console.log(`🔍 Button visibility: ${isVisible}, enabled: ${isEnabled}`);

            if (isVisible && isEnabled) {
                // Click to open menu
                await menuToggle.click();
                await page.waitForTimeout(1000);

                // Take screenshot with menu open
                await page.screenshot({
                    path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-nav-open.png',
                    fullPage: true
                });

                console.log('📸 Mobile menu open screenshot taken');

                // Check if menu is visible
                const mobileMenu = await page.locator('#mobile-menu, .mobile-menu').first();
                const menuIsVisible = await mobileMenu.isVisible();

                console.log(`🔍 Mobile menu visibility after click: ${menuIsVisible}`);

                // Check menu items
                const menuItems = await page.locator('#mobile-menu a, .mobile-menu a').all();
                console.log(`📋 Found ${menuItems.length} menu items`);

                // Close menu
                await menuToggle.click();
                await page.waitForTimeout(1000);

                // Take screenshot with menu closed
                await page.screenshot({
                    path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-nav-closed-after.png'
                });

                console.log('✅ Mobile navigation test completed successfully');

            } else {
                console.log('❌ Mobile menu button not accessible');
            }

        } else {
            console.log('❌ No mobile menu toggle button found');
        }

    } catch (error) {
        console.error('❌ Error during mobile nav test:', error);
    } finally {
        await browser.close();
    }
}

testMobileNavigation().catch(console.error);