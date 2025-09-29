const { chromium } = require('playwright');

async function mobileTechnicalAudit() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('🔍 Technical Mobile Layout Audit - 375px width...\n');

    try {
        // Navigate and wait for load
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // 1. CRITICAL ANALYSIS: Check body/container padding issues
        console.log('🚨 CRITICAL PADDING ANALYSIS:');
        const paddingAnalysis = await page.evaluate(() => {
            const viewportWidth = window.innerWidth;
            const body = document.body;
            const bodyStyles = window.getComputedStyle(body);

            // Check all major containers
            const containers = document.querySelectorAll('header, main, footer, .container, .content-container, .site-header, .header-content');
            const issues = [];

            containers.forEach(container => {
                const rect = container.getBoundingClientRect();
                const styles = window.getComputedStyle(container);

                // Check if element extends beyond viewport
                const rightOverflow = rect.right > viewportWidth;
                const leftOverflow = rect.left < 0;

                if (rightOverflow || leftOverflow || rect.width > viewportWidth) {
                    issues.push({
                        element: `${container.tagName}${container.className ? '.' + container.className.split(' ').slice(0, 2).join('.') : ''}`,
                        width: Math.round(rect.width),
                        left: Math.round(rect.left),
                        right: Math.round(rect.right),
                        overflow: rightOverflow ? Math.round(rect.right - viewportWidth) : 0,
                        paddingLeft: styles.paddingLeft,
                        paddingRight: styles.paddingRight,
                        marginLeft: styles.marginLeft,
                        marginRight: styles.marginRight,
                        boxSizing: styles.boxSizing
                    });
                }
            });

            return {
                viewportWidth,
                bodyPadding: {
                    left: bodyStyles.paddingLeft,
                    right: bodyStyles.paddingRight
                },
                issues,
                totalIssues: issues.length
            };
        });

        console.log(`📐 Viewport Width: ${paddingAnalysis.viewportWidth}px`);
        console.log(`📦 Body Padding: Left ${paddingAnalysis.bodyPadding.left}, Right ${paddingAnalysis.bodyPadding.right}`);

        if (paddingAnalysis.totalIssues > 0) {
            console.log(`🚨 Found ${paddingAnalysis.totalIssues} overflow issues:`);
            paddingAnalysis.issues.forEach(issue => {
                console.log(`  ❌ ${issue.element}:`);
                console.log(`     Width: ${issue.width}px (overflows by ${issue.overflow}px)`);
                console.log(`     Position: left=${issue.left}px, right=${issue.right}px`);
                console.log(`     Padding: left=${issue.paddingLeft}, right=${issue.paddingRight}`);
                console.log(`     Box-sizing: ${issue.boxSizing}`);
            });
        } else {
            console.log('✅ No padding/overflow issues detected');
        }

        // 2. HAMBURGER MENU TECHNICAL ANALYSIS
        console.log('\n🍔 HAMBURGER MENU TECHNICAL ANALYSIS:');
        const menuAnalysis = await page.evaluate(() => {
            const menuBtn = document.querySelector('#mobile-menu-toggle, .mobile-menu-btn, button[aria-label*="menu"]');
            const mobileMenu = document.querySelector('#mobile-menu, .mobile-menu');

            if (!menuBtn) return { found: false, reason: 'Button not found' };

            const btnRect = menuBtn.getBoundingClientRect();
            const btnStyles = window.getComputedStyle(menuBtn);

            return {
                found: true,
                button: {
                    visible: btnStyles.display !== 'none' && btnStyles.visibility !== 'hidden',
                    position: { x: btnRect.x, y: btnRect.y },
                    size: { width: btnRect.width, height: btnRect.height },
                    display: btnStyles.display,
                    zIndex: btnStyles.zIndex
                },
                menu: mobileMenu ? {
                    exists: true,
                    visible: window.getComputedStyle(mobileMenu).display !== 'none',
                    classes: mobileMenu.className
                } : { exists: false }
            };
        });

        if (menuAnalysis.found) {
            console.log('✅ Hamburger menu button found');
            console.log(`  📍 Position: (${menuAnalysis.button.position.x}, ${menuAnalysis.button.position.y})`);
            console.log(`  📏 Size: ${menuAnalysis.button.size.width}x${menuAnalysis.button.size.height}px`);
            console.log(`  👁️ Visible: ${menuAnalysis.button.visible}`);
            console.log(`  🎛️ Display: ${menuAnalysis.button.display}`);

            if (menuAnalysis.menu.exists) {
                console.log(`  📱 Mobile menu exists, visible: ${menuAnalysis.menu.visible}`);

                // Test menu toggle functionality
                console.log('  🧪 Testing menu toggle...');
                await page.click('#mobile-menu-toggle, .mobile-menu-btn');
                await page.waitForTimeout(500);

                const menuAfterClick = await page.evaluate(() => {
                    const menu = document.querySelector('#mobile-menu, .mobile-menu');
                    return menu ? {
                        visible: window.getComputedStyle(menu).display !== 'none',
                        hasOpenClass: menu.classList.contains('is-open'),
                        height: menu.offsetHeight
                    } : null;
                });

                if (menuAfterClick && menuAfterClick.visible) {
                    console.log('  ✅ Menu toggle working - menu opens');
                } else {
                    console.log('  ❌ Menu toggle not working - menu does not open');
                }
            } else {
                console.log('  ❌ Mobile menu element not found');
            }
        } else {
            console.log(`❌ Hamburger menu not found: ${menuAnalysis.reason}`);
        }

        // 3. ICON SIZING TECHNICAL ANALYSIS
        console.log('\n🎨 ICON SIZING ANALYSIS:');
        const iconAnalysis = await page.evaluate(() => {
            const icons = document.querySelectorAll('img[src*="icon"], svg, i[class*="fa-"], .icon');
            const problems = [];

            icons.forEach((icon, index) => {
                const rect = icon.getBoundingClientRect();
                const styles = window.getComputedStyle(icon);

                if (rect.width > 0 && rect.height > 0) {
                    const tooLarge = rect.width > 64 || rect.height > 64;
                    const tooSmall = rect.width < 12 || rect.height < 12;

                    if (tooLarge || tooSmall) {
                        problems.push({
                            index,
                            tag: icon.tagName,
                            class: icon.className,
                            src: icon.src || 'N/A',
                            size: { width: rect.width, height: rect.height },
                            issue: tooLarge ? 'TOO_LARGE' : 'TOO_SMALL',
                            computedSize: { width: styles.width, height: styles.height }
                        });
                    }
                }
            });

            return {
                totalIcons: icons.length,
                problems
            };
        });

        console.log(`📊 Found ${iconAnalysis.totalIcons} icons total`);
        if (iconAnalysis.problems.length > 0) {
            console.log(`🚨 ${iconAnalysis.problems.length} icon sizing issues:`);
            iconAnalysis.problems.forEach(problem => {
                console.log(`  ❌ ${problem.tag} - ${problem.issue}`);
                console.log(`     Size: ${problem.size.width}x${problem.size.height}px`);
                console.log(`     Computed: ${problem.computedSize.width} x ${problem.computedSize.height}`);
            });
        } else {
            console.log('✅ All icons properly sized for mobile');
        }

        // 4. CAROUSEL MOBILE IMPLEMENTATION
        console.log('\n🎠 CAROUSEL MOBILE ANALYSIS:');
        const carouselAnalysis = await page.evaluate(() => {
            // Look for common carousel patterns
            const carouselSelectors = [
                '.carousel', '.swiper', '.slider', '.hero-slider',
                '[class*="carousel"]', '[class*="swiper"]', '[class*="slider"]'
            ];

            let carousel = null;
            for (const selector of carouselSelectors) {
                carousel = document.querySelector(selector);
                if (carousel) break;
            }

            if (!carousel) return { found: false };

            const rect = carousel.getBoundingClientRect();
            const styles = window.getComputedStyle(carousel);
            const slides = carousel.querySelectorAll('.slide, .swiper-slide, [class*="slide"]');

            return {
                found: true,
                carousel: {
                    width: rect.width,
                    height: rect.height,
                    overflow: rect.width > window.innerWidth,
                    overflowX: styles.overflowX,
                    overflowY: styles.overflowY,
                    display: styles.display,
                    position: styles.position
                },
                slides: {
                    count: slides.length,
                    width: slides.length > 0 ? slides[0].getBoundingClientRect().width : 0
                }
            };
        });

        if (carouselAnalysis.found) {
            console.log('✅ Carousel found');
            console.log(`  📏 Size: ${carouselAnalysis.carousel.width}x${carouselAnalysis.carousel.height}px`);
            console.log(`  🌊 Overflow: ${carouselAnalysis.carousel.overflow ? 'YES' : 'NO'}`);
            console.log(`  📱 Slides: ${carouselAnalysis.slides.count}`);
            console.log(`  🎛️ Overflow-X: ${carouselAnalysis.carousel.overflowX}`);
        } else {
            console.log('⚠️ No carousel found');
        }

        // 5. MEDIA QUERY ANALYSIS
        console.log('\n📱 CSS MEDIA QUERY ANALYSIS:');
        const mediaQueryAnalysis = await page.evaluate(() => {
            const sheets = Array.from(document.styleSheets);
            let mobileQueries = 0;
            let paddingRules = 0;

            sheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || []);
                    rules.forEach(rule => {
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            const mediaText = rule.media.mediaText;
                            if (mediaText.includes('max-width') &&
                                (mediaText.includes('767px') || mediaText.includes('768px') ||
                                 mediaText.includes('375px') || mediaText.includes('640px'))) {
                                mobileQueries++;

                                // Check for padding-related rules
                                const innerRules = Array.from(rule.cssRules);
                                innerRules.forEach(innerRule => {
                                    if (innerRule.style && (
                                        innerRule.style.paddingLeft ||
                                        innerRule.style.paddingRight ||
                                        innerRule.style.padding
                                    )) {
                                        paddingRules++;
                                    }
                                });
                            }
                        }
                    });
                } catch (e) {
                    // Skip external stylesheets
                }
            });

            return { mobileQueries, paddingRules };
        });

        console.log(`📱 Found ${mediaQueryAnalysis.mobileQueries} mobile media queries`);
        console.log(`📦 Found ${mediaQueryAnalysis.paddingRules} padding rules in mobile queries`);

        // 6. TOUCH TARGET ANALYSIS
        console.log('\n👆 TOUCH TARGET ANALYSIS:');
        const touchAnalysis = await page.evaluate(() => {
            const interactive = document.querySelectorAll('a, button, input, select, textarea, [onclick], [role="button"]');
            const smallTargets = [];
            const minSize = 44; // iOS/Android recommended minimum

            interactive.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 &&
                    (rect.width < minSize || rect.height < minSize)) {
                    smallTargets.push({
                        tag: element.tagName,
                        text: element.textContent?.slice(0, 20) || '',
                        size: { width: rect.width, height: rect.height },
                        class: element.className.split(' ').slice(0, 2).join('.')
                    });
                }
            });

            return {
                totalInteractive: interactive.length,
                smallTargets,
                issueCount: smallTargets.length
            };
        });

        console.log(`👆 Found ${touchAnalysis.totalInteractive} interactive elements`);
        if (touchAnalysis.issueCount > 0) {
            console.log(`🚨 ${touchAnalysis.issueCount} elements below 44px touch target:`);
            touchAnalysis.smallTargets.forEach(target => {
                console.log(`  ❌ ${target.tag}: ${target.size.width}x${target.size.height}px`);
                console.log(`     Text: "${target.text}"`);
                console.log(`     Class: ${target.class}`);
            });
        } else {
            console.log('✅ All touch targets meet minimum size requirements');
        }

        // 7. CAPTURE CRITICAL EVIDENCE
        console.log('\n📸 CAPTURING TECHNICAL EVIDENCE...');

        // Full page screenshot
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/mobile-technical-audit-full.png',
            fullPage: true
        });

        // Viewport screenshot focused on header
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/mobile-technical-audit-header.png',
            clip: { x: 0, y: 0, width: 375, height: 200 }
        });

        // Generate technical summary
        const technicalSummary = {
            timestamp: new Date().toISOString(),
            viewport: { width: 375, height: 812 },
            criticalIssues: {
                paddingOverflow: paddingAnalysis.totalIssues,
                hamburgerMenu: !menuAnalysis.found,
                iconSizing: iconAnalysis.problems.length,
                touchTargets: touchAnalysis.issueCount
            },
            recommendations: [],
            cssAnalysis: {
                mobileMediaQueries: mediaQueryAnalysis.mobileQueries,
                paddingRules: mediaQueryAnalysis.paddingRules
            }
        };

        // Generate recommendations based on findings
        if (paddingAnalysis.totalIssues > 0) {
            technicalSummary.recommendations.push({
                priority: 'HIGH',
                issue: 'Container padding/overflow',
                fix: 'Add proper mobile padding classes and check box-sizing properties'
            });
        }

        if (!menuAnalysis.found) {
            technicalSummary.recommendations.push({
                priority: 'HIGH',
                issue: 'Missing hamburger menu',
                fix: 'Implement mobile navigation menu with proper accessibility'
            });
        }

        if (iconAnalysis.problems.length > 0) {
            technicalSummary.recommendations.push({
                priority: 'MEDIUM',
                issue: 'Icon sizing issues',
                fix: 'Adjust icon sizes for mobile viewport using responsive CSS'
            });
        }

        if (touchAnalysis.issueCount > 0) {
            technicalSummary.recommendations.push({
                priority: 'MEDIUM',
                issue: 'Small touch targets',
                fix: 'Increase button/link sizes to minimum 44px for accessibility'
            });
        }

        // Save technical report
        require('fs').writeFileSync(
            '/Users/alexthip/Projects/histeq.com/mobile-technical-report.json',
            JSON.stringify(technicalSummary, null, 2)
        );

        console.log('\n📋 TECHNICAL AUDIT COMPLETE');
        console.log('🔧 Critical Issues Found:', Object.values(technicalSummary.criticalIssues).reduce((a, b) => a + b, 0));
        console.log('📝 Recommendations Generated:', technicalSummary.recommendations.length);
        console.log('📁 Files Generated:');
        console.log('  - mobile-technical-audit-full.png');
        console.log('  - mobile-technical-audit-header.png');
        console.log('  - mobile-technical-report.json');

    } catch (error) {
        console.error('❌ Technical audit failed:', error.message);
    } finally {
        await browser.close();
    }
}

mobileTechnicalAudit().catch(console.error);