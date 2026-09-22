"use client"

import Link from "next/link"
import { Github, Globe, Mail, MapPin, Bot } from "lucide-react"

const footerNav = {
  Product: [
    { label: "How it works", href: "/#how" },
    { label: "La Floresta demo", href: "/p/la-floresta-199" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  "For AI agents": [
    { label: "OpenAPI 3.1 spec", href: "/openapi.json" },
    { label: "MCP server", href: "/api/mcp" },
    { label: "ChatGPT plugin", href: "/.well-known/ai-plugin.json" },
    { label: "llms.txt", href: "/llms.txt" },
    { label: "agents.txt", href: "/agents.txt" },
  ],
  Cities: [
    { label: "Miami", href: "/inmobiliaria/miami" },
    { label: "Houston", href: "/inmobiliaria/houston" },
    { label: "Los Angeles", href: "/inmobiliaria/los-angeles" },
    { label: "Dallas", href: "/inmobiliaria/dallas-fort-worth" },
    { label: "San Antonio", href: "/inmobiliaria/san-antonio" },
    { label: "Phoenix", href: "/inmobiliaria/phoenix" },
  ],
  Company: [
    { label: "AliceLabs LLC", href: "https://alicelabs.site" },
    { label: "News", href: "/news" },
    { label: "GitHub", href: "https://github.com/eddyflores100-lang/Orbita" },
    { label: "Org alicelabs-llc", href: "https://github.com/alicelabs-llc" },
    { label: "Security", href: "/.well-known/security.txt" },
  ],
}

export function OrbitaFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-br from-violet-400 via-fuchsia-500 to-amber-400">
                <span className="font-bold text-zinc-950 text-sm">Ó</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold text-zinc-50">Órbita</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Property Engine
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-5">
              Property Content Engine for the AI-agent era. Upload photos → get video + 3D + microsite in minutes.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/eddyflores100-lang/Orbita"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 grid place-items-center rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://alicelabs.site"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 grid place-items-center rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
                aria-label="Website"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@alicelabs.site"
                className="h-8 w-8 grid place-items-center rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="/api/mcp"
                className="h-8 w-8 grid place-items-center rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
                aria-label="MCP"
              >
                <Bot className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Footer nav */}
          {Object.entries(footerNav).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-zinc-600">
            <span>© 2026 AliceLabs LLC. Built by the Órbita team.</span>
            <span className="hidden sm:inline text-zinc-800">·</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Sheridan, Wyoming, USA · LATAM ops
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-600">
            <a href="/sitemap.xml" className="hover:text-zinc-200">Sitemap</a>
            <span className="text-zinc-800">·</span>
            <a href="/robots.txt" className="hover:text-zinc-200">Robots</a>
            <span className="text-zinc-800">·</span>
            <a href="/llms.txt" className="hover:text-zinc-200">LLMs.txt</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
