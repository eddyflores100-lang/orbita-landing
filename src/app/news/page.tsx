import type { Metadata } from "next"
import Link from "next/link"
import { OrbitaNavbar } from "@/components/orbita-landing/OrbitaNavbar"
import { OrbitaFooter } from "@/components/orbita-landing/OrbitaFooter"
import { OrbitaBreadcrumbs } from "@/components/orbita-landing/OrbitaBreadcrumbs"

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

type NewsItem = {
  slug: string
  title: string
  date: string
  summary: string
  keywords: string
}

const news: NewsItem[] = [
  {
    slug: "orbita-launches-usa-hispanic-market-focus",
    title: "Órbita launches USA Hispanic market focus",
    date: "2026-01-15",
    summary:
      "Órbita today announced a USA-first strategy for the 62M-strong US Hispanic real estate market. The platform now ships with 50+ US city pages, MLS Grid RESO Web API integration across 18 systems, and FHA/RESPA/TRID/NAR compliance baked into the pipeline.",
    keywords: "Órbita, USA, Hispanic, real estate, AI",
  },
  {
    slug: "nahrep-partnership-announced",
    title: "Partnership with NAHREP announced",
    date: "2026-02-03",
    summary:
      "Órbita and the National Association of Hispanic Real Estate Professionals (NAHREP) announced a partnership to bring AI property video production to NAHREP Top-250 Latino agents across Florida, Texas, California and Arizona.",
    keywords: "Órbita, NAHREP, partnership, Latino agents",
  },
  {
    slug: "mcp-server-integration-live",
    title: "MCP server integration now live",
    date: "2026-02-20",
    summary:
      "Órbita's MCP server (HTTP JSON-RPC 2.0) is live at /api/mcp with 11 tools covering listing, create, delete, render and analytics operations. Claude, Cursor and Cline can drive the full pipeline without leaving the chat context.",
    keywords: "Órbita, MCP, Claude, AI agents",
  },
  {
    slug: "cogvideox-3-pipeline-production",
    title: "CogVideoX-3 pipeline now in production",
    date: "2026-03-10",
    summary:
      "Órbita's CogVideoX-3 image-to-video pipeline is now production-grade. Each photo is converted to a 5s cinematic clip with auto-built prompts (place + camera + atmosphere + quality guards). Clips are cached by SHA-1 of prompt+image for instant re-renders.",
    keywords: "Órbita, CogVideoX, AI video, pipeline",
  },
  {
    slug: "fair-housing-act-compliance-baked-in",
    title: "Fair Housing Act compliance baked-in",
    date: "2026-03-22",
    summary:
      "Órbita's AI Director now ships with a 'family-neutral' language filter and photo-subject filtering that excludes people from listing imagery. Combined with RESPA Section 8 documentation templates and TRID-compliant disclaimer calculators, bilingual agents can operate without legal risk.",
    keywords: "Órbita, Fair Housing Act, compliance, FHA",
  },
]

export const metadata: Metadata = {
  title: "News — Órbita",
  description:
    "Órbita news and press releases: USA Hispanic market launch, NAHREP partnership, MCP server integration, CogVideoX-3 production pipeline, Fair Housing Act compliance.",
  alternates: {
    canonical: `${APP_URL}/news`,
  },
  openGraph: {
    title: "News — Órbita",
    description:
      "Órbita news and press releases: USA Hispanic market launch, NAHREP partnership, MCP server integration, CogVideoX-3 production pipeline, Fair Housing Act compliance.",
    url: `${APP_URL}/news`,
    type: "website",
  },
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })

export default function NewsPage() {
  return (
    <main className="bg-zinc-950 min-h-screen flex flex-col">
      <OrbitaNavbar />
      <OrbitaBreadcrumbs items={[{ label: "News", href: "/news" }]} />

      <section className="py-12 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-[0.18em] text-amber-500 font-medium">
            News &amp; press
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Órbita newsroom
          </h1>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed max-w-2xl">
            Company announcements, partnership news, product launches and
            compliance updates. For media inquiries, contact
            <a
              href="mailto:hello@alicelabs.site"
              className="text-amber-300 hover:text-amber-200 ml-1"
            >
              hello@alicelabs.site
            </a>
            .
          </p>
        </div>
      </section>

      <section className="pb-24 flex-1">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ul className="space-y-8">
            {news.map((item) => {
              const jsonLd = {
                "@context": "https://schema.org",
                "@type": "NewsArticle",
                headline: item.title,
                datePublished: `${item.date}T00:00:00Z`,
                dateModified: `${item.date}T00:00:00Z`,
                url: `${APP_URL}/news#${item.slug}`,
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": `${APP_URL}/news#${item.slug}`,
                },
                publisher: {
                  "@type": "Organization",
                  name: "AliceLabs LLC",
                  alternateName: "Órbita",
                  url: APP_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${APP_URL}/logo.svg`,
                  },
                },
                author: {
                  "@type": "Organization",
                  name: "AliceLabs LLC",
                },
                description: item.summary,
                keywords: item.keywords,
                inLanguage: "en",
              }

              return (
                <li
                  key={item.slug}
                  id={item.slug}
                  className="border border-zinc-900 rounded-2xl bg-zinc-950 p-6 sm:p-8 hover:border-zinc-800 transition-colors scroll-mt-24"
                >
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                  />
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <time
                      dateTime={item.date}
                      className="text-xs uppercase tracking-wider text-amber-400 font-medium"
                    >
                      {formatDate(item.date)}
                    </time>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-500">Press release</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-50 mb-3 tracking-tight">
                    {item.title}
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-5">
                    {item.summary}
                  </p>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
                  >
                    Read more →
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <OrbitaFooter />
    </main>
  )
}
