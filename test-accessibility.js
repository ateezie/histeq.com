const { chromium } = require('playwright');

async function testAccessibilityLink() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        console.log('Testing accessibility link behavior...');

        // Set viewport to desktop size
        await page.setViewportSize({ width: 1440, height: 900 });

        // Navigate to the design review page
        await page.goto('http://localhost:8080/design-review.html', {
            waitUntil: 'networkidle'
        });

        // Wait for page to fully load
        await page.waitForTimeout(2000);

        // Take initial screenshot to show normal state
        await page.screenshot({
            path: 'accessibility-link-normal.png',
            clip: { x: 0, y: 1350, width: 1440, height: 200 } // Focus on footer area
        });
        console.log('✅ Normal state screenshot saved: accessibility-link-normal.png');

        // Test keyboard navigation to accessibility link
        console.log('Testing keyboard navigation to accessibility link...');

        // Tab through the page to reach the accessibility link
        // First focus on body
        await page.focus('body');

        // Tab until we reach the footer area
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(100);

            // Check if we've focused the accessibility link
            const focusedElement = await page.evaluate(() => {
                const focused = document.activeElement;
                return {
                    tagName: focused.tagName,
                    textContent: focused.textContent,
                    classList: Array.from(focused.classList),
                    isVisible: focused.offsetParent !== null
                };
            });

            if (focusedElement.textContent.includes('Accessibility')) {
                console.log('🎯 Found accessibility link!');
                console.log('Element details:', focusedElement);

                // Take screenshot when focused
                await page.screenshot({
                    path: 'accessibility-link-focused.png',
                    clip: { x: 0, y: 1350, width: 1440, height: 200 }
                });
                console.log('✅ Focused state screenshot saved: accessibility-link-focused.png');
                break;
            }
        }

        // Check computed styles
        const linkStyles = await page.evaluate(() => {
            const link = document.querySelector('a[href="#"]:has-text("Accessibility"), a:has-text("Accessibility")');
            if (link) {
                const styles = window.getComputedStyle(link);
                return {
                    position: styles.position,
                    left: styles.left,
                    top: styles.top,
                    width: styles.width,
                    height: styles.height,
                    overflow: styles.overflow,
                    clip: styles.clip,
                    visibility: styles.visibility,
                    opacity: styles.opacity,
                    display: styles.display
                };
            }
            return null;
        });

        console.log('Accessibility link computed styles:', linkStyles);

        // Test that it's properly hidden in normal state
        const isHiddenNormally = await page.evaluate(() => {
            const link = document.querySelector('a[href="#"]:has-text("Accessibility"), a:has-text("Accessibility")');
            if (link) {
                const rect = link.getBoundingClientRect();
                return rect.width <= 1 || rect.height <= 1 || link.offsetParent === null;
            }
            return false;
        });

        console.log('Is accessibility link hidden in normal state?', isHiddenNormally);

        await browser.close();

        return {
            isHiddenNormally,
            linkStyles,
            message: isHiddenNormally ?
                '✅ Accessibility link is properly hidden for visual users' :
                '❌ Accessibility link is visible when it should be hidden'
        };

    } catch (error) {
        console.error('Error testing accessibility link:', error);
        await browser.close();
        return { error: error.message };
    }
}

testAccessibilityLink().then(result => {
    console.log('\n📋 Accessibility Link Test Results:');
    console.log(result);
}).catch(console.error);