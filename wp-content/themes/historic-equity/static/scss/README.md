# Historic Equity Inc. SCSS Styleguide

This comprehensive SCSS styleguide implements the complete design system for Historic Equity Inc. based on the provided design mockups. It includes variables, typography, colors, components, utilities, and WordPress integration.

## File Structure

```
scss/
├── main.scss              # Main entry point (imports all partials)
├── _variables.scss        # All variables (colors, typography, spacing, breakpoints)
├── _typography.scss       # Typography system with responsive scaling
├── _colors.scss          # Color utility classes and brand colors
├── _mixins.scss          # Reusable mixins and functions
├── _components.scss      # UI components (buttons, cards, forms, etc.)
├── _utilities.scss       # Utility classes (spacing, positioning, etc.)
├── _wordpress.scss       # WordPress-specific styling
└── README.md            # This documentation file
```

## Design System Implementation

### Color Palette

Based on the VARIABLES.PNG mockup, the following color families are implemented:

- **Tuscany (Primary Orange)**: `#BD572B` with 7 variations (lightest to darkest)
- **Arrowtown (Gold)**: `#E6CD41` with 7 variations
- **Ronchi (Brown)**: `#95816E` with 7 variations
- **Charade (Navy)**: `#2D2E3D` with 7 variations
- **Polo Blue (Light Blue)**: `#83ACD1` with 7 variations
- **Grayscale**: Complete gray scale from white to black
- **Off-white**: `#FEFFF8` (brand-specific)

### Typography System

Based on the TYPOGRAPHY.PNG mockup:

- **Font Family**: Montserrat for headings and body text
- **Font Weights**: Light (300), Normal (400), Medium (500), Semi Bold (600), Bold (700), Extra Bold (800)
- **Responsive Typography**:
  - Desktop: H1 (72px), H2 (52px), H3 (44px), H4 (36px), H5 (28px), H6 (16px)
  - Mobile: H1 (64px), H2 (40px), H3 (32px), H4 (24px), H5 (20px), H6 (18px)
- **Line Heights**: 120% for headings, 140% for H5-H6, 150% for body text

### Breakpoints

```scss
$breakpoints: (
  xs: 480px,    // Extra small devices
  sm: 768px,    // Tablets
  md: 992px,    // Small desktops
  lg: 1200px,   // Large desktops
  xl: 1400px,   // Extra large
  xxl: 1600px   // Ultra wide
);
```

## Usage Examples

### Colors

```scss
// Brand colors
.text-primary      // Tuscany orange text
.bg-primary        // Tuscany orange background
.text-secondary    // Arrowtown gold text
.bg-secondary      // Arrowtown gold background

// Color variations
.bg-tuscany-light  // Light orange background
.text-charade-dark // Dark navy text
.border-primary    // Orange border
```

### Typography

```scss
// Heading classes
.h1, .h2, .h3, .h4, .h5, .h6  // Responsive headings
.display                       // Extra large display text

// Font weights
.font-light, .font-normal, .font-medium
.font-semibold, .font-bold, .font-extrabold

// Specialized text
.subheading        // Sportscenter font style
.quote             // Italic quote styling
.caption           // Light caption text
.lead              // Large intro paragraph
```

### Components

```scss
// Buttons
.btn               // Base button
.btn--primary      // Primary orange button
.btn--secondary    // Gold button
.btn--outline      // Outline button
.btn--lg, .btn--sm // Size variations

// Cards
.card              // Base card component
.card--brand       // Historic Equity branded card
.card--testimonial // Testimonial card with trust indicators

// Forms
.form-control      // Styled form inputs
.form-label        // Styled form labels
.form-group        // Form field grouping
```

### Utilities

```scss
// Spacing
.m-4, .p-6, .mx-auto    // Margin and padding utilities
.mt-8, .mb-12           // Directional spacing

// Layout
.d-flex, .d-grid        // Display utilities
.justify-center         // Flexbox alignment
.grid-cols-3           // Grid columns

// Responsive
.d-mobile-none         // Hide on mobile
.text-lg@tablet        // Large text on tablet+
```

## WordPress Integration

The `_wordpress.scss` file provides comprehensive styling for:

- **Gutenberg Blocks**: All core WordPress blocks with brand styling
- **Widgets**: Sidebar widgets with consistent styling
- **Comments**: Complete comment system styling
- **Navigation**: WordPress navigation blocks and menus
- **Post Formats**: Special styling for different post formats
- **Accessibility**: Screen reader and focus styles

## Compilation

To compile the SCSS files, you can use any SCSS compiler. The main entry point is `main.scss`.

### Using Node-Sass or Dart-Sass

```bash
# Install sass compiler
npm install -g sass

# Compile main.scss to CSS
sass main.scss ../css/style.css

# Watch for changes
sass --watch main.scss:../css/style.css
```

### Using Webpack/Build Tools

Add to your webpack configuration:

```javascript
module.exports = {
  entry: './static/scss/main.scss',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
};
```

## Browser Support

The styleguide targets modern browsers with CSS Grid and Flexbox support:
- Chrome/Edge 88+
- Firefox 84+
- Safari 14+
- iOS Safari 14+
- Android Chrome 88+

Legacy fallbacks are provided where appropriate.

## Customization

### Adding New Colors

1. Add color variables in `_variables.scss`
2. Create utility classes in `_colors.scss`
3. Update component styles as needed

### Extending Typography

1. Add font size variables in `_variables.scss`
2. Create utility classes in `_typography.scss`
3. Update responsive mixins if needed

### Creating New Components

1. Add component styles to `_components.scss`
2. Use existing mixins from `_mixins.scss`
3. Follow BEM naming convention

## Performance Considerations

- **Tree Shaking**: Only include utilities you use in production
- **Critical CSS**: Extract above-the-fold styles for faster loading
- **Font Loading**: Use `font-display: swap` for Google Fonts
- **Purging**: Remove unused CSS in production builds

## Accessibility Features

- **Color Contrast**: All color combinations meet WCAG AA standards
- **Focus States**: Visible focus indicators on interactive elements
- **Screen Readers**: Hidden text for screen reader users
- **Responsive**: Mobile-first, responsive design
- **Reduced Motion**: Respects user's motion preferences

## Quality Assurance

The styleguide includes:
- **Responsive Testing**: Mobile, tablet, desktop breakpoints
- **Browser Testing**: Cross-browser compatibility
- **Accessibility Testing**: WCAG 2.1 AA compliance
- **Performance Testing**: Optimized for web performance

## Support

For questions or issues with the styleguide:
1. Check this documentation
2. Review the source code comments
3. Test in the target browsers
4. Validate accessibility with screen readers

---

**Historic Equity Inc. Brand Guidelines**
- Primary Orange: #BD572B (Trust, warmth, heritage)
- Primary Gold: #E6CD41 (Prosperity, value, optimism)
- Primary Brown: #95816E (Stability, tradition, reliability)
- Light Blue: #83ACD1 (Innovation, clarity, progress)
- Dark Navy: #2D2E3D (Professionalism, authority, trust)

The design bridges history and progress with a bold brand identity that honors the past while embracing the future.