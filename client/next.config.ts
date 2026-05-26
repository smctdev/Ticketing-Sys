import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4001",
        pathname: "/storage/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ticketing-server.smctgroup.ph",
        pathname: "/storage/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api-netsuite.smctgroup.ph",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
