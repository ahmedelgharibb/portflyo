/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  distDir: '.next',
  images: {
    domains: [
      'images.unsplash.com',
      'cdn-icons-png.flaticon.com'
    ],
  },
  experimental: {
    outputFileTracingRoot: undefined,
    outputFileTracingIncludes: {
      '/**/*': ['./public/**/*'],
    },
  },
}

module.exports = nextConfig 