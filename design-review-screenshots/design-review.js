#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runDesignReview() {
  console.log('🎨 Starting Comprehensive Design Review for Historic Equity Inc. Homepage');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();

  // Set up console monitoring
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Set up error monitoring
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    console.log('📱 Phase 1: Desktop Navigation & Screenshot (1440px)');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take full page screenshot
    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/screenshots/homepage-desktop-1440.png',
      fullPage: true
    });
    console.log('✅ Desktop screenshot captured');

    console.log('📱 Phase 2: Tablet Viewport Testing (768px)');
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/screenshots/homepage-tablet-768.png',
      fullPage: true
    });
    console.log('✅ Tablet screenshot captured');

    console.log('📱 Phase 3: Mobile Viewport Testing (375px)');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({
      path: '/Users/alexthip/Projects/histeq.com/screenshots/homepage-mobile-375.png',
      fullPage: true
    });
    console.log('✅ Mobile screenshot captured');

    console.log('🔍 Phase 4: Interactive Element Testing');
    // Reset to desktop for interaction testing
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test navigation menu
    const navElements = await page.$$eval('nav a, .menu a, header a', elements =>
      elements.map(el => ({
        text: el.textContent.trim(),
        href: el.href,
        visible: el.offsetWidth > 0 && el.offsetHeight > 0
      }))
    );
    console.log('📋 Navigation elements found:', navElements.length);

    // Test buttons and interactive elements
    const buttons = await page.$$eval('button, .btn, [role="button"]', elements =>
      elements.map(el => ({
        text: el.textContent.trim(),
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        disabled: el.disabled
      }))
    );
    console.log('🔘 Interactive buttons found:', buttons.length);

    // Test forms
    const forms = await page.$$eval('form', elements =>
      elements.map(el => ({
        action: el.action,
        method: el.method,
        inputs: Array.from(el.querySelectorAll('input')).length
      }))
    );
    console.log('📝 Forms found:', forms.length);

    console.log('🎨 Phase 5: Color and Typography Analysis');
    // Get computed styles for key elements
    const styles = await page.evaluate(() => {
      const getStyles = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const computed = window.getComputedStyle(element);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight
        };
      };

      return {
        body: getStyles('body'),
        h1: getStyles('h1'),
        h2: getStyles('h2'),
        h3: getStyles('h3'),
        primaryButton: getStyles('.btn-primary, .button-primary, button[type="submit"]'),
        navigation: getStyles('nav, .navigation, header nav')
      };
    });
    console.log('🎨 Typography and color analysis complete');

    console.log('♿ Phase 6: Accessibility Testing');
    // Check for ARIA labels and accessibility features
    const accessibilityCheck = await page.evaluate(() => {
      const checkA11y = () => {
        const results = {
          imagesWithoutAlt: 0,
          linksWithoutText: 0,
          buttonsWithoutText: 0,
          formFieldsWithoutLabels: 0,
          headingHierarchy: [],
          focusableElements: 0
        };

        // Check images without alt text
        document.querySelectorAll('img').forEach(img => {
          if (!img.alt && !img.getAttribute('aria-label')) {
            results.imagesWithoutAlt++;
          }
        });

        // Check links without text
        document.querySelectorAll('a').forEach(link => {
          if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
            results.linksWithoutText++;
          }
        });

        // Check buttons without text
        document.querySelectorAll('button').forEach(button => {
          if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
            results.buttonsWithoutText++;
          }
        });

        // Check form fields without labels
        document.querySelectorAll('input, textarea, select').forEach(field => {
          const hasLabel = field.id && document.querySelector(`label[for="${field.id}"]`);
          const hasAriaLabel = field.getAttribute('aria-label') || field.getAttribute('aria-labelledby');
          if (!hasLabel && !hasAriaLabel) {
            results.formFieldsWithoutLabels++;
          }
        });

        // Check heading hierarchy
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
          results.headingHierarchy.push({
            tag: heading.tagName.toLowerCase(),
            text: heading.textContent.trim().substring(0, 50)
          });
        });

        // Count focusable elements
        results.focusableElements = document.querySelectorAll(
          'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        ).length;

        return results;
      };

      return checkA11y();
    });
    console.log('♿ Accessibility analysis complete');

    console.log('⚡ Phase 7: Performance Metrics');
    const performanceMetrics = await page.evaluate(() => {
      return {
        timing: performance.timing,
        navigation: performance.navigation,
        memory: performance.memory
      };
    });

    // Compile comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      url: 'http://localhost:8080',
      viewports: {
        desktop: { width: 1440, height: 900 },
        tablet: { width: 768, height: 1024 },
        mobile: { width: 375, height: 667 }
      },
      navigation: navElements,
      buttons: buttons,
      forms: forms,
      styles: styles,
      accessibility: accessibilityCheck,
      console: consoleMessages,
      errors: pageErrors,
      performance: performanceMetrics
    };

    // Save report
    fs.writeFileSync(
      '/Users/alexthip/Projects/histeq.com/screenshots/design-review-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('📊 Comprehensive design review complete!');
    console.log('📁 Screenshots saved to: /Users/alexthip/Projects/histeq.com/screenshots/');
    console.log('📄 Report saved to: design-review-report.json');

    // Summary findings
    console.log('\n🔍 QUICK FINDINGS SUMMARY:');
    console.log(`- Navigation elements: ${navElements.length}`);
    console.log(`- Interactive buttons: ${buttons.length}`);
    console.log(`- Forms detected: ${forms.length}`);
    console.log(`- Console messages: ${consoleMessages.length}`);
    console.log(`- Page errors: ${pageErrors.length}`);
    console.log(`- Images without alt text: ${accessibilityCheck.imagesWithoutAlt}`);
    console.log(`- Focusable elements: ${accessibilityCheck.focusableElements}`);

  } catch (error) {
    console.error('❌ Error during design review:', error);
  } finally {
    await browser.close();
  }
}

// Create screenshots directory if it doesn't exist
const screenshotsDir = '/Users/alexthip/Projects/histeq.com/screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

runDesignReview().catch(console.error);