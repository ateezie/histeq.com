const { chromium } = require('playwright');

async function captureContactPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Set viewport to desktop size (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to the test HTML file
    console.log('Navigating to Contact Us test page...');
    await page.goto('file://' + __dirname + '/contact-test.html', { waitUntil: 'networkidle' });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
      path: 'current-contact-page-full.png',
      fullPage: true
    });

    // Take viewport screenshot
    await page.screenshot({
      path: 'current-contact-page-viewport.png',
      fullPage: false
    });

    console.log('Screenshots captured successfully');

    // Get page title and basic info
    const title = await page.title();
    const url = page.url();

    console.log(`Page Title: ${title}`);
    console.log(`URL: ${url}`);

    // Check if key elements exist
    const heroSection = await page.$('h1');
    const contactForm = await page.$('form');
    const contactInfo = await page.$('[class*="contact"]');

    console.log('Key elements found:');
    console.log(`- Hero section: ${heroSection ? 'Yes' : 'No'}`);
    console.log(`- Contact form: ${contactForm ? 'Yes' : 'No'}`);
    console.log(`- Contact info: ${contactInfo ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('Error capturing contact page:', error);
  } finally {
    await browser.close();
  }
}

captureContactPage();