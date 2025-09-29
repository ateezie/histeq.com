const { chromium } = require('playwright');
const path = require('path');

async function runSimpleMobileReview() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security']
    });

    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE size
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('🔍 Starting simplified mobile design review...');

    const testFiles = [
        { name: 'Complete Homepage', file: 'carousel-test-complete.html' },
        { name: 'Contact Page', file: 'contact.html' },
        { name: 'Meet Our Team', file: 'meet-our-team.html' }
    ];

    const issues = [];

    try {
        for (const testFile of testFiles) {
            console.log(`\n📱 Testing ${testFile.name}...`);

            const filePath = path.resolve('/Users/alexthip/Projects/histeq.com', testFile.file);
            await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // Take full page screenshot
            const screenshotName = `mobile-${testFile.file.replace('.html', '')}.png`;
            await page.screenshot({
                path: `/Users/alexthip/Projects/histeq.com/review-screenshots/${screenshotName}`,
                fullPage: true
            });

            console.log(`📸 Screenshot: ${screenshotName}`);

            // Check for horizontal overflow
            const hasHorizontalOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > window.innerWidth;
            });

            if (hasHorizontalOverflow) {
                issues.push(`❌ [CRITICAL] ${testFile.name}: Horizontal overflow detected`);
            } else {
                console.log(`✅ No horizontal overflow on ${testFile.name}`);
            }

            // Check basic padding
            const paddingCheck = await page.evaluate(() => {
                const body = document.body;
                const bodyStyles = window.getComputedStyle(body);

                // Check main content areas
                const mainElements = document.querySelectorAll('main, .container, .content, section');
                let hasProperPadding = false;

                mainElements.forEach(element => {
                    const styles = window.getComputedStyle(element);
                    const paddingLeft = parseFloat(styles.paddingLeft);
                    const paddingRight = parseFloat(styles.paddingRight);

                    if (paddingLeft >= 12 && paddingRight >= 12) { // At least 12px padding
                        hasProperPadding = true;
                    }
                });

                return {
                    bodyPaddingLeft: bodyStyles.paddingLeft,
                    bodyPaddingRight: bodyStyles.paddingRight,
                    hasProperPadding: hasProperPadding
                };
            });

            console.log(`📏 ${testFile.name} padding:`, paddingCheck);

            // Test hamburger menu
            try {
                const hamburgerMenus = await page.locator('.hamburger, .mobile-menu-toggle, [aria-label*="menu"], .menu-toggle, .navbar-toggle, .btn-menu').all();

                if (hamburgerMenus.length > 0) {
                    console.log(`🍔 Found ${hamburgerMenus.length} menu button(s) on ${testFile.name}`);

                    const menu = hamburgerMenus[0];
                    await menu.click();
                    await page.waitForTimeout(1000);

                    const menuOpenScreenshot = `mobile-${testFile.file.replace('.html', '')}-menu.png`;
                    await page.screenshot({
                        path: `/Users/alexthip/Projects/histeq.com/review-screenshots/${menuOpenScreenshot}`
                    });

                    console.log(`📸 Menu screenshot: ${menuOpenScreenshot}`);

                    // Close menu
                    await menu.click();
                    await page.waitForTimeout(500);
                } else {
                    console.log(`❌ No hamburger menu found on ${testFile.name}`);
                }
            } catch (error) {
                console.log(`⚠️  Menu test failed on ${testFile.name}: ${error.message}`);
            }

            // Check for small touch targets
            const touchTargetCheck = await page.evaluate(() => {
                const buttons = document.querySelectorAll('a, button');
                let smallTargets = 0;

                buttons.forEach(button => {
                    const rect = button.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
                        smallTargets++;
                    }
                });

                return smallTargets;
            });

            if (touchTargetCheck > 0) {
                issues.push(`⚠️  [MEDIUM] ${testFile.name}: ${touchTargetCheck} touch targets smaller than 44px`);
            }

            // Check for very small fonts
            const fontCheck = await page.evaluate(() => {
                const textElements = document.querySelectorAll('p, span, div, a');
                let smallFonts = 0;

                textElements.forEach(element => {
                    if (element.textContent && element.textContent.trim()) {
                        const styles = window.getComputedStyle(element);
                        const fontSize = parseFloat(styles.fontSize);
                        if (fontSize && fontSize < 14) {
                            smallFonts++;
                        }
                    }
                });

                return smallFonts;
            });

            if (fontCheck > 0) {
                issues.push(`💡 [LOW] ${testFile.name}: ${fontCheck} elements with fonts smaller than 14px`);
            }
        }

        console.log('\n📊 MOBILE DESIGN REVIEW SUMMARY:');
        console.log('='.repeat(50));

        if (issues.length === 0) {
            console.log('✅ No major issues found!');
        } else {
            issues.forEach(issue => console.log(issue));
        }

        console.log('\n📸 Screenshots saved to review-screenshots/');

    } catch (error) {
        console.error('❌ Error during review:', error);
    } finally {
        await browser.close();
    }
}

runSimpleMobileReview().catch(console.error);