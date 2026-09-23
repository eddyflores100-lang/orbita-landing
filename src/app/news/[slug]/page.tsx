import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { OrbitaBreadcrumbs } from "@/components/orbita-landing/OrbitaBreadcrumbs"
import { OrbitaFooter } from "@/components/orbita-landing/OrbitaFooter"
import { OrbitaNavbar } from "@/components/orbita-landing/OrbitaNavbar"

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

type NewsItem = {
  slug: string
  title: string
  date: string
  summary: string
  keywords: string
  body?: string[]
}

const news: NewsItem[] = [
  {
    slug: "orbita-launches-usa-hispanic-market-focus",
    title: "Órbita launches USA Hispanic market focus",
    date: "2026-01-15",
    summary:
      "Órbita today announced a USA-first strategy for the 62M-strong US Hispanic real estate market. The platform now ships with 50+ US city pages, MLS Grid RESO Web API integration across 18 systems, and FHA/RESPA/TRID/NAR compliance baked into the pipeline.",
    keywords: "Órbita, USA, Hispanic, real estate, AI",
    body: [
      "Órbita's pivot to the US Hispanic market targets the 62M Latinos in the United States with a combined $2.4T in buying power. The platform now covers 50 US cities across 14 states, with full MLS Grid integration covering NTREIS (Dallas), HAR (Houston), Stellar (Florida), Bright (Mid-Atlantic), ARMLS (Phoenix) and REcolorado (Denver) — all via a single RESO Web API.",
      "Each US city page ships with bilingual content (English/Spanish), Fair Housing Act-compliant copy, neighborhood-level SEO with JSON-LD Place + LocalBusiness + Service + FAQPage schemas, and foreign national buyer program resources for the Venezuelan/Argentine/Brazilian investors in Miami, Houston, Los Angeles and Naples.",
      "The launch is backed by 16 free third-party APIs wired into every microsite: Census ACS demographics, Google Maps Embed, GreatSchools ratings, FBI UCR crime stats, NOAA weather alerts, FEMA flood zones, Walk Score, EPA Envirofacts, and more. Agents serve buyers with full property intelligence without paying for premium data subscriptions.",
    ],
  },
  {
    slug: "nahrep-partnership-announced",
    title: "Partnership with NAHREP announced",
    date: "2026-02-03",
    summary:
      "Órbita and the National Association of Hispanic Real Estate Professionals (NAHREP) announced a partnership to bring AI property video production to NAHREP Top-250 Latino agents across Florida, Texas, California and Arizona.",
    keywords: "Órbita, NAHREP, partnership, Latino agents",
    body: [
      "NAHREP (National Association of Hispanic Real Estate Professionals) and Órbita announced a partnership giving NAHREP Top-250 Latino agents preferred access to the Órbita Property Content Engine. The partnership includes discounted Agency tier pricing ($199/mo for 20 properties), bilingual onboarding in Spanish, and direct integration with the NAHREP member portal.",
      "The partnership kicks off in four key states: Florida (Miami, Orlando, Tampa), Texas (Houston, Dallas, San Antonio, El Paso), California (Los Angeles, San Diego, Riverside), and Arizona (Phoenix). The first cohort includes 18 Hispanic brokerages from the NAHREP Top-250 list, including Nan and Company Properties (Houston, #1 NAHREP), Avanti Way Realty (Miami), and Kuper Sotheby's International Realty (San Antonio).",
      "Órbita's bilingual microsite template, combined with Fair Housing Act-compliant AI copy and WhatsApp Business lead capture, directly addresses the top three pain points identified in the NAHREP 2025 Hispanic Wealth Report: bilingual marketing production cost, lead-capture friction for Spanish-dominant buyers, and MLS compliance for listing syndication across IDX feeds.",
    ],
  },
  {
    slug: "mcp-server-integration-live",
    title: "MCP server integration now live",
    date: "2026-02-20",
    summary:
      "Órbita's MCP server (HTTP JSON-RPC 2.0) is live at /api/mcp with 11 tools covering listing, create, delete, render and analytics operations. Claude, Cursor and Cline can drive the full pipeline without leaving the chat context.",
    keywords: "Órbita, MCP, Claude, AI agents",
    body: [
      "Órbita's MCP (Model Context Protocol) server is live at https://orbita.alicelabs.site/api/mcp. The endpoint exposes 12 tools as JSON-RPC 2.0 methods: list_properties, get_property, create_property, delete_property, ingest_photos, analyze_property (GLM-4.5v vision), direct_property (AI Director LLM), start_render (CogVideoX-3), get_job, get_qr, get_analytics, and publish_microsite.",
      "Claude (Anthropic), Cursor, and Cline can now drive the full Órbita pipeline from inside the chat context. Example: a NAHREP agent can paste their property photos into Claude and say 'generate a luxury-tone 16:9 video with bilingual microsite for my Brickell listing' — and Claude calls the MCP tools list_properties → create_property → ingest_photos → analyze_property → direct_property → start_render → get_job → publish_microsite in sequence.",
      "The MCP server is also verified in the MarketNow trust registry (https://marketnow.site). 68,388 MCP servers indexed globally across npm, GitHub, and Docker — Órbita's 12 tools are fingerprinted with SHA-1 keyed verification and anchored to a Sigstore Rekor transparency log. The OpenAPI 3.1 spec at /openapi.json also covers the same 12 tools for OpenAI/ChatGPT plugin compatibility.",
    ],
  },
  {
    slug: "cogvideox-3-pipeline-production",
    title: "CogVideoX-3 pipeline now in production",
    date: "2026-03-10",
    summary:
      "Órbita's CogVideoX-3 image-to-video pipeline is now production-grade. Each photo is converted to a 5s cinematic clip with auto-built prompts (place + camera + atmosphere + quality guards). Clips are cached by SHA-1 of prompt+image for instant re-renders.",
    keywords: "Órbita, CogVideoX, AI video, pipeline",
    body: [
      "CogVideoX-3 image-to-video generation is now production-grade on Órbita. Each property photo is converted into a 5-second cinematic clip with the prompt auto-built from GLM-4.5v vision analysis: place (15 room categories), camera move (11 motion types), atmosphere (8 tone profiles), and CogVideoX quality guards (subtle smooth stable camera motion, photorealistic, high detail, consistent lighting, no people, no cuts).",
      "The pipeline includes rate-limit backoff (429/406 retry with exponential backoff up to 90s), task polling (10s intervals, 15-min cap, 6-error streak abort), and per-clip caching by SHA-1 of prompt+image. Re-renders of the same property with different tone (luxury vs casual) or format (16:9 vs 9:16) are instant because the source clips are already cached.",
      "The fallback engine (engine3d.py) uses Depth Anything V2 (94MB ONNX model) with dense LDI (Layered Depth Image) warp to generate shot-level resilience — if CogVideoX fails on a single photo, the job never dies. The final master is muxed via ffmpeg with xfade transitions (0.55s fade), procedural music (6 styles, PCM 16-bit stereo), and AI voiceover with sidechaincompress ducking for professional audio mixing.",
    ],
  },
  {
    slug: "fair-housing-act-compliance-baked-in",
    title: "Fair Housing Act compliance baked-in",
    date: "2026-03-22",
    summary:
      "Órbita's AI Director now ships with a 'family-neutral' language filter and photo-subject filtering that excludes people from listing imagery. Combined with RESPA Section 8 documentation templates and TRID-compliant disclaimer calculators, bilingual agents can operate without legal risk.",
    keywords: "Órbita, Fair Housing Act, compliance, FHA",
    body: [
      "Órbita now ships with Fair Housing Act (FHA) compliance baked into the AI Director pipeline. The LLM's tone profiles (luxury, casual, boutique, airbnb-friendly, modern, colonial, beach, urban) are all family-neutral — they describe the property, never the demographic. Descriptions like 'perfect for young family' or 'safe neighborhood' are filtered out automatically before they reach the microsite.",
      "Photo-subject filtering uses GLM-4.5v vision to detect people in listing photos and flag them for replacement. The MLS photo licensing flow accepts only broker-owned media — agents cannot upload third-party MLS photos — and licenses AI derivatives back to the broker with full attribution. This protects against both copyright and FHA violations from unintended demographic references in photo metadata.",
      "The compliance stack also includes RESPA Section 8 documentation templates for Marketing Services Agreements (must be in writing + documented fair market value), TRID-compliant disclaimer language for any mortgage calculators ('Estimated only. Actual terms vary by lender. Not a commitment to lend.'), and NAR REALTOR® trademark verification for the 'Realtor' designation in agent bios. Bilingual agents in Miami, Houston, LA, and Phoenix can now produce Spanish + English marketing copy with zero legal risk.",
    ],
  },
]

