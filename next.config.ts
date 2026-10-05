import type { NextConfig } from "next";
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const config: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: cloud
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: `/${cloud}/image/upload/**`,
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
