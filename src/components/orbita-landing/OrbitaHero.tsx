"use client"

import { motion } from "framer-motion"
import { ArrowRight, Play, Shield, Bot, MapPin, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OrbitaHero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-zinc-950">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-amber-500/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300 backdrop-blur-sm">
                <Flag className="h-3 w-3" />
                USA Hispanic Market · 62M Latinos · $2.4T buying power
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                <Sparkles className="h-3 w-3" />
                50+ USA cities · 18 MLS integrations
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.05]"
            >
              Upload your photos.
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-violet-300 bg-clip-text text-transparent">
                Órbita does the rest.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl"
            >
              For bilingual agents in the USA. Upload photos → get{" "}
              <span className="text-zinc-200">AI cinematic video</span>,{" "}
              <span className="text-zinc-200">interactive 3D tour</span>,{" "}
              <span className="text-zinc-200">bilingual microsite (es/en)</span> and{" "}
              <span className="text-zinc-200">WhatsApp lead capture</span>. In
              minutes. Fair Housing Act + RESPA + TRID + NAR + MLS compliance
              baked-in. MCP server + OpenAPI for AI agent integration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <Button
                size="lg"
                asChild
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium h-12 px-6 shadow-lg shadow-amber-500/25"
              >
                <a href="#demo" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Watch live demo
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-100 h-12 px-6"
              >
                <a href="#usa" className="flex items-center gap-2">
                  View USA markets
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </motion.div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500/70" />
                FHA + RESPA + TRID compliant
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-violet-500/70" />
                MCP server + OpenAPI 3.1
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-500/70" />
                50+ USA cities · MLS Grid integration
              </span>
            </motion.div>
          </div>

          {/* Right: demo video player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-500/30 to-emerald-500/20 rounded-2xl blur-2xl opacity-50" />
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl shadow-amber-500/20">
                <video
                  src="/orbita/demo/la-floresta-3d.mp4"
                  poster="/orbita/demo/poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  aria-label="Órbita demo: AI property video in Quito"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-amber-300 uppercase tracking-wider mb-0.5">
                        Live demo · CogVideoX-3
                      </div>
                      <div className="text-sm font-medium text-zinc-100">
                        199 m² Apartment · La Floresta, Quito
                      </div>
                    </div>
                    <a
                      href="/p/la-floresta-199"
                      className="text-xs px-3 py-1.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-200 hover:bg-amber-500/30 transition-colors"
                    >
                      Open microsite →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats strip — USA focus */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden"
        >
          {[
            { label: "Photos in", value: "5 min" },
            { label: "1080p master in", value: "12-15 min" },
            { label: "Output formats", value: "16:9 · 9:16 · 1:1" },
            { label: "Microsite languages", value: "es/en/pt/fr" },
            { label: "MLS integrated", value: "18 systems" },
            { label: "USA cities", value: "50+ markets" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-950/80 px-3 py-4 sm:px-4 sm:py-5 text-center"
            >
              <div className="text-lg sm:text-xl font-bold text-zinc-50 tracking-tight">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

import { Sparkles } from "lucide-react"
