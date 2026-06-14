/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        lab: {
          dark: '#1a1a2e',
          primary: '#1a237e',
          secondary: '#5d4037',
          accent: '#81d4fa',
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.5s ease-out forwards',
        'pixel-pulse': 'pixel-pulse 1s steps(2) infinite',
      },
      keyframes: {
        'pixel-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
