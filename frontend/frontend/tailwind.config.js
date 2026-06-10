/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf8',
          100: '#d7f4ec',
          500: '#1c9a83',
          600: '#127a68',
          700: '#0f6255'
        }
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
