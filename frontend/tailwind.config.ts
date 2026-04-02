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
        }
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        panel: '0 12px 28px rgba(41, 37, 36, 0.08)'
      }
    }
  },
  plugins: []
} satisfies Config;

