/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['pages', 'utils', 'lib', 'components'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  i18n,
  react: { useSuspense: false }, // TODO проверить, надо ли это
}

module.exports = nextConfig
