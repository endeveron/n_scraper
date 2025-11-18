import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    qualities: [25, 50, 75, 100],
  },
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: '2mb',
  //   },
  // },

  // // Force fresh builds
  // generateBuildId: async () => {
  //   return `build-${Date.now()}`;
  // },
};

export default nextConfig;
