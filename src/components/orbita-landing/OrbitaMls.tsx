"use client"

import { motion } from "framer-motion"
import { Database, CheckCircle2, ArrowUpRight } from "lucide-react"
import { mlsSystems } from "@/lib/data/orbita-data"

const priorityAccent: Record<string, string> = {
  "Tier 1": "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "Tier 2": "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "Tier 3": "border-zinc-700 bg-zinc-800/50 text-zinc-400",
}

export function OrbitaMls() {
  return (
    <section
      id="mls"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/4 left-1/3 w-[700px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-500 font-medium">
            MLS Integration — RESO Web API
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            18 MLS systems · 1 integration
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Via <span className="text-cyan-300">MLS Grid (RESO Web API)</span> Órbita
            connects to 6+ MLSs with a single integration — NTREIS, HAR,
            Stellar, Bright, ARMLS, REcolorado. Plus 12 more MLSs with direct
            feeds. Daily refresh, broker attribution, photo-licensing compliant.
          </p>
        </motion.div>

        {/* MLS Grid callout */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-zinc-950 p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 grid place-items-center flex-shrink-0">
              <Database className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-zinc-100">MLS Grid (RESO Web API)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  Tier 1 · recommended
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                A single integration covers 6+ MLSs: NTREIS (Dallas), HAR
                (Houston), Stellar (Florida), Bright (Mid-Atlantic), ARMLS
                (Phoenix), REcolorado (Denver). Daily refresh, OData filter,
                RESO-compliant. The standard for multi-state brokerages.
              </p>
              <div className="flex flex-wrap gap-2">
                {["NTREIS", "HAR", "Stellar", "Bright", "ARMLS", "REcolorado"].map((m) => (
                  <span
                    key={m}
                    className="text-[10px] px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-cyan-300 font-mono"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* MLS systems grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mlsSystems.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.05 }}
              className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-cyan-500/30 hover:bg-zinc-900/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-100">{m.name}</h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md border ${priorityAccent[m.priority]}`}
                >
                  {m.priority}
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">
                {m.coverage}
              </p>
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">
                Cities
              </div>
              <div className="text-xs text-zinc-300 mb-3">{m.cities}</div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-900">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-zinc-500">{m.integration}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hispanic brokerages strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-zinc-100">
              Hispanic brokerages already using video marketing
            </h3>
            <a
              href="https://nahrep.org/top-250"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              NAHREP Top-250
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Nan and Company Properties", city: "Houston, TX", note: "#1 NAHREP Top-250" },
              { name: "Brokerage Inc.", city: "Los Angeles, CA", note: "261 transactions annually" },
              { name: "Avanti Way Realty", city: "Miami, FL", note: "Top NAHREP" },
              { name: "EWM Realty", city: "Miami, FL", note: "Berkshire Hathaway" },
              { name: "Kuper Sotheby's", city: "San Antonio, TX", note: "Top luxury Hispanic" },
              { name: "Keller Williams Latino", city: "Multiple cities", note: "Spanish Consultants training" },
            ].map((b) => (
              <div
                key={b.name}
                className="p-3 rounded-lg bg-zinc-950 border border-zinc-800"
              >
                <div className="text-xs font-medium text-zinc-100 mb-1">{b.name}</div>
                <div className="text-[10px] text-zinc-500">{b.city}</div>
                <div className="text-[10px] text-emerald-400 mt-1">{b.note}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-4 italic">
            Prospect list: NAHREP Top-250 Latino agents — high-volume agents
            who already invest in bilingual marketing.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
