/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['swagger-ui-react', 'swagger-client', 'react-syntax-highlighter'],
  eslint: {
    dirs: ['pages', 'utils', 'lib', 'components'], // Only run ESLint on the 'pages' and 'utils' directories during production builds (next build)
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: '@svgr/webpack',
    })
    return config
  },
  i18n,
}

module.exports = nextConfig
