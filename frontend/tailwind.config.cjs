/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Palatino Linotype', 'Palatino', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Segoe UI', 'Avenir Next', 'sans-serif'],
        mono: ['Cascadia Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
