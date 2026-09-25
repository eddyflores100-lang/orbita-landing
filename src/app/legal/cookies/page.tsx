import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cookie Policy — Órbita",
  description: "Cookie usage policy for Órbita Property Content Engine.",
}

export default function CookiesPage() {
  return (
    <main className="bg-surface-base text-on-surface min-h-screen px-4 sm:px-6 lg:px-8 py-32 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-on-surface mb-6">Cookie Policy</h1>
      <p className="text-sm text-on-surface-variant mb-4">Last updated: September 25, 2026</p>
      
      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">Cookies We Use</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Órbita uses minimal cookies: language preference (nexus-lang) and session state.
        We do NOT use third-party tracking cookies (no Google Analytics, no Facebook Pixel).
        Analytics are opt-in via Plausible (privacy-friendly, no cookies, GDPR-compliant).
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">Third-Party Services</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Tailwind CSS (CDN), Google Fonts (Bodoni Moda, Hanken Grotesk, Plus Jakarta Sans, JetBrains Mono),
        Material Symbols Outlined. These services may set their own cookies. See Google's privacy policy
        for details.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">Managing Cookies</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        You can manage cookies in your browser settings. Disabling cookies will not affect
        the core functionality of Órbita (property enrichment, video generation, analytics).
      </p>
    </main>
  )
}
