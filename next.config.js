/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'cdn-icons-png.flaticon.com'
    ],
  },
}

module.exports = nextConfig 