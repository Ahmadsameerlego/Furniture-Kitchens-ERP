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
          dark: '#1C352D',       // Primary Deep Emerald Green from Logo
          emerald: '#142921',    // Darker Green for backgrounds
          primary: '#1E382B',    // Standard Emerald Green
          accent: '#E06F28',     // Warm Orange / Amber from Logo Accent
          'accent-light': '#F07D32',
          gold: '#D97706',
          light: '#F8FAF8',      // Soft Off-White
          surface: '#F1F5F3',    // Light Greenish Off-white Card Background
          border: '#D1E0D9'      // Soft Border
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
