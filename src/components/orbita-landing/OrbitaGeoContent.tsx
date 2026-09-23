"use client"

import { motion } from "framer-motion"
import { MapPin, ArrowRight, Globe, Gauge } from "lucide-react"
import type { City } from "@/lib/data/orbita-data"

export function OrbitaGeoContent({ city }: { city: City }) {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-zinc-950">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-500/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
              <MapPin className="h-3 w-3" />
              {city.name}, {city.country}
            </span>
            <span className="text-xs text-zinc-500">
              {city.region} · Pop. {city.population} · {city.timezone}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.05]">
            {city.hero}
          </h1>

          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-3xl">
            {city.description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="/#contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-zinc-950 font-medium text-sm transition-colors"
            >
              Start in {city.name}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/p/la-floresta-199"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-sm transition-colors"
            >
              Watch live demo
            </a>
          </div>

          {/* Quick stats grid */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Neighborhoods", value: String(city.neighborhoods.length) },
              { label: "Property types", value: String(city.propertyTypes.length) },
              { label: "Languages", value: city.language.includes("/") ? "2" : "1" },
              { label: "Currency", value: city.currency },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3">
                <div className="text-emerald-400 text-lg font-bold">{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Orbita value highlight */}
          <div className="mt-10 rounded-xl border border-violet-500/30 bg-violet-500/5 p-6">
            <div className="flex items-start gap-4">
              <Globe className="h-6 w-6 text-violet-400 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-zinc-100 mb-2 flex items-center gap-2">
                  <Gauge className="h-3.5 w-3.5 text-violet-400" />
                  Why Órbita in {city.name}
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">{city.orbitaValue}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
