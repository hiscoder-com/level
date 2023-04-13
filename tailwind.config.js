module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          150: '#DCE4E9',
          350: '#AECCDF',
          450: '#0EA5E9',
        },
        darkBlue: '#2E4057',
      },
    },
  },
  variants: {
    extend: {
      display: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
}
