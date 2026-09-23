import { NextResponse } from "next/server"
import { cities } from "@/lib/data/orbita-data"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

export const dynamic = "force-static"

const now = new Date().toISOString()

export function GET() {
  const latamCities = cities.filter((c) => c.countryCode !== "US")

  const urls = latamCities
    .map(
      (c) => `  <url>
    <loc>${BASE_URL}/inmobiliaria/${c.slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
