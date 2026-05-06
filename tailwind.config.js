/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000',     // main background
        secondary: '#10263F',   // cards
        accent: '#1E3A8A',      // buttons
        accentLight: '#2563EB', // hover
        glow: '#3B82F6',        // highlights
      },
      boxShadow: {
        'neon': '0 0 15px rgba(59, 130, 246, 0.5)',
      }
    },
  },
  plugins: [],
}