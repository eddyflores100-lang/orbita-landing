import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Órbita",
  description: "Privacy Policy for Órbita Property Content Engine. GDPR, CCPA, and HIPAA-aligned data handling.",
}

export default function PrivacyPage() {
  return (
    <main className="bg-surface-base text-on-surface min-h-screen px-4 sm:px-6 lg:px-8 py-32 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-on-surface mb-6">Privacy Policy</h1>
      <p className="text-sm text-on-surface-variant mb-4">Last updated: September 25, 2026</p>
      
      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">1. Data We Collect</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Órbita Property Content Engine (operated by AliceLabs LLC, Sheridan, Wyoming, USA) collects:
        Property photos you upload, property metadata (name, address, tone, features), and analytics
        events (views, video plays, CTA clicks, WhatsApp contacts, QR scans). We do NOT collect
        personal data from property photos. AI processing (CogVideoX-3, GLM-4.5v, TTS) is performed
        via z-ai-web-dev-sdk and the data is not used for model training.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">2. GDPR Compliance</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        EU users have the right to: access their data (Article 15), rectify (Article 16),
        erase (Article 17 — right to be forgotten), restrict processing (Article 18),
        data portability (Article 20), and object (Article 21). To exercise these rights,
        email hello@alicelabs.site. We respond within 30 days.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">3. CCPA Compliance</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        California residents have the right to: know what personal information is collected,
        request deletion, opt-out of sale (we do NOT sell personal information), and
        non-discrimination. To exercise these rights, email hello@alicelabs.site.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">4. Fair Housing Act</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Órbita's AI Director uses family-neutral language in all property descriptions. We do NOT
        target or exclude buyers based on race, color, religion, national origin, sex, familial
        status, or disability. All marketing copy is FHA-compliant in both English and Spanish.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">5. Data Retention</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Property photos are retained for 30 days after enrichment completion, then automatically
        deleted. Analytics data is retained for 14 days. Cache files (SHA-1 keyed AI clips)
        are retained indefinitely for re-render efficiency but contain no personal data.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">6. Contact</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        AliceLabs LLC, Sheridan, Wyoming, USA. Email: hello@alicelabs.site.
        For security disclosures: security@alicelabs.site (see /.well-known/security.txt).
      </p>
    </main>
  )
}
