import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://orbita-9wl.pages.dev"

const jaka = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
})

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Órbita — Property Content Engine for AI agents",
    template: "%s · Órbita",
  },
  description:
    "Upload photos. Órbita renders cinematic AI video, 3D tours, bilingual microsites with QR, and per-property analytics in 15 minutes. MCP server + OpenAPI 3.1 for agents. 50+ USA cities with MLS Grid integration.",
  keywords: [
    "AI real estate video",
    "3D tour real estate",
    "CogVideoX",
    "MCP server real estate",
    "Property Content Engine",
    "Órbita",
    "AliceLabs",
    "US Hispanic real estate",
    "bilingual real estate agent",
    "foreign national buyer",
    "MLS Grid RESO",
  ],
  authors: [{ name: "AliceLabs LLC", url: "https://alicelabs.site" }],
  creator: "AliceLabs LLC",
  publisher: "AliceLabs LLC",
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
      "Upload photos. Get AI video + 3D tours + microsites + analytics in 15 minutes.",
    url: APP_URL,
    siteName: "Órbita",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/orbita/demo/poster.jpg",
        width: 1280,
        height: 720,
        alt: "Órbita demo: 199 m² property in La Floresta, Quito",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Órbita — Property Content Engine for AI agents",
    description:
      "Upload photos. Get AI video + 3D tours + microsites + analytics in 15 minutes.",
    images: ["/orbita/demo/poster.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
  category: "real estate",
  applicationName: "Órbita",
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
    "Property Content Engine for US Hispanic real estate agents. AI video, 3D tours, microsites, MCP server, OpenAPI 3.1 spec. 50+ USA cities with MLS Grid integration.",
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
    availableLanguage: ["Spanish", "English"],
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
    "5-tab studio interface",
    "Aurora animated background",
  ],
  screenshot: `${APP_URL}/orbita/demo/poster.jpg`,
  softwareVersion: "2.0.0",
  datePublished: "2026-09-22",
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
  potentiALAction: {
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body
        className={`${jaka.variable} ${mono.variable} antialiased bg-surface-base text-on-surface min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
