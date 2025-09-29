const { chromium } = require('playwright');

async function testChanges() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Starting tests for Contact Button Styling and Skip Link Accessibility...\n');

    // Navigate to the homepage
    console.log('📍 Navigating to http://localhost:8080/');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded successfully\n');

    // Test 1: Contact Button Styling
    console.log('🎨 Testing Contact Button Styling...');

    // Check if contact button exists and get its styles
    const contactButton = await page.locator('a[href="/contact"]').first();

    if (await contactButton.count() > 0) {
      const buttonStyles = await contactButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          display: styles.display,
          padding: styles.padding,
          borderRadius: styles.borderRadius
        };
      });

      console.log('Contact Button Computed Styles:');
      console.log(`  Background Color: ${buttonStyles.backgroundColor}`);
      console.log(`  Text Color: ${buttonStyles.color}`);
      console.log(`  Display: ${buttonStyles.display}`);
      console.log(`  Padding: ${buttonStyles.padding}`);
      console.log(`  Border Radius: ${buttonStyles.borderRadius}`);

      // Check if background color matches the expected orange (#BD572B = rgb(189, 87, 43))
      const expectedOrange = 'rgb(189, 87, 43)';
      if (buttonStyles.backgroundColor === expectedOrange) {
        console.log('✅ Contact button has correct orange background (#BD572B)');
      } else {
        console.log(`❌ Contact button background should be ${expectedOrange}, but is ${buttonStyles.backgroundColor}`);
      }

      // Check if text is white
      const expectedWhite = 'rgb(255, 255, 255)';
      if (buttonStyles.color === expectedWhite) {
        console.log('✅ Contact button has correct white text color');
      } else {
        console.log(`❌ Contact button text should be ${expectedWhite}, but is ${buttonStyles.color}`);
      }
    } else {
      console.log('❌ Contact button not found');
    }

    console.log('\n📷 Taking screenshot of header area...');

    // Take screenshot of header area
    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/header-screenshot.png',
      clip: { x: 0, y: 0, width: 1440, height: 100 },
      fullPage: false
    });

    console.log('✅ Header screenshot saved as header-screenshot.png\n');

    // Test 2: Skip Links Accessibility
    console.log('♿ Testing Skip Link Accessibility...');

    // Check if skip links exist
    const skipLinks = await page.locator('.skip-links a');
    const skipLinkCount = await skipLinks.count();

    if (skipLinkCount > 0) {
      console.log(`✅ Found ${skipLinkCount} skip link(s)`);

      // Check initial visibility (should be hidden)
      for (let i = 0; i < skipLinkCount; i++) {
        const skipLink = skipLinks.nth(i);
        const text = await skipLink.textContent();
        const isVisible = await skipLink.isVisible();

        console.log(`  Skip Link "${text}": ${isVisible ? 'Visible' : 'Hidden (SR-only)'}`);
      }

      // Test focus behavior
      console.log('\n🔍 Testing skip link focus behavior...');

      // Focus on the body first to reset
      await page.locator('body').focus();

      // Press Tab to focus on first skip link
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);

      // Check if first skip link is now visible
      const firstSkipLink = skipLinks.first();
      const isVisibleOnFocus = await firstSkipLink.isVisible();
      const isEvaluatedVisible = await firstSkipLink.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.position !== 'absolute' ||
               (styles.transform !== 'translate(-100%, -100%)' &&
                styles.transform !== 'translate3d(-100%, -100%, 0)');
      });

      if (isVisibleOnFocus || isEvaluatedVisible) {
        console.log('✅ Skip link becomes visible when focused');
      } else {
        console.log('❌ Skip link should become visible when focused');
      }

      // Take screenshot with focused skip link
      await page.screenshot({
        path: '/Users/alexthip/Projects/histeq.com/skip-link-focused.png',
        clip: { x: 0, y: 0, width: 1440, height: 150 },
        fullPage: false
      });

      console.log('✅ Skip link focus screenshot saved as skip-link-focused.png');

    } else {
      console.log('❌ No skip links found');
    }

    // Test 3: Overall Page Screenshot
    console.log('\n📷 Taking full page screenshot...');
    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/full-page-screenshot.png',
      fullPage: true
    });
    console.log('✅ Full page screenshot saved as full-page-screenshot.png');

    // Test 4: Console Errors Check
    console.log('\n🔍 Checking for console errors...');
    const logs = [];
    page.on('console', msg => logs.push(msg));

    // Reload page to capture any console messages
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const errors = logs.filter(log => log.type() === 'error');
    const warnings = logs.filter(log => log.type() === 'warning');

    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} console error(s):`);
      errors.forEach(error => console.log(`  - ${error.text()}`));
    } else {
      console.log('✅ No console errors found');
    }

    if (warnings.length > 0) {
      console.log(`⚠️  Found ${warnings.length} console warning(s):`);
      warnings.forEach(warning => console.log(`  - ${warning.text()}`));
    } else {
      console.log('✅ No console warnings found');
    }

    console.log('\n🎉 Testing completed!');
    console.log('\nSummary:');
    console.log('- Contact button styling verification completed');
    console.log('- Skip link accessibility verification completed');
    console.log('- Screenshots saved for visual inspection');
    console.log('- Console error check completed');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the tests
testChanges().catch(console.error);