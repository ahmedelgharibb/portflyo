/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: [
      'images.unsplash.com',
      'cdn-icons-png.flaticon.com'
    ],
  },
  basePath: '',
  assetPrefix: '',
  distDir: 'dist',
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig 