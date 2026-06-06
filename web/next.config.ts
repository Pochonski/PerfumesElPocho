import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "3pspglobal.s3.us-east-2.amazonaws.com",
        pathname: "/assets/images/**",
      },
    ],
    minimumCacheTTL: 86400,
  },
  // Skip type checking during build (faster deploys, types already checked in IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
