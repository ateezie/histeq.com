const { test, expect } = require('@playwright/test');

test.describe('Project Showcase Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/projects'); // Assuming projects page exists
  });

  test('Projects page should display modern grid layout with filtering', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Page should load successfully
    await expect(page).toHaveTitle(/Projects|Portfolio|Historic Equity/);

    // Projects grid should be visible
    const projectsGrid = page.locator('[data-testid="projects-grid"]');
    await expect(projectsGrid).toBeVisible();

    // Filter controls should be present
    const filterControls = page.locator('[data-testid="project-filters"]');
    await expect(filterControls).toBeVisible();

    // State filter dropdown
    const stateFilter = page.locator('[data-testid="state-filter"]');
    await expect(stateFilter).toBeVisible();

    // Property type filter
    const propertyTypeFilter = page.locator('[data-testid="property-type-filter"]');
    await expect(propertyTypeFilter).toBeVisible();

    // Project cards should be visible
    const projectCards = page.locator('[data-testid="project-card"]');
    await expect(projectCards.first()).toBeVisible();
  });

  test('Project cards should display key information with modern design', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const projectCards = page.locator('[data-testid="project-card"]');
    const firstCard = projectCards.first();
    await expect(firstCard).toBeVisible();

    // Each card should have essential elements
    await expect(firstCard.locator('[data-testid="project-image"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="project-title"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="project-location"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="property-type"]')).toBeVisible();

    // Investment information (if available)
    const investmentInfo = firstCard.locator('[data-testid="investment-amount"], [data-testid="tax-credits"]');
    if (await investmentInfo.count() > 0) {
      await expect(investmentInfo.first()).toBeVisible();
    }

    // Hover effects for modern interaction
    await firstCard.hover();
    await expect(firstCard).toHaveCSS('transition-duration', /\d+ms/);

    // Card should be clickable
    await expect(firstCard).toHaveAttribute('href', /.+/);
  });

  test('State filtering should work dynamically with visual feedback', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const stateFilter = page.locator('[data-testid="state-filter"]');
    await expect(stateFilter).toBeVisible();

    // Get initial project count
    const initialProjects = page.locator('[data-testid="project-card"]');
    const initialCount = await initialProjects.count();

    // Select Missouri filter
    await stateFilter.selectOption('MO');

    // Wait for filtering to complete
    await page.waitForTimeout(500);

    // Check that filtering occurred
    const filteredProjects = page.locator('[data-testid="project-card"]');
    const filteredCount = await filteredProjects.count();

    // All visible projects should be from Missouri
    for (let i = 0; i < filteredCount; i++) {
      const projectCard = filteredProjects.nth(i);
      const location = projectCard.locator('[data-testid="project-location"]');
      await expect(location).toContainText('MO');
    }

    // Filter indicator should show active state
    const activeFilter = page.locator('[data-testid="active-filter"]');
    await expect(activeFilter).toContainText('Missouri|MO');

    // Clear filters should work
    const clearFilters = page.locator('[data-testid="clear-filters"]');
    if (await clearFilters.isVisible()) {
      await clearFilters.click();
      await page.waitForTimeout(500);

      const resetProjects = page.locator('[data-testid="project-card"]');
      const resetCount = await resetProjects.count();
      expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
    }
  });

  test('Property type filtering should update results correctly', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const propertyTypeFilter = page.locator('[data-testid="property-type-filter"]');
    await expect(propertyTypeFilter).toBeVisible();

    // Select Commercial properties
    await propertyTypeFilter.selectOption('Commercial');
    await page.waitForTimeout(500);

    // All visible projects should be Commercial
    const commercialProjects = page.locator('[data-testid="project-card"]');
    const commercialCount = await commercialProjects.count();

    for (let i = 0; i < commercialCount; i++) {
      const projectCard = commercialProjects.nth(i);
      const propertyType = projectCard.locator('[data-testid="property-type"]');
      await expect(propertyType).toContainText('Commercial');
    }

    // Try Residential filter
    await propertyTypeFilter.selectOption('Residential');
    await page.waitForTimeout(500);

    const residentialProjects = page.locator('[data-testid="project-card"]');
    const residentialCount = await residentialProjects.count();

    for (let i = 0; i < residentialCount; i++) {
      const projectCard = residentialProjects.nth(i);
      const propertyType = projectCard.locator('[data-testid="property-type"]');
      await expect(propertyType).toContainText('Residential');
    }
  });

  test('Responsive grid should adapt to different screen sizes', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const projectsGrid = page.locator('[data-testid="projects-grid"]');

    // Desktop view (3-4 columns)
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    await expect(projectsGrid).toBeVisible();

    // Check grid columns on desktop
    const desktopColumns = await projectsGrid.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.gridTemplateColumns;
    });
    expect(desktopColumns).toMatch(/repeat\(3|repeat\(4|1fr 1fr 1fr/);

    // Tablet view (2 columns)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(projectsGrid).toBeVisible();

    const tabletColumns = await projectsGrid.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.gridTemplateColumns;
    });
    expect(tabletColumns).toMatch(/repeat\(2|1fr 1fr/);

    // Mobile view (1 column)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(projectsGrid).toBeVisible();

    const mobileColumns = await projectsGrid.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.gridTemplateColumns;
    });
    expect(mobileColumns).toMatch(/1fr|none/);
  });

  test('Project images should be optimized and responsive', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const projectImages = page.locator('[data-testid="project-image"] img');
    const firstImage = projectImages.first();
    await expect(firstImage).toBeVisible();

    // Images should have proper alt text
    const altText = await firstImage.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText.length).toBeGreaterThan(10);

    // Images should be responsive
    await expect(firstImage).toHaveCSS('max-width', '100%');

    // Images should have srcset for responsive loading
    const srcset = await firstImage.getAttribute('srcset');
    if (srcset) {
      expect(srcset).toContain('w,'); // Contains width descriptors
    }

    // Images should load properly
    const imageLoaded = await firstImage.evaluate(img => img.complete && img.naturalHeight !== 0);
    expect(imageLoaded).toBe(true);

    // Lazy loading should be implemented
    const loading = await firstImage.getAttribute('loading');
    expect(loading).toBe('lazy');
  });

  test('Pagination should work for large project sets', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Check if pagination is present
    const pagination = page.locator('[data-testid="pagination"]');

    if (await pagination.isVisible()) {
      // Test next page functionality
      const nextButton = page.locator('[data-testid="next-page"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // URL should update with page parameter
        const url = page.url();
        expect(url).toContain('page=2');

        // Different projects should be visible
        const secondPageProjects = page.locator('[data-testid="project-card"]');
        await expect(secondPageProjects.first()).toBeVisible();
      }

      // Test previous page functionality
      const prevButton = page.locator('[data-testid="prev-page"]');
      if (await prevButton.isVisible()) {
        await prevButton.click();
        await page.waitForTimeout(500);

        const url = page.url();
        expect(url).not.toContain('page=2');
      }
    }
  });

  test('Loading states should provide good user experience', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Test filter loading state
    const stateFilter = page.locator('[data-testid="state-filter"]');
    await stateFilter.selectOption('MO');

    // Loading indicator should appear briefly
    const loadingIndicator = page.locator('[data-testid="loading-projects"]');
    // Note: This might be very brief, so we just check if it exists in DOM

    await page.waitForTimeout(1000);

    // Projects should be visible after loading
    const projects = page.locator('[data-testid="project-card"]');
    await expect(projects.first()).toBeVisible();

    // Loading indicator should be hidden
    await expect(loadingIndicator).toBeHidden();
  });

  test('Empty states should be handled gracefully', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Filter to a combination that should return no results
    const stateFilter = page.locator('[data-testid="state-filter"]');
    const propertyTypeFilter = page.locator('[data-testid="property-type-filter"]');

    await stateFilter.selectOption('XX'); // Invalid state
    await page.waitForTimeout(500);

    // Empty state message should be displayed
    const emptyState = page.locator('[data-testid="no-projects-found"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText(/no projects found|no results|try different filters/i);

    // Suggestion to modify filters
    const filterSuggestion = page.locator('[data-testid="filter-suggestion"]');
    await expect(filterSuggestion).toBeVisible();

    // Clear filters option should be available
    const clearFilters = page.locator('[data-testid="clear-filters"]');
    await expect(clearFilters).toBeVisible();
  });

  test('Accessibility features should be implemented', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Filter controls should be keyboard accessible
    const stateFilter = page.locator('[data-testid="state-filter"]');
    await stateFilter.focus();
    await expect(stateFilter).toBeFocused();

    // Project cards should be keyboard navigable
    const firstProjectCard = page.locator('[data-testid="project-card"]').first();
    await firstProjectCard.focus();
    await expect(firstProjectCard).toBeFocused();

    // Press Tab to navigate to next project
    await page.keyboard.press('Tab');
    const secondProjectCard = page.locator('[data-testid="project-card"]').nth(1);
    await expect(secondProjectCard).toBeFocused();

    // ARIA labels should be present
    await expect(stateFilter).toHaveAttribute('aria-label', /.+/);
    await expect(firstProjectCard).toHaveAttribute('aria-label', /.+/);

    // Screen reader announcements for filter changes
    const filterRegion = page.locator('[data-testid="project-filters"]');
    await expect(filterRegion).toHaveAttribute('aria-live', 'polite');
  });

  test('Performance should meet standards for image-heavy content', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const startTime = Date.now();
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds even with images
    expect(loadTime).toBeLessThan(3000);

    // Images should be progressively loaded
    const images = page.locator('[data-testid="project-image"] img');
    const imageCount = await images.count();

    // Not all images should load immediately (lazy loading)
    let loadedImages = 0;
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const isLoaded = await img.evaluate(img => img.complete);
      if (isLoaded) loadedImages++;
    }

    // Only visible images should be loaded initially
    expect(loadedImages).toBeLessThan(imageCount);

    // Scroll to trigger lazy loading
    await page.locator('[data-testid="projects-grid"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // More images should be loaded after scrolling
    let loadedAfterScroll = 0;
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const isLoaded = await img.evaluate(img => img.complete);
      if (isLoaded) loadedAfterScroll++;
    }

    expect(loadedAfterScroll).toBeGreaterThanOrEqual(loadedImages);
  });
});