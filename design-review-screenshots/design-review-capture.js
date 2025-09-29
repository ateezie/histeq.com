const { chromium } = require('playwright');

async function captureDesignReview() {
    console.log('Starting design review capture...');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();

    try {
        // Homepage
        console.log('Capturing homepage...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/design-review-homepage.png',
            fullPage: true
        });

        // Meet Our Team page
        console.log('Capturing Meet Our Team page...');
        await page.goto('http://localhost:8080/meet-our-team', { waitUntil: 'networkidle' });
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/design-review-team.png',
            fullPage: true
        });

        // Contact page
        console.log('Capturing Contact page...');
        await page.goto('http://localhost:8080/contact', { waitUntil: 'networkidle' });
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/design-review-contact.png',
            fullPage: true
        });

        // Check console messages
        console.log('Checking console messages...');
        const messages = [];
        page.on('console', msg => {
            messages.push(`${msg.type()}: ${msg.text()}`);
        });

        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000); // Give time for any console messages

        console.log('Console messages:', messages);

    } catch (error) {
        console.error('Error during capture:', error);
    } finally {
        await browser.close();
    }

    console.log('Design review capture complete!');
}

captureDesignReview().catch(console.error);