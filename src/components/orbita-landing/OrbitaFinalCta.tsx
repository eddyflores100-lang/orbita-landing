"use client"

import { motion } from "framer-motion"
import { ArrowRight, Mail, Bot, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OrbitaFinalCta() {
  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-500/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-[0.18em] text-violet-500 font-medium">
            Start today
          </span>
          <h2 className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight text-zinc-50 leading-[1.05]">
            Your next property
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent">
              deserves Órbita
            </span>
          </h2>
          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Upload your photos. In 15 minutes you get cinematic video, 3D tour,
            microsite and analytics. No photographer, no waiting, no hidden
            costs.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="bg-violet-500 hover:bg-violet-400 text-zinc-950 font-medium h-12 px-8 shadow-lg shadow-violet-500/25"
            >
              <a href="#pricing" className="flex items-center gap-2">
                Start with 1 property
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-100 h-12 px-8"
            >
              <a href="/p/la-floresta-199" className="flex items-center gap-2">
                Watch live demo
              </a>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-1.5 text-xs text-zinc-500">
              <Mail className="h-4 w-4 text-violet-400" />
              <a href="mailto:hello@alicelabs.site" className="hover:text-zinc-200 transition-colors">
                hello@alicelabs.site
              </a>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-xs text-zinc-500">
              <Bot className="h-4 w-4 text-violet-400" />
              <a href="/openapi.json" className="hover:text-zinc-200 transition-colors">
                /openapi.json
              </a>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-xs text-zinc-500">
              <MapPin className="h-4 w-4 text-violet-400" />
              <span>Wyoming, USA · LATAM ops</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
