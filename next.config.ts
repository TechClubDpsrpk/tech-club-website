import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  eslint: {
    // Warning only, don’t fail the build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
