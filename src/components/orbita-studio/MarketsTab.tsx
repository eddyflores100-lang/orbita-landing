"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin, ArrowUpRight, Database, Globe2, Users, Building2 } from "lucide-react"
import { usStates, mlsSystems, freeApis, cities } from "@/lib/data/orbita-data"

const TIER1 = ["miami", "houston", "los-angeles", "dallas-fort-worth", "san-antonio", "san-diego", "phoenix", "las-vegas"]
const TIER2 = [
  "riverside", "austin", "chicago", "new-york", "orlando", "tampa",
  "denver", "atlanta", "charlotte", "el-paso", "albuquerque", "boston",
  "washington-dc", "seattle", "fort-lauderdale", "naples",
]
const TIER3 = [
  "tucson", "sacramento", "fresno", "long-beach", "bakersfield", "anaheim",
  "santa-ana", "reno", "boise", "salt-lake-city", "santa-fe", "jacksonville",
  "sarasota", "oklahoma-city", "tulsa", "memphis", "nashville", "columbus",
  "cleveland", "philadelphia", "baltimore", "brownsville", "mcallen", "laredo",
]
const LATAM = [
  "quito", "guayaquil", "cuenca", "manta", "loja", "ambato", "santo-domingo",
  "lima", "arequipa", "cusco", "trujillo", "chiclayo", "piura",
  "bogota", "medellin", "cali", "cartagena", "barranquilla", "bucaramanga",
  "cdmx", "guadalajara", "monterrey", "merida", "cancun", "puebla",
  "buenos-aires", "cordoba", "rosario", "mendoza",
  "santiago", "valparaiso", "concepcion",
  "madrid", "barcelona", "valencia", "sevilla", "malaga",
]

