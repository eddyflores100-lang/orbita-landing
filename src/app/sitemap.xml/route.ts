import { NextResponse } from "next/server"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

export const dynamic = "force-static"

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE_URL}/sitemap-main.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-usa.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-latam.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-images.xml</loc></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-news.xml</loc></sitemap>
</sitemapindex>`

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
