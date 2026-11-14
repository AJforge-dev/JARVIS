/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./overlay.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#070a0f',
          card: '#0f172a',
          surface: '#111927',
          border: '#1e293b',
          blue: '#2563eb',
          cyan: '#00dcff',
          neon: '#38bdf8'
        }
      }
    }
  },
  plugins: []
};
