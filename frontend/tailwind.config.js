/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#1A2333',
        primary: '#3B82F6',
        secondary: '#6366F1',
        accent: '#F43F5E',
        textMain: '#F8FAFC',
        textMuted: '#94A3B8'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
