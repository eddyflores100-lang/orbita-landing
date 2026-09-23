import { NextResponse } from "next/server"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

export const dynamic = "force-static"

// News items must stay in sync with /home/z/my-project/src/app/news/page.tsx
const newsItems = [
  {
    slug: "orbita-launches-usa-hispanic-market-focus",
    title: "Órbita launches USA Hispanic market focus",
    date: "2026-01-15",
    keywords: "Órbita, USA, Hispanic, real estate, AI",
  },
  {
    slug: "nahrep-partnership-announced",
    title: "Partnership with NAHREP announced",
    date: "2026-02-03",
    keywords: "Órbita, NAHREP, partnership, Latino agents",
  },
  {
    slug: "mcp-server-integration-live",
    title: "MCP server integration now live",
    date: "2026-02-20",
    keywords: "Órbita, MCP, Claude, AI agents",
  },
  {
    slug: "cogvideox-3-pipeline-production",
    title: "CogVideoX-3 pipeline now in production",
    date: "2026-03-10",
    keywords: "Órbita, CogVideoX, AI video, pipeline",
  },
  {
    slug: "fair-housing-act-compliance-baked-in",
    title: "Fair Housing Act compliance baked-in",
    date: "2026-03-22",
    keywords: "Órbita, Fair Housing Act, compliance, FHA",
  },
]

export function GET() {
  const urls = newsItems
    .map(
      (n) => `  <url>
    <loc>${BASE_URL}/news#${n.slug}</loc>
    <lastmod>${n.date}T00:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>Órbita</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${n.date}</news:publication_date>
      <news:title>${n.title}</news:title>
      <news:keywords>${n.keywords}</news:keywords>
    </news:news>
  </url>`,
    )
    .join("\n")

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.sitemaps.org/schemas/sitemap-news/0.9">
${urls}
</urlset>`

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  })
}
