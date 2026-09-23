"use client"

import Link from "next/link"
import { Github, Mail, MapPin, Bot } from "lucide-react"

const NAV = {
  Studio: [
    { label: "OpenAPI 3.1", href: "/openapi.json" },
    { label: "MCP server", href: "/api/mcp" },
    { label: "Live demo", href: "/p/la-floresta-199" },
    { label: "GitHub repo", href: "https://github.com/eddyflores100-lang/orbita-landing" },
  ],
  Markets: [
    { label: "Miami", href: "/inmobiliaria/miami" },
    { label: "Houston", href: "/inmobiliaria/houston" },
    { label: "Los Angeles", href: "/inmobiliaria/los-angeles" },
    { label: "Naples", href: "/inmobiliaria/naples" },
  ],
  Trust: [
    { label: "llms.txt", href: "/llms.txt" },
    { label: "agents.txt", href: "/agents.txt" },
    { label: "ai-plugin.json", href: "/.well-known/ai-plugin.json" },
    { label: "security.txt", href: "/.well-known/security.txt" },
  ],
  Company: [
    { label: "AliceLabs LLC", href: "https://alicelabs.site" },
    { label: "MarketNow MCP", href: "https://marketnow.site" },
    { label: "News", href: "/news" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
}

export function StudioFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#040609] py-12 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-br from-primary via-primary-glow to-cyan-glow">
                <span className="font-bold text-surface-base text-sm">Ó</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold text-on-surface">Órbita</span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-mono">
                  Property Engine
                </span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-4 max-w-xs">
              Property Content Engine for AI agents. Upload photos, render cinematic AI video + 3D tours + bilingual microsites in 15 minutes.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/eddyflores100-lang/orbita-landing"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 grid place-items-center rounded-md border border-white/[0.07] text-on-surface-variant hover:text-on-surface hover:border-white/20 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:hello@alicelabs.site"
                className="h-8 w-8 grid place-items-center rounded-md border border-white/[0.07] text-on-surface-variant hover:text-on-surface hover:border-white/20 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="/api/mcp"
                className="h-8 w-8 grid place-items-center rounded-md border border-white/[0.07] text-on-surface-variant hover:text-primary-glow hover:border-emerald/30 transition-colors"
                aria-label="MCP server"
              >
                <Bot className="h-4 w-4" />
              </a>
            </div>
          </div>

          {Object.entries(NAV).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-mono font-semibold mb-3">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.href.startsWith("http") ? "_blank" : undefined}
                      rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-xs text-on-surface-variant hover:text-on-surface transition-colors font-mono"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-on-surface-variant font-mono">
          <div className="flex items-center gap-3 flex-wrap">
            <span>(c) 2026 AliceLabs LLC</span>
            <span className="text-white/20">/</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Sheridan, Wyoming · LATAM ops
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="pulse-dot" />
            <span>System status: live</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
