const { chromium } = require('playwright');

async function analyzeH1() {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set desktop viewport (standard design review size)
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to homepage
    await page.goto('http://localhost:8080');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({
        path: '/Users/alexthip/Projects/histeq.com/h1-current-state.png',
        fullPage: true
    });

    // Measure H1 element
    const h1Info = await page.evaluate(() => {
        const h1 = document.querySelector('h1.brand-heading-xl.text-financial-hero');
        if (!h1) return { error: 'H1 not found' };

        const rect = h1.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Get computed styles
        const styles = window.getComputedStyle(h1);

        return {
            // Position and size
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,

            // Viewport measurements
            viewportHeight,
            viewportWidth,
            viewportPercentageHeight: (rect.height / viewportHeight * 100).toFixed(1),
            viewportPercentageWidth: (rect.width / viewportWidth * 100).toFixed(1),

            // Typography measurements
            fontSize: styles.fontSize,
            lineHeight: styles.lineHeight,
            fontWeight: styles.fontWeight,
            letterSpacing: styles.letterSpacing,

            // Text content
            textContent: h1.textContent,
            innerHTML: h1.innerHTML
        };
    });

    // Take a focused screenshot of the hero section
    const heroSection = await page.locator('[data-testid="hero-section"]');
    await heroSection.screenshot({
        path: '/Users/alexthip/Projects/histeq.com/h1-hero-section.png'
    });

    console.log('H1 Analysis Results:');
    console.log('===================');
    console.log(JSON.stringify(h1Info, null, 2));

    await browser.close();
    return h1Info;
}

analyzeH1().catch(console.error);