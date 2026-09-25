"use client"

import { useState, useCallback, type ComponentType } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AuroraBackground } from "./AuroraBackground"
import { StudioNavbar, type TabId } from "./StudioNavbar"
import { StudioFooter } from "./StudioFooter"
import { StudioTab } from "./StudioTab"
import { MarketsTab } from "./MarketsTab"
import { ComplianceTab } from "./ComplianceTab"
import { PipelineTab } from "./PipelineTab"
import { PricingTab } from "./PricingTab"

const TABS: Record<TabId, ComponentType> = {
  studio: StudioTab,
  markets: MarketsTab,
  compliance: ComplianceTab,
  pipeline: PipelineTab,
  pricing: PricingTab,
} as const

const TAB_LABELS: Record<TabId, string> = {
  studio: "Studio",
  markets: "Markets",
  compliance: "Compliance",
  pipeline: "Pipeline",
  pricing: "Pricing",
}

export function OrbitaStudioApp() {
  const [activeTab, setActiveTab] = useState<TabId>("studio")
  const [lang, setLang] = useState<"en" | "es">("en")

  const handleTab = useCallback((t: TabId) => {
    setActiveTab(t)
    // Smooth scroll to top of content on tab change
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  const TabComponent = TABS[activeTab]
  const currentLabel = TAB_LABELS[activeTab]

  return (
    <>
      <AuroraBackground />
      <StudioNavbar
        active={activeTab}
        onTab={handleTab}
        lang={lang}
        onLang={setLang}
      />
      <main
        id="top"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
      >
        {/* Breadcrumb telemetry */}
        <div className="flex items-center gap-2 mb-5 text-[10px] font-mono uppercase tracking-[0.18em] text-on-surface-variant">
          <span className="text-primary-glow">orbita</span>
          <span className="text-white/20">/</span>
          <span className="text-on-surface">{currentLabel}</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="pulse-dot" />
            <span>session active</span>
          </span>
        </div>

        {/* Tab content with AnimatePresence transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <TabComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <StudioFooter />
    </>
  )
}
