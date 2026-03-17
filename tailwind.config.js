/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ivory: '#F9F6F0',
        parchment: '#F0EBE0',
        warmGray: '#E8E2D6',
        sienna: '#8B4513',
        burgundy: '#6B2D3E',
        espresso: '#2C1810',
        bronze: '#C4A882',
        muted: '#8C7B6B',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #F9F6F0 0%, #F0EBE0 50%, #E8E2D6 100%)',
      },
    },
  },
  plugins: [],
}
