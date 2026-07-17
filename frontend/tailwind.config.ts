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
        studio: {
          page: '#FBF7EC',
          card: '#FFFDF7',
          sidebar: '#F7F1E0',
          line: '#EFE6D2',
          lavender: '#F3F0FC',
          accent: '#7C5CD6',
          gold: '#A9762F',
          ink: '#3B322A',
          muted: '#8A7C6B'
        },
        status: {
          passed: '#3F9A62',
          'passed-soft': '#E6F4EB',
          lacking: '#C98A18',
          'lacking-soft': '#FCF1DC',
          'not-started': '#8A8580',
          'not-started-soft': '#F0EDE7'
        }
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Fraunces"', 'Georgia', 'serif']
      },
      boxShadow: {
        panel: '0 12px 28px rgba(41, 37, 36, 0.08)'
      }
    }
  },
  plugins: []
} satisfies Config;

