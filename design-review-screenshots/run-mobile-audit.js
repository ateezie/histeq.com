/**
 * MOBILE AUDIT RUNNER - Historic Equity Inc.
 * Execute comprehensive mobile UI/UX audit for client presentation
 */

const puppeteer = require('puppeteer');
const { MobileAudit, config } = require('./mobile-audit-comprehensive');

async function runMobileAudit() {
  console.log('🚀 STARTING COMPREHENSIVE MOBILE AUDIT - Historic Equity Inc.');
  console.log('📱 Testing critical mobile issues before client presentation\n');

  const audit = new MobileAudit();
  let browser;

  try {
    // Launch browser with mobile settings
    browser = await puppeteer.launch({
      headless: false, // Keep visible for debugging
      defaultViewport: config.mobileViewport,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--ignore-certificate-errors'
      ]
    });

    const page = await browser.newPage();

    // Set mobile viewport
    await page.setViewport(config.mobileViewport);

    // Set user agent to mobile
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');

    console.log(`📱 Viewport set to: ${config.mobileViewport.width}x${config.mobileViewport.height}`);

    // Test each page
    for (const pageConfig of config.pages) {
      console.log(`\n🔍 AUDITING: ${pageConfig.name} (${pageConfig.priority})`);
      console.log(`📍 URL: ${config.baseUrl}${pageConfig.url}`);

      try {
        // Navigate to page
        await page.goto(`${config.baseUrl}${pageConfig.url}`, {
          waitUntil: 'networkidle2',
          timeout: 10000
        });

        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Take initial screenshot
        const screenshotPath = `./mobile-audit-${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}.png`;
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });
        audit.screenshots.push(screenshotPath);

        console.log(`📸 Screenshot saved: ${screenshotPath}`);

        // Run comprehensive checks
        await audit.checkHorizontalPadding(page, pageConfig.name);
        await audit.checkContentReadability(page, pageConfig.name);
        await audit.checkInteractiveElements(page, pageConfig.name);
        await audit.checkVisualHierarchy(page, pageConfig.name);
        await audit.checkTechnicalIssues(page, pageConfig.name);

        console.log(`✅ Audit completed for ${pageConfig.name}`);

      } catch (error) {
        console.error(`❌ Error auditing ${pageConfig.name}:`, error.message);
        audit.addIssue(
          pageConfig.name,
          'Technical Issues',
          'HIGH',
          `Page loading error: ${error.message}`
        );
      }
    }

    // Test secondary viewport (newer iPhones)
    console.log(`\n📱 TESTING SECONDARY VIEWPORT: ${config.secondaryViewport.width}x${config.secondaryViewport.height}`);
    await page.setViewport(config.secondaryViewport);

    // Quick test of homepage at larger mobile viewport
    try {
      await page.goto(`${config.baseUrl}/`, {
        waitUntil: 'networkidle2',
        timeout: 10000
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      const screenshotPath = './mobile-audit-homepage-larger.png';
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      audit.screenshots.push(screenshotPath);
      console.log(`📸 Larger viewport screenshot: ${screenshotPath}`);

      // Quick padding check for larger viewport
      await audit.checkHorizontalPadding(page, 'Homepage (390px)');

    } catch (error) {
      console.error(`❌ Error testing larger viewport:`, error.message);
    }

  } catch (error) {
    console.error('❌ CRITICAL ERROR during audit:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Generate and save report
  console.log('\n📊 GENERATING FINAL REPORT...');
  const report = audit.generateReport();
  const { reportPath, summaryPath } = audit.saveReport();

  // Display critical findings
  console.log('\n🚨 CRITICAL FINDINGS FOR CLIENT PRESENTATION:');
  console.log('='.repeat(60));

  const critical = audit.issues.filter(i => i.severity === 'CRITICAL');
  const high = audit.issues.filter(i => i.severity === 'HIGH');

  if (critical.length > 0) {
    console.log(`\n❌ ${critical.length} CRITICAL ISSUES FOUND:`);
    critical.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.page}] ${issue.description}`);
    });
  }

  if (high.length > 0) {
    console.log(`\n⚠️  ${high.length} HIGH PRIORITY ISSUES:`);
    high.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.page}] ${issue.description}`);
    });
  }

  console.log(`\n📈 AUDIT SUMMARY:`);
  console.log(`   Total Issues: ${report.summary.totalIssues}`);
  console.log(`   Critical: ${report.summary.critical}`);
  console.log(`   High: ${report.summary.high}`);
  console.log(`   Medium: ${report.summary.medium}`);
  console.log(`   Client Ready: ${report.summary.readyForClient ? '✅ YES' : '❌ NO'}`);

  console.log(`\n📁 Reports generated:`);
  console.log(`   📄 Detailed: ${reportPath}`);
  console.log(`   📝 Summary: ${summaryPath}`);

  console.log(`\n📸 Screenshots captured:`);
  audit.screenshots.forEach(screenshot => {
    console.log(`   🖼️  ${screenshot}`);
  });

  console.log('\n🎯 NEXT STEPS FOR TOMORROW\'S PRESENTATION:');
  console.log('1. Review the markdown summary file for actionable fixes');
  console.log('2. Fix all CRITICAL issues immediately');
  console.log('3. Address HIGH priority issues if time permits');
  console.log('4. Re-run audit after fixes to verify improvements');

  if (critical.length > 0) {
    console.log('\n❗ URGENT: Critical issues found - site NOT ready for client presentation!');
    process.exit(1);
  } else if (high.length > 3) {
    console.log('\n⚠️  WARNING: Multiple high-priority issues may affect client impression');
    process.exit(0);
  } else {
    console.log('\n✅ GOOD: Site appears ready for client presentation with minor improvements needed');
    process.exit(0);
  }
}

// Run the audit
runMobileAudit().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});