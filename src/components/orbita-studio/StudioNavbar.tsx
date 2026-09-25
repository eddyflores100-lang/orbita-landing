"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Menu, X, Github, ArrowRight } from "lucide-react"

const TABS = [
  { id: "studio", label: "Studio", short: "Studio" },
  { id: "markets", label: "Markets", short: "Markets" },
  { id: "compliance", label: "Compliance", short: "Legal" },
  { id: "pipeline", label: "Pipeline", short: "Flow" },
  { id: "pricing", label: "Pricing", short: "Pricing" },
] as const

export type TabId = (typeof TABS)[number]["id"]

export function StudioNavbar({
  active,
  onTab,
  lang,
  onLang,
}: {
  active: TabId
  onTab: (t: TabId) => void
  lang: "en" | "es"
  onLang: (l: "en" | "es") => void
}) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-surface-base/85 backdrop-blur-2xl"
          : "border-transparent bg-surface-base/40 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand */}
          <a
            href="#top"
            className="flex items-center gap-2 group"
            aria-label="Órbita home"
          >
            <div className="relative h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-br from-primary via-primary-glow to-cyan-glow shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <span className="font-bold text-surface-base text-sm">Ó</span>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-on-surface">
                Órbita
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant font-mono">
                Property Engine
              </span>
            </div>
          </a>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-surface-raised/80 border border-white/[0.07]">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTab(tab.id)}
                className="relative px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-colors"
                aria-current={active === tab.id ? "page" : undefined}
              >
                {active === tab.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-xl tab-active-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative z-10 ${
                    active === tab.id
                      ? "text-on-surface"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-raised border border-white/[0.07]">
              <button
                onClick={() => onLang("en")}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                  lang === "en"
                    ? "bg-surface-elevated text-primary-glow shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
              <button
                onClick={() => onLang("es")}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                  lang === "es"
                    ? "bg-surface-elevated text-primary-glow shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                aria-pressed={lang === "es"}
              >
                ES
              </button>
            </div>

            {/* GitHub */}
            <a
              href="https://github.com/eddyflores100-lang/orbita-landing"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:grid h-9 w-9 place-items-center rounded-lg bg-surface-raised border border-white/[0.07] text-on-surface-variant hover:text-on-surface hover:border-white/20 transition-colors"
              aria-label="GitHub repository"
            >
              <Github className="h-4 w-4" />
            </a>

            {/* Primary CTA */}
            <button
              onClick={() => onTab("studio")}
              className="btn-glow hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-mono"
            >
              Launch Studio
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile tabs scroller */}
        <div className="md:hidden overflow-x-auto no-scrollbar py-2 flex gap-1.5 border-t border-white/5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTab(tab.id)
                setMobileOpen(false)
              }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                active === tab.id
                  ? "bg-surface-elevated text-on-surface border border-white/15"
                  : "text-on-surface-variant"
              }`}
            >
              {tab.short}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
