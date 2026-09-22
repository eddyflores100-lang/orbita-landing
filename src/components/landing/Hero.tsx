"use client"

import { motion } from "framer-motion"
import { ArrowRight, Github, Sparkles, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { companyStats } from "@/lib/data/products"

export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12"
    >
      {/* Background grid + radial gradient */}
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/20 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 mb-6 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-300 tracking-wide">
              Wyoming LLC · Open-core AI infrastructure
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-zinc-50 leading-[1.05]"
          >
            Infraestructura de confianza
            <br />
            para la era de los
            <span className="relative inline-block ml-3">
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                agentes IA
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M2 9C50 3 250 3 298 9"
                  stroke="url(#grad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="300" y2="0">
                    <stop stopColor="#34d399" />
                    <stop offset="1" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl"
          >
            AliceLabs construye el stack open-source para agentes IA: tarjetas de
            confianza criptográficas, auditoría de 10 capas, memoria local sin LLM,
            GovTech federal y plataformas verticales para Oil &amp; Gas, PropTech y
            LegalTech. Cinco productos en producción. Listos para licenciamiento
            comercial.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          >
            <Button
              size="lg"
              asChild
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium h-12 px-6 shadow-lg shadow-emerald-500/25"
            >
              <a href="#products" className="flex items-center gap-2">
                Explorar productos
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-100 h-12 px-6"
            >
              <a
                href="https://github.com/eddyflores100-lang"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                Ver repos en GitHub
              </a>
            </Button>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex items-center gap-2 text-xs text-zinc-500"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
            <span>Sigstore-anchored · Ed25519 · Open-source · 14 paquetes npm</span>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-16 w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-hidden"
          >
            {companyStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-zinc-950/80 px-3 py-4 sm:px-4 sm:py-5 text-center"
              >
                <div className="text-xl sm:text-2xl font-bold text-zinc-50 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
