/** @type {import('next').NextConfig} */

const path = require('path'),
      nextTranslate = require('next-translate')

const nextConfig = nextTranslate({
  reactStrictMode: true,
  distDir: 'build',
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }
})

module.exports = nextConfig
