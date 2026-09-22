"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Github, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Productos", href: "#products" },
  { label: "Industrias", href: "#industries" },
  { label: "Stack", href: "#stack" },
  { label: "Empresa", href: "#company" },
  { label: "Contacto", href: "#contact" },
]

export function Navbar() {
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
            <div className="relative h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <span className="font-bold text-zinc-950 text-sm">A</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-zinc-50">
                AliceLabs
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                LLC
              </span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-900/50"
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
              <a
                href="https://github.com/eddyflores100-lang"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-1.5" />
                GitHub
              </a>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium"
            >
              <a href="#contact">
                Hablar con ventas
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
                  <a
                    href="https://github.com/eddyflores100-lang"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4 mr-1.5" />
                    GitHub
                  </a>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                >
                  <a href="#contact" onClick={() => setMobileOpen(false)}>
                    Contacto
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
