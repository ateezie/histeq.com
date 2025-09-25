// Global teardown for Playwright tests
// Runs once after all tests complete

async function globalTeardown(config) {
  console.log('🧹 Cleaning up after Historic Equity test suite...');

  // Cleanup tasks:
  // - Remove test data
  // - Reset WordPress state
  // - Clear temporary files
  // - Generate test reports

  console.log('✅ Global teardown complete');
}

module.exports = globalTeardown;