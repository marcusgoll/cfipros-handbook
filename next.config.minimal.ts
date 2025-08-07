import type { NextConfig } from 'next';

// Minimal configuration to identify build issues
const nextConfig: NextConfig = {
  eslint: {
    dirs: ['.'],
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors to test build process
  },
  poweredByHeader: false,
  reactStrictMode: false, // Disable strict mode temporarily
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'], // Remove MDX temporarily

  // Minimal webpack config
  webpack: (config, { dev }) => {
    // Disable some optimizations that might cause hangs
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: false, // Disable minification temporarily
      };
    }

    return config;
  },
};

export default nextConfig;
