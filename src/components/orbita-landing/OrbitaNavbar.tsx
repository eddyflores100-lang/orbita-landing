"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Github, ArrowRight, Sparkles, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "USA", href: "#usa" },
  { label: "Compliance", href: "#compliance" },
  { label: "MLS", href: "#mls" },
  { label: "How it works", href: "#how" },
  { label: "For agents", href: "#agents" },
  { label: "Demo", href: "#demo" },
  { label: "Cities", href: "#cities" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

export function OrbitaNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <a href="#top" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-br from-violet-400 via-fuchsia-500 to-amber-400 shadow-lg shadow-violet-500/30">
              <span className="font-bold text-zinc-950 text-sm">Ó</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-zinc-50">
                Órbita
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Property Engine
              </span>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-2.5 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-900/50"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-zinc-300 hover:text-zinc-50 hover:bg-zinc-900"
            >
              <a href="/openapi.json" target="_blank" rel="noopener noreferrer">
                <Bot className="h-4 w-4 mr-1.5" />
                For AI agents
              </a>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-violet-500 hover:bg-violet-400 text-zinc-950 font-medium"
            >
              <a href="#pricing">
                Get started
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </a>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-zinc-300"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-sm text-zinc-300 hover:text-zinc-50 hover:bg-zinc-900 rounded-md transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex-1 text-zinc-300"
                >
                  <a href="/openapi.json" target="_blank" rel="noopener noreferrer">
                    <Bot className="h-4 w-4 mr-1.5" />
                    For AI agents
                  </a>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="flex-1 bg-violet-500 hover:bg-violet-400 text-zinc-950"
                >
                  <a href="#pricing" onClick={() => setMobileOpen(false)}>
                    Get started
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
