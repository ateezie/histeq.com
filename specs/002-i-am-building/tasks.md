# Tasks: Lead-Generating WordPress Theme for Historic Equity Inc.

**Input**: Design documents from `/specs/002-i-am-building/`
**Prerequisites**: plan.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓), quickstart.md (✓)
**Context**: Modern, sleek UI/UX design reflecting Historic Equity's State Historic Tax Credit investment industry

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: WordPress 6.8.2 + Timber v2.x + FlyntWP + TailwindCSS
   → Structure: wp-content/themes/historic-equity/ with Components/, templates/, static/, lib/
2. Load design documents ✓:
   → data-model.md: 5 entities (Contact Lead, Project Showcase, Service Info, State Coverage, Company Profile)
   → contracts/: contact-form-api.md, projects-api.md
   → research.md: WordPress + Timber + FlyntWP + TailwindCSS architecture decisions
3. Generate tasks by category ✓:
   → Setup: WordPress theme structure, dependencies, build tools
   → Tests: API contract tests, Playwright UI tests, performance tests
   → Core: Custom post types, Timber contexts, FlyntWP components, TailwindCSS styling
   → Integration: Contact forms, project showcase, responsive design
   → Polish: SEO optimization, accessibility compliance, performance optimization
4. Apply task rules ✓:
   → Different files = [P] for parallel execution
   → TDD approach: tests before implementation
   → UI/UX focus: modern, sleek design reflecting SHTC investment industry
