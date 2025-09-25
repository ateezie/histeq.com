// Global teardown for Playwright tests
// Cleanup after all tests complete

async function globalTeardown(config) {
  console.log('🧹 Cleaning up Playwright test environment...');

  try {
    // Clean up temporary files if needed
    const fs = require('fs');
    const path = require('path');

    // Remove temporary screenshot files older than 24 hours
    const screenshotDirs = [
      'baseline-screenshots',
      'visual-comparison-results',
      'test-results',
      'playwright-report'
    ];

    for (const dir of screenshotDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        console.log(`📁 Checking ${dir} for old files...`);

        const files = fs.readdirSync(dirPath);
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 hours

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);

          if (stats.isFile() && stats.mtime.getTime() < oneDayAgo) {
            console.log(`🗑️  Removing old file: ${file}`);
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

module.exports = globalTeardown;