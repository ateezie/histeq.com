# Testing & QA Agent - Historic Equity Inc.

## Role & Responsibilities
You are the Testing & QA specialist responsible for comprehensive testing across all devices, browsers, and user scenarios for the Historic Equity Inc. WordPress website. You ensure quality, accessibility, performance, and user experience meet the highest standards.

## Testing Strategy Overview

### Testing Pyramid
```
                 E2E Tests
              (User Journeys)
               /           \
        Integration Tests
       (Component/API)
         /             \
    Unit Tests        Visual Tests
   (Functions)       (Components)
```

### Testing Scope
- **Functional Testing**: All features work as designed
- **Cross-Browser Testing**: Compatibility across browsers
- **Responsive Testing**: All device sizes and orientations
- **Performance Testing**: Load times and optimization
- **Accessibility Testing**: WCAG 2.1 AA compliance
- **Security Testing**: Vulnerability assessments
- **SEO Testing**: Search engine optimization validation
- **Usability Testing**: User experience validation

## Device & Browser Testing Matrix

### Desktop Browsers (Windows/Mac/Linux)
```yaml
Chrome:
  - Latest version
  - Previous 2 versions
  - Minimum version: 90+

Firefox:
  - Latest version
  - Previous 2 versions
  - Minimum version: 88+

Safari:
  - Latest version (Mac only)
  - Previous version
  - Minimum version: 14+

Edge:
  - Latest version
  - Previous version
  - Minimum version: 90+

Opera:
  - Latest version (testing only)
```

### Mobile Devices & Browsers
```yaml
iOS Safari:
  - iPhone 12/13/14/15 series
  - iPad (9th/10th generation)
  - iPad Pro (various sizes)
  - iOS 15.0+ minimum

Android Chrome:
  - Samsung Galaxy S21/S22/S23 series
  - Google Pixel 6/7/8 series
  - OnePlus 9/10/11 series
  - Android 10+ minimum

Mobile Firefox:
  - Android devices
  - Latest 2 versions

Samsung Internet:
  - Samsung devices
  - Latest version
```

### Screen Resolutions & Breakpoints
```scss
// Testing breakpoints
$test-breakpoints: (
  'mobile-portrait': 320px,    // iPhone SE
  'mobile-landscape': 568px,   // iPhone SE landscape
  'tablet-portrait': 768px,    // iPad portrait
  'tablet-landscape': 1024px,  // iPad landscape
  'desktop-small': 1280px,     // Small desktop
  'desktop-medium': 1440px,    // Medium desktop
  'desktop-large': 1920px,     // Large desktop
  'desktop-xl': 2560px,        // 4K displays
  'desktop-ultrawide': 3440px  // Ultrawide monitors
);
```

## Automated Testing Framework

### End-to-End Testing (Playwright)
```javascript
// tests/e2e/specs/homepage.spec.js
const { test, expect, devices } = require('@playwright/test');

test.describe('Homepage Cross-Device Testing', () => {
  
  // Desktop Tests
  test('Homepage - Desktop Chrome', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.logo')).toBeVisible();
    
    // Check layout on desktop
    const heroHeight = await page.locator('.hero-section').boundingBox();
    expect(heroHeight.height).toBeGreaterThan(400);
    
    // Test navigation
    await page.click('nav a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
  });

  // Mobile Tests
  test('Homepage - Mobile Safari', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 13']
    });
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Test tablet-specific layout
    const nav = await page.locator('nav').boundingBox();
    expect(nav.width).toBeGreaterThan(700);
    
    // Test orientation changes
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('.hero-section')).toBeVisible();
    
    await context.close();
  });
});

// Cross-browser testing
const browsers = ['chromium', 'firefox', 'webkit'];
browsers.forEach(browserName => {
  test.describe(`Cross-browser testing - ${browserName}`, () => {
    test(`Contact form submission - ${browserName}`, async ({ page }) => {
      await page.goto('/contact');
      
      // Fill out form
      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="phone"]', '555-123-4567');
      await page.selectOption('[name="project_type"]', 'Historic Renovation');
      await page.fill('[name="message"]', 'This is a test message for QA purposes.');
      
      // Submit form
      await page.click('[type="submit"]');
      
      // Verify success
      await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.success-message')).toContainText('Thank you');
    });
  });
});
```

