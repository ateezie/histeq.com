const { chromium } = require('playwright');

async function runMobileDesignReview() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });

    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE size
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('🔍 Starting comprehensive mobile design review at 375px viewport...');

    try {
        // Navigate to homepage
        console.log('📱 Testing Homepage Mobile Layout...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Take full page screenshot
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-homepage-full.png',
            fullPage: true
        });

        // Check for horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });

        console.log(`❌ Horizontal overflow detected: ${hasHorizontalOverflow}`);

        // Test hamburger menu functionality
        console.log('🍔 Testing hamburger menu...');
        const hamburgerButton = await page.locator('.hamburger, .mobile-menu-toggle, [aria-label*="menu"], .menu-toggle').first();

        if (await hamburgerButton.count() > 0) {
            await hamburgerButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({
                path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-menu-open.png',
                fullPage: true
            });

            // Close menu
            await hamburgerButton.click();
            await page.waitForTimeout(500);
        } else {
            console.log('❌ No hamburger menu button found');
        }

        // Test carousel if present
        console.log('🎠 Testing carousel mobile layout...');
        const carousel = await page.locator('.carousel, .hero-carousel, .slick-slider').first();
        if (await carousel.count() > 0) {
            await page.screenshot({
                path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-carousel-detail.png'
            });
        }

        // Check padding/margins
        const bodyPadding = await page.evaluate(() => {
            const body = document.body;
            const computed = window.getComputedStyle(body);
            return {
                paddingLeft: computed.paddingLeft,
                paddingRight: computed.paddingRight,
                marginLeft: computed.marginLeft,
                marginRight: computed.marginRight
            };
        });

        console.log('📏 Body padding/margins:', bodyPadding);

        // Check main container padding
        const containerPadding = await page.evaluate(() => {
            const containers = document.querySelectorAll('.container, .main, .content, main');
            const results = [];
            containers.forEach((container, index) => {
                const computed = window.getComputedStyle(container);
                results.push({
                    element: container.className || container.tagName,
                    paddingLeft: computed.paddingLeft,
                    paddingRight: computed.paddingRight,
                    marginLeft: computed.marginLeft,
                    marginRight: computed.marginRight
                });
            });
            return results;
        });

        console.log('📦 Container padding/margins:', containerPadding);

        // Test Meet Our Team page
        console.log('👥 Testing Meet Our Team page...');
        await page.goto('http://localhost:8080/meet-our-team', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-team-full.png',
            fullPage: true
        });

        // Test Contact page
        console.log('📞 Testing Contact page...');
        await page.goto('http://localhost:8080/contact', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-contact-full.png',
            fullPage: true
        });

        // Check touch target sizes
        console.log('👆 Checking touch target sizes...');
        const touchTargets = await page.evaluate(() => {
            const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])');
            const smallTargets = [];

            interactiveElements.forEach((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
                    smallTargets.push({
                        tag: element.tagName,
                        text: element.textContent?.trim().substring(0, 50) || '',
                        class: element.className,
                        width: rect.width,
                        height: rect.height
                    });
                }
            });

            return smallTargets;
        });

        console.log('⚠️  Touch targets smaller than 44px:', touchTargets);

        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Check font sizes for readability
        const fontSizes = await page.evaluate(() => {
            const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button');
            const fontData = {};

            textElements.forEach((element) => {
                const computed = window.getComputedStyle(element);
                const fontSize = parseFloat(computed.fontSize);
                const tag = element.tagName.toLowerCase();

                if (!fontData[tag]) {
                    fontData[tag] = [];
                }

                if (fontSize && fontSize < 16 && element.textContent?.trim()) {
                    fontData[tag].push({
                        fontSize: fontSize,
                        text: element.textContent.trim().substring(0, 30)
                    });
                }
            });

            return fontData;
        });

        console.log('📝 Small font sizes (< 16px):', fontSizes);

        // Generate comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            viewport: '375x667 (iPhone SE)',
            findings: {
                horizontalOverflow: hasHorizontalOverflow,
                bodyPadding: bodyPadding,
                containerPadding: containerPadding,
                smallTouchTargets: touchTargets,
                smallFonts: fontSizes,
                consoleErrors: errors
            },
            screenshots: {
                homepage: 'mobile-homepage-full.png',
                menuOpen: 'mobile-menu-open.png',
                carousel: 'mobile-carousel-detail.png',
                teamPage: 'mobile-team-full.png',
                contactPage: 'mobile-contact-full.png'
            }
        };

        // Save report
        require('fs').writeFileSync(
            '/Users/alexthip/Projects/histeq.com/mobile-design-report.json',
            JSON.stringify(report, null, 2)
        );

        console.log('✅ Mobile design review complete!');
        console.log('📊 Report saved to mobile-design-report.json');
        console.log('📸 Screenshots saved to review-screenshots/');

    } catch (error) {
        console.error('❌ Error during mobile review:', error);
    } finally {
        await browser.close();
    }
}

runMobileDesignReview().catch(console.error);