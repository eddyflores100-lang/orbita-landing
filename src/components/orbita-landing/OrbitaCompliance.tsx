"use client"

import { motion } from "framer-motion"
import { Scale, CheckCircle2, Globe2 } from "lucide-react"
import { complianceData } from "@/lib/data/orbita-data"

export function OrbitaCompliance() {
  return (
    <section
      id="compliance"
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
          <span className="text-xs uppercase tracking-[0.18em] text-emerald-500 font-medium">
            USA Compliance
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Built for the US legal framework
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Órbita complies with the Fair Housing Act, RESPA, TRID, the NAR
            Code of Ethics and MLS rules by design — not bolted on. It is
            baked into every layer of the product so bilingual agents can
            operate without legal risk.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceData.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 grid place-items-center">
                  <Scale className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
                  {c.code}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">{c.name}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">{c.summary}</p>

              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">
                  Key rules
                </div>
                <ul className="space-y-1">
                  {c.rules.slice(0, 3).map((r) => (
                    <li key={r} className="text-[11px] text-zinc-500 flex items-start gap-1.5">
                      <span className="text-emerald-500/60 mt-0.5">•</span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-zinc-900">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                    {c.orbitaCompliance}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Foreign National programs strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-lg bg-amber-500/10 border border-amber-500/30 grid place-items-center flex-shrink-0">
              <Globe2 className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1">
                Foreign National buyer programs — for LATAM buyers in the USA
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Miami, Houston, LA and Naples receive Latin American buyers
                who buy without an SSN. Órbita integrates a resource section
                with these programs in every microsite (with TRID-compliant
                disclaimers).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { name: "ITIN mortgage", desc: "No SSN, 20%+ down", lenders: "New American, NQM, Arbor" },
              { name: "Foreign National Non-QM", desc: "Visa B1/B2/F1/H1B", lenders: "Truss, Q Kapital, LendMiRe" },
              { name: "DSCR Investor", desc: "Rental income qualification", lenders: "Visio, Kiavi, Lima One" },
              { name: "§1031 Exchange", desc: "Tax-deferred, 45/180 day timelines", lenders: "Qualified Intermediaries" },
              { name: "FIRPTA", desc: "15% foreign seller withholding", lenders: "Form 8288 / 8288-B" },
            ].map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800"
              >
                <div className="text-xs font-semibold text-amber-300 mb-1">{p.name}</div>
                <div className="text-[10px] text-zinc-500 mb-2">{p.desc}</div>
                <div className="text-[10px] text-zinc-600">{p.lenders}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
