import type { NextConfig } from 'next';

// Simplified Next.js configuration for debugging builds
const nextConfig: NextConfig = {
  eslint: {
    dirs: ['.'],
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Disable experimental features that might cause issues
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Disable bundle analyzer in production builds
  webpack: (config, { isServer }) => {
    // Optimize webpack for faster builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
};

export default nextConfig;
