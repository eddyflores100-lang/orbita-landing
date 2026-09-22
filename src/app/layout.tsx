import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Órbita — Property Content Engine for AI agents",
    template: "%s · Órbita",
  },
  description:
    "Upload your property photos. Get AI cinematic video (CogVideoX-3), interactive 3D tour, public microsite with QR and per-lead analytics — in 15 minutes. No photographer. MCP server + OpenAPI 3.1 for AI agent integration. 50+ USA + LATAM cities.",
  keywords: [
    "AI real estate video",
    "3D real estate tour",
    "real estate marketing",
    "CogVideoX",
    "MCP server real estate",
    "Property Content Engine",
    "AI real estate",
    "real estate video AI",
    "3D tour real estate",
    "AliceLabs",
    "Órbita",
    "USA Hispanic real estate",
    "real estate Miami",
    "real estate Houston",
    "real estate Los Angeles",
    "real estate Dallas",
    "real estate San Antonio",
    "real estate Phoenix",
    "bilingual Realtor",
    "LATAM real estate",
    "inmobiliaria Quito",
    "inmobiliaria Lima",
    "inmobiliaria Bogotá",
    "inmobiliaria CDMX",
    "inmobiliaria Madrid",
  ],
  authors: [{ name: "AliceLabs LLC", url: "https://alicelabs.site" }],
  creator: "AliceLabs LLC",
  publisher: "AliceLabs LLC",
  applicationName: "Órbita",
  category: "real estate",
  alternates: {
    canonical: APP_URL,
    languages: {
      "es-419": APP_URL,
      "es-ES": APP_URL,
      en: APP_URL,
    },
  },
  openGraph: {
    title: "Órbita — Property Content Engine for AI agents",
    description:
      "Upload photos. Get video + 3D + microsite + QR + analytics in 15 minutes. MCP + OpenAPI for AI agent integration.",
    url: APP_URL,
    siteName: "Órbita",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/orbita/demo/poster.jpg",
        width: 1280,
        height: 720,
        alt: "Órbita demo: 199 m² apartment in La Floresta, Quito",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Órbita — Property Content Engine for AI agents",
    description:
      "Upload photos. Get video + 3D + microsite + QR + analytics in 15 minutes.",
    images: ["/orbita/demo/poster.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-token-placeholder",
    other: {
      "msvalidate.01": "bing-verification-token-placeholder",
      "yandex-verification": "yandex-verification-token-placeholder",
      "baidu-site-verification": "baidu-verification-token-placeholder",
      "p:domain_verify": "pinterest-verification-token-placeholder",
      "facebook-domain-verification": "facebook-verification-token-placeholder",
      "apple-developer-app-identifier": "apple-developer-token-placeholder",
      "norton-safeweb-site-verification": "norton-token-placeholder",
      "wot-verification": "wot-token-placeholder",
    },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
}

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AliceLabs LLC",
  alternateName: "Órbita",
  url: APP_URL,
  logo: `${APP_URL}/logo.svg`,
  description:
    "Open-source infrastructure for AI agent trust, GovTech, legal AI and security research. Órbita is the Property Content Engine for real-estate agents.",
  foundingDate: "2026",
  founders: [
    { "@type": "Person", name: "Edison Flores" },
    { "@type": "Person", name: "Alejandro Flores" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: "hello@alicelabs.site",
    areaServed: ["EC", "PE", "CO", "MX", "AR", "CL", "ES", "US", "UY", "PY"],
    availableLanguage: ["English", "Spanish"],
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sheridan",
    addressRegion: "Wyoming",
    addressCountry: "US",
  },
}

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Órbita",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Real Estate Marketing",
  operatingSystem: "Web",
  description:
    "Órbita is a Property Content Engine that turns real-estate photos into AI cinematic video, interactive 3D tours, public microsites with QR codes and per-property analytics — in minutes, no production crew required.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "19",
    highPrice: "199",
    offerCount: "4",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "AI Property Understanding (GLM-4.5v)",
    "AI Director (LLM shot planning)",
    "CogVideoX-3 image-to-video",
    "Procedural music (6 styles)",
    "AI voiceover with sidechain ducking",
    "3D point-cloud tour (Depth Anything V2)",
    "Public microsite with QR",
    "14-day analytics per property",
    "MCP server + OpenAPI 3.1 for AI agents",
    "WhatsApp Business lead capture",
  ],
  screenshot: `${APP_URL}/orbita/demo/poster.jpg`,
  softwareVersion: "1.0.0",
  datePublished: "2026-09-03",
  publisher: {
    "@type": "Organization",
    name: "AliceLabs LLC",
    url: "https://alicelabs.site",
  },
}

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Órbita",
  url: APP_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrganization),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSoftwareApp),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdWebSite),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-50 min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
