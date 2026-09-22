"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  MapPin,
  Globe,
  MapPinned,
  LocateFixed,
  Camera,
  Waves,
  Factory,
  GraduationCap,
  Footprints,
  CloudSun,
  ShieldAlert,
  Building2,
  Briefcase,
  BookOpen,
  Database,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react"
import { freeApis } from "@/lib/data/orbita-data"

const iconMap: Record<string, LucideIcon> = {
  Users,
  MapPin,
  Globe,
  MapPinned,
  LocateFixed,
  Camera,
  Waves,
  Factory,
  GraduationCap,
  Footprints,
  CloudSun,
  ShieldAlert,
  Building2,
  Briefcase,
  BookOpen,
  Database,
}

const accentByClass: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-300",
}

export function OrbitaFreeApis() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyEndpoint = async (endpoint: string) => {
    try {
      await navigator.clipboard.writeText(endpoint)
      setCopied(endpoint)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      // Clipboard unavailable — silent no-op
    }
  }

  return (
    <section
      id="free-apis"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-emerald-500 font-medium">
            Free APIs integrated
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Public data, zero subscriptions
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Órbita pulls from public data sources — Census ACS, FEMA,
            GreatSchools, NOAA, FBI UCR, OpenStreetMap — so your agents get
            demographic, school, weather, crime and flood data without
            paying for premium data subscriptions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {freeApis.map((api, i) => {
            const Icon = iconMap[api.icon] ?? Database
            const accent =
              accentByClass[api.accent] ?? accentByClass.emerald
            return (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`h-9 w-9 rounded-lg border ${accent} grid place-items-center`}
                  >
                    <Icon className={`h-4 w-4 ${accent.split(" ")[2]}`} />
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md border ${accent}`}
                  >
                    {api.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1.5 leading-snug">
                  {api.name}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed mb-3 flex-1">
                  {api.description}
                </p>
                <div className="mb-2">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">
                    Endpoint
                  </div>
                  <button
                    type="button"
                    onClick={() => copyEndpoint(api.endpoint)}
                    className="group w-full flex items-center gap-1.5 text-left"
                    aria-label={`Copy endpoint ${api.endpoint}`}
                  >
                    <code className="flex-1 truncate text-[11px] text-zinc-300 font-mono bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1">
                      {api.endpoint}
                    </code>
                    {copied === api.endpoint ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" />
                    )}
                  </button>
                </div>
                <div className="pt-2 border-t border-zinc-900">
                  <span className="text-[10px] inline-block px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {api.auth}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
