"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { pricingTiers } from "@/lib/data/orbita-data"
import { Badge } from "@/components/ui/badge"

export function OrbitaPricing() {
  return (
    <section
      id="pricing"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[400px] bg-violet-500/8 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16 text-center mx-auto"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-violet-500 font-medium">
            Transparent pricing
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            You only pay for what you use
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            No setup fee. No annual contract. No cancellation. Start with a
            single property and scale whenever you want. Volume discounts on
            Agency and Enterprise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl p-6 flex flex-col ${
                tier.highlight
                  ? "border-2 border-violet-500 bg-gradient-to-br from-violet-500/10 to-zinc-950 shadow-2xl shadow-violet-500/20"
                  : "border border-zinc-900 bg-zinc-950"
              }`}
            >
              {tier.highlight && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-violet-500 text-zinc-950 text-[10px] px-2 py-0.5">
                  Most chosen
                </Badge>
              )}

              <div className="mb-4">
                <h3 className="text-base font-semibold text-zinc-100">
                  {tier.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{tier.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-50">
                    {tier.price}
                  </span>
                  <span className="text-sm text-zinc-500">{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-zinc-300">
                    <Check className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${tier.highlight ? "text-violet-400" : "text-emerald-400"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-auto w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  tier.highlight
                    ? "bg-violet-500 hover:bg-violet-400 text-zinc-950"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800"
                }`}
              >
                {tier.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Pricing FAQ strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {[
            { q: "Is storage included?", a: "Yes — every property includes Órbita Cloud storage. No additional GB charges." },
            { q: "Can I switch tiers?", a: "Yes — at any time without penalty. The change takes effect on the next render cycle." },
            { q: "Do you accept US payment methods?", a: "Yes — credit card, ACH, PayPal, Stripe and bank transfer (USA and LATAM)." },
          ].map((item) => (
            <div key={item.q} className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs font-medium text-zinc-200 mb-1">{item.q}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
