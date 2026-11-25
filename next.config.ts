import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "oshisen.com" }],
        destination: "https://www.oshisen.com/:path*",
        permanent: true,
      },
      // 旧版（2026-09-18草案）の8テーマページは、候補者送付版の質問一覧へ集約する。
      {
        source: "/ibaraki-2026/:district/issues/:theme",
        destination: "/issues",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
