const { test, expect } = require('@playwright/test');

test.describe('Contact Form Validation and Submission Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact'); // Contact page with main form
  });

  test('Contact form should have modern styling and clear field labels', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const contactForm = page.locator('[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();

    // Form should have professional styling
    await expect(contactForm).toHaveCSS('border-radius', /\d+px/);
    await expect(contactForm).toHaveCSS('box-shadow', /.+/);

    // All required fields should be clearly marked
    const requiredFields = contactForm.locator('input[required], select[required], textarea[required]');
    const requiredCount = await requiredFields.count();
    expect(requiredCount).toBeGreaterThanOrEqual(4); // name, email, location, description

    // Field labels should be clear and descriptive
    await expect(page.locator('label[for="name"]')).toContainText(/name|full name/i);
    await expect(page.locator('label[for="email"]')).toContainText(/email/i);
    await expect(page.locator('label[for="project_location"]')).toContainText(/location|address|city/i);
    await expect(page.locator('label[for="project_description"]')).toContainText(/description|details|project/i);
  });

  test('Form validation should provide clear error messages', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const contactForm = page.locator('[data-testid="contact-form"]');
    const submitButton = contactForm.locator('button[type="submit"]');

    // Try to submit empty form
    await submitButton.click();

    // Validation errors should appear
    const errorMessages = page.locator('[data-testid="validation-error"]');
    await expect(errorMessages.first()).toBeVisible();

    // Required field errors should be specific
    await expect(page.locator('[data-testid="name-error"]')).toContainText(/name.*required/i);
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/email.*required/i);

    // Test invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await submitButton.click();

    await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email|email format/i);

    // Test short project description
    await page.fill('textarea[name="project_description"]', 'Too short');
    await submitButton.click();

    await expect(page.locator('[data-testid="description-error"]')).toContainText(/20 characters|description too short/i);
  });

  test('Field autocomplete and user experience enhancements should work', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const contactForm = page.locator('[data-testid="contact-form"]');

    // Name field should have autocomplete
    const nameField = contactForm.locator('input[name="name"]');
    await expect(nameField).toHaveAttribute('autocomplete', 'name');

    // Email field should have autocomplete
    const emailField = contactForm.locator('input[name="email"]');
    await expect(emailField).toHaveAttribute('autocomplete', 'email');

    // Phone field should have tel input type
    const phoneField = contactForm.locator('input[name="phone"]');
    if (await phoneField.isVisible()) {
      await expect(phoneField).toHaveAttribute('type', 'tel');
      await expect(phoneField).toHaveAttribute('autocomplete', 'tel');
    }

    // Property type should have clear options
    const propertyTypeSelect = contactForm.locator('select[name="property_type"]');
    await expect(propertyTypeSelect).toBeVisible();

    const options = propertyTypeSelect.locator('option');
    await expect(options).toContainText(['Commercial', 'Residential', 'Industrial', 'Institutional', 'Mixed-Use']);

    // Timeline options should be realistic
    const timelineSelect = contactForm.locator('select[name="project_timeline"]');
    await expect(timelineSelect).toBeVisible();

    const timelineOptions = timelineSelect.locator('option');
    await expect(timelineOptions).toContainText(['0-6 months', '6-12 months', '1-2 years', '2+ years']);
  });

  test('Successful form submission should provide confirmation', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const contactForm = page.locator('[data-testid="contact-form"]');

    // Fill out valid form data
    await page.fill('input[name="name"]', 'John Smith');
    await page.fill('input[name="email"]', 'john.smith@example.com');
    await page.fill('input[name="project_location"]', 'St. Louis, MO');
    await page.selectOption('select[name="property_type"]', 'Commercial');
    await page.selectOption('select[name="project_timeline"]', '6-12 months');
    await page.selectOption('select[name="estimated_budget"]', '$1M-$5M');
    await page.fill('textarea[name="project_description"]', 'Historic renovation of 1920s commercial building downtown. Looking for SHTC investment partnership to preserve architectural details while modernizing for mixed-use development.');
    await page.check('input[name="consent_marketing"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Success message should appear
    const successMessage = page.locator('[data-testid="form-success"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/thank you|received|contact you|24 hours/i);

    // Form should be hidden or reset
    const formAfterSubmit = page.locator('[data-testid="contact-form"]');
    const isFormHidden = await formAfterSubmit.isHidden();

    if (!isFormHidden) {
      // If form is still visible, fields should be cleared
      await expect(page.locator('input[name="name"]')).toHaveValue('');
      await expect(page.locator('input[name="email"]')).toHaveValue('');
    }
  });

  test('Form should be accessible with keyboard navigation', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const contactForm = page.locator('[data-testid="contact-form"]');

    // Tab through all form fields
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="name"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]')).toBeFocused();

    await page.keyboard.press('Tab');
    const phoneField = page.locator('input[name="phone"]');
    if (await phoneField.isVisible()) {
      await expect(phoneField).toBeFocused();
      await page.keyboard.press('Tab');
    }

    // Skip to project location
    await expect(page.locator('input[name="project_location"]')).toBeFocused();

    // Continue through all fields to submit button
    const submitButton = contactForm.locator('button[type="submit"]');
    await submitButton.focus();
    await expect(submitButton).toBeFocused();

    // ARIA labels should be present
    await expect(contactForm).toHaveAttribute('aria-label', /.+/);

    // Required fields should be marked for screen readers
    const requiredFields = contactForm.locator('[required]');
    const requiredCount = await requiredFields.count();

    for (let i = 0; i < requiredCount; i++) {
      const field = requiredFields.nth(i);
      await expect(field).toHaveAttribute('aria-required', 'true');
    }
  });

  test('GDPR consent and privacy features should be implemented', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const contactForm = page.locator('[data-testid="contact-form"]');

    // Marketing consent checkbox should be present and unchecked by default
    const consentCheckbox = contactForm.locator('input[name="consent_marketing"]');
    await expect(consentCheckbox).toBeVisible();
    await expect(consentCheckbox).not.toBeChecked();

    // Consent label should be clear about what user agrees to
    const consentLabel = page.locator('label[for="consent_marketing"]');
    await expect(consentLabel).toContainText(/marketing|communications|newsletter|updates/i);

    // Privacy policy link should be present
    const privacyLink = page.locator('[data-testid="privacy-policy-link"]');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toContainText(/privacy policy|privacy/i);

    // Data processing notice should be visible
    const dataNotice = page.locator('[data-testid="data-processing-notice"]');
    await expect(dataNotice).toBeVisible();
    await expect(dataNotice).toContainText(/information|process|contact/i);
  });

  test('Form should work on mobile devices with touch interactions', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    const contactForm = page.locator('[data-testid="contact-form"]');
    await expect(contactForm).toBeVisible();

    // Form should be properly sized for mobile
    const formBox = await contactForm.boundingBox();
    expect(formBox.width).toBeLessThanOrEqual(375);

    // Touch targets should be large enough (44px minimum)
    const submitButton = contactForm.locator('button[type="submit"]');
    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox.height).toBeGreaterThanOrEqual(44);

    // Select dropdowns should work with touch
    const propertyTypeSelect = contactForm.locator('select[name="property_type"]');
    await propertyTypeSelect.tap();
    await propertyTypeSelect.selectOption('Commercial');

    // Text inputs should be properly sized
    const nameField = contactForm.locator('input[name="name"]');
    const nameBox = await nameField.boundingBox();
    expect(nameBox.height).toBeGreaterThanOrEqual(44);

    // Virtual keyboard should not break layout
    await nameField.tap();
    await nameField.fill('Mobile Test User');

    // Form should still be visible after keyboard appears
    await expect(contactForm).toBeVisible();
  });

  test('Multi-step or progressive disclosure should enhance UX', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    const contactForm = page.locator('[data-testid="contact-form"]');

    // Check if form uses progressive disclosure
    const formSteps = page.locator('[data-testid="form-step"]');

    if (await formSteps.count() > 1) {
      // Multi-step form
      const firstStep = formSteps.first();
      await expect(firstStep).toBeVisible();

      // Progress indicator should be present
      const progressIndicator = page.locator('[data-testid="form-progress"]');
      await expect(progressIndicator).toBeVisible();

      // Next button should advance to next step
      const nextButton = page.locator('[data-testid="next-step"]');
      if (await nextButton.isVisible()) {
        await nextButton.click();

        const secondStep = formSteps.nth(1);
        await expect(secondStep).toBeVisible();
      }
    } else {
      // Single-step form with sections
      const formSections = page.locator('[data-testid="form-section"]');

      if (await formSections.count() > 1) {
        // Each section should be clearly delineated
        const firstSection = formSections.first();
        await expect(firstSection).toBeVisible();

        // Section headers should be descriptive
        const sectionHeader = firstSection.locator('h3, .section-title');
        await expect(sectionHeader).toBeVisible();
      }
    }
  });

  test('Form should handle network errors gracefully', async ({ page }) => {
    // This test MUST FAIL initially (TDD requirement)

    // Fill out form
    const contactForm = page.locator('[data-testid="contact-form"]');
    await page.fill('input[name="name"]', 'Network Test');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="project_location"]', 'Test City, MO');
    await page.selectOption('select[name="property_type"]', 'Commercial');
    await page.fill('textarea[name="project_description"]', 'Testing network error handling for the contact form submission process.');

    // Simulate network failure
    await page.route('**/wp-json/historic-equity/v1/contact', route => {
      route.abort('failed');
    });

    // Submit form
    await page.click('button[type="submit"]');

    // Error message should appear
    const errorMessage = page.locator('[data-testid="form-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/error|try again|network|connection/i);

    // Retry button should be available
    const retryButton = page.locator('[data-testid="retry-submission"]');
    await expect(retryButton).toBeVisible();

    // Form data should be preserved
    await expect(page.locator('input[name="name"]')).toHaveValue('Network Test');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });
});