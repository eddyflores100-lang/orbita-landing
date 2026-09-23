"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, MapPin, ShieldCheck, Globe2, DollarSign } from "lucide-react"
import Link from "next/link"
import { usStates } from "@/lib/data/orbita-data"

const marketStats = [
  { label: "Hispanics in the US", value: "62M", source: "Census ACS 2024", icon: Users, accent: "violet" },
  { label: "Hispanic buying power", value: "$2.4T", source: "Hispanic Wealth Project", icon: DollarSign, accent: "amber" },
  { label: "Share of US population", value: "19%", source: "Hispanics = 19% of US population", icon: TrendingUp, accent: "emerald" },
  { label: "Foreign buyer median", value: "$482K", source: "NAR — Intl buyer median (15% premium)", icon: Globe2, accent: "cyan" },
]

const tier1 = [
  { city: "Miami", state: "FL", reason: "#1 foreign buyer gateway (Venezuelan/Argentine/Brazilian)", mls: "Stellar MLS", latinos: "55%" },
  { city: "Houston", state: "TX", reason: "Largest Hispanic pop (2.5M, mostly Mexican-American)", mls: "HAR MLS", latinos: "45%" },
  { city: "Los Angeles", state: "CA", reason: "Largest US Latino market (5.98M Hispanics)", mls: "CRMLS", latinos: "49%" },
  { city: "Dallas-Fort Worth", state: "TX", reason: "Fastest-growing Hispanic metro in TX", mls: "NTREIS", latinos: "29%" },
  { city: "San Antonio", state: "TX", reason: "64% Latino — highest % of large US cities", mls: "SABOR", latinos: "64%" },
  { city: "San Diego", state: "CA", reason: "Cross-border Tijuana/Mexicali buyers", mls: "CRMLS", latinos: "34%" },
  { city: "Phoenix", state: "AZ", reason: "Snowbirds + retirement (remote viewing essential)", mls: "ARMLS", latinos: "41%" },
  { city: "Las Vegas", state: "NV", reason: "Airbnb + investment + no income tax", mls: "GLVAR", latinos: "33%" },
]

const tier2 = [
  "Riverside / Inland Empire", "Austin", "Chicago", "New York", "Orlando", "Tampa",
  "Denver", "Atlanta", "Charlotte", "El Paso", "Albuquerque",
  "Boston", "Washington DC", "Seattle", "Fort Lauderdale", "Naples",
]

const accentText: Record<string, string> = {
  violet: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
}

export function OrbitaUsaFocus() {
  return (
    <section
      id="usa"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 right-1/4 w-[700px] h-[400px] bg-amber-500/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-amber-500 font-medium">
            USA Hispanic Market focus
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            62M Hispanics.
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-violet-300 bg-clip-text text-transparent">
              $2.4T in buying power.
            </span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Órbita is built for the #1 bilingual agent market in the USA.
            Hispanics are 19% of the population but only 8% of Realtors are
            bilingual — a massive gap. Our focus: 50+ US cities with dense
            Hispanic markets, MLS compliance, FHA/RESPA/TRID, and foreign
            national programs.
          </p>
        </motion.div>

        {/* Market stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16"
        >
          {marketStats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className={`p-5 rounded-xl border ${accentText[s.accent]}`}
              >
                <Icon className={`h-5 w-5 mb-3 ${accentText[s.accent].split(" ")[0]}`} />
                <div className="text-3xl font-bold text-zinc-50 mb-1">{s.value}</div>
                <div className="text-xs text-zinc-400 mb-2">{s.label}</div>
                <div className="text-[10px] text-zinc-600">{s.source}</div>
              </div>
            )
          })}
        </motion.div>

        {/* Tier 1 markets — Launch priority */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
              <ShieldCheck className="h-3 w-3" />
              Tier 1 — Launch priority
            </span>
            <span className="text-xs text-zinc-500">8 markets with the highest ROI + Hispanic density</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tier1.map((m, i) => {
              const slug = m.city.toLowerCase().replace(/[\s.]+/g, "-").replace(/-+/g, "-")
              return (
                <motion.div
                  key={m.city}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="group flex items-start gap-4 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-900/60 transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 grid place-items-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-base font-semibold text-zinc-100">
                        <Link
                          href={`/inmobiliaria/${slug}`}
                          className="hover:text-amber-300 transition-colors"
                        >
                          {m.city}
                        </Link>
                      </h3>
                      <span className="text-xs text-zinc-500">{m.state}</span>
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        {m.latinos} Latino
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                      {m.reason}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-600">
                      MLS: {m.mls}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Tier 2 cities chip list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs text-zinc-300">
              Tier 2 — Scaling
            </span>
            <span className="text-xs text-zinc-500">16 additional markets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tier2.map((city) => {
              const slug = city.toLowerCase().replace(/[\s./]+/g, "-").replace(/-+/g, "-")
              return (
                <Link
                  key={city}
                  href={`/inmobiliaria/${slug}`}
                  className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
                >
                  {city}
                </Link>
              )
            })}
          </div>
        </motion.div>

        {/* US States grid with tax regime + MLS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-2xl border border-zinc-800 overflow-hidden"
        >
          <div className="bg-zinc-900/40 px-5 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-100">
              State by state — tax regime + MLS + key market
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              The data bilingual agents need to communicate correctly to buyers
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-zinc-900/30 border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">State</th>
                  <th className="text-left px-4 py-2.5 font-medium">Pop</th>
                  <th className="text-left px-4 py-2.5 font-medium">% Latino</th>
                  <th className="text-left px-4 py-2.5 font-medium">State Income Tax</th>
                  <th className="text-left px-4 py-2.5 font-medium">Property Tax</th>
                  <th className="text-left px-4 py-2.5 font-medium">MLS</th>
                  <th className="text-left px-4 py-2.5 font-medium">Key market</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {usStates.map((s) => (
                  <tr key={s.code} className="hover:bg-zinc-900/30">
                    <td className="px-4 py-3 text-zinc-100 font-medium">
                      {s.name} <span className="text-zinc-600 text-[10px]">({s.code})</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{s.population}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-300 font-medium">{s.latinoPercent}</span>
                    </td>
                    <td className="px-4 py-3">
                      {s.stateIncomeTax.startsWith("No") ? (
                        <span className="text-emerald-400 font-medium">{s.stateIncomeTax}</span>
                      ) : (
                        <span className="text-amber-400">{s.stateIncomeTax}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-mono">{s.propertyTaxRate}</td>
                    <td className="px-4 py-3 text-zinc-300">{s.mlsSystem}</td>
                    <td className="px-4 py-3 text-zinc-500">{s.keyMarket}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
