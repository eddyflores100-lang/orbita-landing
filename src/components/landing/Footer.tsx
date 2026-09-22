"use client"

import { Github, Globe, Mail, MapPin } from "lucide-react"

const footerNav = {
  Productos: [
    { label: "MarketNow", href: "https://marketnow.site" },
    { label: "Vigia-ML", href: "https://github.com/eddyflores100-lang/vigia-ml" },
    { label: "Memex", href: "https://memex.alicelabs.site" },
    { label: "OpenSAM", href: "https://opensam.us" },
    { label: "Orbita", href: "https://github.com/eddyflores100-lang/Orbita" },
  ],
  Empresa: [
    { label: "Sobre AliceLabs", href: "#company" },
    { label: "Roadmap 2026", href: "#company" },
    { label: "Stack tecnológico", href: "#stack" },
    { label: "Industrias", href: "#industries" },
  ],
  Recursos: [
    { label: "GitHub", href: "https://github.com/eddyflores100-lang" },
    { label: "Org alicelabs-llc", href: "https://github.com/alicelabs-llc" },
    { label: "npm packages", href: "https://www.npmjs.com/~alicelabs" },
    { label: "PyPI packages", href: "https://pypi.org/user/alicelabs/" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                <span className="font-bold text-zinc-950 text-sm">A</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold text-zinc-50">
                  AliceLabs
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  LLC
                </span>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mb-5">
              Open-source infrastructure for AI agent trust, GovTech, legal AI,
              and security research. Wyoming LLC — building the trust root for
              the agentic web.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/eddyflores100-lang"
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
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-zinc-600">
            <span>© 2026 AliceLabs LLC. Todos los derechos reservados.</span>
            <span className="hidden sm:inline text-zinc-800">·</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              Sheridan, Wyoming, USA
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <span>Licencias: MIT · Apache 2.0 · AL-1.0</span>
            <span className="hidden sm:inline text-zinc-800">·</span>
            <span>Made in LATAM 🌎</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