```

## Path Conventions
WordPress theme structure at `wp-content/themes/historic-equity/`:
- `Components/` - FlyntWP component files
- `templates/` - Twig template files
- `static/` - CSS, JS, images, fonts
- `lib/` - PHP utility functions
- `tests/` - Playwright and PHP tests

## Phase 3.1: Setup & Foundation

- [ ] **T001** Create WordPress theme directory structure per FlyntWP conventions at `wp-content/themes/historic-equity/`
- [ ] **T002** Initialize Composer dependencies (Timber v2.x, FlyntWP) in `composer.json`
- [ ] **T003** [P] Configure Node.js build pipeline with Webpack, TailwindCSS, PostCSS, Babel in `package.json`
- [ ] **T004** [P] Set up brand color system in `tailwind.config.js` (#BD572B orange, #E6CD41 gold, #83ACD1 blue, #2D2E3D navy)
- [ ] **T005** [P] Configure Playwright testing environment in `tests/playwright.config.js`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Contract Tests
- [ ] **T006** [P] Contact form API contract test for POST `/wp-json/historic-equity/v1/contact` in `tests/api/contact-form.spec.js`
- [ ] **T007** [P] Projects API contract test for GET `/wp-json/historic-equity/v1/projects` in `tests/api/projects.spec.js`
- [ ] **T008** [P] Projects single API contract test for GET `/wp-json/historic-equity/v1/projects/{id}` in `tests/api/project-single.spec.js`

### UI/UX Integration Tests
- [ ] **T009** [P] Homepage lead generation flow test in `tests/ui/homepage-leads.spec.js`
- [ ] **T010** [P] Project showcase responsive design test in `tests/ui/projects-showcase.spec.js`
- [ ] **T011** [P] Contact form validation and submission test in `tests/ui/contact-forms.spec.js`
- [ ] **T012** [P] Mobile navigation and accessibility test in `tests/ui/mobile-navigation.spec.js`
- [ ] **T013** [P] Brand compliance and visual regression test in `tests/ui/brand-compliance.spec.js`

### Performance & Accessibility Tests
- [ ] **T014** [P] Core Web Vitals performance test (<3s load time) in `tests/performance/core-web-vitals.spec.js`
- [ ] **T015** [P] WCAG 2.1 AA accessibility compliance test in `tests/accessibility/wcag-compliance.spec.js`

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### WordPress Foundation
- [ ] **T016** [P] Create theme setup and WordPress hooks in `functions.php`
- [ ] **T017** [P] Initialize Timber context and custom post types in `lib/theme-setup.php`
- [ ] **T018** [P] Configure WordPress customizer for brand colors in `lib/customizer.php`

### Data Models & Custom Post Types
- [ ] **T019** [P] Contact Lead custom post type and meta fields in `lib/post-types/contact-lead.php`
- [ ] **T020** [P] Project Showcase custom post type and meta fields in `lib/post-types/project-showcase.php`
- [ ] **T021** [P] Service Information custom post type and meta fields in `lib/post-types/service-info.php`
- [ ] **T022** [P] State Coverage custom post type and meta fields in `lib/post-types/state-coverage.php`
- [ ] **T023** [P] Company Profile custom post type and meta fields in `lib/post-types/company-profile.php`

### API Endpoints Implementation
- [ ] **T024** Contact form submission API endpoint in `lib/api/contact-form-endpoint.php`
- [ ] **T025** Projects showcase API endpoint in `lib/api/projects-endpoint.php`
- [ ] **T026** Single project API endpoint in `lib/api/project-single-endpoint.php`

### FlyntWP Components - Modern UI/UX Design
- [ ] **T027** [P] Hero section component with modern design and lead capture CTA in `Components/HeroSection/`
- [ ] **T028** [P] Header component with sleek navigation and brand integration in `Components/Header/`
- [ ] **T029** [P] Footer component with professional contact information in `Components/Footer/`
- [ ] **T030** [P] Contact form component with modern styling and validation in `Components/ContactForm/`
- [ ] **T031** [P] Project showcase grid component with filtering in `Components/ProjectShowcase/`
- [ ] **T032** [P] Service information cards component with industry-appropriate design in `Components/ServiceCards/`
- [ ] **T033** [P] State coverage map component with interactive elements in `Components/StateCoverage/`
- [ ] **T034** [P] Testimonials component with professional presentation in `Components/Testimonials/`

### Twig Templates - Responsive Design
- [ ] **T035** Homepage template with lead generation optimization in `templates/index.twig`
- [ ] **T036** Projects archive template with filtering interface in `templates/archive-project_showcase.twig`
- [ ] **T037** Single project template with detailed showcase in `templates/single-project_showcase.twig`
- [ ] **T038** About/Services template with trust-building elements in `templates/page-about.twig`
- [ ] **T039** Contact template with multiple contact options in `templates/page-contact.twig`

## Phase 3.4: Integration & Styling

### TailwindCSS Modern Styling
- [ ] **T040** Global typography system with Montserrat + Sportscenter fonts in `static/scss/_typography.scss`
- [ ] **T041** Responsive grid system and layout utilities in `static/scss/_layout.scss`
- [ ] **T042** Component-specific modern styling for Historic Equity brand in `static/scss/_components.scss`
- [ ] **T043** Mobile-first responsive design implementation in `static/scss/_responsive.scss`

### WordPress Integration
- [ ] **T044** Timber context integration for all custom post types in `lib/timber-context.php`
- [ ] **T045** WordPress menu integration with FlyntWP navigation in `lib/menu-integration.php`
- [ ] **T046** WordPress media library integration for project galleries in `lib/media-integration.php`
- [ ] **T047** Form submission processing and email notifications in `lib/form-processing.php`

### Advanced Features
- [ ] **T048** State-based project filtering with AJAX in `static/js/project-filtering.js`
- [ ] **T049** Contact form AJAX submission with validation in `static/js/contact-forms.js`
- [ ] **T050** Mobile navigation hamburger menu functionality in `static/js/mobile-navigation.js`
- [ ] **T051** Image lazy loading and optimization for performance in `static/js/image-optimization.js`

## Phase 3.5: Polish & Optimization

### SEO & Performance
- [ ] **T052** [P] SEO metadata and structured data implementation in `lib/seo-optimization.php`
- [ ] **T053** [P] Image optimization and WebP conversion in `lib/image-optimization.php`
- [ ] **T054** [P] CSS/JS minification and caching optimization in `webpack.config.js`
- [ ] **T055** [P] Database query optimization for custom post types in `lib/query-optimization.php`

### Accessibility & Cross-browser
- [ ] **T056** [P] ARIA labels and keyboard navigation implementation in `static/js/accessibility.js`
- [ ] **T057** [P] Cross-browser compatibility testing and fixes in `static/scss/_browser-compatibility.scss`
- [ ] **T058** [P] Screen reader optimization for content structure in `templates/partials/accessibility.twig`

### Final Testing & Documentation
- [ ] **T059** [P] Manual testing following quickstart.md validation procedures
- [ ] **T060** [P] Performance optimization to meet <3s load time requirement
- [ ] **T061** [P] Brand compliance final review and adjustments
- [ ] **T062** Documentation update for theme customization in `README.md`

## Dependencies

### Critical Dependencies
- Setup (T001-T005) before all tests and implementation
- Tests (T006-T015) before ANY implementation (T016+)
- Custom post types (T019-T023) before API endpoints (T024-T026)
- FlyntWP components (T027-T034) before Twig templates (T035-T039)
- Styling (T040-T043) can run parallel with component development

### File Dependencies
- T024 blocks T047 (form processing)
- T019 blocks T024 (contact lead post type needed for form endpoint)
- T020 blocks T025-T026 (project post type needed for project endpoints)
- T027-T034 block T035-T039 (components needed for templates)

## Parallel Execution Examples

### Phase 3.2 - All Tests (Launch Together)
```bash
# API Contract Tests
Task: "Contact form API contract test for POST /wp-json/historic-equity/v1/contact in tests/api/contact-form.spec.js"
Task: "Projects API contract test for GET /wp-json/historic-equity/v1/projects in tests/api/projects.spec.js"
Task: "Projects single API contract test for GET /wp-json/historic-equity/v1/projects/{id} in tests/api/project-single.spec.js"

