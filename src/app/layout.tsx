import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

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
    "Sube las fotos de tu propiedad. Órbita genera video cinematográfico IA (CogVideoX-3), tour 3D interactivo (Depth Anything V2), micrositio con QR y analytics. Para agentes inmobiliarios en USA y LATAM. 18 MLS integrados.",
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
    apple: [
      { url: "/favicon-192.png", sizes: "192x192" },
    ],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
  openGraph: {
    title: "Órbita — Property Content Engine for AI agents",
    description:
      "Sube las fotos de tu propiedad. Órbita genera video cinematográfico IA, tour 3D interactivo, micrositio con QR y analytics. 18 MLS integrados.",
    url: APP_URL,
    siteName: "Órbita Property Engine",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/logo.svg",
        width: 64,
        height: 64,
        alt: "Órbita Property Engine — orbital ring logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Órbita — Property Content Engine for AI agents",
    description:
      "Sube las fotos de tu propiedad. Órbita genera video IA + tour 3D + micrositio + analytics.",
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
      "p:domain_verify": "pinterest-verification-token-placeholder",
      "facebook-domain-verification": "facebook-verification-token-placeholder",
      "apple-developer-app-identifier": "apple-developer-token-placeholder",
      "norton-safeweb-site-verification": "norton-token-placeholder",
      "wot-verification": "wot-token-placeholder",
    },
  },
  category: "real estate",
  applicationName: "Órbita Property Engine",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  manifest: "/site.webmanifest",
  themeColor: "#05070B",
}

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AliceLabs LLC",
  alternateName: "Órbita Property Engine",
  url: APP_URL,
  logo: `${APP_URL}/logo.svg`,
  description:
    "Órbita Property Engine — Consola de Ultra Lujo & IA Inmobiliaria. Video cinematográfico IA, tour 3D interactivo, micrositio con QR y analytics. 18 MLS integrados vía RESO Web API.",
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
  name: "Órbita Property Engine",
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
    "CogVideoX-3 image-to-video cinematic generation",
    "Depth Anything V2 monocular depth 3D tours",
    "AI Director with 11 camera moves + 8 tone profiles",
    "Procedural music synthesis (6 styles)",
    "AI voiceover with sidechain ducking (4 Spanish voices)",
    "Public microsite with dynamic QR + WhatsApp CTA",
    "14-day per-property analytics (VIEW/VIDEO_PLAY/CTA/WHATSAPP/SCAN/CONTACT)",
    "MCP server + OpenAPI 3.1 for AI agents (Claude/Cursor/Cline)",
    "18 MLS systems via RESO Web API (MLS Grid)",
    "50+ USA cities with geo SEO + JSON-LD",
    "Fair Housing Act + RESPA + TRID compliance baked-in",
    "Studio interface with Aurora background + 5 tabs",
  ],
  screenshot: `${APP_URL}/orbita/demo/poster.jpg`,
  softwareVersion: "3.0.0",
  datePublished: "2026-09-25",
  publisher: {
    "@type": "Organization",
    name: "AliceLabs LLC",
    url: "https://alicelabs.site",
  },
}

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Órbita Property Engine",
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
    <html lang="es" suppressHydrationWarning className="dark">
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
