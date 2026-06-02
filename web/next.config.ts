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
    // Cache de imágenes en el servidor para no re-descargar siempre
    minimumCacheTTL: 86400, // 24 horas
  },
  // Aumentar tamaño de página para SSG (necesario con muchos productos)
  experimental: {
    // Large page data support
  },
};

export default nextConfig;
