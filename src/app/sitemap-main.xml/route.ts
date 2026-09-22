import { NextResponse } from "next/server"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

export const dynamic = "force-static"

const now = new Date().toISOString()

export function GET() {
  const staticUrls = [
    {
      url: BASE_URL,
      lastmod: now,
      changefreq: "daily",
      priority: "1.0",
    },
    {
      url: `${BASE_URL}/news`,
      lastmod: now,
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      url: `${BASE_URL}/p/la-floresta-199`,
      lastmod: now,
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      url: `${BASE_URL}/openapi.json`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.3",
    },
    {
      url: `${BASE_URL}/llms.txt`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.3",
    },
    {
      url: `${BASE_URL}/.well-known/ai-plugin.json`,
      lastmod: now,
      changefreq: "monthly",
      priority: "0.2",
    },
  ]

  const urls = staticUrls
    .map(
      (u) => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join("\n")

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
