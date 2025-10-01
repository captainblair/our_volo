/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Times New Roman"', 'serif'],
      },
      fontSize: {
        base: '12pt',
      },
      colors: {
        primary: '#1a365d',
        secondary: '#2c5282',
        accent: '#4299e1',
        background: '#f7fafc',
        card: '#ffffff',
        'card-hover': '#f0f4f8',
      },
      boxShadow: {
        card: '0 2px 4px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
}