export function MarketsTab() {
  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section className="pt-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-primary-glow font-mono">
          Geographic coverage
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
          50 USA + 32 LATAM cities
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant leading-relaxed max-w-3xl">
          Each city has its own SEO geo page with barrios, MLS integration,
          tax regime, foreign national programs, and agent pain points.
          JSON-LD Place + LocalBusiness + Service + FAQPage on every page.
        </p>
      </section>

      {/* Tier 1 highlighted cards */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald/30 bg-primary/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-primary-glow">
            <span className="pulse-dot" />
            Tier 1 · Launch priority
          </span>
          <span className="text-[11px] text-on-surface-variant font-mono">
            8 metros · highest Hispanic density + ROI
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {TIER1.map((slug, i) => {
            const c = cities.find((c) => c.slug === slug)
            if (!c) return null
            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
              >
                <Link
                  href={`/inmobiliaria/${slug}`}
                  className="group block specular-border luxury-glass rounded-xl p-4 h-full"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-emerald/30 grid place-items-center">
                      <MapPin className="h-4 w-4 text-primary-glow" />
                    </div>
                    <span className="text-[10px] font-mono text-primary-glow bg-primary/10 px-1.5 py-0.5 rounded">
                      {(c.population.match(/\(([^)]+)\)/)?.[1] ?? "").replace("Latino", "").trim()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-on-surface mb-0.5 group-hover:text-primary-glow transition-colors">
                    {c.name}
                  </h3>
                  <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-2">
                    {c.region} · USA
                  </div>
                  <div className="text-[10px] text-on-surface-variant line-clamp-2 leading-relaxed">
                    {c.neighborhoods.slice(0, 3).join(" · ")} · +{c.neighborhoods.length - 3}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Tier 2 + Tier 3 + LATAM chips */}
      <section className="space-y-4">
        {[
          { label: "Tier 2 · Scaling", slugs: TIER2, accent: "border-champagne/30 text-champagne-light" },
          { label: "Tier 3 · Growth markets", slugs: TIER3, accent: "border-white/15 text-on-surface-variant" },
          { label: "LATAM + Spain", slugs: LATAM, accent: "border-cyan/30 text-cyan-light" },
        ].map((group) => (
          <div key={group.label}>
            <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-on-surface-variant mb-2">
              {group.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.slugs.map((slug) => {
                const c = cities.find((c) => c.slug === slug)
                if (!c) return null
                return (
                  <Link
                    key={slug}
                    href={`/inmobiliaria/${slug}`}
                    className={`group flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-raised/80 border ${group.accent} text-[11px] font-mono hover:bg-surface-elevated transition-colors`}
                  >
                    {c.name}
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* US States table (compact) */}
      <section className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="bg-surface-raised/60 border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-on-surface">State-by-state tax + MLS</h3>
          <span className="text-[10px] font-mono text-on-surface-variant">
            {usStates.length} states · real Census ACS data
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-surface-base/40 border-b border-white/[0.06] text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5 font-mono font-medium">State</th>
                <th className="text-left px-4 py-2.5 font-mono font-medium">Latino %</th>
                <th className="text-left px-4 py-2.5 font-mono font-medium">Income tax</th>
                <th className="text-left px-4 py-2.5 font-mono font-medium">Property tax</th>
                <th className="text-left px-4 py-2.5 font-mono font-medium">MLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {usStates.map((s) => (
                <tr key={s.code} className="hover:bg-surface-raised/40 transition-colors">
                  <td className="px-4 py-2.5 text-on-surface font-medium">
                    {s.name} <span className="text-on-surface-variant text-[10px]">({s.code})</span>
                  </td>
                  <td className="px-4 py-2.5 text-primary-glow font-mono tabular-nums">{s.latinoPercent}</td>
                  <td className="px-4 py-2.5 font-mono">
                    {s.stateIncomeTax.startsWith("No") ? (
                      <span className="text-primary-glow">{s.stateIncomeTax}</span>
                    ) : (
                      <span className="text-champagne-light">{s.stateIncomeTax.slice(0, 30)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-on-surface-variant font-mono tabular-nums">{s.propertyTaxRate}</td>
                  <td className="px-4 py-2.5 text-on-surface-variant">{s.mlsSystem.split(",")[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MLS systems compact grid */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-cyan-light" />
          <h3 className="text-base font-semibold text-on-surface">18 MLS systems · 1 integration</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-4 max-w-3xl leading-relaxed">
          Via <code className="font-mono text-cyan-light">MLS Grid RESO Web API</code> —
          one integration covers NTREIS, HAR, Stellar, Bright, ARMLS, REcolorado.
          Plus 12 MLS direct feeds for full USA coverage.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {mlsSystems.slice(0, 12).map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
              className="p-3 rounded-lg bg-surface-raised/50 border border-white/[0.06] hover:border-cyan/30 transition-colors"
            >
              <div className="text-xs font-semibold text-on-surface mb-0.5">{m.name}</div>
              <div className="text-[10px] font-mono text-on-surface-variant leading-relaxed">
                {m.cities.split(",")[0]}
              </div>
              <div className={`text-[9px] mt-1 font-mono px-1.5 py-0.5 rounded inline-block ${
                m.priority === "Tier 1" ? "text-primary-glow bg-primary/10" :
                m.priority === "Tier 2" ? "text-champagne-light bg-champagne/10" :
                "text-on-surface-variant bg-white/5"
              }`}>
                {m.priority}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Free APIs (compact) */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Globe2 className="h-5 w-5 text-champagne-light" />
          <h3 className="text-base font-semibold text-on-surface">16 free APIs wired-in</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-4 max-w-3xl leading-relaxed">
          Public data sources so your agents get demographics, schools, weather,
          crime, flood zones — without paying for premium subscriptions.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {freeApis.slice(0, 12).map((api, i) => (
            <motion.div
              key={api.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: (i % 4) * 0.05 }}
              className="p-3 rounded-lg bg-surface-raised/50 border border-white/[0.06] hover:border-champagne/30 transition-colors"
            >
              <div className="text-xs font-medium text-on-surface mb-1.5">{api.name}</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-champagne-light mb-1">
                {api.category}
              </div>
              <div className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2">
                {api.description}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hispanic brokerages */}
      <section className="rounded-2xl border border-emerald/20 bg-primary/[0.04] p-5">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="h-5 w-5 text-primary-glow" />
          <h3 className="text-sm font-semibold text-on-surface">Hispanic brokerages — NAHREP Top-250</h3>
          <a
            href="https://nahrep.org/top-250"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[10px] text-cyan-light hover:underline font-mono"
          >
            source ↗
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { name: "Nan and Company Properties", city: "Houston, TX", note: "#1 NAHREP Top-250" },
            { name: "Brokerage Inc.", city: "Los Angeles, CA", note: "261 txns/year" },
            { name: "Avanti Way Realty", city: "Miami, FL", note: "Top NAHREP" },
            { name: "EWM Realty", city: "Miami, FL", note: "Berkshire Hathaway" },
            { name: "Kuper Sotheby's", city: "San Antonio, TX", note: "Top luxury Hispanic" },
            { name: "Keller Williams Latino", city: "Multiple cities", note: "Spanish Consultants training" },
          ].map((b) => (
            <div key={b.name} className="p-3 rounded-lg bg-surface-base/60 border border-white/[0.06]">
              <div className="text-xs font-medium text-on-surface mb-1">{b.name}</div>
              <div className="text-[10px] font-mono text-on-surface-variant">{b.city}</div>
              <div className="text-[10px] text-primary-glow mt-1">{b.note}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
