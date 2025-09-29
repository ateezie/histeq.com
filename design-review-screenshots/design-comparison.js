const { chromium } = require('playwright');

async function captureDesignComparison() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Taking screenshots for design comparison...');

        // Set viewport to match Figma design - 1440px width
        await page.setViewportSize({ width: 1440, height: 900 });

        // Navigate to our design review HTML
        await page.goto('http://localhost:8080/design-review.html', {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        // Wait for fonts to load
        await page.waitForTimeout(2000);

        // Take full page screenshot of current implementation
        await page.screenshot({
            path: 'current-implementation-full.png',
            fullPage: true
        });
        console.log('✅ Full page screenshot saved: current-implementation-full.png');

        // Take viewport screenshots of key sections for detailed comparison

        // Hero section
        const heroSection = page.locator('[data-testid="hero-section"]');
        await heroSection.screenshot({ path: 'current-hero-section.png' });
        console.log('✅ Hero section screenshot saved: current-hero-section.png');

        // Join mission section
        const joinMissionSection = page.locator('[data-testid="join-mission"]');
        await joinMissionSection.screenshot({ path: 'current-join-mission.png' });
        console.log('✅ Join mission section screenshot saved: current-join-mission.png');

        // Footer section
        const footer = page.locator('footer.site-footer');
        await footer.screenshot({ path: 'current-footer.png' });
        console.log('✅ Footer screenshot saved: current-footer.png');

        // Get page title and check for errors
        const title = await page.title();
        console.log('Page Title:', title);

        // Check console for any errors
        const messages = [];
        page.on('console', msg => messages.push(msg.text()));
        await page.waitForTimeout(1000);

        if (messages.length > 0) {
            console.log('Console messages:', messages);
        }

        console.log('\n📋 Design Comparison Analysis:');
        console.log('1. current-implementation-full.png - Complete page view');
        console.log('2. current-hero-section.png - Hero section detail');
        console.log('3. current-join-mission.png - CTA section detail');
        console.log('4. current-footer.png - Footer detail');
        console.log('\nCompare these with: /design/home__desktop.png (Figma design target)');

    } catch (error) {
        console.error('Error capturing screenshots:', error);

        // Fallback: try to capture at least basic info
        try {
            await page.screenshot({ path: 'error-fallback.png' });
            console.log('Fallback screenshot saved: error-fallback.png');
        } catch (fallbackError) {
            console.error('Fallback screenshot failed:', fallbackError);
        }
    }

    await browser.close();
}

captureDesignComparison().catch(console.error);