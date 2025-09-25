# GitHub Copilot Instructions - Historic Equity Inc.

## Project Overview
Complete WordPress website redesign for Historic Equity Inc., a State Historic Tax Credit (SHTC) investor specializing in maximizing benefits to owners of historic rehabilitation projects.

**Repository**: https://github.com/ateezie/histeq.com
**Last updated**: 2025-09-17

## Technology Stack
- **WordPress**: 6.8.2 + Timber v2.x (Twig templating)
- **Frontend**: TailwindCSS + FlyntWP component framework
- **Build**: Webpack, PostCSS, Babel
- **Development**: Docker, PHP 8.x, MySQL 8.0

## Code Style & Conventions

### WordPress + Timber Patterns
```php
// Use Timber context patterns
$context = Timber::context();
$context['posts'] = new Timber\PostQuery();
Timber::render('archive.twig', $context);

// Component-based Twig includes
{% include 'components/header.twig' %}
{% include 'components/footer.twig' %}
```

### TailwindCSS Utility Classes
```html
<!-- Historic Equity brand colors -->
<div class="bg-primary-orange text-off-white">
<button class="bg-primary-gold hover:bg-primary-brown">
<section class="bg-light-blue text-dark-navy">
```

### File Organization
```
wp-content/themes/historic-equity/
├── Components/           # FlyntWP components
├── lib/                 # Timber/Twig functions
├── templates/           # Twig templates
├── static/             # Assets (CSS, JS, images)
├── functions.php       # WordPress functions
└── style.css          # Theme stylesheet
```

## Brand System Implementation

### Color Palette (TailwindCSS Variables)
- `primary-orange`: #BD572B (189, 87, 43)
- `primary-gold`: #E6CD41 (230, 205, 65)
- `primary-brown`: #95816E (149, 129, 110)
- `light-blue`: #83ACD1 (131, 172, 209)
- `off-white`: #FEFFF8 (254, 255, 248)
- `dark-navy`: #2D2E3D (45, 46, 61)

### Typography System
- **Headings**: font-montserrat font-bold
- **Subheadings**: font-sportscenter
- **Body**: font-montserrat font-normal
- **Quotes**: font-montserrat italic

## Development Guidelines

### Component Creation
1. Follow FlyntWP component structure
2. Use Timber context for data passing
3. Implement mobile-first responsive design
4. Include proper accessibility attributes

### WordPress Best Practices
- Use WordPress hooks and filters appropriately
- Sanitize all user inputs
- Follow WordPress coding standards
- Use Timber for templating, avoid direct PHP in templates

### Security Requirements
- Never expose sensitive data in templates
- Validate and sanitize all form inputs
- Use WordPress nonces for form security
- Follow WordPress security best practices

## Recent Features & Context
- Phase 1 Complete: Header/footer system with brand compliance
- TailwindCSS integration with Historic Equity design system
- Responsive navigation with hamburger menu
- Logo implementation (black/white variants)
- Bootstrap conflict resolution

## Task Integration
This project uses Archon MCP for task management. When implementing features:
1. Check current tasks in project management system
2. Research patterns before implementing
3. Follow established component patterns
4. Update task status upon completion

## Business Context
- **Founded**: 2001, St. Louis, MO
- **Focus**: State Historic Tax Credit investment
- **Coverage**: 17+ states, $1B+ QRE, 200+ projects
- **Brand**: Professional, trustworthy, innovation meets heritage

## Common Patterns

### Twig Template Structure
```twig
{# components/header.twig #}
<header class="bg-primary-orange">
  <nav class="container mx-auto">
    {% include 'components/logo.twig' %}
    {% include 'components/navigation.twig' %}
  </nav>
</header>
```

### WordPress Function Registration
```php
// functions.php
add_action('wp_enqueue_scripts', 'historic_equity_scripts');
add_action('after_setup_theme', 'historic_equity_setup');
add_filter('timber/context', 'add_to_context');
```

### Responsive Component Classes
```html
<!-- Mobile-first responsive patterns -->
<div class="block md:hidden"> <!-- Mobile only -->
<div class="hidden md:block"> <!-- Desktop only -->
<div class="grid grid-cols-1 md:grid-cols-3"> <!-- Responsive grid -->
```

## Quality Standards
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- Page load times under 3 seconds
- SEO optimized markup

## Integration Notes
- Use existing component patterns in `Components/` directory
- Follow Timber context passing conventions
- Maintain brand color consistency
- Test across devices and browsers
- Document new components and patterns