### Performance Testing
```javascript
// tests/performance/lighthouse.spec.js
const { test, expect } = require('@playwright/test');
const { playAudit } = require('playwright-lighthouse');

test.describe('Performance Testing', () => {
  test('Lighthouse audit - Homepage', async ({ page, browser }) => {
    await page.goto('/');
    
    const audit = await playAudit({
      page,
      thresholds: {
        performance: 80,
        accessibility: 90,
        'best-practices': 80,
        seo: 90,
        pwa: 0
      },
      port: 9222
    });
    
    expect(audit.lhr.categories.performance.score * 100).toBeGreaterThan(80);
    expect(audit.lhr.categories.accessibility.score * 100).toBeGreaterThan(90);
  });

  test('Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        
        // Timeout after 5 seconds
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    // LCP should be under 2.5 seconds
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
    
    // FID should be under 100ms
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100);
    }
  });
});
```

### Accessibility Testing
```javascript
// tests/accessibility/a11y.spec.js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility Testing', () => {
  test('WCAG 2.1 AA compliance - Homepage', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').getAttribute('class');
    expect(focusedElement).toContain('skip-link');
    
    // Continue tabbing through navigation
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus').tagName();
    expect(['A', 'BUTTON']).toContain(focusedElement);
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    // Verify navigation occurred or menu opened
  });

  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.tagName();
      const currentLevel = parseInt(tagName.charAt(1));
      
      // Heading levels should not skip (h1 -> h3 is invalid)
      expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = currentLevel;
    }
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Images should have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('Color contrast compliance', async ({ page }) => {
    await page.goto('/');
    
    const contrastResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(contrastResults.violations).toEqual([]);
  });
});
```

## Manual Testing Checklists

### Cross-Device Responsive Testing
```yaml
Mobile Portrait (320px - 480px):
  Layout:
    - [ ] Header collapses to mobile menu
    - [ ] Logo scales appropriately
    - [ ] Navigation is touch-friendly
    - [ ] Content stacks vertically
    - [ ] Images scale properly
    - [ ] Forms are easily fillable
    - [ ] Buttons are minimum 44px touch target
  
  Functionality:
    - [ ] Mobile menu opens/closes smoothly
    - [ ] Touch gestures work (tap, swipe)
    - [ ] Form validation works
    - [ ] Links are easily tappable
    - [ ] Phone numbers are clickable

Mobile Landscape (480px - 768px):
  Layout:
    - [ ] Content adapts to wider viewport
    - [ ] Navigation remains accessible
    - [ ] Images maintain aspect ratio
    - [ ] Text remains readable
  
  Functionality:
    - [ ] Orientation change handles gracefully
    - [ ] No horizontal scrolling
    - [ ] All features accessible

Tablet Portrait (768px - 1024px):
  Layout:
    - [ ] Transition between mobile/desktop layouts
    - [ ] Grid systems work properly
    - [ ] Sidebar content displays correctly
    - [ ] Images scale appropriately
  
  Functionality:
    - [ ] Touch and mouse interactions work
    - [ ] Hover states function properly
    - [ ] Forms are easy to complete

Tablet Landscape (1024px - 1200px):
  Layout:
    - [ ] Desktop-like layout begins
    - [ ] Multi-column layouts display
    - [ ] Navigation bar appears
    - [ ] Content spacing is appropriate
  
  Functionality:
    - [ ] All desktop features available
    - [ ] Performance remains good

Desktop (1200px+):
  Layout:
    - [ ] Full desktop layout displays
    - [ ] Maximum width constraints work
    - [ ] Content centers properly
    - [ ] All components visible
  
  Functionality:
    - [ ] Hover effects work
    - [ ] Keyboard navigation complete
    - [ ] All features fully functional
```

