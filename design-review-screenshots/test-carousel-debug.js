/**
 * Carousel Debug Test Script
 * Tests the carousel functionality and text overlay visibility
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testCarouselOverlays() {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: false, // Show browser for debugging
            defaultViewport: { width: 1440, height: 900 }
        });

        const page = await browser.newPage();

        // Test 1: Debug page
        console.log('Testing debug page...');
        await page.goto('http://localhost:8000/carousel-debug.html');
        await page.waitForSelector('body');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check console logs
        const consoleLogs = [];
        page.on('console', msg => {
            consoleLogs.push(msg.text());
            console.log('Browser Console:', msg.text());
        });

        // Check if overlays are visible
        const overlays = await page.$$('.debug-overlay');
        console.log(`Found ${overlays.length} debug overlays`);

        for (let i = 0; i < overlays.length; i++) {
            const overlay = overlays[i];
            const isVisible = await overlay.isIntersectingViewport();
            const boundingBox = await overlay.boundingBox();
            console.log(`Debug Overlay ${i}: visible=${isVisible}, bounds=`, boundingBox);
        }

        // Take screenshot
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/carousel-debug-test.png',
            fullPage: true
        });

        // Test 2: Actual homepage
        console.log('\nTesting actual homepage...');
        await page.goto('http://localhost:8000');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check for carousel section
        const carouselSection = await page.$('[data-testid="building-carousel"]');
        if (!carouselSection) {
            console.error('Carousel section not found!');
            return;
        }

        // Check carousel slides
        const carouselSlides = await page.$$('.carousel-slide');
        console.log(`Found ${carouselSlides.length} carousel slides`);

        // Check text overlays in actual carousel
        const actualOverlays = await page.$$('.carousel-slide .absolute');
        console.log(`Found ${actualOverlays.length} text overlays in carousel`);

        for (let i = 0; i < actualOverlays.length; i++) {
            const overlay = actualOverlays[i];
            const isVisible = await overlay.isIntersectingViewport();
            const boundingBox = await overlay.boundingBox();
            const computedStyle = await page.evaluate(el => {
                const style = window.getComputedStyle(el);
                return {
                    position: style.position,
                    top: style.top,
                    right: style.right,
                    zIndex: style.zIndex,
                    display: style.display,
                    visibility: style.visibility,
                    opacity: style.opacity,
                    background: style.background,
                    color: style.color
                };
            }, overlay);

            console.log(`Carousel Overlay ${i}:`, {
                visible: isVisible,
                bounds: boundingBox,
                styles: computedStyle
            });
        }

        // Check specific text content
        const overlayTexts = await page.evaluate(() => {
            const overlays = document.querySelectorAll('.carousel-slide .absolute');
            return Array.from(overlays).map(overlay => ({
                textContent: overlay.textContent.trim(),
                innerHTML: overlay.innerHTML,
                classList: Array.from(overlay.classList)
            }));
        });

        console.log('Overlay texts:', overlayTexts);

        // Take screenshot of homepage
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/carousel-homepage-test.png',
            fullPage: true
        });

        // Focus on carousel section
        await carouselSection.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/carousel-section-test.png'
        });

        // Test mobile viewport
        console.log('\nTesting mobile viewport...');
        await page.setViewport({ width: 375, height: 667 });
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mobileOverlays = await page.$$('.carousel-slide .absolute');
        console.log(`Mobile: Found ${mobileOverlays.length} text overlays`);

        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/carousel-mobile-test.png',
            fullPage: true
        });

        console.log('\nTest completed! Check generated screenshots for visual verification.');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testCarouselOverlays().catch(console.error);