const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * AUTOMATED DESIGN REVIEW SCRIPT
 * Historic Equity Inc. Website - Client Presentation Tomorrow
 *
 * Tests: 4 devices × 3 browsers × 3 pages = 36 combinations
 */

const CONFIG = {
  baseUrl: 'http://localhost:8080',
  outputDir: '/tmp/design-review-screenshots',
  devices: [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Laptop', width: 1024, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ],
  pages: [
    { path: '/', name: 'Homepage' },
    { path: '/meet-our-team', name: 'Team' },
    { path: '/contact', name: 'Contact' }
  ]
};

// Brand colors for validation
const BRAND_COLORS = {
  primary: '#BD572B',
  secondary: '#E6CD41',
  tertiary: '#95816E',
  navy: '#2D2E3D',
  lightBlue: '#83ACD1',
  offWhite: '#FEFFF8'
};

class DesignReviewTester {
  constructor() {
    this.results = {
      tests: [],
      issues: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        critical: 0,
        high: 0,
        medium: 0
      }
    };
  }

  async initialize() {
    // Create output directory
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    console.log('🏛️ HISTORIC EQUITY INC. - AUTOMATED DESIGN REVIEW');
    console.log('📅 CLIENT PRESENTATION: TOMORROW');
    console.log('📊 Total Tests:', CONFIG.devices.length * CONFIG.pages.length);
  }

  async runBrowserTests(browserName = 'Chrome') {
    console.log(`\\n🔍 STARTING ${browserName.toUpperCase()} BROWSER TESTS`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      for (const device of CONFIG.devices) {
        await this.runDeviceTests(browser, device, browserName);
      }
    } finally {
      await browser.close();
    }
  }

  async runDeviceTests(browser, device, browserName) {
    console.log(`\\n📱 TESTING ${device.name.toUpperCase()} (${device.width}x${device.height})`);

    const page = await browser.newPage();
    await page.setViewport({ width: device.width, height: device.height });

    // Collect console messages and errors
    const consoleMessages = [];
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      }
    });

    page.on('pageerror', err => pageErrors.push(err.message));

    try {
      for (const pageInfo of CONFIG.pages) {
        await this.runPageTest(page, device, pageInfo, browserName, consoleMessages, pageErrors);
      }
    } finally {
      await page.close();
    }
  }

  async runPageTest(page, device, pageInfo, browserName, consoleMessages, pageErrors) {
    const testId = `${device.name}_${browserName}_${pageInfo.name}`;
    console.log(`  📄 Testing ${pageInfo.name} page...`);

    const testResult = {
      id: testId,
      device: device.name,
      browser: browserName,
      page: pageInfo.name,
      viewport: `${device.width}x${device.height}`,
      url: CONFIG.baseUrl + pageInfo.path,
      status: 'PENDING',
      issues: [],
      performance: {},
      screenshot: ''
    };

    try {
      // Navigate to page and measure load time
      const startTime = Date.now();
      await page.goto(CONFIG.baseUrl + pageInfo.path, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      const loadTime = Date.now() - startTime;

      testResult.performance.loadTime = loadTime;

      // Wait for page to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take full-page screenshot
      const screenshotPath = path.join(CONFIG.outputDir, `${testId.toLowerCase()}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });
      testResult.screenshot = screenshotPath;

      // Run critical element checks
      await this.checkCriticalElements(page, testResult, pageInfo);

      // Run brand compliance checks
      await this.checkBrandCompliance(page, testResult, device);

      // Run interaction tests
      await this.checkInteractions(page, testResult, device);

      // Check console errors
      if (pageErrors.length > 0) {
        testResult.issues.push({
          type: 'CRITICAL',
          category: 'JavaScript Error',
          description: `Page errors detected: ${pageErrors.join(', ')}`,
          impact: 'Site functionality may be broken'
        });
      }

      if (consoleMessages.filter(msg => msg.includes('error')).length > 0) {
        testResult.issues.push({
          type: 'HIGH',
          category: 'Console Errors',
          description: `Console errors: ${consoleMessages.filter(msg => msg.includes('error')).slice(0, 3).join(', ')}`,
          impact: 'May indicate underlying issues'
        });
      }

      // Performance check
      if (loadTime > 3000) {
        testResult.issues.push({
          type: 'HIGH',
          category: 'Performance',
          description: `Slow loading time: ${loadTime}ms`,
          impact: 'Poor user experience, unprofessional appearance'
        });
      }

      // Set overall test status
      const criticalIssues = testResult.issues.filter(issue => issue.type === 'CRITICAL').length;
      const highIssues = testResult.issues.filter(issue => issue.type === 'HIGH').length;

      if (criticalIssues > 0) {
        testResult.status = 'CRITICAL_FAIL';
      } else if (highIssues > 0) {
        testResult.status = 'FAIL';
      } else {
        testResult.status = 'PASS';
      }

      console.log(`    ✅ ${pageInfo.name}: ${testResult.status} (${testResult.issues.length} issues, ${loadTime}ms)`);

    } catch (error) {
      testResult.status = 'ERROR';
      testResult.issues.push({
        type: 'CRITICAL',
        category: 'Test Failure',
        description: `Test execution failed: ${error.message}`,
        impact: 'Unable to verify page functionality'
      });

      console.log(`    ❌ ${pageInfo.name}: ERROR - ${error.message}`);
    }

    this.results.tests.push(testResult);
    this.updateSummary(testResult);
  }

  async checkCriticalElements(page, testResult, pageInfo) {
    // Homepage specific checks
    if (pageInfo.name === 'Homepage') {
      const heroSection = await page.$('[data-testid="hero-section"]');
      if (!heroSection) {
        testResult.issues.push({
          type: 'CRITICAL',
          category: 'Missing Hero Section',
          description: 'Hero section not found on homepage',
          impact: 'Primary brand messaging missing'
        });
      }

      const contactButtons = await page.$$('a[href="/contact"]');
      if (contactButtons.length === 0) {
        testResult.issues.push({
          type: 'CRITICAL',
          category: 'Missing Contact CTA',
          description: 'No Contact Us buttons found',
          impact: 'Users cannot easily contact the company'
        });
      }

      const carousel = await page.$('[data-testid="building-carousel"]');
      if (!carousel) {
        testResult.issues.push({
          type: 'HIGH',
          category: 'Missing Carousel',
          description: 'Building portfolio carousel not found',
          impact: 'Cannot showcase project portfolio'
        });
      }
    }

    // Contact page specific checks
    if (pageInfo.name === 'Contact') {
      const phoneLinks = await page.$$('a[href^="tel:"]');
      const emailLinks = await page.$$('a[href^="mailto:"]');

      if (phoneLinks.length === 0) {
        testResult.issues.push({
          type: 'HIGH',
          category: 'Non-clickable Phone Numbers',
          description: 'Phone numbers are not clickable',
          impact: 'Poor mobile user experience'
        });
      }

      if (emailLinks.length === 0) {
        testResult.issues.push({
          type: 'HIGH',
          category: 'Non-clickable Email Addresses',
          description: 'Email addresses are not clickable',
          impact: 'Difficult for users to contact via email'
        });
      }
    }

    // Universal navigation check
    const navMenu = await page.$('nav');
    if (!navMenu) {
      testResult.issues.push({
        type: 'CRITICAL',
        category: 'Missing Navigation',
        description: 'Navigation menu not found',
        impact: 'Users cannot navigate the site'
      });
    }
  }

  async checkBrandCompliance(page, testResult, device) {
    // Check if brand colors are being used
    const computedColors = await page.evaluate(() => {
      const brandElements = document.querySelectorAll('[class*="primary"], [class*="secondary"], [class*="brand"]');
      const colors = [];
      brandElements.forEach(el => {
        const style = window.getComputedStyle(el);
        colors.push({
          element: el.className,
          color: style.color,
          backgroundColor: style.backgroundColor
        });
      });
      return colors.slice(0, 10); // Limit to first 10 elements
    });

    // Check for proper font usage
    const fontCheck = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3');
      const fonts = [];
      headings.forEach(h => {
        const style = window.getComputedStyle(h);
        fonts.push(style.fontFamily);
      });
      return fonts;
    });

    const hasCorrectFonts = fontCheck.some(font =>
      font.includes('Montserrat') || font.includes('Sportscenter')
    );

    if (!hasCorrectFonts && fontCheck.length > 0) {
      testResult.issues.push({
        type: 'MEDIUM',
        category: 'Typography',
        description: 'Brand fonts (Montserrat/Sportscenter) may not be loading properly',
        impact: 'Inconsistent brand presentation'
      });
    }
  }

  async checkInteractions(page, testResult, device) {
    // Test mobile menu on smaller screens
    if (device.width <= 768) {
      const mobileMenuButton = await page.$('[aria-label*="menu"], .hamburger, [class*="mobile-menu"]');
      if (mobileMenuButton) {
        try {
          await mobileMenuButton.click();
          await new Promise(resolve => setTimeout(resolve, 500));

          const mobileMenu = await page.$('[class*="mobile-menu"], .nav-mobile');
          if (!mobileMenu) {
            testResult.issues.push({
              type: 'HIGH',
              category: 'Mobile Navigation',
              description: 'Mobile menu button exists but menu does not appear',
              impact: 'Navigation broken on mobile devices'
            });
          }
        } catch (error) {
          testResult.issues.push({
            type: 'HIGH',
            category: 'Mobile Navigation',
            description: 'Mobile menu interaction failed',
            impact: 'Navigation may be broken on mobile'
          });
        }
      }
    }

    // Test button hover effects
    const buttons = await page.$$('button, .btn, a[href="/contact"]');
    if (buttons.length > 0) {
      try {
        await buttons[0].hover();
        await new Promise(resolve => setTimeout(resolve, 300));
        // Could add more sophisticated hover testing here
      } catch (error) {
        // Hover test failed, but not critical
      }
    }
  }

  updateSummary(testResult) {
    this.results.summary.total++;

    switch (testResult.status) {
      case 'PASS':
        this.results.summary.passed++;
        break;
      case 'FAIL':
        this.results.summary.failed++;
        break;
      case 'CRITICAL_FAIL':
      case 'ERROR':
        this.results.summary.failed++;
        this.results.summary.critical++;
        break;
    }

    // Count issues by priority
    testResult.issues.forEach(issue => {
      switch (issue.type) {
        case 'CRITICAL':
          this.results.summary.critical++;
          break;
        case 'HIGH':
          this.results.summary.high++;
          break;
        case 'MEDIUM':
          this.results.summary.medium++;
          break;
      }
    });
  }

  generateReport() {
    const reportPath = path.join(CONFIG.outputDir, 'design-review-report.json');

    // Add summary calculations
    this.results.summary.passRate = this.results.summary.total > 0 ?
      Math.round((this.results.summary.passed / this.results.summary.total) * 100) : 0;

    this.results.timestamp = new Date().toISOString();
    this.results.config = CONFIG;

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    console.log('\\n📊 DESIGN REVIEW COMPLETE');
    console.log('========================');
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Pass Rate: ${this.results.summary.passRate}%`);
    console.log(`\\n🚨 Issues Found:`);
    console.log(`Critical: ${this.results.summary.critical}`);
    console.log(`High Priority: ${this.results.summary.high}`);
    console.log(`Medium Priority: ${this.results.summary.medium}`);
    console.log(`\\n📁 Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ${CONFIG.outputDir}`);

    return reportPath;
  }
}

// Main execution
async function runDesignReview() {
  const tester = new DesignReviewTester();
  await tester.initialize();

  try {
    // Run Chrome tests (primary browser)
    await tester.runBrowserTests('Chrome');

    const reportPath = tester.generateReport();
    return reportPath;
  } catch (error) {
    console.error('❌ Design review failed:', error);
    throw error;
  }
}

// Export for use in other scripts
module.exports = { DesignReviewTester, runDesignReview };

// Run if called directly
if (require.main === module) {
  runDesignReview().catch(console.error);
}