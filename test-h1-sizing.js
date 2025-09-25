const { chromium } = require('playwright');

async function testH1Sizing() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Set viewport to desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('Measuring H1 element...');

    // Get H1 measurements
    const h1Info = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;

      const rect = h1.getBoundingClientRect();
      const styles = getComputedStyle(h1);

      return {
        text: h1.textContent.trim(),
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        fontWeight: styles.fontWeight,
        height: rect.height,
        width: rect.width,
        top: rect.top,
        bottom: rect.bottom,
        classes: h1.className,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
        percentageOfViewport: ((rect.height / window.innerHeight) * 100).toFixed(1)
      };
    });

    console.log('\n=== DESKTOP (1440x900) H1 MEASUREMENTS ===');
    console.log('Text:', h1Info.text.substring(0, 50) + '...');
    console.log('Font Size:', h1Info.fontSize);
    console.log('Line Height:', h1Info.lineHeight);
    console.log('Font Weight:', h1Info.fontWeight);
    console.log('Element Height:', h1Info.height + 'px');
    console.log('Element Width:', h1Info.width + 'px');
    console.log('Viewport Height:', h1Info.viewportHeight + 'px');
    console.log('H1 Height % of Viewport:', h1Info.percentageOfViewport + '%');
    console.log('Classes:', h1Info.classes);

    // Take desktop screenshot
    await page.screenshot({
      path: 'h1-desktop-after.png',
      fullPage: true
    });
    console.log('Desktop screenshot saved: h1-desktop-after.png');

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Wait for responsive changes

    const h1InfoMobile = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return null;

      const rect = h1.getBoundingClientRect();
      const styles = getComputedStyle(h1);

      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        height: rect.height,
        viewportHeight: window.innerHeight,
        percentageOfViewport: ((rect.height / window.innerHeight) * 100).toFixed(1)
      };
    });

    console.log('\n=== MOBILE (375x667) H1 MEASUREMENTS ===');
    console.log('Font Size:', h1InfoMobile.fontSize);
    console.log('Line Height:', h1InfoMobile.lineHeight);
    console.log('Element Height:', h1InfoMobile.height + 'px');
    console.log('Viewport Height:', h1InfoMobile.viewportHeight + 'px');
    console.log('H1 Height % of Viewport:', h1InfoMobile.percentageOfViewport + '%');

    // Take mobile screenshot
    await page.screenshot({
      path: 'h1-mobile-after.png',
      fullPage: true
    });
    console.log('Mobile screenshot saved: h1-mobile-after.png');

    // Determine success
    const desktopSuccess = parseFloat(h1Info.percentageOfViewport) <= 30;
    const mobileSuccess = parseFloat(h1InfoMobile.percentageOfViewport) <= 30;

    console.log('\n=== RESULTS ===');
    console.log('Desktop H1 Professional? (≤30% viewport):', desktopSuccess ? '✅ YES' : '❌ NO');
    console.log('Mobile H1 Professional? (≤30% viewport):', mobileSuccess ? '✅ YES' : '❌ NO');
    console.log('Overall Grade:', (desktopSuccess && mobileSuccess) ? 'A+' : 'Needs Improvement');

  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testH1Sizing();