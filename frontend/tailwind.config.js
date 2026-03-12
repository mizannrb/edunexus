/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1d4ed8',
          600: '#1e40af',
          700: '#1e3a8a',
          900: '#0f172a',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
