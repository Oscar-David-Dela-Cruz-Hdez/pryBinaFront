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
          DEFAULT: '#111111',
          dark: '#F0F0F0',
          hover: '#222222',
          text: '#111111',
          'text-dark': '#F0F0F0',
          border: '#E5E5E5',
          'border-dark': '#333333',
          warn: '#d32f2f',
          'warn-dark': '#ef5350',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#FAFAFA',
          dark: '#1E1E1E',
          'raised-dark': '#2a2a2a',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#121212',
        },
        accent: {
          DEFAULT: '#C88A78',
          dark: '#D99B89',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        heading: ['Cormorant Garamond', 'Montserrat', 'serif'],
        body: ['Montserrat', 'Roboto', 'sans-serif'],
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
        'none': 'none',
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'none': '0px',
        'sm': '2px',
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.glass-panel': {
          '@apply bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#333333] shadow-none': {},
        },
        '.card-hover': {
          '@apply transition-all duration-300 ease-in-out hover:border-[#111111] dark:hover:border-white': {},
        },
        '.btn-primary': {
          '@apply bg-[#111111] text-white dark:bg-white dark:text-[#111111] border border-[#111111] dark:border-white px-6 py-2.5 font-normal tracking-[1px] text-xs uppercase transition-all duration-300 hover:bg-white hover:text-[#111111] dark:hover:bg-[#111111] dark:hover:text-white': {},
        },
        '.btn-secondary': {
          '@apply bg-white text-[#111111] dark:bg-[#1E1E1E] dark:text-white border border-[#111111] dark:border-white px-6 py-2.5 font-normal tracking-[1px] text-xs uppercase transition-all duration-300 hover:bg-[#111111] hover:text-white dark:hover:bg-white dark:hover:text-[#111111]': {},
        },
        '.input-premium': {
          '@apply bg-white dark:bg-[#2A2A2A] border border-[#E5E5E5] dark:border-[#333333] text-[#111111] dark:text-[#F0F0F0] focus:outline-none focus:border-[#111111] dark:focus:border-white transition-all duration-300': {},
        },
      });
    },
  ],
};
