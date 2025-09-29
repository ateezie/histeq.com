const puppeteer = require('puppeteer');

async function debugMobileNavigation() {
  console.log('🔍 DEBUGGING MOBILE NAVIGATION ISSUE');
  console.log('====================================');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });

    // Navigate to homepage
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle2' });

    console.log('📱 Testing on mobile viewport (375x667px)');

    // Check if mobile menu button exists
    const mobileMenuButton = await page.$('#mobile-menu-toggle');
    console.log('🔘 Mobile menu button found:', !!mobileMenuButton);

    if (mobileMenuButton) {
      // Check if button is visible
      const isVisible = await page.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        const style = window.getComputedStyle(button);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none'
        );
      }, mobileMenuButton);

      console.log('👁️  Mobile menu button visible:', isVisible);

      if (isVisible) {
        // Check mobile menu element before click
        const mobileMenuBefore = await page.$('#mobile-menu');
        const isMenuHiddenBefore = await page.evaluate((menu) => {
          return menu ? menu.classList.contains('hidden') : 'No menu element found';
        }, mobileMenuBefore);

        console.log('📋 Mobile menu hidden before click:', isMenuHiddenBefore);

        // Click the mobile menu button
        console.log('🖱️  Clicking mobile menu button...');
        await mobileMenuButton.click();

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check mobile menu after click
        const mobileMenuAfter = await page.$('#mobile-menu');
        const isMenuHiddenAfter = await page.evaluate((menu) => {
          if (!menu) return 'No menu element found';

          const rect = menu.getBoundingClientRect();
          const style = window.getComputedStyle(menu);

          return {
            hasHiddenClass: menu.classList.contains('hidden'),
            display: style.display,
            visibility: style.visibility,
            maxHeight: style.maxHeight,
            height: rect.height,
            isVisible: rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
          };
        }, mobileMenuAfter);

        console.log('📋 Mobile menu state after click:', JSON.stringify(isMenuHiddenAfter, null, 2));

        // Check for any JavaScript errors
        const consoleMessages = [];
        page.on('console', msg => {
          if (msg.type() === 'error' || msg.type() === 'warn') {
            consoleMessages.push(`${msg.type()}: ${msg.text()}`);
          }
        });

        page.on('pageerror', err => consoleMessages.push('ERROR: ' + err.message));

        if (consoleMessages.length > 0) {
          console.log('⚠️  Console messages:', consoleMessages);
        } else {
          console.log('✅ No console errors detected');
        }

        // Take a screenshot after clicking
        await page.screenshot({
          path: '/tmp/mobile-nav-debug.png',
          fullPage: true
        });
        console.log('📸 Debug screenshot saved to /tmp/mobile-nav-debug.png');

        // Test if menu items are clickable
        const menuLinks = await page.$$('#mobile-menu a');
        console.log('🔗 Number of menu links found:', menuLinks.length);

        if (menuLinks.length > 0) {
          for (let i = 0; i < menuLinks.length; i++) {
            const linkText = await page.evaluate(link => link.textContent, menuLinks[i]);
            const isLinkVisible = await page.evaluate(link => {
              const rect = link.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            }, menuLinks[i]);
            console.log(`   Link ${i + 1}: "${linkText}" - Visible: ${isLinkVisible}`);
          }
        }
      }
    }

    // Also check for any elements that might be overlapping
    const overlappingElements = await page.evaluate(() => {
      const button = document.getElementById('mobile-menu-toggle');
      const menu = document.getElementById('mobile-menu');

      if (!button || !menu) return 'Missing elements';

      const buttonRect = button.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();

      // Find elements at the menu position
      const elementsAtMenuPosition = document.elementsFromPoint(
        menuRect.left + menuRect.width / 2,
        menuRect.top + 10
      );

      return {
        buttonPosition: { x: buttonRect.x, y: buttonRect.y, width: buttonRect.width, height: buttonRect.height },
        menuPosition: { x: menuRect.x, y: menuRect.y, width: menuRect.width, height: menuRect.height },
        elementsAtMenuPosition: elementsAtMenuPosition.slice(0, 5).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id
        }))
      };
    });

    console.log('🔍 Element positioning analysis:', JSON.stringify(overlappingElements, null, 2));

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugMobileNavigation().catch(console.error);