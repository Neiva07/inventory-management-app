/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@stockify/runtime-logging'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh'
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com'
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev'
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me'
      }
    ]
  }
};

module.exports = nextConfig;
