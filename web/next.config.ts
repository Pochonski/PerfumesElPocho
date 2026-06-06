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
  swcMinify: true,
};

export default nextConfig;