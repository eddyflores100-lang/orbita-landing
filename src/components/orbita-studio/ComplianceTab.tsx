"use client"

import { motion } from "framer-motion"
import { Scale, CheckCircle2, Globe2 } from "lucide-react"
import { complianceData } from "@/lib/data/orbita-data"

const FOREIGN_PROGRAMS = [
  { name: "ITIN Mortgage", desc: "No SSN required, 20%+ down", lenders: "New American, NQM, Arbor, Griffin", states: "FL · TX · CA" },
  { name: "Foreign National Non-QM", desc: "Visa B1/B2/F1/H1B accepted", lenders: "Truss, Q Kapital, LendMiRe", states: "FL · TX · CA" },
  { name: "DSCR Investor Loan", desc: "Rental income qualification", lenders: "Visio, Kiavi, Lima One", states: "NV · AZ · TX · GA" },
  { name: "§1031 Exchange", desc: "Tax-deferred (45-day identify, 180-day close)", lenders: "Qualified Intermediaries", states: "All US" },
  { name: "FIRPTA withholding", desc: "15% buyer withholding on foreign sellers", lenders: "Form 8288 / 8288-B", states: "All US" },
]

export function ComplianceTab() {
  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section className="pt-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-champagne-light font-mono">
          US legal framework
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
          Built for FHA + RESPA + TRID
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant leading-relaxed max-w-3xl">
          Órbita is designed from the ground up to operate inside the US real
          estate legal framework. Fair Housing Act language is filtered in
          both Spanish and English. RESPA §8 prohibits kickbacks. TRID
          restricts loan terms in marketing. MLS IDX/VOW rules govern listing
          data. All baked-in, not bolted on.
        </p>
      </section>

      {/* Compliance frameworks grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complianceData.map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            className="specular-border luxury-glass rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-champagne/10 border border-champagne/30 grid place-items-center">
                <Scale className="h-5 w-5 text-champagne-light" />
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-champagne/10 border border-champagne/30 text-champagne-light font-mono">
                {c.code}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-on-surface mb-2">{c.name}</h3>
            <p className="text-[11px] text-on-surface-variant leading-relaxed mb-4">{c.summary}</p>
            <div className="space-y-1.5 pt-3 border-t border-white/[0.06]">
              <div className="text-[10px] uppercase tracking-wider font-mono text-on-surface-variant mb-2">
                Key rules
              </div>
              {c.rules.slice(0, 3).map((r) => (
                <div key={r} className="text-[10px] text-on-surface-variant flex items-start gap-1.5">
                  <span className="text-champagne-light mt-0.5">•</span>
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-start gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-primary-glow mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-primary-glow/80 leading-relaxed">
                {c.orbitaCompliance}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Foreign National programs */}
      <section className="rounded-2xl border border-champagne/30 bg-gradient-to-br from-champagne/5 to-surface-base/40 p-5 sm:p-7 specular-border">
        <div className="flex items-start gap-4 mb-5">
          <div className="h-12 w-12 rounded-xl bg-champagne/15 border border-champagne/30 grid place-items-center flex-shrink-0">
            <Globe2 className="h-6 w-6 text-champagne-light" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-champagne-light font-mono mb-1">
              Foreign National buyer programs
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-on-surface mb-1.5">
              For LATAM investors buying US property without SSN
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl">
              Miami, Houston, LA, Naples receive Venezuelan/Argentine/Brazilian
              buyers who can't visit before purchasing. Órbita integrates
              resource sections with these loan programs in every microsite.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FOREIGN_PROGRAMS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-3 rounded-lg bg-surface-base/60 border border-white/[0.06]"
            >
              <div className="text-xs font-semibold text-champagne-light mb-1.5">{p.name}</div>
              <div className="text-[10px] text-on-surface-variant mb-2 leading-relaxed">{p.desc}</div>
              <div className="text-[9px] font-mono text-on-surface-variant mb-1">
                Lenders: {p.lenders}
              </div>
              <div className="text-[9px] font-mono text-primary-glow">
                {p.states}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why this matters */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-surface-raised/40 border border-white/[0.06]">
          <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-primary-glow mb-2">
            Why compliance matters
          </div>
          <h3 className="text-sm font-semibold text-on-surface mb-2">
            Fair Housing Act violations = $25K+ per incident
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            HUD actively fines agents who use language like "perfect for young
            family" or "safe neighborhood" in marketing copy. Órbita's AI
            Director uses family-neutral language automatically — same copy in
            Spanish and English, both FHA-compliant.
          </p>
        </div>
        <div className="p-5 rounded-xl bg-surface-raised/40 border border-white/[0.06]">
          <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-cyan-light mb-2">
            Why MLS rules matter
          </div>
          <h3 className="text-sm font-semibold text-on-surface mb-2">
            Photo copyright = broker, not agent
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Under US law the photographer owns photo copyright. MLS licenses to
            broker. Agents cannot reuse others' photos. Órbita only accepts
            broker-owned media and licenses AI derivatives back to the broker —
            never scrapes third-party MLS photos.
          </p>
        </div>
      </section>
    </div>
  )
}
