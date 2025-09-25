const { test, expect } = require('@playwright/test');

test.describe('Homepage Lead Generation Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Homepage should load with modern, professional design reflecting SHTC industry', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Verify page loads successfully
    await expect(page).toHaveTitle(/Historic Equity/);

    // Check for key brand elements
    await expect(page.locator('[data-testid="logo"]')).toBeVisible();

    // Verify brand colors are applied (Historic Equity color scheme)
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    // Check that primary brand colors are used
    const primaryColorElements = page.locator('.bg-primary-600, .text-primary-600');
    await expect(primaryColorElements.first()).toBeVisible();

    // Verify professional typography (Montserrat)
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toHaveCSS('font-family', /montserrat/i);
  });

  test('Hero section should display clear value proposition and lead capture', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();

    // Value proposition should be prominent
    await expect(page.locator('h1')).toContainText(/State Historic Tax Credit|SHTC|Historic Equity/i);

    // Primary CTA should be visible and compelling
    const primaryCta = page.locator('[data-testid="hero-cta"]');
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toContainText(/contact|get started|learn more|discuss|consultation/i);

    // Hero should include trust indicators
    await expect(page.locator('[data-testid="trust-indicators"]')).toBeVisible();

    // Should show investment experience/portfolio metrics
    const metrics = page.locator('[data-testid="portfolio-metrics"]');
    await expect(metrics).toBeVisible();
    await expect(metrics).toContainText(/\$|billion|projects|states/i);
  });

  test('Contact form should be prominently displayed with lead qualification fields', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Primary contact form should be visible on homepage
    const contactForm = page.locator('[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();

    // Required fields for lead qualification
    await expect(contactForm.locator('input[name="name"]')).toBeVisible();
    await expect(contactForm.locator('input[name="email"]')).toBeVisible();
    await expect(contactForm.locator('input[name="project_location"]')).toBeVisible();

    // Property type selection
    const propertyTypeSelect = contactForm.locator('select[name="property_type"]');
    await expect(propertyTypeSelect).toBeVisible();

    const propertyOptions = propertyTypeSelect.locator('option');
    await expect(propertyOptions).toContainText(['Commercial', 'Residential', 'Industrial', 'Institutional', 'Mixed-Use']);

    // Project timeline selection
    await expect(contactForm.locator('select[name="project_timeline"]')).toBeVisible();

    // Budget range (optional but valuable for qualification)
    await expect(contactForm.locator('select[name="estimated_budget"]')).toBeVisible();

    // Project description
    await expect(contactForm.locator('textarea[name="project_description"]')).toBeVisible();

    // Marketing consent checkbox
    await expect(contactForm.locator('input[name="consent_marketing"]')).toBeVisible();

    // Submit button with compelling copy
    const submitButton = contactForm.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText(/submit|send|contact|get started/i);
  });

  test('Service overview section should educate visitors about SHTC process', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const servicesSection = page.locator('[data-testid="services-overview"]');
    await expect(servicesSection).toBeVisible();

    // Should explain SHTC investment process
    await expect(servicesSection).toContainText(/State Historic Tax Credit|SHTC|investment|rehabilitation/i);

    // Key benefits should be highlighted
    const benefitsList = page.locator('[data-testid="shtc-benefits"]');
    await expect(benefitsList).toBeVisible();
    await expect(benefitsList).toContainText(/tax credit|investment|financing|preservation/i);

    // Process steps should be clear
    const processSteps = page.locator('[data-testid="investment-process"]');
    await expect(processSteps).toBeVisible();

    // Each service should have a CTA
    const serviceCtas = page.locator('[data-testid^="service-cta"]');
    await expect(serviceCtas.first()).toBeVisible();
  });

  test('Project showcase should display successful investments for credibility', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const projectShowcase = page.locator('[data-testid="project-showcase"]');
    await expect(projectShowcase).toBeVisible();

    // Should display featured projects
    const featuredProjects = page.locator('[data-testid="featured-project"]');
    await expect(featuredProjects.first()).toBeVisible();

    // Each project should show key information
    const firstProject = featuredProjects.first();
    await expect(firstProject.locator('[data-testid="project-title"]')).toBeVisible();
    await expect(firstProject.locator('[data-testid="project-location"]')).toBeVisible();
    await expect(firstProject.locator('[data-testid="project-image"]')).toBeVisible();

    // Investment amounts or tax credits should be visible (if available)
    const financialInfo = firstProject.locator('[data-testid="project-investment"], [data-testid="tax-credits"]');
    await expect(financialInfo.first()).toBeVisible();

    // CTA to view all projects
    const viewAllCta = page.locator('[data-testid="view-all-projects"]');
    await expect(viewAllCta).toBeVisible();
    await expect(viewAllCta).toContainText(/view all|see more|portfolio|projects/i);
  });

  test('Company credibility section should build trust', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const credibilitySection = page.locator('[data-testid="company-credibility"]');
    await expect(credibilitySection).toBeVisible();

    // Company background and experience
    await expect(credibilitySection).toContainText(/2001|founded|experience|expertise/i);

    // Geographic coverage
    await expect(credibilitySection).toContainText(/states|nationwide|coverage/i);

    // Portfolio metrics
    const portfolioStats = page.locator('[data-testid="portfolio-stats"]');
    await expect(portfolioStats).toBeVisible();
    await expect(portfolioStats).toContainText(/projects|investment|billion/i);

    // Team or leadership information
    const teamInfo = page.locator('[data-testid="team-info"]');
    await expect(teamInfo).toBeVisible();
  });

  test('Multiple contact opportunities should be available throughout page', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Count contact form instances
    const contactForms = page.locator('[data-testid*="contact"]');
    const contactCount = await contactForms.count();
    expect(contactCount).toBeGreaterThanOrEqual(2); // Hero + footer minimum

    // Header contact information
    const headerContact = page.locator('[data-testid="header-contact"]');
    await expect(headerContact).toBeVisible();

    // Footer contact form or information
    const footerContact = page.locator('[data-testid="footer-contact"]');
    await expect(footerContact).toBeVisible();

    // CTA buttons throughout the page
    const ctaButtons = page.locator('[data-testid*="cta"], .cta, [class*="cta"]');
    const ctaCount = await ctaButtons.count();
    expect(ctaCount).toBeGreaterThanOrEqual(3);
  });

  test('Page should load quickly and meet performance standards', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Core Web Vitals - Largest Contentful Paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          if (entries.length > 0) {
            resolve(entries[entries.length - 1].startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        setTimeout(() => resolve(0), 5000); // Fallback
      });
    });

    expect(lcp).toBeLessThan(2500); // Good LCP threshold
  });

  test('Mobile-first responsive design should work on all viewport sizes', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Mobile navigation should be accessible
    const mobileNav = page.locator('[data-testid="mobile-nav-toggle"]');
    await expect(mobileNav).toBeVisible();

    // Contact form should be usable on mobile
    const mobileContactForm = page.locator('[data-testid="contact-form"]');
    await expect(mobileContactForm).toBeVisible();

    // Text should be readable without horizontal scrolling
    const heroText = page.locator('h1');
    const heroBox = await heroText.boundingBox();
    expect(heroBox.width).toBeLessThanOrEqual(375);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();

    // Layout should adapt properly
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();

    // Full navigation should be visible
    const desktopNav = page.locator('[data-testid="desktop-nav"]');
    await expect(desktopNav).toBeVisible();
  });

  test('Brand consistency should be maintained throughout page', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Logo should be properly sized and positioned
    const logo = page.locator('[data-testid="logo"]');
    await expect(logo).toBeVisible();

    // Brand colors should be consistently applied
    const primaryElements = page.locator('.bg-primary-600, .text-primary-600');
    await expect(primaryElements.first()).toBeVisible();

    const secondaryElements = page.locator('.bg-secondary-500, .text-secondary-500');
    await expect(secondaryElements.first()).toBeVisible();

    // Typography consistency
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      await expect(heading).toHaveCSS('font-family', /montserrat/i);
    }

    // Consistent spacing and layout
    const sections = page.locator('section');
    const sectionCount = await sections.count();

    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);
      const sectionBox = await section.boundingBox();
      expect(sectionBox.width).toBeGreaterThan(0);
    }
  });
});