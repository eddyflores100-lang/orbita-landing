"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Play, Sparkles, Shield, Bot, MapPin } from "lucide-react"

export function StudioTab() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  // Parallax: hero image lifts as user scrolls
  const heroLift = useTransform(scrollYProgress, [0, 1], [0, -60])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96])

  return (
    <div ref={ref} className="space-y-12 sm:space-y-16">
      {/* ===== HERO ===== */}
      <section className="relative pt-8 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-primary/10 px-3 py-1 mb-5"
            >
              <Sparkles className="h-3 w-3 text-primary-glow" />
              <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-primary-glow">
                v2.0 · Studio interface live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-sans font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-on-surface"
            >
              Upload photos.
              <br />
              <span className="bg-gradient-to-r from-primary-glow via-cyan-light to-champagne-light bg-clip-text text-transparent">
                Órbita renders the rest.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-2xl"
            >
              Cinematic AI video, 3D tours, bilingual microsites, QR + analytics — in 15 minutes.
              For US Hispanic real estate agents serving the 62M Latino market.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <button className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider font-mono">
                <Play className="h-3.5 w-3.5" />
                Watch live demo
              </button>
              <a
                href="/openapi.json"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-raised/80 border border-white/[0.08] text-xs font-mono text-on-surface hover:border-emerald/30 transition-colors"
              >
                <Bot className="h-3.5 w-3.5 text-primary-glow" />
                /openapi.json
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono text-on-surface-variant"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-primary-glow" />
                FHA + RESPA + TRID compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="h-3 w-3 text-cyan-light" />
                MCP + OpenAPI 3.1
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-champagne-light" />
                50 USA + 32 LATAM cities
              </span>
            </motion.div>
          </div>

          {/* Right: demo video with parallax */}
          <motion.div
            style={{ y: heroLift, scale: heroScale }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-cyan-glow/10 to-transparent rounded-2xl blur-2xl opacity-60" />
              <div className="relative aspect-video rounded-2xl overflow-hidden luxury-glass">
                <video
                  src="/orbita/demo/la-floresta-3d.mp4"
                  poster="/orbita/demo/poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  aria-label="Órbita demo: 199 m² property in La Floresta, Quito — CogVideoX-3 + 3D tour"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-surface-base/95 via-surface-base/70 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-glow mb-0.5">
                        Live · CogVideoX-3
                      </div>
                      <div className="text-sm font-medium text-on-surface">
                        199 m² · La Floresta, Quito
                      </div>
                    </div>
                    <a
                      href="/p/la-floresta-199"
                      className="text-[10px] px-2.5 py-1 rounded-md bg-primary/15 border border-emerald/40 text-primary-glow hover:bg-primary/25 transition-colors font-mono"
                    >
                      open ↗
                    </a>
                  </div>
                </div>
                {/* Top telemetry */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-surface-base/70 border border-white/10 backdrop-blur-md flex items-center gap-1.5">
                  <span className="pulse-dot" />
                  <span className="text-[9px] font-mono uppercase tracking-wider text-on-surface-variant">
                    rendering · 0:14
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/[0.06]">
        {[
          { label: "Photos in", value: "5 min", accent: "text-primary-glow" },
          { label: "Master 1080p", value: "12-15 min", accent: "text-cyan-light" },
          { label: "Outputs", value: "16:9 · 9:16 · 1:1", accent: "text-champagne-light" },
          { label: "USA cities", value: "50 markets", accent: "text-primary-glow" },
          { label: "MLS systems", value: "18 integrated", accent: "text-cyan-light" },
          { label: "Free APIs", value: "16 wired-in", accent: "text-champagne-light" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-base/80 px-3 py-4 text-center"
          >
            <div className={`text-lg font-bold font-mono tabular-nums ${stat.accent}`}>
              {stat.value}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-1 font-mono">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* ===== WHY ÓRBITA (concise pain → solution) ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            pain: "Professional photo/video: $400-$1,200 per listing",
            solution: "Órbita produces the same pipeline at $19-$49 per property. 5-10x listings per day at the same budget.",
            accent: "border-emerald/30",
            badge: "Cost",
          },
          {
            pain: "5-7 day delivery from photographer",
            solution: "15 minutes end-to-end. Listing published before your competitor even finishes their morning coffee.",
            accent: "border-cyan/30",
            badge: "Speed",
          },
          {
            pain: "International buyers can't visit before flying in",
            solution: "Tour 3D in microsite + WhatsApp lead capture. Venezuelan/Argentine/Brazilian investors buy from LATAM.",
            accent: "border-champagne/30",
            badge: "Reach",
          },
        ].map((c) => (
          <motion.div
            key={c.pain}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className={`specular-border luxury-glass rounded-xl p-5 border ${c.accent}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-[0.18em] font-mono text-primary-glow bg-primary/10 px-2 py-0.5 rounded">
                {c.badge}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant" />
            </div>
            <div className="text-xs text-on-surface-variant line-through mb-2 font-mono">
              {c.pain}
            </div>
            <p className="text-sm text-on-surface leading-relaxed">{c.solution}</p>
          </motion.div>
        ))}
      </section>

      {/* ===== MARKETNOW ATTRIBUTION ===== */}
      <section className="rounded-2xl border border-emerald/30 bg-gradient-to-br from-primary/5 to-surface-base/40 p-6 sm:p-8 specular-border">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="h-12 w-12 grid place-items-center rounded-xl bg-primary/15 border border-emerald/30 flex-shrink-0">
            <Bot className="h-6 w-6 text-primary-glow" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary-glow font-mono mb-1">
              Verified via MarketNow registry
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-2 tracking-tight">
              Órbita is a verified MCP server in the MarketNow trust registry
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed max-w-3xl mb-4">
              68,388 MCP servers indexed. 9,248 skills. Órbita exposes 12 tools
              (list_properties, get_property, ingest_photos, analyze_property,
              direct_property, start_render, get_job, get_qr, get_analytics,
              publish_microsite, etc.) via JSON-RPC 2.0 at{" "}
              <code className="font-mono text-primary-glow">/api/mcp</code>. Trust card
              fingerprint anchored to{" "}
              <a href="https://marketnow.site" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-glow">
                marketnow.site
              </a>
              .
            </p>
            <div className="flex flex-wrap gap-2">
              {["MCP", "OpenAPI 3.1", "ai-plugin.json", "agent.json", "llms.txt", "agents.txt"].map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-surface-base/60 border border-white/[0.08] text-on-surface-variant font-mono"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <a
            href="/api/mcp"
            className="btn-glow self-start flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider font-mono whitespace-nowrap"
          >
            Inspect MCP
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </section>
    </div>
  )
}
