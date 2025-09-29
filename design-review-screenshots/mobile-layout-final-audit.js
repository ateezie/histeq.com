const { chromium } = require('playwright');
const fs = require('fs');

async function finalMobileAudit() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('🔍 FINAL MOBILE LAYOUT AUDIT - Historic Equity Theme\n');
    console.log('📱 Testing at 375px width (iPhone X viewport)\n');

    try {
        // Test the static layout file
        await page.goto('file:///Users/alexthip/Projects/histeq.com/mobile-layout-test.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Capture console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // 1. CRITICAL ANALYSIS: Right-side padding issue
        console.log('🚨 CRITICAL ISSUE: RIGHT-SIDE PADDING ANALYSIS');
        const paddingAnalysis = await page.evaluate(() => {
            const viewport = { width: window.innerWidth, height: window.innerHeight };
            const issues = [];

            // Check all major layout containers
            const containers = document.querySelectorAll('.container, .header-content, .test-section, main, header, footer');

            containers.forEach(container => {
                const rect = container.getBoundingClientRect();
                const styles = window.getComputedStyle(container);

                // Check for right-side overflow or missing padding
                if (rect.right > viewport.width - 5) { // 5px tolerance
                    issues.push({
                        element: container.tagName + (container.className ? '.' + container.className.split(' ').slice(0, 2).join('.') : ''),
                        width: Math.round(rect.width),
                        right: Math.round(rect.right),
                        viewportWidth: viewport.width,
                        overflow: Math.round(rect.right - viewport.width),
                        paddingRight: styles.paddingRight,
                        marginRight: styles.marginRight,
                        boxSizing: styles.boxSizing
                    });
                }

                // Check for missing left padding
                if (rect.left < 5) { // Should have some left padding
                    issues.push({
                        element: container.tagName + '.' + (container.className || 'no-class') + ' (LEFT)',
                        left: Math.round(rect.left),
                        paddingLeft: styles.paddingLeft,
                        marginLeft: styles.marginLeft,
                        issue: 'MISSING_LEFT_PADDING'
                    });
                }
            });

            return {
                viewport,
                issues,
                totalIssues: issues.length
            };
        });

        console.log(`📐 Viewport: ${paddingAnalysis.viewport.width}x${paddingAnalysis.viewport.height}px`);

        if (paddingAnalysis.totalIssues > 0) {
            console.log(`🚨 Found ${paddingAnalysis.totalIssues} padding/overflow issues:`);
            paddingAnalysis.issues.forEach((issue, index) => {
                console.log(`  ${index + 1}. ❌ ${issue.element}`);
                if (issue.overflow) {
                    console.log(`     • Overflows viewport by ${issue.overflow}px`);
                    console.log(`     • Element width: ${issue.width}px, Right edge: ${issue.right}px`);
                    console.log(`     • Padding-right: ${issue.paddingRight}`);
                    console.log(`     • Box-sizing: ${issue.boxSizing}`);
                }
                if (issue.issue === 'MISSING_LEFT_PADDING') {
                    console.log(`     • Left position: ${issue.left}px (too close to edge)`);
                    console.log(`     • Padding-left: ${issue.paddingLeft}`);
                }
                console.log('');
            });
        } else {
            console.log('✅ No padding/overflow issues detected');
        }

        // 2. HAMBURGER MENU FUNCTIONALITY TEST
        console.log('🍔 HAMBURGER MENU FUNCTIONALITY TEST');
        const menuTest = await page.evaluate(() => {
            const menuBtn = document.getElementById('mobile-menu-toggle');
            const mobileMenu = document.getElementById('mobile-menu');

            if (!menuBtn || !mobileMenu) {
                return { success: false, reason: 'Menu elements not found' };
            }

            const btnRect = menuBtn.getBoundingClientRect();
            const btnStyles = window.getComputedStyle(menuBtn);

            return {
                success: true,
                button: {
                    visible: btnStyles.display !== 'none',
                    size: { width: btnRect.width, height: btnRect.height },
                    position: { x: btnRect.x, y: btnRect.y },
                    touchSize: btnRect.width >= 44 && btnRect.height >= 44
                },
                menu: {
                    initiallyHidden: !mobileMenu.classList.contains('is-open'),
                    hasTransition: window.getComputedStyle(mobileMenu).transition.includes('max-height')
                }
            };
        });

        if (menuTest.success) {
            console.log('✅ Hamburger menu elements found');
            console.log(`  📱 Button visible: ${menuTest.button.visible}`);
            console.log(`  📏 Button size: ${Math.round(menuTest.button.size.width)}x${Math.round(menuTest.button.size.height)}px`);
            console.log(`  👆 Touch-friendly: ${menuTest.button.touchSize ? 'YES' : 'NO'} (${menuTest.button.touchSize ? '≥44px' : '<44px'})`);
            console.log(`  🎛️ Menu initially hidden: ${menuTest.menu.initiallyHidden ? 'YES' : 'NO'}`);

            // Test menu toggle functionality
            console.log('  🧪 Testing menu toggle...');
            await page.click('#mobile-menu-toggle');
            await page.waitForTimeout(500);

            const menuAfterClick = await page.evaluate(() => {
                const menu = document.getElementById('mobile-menu');
                return {
                    isOpen: menu.classList.contains('is-open'),
                    visible: window.getComputedStyle(menu).maxHeight !== '0px',
                    height: menu.offsetHeight
                };
            });

            if (menuAfterClick.isOpen && menuAfterClick.height > 0) {
                console.log('  ✅ Menu toggle WORKING - menu opens properly');
                console.log(`  📏 Menu height when open: ${menuAfterClick.height}px`);

                // Test menu close
                await page.click('#mobile-menu-toggle');
                await page.waitForTimeout(500);

                const menuAfterClose = await page.evaluate(() => {
                    const menu = document.getElementById('mobile-menu');
                    return {
                        isOpen: menu.classList.contains('is-open'),
                        height: menu.offsetHeight
                    };
                });

                if (!menuAfterClose.isOpen) {
                    console.log('  ✅ Menu close WORKING - menu closes properly');
                } else {
                    console.log('  ❌ Menu close FAILED - menu stays open');
                }
            } else {
                console.log('  ❌ Menu toggle FAILED - menu does not open');
            }
        } else {
            console.log(`❌ Hamburger menu test failed: ${menuTest.reason}`);
        }

        // 3. ICON SIZING OPTIMIZATION
        console.log('\n🎨 ICON SIZING OPTIMIZATION TEST');
        const iconAnalysis = await page.evaluate(() => {
            const icons = document.querySelectorAll('.test-icon, img, svg, i[class*="fa-"], [class*="icon"]');
            const results = [];

            icons.forEach((icon, index) => {
                const rect = icon.getBoundingClientRect();
                const styles = window.getComputedStyle(icon);

                if (rect.width > 0 && rect.height > 0) {
                    const isOptimal = rect.width >= 16 && rect.width <= 48 && rect.height >= 16 && rect.height <= 48;
                    const isTooLarge = rect.width > 48 || rect.height > 48;
                    const isTooSmall = rect.width < 16 || rect.height < 16;

                    results.push({
                        index,
                        element: icon.tagName + (icon.className ? '.' + icon.className.split(' ').slice(0, 2).join('.') : ''),
                        size: { width: Math.round(rect.width), height: Math.round(rect.height) },
                        status: isOptimal ? 'OPTIMAL' : (isTooLarge ? 'TOO_LARGE' : 'TOO_SMALL'),
                        recommendations: isTooLarge ? 'Reduce size for mobile' : (isTooSmall ? 'Increase size for touch' : 'Size is optimal')
                    });
                }
            });

            return results;
        });

        console.log(`📊 Found ${iconAnalysis.length} icons/graphics`);
        const problematicIcons = iconAnalysis.filter(icon => icon.status !== 'OPTIMAL');

        if (problematicIcons.length > 0) {
            console.log(`🚨 ${problematicIcons.length} icons need optimization:`);
            problematicIcons.forEach((icon, index) => {
                console.log(`  ${index + 1}. ${icon.status === 'TOO_LARGE' ? '📏' : '🔍'} ${icon.element}: ${icon.size.width}x${icon.size.height}px`);
                console.log(`     💡 ${icon.recommendations}`);
            });
        } else {
            console.log('✅ All icons are optimally sized for mobile');
        }

        // 4. CAROUSEL MOBILE IMPLEMENTATION (if any)
        console.log('\n🎠 CAROUSEL MOBILE IMPLEMENTATION TEST');
        const carouselAnalysis = await page.evaluate(() => {
            const possibleCarousels = document.querySelectorAll('.carousel, .swiper, .slider, [class*="carousel"], [class*="swiper"], [class*="slider"]');

            if (possibleCarousels.length === 0) return { found: false };

            const results = [];
            possibleCarousels.forEach(carousel => {
                const rect = carousel.getBoundingClientRect();
                const styles = window.getComputedStyle(carousel);

                results.push({
                    element: carousel.tagName + (carousel.className ? '.' + carousel.className.split(' ').slice(0, 2).join('.') : ''),
                    size: { width: Math.round(rect.width), height: Math.round(rect.height) },
                    overflowsViewport: rect.width > window.innerWidth,
                    overflowHandling: styles.overflowX,
                    touchFriendly: styles.touchAction !== 'none'
                });
            });

            return { found: true, carousels: results };
        });

        if (carouselAnalysis.found) {
            console.log(`📊 Found ${carouselAnalysis.carousels.length} carousel(s)`);
            carouselAnalysis.carousels.forEach((carousel, index) => {
                console.log(`  ${index + 1}. ${carousel.element}:`);
                console.log(`     📏 Size: ${carousel.size.width}x${carousel.size.height}px`);
                console.log(`     🌊 Overflows viewport: ${carousel.overflowsViewport ? 'YES' : 'NO'}`);
                console.log(`     📱 Overflow handling: ${carousel.overflowHandling}`);
                console.log(`     👆 Touch-friendly: ${carousel.touchFriendly ? 'YES' : 'NO'}`);
            });
        } else {
            console.log('ℹ️ No carousels detected in current test');
        }

        // 5. COMPREHENSIVE TOUCH TARGET AUDIT
        console.log('\n👆 TOUCH TARGET ACCESSIBILITY AUDIT');
        const touchTargetAnalysis = await page.evaluate(() => {
            const interactive = document.querySelectorAll('button, a, input, select, textarea, [onclick], [role="button"], [tabindex]');
            const results = [];

            interactive.forEach(element => {
                const rect = element.getBoundingClientRect();
                const styles = window.getComputedStyle(element);

                if (rect.width > 0 && rect.height > 0) {
                    const isAccessible = rect.width >= 44 && rect.height >= 44;
                    const needsImprovement = rect.width < 44 || rect.height < 44;

                    results.push({
                        element: element.tagName + (element.className ? '.' + element.className.split(' ').slice(0, 2).join('.') : ''),
                        text: (element.textContent || element.value || element.alt || '').slice(0, 30),
                        size: { width: Math.round(rect.width), height: Math.round(rect.height) },
                        accessible: isAccessible,
                        padding: styles.padding,
                        recommendation: needsImprovement ? 'Increase to 44x44px minimum' : 'Size is accessible'
                    });
                }
            });

            return results;
        });

        const inaccessibleTargets = touchTargetAnalysis.filter(target => !target.accessible);

        console.log(`📊 Found ${touchTargetAnalysis.length} interactive elements`);
        console.log(`✅ Accessible targets: ${touchTargetAnalysis.length - inaccessibleTargets.length}`);

        if (inaccessibleTargets.length > 0) {
            console.log(`🚨 ${inaccessibleTargets.length} elements below 44px minimum:`);
            inaccessibleTargets.forEach((target, index) => {
                console.log(`  ${index + 1}. ❌ ${target.element}: ${target.size.width}x${target.size.height}px`);
                console.log(`     Text: "${target.text}"`);
                console.log(`     💡 ${target.recommendation}`);
            });
        } else {
            console.log('✅ All interactive elements meet accessibility guidelines');
        }

        // 6. CAPTURE COMPREHENSIVE EVIDENCE
        console.log('\n📸 CAPTURING MOBILE LAYOUT EVIDENCE');

        // Full page screenshot
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/mobile-audit-evidence-full.png',
            fullPage: true
        });

        // Header with menu closed
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/mobile-audit-evidence-header-closed.png',
            clip: { x: 0, y: 0, width: 375, height: 120 }
        });

        // Open mobile menu for screenshot
        const menuBtn = await page.locator('#mobile-menu-toggle');
        if (await menuBtn.count() > 0) {
            await menuBtn.click();
            await page.waitForTimeout(500);

            await page.screenshot({
                path: '/Users/alexthip/Projects/histeq.com/mobile-audit-evidence-header-open.png',
                clip: { x: 0, y: 0, width: 375, height: 300 }
            });
        }

        // 7. GENERATE TECHNICAL RECOMMENDATIONS
        console.log('\n🔧 GENERATING TECHNICAL RECOMMENDATIONS');

        const recommendations = [];
        let priority = 1;

        // Right-side padding issues
        if (paddingAnalysis.totalIssues > 0) {
            recommendations.push({
                priority: priority++,
                severity: 'CRITICAL',
                issue: 'Right-side padding/overflow issues',
                description: `${paddingAnalysis.totalIssues} containers overflow or lack proper right-side padding`,
                technicalFix: `
1. Review CSS for .container, .header-content classes
2. Ensure proper max-width and padding-right values
3. Check box-sizing: border-box on all containers
4. Add CSS: .container { padding-left: 1.5rem; padding-right: 1.5rem; }`,
                files: [
                    'wp-content/themes/historic-equity/static/css/style.css',
                    'wp-content/themes/historic-equity/templates/base.twig'
                ]
            });
        }

        // Hamburger menu issues
        if (!menuTest.success || !menuTest.button.touchSize) {
            recommendations.push({
                priority: priority++,
                severity: 'HIGH',
                issue: 'Hamburger menu functionality/sizing',
                description: 'Mobile navigation menu missing or inadequately sized',
                technicalFix: `
1. Ensure #mobile-menu-toggle element exists in header template
2. Implement proper toggle JavaScript functionality
3. Make button minimum 44x44px for accessibility
4. Add proper ARIA attributes for screen readers`,
                files: [
                    'wp-content/themes/historic-equity/templates/components/header.twig',
                    'wp-content/themes/historic-equity/static/js/main.js'
                ]
            });
        }

        // Icon sizing issues
        if (problematicIcons.length > 0) {
            recommendations.push({
                priority: priority++,
                severity: 'MEDIUM',
                issue: 'Icon sizing optimization',
                description: `${problematicIcons.length} icons are poorly sized for mobile`,
                technicalFix: `
1. Optimize icons to 16-48px range for mobile
2. Use responsive CSS for icon sizing
3. Consider SVG icons for scalability
4. Add media queries for mobile icon adjustments`,
                files: [
                    'wp-content/themes/historic-equity/static/css/style.css'
                ]
            });
        }

        // Touch target issues
        if (inaccessibleTargets.length > 0) {
            recommendations.push({
                priority: priority++,
                severity: 'MEDIUM',
                issue: 'Touch target accessibility',
                description: `${inaccessibleTargets.length} interactive elements below 44px minimum`,
                technicalFix: `
1. Increase button/link padding to meet 44x44px minimum
2. Add CSS: .btn, a { min-height: 44px; min-width: 44px; }
3. Review form input sizing for mobile
4. Test with actual touch devices`,
                files: [
                    'wp-content/themes/historic-equity/static/css/style.css'
                ]
            });
        }

        // CSS Media Query optimization
        if (paddingAnalysis.viewport.width <= 375) {
            recommendations.push({
                priority: priority++,
                severity: 'LOW',
                issue: 'CSS media query optimization',
                description: 'Add specific 375px breakpoint optimizations',
                technicalFix: `
1. Add @media (max-width: 375px) rules for smallest screens
2. Optimize typography scaling for mobile
3. Adjust container padding for very small screens
4. Ensure proper responsive image sizing`,
                files: [
                    'wp-content/themes/historic-equity/static/css/style.css'
                ]
            });
        }

        // Generate comprehensive report
        const finalReport = {
            auditTimestamp: new Date().toISOString(),
            testEnvironment: {
                viewport: paddingAnalysis.viewport,
                userAgent: 'iPhone X Mobile Safari',
                testFile: 'mobile-layout-test.html'
            },
            criticalFindings: {
                paddingIssues: paddingAnalysis.totalIssues,
                menuFunctionality: menuTest.success ? 'WORKING' : 'FAILED',
                iconProblems: problematicIcons.length,
                touchAccessibility: inaccessibleTargets.length,
                consoleErrors: consoleErrors.length
            },
            recommendations,
            technicalEvidence: [
                'mobile-audit-evidence-full.png',
                'mobile-audit-evidence-header-closed.png',
                'mobile-audit-evidence-header-open.png'
            ],
            nextSteps: [
                'Fix critical padding/overflow issues first',
                'Ensure hamburger menu functionality',
                'Optimize icon sizes for mobile',
                'Test with real mobile devices',
                'Validate accessibility with screen readers'
            ]
        };

        // Save comprehensive report
        fs.writeFileSync(
            '/Users/alexthip/Projects/histeq.com/mobile-audit-final-report.json',
            JSON.stringify(finalReport, null, 2)
        );

        console.log('\n📋 FINAL MOBILE AUDIT SUMMARY');
        console.log('=' .repeat(50));
        console.log(`🔧 Critical Issues: ${Object.values(finalReport.criticalFindings).filter(v => typeof v === 'number' && v > 0).length}`);
        console.log(`📝 Recommendations: ${recommendations.length}`);
        console.log(`📸 Evidence Files: ${finalReport.technicalEvidence.length}`);

        if (consoleErrors.length > 0) {
            console.log(`❌ JavaScript Errors: ${consoleErrors.length}`);
            consoleErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        console.log('\n🎯 PRIORITY FIXES NEEDED:');
        recommendations.slice(0, 3).forEach(rec => {
            console.log(`${rec.priority}. [${rec.severity}] ${rec.issue}`);
            console.log(`   ${rec.description}`);
        });

        console.log('\n✅ Mobile audit complete! Check generated files for detailed analysis.');

    } catch (error) {
        console.error('❌ Mobile audit failed:', error.message);
    } finally {
        await browser.close();
    }
}

finalMobileAudit().catch(console.error);