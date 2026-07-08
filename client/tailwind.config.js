/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e5fcf5',
          500: '#12b886',
          700: '#0f8f69',
        },
        slatex: '#0f172a',
      },
      boxShadow: {
        panel: '0 8px 32px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
};
