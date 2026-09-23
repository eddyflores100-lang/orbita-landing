"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import type { City } from "@/lib/data/orbita-data"

const geoFaqs = (city: City) => [
  {
    q: `How much does it cost to produce professional real estate video in ${city.name}?`,
    a: `A professional photographer in ${city.name} typically charges between $400 and $1,200 per property, with delivery in 5-7 days. Órbita produces AI video + 3D tour + microsite in minutes for $19-$49 per property. You save 80-95% of the cost and 95% of the time.`,
  },
  {
    q: `How does the 3D tour work without a dedicated scanner in ${city.name}?`,
    a: `Órbita uses Depth Anything V2 (a 94MB ONNX model) to estimate monocular depth from each photo you take with your phone. You do not need the Matterport scanner ($2,500+). The 3D tour is generated automatically when you upload the photos. For 80% of use cases (residential, second homes, rentals), the quality is comparable.`,
  },
  {
    q: `Which neighborhoods of ${city.name} does Órbita cover?`,
    a: `Órbita works in every neighborhood of ${city.name}: ${city.neighborhoods.slice(0, 8).join(", ")} and more. Location does not matter — you only need photos taken with a phone or camera. If the property is outside ${city.name} but in the ${city.region} region, it also works.`,
  },
  {
    q: `Can I use Órbita for ${city.propertyTypes[0]?.toLowerCase()} properties in ${city.name}?`,
    a: `Yes. Órbita is optimized for every property type in ${city.name}: ${city.propertyTypes.join(", ")}. The system adjusts the cinematic tone to match the property type and target audience.`,
  },
  {
    q: `How does Órbita handle the leads my properties generate in ${city.name}?`,
    a: `Each published property generates a public microsite at /p/[slug] with a dynamic QR code and a WhatsApp Business button. Leads arrive directly to the agent's WhatsApp with per-property tracking. Analytics show 14 days of views, video plays, CTA clicks, WhatsApp conversations started, QR scans and completed contact forms.`,
  },
  {
    q: `Is Órbita available in ${city.language} for my clients in ${city.name}?`,
    a: `Yes. Órbita is built English-first for the USA Hispanic market with bilingual (es/en) microsites and AI voiceover in 4 voices. If your market in ${city.name} includes English-speaking buyers, we generate a bilingual microsite (es/en) under the Agency or Enterprise tier.`,
  },
  {
    q: `Can I integrate Órbita with my CRM in ${city.name}?`,
    a: `Yes. Órbita has a REST API (OpenAPI 3.1 at /openapi.json) and an MCP server (HTTP JSON-RPC 2.0 at /api/mcp) to integrate with HubSpot, Pipedrive, Salesforce, n8n, Zapier or any AI agent (Claude, Cursor, Cline). The Agency and Enterprise tiers include full access.`,
  },
  {
    q: `What is the delivery time in ${city.name}?`,
    a: `The full Órbita pipeline (ingest → AI analysis → AI Director → CogVideoX render → montage → music → voiceover → master) takes 8 to 15 minutes per property, regardless of whether you are in ${city.name} or any other city. 'Speed' mode produces a draft in 5 min; 'quality' mode produces the final master in 12-15 min.`,
  },
]

export function OrbitaGeoFaq({ city }: { city: City }) {
  const [open, setOpen] = useState<number | null>(0)
  const faqs = geoFaqs(city)

  return (
    <section className="py-16 border-t border-zinc-900">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-3">
          FAQ about Órbita in {city.name}
        </h2>
        <p className="text-zinc-400 mb-8 max-w-3xl">
          What agents and brokerages in {city.name} ask before they start.
        </p>

        <div className="space-y-2">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-zinc-900/50 transition-colors"
                aria-expanded={open === i}
              >
                <span className="text-sm font-medium text-zinc-100">{f.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-500 transition-transform flex-shrink-0 ${
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
