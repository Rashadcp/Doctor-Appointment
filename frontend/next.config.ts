import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // AWS S3 bucket for doctor profile photos
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
    // Serve next-gen formats (WebP/AVIF) automatically
    formats: ["image/avif", "image/webp"],
    // Minimize image quality for faster load
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Compress responses
  compress: true,
  // Strict mode for early bug detection without perf cost
  reactStrictMode: true,
  // Reduce bundle size by removing source maps in production
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: false,
  },
  // Power headers for caching
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
