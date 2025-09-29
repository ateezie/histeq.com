const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to WordPress site...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Set viewport to match Figma design size
    await page.setViewportSize({ width: 1440, height: 900 });

    // Take screenshot of current bottom CTA section
    const ctaSection = page.locator('text=Join our preservation mission').locator('..').locator('..');
    if (await ctaSection.count() > 0) {
      await ctaSection.screenshot({ path: 'current-cta-section.png' });
      console.log('CTA section screenshot saved');
    }

    // Take screenshot of current footer
    const footer = page.locator('footer');
    if (await footer.count() > 0) {
      await footer.screenshot({ path: 'current-footer-section.png' });
      console.log('Footer section screenshot saved');
    }

    // Take full page screenshot focusing on bottom sections
    await page.evaluate(() => {
      const ctaElement = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent?.includes('Join our preservation mission')
      );
      if (ctaElement) {
        ctaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'current-bottom-sections.png', fullPage: false });
    console.log('Bottom sections screenshot saved');

    // Analyze current CTA structure
    console.log('\n=== CURRENT CTA ANALYSIS ===');
    const ctaContent = await page.textContent('text=Join our preservation mission >> ..');
    console.log('CTA Content found:', !!ctaContent);

    const ctaButtons = await page.locator('text="Join our preservation mission" >> .. >> a').count() +
                       await page.locator('text="Join our preservation mission" >> .. >> button').count();
    console.log('CTA Buttons count:', ctaButtons);

    // Analyze current footer structure
    console.log('\n=== CURRENT FOOTER ANALYSIS ===');
    const footerLinks = await page.locator('footer a').count();
    console.log('Footer links count:', footerLinks);

    const footerSections = await page.locator('footer > * > *').count();
    console.log('Footer sections count:', footerSections);

    // Check footer content
    const footerText = await page.textContent('footer');
    const hasLogo = footerText?.includes('Historic Equity');
    const hasNavigation = footerText?.includes('Home') && footerText?.includes('Contact');
    const hasSocial = footerText?.includes('LinkedIn') || await page.locator('footer svg').count() > 0;

    console.log('Footer has logo:', hasLogo);
    console.log('Footer has navigation:', hasNavigation);
    console.log('Footer has social:', hasSocial);

    console.log('\n=== COMPARISON WITH FIGMA ===');
    console.log('From Figma design analysis:');
    console.log('- CTA: Should have image on left, content on right, two buttons');
    console.log('- Footer: Should have logo left, nav center, social right, minimal layout');
    console.log('- Colors: CTA with orange background, footer with dark navy');

  } catch (error) {
    console.error('Error:', error);
  }

  await browser.close();
})();