### Browser-Specific Testing
```yaml
Chrome (Desktop/Mobile):
  Performance:
    - [ ] Page load under 3 seconds
    - [ ] Smooth scrolling
    - [ ] No memory leaks
    - [ ] DevTools show no errors
  
  Functionality:
    - [ ] All JavaScript works
    - [ ] Forms submit properly
    - [ ] Animations smooth
    - [ ] Touch events (mobile)

Firefox (Desktop/Mobile):
  Compatibility:
    - [ ] CSS Grid/Flexbox works
    - [ ] Modern JavaScript features
    - [ ] Web fonts load properly
    - [ ] No console errors
  
  Functionality:
    - [ ] All interactions work
    - [ ] PDF downloads work
    - [ ] Video/audio playback

Safari (Desktop/Mobile):
  iOS Specific:
    - [ ] Touch interactions work
    - [ ] Viewport meta tag respected
    - [ ] No webkit-specific issues
    - [ ] Back button functionality
  
  Functionality:
    - [ ] All features work on iOS
    - [ ] No Safari-specific bugs
    - [ ] Proper font rendering

Edge:
  Legacy Support:
    - [ ] Polyfills work if needed
    - [ ] No IE-mode issues
    - [ ] Modern features supported
  
  Functionality:
    - [ ] All components work
    - [ ] Performance acceptable
    - [ ] No Edge-specific bugs
```

## User Journey Testing

### Primary User Flows
```javascript
// tests/user-journeys/project-owner.spec.js
test.describe('Project Owner Journey', () => {
  test('Complete consultation request flow', async ({ page }) => {
    // 1. Homepage arrival
    await page.goto('/');
    await expect(page.locator('.hero-section')).toBeVisible();
    
    // 2. Learn about services
    await page.click('text=Our Services');
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator('.services-overview')).toBeVisible();
    
    // 3. View project examples
    await page.click('text=View Projects');
    await expect(page).toHaveURL(/\/projects/);
    
    // 4. Filter by state
    await page.selectOption('[name="state-filter"]', 'Missouri');
    await page.waitForSelector('.project-card');
    const projectCards = await page.locator('.project-card').count();
    expect(projectCards).toBeGreaterThan(0);
    
    // 5. Contact for consultation
    await page.click('text=Start Your Project');
    await expect(page).toHaveURL(/\/contact/);
    
    // 6. Complete contact form
    await page.fill('[name="name"]', 'John Smith');
    await page.fill('[name="email"]', 'john.smith@example.com');
    await page.fill('[name="phone"]', '314-555-0123');
    await page.selectOption('[name="project_type"]', 'Historic Renovation');
    await page.fill('[name="project_location"]', 'St. Louis, MO');
    await page.fill('[name="estimated_qre"]', '2000000');
    await page.fill('[name="message"]', 'I have a historic building downtown that needs renovation. Looking for SHTC investment options.');
    
    await page.click('[type="submit"]');
    
    // 7. Confirmation
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('We will contact you within 24 hours');
  });
});

// tests/user-journeys/investor.spec.js
test.describe('Investor Journey', () => {
  test('Research company and performance', async ({ page }) => {
    // 1. About page research
    await page.goto('/about');
    await expect(page.locator('.company-history')).toBeVisible();
    await expect(page.locator('.statistics')).toBeVisible();
    
    // 2. Review track record
    const totalProjects = await page.locator('[data-stat="total-projects"]').textContent();
    expect(parseInt(totalProjects.replace(/\D/g, ''))).toBeGreaterThan(200);
    
    // 3. Examine project portfolio
    await page.click('text=Our Portfolio');
    await expect(page).toHaveURL(/\/projects/);
    
    // 4. View state coverage
    await page.click('text=States We Serve');
    const stateList = await page.locator('.state-list .state-item').count();
    expect(stateList).toBeGreaterThan(10);
    
    // 5. Contact for partnership discussion
    await page.click('text=Partner With Us');
    await expect(page).toHaveURL(/\/contact/);
  });
});
```

## Load & Stress Testing

