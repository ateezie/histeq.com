const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Set viewport to desktop
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('Navigating to Meet Our Team page...');
    await page.goto('http://localhost:8080/meet-our-team/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check what team members are displayed
    const teamMembers = await page.$$eval('.text-xl.font-bold', elements =>
      elements.map(el => el.textContent.trim())
    );

    console.log('Team members found:', teamMembers);

    // Check if images are loading
    const images = await page.$$eval('img[alt*="Historic Equity"]', elements =>
      elements.map(el => ({ src: el.src, alt: el.alt, loaded: el.complete }))
    );

    console.log('Team images:', images);

    // Take full page screenshot
    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/team-page-current.png',
      fullPage: true
    });

    console.log('Screenshot saved as team-page-current.png');

    // Check console for errors
    const messages = [];
    page.on('console', msg => messages.push(`${msg.type()}: ${msg.text()}`));

    // Reload to capture console messages
    await page.reload();
    await page.waitForSelector('h1', { timeout: 10000 });

    if (messages.length > 0) {
      console.log('Console messages:', messages);
    }

  } catch (error) {
    console.error('Error testing team page:', error.message);
  } finally {
    await browser.close();
  }
})();