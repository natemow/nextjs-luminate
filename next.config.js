/** @type {import('next').NextConfig} */

const path = require('path'),
      translate = require('next-translate')

const nextConfig = translate({
  reactStrictMode: true,
  distDir: 'build',
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  }
})

module.exports = nextConfig
