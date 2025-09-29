const { chromium } = require('playwright');
const path = require('path');

async function runMobileHTMLReview() {
    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });

    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone SE size
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('🔍 Starting mobile design review of HTML test files at 375px viewport...');

    const testFiles = [
        { name: 'Complete Homepage', file: 'carousel-test-complete.html' },
        { name: 'Contact Page', file: 'contact.html' },
        { name: 'Meet Our Team', file: 'meet-our-team.html' }
    ];

    const findings = {
        criticalIssues: [],
        highPriorityIssues: [],
        mediumPriorityIssues: [],
        nitpicks: []
    };

    try {
        for (const testFile of testFiles) {
            console.log(`\n📱 Testing ${testFile.name} (${testFile.file})...`);

            const filePath = path.resolve('/Users/alexthip/Projects/histeq.com', testFile.file);
            await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);

            // Take full page screenshot
            const screenshotName = `mobile-${testFile.file.replace('.html', '')}-full.png`;
            await page.screenshot({
                path: `/Users/alexthip/Projects/histeq.com/review-screenshots/${screenshotName}`,
                fullPage: true
            });

            console.log(`📸 Screenshot saved: ${screenshotName}`);

            // Check for horizontal overflow
            const hasHorizontalOverflow = await page.evaluate(() => {
                return document.documentElement.scrollWidth > window.innerWidth;
            });

            if (hasHorizontalOverflow) {
                findings.criticalIssues.push({
                    page: testFile.name,
                    issue: 'Horizontal overflow detected',
                    description: 'Content extends beyond mobile viewport width'
                });
            }

            // Check right padding specifically
            const paddingAnalysis = await page.evaluate(() => {
                const body = document.body;
                const bodyStyles = window.getComputedStyle(body);

                // Check all major containers
                const containers = document.querySelectorAll('main, .container, .mx-auto, section, header, footer');
                const containerData = [];

                containers.forEach((container, index) => {
                    const styles = window.getComputedStyle(container);
                    const rect = container.getBoundingClientRect();

                    containerData.push({
                        element: container.tagName + (container.className ? '.' + container.className.split(' ').join('.') : ''),
                        paddingLeft: styles.paddingLeft,
                        paddingRight: styles.paddingRight,
                        marginLeft: styles.marginLeft,
                        marginRight: styles.marginRight,
                        width: rect.width,
                        rightEdge: rect.right,
                        viewportWidth: window.innerWidth
                    });
                });

                return {
                    body: {
                        paddingLeft: bodyStyles.paddingLeft,
                        paddingRight: bodyStyles.paddingRight,
                        marginLeft: bodyStyles.marginLeft,
                        marginRight: bodyStyles.marginRight
                    },
                    containers: containerData
                };
            });

            console.log(`📏 Padding analysis for ${testFile.name}:`, paddingAnalysis);

            // Check for right-side padding issues
            const rightPaddingIssues = paddingAnalysis.containers.filter(container => {
                return container.rightEdge >= container.viewportWidth - 5; // 5px tolerance
            });

            if (rightPaddingIssues.length > 0) {
                findings.criticalIssues.push({
                    page: testFile.name,
                    issue: 'Missing right-side padding',
                    description: 'Content extends too close to right edge of viewport',
                    elements: rightPaddingIssues
                });
            }

            // Test hamburger menu if present
            const hamburgerMenus = await page.locator('.hamburger, .mobile-menu-toggle, [aria-label*="menu"], .menu-toggle, .navbar-toggle').all();

            if (hamburgerMenus.length > 0) {
                console.log(`🍔 Found ${hamburgerMenus.length} hamburger menu(s)`);

                for (let i = 0; i < hamburgerMenus.length; i++) {
                    const menu = hamburgerMenus[i];

                    // Check if it's visible and clickable
                    const isVisible = await menu.isVisible();
                    const isEnabled = await menu.isEnabled();

                    if (!isVisible || !isEnabled) {
                        findings.highPriorityIssues.push({
                            page: testFile.name,
                            issue: 'Hamburger menu not functional',
                            description: `Menu ${i + 1} is not visible or clickable`
                        });
                        continue;
                    }

                    // Test clicking the menu
                    try {
                        await menu.click();
                        await page.waitForTimeout(1000);

                        const menuScreenshot = `mobile-${testFile.file.replace('.html', '')}-menu-open.png`;
                        await page.screenshot({
                            path: `/Users/alexthip/Projects/histeq.com/review-screenshots/${menuScreenshot}`
                        });

                        // Check if menu opened (look for common mobile menu indicators)
                        const menuIsOpen = await page.evaluate(() => {
                            const openMenus = document.querySelectorAll('.mobile-menu.open, .navbar-collapse.show, .menu-open, [aria-expanded="true"]');
                            return openMenus.length > 0;
                        });

                        if (!menuIsOpen) {
                            findings.mediumPriorityIssues.push({
                                page: testFile.name,
                                issue: 'Mobile menu may not be opening properly',
                                description: 'Could not detect open menu state after clicking'
                            });
                        }

                        // Close menu by clicking again
                        await menu.click();
                        await page.waitForTimeout(500);

                    } catch (error) {
                        findings.highPriorityIssues.push({
                            page: testFile.name,
                            issue: 'Hamburger menu click failed',
                            description: `Error clicking menu: ${error.message}`
                        });
                    }
                }
            } else {
                console.log('❌ No hamburger menu found');
            }

            // Check carousel on homepage
            if (testFile.file.includes('carousel')) {
                console.log('🎠 Testing carousel...');

                const carouselElement = await page.locator('.carousel, .hero-carousel, .slick-slider, .swiper').first();
                if (await carouselElement.count() > 0) {
                    // Take detailed carousel screenshot
                    await page.screenshot({
                        path: `/Users/alexthip/Projects/histeq.com/review-screenshots/mobile-carousel-detail.png`,
                        clip: await carouselElement.boundingBox()
                    });

                    // Check carousel text overlays
                    const overlayIssues = await page.evaluate(() => {
                        const overlays = document.querySelectorAll('.carousel-slide .absolute, .slide-content, .carousel-caption');
                        const issues = [];

                        overlays.forEach((overlay, index) => {
                            const rect = overlay.getBoundingClientRect();
                            const styles = window.getComputedStyle(overlay);

                            // Check if text is too small
                            const fontSize = parseFloat(styles.fontSize);
                            if (fontSize < 14) {
                                issues.push({
                                    type: 'small-text',
                                    index: index,
                                    fontSize: fontSize,
                                    text: overlay.textContent?.substring(0, 50)
                                });
                            }

                            // Check if overlay is cut off
                            if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
                                issues.push({
                                    type: 'cutoff',
                                    index: index,
                                    bounds: {
                                        right: rect.right,
                                        bottom: rect.bottom,
                                        viewportWidth: window.innerWidth,
                                        viewportHeight: window.innerHeight
                                    }
                                });
                            }
                        });

                        return issues;
                    });

                    if (overlayIssues.length > 0) {
                        findings.mediumPriorityIssues.push({
                            page: testFile.name,
                            issue: 'Carousel overlay issues',
                            description: 'Text overlays have sizing or positioning problems',
                            details: overlayIssues
                        });
                    }
                }
            }

            // Check touch target sizes
            const touchTargetIssues = await page.evaluate(() => {
                const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])');
                const smallTargets = [];

                interactiveElements.forEach((element, index) => {
                    const rect = element.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
                        smallTargets.push({
                            index: index,
                            tag: element.tagName,
                            text: element.textContent?.trim().substring(0, 30) || '',
                            className: element.className,
                            width: rect.width,
                            height: rect.height
                        });
                    }
                });

                return smallTargets;
            });

            if (touchTargetIssues.length > 0) {
                findings.mediumPriorityIssues.push({
                    page: testFile.name,
                    issue: 'Touch targets too small',
                    description: 'Interactive elements smaller than 44px minimum',
                    details: touchTargetIssues
                });
            }

            // Check for very small fonts
            const fontIssues = await page.evaluate(() => {
                const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, li');
                const smallFonts = [];

                textElements.forEach((element, index) => {
                    const styles = window.getComputedStyle(element);
                    const fontSize = parseFloat(styles.fontSize);

                    if (fontSize && fontSize < 14 && element.textContent?.trim()) {
                        smallFonts.push({
                            index: index,
                            tag: element.tagName,
                            fontSize: fontSize,
                            text: element.textContent.trim().substring(0, 50),
                            className: element.className
                        });
                    }
                });

                return smallFonts;
            });

            if (fontIssues.length > 0) {
                findings.mediumPriorityIssues.push({
                    page: testFile.name,
                    issue: 'Font sizes too small for mobile',
                    description: 'Text smaller than 14px may be hard to read',
                    details: fontIssues
                });
            }

            // Check icon sizes
            const iconIssues = await page.evaluate(() => {
                const icons = document.querySelectorAll('i, .icon, [class*="icon"], svg, img[alt*="icon"]');
                const iconProblems = [];

                icons.forEach((icon, index) => {
                    const rect = icon.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        // Too small (hard to see/tap)
                        if (rect.width < 16 || rect.height < 16) {
                            iconProblems.push({
                                index: index,
                                type: 'too-small',
                                width: rect.width,
                                height: rect.height,
                                className: icon.className,
                                tag: icon.tagName
                            });
                        }
                        // Too large (overwhelming on mobile)
                        else if (rect.width > 80 || rect.height > 80) {
                            iconProblems.push({
                                index: index,
                                type: 'too-large',
                                width: rect.width,
                                height: rect.height,
                                className: icon.className,
                                tag: icon.tagName
                            });
                        }
                    }
                });

                return iconProblems;
            });

            if (iconIssues.length > 0) {
                findings.mediumPriorityIssues.push({
                    page: testFile.name,
                    issue: 'Icon sizing issues',
                    description: 'Icons are too small or too large for mobile',
                    details: iconIssues
                });
            }
        }

        // Generate comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            viewport: '375x667 (iPhone SE)',
            summary: {
                criticalIssues: findings.criticalIssues.length,
                highPriorityIssues: findings.highPriorityIssues.length,
                mediumPriorityIssues: findings.mediumPriorityIssues.length,
                nitpicks: findings.nitpicks.length
            },
            findings: findings,
            testedFiles: testFiles
        };

        // Save detailed report
        require('fs').writeFileSync(
            '/Users/alexthip/Projects/histeq.com/mobile-review-detailed.json',
            JSON.stringify(report, null, 2)
        );

        console.log('\n✅ Mobile design review complete!');
        console.log('📊 Detailed report saved to mobile-review-detailed.json');
        console.log('📸 Screenshots saved to review-screenshots/');
        console.log('\n📈 Summary:');
        console.log(`🚨 Critical Issues: ${findings.criticalIssues.length}`);
        console.log(`⚠️  High Priority: ${findings.highPriorityIssues.length}`);
        console.log(`💡 Medium Priority: ${findings.mediumPriorityIssues.length}`);
        console.log(`✨ Nitpicks: ${findings.nitpicks.length}`);

    } catch (error) {
        console.error('❌ Error during mobile review:', error);
    } finally {
        await browser.close();
    }
}

runMobileHTMLReview().catch(console.error);