/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#361D13',       // Primary Deep Emerald Green from Logo
          emerald: '#23120A',    // Darker Green for backgrounds
          primary: '#2E1810',    // Standard Emerald Green
          accent: '#C87A38',     // Warm Orange / Amber from Logo Accent
          'accent-light': '#DB8D48',
          gold: '#D97706',
          light: '#FAF7F2',      // Soft Off-White
          surface: '#F4ECE1',    // Light Greenish Off-white Card Background
          border: '#E5D7C7'      // Soft Border
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'sans-serif']
      },
      boxShadow: {
        'brand-glow': '0 4px 20px -2px rgba(28, 53, 45, 0.15)',
        'accent-glow': '0 4px 20px -2px rgba(224, 111, 40, 0.25)',
      }
    },
  },
  plugins: [],
}
