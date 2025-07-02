/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  prefix: '',
  theme: {
    container: {
      center: true
    },
    opacity: {
      '0': '0',
      '20': '0.2',
      '40': '0.4',
      '60': '0.6',
      '80': '0.8',
      '100': '1',
    },
    extend: {
      screens: {
        '3xl': '1600px',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'primary': {
          DEFAULT: '#3B82F6',
          'hover': '#60A5FA',
          'light': {
            DEFAULT: '#0EA5E9',
            'hover': '#38BDF8',
          },
        },
        'secondary': {
          DEFAULT: '#64748B',
          'hover': '#94A3B8',
        },
        'warning': {
          DEFAULT: '#EAB308',
          'hover': '#FACC15',
          'dark': {
            DEFAULT: '#F59E0B',
            'hover': '#FBBF24',
          },
        },
        'danger': {
          DEFAULT: '#EF4444',
          'hover': '#F87171',
        },
        'success': {
          DEFAULT: '#22C55E',
          'hover': '#4ADE80',
        },
        'iron-blue': {
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
          400: '#CBD5E1',
        },
        'slate': {
          700: 'rgb(51 65 85)',
        },
      },
      textColor: {
        'black': '#0F172A',
        'red': '#B91C1C',
        'green': '#047857',
        'blue': '#1D4ED8',
      },
    }
  },
  plugins: [],
};