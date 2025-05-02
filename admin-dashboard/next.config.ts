import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["sgp1.digitaloceanspaces.com"],
    // For more control, you could use remotePatterns instead:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'sgp1.digitaloceanspaces.com',
    //     pathname: '/vision-forge/**',
    //   },
    // ],
  },
};

export default nextConfig;
