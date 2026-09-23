import type { NextConfig } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://orbita.pages.dev";

const nextConfig: NextConfig = {
  // Cloudflare Pages: use standalone for @cloudflare/next-on-pages adapter
  output: "standalone",

  // Production: surface type errors instead of swallowing them
  typescript: {
    ignoreBuildErrors: false,
  },

  // Re-enable React dev-time bug detection
  reactStrictMode: true,

  // Power Google search result rich snippets
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // SEO + security headers (deployed via Cloudflare Pages)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS — enforce HTTPS for 2 years, include subdomains, preload list eligible
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Clickjacking protection
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // MIME-type sniffing protection
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy — strip query string when leaving HTTPS
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy — disable camera, microphone, geolocation unless user-granted
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
          // Content Security Policy — allow inline scripts/styles (Next.js needs them) + Cloudflare challenge
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'self'",
              "form-action 'self' https:",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/orbita/demo/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  // Allow @cloudflare/next-on-pages to find routes
  // (no rewrites needed — Next.js App Router handles /inmobiliaria/[city] natively)
};

export default nextConfig;
