import type { Config } from 'tailwindcss';

// MD3 surface container hierarchy (blue seed, computed from Material Theme Builder)
// Each level is a progressively stronger tint of the primary color over the base surface.
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '"Google Sans Text"', '"Product Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Core color roles ──────────────────────────────────────────────────
        primary:   { DEFAULT: '#1A6DD4', on: '#FFFFFF', container: '#D6E4FF', 'on-container': '#001847' },
        secondary: { DEFAULT: '#545F71', on: '#FFFFFF', container: '#D8E3F8', 'on-container': '#111C2B' },
        tertiary:  { DEFAULT: '#6B5778', on: '#FFFFFF', container: '#F2DAFF', 'on-container': '#251431' },
        error:     { DEFAULT: '#BA1A1A', on: '#FFFFFF', container: '#FFDAD6', 'on-container': '#410002' },

        // ── Surface hierarchy (MD3 tonal containers — NO borders between these) ─
        // Use these to create depth: lowest → low → DEFAULT → high → highest
        surface: {
          DEFAULT:           '#FAFBFE', // base background
          dim:               '#D9DAE0', // dimmed (scrim/overlay)
          bright:            '#FAFBFE',
          'container-lowest':  '#FFFFFF',
          'container-low':     '#F3F5FC', // elevation 1 — cards, drawers
          'container':         '#EDF0F8', // elevation 2 — top bars
          'container-high':    '#E7EAF2', // elevation 3 — search inputs, chips
          'container-highest': '#E2E4EC', // elevation 4 — tooltips, FABs
          on:                '#1A1C22',
          'on-variant':      '#44474F',
          tint:              '#1A6DD4',
        },

        // ── Outline — use ONLY for interactive inputs (text fields, checkboxes) ─
        // NOT for cards, rows, or containers
        outline: {
          DEFAULT: '#74777F',
          variant: '#C4C6D0',
        },
      },

      borderRadius: {
        // MD3 shape scale
        'xs':   '4px',
        'sm':   '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '28px',
        'full': '9999px',
      },

      boxShadow: {
        // MD3 elevation shadows (used sparingly alongside tonal color)
        'elev-1': '0 1px 2px rgba(0,0,0,.12), 0 1px 3px 1px rgba(0,0,0,.08)',
        'elev-2': '0 1px 2px rgba(0,0,0,.12), 0 2px 6px 2px rgba(0,0,0,.08)',
        'elev-3': '0 4px 8px 3px rgba(0,0,0,.10), 0 1px 3px rgba(0,0,0,.12)',
        'elev-4': '0 6px 10px 4px rgba(0,0,0,.10), 0 2px 3px rgba(0,0,0,.12)',
      },

      fontSize: {
        // MD3 type scale — Google Sans (heavier weights to match Gemini style)
        'display-lg':  ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '500' }],
        'display-md':  ['45px', { lineHeight: '52px', letterSpacing: '0',       fontWeight: '500' }],
        'display-sm':  ['36px', { lineHeight: '44px', letterSpacing: '0',       fontWeight: '500' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '0',       fontWeight: '500' }],
        'headline-md': ['28px', { lineHeight: '36px', letterSpacing: '0',       fontWeight: '500' }],
        'headline-sm': ['24px', { lineHeight: '32px', letterSpacing: '0',       fontWeight: '500' }],
        'title-lg':    ['22px', { lineHeight: '28px', letterSpacing: '0',       fontWeight: '500' }],
        'title-md':    ['16px', { lineHeight: '24px', letterSpacing: '0.15px',  fontWeight: '500' }],
        'title-sm':    ['14px', { lineHeight: '20px', letterSpacing: '0.1px',   fontWeight: '500' }],
        'body-lg':     ['16px', { lineHeight: '24px', letterSpacing: '0.25px',  fontWeight: '500' }],
        'body-md':     ['14px', { lineHeight: '20px', letterSpacing: '0.25px',  fontWeight: '500' }],
        'body-sm':     ['12px', { lineHeight: '16px', letterSpacing: '0.4px',   fontWeight: '500' }],
        'label-lg':    ['14px', { lineHeight: '20px', letterSpacing: '0.1px',   fontWeight: '500' }],
        'label-md':    ['12px', { lineHeight: '16px', letterSpacing: '0.5px',   fontWeight: '500' }],
        'label-sm':    ['11px', { lineHeight: '16px', letterSpacing: '0.5px',   fontWeight: '500' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
