import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Órbita",
  description: "Terms of Service for Órbita Property Content Engine.",
}

export default function TermsPage() {
  return (
    <main className="bg-surface-base text-on-surface min-h-screen px-4 sm:px-6 lg:px-8 py-32 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-on-surface mb-6">Terms of Service</h1>
      <p className="text-sm text-on-surface-variant mb-4">Last updated: September 25, 2026</p>
      
      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">1. Service</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Órbita Property Content Engine ("Órbita") is operated by AliceLabs LLC (Sheridan, Wyoming, USA).
        The service converts property photos into AI-generated video, 3D tours, microsites, and analytics.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">2. Pricing</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Starter: $19/property. Pro: $49/property. Agency: $199/month (20 properties included).
        Enterprise: Custom. No setup fee. No annual contract. No cancellation fee.
        Pay-per-record model (not per-seat).
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">3. RESPA §8 Compliance</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        No kickbacks or referral fees between agents, lenders, title companies, or escrow.
        Marketing Services Agreements (MSAs) must be in writing with documented fair market value.
        Órbita does not engage in paid referrals.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">4. TRID Compliance</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Marketing materials do not display binding loan terms, APR, or specific lender endorsements.
        Mortgage calculators include disclaimer: "Estimated only. Actual terms vary by lender."
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">5. MLS Compliance</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Órbita only accepts broker-owned/licensed media. AI derivatives are licensed back to the broker.
        Listing broker attribution is displayed on all microsites. Data refreshed daily via MLS Grid
        (RESO Web API). IDX/VOW rules are followed for sold data access.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">6. License</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        Source code is available under AL-1.0 (AliceLabs Source-Available License).
        Commercial use requires a license. Self-hosted Docker image available on Enterprise tier.
      </p>

      <h2 className="text-xl font-semibold text-on-surface mt-8 mb-3">7. Contact</h2>
      <p className="text-on-surface-variant leading-relaxed mb-4">
        AliceLabs LLC, Sheridan, Wyoming, USA. Email: hello@alicelabs.site.
      </p>
    </main>
  )
}
