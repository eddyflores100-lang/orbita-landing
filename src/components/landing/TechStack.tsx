"use client"

import { motion } from "framer-motion"
import { techStack } from "@/lib/data/products"

export function TechStack() {
  return (
    <section
      id="stack"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
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
            Engineering
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Stack verificado en producción
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Cada pieza del stack fue elegida por una razón técnica: TypeScript
            para type-safety end-to-end, Sigstore para transparencia criptográfica,
            TensorFlow.js para inferencia edge en industriales, ChromaDB para
            memoria local-first. Sin atajos.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {techStack.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
              className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-cyan-500/30 hover:bg-zinc-900/40 transition-all"
            >
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">
                {t.category}
              </div>
              <div className="text-sm font-medium text-zinc-200">{t.name}</div>
            </motion.div>
          ))}
        </div>

        {/* Engineering principles strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-zinc-900 rounded-xl border border-zinc-900 overflow-hidden"
        >
          {[
            {
              title: "Open-core",
              body: "SDKs MIT libres. Verticales industriales AL-1.0 con licencia comercial.",
            },
            {
              title: "Local-first",
              body: "Memoria, embeddings e inferencia sin egress de datos del cliente.",
            },
            {
              title: "Audit-ready",
              body: "Sigstore Rekor anchored. Cada claim re-derivable desde URLs públicas.",
            },
          ].map((p) => (
            <div key={p.title} className="bg-zinc-950 p-6">
              <h3 className="text-sm font-semibold text-cyan-300 mb-1.5">
                {p.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
