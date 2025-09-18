/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.twig",
    "./Components/**/*.twig",
    "./**/*.php",
    "./static/js/**/*.js"
  ],
  theme: {
    extend: {
      // Historic Equity Color System (from Variables.png)
      colors: {
        // Primary Brand Colors
        'primary': {
          50: '#fef7f0',
          100: '#fdeee0',
          200: '#fbd9c0',
          300: '#f7be95',
          400: '#f19968',
          500: '#ec7944',
          600: '#bd572b', // Main Tuscany
          700: '#a64a26',
          800: '#8a3f23',
          900: '#71351f',
        },
        'secondary': {
          50: '#fefdf8',
          100: '#fefaed',
          200: '#fcf4d5',
          300: '#f9eab8',
          400: '#f4dd84',
          500: '#e6cd41', // Main Arrowtown Gold
          600: '#d4b73a',
          700: '#b89a31',
          800: '#9a7d2b',
          900: '#7f6525',
        },
        'tertiary': {
          50: '#f8f6f4',
          100: '#f0ede9',
          200: '#e0d9d2',
          300: '#ccc0b5',
          400: '#b5a394',
          500: '#95816e', // Main Ronchi Brown
          600: '#886f5e',
          700: '#735c4f',
          800: '#604d43',
          900: '#504039',
        },
        'navy': {
          50: '#f6f6f7',
          100: '#ededef',
          200: '#d7d8dc',
          300: '#b5b7c0',
          400: '#8d919f',
          500: '#6f7384',
          600: '#5a5d6b',
          700: '#4a4d57',
          800: '#40424a',
          900: '#2d2e3d', // Main Charade Navy
        },
        'light-blue': {
          50: '#f4f8fc',
          100: '#e8f0f8',
          200: '#cce0f0',
          300: '#a0c8e5',
          400: '#83acd1', // Main Polo Blue
          500: '#5e8bb8',
          600: '#4a6fa0',
          700: '#3e5a83',
          800: '#364c6d',
          900: '#30415a',
        },
        // Neutral Grays (from Variables.png)
        'neutral': {
          50: '#fefff8',    // Brand Off-White
          100: '#f7f7f7',   // Neutral Lightest
          200: '#e7e7e7',   // Neutral Lighter
          300: '#d1d1d1',   // Neutral Light
          400: '#999999',   // Neutral
          500: '#666666',   // Neutral Dark
          600: '#4a4a4a',   // Neutral Darker
          700: '#333333',   // Neutral Darkest
          800: '#1a1a1a',
          900: '#000000',
        },
        // Brand specific colors
        'off-white': '#fefff8'
      },

      // Typography System (from Typography.png)
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', 'sans-serif'],
        'heading': ['Montserrat', 'system-ui', 'sans-serif'],
        'body': ['Montserrat', 'system-ui', 'sans-serif'],
        'subheading': ['Sportscenter', 'Montserrat', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Desktop Typography Scale (Enhanced for Figma alignment)
        'h1-desktop': ['96px', { lineHeight: '110%', fontWeight: '800' }], // Increased from 72px (+33%)
        'h2-desktop': ['52px', { lineHeight: '120%', fontWeight: '700' }],
        'h3-desktop': ['44px', { lineHeight: '120%', fontWeight: '600' }],
        'h4-desktop': ['36px', { lineHeight: '130%', fontWeight: '600' }],
        'h5-desktop': ['28px', { lineHeight: '140%', fontWeight: '500' }],
        'h6-desktop': ['16px', { lineHeight: '150%', fontWeight: '500' }],

        // Mobile Typography Scale (Enhanced for Figma alignment)
        'h1-mobile': ['80px', { lineHeight: '115%', fontWeight: '800' }], // Increased from 64px (+25%)
        'h2-mobile': ['40px', { lineHeight: '120%', fontWeight: '700' }],
        'h3-mobile': ['32px', { lineHeight: '120%', fontWeight: '600' }],
        'h4-mobile': ['24px', { lineHeight: '130%', fontWeight: '600' }],
        'h5-mobile': ['20px', { lineHeight: '140%', fontWeight: '500' }],
        'h6-mobile': ['18px', { lineHeight: '150%', fontWeight: '500' }],

        // Body Text Scales
        'text-xl': ['22px', { lineHeight: '150%', fontWeight: '400' }],
        'text-lg': ['18px', { lineHeight: '150%', fontWeight: '400' }],
        'text-base': ['16px', { lineHeight: '150%', fontWeight: '400' }],
        'text-sm': ['14px', { lineHeight: '150%', fontWeight: '400' }],
        'text-xs': ['12px', { lineHeight: '150%', fontWeight: '400' }],
      },

      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
      },

      // Spacing System
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
        '42': '10.5rem',  // 168px
        '46': '11.5rem',  // 184px
        '50': '12.5rem',  // 200px
      },

      // Container Sizes
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },

      // Breakpoints for Responsive Design
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },

      // Box Shadows
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(189, 87, 43, 0.1), 0 2px 4px -1px rgba(189, 87, 43, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(189, 87, 43, 0.1), 0 4px 6px -2px rgba(189, 87, 43, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },

      // Border Radius
      borderRadius: {
        'brand': '8px',
        'brand-lg': '12px',
        'brand-xl': '16px',
      },

      // Animation and Transitions
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },

      // Grid Template Columns
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}