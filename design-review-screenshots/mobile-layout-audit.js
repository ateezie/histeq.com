const { chromium } = require('playwright');

async function mobileLayoutAudit() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 }, // iPhone X dimensions
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('🔍 Starting Mobile Layout Audit at 375px width...\n');

    try {
        // Navigate to homepage
        console.log('📱 Navigating to homepage...');
        await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        // Check for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console Error:', msg.text());
            }
        });

        // 1. CRITICAL ISSUE: Check for missing right-side padding
        console.log('\n🔍 ANALYZING PADDING AND SPACING ISSUES...');

        // Check main container padding
        const bodyPadding = await page.evaluate(() => {
            const body = document.body;
            const computedStyle = window.getComputedStyle(body);
            return {
                paddingLeft: computedStyle.paddingLeft,
                paddingRight: computedStyle.paddingRight,
                marginLeft: computedStyle.marginLeft,
                marginRight: computedStyle.marginRight
            };
        });
        console.log('Body Padding:', bodyPadding);

        // Check main content wrapper
        const mainWrapper = await page.evaluate(() => {
            const wrapper = document.querySelector('main, .main, .container, .wrapper');
            if (!wrapper) return null;

            const computedStyle = window.getComputedStyle(wrapper);
            const rect = wrapper.getBoundingClientRect();
            return {
                selector: wrapper.tagName + (wrapper.className ? '.' + wrapper.className.split(' ').join('.') : ''),
                paddingLeft: computedStyle.paddingLeft,
                paddingRight: computedStyle.paddingRight,
                marginLeft: computedStyle.marginLeft,
                marginRight: computedStyle.marginRight,
                width: rect.width,
                left: rect.left,
                right: rect.right
            };
        });
        console.log('Main Wrapper:', mainWrapper);

        // Check container elements for right-side spacing issues
        const containerAnalysis = await page.evaluate(() => {
            const containers = document.querySelectorAll('.container, .max-w-\\[1440px\\], .mx-auto, section');
            const issues = [];

            containers.forEach(container => {
                const rect = container.getBoundingClientRect();
                const style = window.getComputedStyle(container);

                if (rect.right > window.innerWidth - 20) { // 20px buffer
                    issues.push({
                        element: container.tagName + (container.className ? '.' + container.className.split(' ').slice(0, 3).join('.') : ''),
                        width: rect.width,
                        right: rect.right,
                        viewportWidth: window.innerWidth,
                        overflow: rect.right - window.innerWidth,
                        paddingRight: style.paddingRight,
                        marginRight: style.marginRight
                    });
                }
            });

            return issues;
        });

        if (containerAnalysis.length > 0) {
            console.log('🚨 RIGHT-SIDE PADDING ISSUES FOUND:');
            containerAnalysis.forEach(issue => {
                console.log(`  - ${issue.element}: overflows by ${issue.overflow}px`);
                console.log(`    Width: ${issue.width}px, Right edge: ${issue.right}px`);
                console.log(`    Padding-right: ${issue.paddingRight}, Margin-right: ${issue.marginRight}`);
            });
        } else {
            console.log('✅ No right-side padding issues detected');
        }

        // 2. ICON SIZING ANALYSIS
        console.log('\n🔍 ANALYZING ICON SIZING...');

        const iconAnalysis = await page.evaluate(() => {
            const icons = document.querySelectorAll('img[src*="icon"], svg, .icon, i[class*="fa-"], i[class*="icon-"]');
            const iconIssues = [];

            icons.forEach(icon => {
                const rect = icon.getBoundingClientRect();
                const style = window.getComputedStyle(icon);

                if (rect.width > 0 && rect.height > 0) {
                    iconIssues.push({
                        type: icon.tagName,
                        class: icon.className,
                        src: icon.src || 'N/A',
                        width: rect.width,
                        height: rect.height,
                        computedWidth: style.width,
                        computedHeight: style.height,
                        tooLarge: rect.width > 48 || rect.height > 48, // Flagging large icons
                        tooSmall: rect.width < 16 || rect.height < 16  // Flagging tiny icons
                    });
                }
            });

            return iconIssues;
        });

        const problematicIcons = iconAnalysis.filter(icon => icon.tooLarge || icon.tooSmall);
        if (problematicIcons.length > 0) {
            console.log('🚨 ICON SIZING ISSUES:');
            problematicIcons.forEach(icon => {
                console.log(`  - ${icon.type} (${icon.class}): ${icon.width}x${icon.height}px ${icon.tooLarge ? '(TOO LARGE)' : '(TOO SMALL)'}`);
            });
        } else {
            console.log('✅ Icon sizes appear appropriate for mobile');
        }

        // 3. CAROUSEL MOBILE IMPLEMENTATION ANALYSIS
        console.log('\n🔍 ANALYZING CAROUSEL MOBILE IMPLEMENTATION...');

        const carouselAnalysis = await page.evaluate(() => {
            const carousel = document.querySelector('.carousel, .swiper, .slider, [class*="carousel"]');
            if (!carousel) return { found: false };

            const rect = carousel.getBoundingClientRect();
            const style = window.getComputedStyle(carousel);
            const slides = carousel.querySelectorAll('.slide, .swiper-slide, [class*="slide"]');

            return {
                found: true,
                width: rect.width,
                height: rect.height,
                overflow: rect.right > window.innerWidth,
                slideCount: slides.length,
                display: style.display,
                position: style.position,
                transform: style.transform
            };
        });

        if (carouselAnalysis.found) {
            console.log('📊 Carousel Found:');
            console.log(`  - Dimensions: ${carouselAnalysis.width}x${carouselAnalysis.height}px`);
            console.log(`  - Slides: ${carouselAnalysis.slideCount}`);
            console.log(`  - Overflow: ${carouselAnalysis.overflow ? 'YES' : 'NO'}`);
            console.log(`  - Display: ${carouselAnalysis.display}`);
        } else {
            console.log('⚠️ No carousel found on page');
        }

        // 4. HAMBURGER MENU FUNCTIONALITY TEST
        console.log('\n🔍 TESTING HAMBURGER MENU...');

        const menuButton = await page.locator('button[aria-label*="menu"], .hamburger, .menu-toggle, button[class*="menu"]').first();
        const menuExists = await menuButton.count() > 0;

        if (menuExists) {
            console.log('✅ Hamburger menu button found');

            // Test menu toggle
            const menuBefore = await page.evaluate(() => {
                const menu = document.querySelector('.mobile-menu, .nav-menu, [class*="menu"][class*="mobile"]');
                return menu ? window.getComputedStyle(menu).display : null;
            });

            await menuButton.click();
            await page.waitForTimeout(500);

            const menuAfter = await page.evaluate(() => {
                const menu = document.querySelector('.mobile-menu, .nav-menu, [class*="menu"][class*="mobile"]');
                return menu ? window.getComputedStyle(menu).display : null;
            });

            console.log(`  - Menu state before click: ${menuBefore}`);
            console.log(`  - Menu state after click: ${menuAfter}`);
            console.log(`  - Menu toggle ${menuBefore !== menuAfter ? 'WORKING' : 'NOT WORKING'}`);
        } else {
            console.log('❌ No hamburger menu button found');
        }

        // 5. SCREENSHOT ANALYSIS
        console.log('\n📸 Capturing mobile layout screenshots...');

        // Full page screenshot
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/mobile-audit-full.png',
            fullPage: true
        });

        // Viewport screenshot
        await page.screenshot({
            path: '/Users/alexthip/Projects/histeq.com/mobile-audit-viewport.png',
            fullPage: false
        });

        // 6. CSS BREAKPOINT ANALYSIS
        console.log('\n🔍 ANALYZING CSS MEDIA QUERIES...');

        const mediaQueryAnalysis = await page.evaluate(() => {
            // Get all stylesheets
            const sheets = Array.from(document.styleSheets);
            const mediaQueries = [];

            sheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    rules.forEach(rule => {
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            mediaQueries.push({
                                media: rule.media.mediaText,
                                rules: rule.cssRules.length
                            });
                        }
                    });
                } catch (e) {
                    // Skip external stylesheets that can't be accessed
                }
            });

            return mediaQueries;
        });

        const mobileQueries = mediaQueryAnalysis.filter(mq =>
            mq.media.includes('max-width') &&
            (mq.media.includes('768px') || mq.media.includes('640px') || mq.media.includes('375px'))
        );

        console.log(`📱 Found ${mobileQueries.length} mobile-specific media queries`);
        mobileQueries.forEach(mq => {
            console.log(`  - ${mq.media} (${mq.rules} rules)`);
        });

        // 7. JAVASCRIPT ERROR DETECTION
        console.log('\n🔍 CHECKING FOR JAVASCRIPT ERRORS...');

        const jsErrors = [];
        page.on('pageerror', error => {
            jsErrors.push(error.message);
        });

        // Test page interactions
        await page.evaluate(() => {
            // Try to trigger any JS-dependent functionality
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('scroll'));
        });

        await page.waitForTimeout(1000);

        if (jsErrors.length > 0) {
            console.log('❌ JavaScript errors detected:');
            jsErrors.forEach(error => console.log(`  - ${error}`));
        } else {
            console.log('✅ No JavaScript errors detected');
        }

        // 8. TOUCH TARGET ANALYSIS
        console.log('\n🔍 ANALYZING TOUCH TARGETS...');

        const touchTargets = await page.evaluate(() => {
            const interactive = document.querySelectorAll('button, a, input, select, textarea, [onclick], [role="button"]');
            const smallTargets = [];

            interactive.forEach(element => {
                const rect = element.getBoundingClientRect();
                const minSize = 44; // iOS/Android minimum touch target

                if (rect.width > 0 && rect.height > 0 && (rect.width < minSize || rect.height < minSize)) {
                    smallTargets.push({
                        tag: element.tagName,
                        class: element.className,
                        text: element.textContent?.slice(0, 30) || '',
                        width: rect.width,
                        height: rect.height
                    });
                }
            });

            return smallTargets;
        });

        if (touchTargets.length > 0) {
            console.log('🚨 SMALL TOUCH TARGETS FOUND:');
            touchTargets.forEach(target => {
                console.log(`  - ${target.tag}: ${target.width}x${target.height}px "${target.text}"`);
            });
        } else {
            console.log('✅ All touch targets meet minimum size requirements');
        }

        console.log('\n✅ Mobile layout audit complete!');
        console.log('📊 Screenshots saved:');
        console.log('  - mobile-audit-full.png (full page)');
        console.log('  - mobile-audit-viewport.png (viewport)');

    } catch (error) {
        console.error('❌ Error during mobile audit:', error);
    } finally {
        await browser.close();
    }
}

mobileLayoutAudit();