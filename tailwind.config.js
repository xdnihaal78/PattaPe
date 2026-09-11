/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#062C13',
          900: '#0F4C25',
          800: '#15803D',
          700: '#16A34A',
          600: '#22C55E',
          500: '#4ADE80',
          100: '#DCFCE7',
          50: '#F0FDF4',
        }
      }
    },
  },
  plugins: [],
}
