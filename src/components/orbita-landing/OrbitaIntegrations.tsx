"use client"

import { motion } from "framer-motion"
import { Bot, FileJson, MessageCircle, Workflow, Instagram, Globe, ExternalLink } from "lucide-react"
import { integrations } from "@/lib/data/orbita-data"

const iconMap = {
  Bot,
  FileJson,
  MessageCircle,
  Workflow,
  Instagram,
  Globe,
}

const accentByCategory: Record<string, string> = {
  "AI Agents": "border-violet-500/30 bg-violet-500/10 text-violet-300",
  "Leads": "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  "Automation": "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "Distribution": "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
}

export function OrbitaIntegrations() {
  return (
    <section
      id="integrations"
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
          <span className="text-xs uppercase tracking-[0.18em] text-cyan-500 font-medium">
            Integrations for AI agents
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            A hub for AI agents
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Not just a SaaS. A trust hub for Claude, Cursor, Cline, n8n and
            your CRM to talk to your real-estate inventory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((int, i) => {
            const Icon = iconMap[int.icon as keyof typeof iconMap] ?? Bot
            const accent = accentByCategory[int.category] ?? accentByCategory["AI Agents"]
            return (
              <motion.div
                key={int.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group relative bg-zinc-950 border border-zinc-900 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg border ${accent} grid place-items-center`}>
                    <Icon className={`h-5 w-5 ${accent.split(" ")[2]}`} />
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border ${accent}`}>
                    {int.category}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-1.5">
                  {int.name}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                  {int.description}
                </p>
                {int.url !== "#" && (
                  <a
                    href={int.url}
                    target={int.url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    {int.url === "/api/mcp" ? "View MCP endpoint" : int.url === "/openapi.json" ? "View OpenAPI spec" : "Learn more"}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Code snippet: MCP call example */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">
              MCP example · JSON-RPC 2.0
            </span>
          </div>
          <pre className="p-5 text-xs leading-relaxed overflow-x-auto font-mono text-zinc-300">
{`# List properties via MCP (Claude / Cursor / Cline)
curl -X POST https://orbita.alicelabs.site/api/mcp \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_properties"
    }
  }'

# Órbita responds with the full list: properties + photos + plans + jobs`}
          </pre>
        </motion.div>
      </div>
    </section>
  )
}
