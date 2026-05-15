/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde8ff',
          200: '#c3d4fe',
          300: '#9ab5fd',
          400: '#6b8dfa',
          500: '#4361f4',
          600: '#2d3fe8',
          700: '#252ed4',
          800: '#2127ac',
          900: '#202688',
        },
        surface: {
          900: '#0d0f18',
          800: '#13162a',
          700: '#1a1e35',
          600: '#232742',
          500: '#2d3256',
        }
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(67, 97, 244, 0.3)' },
          to: { boxShadow: '0 0 40px rgba(67, 97, 244, 0.6)' },
        }
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
