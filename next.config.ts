import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Disable telemetry for local-only usage
  experimental: {},
};

export default nextConfig;