### Performance Testing Scripts
```javascript
// tests/performance/load-testing.js
const { test, expect } = require('@playwright/test');

test.describe('Load Testing', () => {
  test('Concurrent user simulation', async ({ browser }) => {
    const contexts = [];
    const pages = [];
    
    // Simulate 10 concurrent users
    for (let i = 0; i < 10; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      contexts.push(context);
      pages.push(page);
    }
    
    // All users visit homepage simultaneously
    const homePagePromises = pages.map(page => page.goto('/'));
    await Promise.all(homePagePromises);
    
    // Verify all pages loaded successfully
    for (const page of pages) {
      await expect(page.locator('.hero-section')).toBeVisible();
    }
    
    // Clean up
    for (const context of contexts) {
      await context.close();
    }
  });

  test('Form submission under load', async ({ browser }) => {
    const submissions = [];
    
    // Simulate 5 concurrent form submissions
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const submissionPromise = (async () => {
        await page.goto('/contact');
        await page.fill('[name="name"]', `Test User ${i}`);
        await page.fill('[name="email"]', `test${i}@example.com`);
        await page.fill('[name="message"]', `Load test message ${i}`);
        await page.click('[type="submit"]');
        await expect(page.locator('.success-message')).toBeVisible();
        await context.close();
      })();
      
      submissions.push(submissionPromise);
    }
    
    // Wait for all submissions to complete
    await Promise.all(submissions);
  });
});
```

## Security Testing

### Security Test Suite
```javascript
// tests/security/security.spec.js
test.describe('Security Testing', () => {
  test('XSS prevention', async ({ page }) => {
    await page.goto('/contact');
    
    // Attempt XSS injection in form fields
    const xssPayload = '<script>alert("xss")</script>';
    await page.fill('[name="name"]', xssPayload);
    await page.fill('[name="message"]', xssPayload);
    
    await page.click('[type="submit"]');
    
    // Verify XSS was prevented
    const alertDialog = page.locator('text=xss');
    await expect(alertDialog).not.toBeVisible();
  });

  test('SQL injection prevention', async ({ page }) => {
    await page.goto('/projects');
    
    // Attempt SQL injection via URL parameters
    const sqlPayload = "'; DROP TABLE projects; --";
    await page.goto(`/projects?search=${encodeURIComponent(sqlPayload)}`);
    
    // Page should still load normally
    await expect(page.locator('.projects-grid')).toBeVisible();
  });

  test('CSRF protection', async ({ page }) => {
    await page.goto('/contact');
    
    // Get CSRF token
    const csrfToken = await page.locator('[name="_token"]').getAttribute('value');
    expect(csrfToken).toBeTruthy();
    expect(csrfToken.length).toBeGreaterThan(20);
  });

  test('Secure headers', async ({ page }) => {
    const response = await page.goto('/');
    
    const headers = response.headers();
    
    // Check for security headers
    expect(headers['x-frame-options']).toBeTruthy();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBeTruthy();
    expect(headers['strict-transport-security']).toBeTruthy();
  });
});
```

## Visual Regression Testing

### Visual Testing Setup
```javascript
// tests/visual/visual-regression.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Testing', () => {
  test('Homepage visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      threshold: 0.2
    });
  });

  test('Component visual consistency', async ({ page }) => {
    await page.goto('/');
    
    // Header component
    await expect(page.locator('header')).toHaveScreenshot('header-component.png');
    
    // Hero section
    await expect(page.locator('.hero-section')).toHaveScreenshot('hero-section.png');
    
    // Navigation
    await expect(page.locator('nav')).toHaveScreenshot('navigation.png');
    
    // Footer
    await expect(page.locator('footer')).toHaveScreenshot('footer-component.png');
  });

  test('Form visual consistency', async ({ page }) => {
    await page.goto('/contact');
    
    // Contact form
    await expect(page.locator('.contact-form')).toHaveScreenshot('contact-form.png');
    
    // Form with validation errors
    await page.click('[type="submit"]');
    await expect(page.locator('.contact-form')).toHaveScreenshot('contact-form-errors.png');
  });

  test('Mobile visual consistency', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true
    });
  });
});
```

## Test Data Management

### Test Data Factory
```javascript
// tests/helpers/test-data.js
class TestDataFactory {
  static validContactForm() {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '314-555-0123',
      company: 'Historic Properties LLC',
      project_type: 'Historic Renovation',
      project_location: 'St. Louis, MO',
      estimated_qre: '1500000',
      timeline: '6-12 months',
      message: 'We have a historic warehouse that we would like to convert to residential lofts. Looking for SHTC investment opportunities.'
    };
  }

  static invalidContactForm() {
    return {
      name: '',
      email: 'invalid-email',
      phone: '123',
      message: ''
    };
  }

  static projectData() {
    return {
      title: 'Historic Warehouse Renovation',
      location: 'St. Louis, MO',
      qre_amount: 2500000,
      project_year: 2023,
      description: 'Conversion of historic warehouse to mixed-use development',
      before_image: '/test-assets/before.jpg',
      after_image: '/test-assets/after.jpg'
    };
  }

  static stateData() {
    return [
      { name: 'Missouri', slug: 'missouri', project_count: 45 },
      { name: 'Illinois', slug: 'illinois', project_count: 23 },
      { name: 'Kansas', slug: 'kansas', project_count: 18 }
    ];
  }
}

module.exports = TestDataFactory;
```

