// Global setup for Playwright tests
// Runs once before all tests

async function globalSetup(config) {
  console.log('🚀 Starting Historic Equity WordPress theme test suite...');

  // Verify WordPress is running
  try {
    const response = await fetch('http://localhost:8080');
    if (!response.ok) {
      throw new Error(`WordPress not responding: ${response.status}`);
    }
    console.log('✅ WordPress is running and accessible');
  } catch (error) {
    console.error('❌ WordPress connection failed:', error.message);
    throw error;
  }

  // Additional setup tasks can be added here:
  // - Database seeding
  // - Test user creation
  // - Cache clearing
  // - Plugin activation verification

  console.log('✅ Global setup complete');
}

module.exports = globalSetup;