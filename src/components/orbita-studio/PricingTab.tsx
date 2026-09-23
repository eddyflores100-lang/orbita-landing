"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Check, ArrowRight, ChevronDown } from "lucide-react"
import { pricingTiers, faqs } from "@/lib/data/orbita-data"

export function PricingTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section className="pt-4 text-center max-w-3xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.18em] text-primary-glow font-mono">
          Pay per property · no setup fee
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
          You only pay for what you render
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
          No setup fee. No annual contract. No cancellation. Start with 1
          property, scale to 20/mo, or self-host on-prem for enterprise.
          Volume discounts up to 40% off on Agency and Enterprise tiers.
        </p>
      </section>

      {/* Pricing tiers */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {pricingTiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`relative rounded-2xl p-5 flex flex-col ${
              tier.highlight
                ? "border-2 border-emerald/40 bg-gradient-to-br from-primary/[0.08] to-surface-base/40 shadow-[0_0_40px_-10px_rgba(16,185,129,0.35)]"
                : "border border-white/[0.06] bg-surface-raised/40"
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-md bg-primary text-surface-base font-mono font-bold uppercase tracking-wider">
                Most chosen
              </span>
            )}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-on-surface">{tier.name}</h3>
              <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{tier.description}</p>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-on-surface font-mono tabular-nums">{tier.price}</span>
                <span className="text-[10px] text-on-surface-variant font-mono">{tier.period}</span>
              </div>
            </div>
            <ul className="space-y-1.5 mb-5 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                  <Check className={`h-3 w-3 mt-0.5 flex-shrink-0 ${tier.highlight ? "text-primary-glow" : "text-cyan-light"}`} />
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className={`mt-auto w-full h-9 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider transition-all ${
                tier.highlight
                  ? "btn-glow"
                  : "bg-surface-elevated border border-white/[0.08] text-on-surface hover:border-emerald/30"
              }`}
            >
              {tier.cta}
              <ArrowRight className="h-3 w-3" />
            </a>
          </motion.div>
        ))}
      </section>

      {/* Pricing FAQ strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { q: "Includes storage?", a: "Yes — every property has storage in Órbita Cloud. No per-GB fees." },
          { q: "Switch tiers anytime?", a: "Yes — no penalty. Change takes effect on the next render cycle." },
          { q: "Payment methods?", a: "Card, MercadoPago, PayPal, Stripe, bank transfer (LATAM + USA)." },
        ].map((item) => (
          <div key={item.q} className="p-3 rounded-lg bg-surface-raised/40 border border-white/[0.06]">
            <div className="text-[11px] font-semibold text-on-surface mb-1">{item.q}</div>
            <div className="text-[10px] text-on-surface-variant leading-relaxed">{item.a}</div>
          </div>
        ))}
      </section>

      {/* FAQ accordion */}
      <section>
        <div className="text-center mb-6">
          <span className="text-[11px] uppercase tracking-[0.18em] text-cyan-light font-mono">
            Honest FAQ
          </span>
          <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
            Questions we get asked
          </h3>
        </div>
        <div className="max-w-3xl mx-auto space-y-2">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="border border-white/[0.06] rounded-lg bg-surface-raised/30 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-surface-raised/50 transition-colors"
                aria-expanded={openFaq === i}
              >
                <span className="text-sm font-medium text-on-surface">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-on-surface-variant flex-shrink-0 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed">
                      {f.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="rounded-2xl border border-emerald/30 bg-gradient-to-br from-primary/10 to-surface-base/40 p-6 sm:p-8 text-center specular-border">
        <h3 className="text-xl sm:text-2xl font-bold text-on-surface mb-2">
          Start with 1 property
        </h3>
        <p className="text-xs text-on-surface-variant mb-5 max-w-xl mx-auto">
          $19 gets you a complete property bundle: video + 3D tour + microsite
          + QR + 14-day analytics. No credit card needed to try the demo.
        </p>
        <button className="btn-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider font-mono">
          Launch studio
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </section>
    </div>
  )
}
