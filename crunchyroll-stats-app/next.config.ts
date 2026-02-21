import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.crunchyroll.com',
      },
    ],
  },
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
