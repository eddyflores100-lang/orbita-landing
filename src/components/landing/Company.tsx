"use client"

import { motion } from "framer-motion"
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const recommendations = [
  {
    product: "MarketNow",
    status: "high",
    title: "Consolidar 14 paquetes npm en un solo omnibus installer",
    body: "Publicar `npx marketnow` con árbol de decisión Getting Started. Auditoría externa third-party (reproducible test vectors + leaderboard público) es obligatoria antes de comprar enterprise infosec. Publicar ATC como standards-track RFC para volverse el Verisign de agentes IA.",
    metric: "Network effects locked",
  },
  {
    product: "Vigia-ML",
    status: "high",
    title: "Reemplazar simulador SCADA con piloto real en campo",
    body: "Partner con operador gasífero ecuatoriano/peruano. Caso de estudio anonimizado publicado. Co-founder con credencial petroleum engineering. ISO 27001 / IEC 62443 readiness. Deploy on-prem air-gapped con SBOM firmado. Pricing por pozo / Mcf monitoreado.",
    metric: "$50k–$500k ACV",
  },
  {
    product: "Memex",
    status: "medium",
    title: "Benchmarks third-party + Enterprise hardening",
    body: "Correr LoComo / LongMemEval y publicar metodología. Endurecer autonomy features (watchdog, auto-backup) en Docker image Memex Enterprise. SSO/SAML + audit-log export a SIEM + BAA para Healthcare. Posicionar la línea completa Memex/Recall/Pruner/Bóveda como un solo stack.",
    metric: "$0 vs $2–$4/1K",
  },
  {
    product: "OpenSAM",
    status: "high",
    title: "Ship el agente autónomo + historical backtest",
    body: "sam-agent que redacta proposals, deadline reminders, opportunity change tracking. Backtest contra award notices reales de FY2025. Pursuit SBIR/STTR o AFWERX. Tier multi-seat para primes + subcontractors. Public leaderboard diario (Federal Deal Feed newsletter) para SEO de alta intención.",
    metric: "Open-core vs $2k/mo",
  },
  {
    product: "Orbita",
    status: "medium",
    title: "Piloto brokerage + WhatsApp-native lead capture",
    body: "Piloto pagado con franquicia LATAM. Métricas before/after (time-on-market, CTR). Self-serve onboarding per-property. SLA con GPU provider para CogVideoX. Dashboard multi-propiedad. Integración MLS / Instagram / WhatsApp Business. Bóveda posicionada como oferta separada.",
    metric: "SaaS B2B volumen",
  },
]

const statusConfig = {
  high: {
    label: "Alta prioridad",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    icon: "text-emerald-400",
  },
  medium: {
    label: "Optimización",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    icon: "text-amber-400",
  },
  low: {
    label: "Futuro",
    badge: "border-zinc-700 bg-zinc-800/50 text-zinc-400",
    icon: "text-zinc-500",
  },
} as const

export function Company() {
  return (
    <section
      id="company"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-emerald-500 font-medium">
            Roadmap 2026
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            Lo que estamos mejorando
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Identificamos cinco vectores de mejora para llevar el portfolio de
            "ingeniería madura" a "empresa fundable". Compartimos el plan
            abiertamente — es la base de la conversación comercial.
          </p>
        </motion.div>

        <div className="space-y-3">
          {recommendations.map((rec, i) => {
            const cfg = statusConfig[rec.status as keyof typeof statusConfig]
            return (
              <motion.div
                key={rec.product}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="group bg-zinc-950 border border-zinc-900 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-start gap-3 sm:w-48 flex-shrink-0">
                    <CheckCircle2 className={`h-5 w-5 ${cfg.icon} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">
                        {rec.product}
                      </div>
                      <Badge
                        variant="outline"
                        className={`mt-1 text-[10px] h-5 px-2 border ${cfg.badge}`}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-zinc-100 mb-1.5">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-zinc-500 leading-relaxed mb-2">
                      {rec.body}
                    </p>
                  </div>

                  <div className="sm:w-32 flex-shrink-0 sm:text-right">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">
                      Métrica
                    </div>
                    <div className={`text-xs font-medium ${cfg.icon}`}>
                      {rec.metric}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Distribution risk banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-zinc-100 mb-1.5">
                Riesgo #1 identificado: distribución
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                El portfolio es maduro pero invisible (0 estrellas en los 42
                repositorios públicos). Un lanzamiento coordinado (Show HN ×
                Dev.to × MCP Discord × Cursor marketplace × YouTube demo)
                movería 3-4 repos de 0 a cientos de estrellas en una semana.
                Las estrellas son la prueba social que los compradores
                enterprise revisan primero.
              </p>
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-300 hover:text-amber-200"
              >
                Quiero impulsar la distribución
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
