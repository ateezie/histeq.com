const { test, expect } = require('@playwright/test');

test.describe('Single Project API Contract Tests', () => {
  const projectEndpoint = '/wp-json/historic-equity/v1/projects';

  test.beforeEach(async ({ page }) => {
    // Ensure we're testing against the WordPress API
    await page.goto('/');
  });

  test('GET /wp-json/historic-equity/v1/projects/{id} - Should return single project details', async ({ request }) => {
    // First get a list of projects to find a valid ID
    const listResponse = await request.get(projectEndpoint);
    const listData = await listResponse.json();

    if (listData.projects.length === 0) {
      test.skip('No projects available for testing');
    }

    const projectId = listData.projects[0].id;
    const response = await request.get(`${projectEndpoint}/${projectId}`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('success', true);
    expect(responseData).toHaveProperty('project');

    const project = responseData.project;

    // Validate all required project fields
    expect(project).toHaveProperty('id', projectId);
    expect(project).toHaveProperty('title');
    expect(project).toHaveProperty('location');
    expect(project).toHaveProperty('state');
    expect(project).toHaveProperty('property_type');
    expect(project).toHaveProperty('year_completed');
    expect(project).toHaveProperty('description');
    expect(project).toHaveProperty('featured_image');
    expect(project).toHaveProperty('slug');

    // Validate optional fields structure if present
    if (project.investment_amount) {
      expect(typeof project.investment_amount).toBe('string');
    }

    if (project.tax_credits_generated) {
      expect(typeof project.tax_credits_generated).toBe('string');
    }

    if (project.gallery_images) {
      expect(Array.isArray(project.gallery_images)).toBe(true);
      project.gallery_images.forEach(image => {
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('alt');
        expect(image).toHaveProperty('width');
        expect(image).toHaveProperty('height');
      });
    }

    if (project.client_testimonial) {
      expect(typeof project.client_testimonial).toBe('string');
      expect(project).toHaveProperty('client_name');
    }

    if (project.project_highlights) {
      expect(Array.isArray(project.project_highlights)).toBe(true);
    }

    // Validate SEO fields for single project view
    expect(project).toHaveProperty('seo_title');
    expect(project).toHaveProperty('seo_description');

    // Validate related projects
    expect(project).toHaveProperty('related_projects');
    expect(Array.isArray(project.related_projects)).toBe(true);
    expect(project.related_projects.length).toBeGreaterThanOrEqual(0);
    expect(project.related_projects.length).toBeLessThanOrEqual(5);

    // Validate featured image structure
    expect(project.featured_image).toHaveProperty('url');
    expect(project.featured_image).toHaveProperty('alt');
    expect(project.featured_image).toHaveProperty('width');
    expect(project.featured_image).toHaveProperty('height');

    // Validate property type enum
    expect(['Commercial', 'Residential', 'Industrial', 'Institutional', 'Mixed-Use'])
      .toContain(project.property_type);

    // Validate year completed is reasonable
    expect(project.year_completed).toBeGreaterThanOrEqual(2001);
    expect(project.year_completed).toBeLessThanOrEqual(new Date().getFullYear());
  });

  test('GET /wp-json/historic-equity/v1/projects/{id} - Should return 404 for non-existent project', async ({ request }) => {
    const nonExistentId = 999999;
    const response = await request.get(`${projectEndpoint}/${nonExistentId}`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(404);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('success', false);
    expect(responseData).toHaveProperty('message', 'Project not found');
  });

  test('GET /wp-json/historic-equity/v1/projects/{id} - Should return 400 for invalid ID format', async ({ request }) => {
    const invalidId = 'invalid-id';
    const response = await request.get(`${projectEndpoint}/${invalidId}`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(400);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toContain('Invalid project ID');
  });

  test('GET /wp-json/historic-equity/v1/projects/{id} - Should include related projects based on state', async ({ request }) => {
    // Get a project list first
    const listResponse = await request.get(projectEndpoint);
    const listData = await listResponse.json();

    if (listData.projects.length === 0) {
      test.skip('No projects available for testing');
    }

    const projectId = listData.projects[0].id;
    const response = await request.get(`${projectEndpoint}/${projectId}`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    const project = responseData.project;

    if (project.related_projects.length > 0) {
      // Related projects should prefer same state or property type
      project.related_projects.forEach(relatedProject => {
        expect(relatedProject).toHaveProperty('id');
        expect(relatedProject).toHaveProperty('title');
        expect(relatedProject).toHaveProperty('location');
        expect(relatedProject).toHaveProperty('featured_image');

        // Related project should not be the same as the current project
        expect(relatedProject.id).not.toBe(project.id);
      });
    }
  });

  test('GET /wp-json/historic-equity/v1/projects/{id} - Should include proper structured data for SEO', async ({ request }) => {
    // Get a project first
    const listResponse = await request.get(projectEndpoint);
    const listData = await listResponse.json();

    if (listData.projects.length === 0) {
      test.skip('No projects available for testing');
    }

    const projectId = listData.projects[0].id;
    const response = await request.get(`${projectEndpoint}/${projectId}`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    const project = responseData.project;

    // SEO fields should be present and valid
    expect(project.seo_title).toBeTruthy();
    expect(project.seo_title.length).toBeLessThanOrEqual(60);

    if (project.seo_description) {
      expect(project.seo_description.length).toBeLessThanOrEqual(160);
    }

    // Should include proper cache headers for SEO
    const headers = response.headers();
    expect(headers).toHaveProperty('cache-control');
  });

  test('GET /wp-json/historic-equity/v1/projects/{id} - Should handle unpublished projects correctly', async ({ request }) => {
    // This tests the business rule that only published projects are returned
    const unpublishedId = 888888; // Assuming this ID represents an unpublished project
    const response = await request.get(`${projectEndpoint}/${unpublishedId}`);

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(404);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Project not found');
  });

  test('GET /wp-json/historic-equity/v1/projects/{id} - Should return performance optimized response', async ({ request }) => {
    // Get a project first
    const listResponse = await request.get(projectEndpoint);
    const listData = await listResponse.json();

    if (listData.projects.length === 0) {
      test.skip('No projects available for testing');
    }

    const projectId = listData.projects[0].id;

    const startTime = Date.now();
    const response = await request.get(`${projectEndpoint}/${projectId}`);
    const endTime = Date.now();

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(200);

    // Single project API should respond within 500ms
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(500);

    // Response should include proper caching headers
    const headers = response.headers();
    expect(headers).toHaveProperty('cache-control');
    expect(headers).toHaveProperty('etag');
  });
});