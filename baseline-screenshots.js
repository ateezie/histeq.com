const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureBaselineScreenshots() {
  console.log('🎯 Starting baseline screenshot capture for WordPress theme...');

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'baseline-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const report = {
    timestamp,
    screenshots: [],
    errors: [],
    consoleMessages: [],
    designMockups: []
  };

  // Define WordPress test configurations
  const BASE_URL = 'http://localhost:8080';
  const testConfigs = [
    {
      page: 'homepage',
      url: `${BASE_URL}/`,
      designMockup: '/Users/alexthip/Projects/histeq.com/design/home__desktop.png',
      viewports: [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'mobile', width: 375, height: 812 }
      ]
    },
    {
      page: 'meet-our-team',
      url: `${BASE_URL}/meet-our-team/`,
      designMockup: '/Users/alexthip/Projects/histeq.com/design/meet__desktop.png',
      viewports: [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'mobile', width: 375, height: 812 }
      ]
    },
    {
      page: 'contact',
      url: `${BASE_URL}/contact-us/`,
      designMockup: '/Users/alexthip/Projects/histeq.com/design/contact-focus.png',
      viewports: [
        { name: 'desktop', width: 1440, height: 900 },
        { name: 'mobile', width: 375, height: 812 }
      ]
    }
  ];

  // Verify design mockups exist
  console.log('📐 Checking design mockups...');
  testConfigs.forEach(config => {
    if (fs.existsSync(config.designMockup)) {
      report.designMockups.push({
        page: config.page,
        mockup: config.designMockup,
        exists: true
      });
      console.log(`  ✅ ${config.page}: ${config.designMockup}`);
    } else {
      report.designMockups.push({
        page: config.page,
        mockup: config.designMockup,
        exists: false
      });
      console.log(`  ❌ ${config.page}: ${config.designMockup} (NOT FOUND)`);
    }
  });

  try {

    for (const config of testConfigs) {
      console.log(`\n📄 Processing ${config.page} page...`);

      for (const viewport of config.viewports) {
        console.log(`  📱 Capturing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);

        const context = await browser.newContext({
          viewport: {
            width: viewport.width,
            height: viewport.height
          }
        });

        const page = await context.newPage();

        // Listen for console messages
        page.on('console', msg => {
          const message = {
            page: config.page,
            viewport: viewport.name,
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
          };
          report.consoleMessages.push(message);

          if (msg.type() === 'error') {
            console.log(`    ⚠️  Console error: ${msg.text()}`);
          }
        });

        // Listen for page errors
        page.on('pageerror', error => {
          const errorInfo = {
            page: config.page,
            viewport: viewport.name,
            message: error.message,
            stack: error.stack
          };
          report.errors.push(errorInfo);
          console.log(`    ❌ Page error: ${error.message}`);
        });

        try {
          // Navigate to the WordPress page
          console.log(`    🌐 Navigating to: ${config.url}`);
          await page.goto(config.url, {
            waitUntil: 'networkidle',
            timeout: 30000
          });

          // Wait for page to be fully loaded
          await page.waitForTimeout(2000);

          // Wait for fonts to load
          await page.waitForFunction(() => {
            return document.fonts.ready;
          });

          // Additional wait for any animations
          await page.waitForTimeout(1000);

          // Generate filename
          const filename = `baseline-${config.page}-${viewport.name}-${timestamp}.png`;
          const screenshotPath = path.join(screenshotsDir, filename);

          // Capture full-page screenshot
          await page.screenshot({
            path: screenshotPath,
            fullPage: true
          });

          // Get page title for verification
          const pageTitle = await page.title();

          const screenshotInfo = {
            page: config.page,
            viewport: viewport.name,
            filename,
            path: screenshotPath,
            dimensions: viewport,
            pageTitle,
            fileSize: fs.statSync(screenshotPath).size
          };

          report.screenshots.push(screenshotInfo);
          console.log(`    ✅ Screenshot saved: ${filename} (${Math.round(screenshotInfo.fileSize / 1024)}KB)`);

        } catch (error) {
          const errorInfo = {
            page: config.page,
            viewport: viewport.name,
            error: error.message,
            stack: error.stack
          };
          report.errors.push(errorInfo);
          console.log(`    ❌ Failed to capture ${config.page} ${viewport.name}: ${error.message}`);
        }

        await context.close();
      }
    }

  } catch (error) {
    console.error('Fatal error during screenshot capture:', error);
    report.errors.push({
      type: 'fatal',
      error: error.message,
      stack: error.stack
    });
  } finally {
    await browser.close();
  }

  // Generate report
  const reportPath = path.join(screenshotsDir, `baseline-report-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate HTML report
  const htmlReport = generateHTMLReport(report);
  const htmlReportPath = path.join(screenshotsDir, `baseline-report-${timestamp}.html`);
  fs.writeFileSync(htmlReportPath, htmlReport);

  console.log(`\n📊 Baseline Screenshot Report:`);
  console.log(`   Total Screenshots: ${report.screenshots.length}`);
  console.log(`   Console Messages: ${report.consoleMessages.length}`);
  console.log(`   Errors: ${report.errors.length}`);
  console.log(`   Report saved: ${reportPath}`);
  console.log(`   HTML Report: ${htmlReportPath}`);

  if (report.errors.length > 0) {
    console.log('\n⚠️  Errors detected:');
    report.errors.forEach(error => {
      console.log(`   - ${error.page || 'General'} (${error.viewport || 'N/A'}): ${error.error || error.message}`);
    });
  }

  if (report.consoleMessages.filter(msg => msg.type === 'error').length > 0) {
    console.log('\n⚠️  Console errors detected:');
    report.consoleMessages
      .filter(msg => msg.type === 'error')
      .forEach(msg => {
        console.log(`   - ${msg.page} (${msg.viewport}): ${msg.text}`);
      });
  }

  return report;
}

function generateHTMLReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Screenshots Report - ${report.timestamp}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #BD572B; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #BD572B; }
        .summary-card .number { font-size: 2em; font-weight: bold; color: #2D2E3D; }
        .screenshots { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .screenshot-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .screenshot-header { background: #BD572B; color: white; padding: 15px; }
        .screenshot-details { padding: 15px; background: white; }
        .screenshot-details p { margin: 5px 0; }
        .error-section { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .error-section h3 { color: #856404; margin-top: 0; }
        .error-item { background: white; border: 1px solid #ddd; border-radius: 4px; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Historic Equity Inc. - Baseline Screenshots Report</h1>
        <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Screenshots</h3>
            <div class="number">${report.screenshots.length}</div>
        </div>
        <div class="summary-card">
            <h3>Console Messages</h3>
            <div class="number">${report.consoleMessages.length}</div>
        </div>
        <div class="summary-card">
            <h3>Errors</h3>
            <div class="number">${report.errors.length}</div>
        </div>
        <div class="summary-card">
            <h3>Pages Tested</h3>
            <div class="number">2</div>
        </div>
    </div>

    <h2>Screenshots Captured</h2>
    <div class="screenshots">
        ${report.screenshots.map(screenshot => `
            <div class="screenshot-item">
                <div class="screenshot-header">
                    <strong>${screenshot.page}</strong> - ${screenshot.viewport}
                </div>
                <div class="screenshot-details">
                    <p><strong>Filename:</strong> ${screenshot.filename}</p>
                    <p><strong>Dimensions:</strong> ${screenshot.dimensions.width}x${screenshot.dimensions.height}</p>
                    <p><strong>File Size:</strong> ${Math.round(screenshot.fileSize / 1024)}KB</p>
                    <p><strong>Page Title:</strong> ${screenshot.pageTitle}</p>
                </div>
            </div>
        `).join('')}
    </div>

    ${report.errors.length > 0 ? `
    <div class="error-section">
        <h3>Errors Detected</h3>
        ${report.errors.map(error => `
            <div class="error-item">
                <strong>Page:</strong> ${error.page || 'General'} (${error.viewport || 'N/A'})<br>
                <strong>Error:</strong> ${error.error || error.message}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${report.consoleMessages.filter(msg => msg.type === 'error').length > 0 ? `
    <div class="error-section">
        <h3>Console Errors</h3>
        ${report.consoleMessages.filter(msg => msg.type === 'error').map(msg => `
            <div class="error-item">
                <strong>Page:</strong> ${msg.page} (${msg.viewport})<br>
                <strong>Message:</strong> ${msg.text}
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
  `;
}

// Run the screenshot capture
if (require.main === module) {
  captureBaselineScreenshots()
    .then(report => {
      console.log('\n✅ Baseline screenshot capture completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Baseline screenshot capture failed:', error);
      process.exit(1);
    });
}

module.exports = { captureBaselineScreenshots };