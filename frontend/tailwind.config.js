/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sky-primary': '#4FC3F7',
        'sky-dark': '#2196F3',
        'sky-light': '#81D4FA',
        'background': '#FAFAF8',
        'surface': '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-secondary': '#666666',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'button': '4px 4px 0px #000',
        'button-hover': '2px 2px 0px #000',
        'card': '6px 6px 0px #000',
        'card-hover': '8px 8px 0px #000',
        'input-focus': '4px 4px 0px #4FC3F7',
      },
    },
  },
  plugins: [],
}

