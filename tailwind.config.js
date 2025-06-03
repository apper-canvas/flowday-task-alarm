/** @type {import('tailwindcss').Config} */
export default {
  content: [
"./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: '#e2e8f0',
        background: '#ffffff',
        foreground: '#0f172a',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b'
        },
card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a'
        },
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
          foreground: '#ffffff'
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          foreground: '#ffffff'
        },
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
          DEFAULT: '#ec4899',
          foreground: '#ffffff'
},
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff'
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'neu-light': '5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff',
        'neu-dark': '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.05)',
        'notification': '0 8px 32px rgba(99, 102, 241, 0.2), 0 2px 8px rgba(99, 102, 241, 0.1)',
        'notification-pulse': '0 0 20px rgba(99, 102, 241, 0.6)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      },
      animation: {
        'bell-shake': 'bell-shake 0.5s ease-in-out infinite alternate',
        'notification-pulse': 'notification-pulse 2s ease-in-out infinite'
      },
      keyframes: {
        'bell-shake': {
          '0%': { transform: 'rotate(-15deg)' },
          '100%': { transform: 'rotate(15deg)' }
        },
        'notification-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' }
        }
      }
    }
  },
  plugins: [],
  darkMode: 'class',
}