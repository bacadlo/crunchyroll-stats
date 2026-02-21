/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff4eb',
          100: '#ffe7d4',
          200: '#ffcca9',
          300: '#ffaf7d',
          400: '#ff8f45',
          500: '#ff6a00',
          600: '#e25e00',
          700: '#bc4f00',
          800: '#953f00',
          900: '#763300',
        },
      },
    },
  },
  plugins: [],
}
