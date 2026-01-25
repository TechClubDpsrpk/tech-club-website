import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  eslint: {
    // Warning only, don’t fail the build
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@sparticuz/chromium'],
};

export default nextConfig;
