import { NextResponse } from "next/server"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

export const dynamic = "force-static"

const now = new Date().toISOString()

export function GET() {
  // Demo poster image and any video thumbnails we serve
  const images = [
    {
      loc: `${BASE_URL}/orbita/demo/poster.jpg`,
      caption: "Órbita demo: 199 m² apartment in La Floresta, Quito",
      title: "Órbita demo property poster",
      license: `${BASE_URL}/legal`,
    },
  ]

  const urls = images
    .map(
      (img) => `  <url>
    <loc>${img.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <image:image>
      <image:loc>${img.loc}</image:loc>
      <image:caption>${img.caption}</image:caption>
      <image:title>${img.title}</image:title>
      <image:license>${img.license}</image:license>
    </image:image>
  </url>`,
    )
    .join("\n")

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.sitemaps.org/schemas/sitemap-image/1.1">
${urls}
</urlset>`

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
