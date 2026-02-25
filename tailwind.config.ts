import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      colors: {
        // MD3 color tokens — blue seed
        primary: {
          DEFAULT: '#1A6DD4',
          container: '#D6E4FF',
          on: '#FFFFFF',
          'on-container': '#001847',
        },
        secondary: {
          DEFAULT: '#565E71',
          container: '#DAE2F9',
          on: '#FFFFFF',
          'on-container': '#131C2C',
        },
        surface: {
          DEFAULT: '#FAFBFE',
          variant: '#E2E3ED',
          'on': '#1A1B1E',
          'on-variant': '#45464F',
          tint: '#1A6DD4',
        },
        outline: {
          DEFAULT: '#757780',
          variant: '#C5C6D0',
        },
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
          on: '#FFFFFF',
          'on-container': '#410002',
        },
        // Tonal surface levels (MD3 elevation via tint)
        'surface-1': '#EEF2FB',
        'surface-2': '#E6EDF9',
        'surface-3': '#DDE7F6',
        'surface-4': '#DAE5F5',
        'surface-5': '#D5E1F4',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '28px',
        'full': '9999px',
      },
      boxShadow: {
        'elevation-1': '0px 1px 2px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
        'elevation-2': '0px 1px 2px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px rgba(0,0,0,0.3)',
      },
      fontSize: {
        // MD3 Type scale
        'display-lg': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
        'display-md': ['45px', { lineHeight: '52px', letterSpacing: '0', fontWeight: '400' }],
        'display-sm': ['36px', { lineHeight: '44px', letterSpacing: '0', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0', fontWeight: '400' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0', fontWeight: '400' }],
        'headline-sm': ['24px', { lineHeight: '32px', letterSpacing: '0', fontWeight: '400' }],
        'title-lg': ['22px', { lineHeight: '28px', letterSpacing: '0', fontWeight: '400' }],
        'title-md': ['16px', { lineHeight: '24px', letterSpacing: '0.15px', fontWeight: '500' }],
        'title-sm': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '0.5px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '0.25px', fontWeight: '400' }],
        'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.4px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', letterSpacing: '0.5px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
