"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin, ArrowRight, Flag } from "lucide-react"
import { cities } from "@/lib/data/orbita-data"

// Group by country, but put USA first
const countryOrder = ["USA", "Ecuador", "México", "España", "Colombia", "Argentina", "Chile", "Perú"]

export function OrbitaCities() {
  const countryGroups = cities.reduce((acc, c) => {
    if (!acc[c.country]) acc[c.country] = []
    acc[c.country].push(c)
    return acc
  }, {} as Record<string, typeof cities>)

  return (
    <section
      id="cities"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-emerald-500 font-medium">
            SEO Geo · 50+ USA + LATAM
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Where your market is
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Each city has its own page with neighborhoods, property types,
            price ranges, agent pain points and FAQ. JSON-LD Place +
            LocalBusiness + Service + FAQPage. Sitemap at /sitemap.xml. USA
            markets first — 50+ cities across 14 states with MLS, tax regimes
            and foreign national info.
          </p>
        </motion.div>

        {/* USA Highlighted banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-zinc-950 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Flag className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-bold text-zinc-100">
              USA — 50+ cities with MLS integrations
            </h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            Tier 1 markets (launch): Miami, Houston, Los Angeles, Dallas-Fort
            Worth, San Antonio, San Diego, Phoenix, Las Vegas. Tier 2 (scaling):
            17 additional markets.
          </p>
          <div className="flex flex-wrap gap-2">
            {(countryGroups["USA"] ?? []).map((c) => (
              <Link
                key={c.slug}
                href={`/inmobiliaria/${c.slug}`}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all"
              >
                <MapPin className="h-3 w-3" />
                {c.name}, {c.region}
                <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Other countries grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {countryOrder
            .filter((country) => country !== "USA")
            .map((country) => {
              const countryCities = countryGroups[country]
              if (!countryCities) return null
              return (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {country}
                    </h3>
                    <span className="text-xs text-zinc-600">
                      {countryCities.length}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {countryCities.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/inmobiliaria/${c.slug}`}
                          className="group flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-300 transition-colors"
                        >
                          <MapPin className="h-3 w-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                          {c.name}
                          <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
        </div>

        {/* Country stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-px bg-zinc-900 rounded-xl border border-zinc-900 overflow-hidden"
        >
          {countryOrder.map((country) => {
            const countryCities = countryGroups[country] ?? []
            const isUSA = country === "USA"
            return (
              <Link
                key={country}
                href={`/inmobiliaria/${countryCities[0]?.slug ?? "miami"}`}
                className={`px-3 py-4 text-center hover:bg-zinc-900 transition-colors ${
                  isUSA ? "bg-amber-500/10" : "bg-zinc-950/80"
                }`}
              >
                <div className={`text-lg font-bold ${isUSA ? "text-amber-300" : "text-zinc-50"}`}>
                  {countryCities.length}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">
                  {isUSA ? "USA " + country : country}
                </div>
              </Link>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
