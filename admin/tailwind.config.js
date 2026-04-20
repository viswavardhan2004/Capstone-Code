/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'var(--bg-dark)',
          card: 'var(--bg-card)',
          orange: '#FF5500',
          glow: '#FF8800',
          text: 'var(--text-primary)',
          muted: 'var(--text-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #FF5500 0%, #FF8800 100%)',
        'hero-glow': 'radial-gradient(circle at center, rgba(255, 85, 0, 0.15) 0%, rgba(5, 5, 5, 0) 70%)',
      }
    },
  },
  plugins: [],
}