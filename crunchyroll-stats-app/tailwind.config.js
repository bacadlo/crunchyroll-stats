/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef4eb',
          100: '#fde5d0',
          200: '#fbcba3',
          300: '#f8a96c',
          400: '#f47521',
          500: '#f47521',
          600: '#dc6a1e',
          700: '#b8571a',
          800: '#934516',
          900: '#7a3912',
        },
      },
    },
  },
  plugins: [],
}
