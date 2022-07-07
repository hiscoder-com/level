module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          150: '#DCE4E9',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
