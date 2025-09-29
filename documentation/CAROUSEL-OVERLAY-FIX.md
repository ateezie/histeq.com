# Carousel Text Overlay Fix Documentation

## Issue Summary
The carousel text overlays on the homepage were not visible despite having the correct HTML structure and CSS classes in the template. This document explains the root cause and permanent solution.

## Root Cause Analysis

### Problem
- Text overlays existed in DOM with correct HTML structure
- CSS classes like `bg-black/80`, `text-white`, `absolute`, `bottom-4`, `left-4` were present
- But overlays had `backgroundColor: rgba(0, 0, 0, 0)` (transparent) and `bottom: -92px` (positioned outside viewport)
- TailwindCSS classes were not being applied correctly from stylesheets

### Key Discovery: Multiple Carousel Implementations
The project has **THREE** different carousel implementations:

1. **`/static/js/main.js`** - Contains carousel code within `HistoricEquityTheme` class
2. **`/static/js/carousel.js`** - Standalone carousel implementation
3. **`/templates/page-home.twig`** - Embedded JavaScript carousel (THIS IS THE ACTIVE ONE)

**Critical Finding:** Only the carousel code in `page-home.twig` is actually running. The other two files are not being used for the homepage carousel.

### Build System Behavior
- Webpack only processes `main.js` (not `carousel.js`)
- Template JavaScript runs independently of build system
- CSS from stylesheets wasn't overriding default styles with sufficient specificity

## Permanent Solution

### Location of Fix
File: `/wp-content/themes/historic-equity/templates/page-home.twig`
Lines: ~771-813

### Code Added
```javascript
// Apply overlay styles to ensure text is visible
const applyOverlayStyles = () => {
    const allOverlays = carouselContainer.querySelectorAll('.carousel-slide .absolute.bottom-4.left-4');
    allOverlays.forEach((overlay) => {
        overlay.style.cssText = `
            position: absolute !important;
            bottom: 16px !important;
            left: 16px !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            padding: 12px !important;
            border-radius: 8px !important;
            z-index: 10 !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;

        // Apply text styles
        const textElements = overlay.querySelectorAll('h3, p');
        textElements.forEach(el => {
            el.style.color = 'white';
            el.style.margin = '0';

            if (el.tagName === 'H3') {
                el.style.fontSize = '14px';
                el.style.fontWeight = '600';
                el.style.marginBottom = '4px';
            } else {
                el.style.fontSize = '12px';
                el.style.marginBottom = '8px';

                if (el === overlay.querySelector('p:last-child')) {
                    el.style.fontWeight = '700';
                    el.style.marginBottom = '0';
                }
            }
        });
    });
    console.log('Applied overlay styles to', allOverlays.length, 'carousel overlays');
};

// Apply overlay styles initially
applyOverlayStyles();
```

### Integration Point
This code is placed right before the carousel initialization:
```javascript
// Apply overlay styles initially
applyOverlayStyles();

// Initialize carousel
updateCarousel(0);

// Start auto-play
startAutoPlay();
```

## Verification Steps

1. **Console Log Check**: Look for "Applied overlay styles to 11 carousel overlays"
2. **Visual Check**: Text overlays should be visible on all slides with:
   - Bottom-left positioning
   - Dark semi-transparent background
   - White text
   - Building name, location, and tax credit amount

## Why CSS Stylesheets Didn't Work

1. **TailwindCSS Class Processing**: Classes like `bg-black/80` weren't being properly processed
2. **Specificity Issues**: Default styles were overriding custom CSS
3. **Template Context**: The carousel JavaScript runs in template context, separate from webpack-processed styles

## Future Maintenance

### If Overlays Stop Working Again:
1. Check if the `applyOverlayStyles()` function is still in `page-home.twig`
2. Look for console log: "Applied overlay styles to X carousel overlays"
3. Verify the carousel container selector: `.building-carousel-container`

### If Adding New Carousel Features:
- Remember that the active carousel code is in `page-home.twig`, not separate JS files
- Any carousel modifications should be made to the template file
- The `applyOverlayStyles()` function may need to be called after dynamic content changes

### Clean Up Recommendations:
- Consider removing unused carousel implementations in `main.js` and `carousel.js`
- Consolidate all carousel logic into a single, properly managed file
- Improve TailwindCSS processing to avoid needing inline styles

## Files Modified
- ✅ `/wp-content/themes/historic-equity/templates/page-home.twig` (WORKING SOLUTION)
- ❌ `/wp-content/themes/historic-equity/static/js/main.js` (Not used for homepage carousel)
- ❌ `/wp-content/themes/historic-equity/static/js/carousel.js` (Not used for homepage carousel)
- ❌ `/wp-content/themes/historic-equity/static/scss/_components.scss` (CSS approach didn't work)

## Result
Text overlays now display correctly with:
- Building names (Union Station, Springfield History Museum, etc.)
- Locations (Wichita, KS; Springfield, MO; etc.)
- Tax credit amounts ($12.4M, $8.9M, $15.2M, etc.)
- Professional styling matching design reference