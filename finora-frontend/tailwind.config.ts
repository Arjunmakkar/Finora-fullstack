import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0A0A',
        surface: '#111111',
        elevated: '#161616',
        border: {
          subtle: '#262626',
          strong: '#333333',
        },
        ink: {
          primary: '#F5F5F5',
          secondary: '#8A8A8A',
          tertiary: '#666666',
        },
        accent: {
          primary: '#D4FF3A',
          hover: '#C2ED28',
          teal: '#D4FF3A',
          cyan: '#F5F5F5',
          emerald: '#F5F5F5',
          amber: '#8A8A8A',
          rose: '#F5F5F5',
        },
      },
      fontSize: {
        '12': ['12px', { lineHeight: '16px' }],
        '14': ['14px', { lineHeight: '20px' }],
        '16': ['16px', { lineHeight: '24px' }],
        '20': ['20px', { lineHeight: '28px' }],
        '32': ['32px', { lineHeight: '36px' }],
        '48': ['48px', { lineHeight: '52px' }],
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sharp: '0px',
        card: '4px',
        xl: '6px',
        '2xl': '8px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 0, 0, 0.8)',
        elevated: '0 4px 12px rgba(0, 0, 0, 0.9)',
      },
      transitionTimingFunction: {
        finora: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
