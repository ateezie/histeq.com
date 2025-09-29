// Test script to verify carousel functionality
const puppeteer = require('puppeteer');

async function testCarousel() {
    console.log('Testing carousel functionality...');

    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // Set viewport to desktop size
        await page.setViewport({ width: 1440, height: 900 });

        // Navigate to test page
        await page.goto('http://localhost:8000/carousel-test.html');

        // Wait for page to load
        await page.waitForTimeout(2000);

        // Check if carousel elements exist
        const containerExists = await page.$('.building-carousel-container') !== null;
        const slidesCount = await page.$$eval('.carousel-slide', slides => slides.length);
        const indicatorsCount = await page.$$eval('.carousel-indicator', indicators => indicators.length);
        const prevButton = await page.$('.carousel-prev') !== null;
        const nextButton = await page.$('.carousel-next') !== null;

        console.log('--- Carousel Test Results ---');
        console.log('Container exists:', containerExists);
        console.log('Number of slides:', slidesCount);
        console.log('Number of indicators:', indicatorsCount);
        console.log('Previous button exists:', prevButton);
        console.log('Next button exists:', nextButton);

        // Test navigation
        if (nextButton) {
            console.log('Testing next button click...');
            await page.click('.carousel-next');
            await page.waitForTimeout(1000);

            // Check if carousel moved
            const trackTransform = await page.$eval('.carousel-track', track =>
                getComputedStyle(track).transform
            );
            console.log('Track transform after next click:', trackTransform);
        }

        // Get console logs
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));

        await page.reload();
        await page.waitForTimeout(2000);

        console.log('\n--- Console Logs ---');
        logs.forEach(log => console.log(log));

        await browser.close();

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Check if puppeteer is available, if not, use alternative test
if (typeof require !== 'undefined') {
    try {
        testCarousel();
    } catch (e) {
        console.log('Puppeteer not available, running basic test');
        console.log('Please manually test: http://localhost:8000/carousel-test.html');
    }
} else {
    console.log('Please manually test: http://localhost:8000/carousel-test.html');
}