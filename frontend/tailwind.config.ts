import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7f2',
          100: '#dbe7d3',
          200: '#bdd1ae',
          300: '#96b07e',
          400: '#6f9054',
          500: '#56753f',
          600: '#425d31',
          700: '#344925',
          800: '#29371e',
          900: '#1d2715'
        },
        // Dark cosmic-violet theme. These tokens are used only inside the tracker feature,
        // so redefining them here reskins the whole tracker without touching every component.
        studio: {
          page: '#0b0912',
          card: '#161226',
          sidebar: '#0e0b1a',
          line: '#2a2542',
          lavender: '#1b1730',
          accent: '#8b5cf6',
          gold: '#d9b45c',
          ink: '#ecebf7',
          muted: '#948eb2'
        },
        status: {
          passed: '#4ade80',
          'passed-soft': '#122a1d',
          lacking: '#fbbf24',
          'lacking-soft': '#2b2410',
          'not-started': '#a5a3b5',
          'not-started-soft': '#1e1b2c'
        }
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Fraunces"', 'Georgia', 'serif']
      },
      boxShadow: {
        panel: '0 18px 44px rgba(0, 0, 0, 0.5)'
      }
    }
  },
  plugins: []
} satisfies Config;

