import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "3pspglobal.s3.us-east-2.amazonaws.com",
        pathname: "/assets/images/**",
      },
      {
        protocol: "https",
        hostname: "pub-e703132c460246adacce3867fb9ccf24.r2.dev",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