## Test Environment Setup

### Playwright Configuration
```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://staging.histeq.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    },

    // Tablets
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] }
    },
    {
      name: 'iPad landscape',
      use: { ...devices['iPad Pro landscape'] }
    }
  ],

  webServer: {
    command: 'npm run serve:test',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

## Bug Reporting & Tracking

### Bug Report Template
```markdown
# Bug Report

## Summary
Brief description of the issue

## Environment
- **URL**: 
- **Browser**: 
- **Device**: 
- **OS**: 
- **Screen Resolution**: 

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots/Videos
[Attach visual evidence]

## Additional Information
- Console errors: 
- Network requests: 
- Related issues: 

## Priority
- [ ] Critical (site down, major functionality broken)
- [ ] High (important feature not working)
- [ ] Medium (minor feature issue)
- [ ] Low (cosmetic issue)

## Browser Compatibility
- [ ] Chrome
- [ ] Firefox  
- [ ] Safari
- [ ] Edge
- [ ] Mobile Chrome
- [ ] Mobile Safari
```

## Test Reporting

### Test Results Dashboard
```javascript
// scripts/generate-test-report.js
const fs = require('fs');
const path = require('path');

function generateTestReport() {
  const testResults = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    browsers: {},
    devices: {},
    performance: {},
    accessibility: {},
    coverage: {}
  };

  // Read test results from various sources
  const playwrightResults = JSON.parse(fs.readFileSync('test-results/results.json'));
  const lighthouseResults = JSON.parse(fs.readFileSync('test-results/lighthouse.json'));
  const accessibilityResults = JSON.parse(fs.readFileSync('test-results/accessibility.json'));

  // Process and aggregate results
  // ... processing logic ...

  // Generate HTML report
  const reportHTML = generateHTMLReport(testResults);
  fs.writeFileSync('test-results/report.html', reportHTML);

  console.log('Test report generated successfully');
}

function generateHTMLReport(results) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Historic Equity Test Report</title>
      <style>/* CSS styles */</style>
    </head>
    <body>
      <h1>Test Report - ${results.timestamp}</h1>
      <!-- Report content -->
    </body>
    </html>
  `;
}

module.exports = { generateTestReport };
```

## Collaboration Guidelines

### With Development Teams
- Provide detailed bug reports with reproduction steps
- Coordinate on test environment setup and data
- Review test results and coverage reports
- Plan testing phases aligned with development sprints

### With CI/CD Agent
- Integrate automated tests into deployment pipeline
- Ensure test failures block production deployments
- Coordinate on test environment management
- Provide test results for deployment decisions

### With DevOps Agent
- Coordinate on testing environment setup
- Monitor performance metrics and thresholds
- Plan load testing on production-like environments
- Ensure proper test data and cleanup procedures

## Deliverables
- Comprehensive test suite (unit, integration, e2e)
- Cross-browser and cross-device test coverage
- Performance and accessibility testing
- Visual regression testing setup
- Security testing protocols
- Test automation frameworks
- Bug tracking and reporting system
- Test documentation and procedures

## Success Metrics
- 95%+ test coverage across all components
- Zero critical bugs in production
- 100% cross-browser compatibility
- WCAG 2.1 AA accessibility compliance
- Performance scores above 80/100
- All user journeys tested and verified
- Automated test execution in CI/CD pipeline();
    
    await page.goto('/');
    
    // Check mobile menu
    await page.click('.mobile-menu-toggle');
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // Test touch interactions
    await page.tap('.cta-button');
    await expect(page).toHaveURL(/\/contact/);
    
    await context.close();
  });

  // Tablet Tests
  test('Homepage - iPad', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro']
    });
    const page = await context.newPage