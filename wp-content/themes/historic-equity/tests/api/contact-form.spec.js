const { test, expect } = require('@playwright/test');

test.describe('Contact Form API Contract Tests', () => {
  const contactFormEndpoint = '/wp-json/historic-equity/v1/contact';

  test.beforeEach(async ({ page }) => {
    // Ensure we're testing against the WordPress API
    await page.goto('/');
  });

  test('POST /wp-json/historic-equity/v1/contact - Valid submission should return 201', async ({ request }) => {
    const validContactData = {
      name: "John Smith",
      email: "john.smith@example.com",
      project_location: "St. Louis, MO",
      property_type: "Commercial",
      project_timeline: "6-12 months",
      estimated_budget: "$1M-$5M",
      project_description: "Historic renovation of 1920s commercial building downtown. Looking for SHTC investment partnership to preserve architectural details while modernizing for mixed-use development.",
      referral_source: "Google Search",
      consent_marketing: true
    };

    const response = await request.post(contactFormEndpoint, {
      data: validContactData
    });

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(201);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('success', true);
    expect(responseData).toHaveProperty('message');
    expect(responseData).toHaveProperty('lead_id');
    expect(responseData.message).toContain('Thank you for your inquiry');
  });

  test('POST /wp-json/historic-equity/v1/contact - Missing required fields should return 400', async ({ request }) => {
    const invalidContactData = {
      name: "Jane Doe",
      // Missing required email, project_location, property_type, project_description
    };

    const response = await request.post(contactFormEndpoint, {
      data: invalidContactData
    });

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(400);

    const responseData = await response.json();
    expect(responseData).toHaveProperty('success', false);
    expect(responseData).toHaveProperty('message', 'Validation failed');
    expect(responseData).toHaveProperty('errors');
    expect(responseData.errors).toBeInstanceOf(Array);
    expect(responseData.errors.length).toBeGreaterThan(0);
  });

  test('POST /wp-json/historic-equity/v1/contact - Invalid email format should return 400', async ({ request }) => {
    const invalidEmailData = {
      name: "Test User",
      email: "invalid-email-format",
      project_location: "Kansas City, MO",
      property_type: "Residential",
      project_description: "Historic home renovation project with period-appropriate materials and modern amenities."
    };

    const response = await request.post(contactFormEndpoint, {
      data: invalidEmailData
    });

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(400);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.errors.some(error => error.field === 'email')).toBe(true);
  });

  test('POST /wp-json/historic-equity/v1/contact - Invalid property type should return 400', async ({ request }) => {
    const invalidPropertyTypeData = {
      name: "Test User",
      email: "test@example.com",
      project_location: "Columbia, MO",
      property_type: "InvalidType", // Not in enum values
      project_description: "Test project description with minimum required length for validation."
    };

    const response = await request.post(contactFormEndpoint, {
      data: invalidPropertyTypeData
    });

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(400);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.errors.some(error => error.field === 'property_type')).toBe(true);
  });

  test('POST /wp-json/historic-equity/v1/contact - Short project description should return 400', async ({ request }) => {
    const shortDescriptionData = {
      name: "Test User",
      email: "test@example.com",
      project_location: "Springfield, MO",
      property_type: "Industrial",
      project_description: "Too short" // Less than 20 character minimum
    };

    const response = await request.post(contactFormEndpoint, {
      data: shortDescriptionData
    });

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(400);

    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.errors.some(error => error.field === 'project_description')).toBe(true);
  });

  test('POST /wp-json/historic-equity/v1/contact - Rate limiting should prevent spam', async ({ request }) => {
    const contactData = {
      name: "Spam Test",
      email: "spam@example.com",
      project_location: "Test City, MO",
      property_type: "Commercial",
      project_description: "This is a test for rate limiting functionality to prevent spam submissions."
    };

    // Submit multiple requests rapidly
    const requests = Array(5).fill().map(() =>
      request.post(contactFormEndpoint, { data: contactData })
    );

    const responses = await Promise.all(requests);

    // First few should succeed, later ones should be rate limited
    // This test MUST FAIL initially (TDD requirement)
    const rateLimitedResponses = responses.filter(response => response.status() === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  test('POST /wp-json/historic-equity/v1/contact - CSRF protection should reject unauthorized requests', async ({ request }) => {
    const contactData = {
      name: "CSRF Test",
      email: "csrf@example.com",
      project_location: "Security Test, MO",
      property_type: "Institutional",
      project_description: "Testing CSRF protection for contact form submissions."
    };

    // Submit without proper CSRF token
    const response = await request.post(contactFormEndpoint, {
      data: contactData,
      headers: {
        'X-Requested-With': '', // Remove expected header
      }
    });

    // This test MUST FAIL initially (TDD requirement)
    expect(response.status()).toBe(403);
  });
});