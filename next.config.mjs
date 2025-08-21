/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Wildcard path matching
      {
        source: "/",
        destination: "/chat/new",
      },
    ];
  },
  //   async rewrites() {
  //     return [
  //       {
  //         source: "/api/anthropic/:path*",
  //         destination: "https://api.anthropic.com/v1/messages",
  //         // Proxy to Backend
  //       },
  //     ];
  //   },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
