const { chromium } = require('playwright');

async function testAccessibilityLinkSimple() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Testing accessibility link behavior...');

        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto('http://localhost:8080/design-review.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Check if accessibility link exists and its visibility
        const accessibilityLinkTest = await page.evaluate(() => {
            // Try multiple selectors to find the accessibility link
            const selectors = [
                'a[href="#"]:has-text("Accessibility")',
                'a:has-text("Accessibility")',
                '.sr-only',
                'footer a[href="#"]'
            ];

            let link = null;
            for (const selector of selectors) {
                try {
                    link = document.querySelector(selector);
                    if (link && link.textContent.includes('Accessibility')) {
                        break;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }

            if (!link) {
                return { found: false, message: 'Accessibility link not found' };
            }

            const styles = window.getComputedStyle(link);
            const rect = link.getBoundingClientRect();

            return {
                found: true,
                textContent: link.textContent,
                classList: Array.from(link.classList),
                computedStyles: {
                    position: styles.position,
                    left: styles.left,
                    top: styles.top,
                    width: styles.width,
                    height: styles.height,
                    opacity: styles.opacity,
                    visibility: styles.visibility,
                    display: styles.display
                },
                boundingRect: {
                    width: rect.width,
                    height: rect.height,
                    x: rect.x,
                    y: rect.y
                },
                isVisuallyHidden: rect.width <= 1 || rect.height <= 1 || styles.visibility === 'hidden' || styles.opacity === '0',
                offsetParent: link.offsetParent === null
            };
        });

        console.log('\n🔍 Accessibility Link Analysis:');
        console.log('Found:', accessibilityLinkTest.found);

        if (accessibilityLinkTest.found) {
            console.log('Text:', accessibilityLinkTest.textContent);
            console.log('Classes:', accessibilityLinkTest.classList);
            console.log('Is Visually Hidden:', accessibilityLinkTest.isVisuallyHidden);
            console.log('Computed Styles:', accessibilityLinkTest.computedStyles);
            console.log('Bounding Rect:', accessibilityLinkTest.boundingRect);
        }

        // Take a screenshot of the footer for visual verification
        await page.screenshot({ path: 'footer-accessibility-test.png', fullPage: false });
        console.log('✅ Footer screenshot saved: footer-accessibility-test.png');

        await browser.close();

        return accessibilityLinkTest;

    } catch (error) {
        console.error('Error:', error);
        await browser.close();
        return { error: error.message };
    }
}

testAccessibilityLinkSimple().then(result => {
    if (result.found && result.isVisuallyHidden) {
        console.log('\n✅ SUCCESS: Accessibility link is properly hidden for visual users');
    } else if (result.found && !result.isVisuallyHidden) {
        console.log('\n❌ ISSUE: Accessibility link is visible when it should be hidden');
    } else {
        console.log('\n❌ ISSUE: Accessibility link not found');
    }
}).catch(console.error);