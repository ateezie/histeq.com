# Quickstart: Historic Equity Lead-Generation WordPress Theme

## Prerequisites Validation

### Development Environment
```bash
# Verify WordPress installation
wp --version  # Should be 6.8.2 or newer

# Check PHP version
php -v  # Should be 8.0 or newer

# Verify Composer for Timber
composer --version

# Check Node.js for build tools
node -v  # Should be 16.0 or newer
npm -v
```

### WordPress Configuration
```bash
# Activate WordPress debugging
wp config set WP_DEBUG true
wp config set WP_DEBUG_LOG true

# Install required plugins
wp plugin install contact-form-7 --activate
wp plugin install advanced-custom-fields --activate

# Verify theme directory structure
ls -la wp-content/themes/historic-equity/
```

## Theme Installation & Setup

### 1. Theme Activation
```bash
# Navigate to WordPress root
cd wp-content/themes/historic-equity/

# Install Composer dependencies (Timber)
composer install

# Install npm dependencies
npm install

# Build assets
npm run build

# Activate theme
wp theme activate historic-equity
```

### 2. Brand Configuration
```bash
# Set brand colors in Customizer
wp theme mod set primary_orange "#BD572B"
wp theme mod set primary_gold "#E6CD41"
wp theme mod set light_blue "#83ACD1"
wp theme mod set dark_navy "#2D2E3D"

# Upload brand assets
wp media import static/images/logo__black.png --title="Historic Equity Logo Black"
wp media import static/images/logo__white.png --title="Historic Equity Logo White"
```

### 3. Content Setup
```bash
# Create custom post types
wp eval-file lib/custom-post-types.php

# Import sample projects
wp post create --post_type=project_showcase --post_title="Sample Historic Project" --post_status=publish

# Create state coverage pages
wp eval-file scripts/create-state-pages.php

# Set up contact forms
wp eval-file scripts/setup-contact-forms.php
```

## Functional Validation Tests

### Test 1: Homepage Lead Generation Flow
```bash
# Test homepage loads with contact forms
curl -I http://localhost/
# Expected: 200 OK, <3 second response time

# Verify contact form presence
curl -s http://localhost/ | grep -o "contact-form" | wc -l
# Expected: At least 2 contact form instances
```

**Manual Test Steps**:
1. Visit homepage
2. Scroll through content sections
3. Verify CTA buttons are visible and functional
4. Test mobile responsive design
5. Submit test contact form
6. Verify confirmation message appears

**Expected Results**:
- Homepage loads in <3 seconds
- Contact forms present in hero and footer sections
- All CTAs link to contact forms
- Mobile navigation works properly
- Form submission shows success message

### Test 2: Project Showcase Functionality
```bash
# Test projects API endpoint
curl -s http://localhost/wp-json/historic-equity/v1/projects | jq '.projects | length'
# Expected: Returns array of project objects

# Test state filtering
curl -s "http://localhost/wp-json/historic-equity/v1/projects?state=MO" | jq '.projects[0].state'
# Expected: "MO"
```

**Manual Test Steps**:
1. Navigate to projects page
2. Test state filter dropdown
3. Click on individual project
4. Verify project details display
5. Test image gallery functionality

**Expected Results**:
- Projects display in grid layout
- State filtering works correctly
- Individual project pages load properly
- Image galleries are functional
- Related projects suggestions appear

### Test 3: Contact Form Lead Capture
```bash
# Test contact form API
curl -X POST http://localhost/wp-json/historic-equity/v1/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "project_location": "St. Louis, MO",
    "property_type": "Commercial",
    "project_description": "Testing contact form functionality for historic building renovation"
  }'
# Expected: 201 Created with success message
```

**Manual Test Steps**:
1. Fill out contact form with valid data
2. Submit form
3. Verify confirmation message
4. Check admin email for notification
5. Test form validation with invalid data

**Expected Results**:
- Form submits successfully with valid data
- Validation errors shown for invalid inputs
- Admin receives email notification
- Lead data stored in database
- Thank you message displayed to user

### Test 4: Performance & Accessibility
```bash
# Test page load times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost/
# Expected: total_time < 3.0 seconds

# Test responsive images
curl -s http://localhost/ | grep -o "srcset" | wc -l
# Expected: Multiple srcset attributes for responsive images
```

**Manual Test Steps**:
1. Run Lighthouse audit on homepage
2. Test with screen reader
3. Test keyboard navigation
4. Verify color contrast ratios
5. Test on mobile devices

**Expected Results**:
- Lighthouse performance score >90
- Accessibility score >90
- All interactive elements keyboard accessible
- Color contrast meets WCAG 2.1 AA standards
- Mobile experience is optimized

### Test 5: SEO & Content Structure
```bash
# Test structured data
curl -s http://localhost/ | grep -o "application/ld+json" | wc -l
# Expected: At least 1 structured data block

# Test meta tags
curl -s http://localhost/ | grep -o "<meta.*description" | wc -l
# Expected: At least 1 meta description tag
```

**Manual Test Steps**:
1. Verify page titles are descriptive
2. Check meta descriptions are present
3. Test social media sharing
4. Verify structured data markup
5. Test sitemap generation

**Expected Results**:
- All pages have unique, descriptive titles
- Meta descriptions under 160 characters
- Open Graph tags for social sharing
- Valid structured data for organization
- XML sitemap includes all important pages

## Development Workflow Validation

### Build Process Test
```bash
# Test development build
npm run dev
# Expected: Assets compile without errors

# Test production build
npm run build
# Expected: Minified, optimized assets generated

# Test watch mode
npm run watch &
echo "/* test change */" >> static/scss/main.scss
sleep 5
# Expected: Assets automatically recompile
```

### Code Quality Checks
```bash
# PHP syntax check
find . -name "*.php" -exec php -l {} \;
# Expected: No syntax errors

# JavaScript linting
npm run lint
# Expected: No linting errors

# SCSS validation
npm run scss-lint
# Expected: No style errors
```

## Environment-Specific Validation

### Development Environment
- Contact forms send to development email
- Debug mode enabled for troubleshooting
- Source maps available for debugging
- Hot reload for development efficiency

### Staging Environment
- Contact forms send to staging email
- Performance optimizations enabled
- Analytics tracking configured
- SSL certificate installed

### Production Environment
- Contact forms send to production email
- All optimizations enabled
- Error logging configured
- Backup systems active
- CDN integration functional

## Success Criteria Validation

### Lead Generation Metrics
- [ ] Contact forms present on all relevant pages
- [ ] Form completion rate >5% of page visitors
- [ ] Form submission success rate >95%
- [ ] Lead notification delivery <1 minute
- [ ] Mobile form completion rate >80% of desktop

### Performance Metrics
- [ ] Page load time <3 seconds on 3G connection
- [ ] Core Web Vitals pass all thresholds
- [ ] Image optimization reduces file sizes >60%
- [ ] CSS/JS minification reduces file sizes >40%
- [ ] Caching improves repeat visit load times >50%

### Accessibility & SEO Metrics
- [ ] WCAG 2.1 AA compliance verified
- [ ] Lighthouse accessibility score >90
- [ ] All images have appropriate alt text
- [ ] Keyboard navigation functional
- [ ] Search engine indexing confirmed

This quickstart guide validates that all core functionality works as specified and the theme meets performance, accessibility, and business requirements.