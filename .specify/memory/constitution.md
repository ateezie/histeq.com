# Historic Equity WordPress Constitution

## Core Principles

### I. WordPress Standards Compliance (NON-NEGOTIABLE)
- All code MUST follow WordPress Coding Standards (WPCS)
- Use WordPress native functions over custom implementations
- Sanitize all input, escape all output (WordPress security fundamentals)
- Proper use of WordPress hooks (actions/filters) for extensibility
- No direct database queries - use WordPress APIs (WP_Query, get_posts, etc.)

### II. Security-First Development (NON-NEGOTIABLE)
- All user input MUST be sanitized using WordPress functions
- All output MUST be escaped using appropriate WordPress escape functions
- Use nonces for form submissions and AJAX requests
- Capability checks required for all administrative functions
- No eval() or similar unsafe functions permitted

### III. Performance & Optimization (NON-NEGOTIABLE)
- Enqueue scripts/styles properly using WordPress functions
- Minimize database queries - use object caching where appropriate
- Optimize images and assets for web delivery
- Use WordPress transients for expensive operations
- Follow WordPress best practices for pagination and query optimization

### IV. Accessibility Compliance (NON-NEGOTIABLE)
- WCAG 2.1 AA compliance mandatory
- Semantic HTML structure required
- Proper ARIA labels and descriptions
- Keyboard navigation support
- Color contrast ratio compliance (4.5:1 minimum)

### V. Mobile-First & Responsive Design (NON-NEGOTIABLE)
- All layouts MUST be responsive
- Touch-friendly interface elements (44px minimum touch targets)
- Fast loading on mobile devices
- Progressive enhancement principles
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

## WordPress Development Constraints

### Theme Structure Requirements
- Custom theme MUST follow WordPress theme hierarchy
- All template files properly named per WordPress conventions
- Theme MUST support WordPress features: post-thumbnails, menus, widgets
- No hardcoded paths - use WordPress URL functions
- Child theme compatible structure

### Plugin Development Standards
- All custom functionality as plugins, not theme functions
- Plugin headers and metadata properly formatted
- Activation/deactivation hooks properly implemented
- Uninstall procedures to clean up database
- No theme-dependent plugins

### Content Management Requirements
- Custom post types MUST use WordPress registration functions
- Custom fields via Advanced Custom Fields (ACF) or WordPress native
- Taxonomies properly registered and implemented
- Media handling through WordPress Media Library
- SEO optimization through WordPress SEO plugins

## Development Workflow

### Code Quality Gates
- WordPress Coding Standards (phpcs) MUST pass
- PHP syntax validation required
- Template validation against WordPress requirements
- Accessibility testing mandatory before deployment
- Cross-browser testing on minimum 4 browsers

### Testing Requirements
- Unit tests for all custom PHP functions
- Integration tests for WordPress hooks and filters
- User acceptance testing for all features
- Performance testing on staging environment
- Security scanning with WordPress-specific tools

### Deployment Standards
- Staging environment MUST mirror production
- Database migrations handled through WordPress updates
- File permissions properly configured (644/755)
- WordPress debug mode disabled in production
- Regular WordPress core and plugin updates

## Governance

### Constitution Authority
- These standards supersede all other development practices
- Any deviation requires documented justification and approval
- Regular compliance audits mandatory
- All team members must acknowledge understanding

### Amendment Process
- Constitution changes require team consensus
- All amendments must be documented with rationale
- Migration plan required for breaking changes
- Version control for all constitution updates

**Version**: 1.0.0 | **Ratified**: 2025-01-17 | **Last Amended**: 2025-01-17