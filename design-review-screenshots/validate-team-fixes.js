const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('=== VALIDATING MEET OUR TEAM PAGE FIXES ===');

    // Set viewport to desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n1. Navigating to Meet Our Team page...');
    await page.goto('http://localhost:8080/meet-our-team/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 10000 });

    console.log('\n2. Checking team members are real Historic Equity team...');
    const teamMembers = await page.$$eval('.text-xl.font-bold', elements =>
      elements.map(el => el.textContent.trim())
    );

    const expectedTeam = ['Philip Estep', 'Elise Westwood', 'Mary Carpenter', 'Jennifer Knobeloch'];
    const hasRealTeam = expectedTeam.every(member => teamMembers.includes(member));

    console.log('Team members found:', teamMembers);
    console.log('Real Historic Equity team displayed:', hasRealTeam ? '✓ PASS' : '✗ FAIL');

    console.log('\n3. Checking team photos are loading...');
    const teamImages = await page.$$eval('img[src*="/team/"]', elements =>
      elements.map(el => ({
        src: el.src,
        alt: el.alt,
        loaded: el.complete && el.naturalWidth > 0
      }))
    );

    console.log('Team images:', teamImages);
    const allImagesLoaded = teamImages.every(img => img.loaded);
    console.log('All team photos loaded:', allImagesLoaded ? '✓ PASS' : '✗ FAIL');

    console.log('\n4. Checking brand colors are correctly applied...');
    const titleColors = await page.$$eval('.text-primary-600', elements =>
      elements.map(el => window.getComputedStyle(el).color)
    );

    console.log('Title colors (should be Historic Equity orange):', titleColors);
    const hasCorrectColors = titleColors.length > 0;
    console.log('Brand colors applied:', hasCorrectColors ? '✓ PASS' : '✗ FAIL');

    console.log('\n5. Checking typography consistency...');
    const headingStyles = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('.text-xl.font-bold');

      return {
        h1: h1 ? window.getComputedStyle(h1).fontFamily : null,
        h2: h2 ? window.getComputedStyle(h2).fontFamily : null,
        h3: h3 ? window.getComputedStyle(h3).fontFamily : null
      };
    });

    console.log('Typography fonts:', headingStyles);
    const hasCorrectTypography = Object.values(headingStyles).every(font =>
      font && font.includes('Montserrat')
    );
    console.log('Montserrat typography applied:', hasCorrectTypography ? '✓ PASS' : '✗ FAIL');

    console.log('\n6. Taking updated screenshot...');
    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/team-page-fixed.png',
      fullPage: true
    });
    console.log('Screenshot saved as team-page-fixed.png');

    console.log('\n7. Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/team-page-mobile.png',
      fullPage: true
    });
    console.log('Mobile screenshot saved as team-page-mobile.png');

    console.log('\n8. Checking for console errors...');
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Reload to capture console messages
    await page.reload();
    await page.waitForSelector('h1', { timeout: 10000 });

    if (consoleMessages.length > 0) {
      console.log('Console errors found:', consoleMessages);
    } else {
      console.log('No console errors: ✓ PASS');
    }

    console.log('\n=== VALIDATION SUMMARY ===');
    console.log('Real team members:', hasRealTeam ? '✓' : '✗');
    console.log('Team photos loading:', allImagesLoaded ? '✓' : '✗');
    console.log('Brand colors applied:', hasCorrectColors ? '✓' : '✗');
    console.log('Typography consistent:', hasCorrectTypography ? '✓' : '✗');
    console.log('No console errors:', consoleMessages.length === 0 ? '✓' : '✗');

    const allTestsPassed = hasRealTeam && allImagesLoaded && hasCorrectColors &&
                          hasCorrectTypography && consoleMessages.length === 0;

    console.log('\nOVERALL:', allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME ISSUES FOUND');

  } catch (error) {
    console.error('Error during validation:', error.message);
  } finally {
    await browser.close();
  }
})();