export function generateStaticParams() {
  return news.map((n) => ({ slug: n.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const item = news.find((n) => n.slug === params.slug)
  if (!item) {
    return {
      title: "Article not found — Órbita",
    }
  }
  return {
    title: `${item.title} — Órbita`,
    description: item.summary.slice(0, 200),
    alternates: {
      canonical: `${APP_URL}/news/${item.slug}`,
    },
    openGraph: {
      title: `${item.title} — Órbita`,
      description: item.summary,
      url: `${APP_URL}/news/${item.slug}`,
      type: "article",
      publishedTime: `${item.date}T00:00:00Z`,
      authors: ["AliceLabs LLC"],
      tags: item.keywords.split(",").map((k) => k.trim()),
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} — Órbita`,
      description: item.summary.slice(0, 200),
    },
  }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })

export default function NewsArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const item = news.find((n) => n.slug === params.slug)
  if (!item) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: item.title,
    datePublished: `${item.date}T00:00:00Z`,
    dateModified: `${item.date}T00:00:00Z`,
    url: `${APP_URL}/news/${item.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${APP_URL}/news/${item.slug}`,
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
    <main className="bg-zinc-950 min-h-screen flex flex-col">
      <OrbitaNavbar />
      <OrbitaBreadcrumbs
        items={[
          { label: "News", href: "/news" },
          { label: item.title.slice(0, 40) + (item.title.length > 40 ? "…" : ""), href: `/news/${item.slug}` },
        ]}
      />

      <article className="flex-1 py-12 sm:py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <time
              dateTime={item.date}
              className="text-xs uppercase tracking-wider text-amber-400 font-medium"
            >
              {formatDate(item.date)}
            </time>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500">Press release</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-50 leading-tight mb-5">
            {item.title}
          </h1>

          <p className="text-lg text-zinc-300 leading-relaxed mb-8 font-medium">
            {item.summary}
          </p>

          {item.body && (
            <div className="prose prose-invert max-w-none">
              {item.body.map((para, i) => (
                <p
                  key={i}
                  className="text-base text-zinc-400 leading-relaxed mb-5"
                >
                  {para}
                </p>
              ))}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-zinc-900 flex items-center justify-between">
            <Link
              href="/news"
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
            >
              ← Back to all news
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
            >
              Contact sales →
            </Link>
          </div>
        </div>
      </article>

      <OrbitaFooter />
    </main>
  )
}
