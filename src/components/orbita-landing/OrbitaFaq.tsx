"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { faqs } from "@/lib/data/orbita-data"

export function OrbitaFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-amber-500 font-medium">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Frequently asked questions
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Total honesty. If you can't find the answer, write us at{" "}
            <a
              href="mailto:hello@alicelabs.site"
              className="text-amber-300 hover:text-amber-200"
            >
              hello@alicelabs.site
            </a>
            .
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-zinc-900/50 transition-colors"
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-zinc-100">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform flex-shrink-0 mt-1 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">
                  {f.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
