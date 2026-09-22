import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { cities, agentTypes, type City } from "@/lib/data/orbita-data"
import { OrbitaGeoContent } from "@/components/orbita-landing/OrbitaGeoContent"
import { OrbitaGeoFaq } from "@/components/orbita-landing/OrbitaGeoFaq"
import { OrbitaBreadcrumbs } from "@/components/orbita-landing/OrbitaBreadcrumbs"
import { OrbitaNavbar } from "@/components/orbita-landing/OrbitaNavbar"
import { OrbitaFooter } from "@/components/orbita-landing/OrbitaFooter"

type Props = { params: Promise<{ city: string }> }

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params
  const city = cities.find((c) => c.slug === slug)
  if (!city) return { title: "City not found — Órbita" }

  const keywords = [
    `real estate video ${city.name}`,
    `3D tour ${city.name}`,
    `real estate ${city.name}`,
    ...city.keywords,
  ]

  return {
    title: `${city.hero}`,
    description: city.description.slice(0, 160),
    keywords,
    alternates: {
      canonical: `https://orbita.alicelabs.site/inmobiliaria/${city.slug}`,
      languages: {
        es: `https://orbita.alicelabs.site/inmobiliaria/${city.slug}`,
        en: `https://orbita.alicelabs.site/en/real-estate/${city.slug}`,
      },
    },
    openGraph: {
      title: city.hero,
      description: city.description.slice(0, 200),
      url: `https://orbita.alicelabs.site/inmobiliaria/${city.slug}`,
      siteName: "Órbita",
      type: "website",
      locale: city.countryCode === "US" ? "en_US" : "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: city.hero,
      description: city.description.slice(0, 200),
    },
  }
}

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params
  const city = cities.find((c) => c.slug === slug)
  if (!city) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `https://orbita.alicelabs.site/inmobiliaria/${city.slug}#place`,
        name: city.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.region,
          addressCountry: city.countryCode,
        },
        geo: {
          "@type": "GeoCoordinates",
          description: `${city.name}, ${city.country}`,
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `https://orbita.alicelabs.site/inmobiliaria/${city.slug}#business`,
        name: `Órbita ${city.name}`,
        description: city.description,
        url: `https://orbita.alicelabs.site/inmobiliaria/${city.slug}`,
        image: "https://orbita.alicelabs.site/orbita/demo/poster.jpg",
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: city.region,
          addressCountry: city.countryCode,
        },
        areaServed: city.neighborhoods.map((n) => ({
          "@type": "Place",
          name: `${n}, ${city.name}`,
        })),
        knowsAbout: city.propertyTypes,
        priceRange: "$$-$$$$",
        openingHours: "Mo-Su 00:00-24:00",
        telephone: "+1-307-555-0123",
      },
      {
        "@type": "Service",
        "@id": `https://orbita.alicelabs.site/inmobiliaria/${city.slug}#service`,
        serviceType: "Real Estate Video Marketing",
        provider: { "@id": `https://orbita.alicelabs.site/inmobiliaria/${city.slug}#business` },
        areaServed: { "@id": `https://orbita.alicelabs.site/inmobiliaria/${city.slug}#place` },
        description: city.orbitaValue,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "19",
          highPrice: "199",
          offerCount: "4",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `https://orbita.alicelabs.site/inmobiliaria/${city.slug}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `How does Órbita work for brokerages in ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: city.orbitaValue,
            },
          },
          {
            "@type": "Question",
            name: `Which neighborhoods of ${city.name} does Órbita cover?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Órbita covers the main neighborhoods of ${city.name}: ${city.neighborhoods.slice(0, 6).join(", ")} and more.`,
            },
          },
          {
            "@type": "Question",
            name: `What are the typical pain points of real estate agents in ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: city.agentPainPoints.join(" "),
            },
          },
        ],
      },
    ],
  }

  const nearby = city.nearbyCities
    .map((s) => cities.find((c) => c.slug === s))
    .filter((c): c is City => Boolean(c))

  return (
    <main className="bg-zinc-950 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <OrbitaNavbar />

      <OrbitaBreadcrumbs
        items={[
          { label: city.country, href: city.countryCode === "US" ? "/#usa" : "/#cities" },
          { label: city.name, href: "#" },
        ]}
      />

      <OrbitaGeoContent city={city} />

      {/* Pain points section */}
      <section className="py-16 border-t border-zinc-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-3">
            Real estate agent pain points in {city.name}
          </h2>
          <p className="text-zinc-400 mb-8 max-w-3xl">
            We know the real problems brokerages and agents face in {city.name}. Órbita solves them with AI automation.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {city.agentPainPoints.map((pain, i) => (
              <li key={i} className="flex items-start gap-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-zinc-300">{pain}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-16 border-t border-zinc-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-3">
            Neighborhoods of {city.name} where Órbita operates
          </h2>
          <p className="text-zinc-400 mb-8 max-w-3xl">
            We produce professional real estate content for the main neighborhoods of {city.name}.
          </p>
          <div className="flex flex-wrap gap-2">
            {city.neighborhoods.map((n) => (
              <Link
                key={n}
                href={`/inmobiliaria/${city.slug}?barrio=${encodeURIComponent(n.toLowerCase().replace(/\s+/g, "-"))}`}
                className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
              >
                {n}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Property types */}
      <section className="py-16 border-t border-zinc-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-3">
            Property types in {city.name}
          </h2>
          <p className="text-zinc-400 mb-8 max-w-3xl">
            Órbita adapts the cinematic tone to the property type and target audience.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {city.propertyTypes.map((pt) => (
              <div key={pt} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-lg text-center">
                <span className="text-sm text-zinc-300">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price ranges */}
      <section className="py-16 border-t border-zinc-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-3">
            Price ranges in {city.name}
          </h2>
          <p className="text-zinc-400 mb-8 max-w-3xl">
            We know the market — typical price ranges in {city.name} for each property type.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {city.priceRange.map((pr) => (
              <div key={pr.type} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <div className="text-xs uppercase tracking-wider text-zinc-500 mb-1">{pr.type}</div>
                <div className="text-sm text-zinc-100">
                  <span className="text-emerald-400 font-semibold">{pr.min}</span>
                  <span className="text-zinc-600 mx-2">—</span>
                  <span className="text-emerald-400 font-semibold">{pr.max}</span>
                </div>
                <div className="text-xs text-zinc-600 mt-1">{pr.currency}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent types for this city */}
      <section className="py-16 border-t border-zinc-900">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-3">
            Agent types in {city.name} already using Órbita
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {agentTypes.slice(0, 4).map((a) => (
              <div key={a.slug} className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-lg">
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">{a.name}</h3>
                <p className="text-xs text-zinc-500 mb-2">{a.description}</p>
                <p className="text-xs text-emerald-300">{a.orbitaSolution}</p>
                <div className="text-xs text-zinc-400 mt-2">Starting at: <span className="text-emerald-400">{a.startingPrice}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrbitaGeoFaq city={city} />

      {/* Nearby cities */}
      {nearby.length > 0 && (
        <section className="py-16 border-t border-zinc-900">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-50 mb-6">
              Cities near {city.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {nearby.map((n) => (
                <Link
                  key={n.slug}
                  href={`/inmobiliaria/${n.slug}`}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 hover:border-emerald-500/40 hover:text-emerald-300 transition-colors"
                >
                  {n.name}, {n.country}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24 border-t border-zinc-900">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-4">
            Are you a real estate agent in {city.name}?
          </h2>
          <p className="text-lg text-zinc-400 mb-8">
            Start producing professional real estate video in minutes. No photographer costs, no multi-day wait.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-zinc-950 font-medium hover:bg-emerald-400 transition-colors"
          >
            Start with 1 property
          </Link>
          <Link
            href="/"
            className="ml-3 inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-800 text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            View full Órbita
          </Link>
        </div>
      </section>
      <OrbitaFooter />
    </main>
  )
}
