const { test, expect } = require('@playwright/test');

test.describe('Projects API Contract Tests', () => {
  const projectsEndpoint = '/wp-json/historic-equity/v1/projects';

  test.beforeEach(async ({ page }) => {
    // Ensure we're testing against the WordPress API
    await page.goto('/');
  });

  test('GET /wp-json/historic-equity/v1/projects - Should return project list with pagination', async ({ request }) => {
    const response = await request.get(projectsEndpoint);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('success', true);
    expect(responseData).toHaveProperty('projects');
    expect(responseData).toHaveProperty('total');
    expect(responseData).toHaveProperty('pagination');

    // Validate projects array structure
    expect(Array.isArray(responseData.projects)).toBe(true);

    if (responseData.projects.length > 0) {
      const project = responseData.projects[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('location');
      expect(project).toHaveProperty('state');
      expect(project).toHaveProperty('property_type');
      expect(project).toHaveProperty('year_completed');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('featured_image');
      expect(project).toHaveProperty('featured');
      expect(project).toHaveProperty('slug');

      // Validate property_type enum
      expect(['Commercial', 'Residential', 'Industrial', 'Institutional', 'Mixed-Use'])
        .toContain(project.property_type);

      // Validate featured_image structure
      expect(project.featured_image).toHaveProperty('url');
      expect(project.featured_image).toHaveProperty('alt');
      expect(project.featured_image).toHaveProperty('width');
      expect(project.featured_image).toHaveProperty('height');
    }

    // Validate pagination structure
    expect(responseData.pagination).toHaveProperty('current_page');
    expect(responseData.pagination).toHaveProperty('total_pages');
    expect(responseData.pagination).toHaveProperty('has_next');
    expect(responseData.pagination).toHaveProperty('has_previous');
  });

  test('GET /wp-json/historic-equity/v1/projects?state=MO - Should filter by state', async ({ request }) => {
    const response = await request.get(`${projectsEndpoint}?state=MO`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // All returned projects should be from Missouri
    responseData.projects.forEach(project => {
      expect(project.state).toBe('MO');
    });
  });

  test('GET /wp-json/historic-equity/v1/projects?property_type=Commercial - Should filter by property type', async ({ request }) => {
    const response = await request.get(`${projectsEndpoint}?property_type=Commercial`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // All returned projects should be Commercial properties
    responseData.projects.forEach(project => {
      expect(project.property_type).toBe('Commercial');
    });
  });

  test('GET /wp-json/historic-equity/v1/projects?featured=true - Should return only featured projects', async ({ request }) => {
    const response = await request.get(`${projectsEndpoint}?featured=true`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // All returned projects should be featured
    responseData.projects.forEach(project => {
      expect(project.featured).toBe(true);
    });
  });

  test('GET /wp-json/historic-equity/v1/projects?limit=5 - Should respect limit parameter', async ({ request }) => {
    const response = await request.get(`${projectsEndpoint}?limit=5`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.projects.length).toBeLessThanOrEqual(5);
  });

  test('GET /wp-json/historic-equity/v1/projects?limit=100 - Should enforce maximum limit', async ({ request }) => {
    const response = await request.get(`${projectsEndpoint}?limit=100`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.projects.length).toBeLessThanOrEqual(50); // Max limit should be 50
  });

  test('GET /wp-json/historic-equity/v1/projects?offset=10 - Should handle pagination offset', async ({ request }) => {
    const firstPageResponse = await request.get(projectsEndpoint);
    const secondPageResponse = await request.get(`${projectsEndpoint}?offset=10`);

    // This test MUST FAIL initially (TDD requirement)
    expect(firstPageResponse.status()).toBe(200);
    expect(secondPageResponse.status()).toBe(200);

    const firstPageData = await firstPageResponse.json();
    const secondPageData = await secondPageResponse.json();

    // Projects should be different (if there are enough projects)
    if (firstPageData.total > 10) {
      const firstPageIds = firstPageData.projects.map(p => p.id);
      const secondPageIds = secondPageData.projects.map(p => p.id);

      // Should have no overlap
      const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
      expect(overlap.length).toBe(0);
    }
  });

  test('GET /wp-json/historic-equity/v1/projects - Should return performance metadata', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(projectsEndpoint);
    const endTime = Date.now();

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    // API should respond within 1 second for good performance
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(1000);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // Response should include proper headers for caching
    const headers = response.headers();
    expect(headers).toHaveProperty('cache-control');
  });

  test('GET /wp-json/historic-equity/v1/projects - Should handle empty results gracefully', async ({ request }) => {
    const response = await request.get(`${projectsEndpoint}?state=XX`); // Invalid state

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.projects).toEqual([]);
    expect(responseData.total).toBe(0);
    expect(responseData.pagination.total_pages).toBe(0);
  });

  test('GET /wp-json/historic-equity/v1/projects - Should validate query parameters', async ({ request }) => {
    // Test invalid property_type
    const invalidPropertyResponse = await request.get(`${projectsEndpoint}?property_type=InvalidType`);

    // This test MUST FAIL initially (TDD requirement)
    expect(invalidPropertyResponse.status()).toBe(400);

    const invalidPropertyData = await invalidPropertyResponse.json();
    expect(invalidPropertyData.success).toBe(false);
    expect(invalidPropertyData.message).toContain('Invalid property_type');
  });
});