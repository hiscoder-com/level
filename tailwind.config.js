module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          350: '#bcbcbc',
        },
        blue: {
          150: '#DCE4E9',
          250: '#B7C9E5',
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
