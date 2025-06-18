/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // important to include ts + tsx
  ],
  darkMode: 'class', // Enables dark mode via class e.g. <html class="dark">
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6', // Light mode blue
          dark: '#60a5fa', // Dark mode blue
        },
        background: {
          light: '#f9fafb', // Light bg
          dark: '#111827', // Dark bg
        },
        text: {
          light: '#1f2937', // Light text
          dark: '#f3f4f6',  // Dark text
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

