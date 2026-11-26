import type { NextConfig } from "next";
import { withBotId } from 'botid/next/config';


const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    qualities: [75, 80],
  },
  async redirects() {
    return [
      // Retired campaign pages (Appstravaganza 2025, Lock In for 2026) now point at the plans page.
      { source: '/app', destination: '/web', permanent: true },
      { source: '/lock-in', destination: '/web', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Apply baseline security headers to every route, not just /api.
        // Pages host the contact, referral and pre-booking forms, so they
        // need clickjacking protection too.
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Modern equivalent of X-Frame-Options. Scoped to framing only,
            // so it cannot break scripts, styles or fonts on the page.
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none'",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

// export default nextConfig;
export default withBotId(nextConfig);

