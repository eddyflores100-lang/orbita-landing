"use client"

import { motion } from "framer-motion"
import {
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Database,
  Landmark,
  Home,
  TrendingUp,
  Github,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { products, type Product } from "@/lib/data/products"

const accentMap: Record<
  string,
  {
    text: string
    bg: string
    border: string
    glow: string
    chip: string
    bar: string
  }
> = {
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    glow: "group-hover:shadow-emerald-500/20",
    chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    bar: "from-emerald-400 to-emerald-600",
    dot: "bg-emerald-500",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "group-hover:shadow-amber-500/20",
    chip: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    bar: "from-amber-400 to-amber-600",
    dot: "bg-amber-500",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    glow: "group-hover:shadow-cyan-500/20",
    chip: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    bar: "from-cyan-400 to-cyan-600",
    dot: "bg-cyan-500",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    glow: "group-hover:shadow-rose-500/20",
    chip: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    bar: "from-rose-400 to-rose-600",
    dot: "bg-rose-500",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    glow: "group-hover:shadow-violet-500/20",
    chip: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    bar: "from-violet-400 to-violet-600",
    dot: "bg-violet-500",
  },
}

const productIcons: Record<string, typeof ShieldCheck> = {
  marketnow: ShieldCheck,
  "vigia-ml": Activity,
  memex: Database,
  opensam: Landmark,
  orbita: Home,
  opensource: TrendingUp,
}

const statusLabels: Record<string, string> = {
  live: "En producción",
  beta: "Beta",
  enterprise: "Licencia enterprise",
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const accent = accentMap[product.accent]
  const Icon = productIcons[product.id] ?? ShieldCheck

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.08 }}
      className={`group relative bg-zinc-950/60 border ${accent.border} rounded-2xl overflow-hidden hover:shadow-2xl ${accent.glow} transition-all duration-500 flex flex-col`}
    >
      {/* Top gradient bar */}
      <div
        className={`h-1 bg-gradient-to-r ${accent.bar} opacity-80`}
        aria-hidden
      />

      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg ${accent.bg} ${accent.border} border grid place-items-center`}
            >
              <Icon className={`h-5 w-5 ${accent.text}`} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-zinc-50 tracking-tight">
                {product.name}
              </h3>
              <p className={`text-xs font-medium ${accent.text}`}>
                {product.tagline}
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 group-hover:rotate-0 transition-all" />
        </div>

        {/* Category + status */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">
            {product.category}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] h-5 px-2 border ${accent.chip}`}
          >
            {statusLabels[product.status]}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          {product.description}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {product.metrics.map((m) => (
            <div
              key={m.label}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-2.5"
            >
              <div className={`text-sm font-bold ${accent.text}`}>{m.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <ul className="space-y-1.5 mb-5">
          {product.highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-2 text-xs text-zinc-400"
            >
              <span className={`mt-1 h-1 w-1 rounded-full ${accent.dot} flex-shrink-0`} />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {product.stack.slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-500"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-zinc-900 flex items-center justify-between">
          <span className="text-[10px] text-zinc-600">{product.license}</span>
          <div className="flex items-center gap-1">
            <a
              href={`https://github.com/${product.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              aria-label={`${product.name} on GitHub`}
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-md ${accent.text} hover:bg-zinc-900 transition-colors flex items-center gap-1 text-xs font-medium`}
            >
              Visitar
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export function Products() {
  return (
    <section id="products" className="relative py-24 sm:py-32 bg-zinc-950">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full" />
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
            Portfolio 2026
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Cinco productos. Cinco verticales.
            <br />
            <span className="text-zinc-500">Un stack de confianza.</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Cada producto es independiente, licenciable por separado, y opera en
            un mercado con compradores reales. Juntos forman la capa de confianza
            que los agentes IA necesitan para operar en producción regulada.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
