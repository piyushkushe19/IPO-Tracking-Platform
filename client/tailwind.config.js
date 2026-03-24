/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edfafa',
          100: '#d5f5f6',
          200: '#afeaec',
          300: '#77d8db',
          400: '#3abfc3',
          500: '#1ea3a8',
          600: '#16848a',
          700: '#156870',
          800: '#165458',
          900: '#154649',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#161b27',
          border:  '#1e2535',
          hover:   '#1c2333',
          muted:   '#222840',
        },
        accent: {
          green:  '#00d09c',
          red:    '#f05454',
          yellow: '#f5a623',
          blue:   '#4c9be8',
          purple: '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace'],
        display: ['Sora', 'ui-sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(30,37,53,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30,37,53,0.5) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        ticker: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 25px rgba(0,0,0,0.5)',
        'glow-green': '0 0 20px rgba(0,208,156,0.25)',
        'glow-red': '0 0 20px rgba(240,84,84,0.25)',
        'glow-brand': '0 0 20px rgba(30,163,168,0.3)',
      },
    },
  },
  plugins: [],
};
