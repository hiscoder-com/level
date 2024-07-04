module.exports = {
  i18n: {
    locales: ['en', 'ru', 'es'],
    defaultLocale: 'en',
  },
  localePath:
    typeof window === 'undefined'
      ? require('path').resolve('./public/locales')
      : '/locales',
}
