/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4AF37',
          dark: '#E5C158',
          hover: '#b5952f',
          text: '#2C2C2C',
          'text-dark': '#F0F0F0',
          border: '#e2dcd6',
          'border-dark': '#333333',
          warn: '#d32f2f',
          'warn-dark': '#ef5350',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#f7f3ee',
          dark: '#1E1E1E',
          'raised-dark': '#2a2a2a',
        },
        background: {
          DEFAULT: '#FAF8F5',
          dark: '#121212',
        },
        accent: {
          DEFAULT: '#e8b4b8',
          dark: '#b7767b',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
      },
      boxShadow: {
        'premium-sm': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'premium-md': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'premium-lg': '0 12px 32px rgba(0, 0, 0, 0.12)',
        'premium-dark-sm': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'premium-dark-md': '0 8px 24px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.glass-panel': {
          '@apply bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-md border border-white/20 dark:border-[#333333]/20 rounded-xl shadow-premium-sm dark:shadow-premium-dark-sm': {},
        },
        '.card-hover': {
          '@apply transition-transform transition-shadow duration-300 ease-in-out hover:shadow-premium-md dark:hover:shadow-premium-dark-md hover:-translate-y-1': {},
        },
        '.btn-primary': {
          '@apply bg-primary DEFAULT text-white dark:text-[#0F172A] rounded-xl font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95': {},
        },
        '.input-premium': {
          '@apply bg-[#FAF8F5] dark:bg-[#2A2A2A] border border-[#e2dcd6] dark:border-[#333333] rounded-xl text-[#2C2C2C] dark:text-[#F0F0F0] focus:outline-none focus:ring-2 focus:ring-primary DEFAULT dark:focus:ring-primary-dark focus:border-transparent': {},
        },
      });
    },
  ],
};