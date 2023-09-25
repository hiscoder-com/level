module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        'th-primary': 'var(--primary)',
        'th-secondary': 'var(--secondary)',
        'th-primary-background': 'var(--primary-background)',
        'th-secondary-background': 'var(--secondary-background)',
        'th-primary-icons': 'var(--primary-icons)',
        'th-secondary-icons': 'var(--secondary-icons)',
        'th-primary-text': 'var(--primary-text)',
        'th-secondary-text': 'var(--secondary-text)',
        'th-disabled-text': 'var(--disabled-text)',
        'th-active-tab-text': 'var(--active-tab-text)',
        'th-primary-link': 'var(--primary-link)',
        'th-hover-link': 'var(--hover-link)',
        'th-disabled-link': 'var(--disabled-link)',
        'th-primary-border': 'var(--primary-border)',
        'th-secondary-border': 'var(--secondary-border)',
        'th-primary-modal-from': 'var(--primary-modal-from)',
        'th-primary-modal-to': 'var(--primary-modal-from)',
        gray: {
          350: '#bcbcbc',
        },
        blue: {
          150: '#DCE4E9',
          250: '#B7C9E5',
          350: '#AECCDF',
          450: '#0EA5E9',
        },
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
