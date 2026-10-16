/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#e3d7ff', // Soft lavender background
        surface: '#FFFDF5',    // Warm cream/off-white front panels
        primary: '#3730a3',    // Darker indigo for buttons to contrast
        secondary: '#4f46e5',  // Medium indigo
        accent: '#312e81',     // Deepest indigo
        success: '#059669',    // Emerald green
        warning: '#d97706',    // Amber
        highrisk: '#ea580c',   // Orange
        critical: '#dc2626',   // Red
        text: '#1e293b',       // Dark slate for readability
        muted: '#64748b',      // Medium slate
        border: '#e2e8f0',     // Light slate border
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
