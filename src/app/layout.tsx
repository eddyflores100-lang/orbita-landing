import type { Metadata } from "next"
import { Bodoni_Moda, Hanken_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    "Órbita",
    "Property Content Engine",
    "CogVideoX",
    "Depth Anything V2",
    "tour 3D inmobiliario",
    "video inmobiliario IA",
    "MCP server inmobiliario",
    "OpenAPI 3.1",
    "MLS Grid",
    "RESO Web API",
    "AliceLabs",
    "real estate AI",
    "CogVideoX-3",
    "inmobiliaria IA",
    "micrositio inmobiliario",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/favicon-192.png", sizes: "192x192" }],
  },
  openGraph: {
    title: "Órbita — Property Content Engine for AI agents",
    description:
      "Upload photos. Get AI video + 3D tours + microsites + analytics in 15 minutes.",
    url: APP_URL,
    siteName: "Órbita",
    type: "website",
    locale: "es_ES",
    images: [{ url: "/logo.svg", width: 148, height: 32, alt: "Órbita logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Órbita — Property Content Engine for AI agents",
    description: "Upload photos. Get AI video + 3D tours + microsites + analytics.",
    images: ["/logo.svg"],
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
    },
  },
  category: "real estate",
  applicationName: "Órbita",
  manifest: "/site.webmanifest",
  themeColor: "#0d0e11",
}

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AliceLabs LLC",
  alternateName: "Órbita",
  url: APP_URL,
  logo: `${APP_URL}/logo.svg`,
  description: "Órbita Property Content Engine — AI video, 3D tours, microsites, MCP server, OpenAPI 3.1.",
  foundingDate: "2026",
  founders: [
    { "@type": "Person", name: "Edison Flores" },
    { "@type": "Person", name: "Alejandro Flores" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    email: "hello@alicelabs.site",
    areaServed: ["EC", "PE", "CO", "MX", "AR", "CL", "ES", "US"],
    availableLanguage: ["Spanish", "English"],
  },
  address: { "@type": "PostalAddress", addressLocality: "Sheridan", addressRegion: "Wyoming", addressCountry: "US" },
}

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Órbita",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Real Estate Marketing",
  operatingSystem: "Web",
  offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: "19", highPrice: "199", offerCount: "4" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "127" },
  featureList: [
    "CogVideoX-3 image-to-video", "Depth Anything V2 3D tours", "MCP server (8 tools)",
    "OpenAPI 3.1", "Fair Housing Act compliance", "50+ USA cities geo SEO",
  ],
  screenshot: `${APP_URL}/orbita/demo/poster.jpg`,
  softwareVersion: "3.2.0",
  datePublished: "2026-09-25",
  publisher: { "@type": "Organization", name: "AliceLabs LLC", url: "https://alicelabs.site" },
}

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Órbita",
  url: APP_URL,
  potentiALAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
      </head>
      <body className={`${bodoni.variable} ${hanken.variable} ${jetbrains.variable} antialiased bg-surface-base text-on-surface min-h-screen flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
