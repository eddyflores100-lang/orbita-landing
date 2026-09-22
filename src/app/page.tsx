import { OrbitaNavbar } from "@/components/orbita-landing/OrbitaNavbar"
import { OrbitaHero } from "@/components/orbita-landing/OrbitaHero"
import { OrbitaUsaFocus } from "@/components/orbita-landing/OrbitaUsaFocus"
import { OrbitaCompliance } from "@/components/orbita-landing/OrbitaCompliance"
import { OrbitaMls } from "@/components/orbita-landing/OrbitaMls"
import { OrbitaFreeApis } from "@/components/orbita-landing/OrbitaFreeApis"
import { OrbitaPipeline } from "@/components/orbita-landing/OrbitaPipeline"
import { OrbitaAgents } from "@/components/orbita-landing/OrbitaAgents"
import { OrbitaDemo } from "@/components/orbita-landing/OrbitaDemo"
import { OrbitaIntegrations } from "@/components/orbita-landing/OrbitaIntegrations"
import { OrbitaCities } from "@/components/orbita-landing/OrbitaCities"
import { OrbitaPricing } from "@/components/orbita-landing/OrbitaPricing"
import { OrbitaFaq } from "@/components/orbita-landing/OrbitaFaq"
import { OrbitaFinalCta } from "@/components/orbita-landing/OrbitaFinalCta"
import { OrbitaFooter } from "@/components/orbita-landing/OrbitaFooter"

export default function Home() {
  return (
    <>
      <OrbitaNavbar />
      <main className="flex-1">
        <OrbitaHero />
        <OrbitaUsaFocus />
        <OrbitaCompliance />
        <OrbitaMls />
        <OrbitaFreeApis />
        <OrbitaPipeline />
        <OrbitaAgents />
        <OrbitaDemo />
        <OrbitaIntegrations />
        <OrbitaCities />
        <OrbitaPricing />
        <OrbitaFaq />
        <OrbitaFinalCta />
      </main>
      <OrbitaFooter />
    </>
  )
}
