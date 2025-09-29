const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default;

/**
 * Visual Comparison Utility for Historic Equity WordPress Theme
 * Compares current implementation screenshots against design mockups
 */

// Configuration
const VIEWPORT_DESKTOP = { width: 1440, height: 900 };
const VIEWPORT_MOBILE = { width: 375, height: 812 };
const BASE_URL = 'http://localhost:8080';

// Design mockup configurations
const PAGES_CONFIG = {
  homepage: {
    url: `${BASE_URL}/`,
    mockups: {
      desktop: '/Users/alexthip/Projects/histeq.com/design/home__desktop.png',
      mobile: '/Users/alexthip/Projects/histeq.com/design/home__mobile.png'
    }
  },
  'meet-our-team': {
    url: `${BASE_URL}/meet-our-team/`,
    mockups: {
      desktop: '/Users/alexthip/Projects/histeq.com/design/meet__desktop.png',
      mobile: '/Users/alexthip/Projects/histeq.com/design/meet__mobile.png'
    }
  },
  'contact': {
    url: `${BASE_URL}/contact-us/`,
    mockups: {
      desktop: '/Users/alexthip/Projects/histeq.com/design/contact-focus.png',
      mobile: '/Users/alexthip/Projects/histeq.com/design/contact__mobile.png'
    }
  }
};

/**
 * Capture current implementation screenshot
 */
async function captureCurrentScreenshot(page, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForLoadState('networkidle');

  // Disable animations for consistent screenshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  return await page.screenshot({
    fullPage: true,
    animations: 'disabled'
  });
}

/**
 * Load design mockup image
 */
function loadMockupImage(mockupPath) {
  if (!fs.existsSync(mockupPath)) {
    throw new Error(`Design mockup not found: ${mockupPath}`);
  }

  return fs.readFileSync(mockupPath);
}

/**
 * Compare two images using pixelmatch
 */
function compareImages(img1Buffer, img2Buffer) {
  const img1 = PNG.sync.read(img1Buffer);
  const img2 = PNG.sync.read(img2Buffer);

  // Ensure images have same dimensions by resizing if needed
  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);

  // Create output image for diff
  const diff = new PNG({ width, height });

  // Resize images if needed
  const resizedImg1 = resizeImage(img1, width, height);
  const resizedImg2 = resizeImage(img2, width, height);

  // Compare images
  const mismatchedPixels = pixelmatch(
    resizedImg1.data,
    resizedImg2.data,
    diff.data,
    width,
    height,
    {
      threshold: 0.1, // 0-1 range
      includeAA: false, // Ignore anti-aliasing
      diffColor: [255, 0, 0], // Red for differences
      diffColorAlt: [0, 255, 0] // Green for additions
    }
  );

  const totalPixels = width * height;
  const matchPercentage = ((totalPixels - mismatchedPixels) / totalPixels) * 100;

  return {
    width,
    height,
    mismatchedPixels,
    totalPixels,
    matchPercentage: Math.round(matchPercentage * 100) / 100,
    diffImage: diff,
    passed: matchPercentage >= 95 // 95% threshold for passing
  };
}

/**
 * Resize image to target dimensions
 */
function resizeImage(img, targetWidth, targetHeight) {
  if (img.width === targetWidth && img.height === targetHeight) {
    return img;
  }

  const resized = new PNG({ width: targetWidth, height: targetHeight });

  // Simple resize - fill with white if target is larger
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const targetIdx = (targetWidth * y + x) << 2;

      if (x < img.width && y < img.height) {
        const sourceIdx = (img.width * y + x) << 2;
        resized.data[targetIdx] = img.data[sourceIdx];     // R
        resized.data[targetIdx + 1] = img.data[sourceIdx + 1]; // G
        resized.data[targetIdx + 2] = img.data[sourceIdx + 2]; // B
        resized.data[targetIdx + 3] = img.data[sourceIdx + 3]; // A
      } else {
        // Fill with white for areas beyond original image
        resized.data[targetIdx] = 255;     // R
        resized.data[targetIdx + 1] = 255; // G
        resized.data[targetIdx + 2] = 255; // B
        resized.data[targetIdx + 3] = 255; // A
      }
    }
  }

  return resized;
}

/**
 * Save comparison results
 */
