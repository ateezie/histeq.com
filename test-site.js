const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'current-site-state.png', fullPage: true });
    console.log('Screenshot saved as current-site-state.png');

    // Check contact button styling (desktop version)
    const contactButton = page.locator('header .hidden.lg\\:block a[href="/contact"]');
    const contactButtonClasses = await contactButton.getAttribute('class');
    console.log('Desktop contact button classes:', contactButtonClasses);

    // Check if skip links are visible
    const skipLinks = page.locator('.skip-links a');
    const skipLinksCount = await skipLinks.count();
    console.log('Skip links found:', skipLinksCount);

    for (let i = 0; i < skipLinksCount; i++) {
      const link = skipLinks.nth(i);
      const text = await link.textContent();
      const isVisible = await link.isVisible();

      // Check computed styles to see if they're actually hidden
      const computedStyle = await link.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          left: style.left,
          width: style.width,
          height: style.height,
          overflow: style.overflow,
          position: style.position
        };
      });

      console.log(`Skip link ${i + 1}: "${text.trim()}" - Playwright Visible: ${isVisible}`);
      console.log(`  Computed styles:`, computedStyle);
    }

    // Check computed styles of contact button
    const contactButtonStyle = await contactButton.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        display: style.display,
        padding: style.padding,
        borderRadius: style.borderRadius
      };
    });
    console.log('Contact button computed styles:', contactButtonStyle);

    // Also check if TailwindCSS is loaded by looking for specific classes
    const tailwindCheck = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.className = 'bg-primary-600';
      document.body.appendChild(testDiv);
      const style = window.getComputedStyle(testDiv);
      const bgColor = style.backgroundColor;
      document.body.removeChild(testDiv);
      return bgColor;
    });
    console.log('TailwindCSS primary-600 color test:', tailwindCheck);

  } catch (error) {
    console.error('Error:', error);
  }

  await browser.close();
})();