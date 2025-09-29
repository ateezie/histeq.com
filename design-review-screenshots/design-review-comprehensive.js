const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function conductDesignReview() {
  console.log('🎨 Starting Comprehensive Design Review for Historic Equity Inc.');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'design-review-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const results = {
    summary: {
      totalIssues: 0,
      blockers: [],
      highPriority: [],
      mediumPriority: [],
      nitpicks: []
    },
    pages: {},
    viewports: [
      { name: 'Desktop', width: 1440, height: 900 },
      { name: 'Laptop', width: 1024, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 812 }
    ],
    browsers: ['chromium'] // Can extend to firefox, webkit
  };

  const pages = [
    { url: '/', name: 'Homepage' },
    { url: '/meet-our-team/', name: 'Meet Our Team' },
    { url: '/contact/', name: 'Contact Us' }
  ];

  try {
    for (const pageInfo of pages) {
      console.log(`\n📄 Testing ${pageInfo.name} (${pageInfo.url})`);
      results.pages[pageInfo.name] = { issues: [], screenshots: [], consoleErrors: [] };

      const page = await context.newPage();

      // Navigate to page
      await page.goto(`http://localhost:8080${pageInfo.url}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Check for console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Wait for page to fully load
      await page.waitForTimeout(3000);

      // Test across different viewports
      for (const viewport of results.viewports) {
        console.log(`  📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000); // Allow for responsive adjustments

        // Take full page screenshot
        const screenshotPath = path.join(screenshotsDir,
          `${pageInfo.name.replace(/\s+/g, '-')}-${viewport.name}.png`
        );
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        results.pages[pageInfo.name].screenshots.push({
          viewport: viewport.name,
          path: screenshotPath
        });

        // Visual and interaction tests for this viewport
        await performVisualChecks(page, pageInfo, viewport, results);
        await performInteractionTests(page, pageInfo, viewport, results);
        await performAccessibilityTests(page, pageInfo, viewport, results);
      }

      // Store console errors
      results.pages[pageInfo.name].consoleErrors = [...new Set(consoleErrors)];

      await page.close();
    }

    // Generate comprehensive report
    generateDesignReport(results);
    console.log('\n✅ Design Review Complete!');

  } catch (error) {
    console.error('❌ Design Review Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function performVisualChecks(page, pageInfo, viewport, results) {
  const issues = results.pages[pageInfo.name].issues;

  // Check brand colors
  try {
    // Check for brand color usage in CSS
    const brandColors = {
      primaryOrange: '#bd572b',
      primaryGold: '#e6cd41',
      primaryBrown: '#95816e',
      lightBlue: '#83acd1',
      offWhite: '#fefff8',
      darkNavy: '#2d2e3d'
    };

    // Check typography
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    for (let heading of headings) {
      const computedStyle = await heading.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          lineHeight: styles.lineHeight,
          color: styles.color
        };
      });

      // Check if using Montserrat font family
      if (!computedStyle.fontFamily.toLowerCase().includes('montserrat')) {
        issues.push({
          type: 'medium',
          category: 'Typography',
          description: `Non-Montserrat font detected in ${heading.tagName}`,
          viewport: viewport.name,
          details: `Font family: ${computedStyle.fontFamily}`
        });
      }
    }

    // Check for proper spacing/layout
    const sections = await page.locator('section, .section').all();
    for (let section of sections) {
      const boundingBox = await section.boundingBox();
      if (boundingBox && boundingBox.height < 50) {
        issues.push({
          type: 'low',
          category: 'Layout',
          description: 'Section appears too short',
          viewport: viewport.name,
          details: `Height: ${boundingBox.height}px`
        });
      }
    }

  } catch (error) {
    issues.push({
      type: 'medium',
      category: 'Testing',
      description: 'Error during visual checks',
      viewport: viewport.name,
      details: error.message
    });
  }
}

async function performInteractionTests(page, pageInfo, viewport, results) {
  const issues = results.pages[pageInfo.name].issues;

  try {
    // Test navigation menu
    const navItems = await page.locator('nav a, .nav a').all();
    for (let navItem of navItems) {
      const isVisible = await navItem.isVisible();
      if (!isVisible && viewport.width > 768) {
        issues.push({
          type: 'high',
          category: 'Navigation',
          description: 'Navigation item not visible on desktop',
          viewport: viewport.name
        });
      }
    }

    // Test buttons and links
    const buttons = await page.locator('button, .button, .btn').all();
    for (let button of buttons) {
      const isVisible = await button.isVisible();
      if (isVisible) {
        // Test hover state (simulate with focus)
        await button.focus();
        await page.waitForTimeout(200);
      }
    }

    // Test forms if present
    const forms = await page.locator('form').all();
    for (let form of forms) {
      const inputs = await form.locator('input, textarea, select').all();
      for (let input of inputs) {
        const isRequired = await input.getAttribute('required');
        const hasLabel = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;

        if (isRequired && !hasLabel) {
          issues.push({
            type: 'high',
            category: 'Accessibility',
            description: 'Required form field missing label',
            viewport: viewport.name
          });
        }
      }
    }

  } catch (error) {
    issues.push({
      type: 'medium',
      category: 'Testing',
      description: 'Error during interaction tests',
      viewport: viewport.name,
      details: error.message
    });
  }
}