# UI/UX Tests
Task: "Homepage lead generation flow test in tests/ui/homepage-leads.spec.js"
Task: "Project showcase responsive design test in tests/ui/projects-showcase.spec.js"
Task: "Contact form validation and submission test in tests/ui/contact-forms.spec.js"
```

### Phase 3.3 - Custom Post Types (Launch Together)
```bash
Task: "Contact Lead custom post type and meta fields in lib/post-types/contact-lead.php"
Task: "Project Showcase custom post type and meta fields in lib/post-types/project-showcase.php"
Task: "Service Information custom post type and meta fields in lib/post-types/service-info.php"
Task: "State Coverage custom post type and meta fields in lib/post-types/state-coverage.php"
Task: "Company Profile custom post type and meta fields in lib/post-types/company-profile.php"
```

### Phase 3.3 - FlyntWP Components (Launch Together)
```bash
Task: "Hero section component with modern design and lead capture CTA in Components/HeroSection/"
Task: "Header component with sleek navigation and brand integration in Components/Header/"
Task: "Footer component with professional contact information in Components/Footer/"
Task: "Contact form component with modern styling and validation in Components/ContactForm/"
Task: "Project showcase grid component with filtering in Components/ProjectShowcase/"
```

## UI/UX Design Focus Areas

### Modern & Sleek Design Requirements
1. **Professional Color Scheme**: Historic Equity brand colors with proper contrast ratios
2. **Clean Typography**: Montserrat + Sportscenter font system for readability and brand consistency
3. **Responsive Grid**: Mobile-first approach with TailwindCSS utilities
4. **Micro-interactions**: Subtle hover effects and transitions for modern feel
5. **Visual Hierarchy**: Clear information architecture for lead generation optimization

### Industry-Appropriate Elements
1. **Trust Indicators**: Professional project showcases with financial outcomes
2. **Credibility Markers**: Company background, team expertise, certifications
3. **Social Proof**: Client testimonials and successful project examples
4. **Clear CTAs**: Strategic contact form placement throughout user journey
5. **Educational Content**: SHTC process explanations with professional presentation

## Validation Checklist

✅ **All contracts have corresponding tests**: T006-T008 cover contact-form-api.md and projects-api.md
✅ **All entities have model tasks**: T019-T023 cover all 5 data model entities
✅ **All tests come before implementation**: T006-T015 must complete before T016+
✅ **Parallel tasks truly independent**: [P] tasks work on different files/directories
✅ **Each task specifies exact file path**: All tasks include specific file locations
✅ **UI/UX focus integrated**: Modern design requirements built into component tasks
✅ **WordPress theme structure**: Follows FlyntWP conventions and WordPress standards