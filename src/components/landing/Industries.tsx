"use client"

import { motion } from "framer-motion"
import {
  ShieldCheck,
  Gauge,
  Database,
  Landmark,
  Home,
  TrendingUp,
} from "lucide-react"
import { industries } from "@/lib/data/products"

const iconMap = {
  ShieldCheck,
  Gauge,
  Database,
  Landmark,
  Home,
  TrendingUp,
}

export function Industries() {
  return (
    <section
      id="industries"
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
            Verticales
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Donde el stack aterriza
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            No construimos un producto horizontal. Construimos productos para
            industrias donde la confianza, la auditoría y el compliance no son
            opcionales — son el contrato.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((ind, i) => {
            const Icon = iconMap[ind.icon as keyof typeof iconMap] ?? ShieldCheck
            return (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="group relative bg-zinc-950 border border-zinc-900 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-11 w-11 rounded-lg bg-zinc-900 border border-zinc-800 grid place-items-center group-hover:border-amber-500/30 transition-colors">
                    <Icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">
                  {ind.name}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                  {ind.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ind.products.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
