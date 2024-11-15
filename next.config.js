/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  images: {
    domains: ['img.youtube.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // ビルド中にESLintエラーを無視
  },  
}

module.exports = nextConfig