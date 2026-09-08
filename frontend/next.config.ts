import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor mínimo em .next/standalone para a imagem Docker de produção.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
