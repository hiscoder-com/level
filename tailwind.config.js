module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'th-primary-100': 'var(--primary-100)',
        'th-primary-200': 'var(--primary-200)',
        'th-primary-300': 'var(--primary-300)',
        'th-primary-400': 'var(--primary-400)',
        'th-primary-500': 'var(--primary-500)',
        'th-secondary-10': 'var(--secondary-10)',
        'th-secondary-50': 'var(--secondary-50)',
        'th-secondary-100': 'var(--secondary-100)',
        'th-secondary-200': 'var(--secondary-200)',
        'th-secondary-300': 'var(--secondary-300)',
        'th-secondary-400': 'var(--secondary-400)',
        'th-text-primary': 'var(--text-primary)',
        'th-text-secondary-100': 'var(--text-secondary-100)',
        'th-text-secondary-200': 'var(--text-secondary-200)',
        'th-invalid': 'var(--invalid)',
        'th-divide-verse1': 'var(--divide-verse1)',
        'th-divide-verse2': 'var(--divide-verse2)',
        'th-divide-verse3': 'var(--divide-verse3)',
        'th-divide-verse4': 'var(--divide-verse4)',
        'th-divide-verse5': 'var(--divide-verse5)',
        'th-divide-verse6': 'var(--divide-verse6)',
        'th-divide-verse7': 'var(--divide-verse7)',
        'th-divide-verse8': 'var(--divide-verse8)',
        'th-divide-verse9': 'var(--divide-verse9)',

        gray: {
          50: '#F5F5F5',
          150: '#EDEDED',
          250: '#E3E3E3',
          450: '#AEAEAE',
        },
        yellow: {
          650: '#C68D39',
          550: '#FDDA62',
        },
        blue: {
          550: '#064875',
          650: '#04375b',
        },
        slate: {
          550: '#3C6E71',
          580: '#609295',
          650: '#275356',
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
