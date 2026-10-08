import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Reuse recent RSC payloads when revisiting a page within 30s (client router cache).
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

export default nextConfig;
