const { chromium } = require('playwright');

async function captureTheme() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Capturing Historic Equity theme...');

        // Navigate to the site
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

        // Take full page screenshot
        await page.screenshot({
            path: 'historic-equity-theme-current.png',
            fullPage: true
        });

        // Also take viewport screenshot
        await page.screenshot({
            path: 'historic-equity-theme-viewport.png'
        });

        // Get some info about the page
        const title = await page.title();
        const headings = await page.$$eval('h1, h2, h3', els =>
            els.map(el => ({ tag: el.tagName, text: el.textContent.trim() }))
        );

        console.log('Page Title:', title);
        console.log('Headings found:', headings.length);
        console.log('First few headings:', headings.slice(0, 5));

        // Check for our CSS
        const hasCustomCSS = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return links.some(link => link.href.includes('historic-equity'));
        });

        console.log('Custom CSS loaded:', hasCustomCSS);

        // Check for our JS
        const hasCustomJS = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return scripts.some(script => script.src && script.src.includes('historic-equity'));
        });

        console.log('Custom JS loaded:', hasCustomJS);

        console.log('Screenshots saved:');
        console.log('- historic-equity-theme-current.png (full page)');
        console.log('- historic-equity-theme-viewport.png (viewport)');

    } catch (error) {
        console.error('Error capturing theme:', error);
    }

    await browser.close();
}

captureTheme();