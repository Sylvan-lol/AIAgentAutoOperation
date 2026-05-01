/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple 风格色系
        'apple-bg': '#f5f5f7',
        'apple-text': '#1d1d1f',
        'apple-secondary': '#86868b',
        'apple-blue': '#0071e3',
        'apple-blue-hover': '#0077ed',
        'apple-border': '#d2d2d7',
        'apple-white': '#ffffff',
        'apple-dark': '#1d1d1f',
        'apple-gray': '#f5f5f7',
        'apple-light-gray': '#e8e8ed',
        'apple-danger': '#ff3b30',
        'apple-green': '#34c759',
        'apple-orange': '#ff9500'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
      },
      backdropBlur: {
        'apple': '20px',
      },
      borderRadius: {
        'apple': '12px',
      },
      boxShadow: {
        'apple': '0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)',
        'apple-md': '0 0 0 1px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.12)',
        'apple-lg': '0 0 0 1px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.15)',
        'apple-xl': '0 0 0 1px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.2)',
      }
    },
  },
  plugins: [],
}