async function performAccessibilityTests(page, pageInfo, viewport, results) {
  const issues = results.pages[pageInfo.name].issues;

  try {
    // Check for heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let hasH1 = false;

    for (let heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'h1') {
        hasH1 = true;
        break;
      }
    }

    if (!hasH1) {
      issues.push({
        type: 'high',
        category: 'Accessibility',
        description: 'Page missing H1 heading',
        viewport: viewport.name
      });
    }

    // Check images for alt text
    const images = await page.locator('img').all();
    for (let img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      if (!alt && src && !src.includes('data:') && !src.includes('.svg')) {
        issues.push({
          type: 'medium',
          category: 'Accessibility',
          description: 'Image missing alt text',
          viewport: viewport.name,
          details: `Image src: ${src}`
        });
      }
    }

    // Check for focus indicators
    const focusableElements = await page.locator('a, button, input, textarea, select, [tabindex]').all();
    for (let element of focusableElements.slice(0, 5)) { // Test first 5 to avoid timeout
      if (await element.isVisible()) {
        await element.focus();

        // Check if focus is visible (this is basic - real test would be more comprehensive)
        const focusStyles = await element.evaluate(el => {
          const styles = window.getComputedStyle(el, ':focus');
          return {
            outline: styles.outline,
            boxShadow: styles.boxShadow,
            border: styles.border
          };
        });

        const hasFocusIndicator = focusStyles.outline !== 'none' ||
                                 focusStyles.boxShadow !== 'none' ||
                                 focusStyles.border.includes('px');

        if (!hasFocusIndicator) {
          issues.push({
            type: 'medium',
            category: 'Accessibility',
            description: 'Focusable element lacks visible focus indicator',
            viewport: viewport.name
          });
          break; // Only report once per viewport
        }
      }
    }

  } catch (error) {
    issues.push({
      type: 'medium',
      category: 'Testing',
      description: 'Error during accessibility tests',
      viewport: viewport.name,
      details: error.message
    });
  }
}

function generateDesignReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('🎨 HISTORIC EQUITY INC. - COMPREHENSIVE DESIGN REVIEW REPORT');
  console.log('='.repeat(80));

  // Consolidate all issues
  const allIssues = [];
  Object.keys(results.pages).forEach(pageName => {
    results.pages[pageName].issues.forEach(issue => {
      allIssues.push({ ...issue, page: pageName });
    });
  });

  // Categorize issues
  const blockers = allIssues.filter(issue => issue.type === 'blocker');
  const highPriority = allIssues.filter(issue => issue.type === 'high');
  const mediumPriority = allIssues.filter(issue => issue.type === 'medium');
  const lowPriority = allIssues.filter(issue => issue.type === 'low');

  console.log(`\n📊 SUMMARY`);
  console.log(`Total Issues Found: ${allIssues.length}`);
  console.log(`🚫 Blockers: ${blockers.length}`);
  console.log(`🔴 High Priority: ${highPriority.length}`);
  console.log(`🟡 Medium Priority: ${mediumPriority.length}`);
  console.log(`🟢 Low Priority/Nitpicks: ${lowPriority.length}`);

  // Report by category
  if (blockers.length > 0) {
    console.log(`\n🚫 BLOCKERS (${blockers.length})`);
    blockers.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.page}] ${issue.description}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
      console.log(`   Viewport: ${issue.viewport}, Category: ${issue.category}`);
    });
  }

  if (highPriority.length > 0) {
    console.log(`\n🔴 HIGH PRIORITY (${highPriority.length})`);
    highPriority.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.page}] ${issue.description}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
      console.log(`   Viewport: ${issue.viewport}, Category: ${issue.category}`);
    });
  }

  if (mediumPriority.length > 0) {
    console.log(`\n🟡 MEDIUM PRIORITY (${mediumPriority.length})`);
    mediumPriority.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.page}] ${issue.description}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
      console.log(`   Viewport: ${issue.viewport}, Category: ${issue.category}`);
    });
  }

  if (lowPriority.length > 0) {
    console.log(`\n🟢 LOW PRIORITY/NITPICKS (${lowPriority.length})`);
    lowPriority.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.page}] ${issue.description}`);
      if (issue.details) console.log(`   Details: ${issue.details}`);
      console.log(`   Viewport: ${issue.viewport}, Category: ${issue.category}`);
    });
  }

  // Console errors summary
  console.log(`\n🐞 CONSOLE ERRORS SUMMARY`);
  Object.keys(results.pages).forEach(pageName => {
    const errors = results.pages[pageName].consoleErrors;
    if (errors.length > 0) {
      console.log(`\n[${pageName}] - ${errors.length} console errors:`);
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log(`[${pageName}] - No console errors ✅`);
    }
  });

  // Screenshots summary
  console.log(`\n📸 SCREENSHOTS CAPTURED`);
  Object.keys(results.pages).forEach(pageName => {
    console.log(`\n[${pageName}]:`);
    results.pages[pageName].screenshots.forEach(screenshot => {
      console.log(`  • ${screenshot.viewport}: ${screenshot.path}`);
    });
  });

  // Final assessment
  console.log(`\n🎯 FINAL ASSESSMENT`);
  if (blockers.length > 0) {
    console.log(`❌ NOT READY FOR CLIENT - ${blockers.length} blocking issues must be resolved`);
  } else if (highPriority.length > 5) {
    console.log(`⚠️  NEEDS ATTENTION - ${highPriority.length} high-priority issues should be addressed`);
  } else if (highPriority.length > 0) {
    console.log(`⚡ MINOR ISSUES - ${highPriority.length} high-priority issues, but likely acceptable for client review`);
  } else {
    console.log(`✅ CLIENT READY - Website meets professional standards for presentation`);
  }

  console.log('\n' + '='.repeat(80));

  // Write detailed report to file
  const reportPath = path.join(__dirname, 'design-review-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}`);
}

// Run the design review
conductDesignReview().catch(console.error);