function saveComparisonResults(pageName, viewport, comparison, diffDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${pageName}-${viewport}-diff-${timestamp}.png`;
  const filepath = path.join(diffDir, filename);

  // Save diff image
  const buffer = PNG.sync.write(comparison.diffImage);
  fs.writeFileSync(filepath, buffer);

  return {
    filename,
    filepath,
    ...comparison
  };
}

/**
 * Compare specific page against design mockup
 */
async function comparePage(pageName, viewport = 'desktop') {
  console.log(`🔍 Comparing ${pageName} (${viewport}) against design mockup...`);

  const pageConfig = PAGES_CONFIG[pageName];
  if (!pageConfig) {
    throw new Error(`Page configuration not found: ${pageName}`);
  }

  const mockupPath = pageConfig.mockups[viewport];
  if (!mockupPath || !fs.existsSync(mockupPath)) {
    throw new Error(`Design mockup not found: ${mockupPath}`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to page
    await page.goto(pageConfig.url);

    // Capture current implementation
    const viewportSize = viewport === 'desktop' ? VIEWPORT_DESKTOP : VIEWPORT_MOBILE;
    const currentScreenshot = await captureCurrentScreenshot(page, viewportSize);

    // Load design mockup
    const mockupImage = loadMockupImage(mockupPath);

    // Compare images
    const comparison = compareImages(currentScreenshot, mockupImage);

    // Save results
    const diffDir = path.join(__dirname, 'visual-comparison-results');
    if (!fs.existsSync(diffDir)) {
      fs.mkdirSync(diffDir, { recursive: true });
    }

    const results = saveComparisonResults(pageName, viewport, comparison, diffDir);

    console.log(`  ${results.passed ? '✅' : '❌'} Match: ${results.matchPercentage}% (${results.mismatchedPixels}/${results.totalPixels} pixels)`);
    console.log(`  📄 Diff saved: ${results.filename}`);

    return {
      page: pageName,
      viewport,
      mockupPath,
      url: pageConfig.url,
      passed: results.passed,
      matchPercentage: results.matchPercentage,
      mismatchedPixels: results.mismatchedPixels,
      totalPixels: results.totalPixels,
      diffImagePath: results.filepath,
      timestamp: new Date().toISOString()
    };

  } finally {
    await browser.close();
  }
}

/**
 * Compare all pages against their design mockups
 */
async function compareAllPages() {
  console.log('🎯 Starting visual comparison for all pages...\n');

  const results = [];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  for (const [pageName, config] of Object.entries(PAGES_CONFIG)) {
    console.log(`\n📄 Processing ${pageName}...`);

    // Test desktop viewport
    if (config.mockups.desktop) {
      try {
        const desktopResult = await comparePage(pageName, 'desktop');
        results.push(desktopResult);
      } catch (error) {
        console.log(`  ❌ Desktop comparison failed: ${error.message}`);
        results.push({
          page: pageName,
          viewport: 'desktop',
          error: error.message,
          passed: false
        });
      }
    }

    // Test mobile viewport
    if (config.mockups.mobile) {
      try {
        const mobileResult = await comparePage(pageName, 'mobile');
        results.push(mobileResult);
      } catch (error) {
        console.log(`  ❌ Mobile comparison failed: ${error.message}`);
        results.push({
          page: pageName,
          viewport: 'mobile',
          error: error.message,
          passed: false
        });
      }
    }
  }

  // Generate summary report
  const reportPath = path.join(__dirname, 'visual-comparison-results', `comparison-report-${timestamp}.json`);
  const summary = {
    timestamp,
    totalComparisons: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    averageMatch: results
      .filter(r => r.matchPercentage)
      .reduce((sum, r) => sum + r.matchPercentage, 0) / results.filter(r => r.matchPercentage).length,
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

  console.log('\n📊 Visual Comparison Summary:');
  console.log(`   Total Comparisons: ${summary.totalComparisons}`);
  console.log(`   Passed: ${summary.passed}`);
  console.log(`   Failed: ${summary.failed}`);
  console.log(`   Average Match: ${Math.round(summary.averageMatch * 100) / 100}%`);
  console.log(`   Report: ${reportPath}`);

  return summary;
}

/**
 * Generate HTML report for visual comparisons
 */
function generateHTMLReport(summary) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Comparison Report - Historic Equity</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #BD572B; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #BD572B; }
        .summary-card .number { font-size: 2em; font-weight: bold; color: #2D2E3D; }
        .results { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
        .result-item { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .result-header { padding: 15px; font-weight: bold; }
        .result-header.passed { background: #d4edda; color: #155724; }
        .result-header.failed { background: #f8d7da; color: #721c24; }
        .result-details { padding: 15px; background: white; }
        .result-details p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Historic Equity Inc. - Visual Comparison Report</h1>
        <p>Generated: ${new Date(summary.timestamp).toLocaleString()}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="number">${summary.totalComparisons}</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="number">${summary.passed}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="number">${summary.failed}</div>
        </div>
        <div class="summary-card">
            <h3>Average Match</h3>
            <div class="number">${Math.round(summary.averageMatch * 100) / 100}%</div>
        </div>
    </div>

    <h2>Comparison Results</h2>
    <div class="results">
        ${summary.results.map(result => `
            <div class="result-item">
                <div class="result-header ${result.passed ? 'passed' : 'failed'}">
                    ${result.page} - ${result.viewport} ${result.passed ? '✅' : '❌'}
                </div>
                <div class="result-details">
                    ${result.error ? `
                        <p><strong>Error:</strong> ${result.error}</p>
                    ` : `
                        <p><strong>Match:</strong> ${result.matchPercentage}%</p>
                        <p><strong>Mismatched Pixels:</strong> ${result.mismatchedPixels}/${result.totalPixels}</p>
                        <p><strong>URL:</strong> ${result.url}</p>
                        <p><strong>Mockup:</strong> ${path.basename(result.mockupPath)}</p>
                    `}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;

  const htmlPath = path.join(__dirname, 'visual-comparison-results', `comparison-report-${summary.timestamp.replace(/[:.]/g, '-').slice(0, 19)}.html`);
  fs.writeFileSync(htmlPath, htmlContent);

  return htmlPath;
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Compare all pages
    compareAllPages()
      .then(summary => {
        const htmlReport = generateHTMLReport(summary);
        console.log(`\n📄 HTML Report: ${htmlReport}`);

        if (summary.failed > 0) {
          console.log('\n❌ Some visual comparisons failed. Check the results for details.');
          process.exit(1);
        } else {
          console.log('\n✅ All visual comparisons passed!');
          process.exit(0);
        }
      })
      .catch(error => {
        console.error('\n❌ Visual comparison failed:', error);
        process.exit(1);
      });
  } else {
    // Compare specific page
    const [pageName, viewport = 'desktop'] = args;
    comparePage(pageName, viewport)
      .then(result => {
        console.log('\n✅ Comparison completed successfully!');
        process.exit(result.passed ? 0 : 1);
      })
      .catch(error => {
        console.error('\n❌ Comparison failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  comparePage,
  compareAllPages,
  captureCurrentScreenshot,
  loadMockupImage,
  compareImages,
  generateHTMLReport
};