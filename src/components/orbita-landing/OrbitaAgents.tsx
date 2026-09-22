"use client"

import { motion } from "framer-motion"
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { usAgentTypes } from "@/lib/data/orbita-data"
import { Badge } from "@/components/ui/badge"

const toneAccent: Record<string, { chip: string; bar: string }> = {
  luxury: {
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    bar: "bg-amber-500",
  },
  casual: {
    chip: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    bar: "bg-violet-500",
  },
}

export function OrbitaAgents() {
  return (
    <section
      id="agents"
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
          <span className="text-xs uppercase tracking-[0.18em] text-amber-500 font-medium">
            USA-focused agent types
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            5 bilingual agent profiles
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Each profile has unique pain points in the US-Hispanic market.
            Órbita solves them with calibrated pricing, integrations and
            specific compliance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {usAgentTypes.map((agent, i) => {
            const accent = toneAccent[agent.tone] ?? toneAccent.luxury
            return (
              <motion.div
                key={agent.slug}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative bg-zinc-950 border border-zinc-900 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all"
              >
                <div className={`absolute top-0 left-0 h-1 w-full ${accent.bar} rounded-t-2xl opacity-60`} />

                <div className="flex items-start justify-between gap-3 mb-4 mt-2">
                  <h3 className="text-base font-semibold text-zinc-100">
                    {agent.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 px-2 border ${accent.chip}`}
                  >
                    {agent.tone}
                  </Badge>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  {agent.description}
                </p>

                {/* Pain points */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-amber-500/80 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Pain points
                  </div>
                  <ul className="space-y-1.5">
                    {agent.painPoints.slice(0, 3).map((p) => (
                      <li key={p} className="text-xs text-zinc-500 flex items-start gap-2">
                        <span className="text-amber-500/60 mt-1">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Orbita solution */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-500/80 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    Órbita solution
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {agent.orbitaSolution}
                  </p>
                </div>

                {/* US states coverage */}
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1.5">
                    US states
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agent.usStates.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Starting at
                    </div>
                    <div className={`text-sm font-bold ${accent.chip.split(" ")[1]}`}>
                      {agent.startingPrice}
                    </div>
                  </div>
                  <a
                    href="#pricing"
                    className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1"
                  >
                    View pricing
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
