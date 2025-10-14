import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-eval' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; worker-src 'self' blob:; child-src 'self' blob:;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
