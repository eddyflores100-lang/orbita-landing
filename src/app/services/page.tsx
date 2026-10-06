import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Servicios — AliceLabs LLC",
  description: "8 servicios de desarrollo, automatización y marketing digital. Landing pages, MCP servers, SEO, data enrichment, traducción técnica, code review.",
}

const services = [
  { name: "Landing Pages", icon: "🚀", desc: "Webs profesionales tipo Órbita para inmobiliarias, startups y Pymes. Deploy en Cloudflare Pages.", price: "$500-3000", demo: "https://orbita.alicelabs.site" },
  { name: "MCP Servers", icon: "🤖", desc: "Servidores MCP custom para integrar tus APIs con Claude/Cursor/Cline. Publicación en MarketNow (68k+ servidores).", price: "$200-2000", demo: "https://marketnow.site" },
  { name: "SEO Technical Audit", icon: "🔍", desc: "Auditoría completa: sitemap, JSON-LD, robots.txt, meta tags, Core Web Vitals, mobile usability.", price: "$200-500", demo: null },
  { name: "Data Enrichment B2B", icon: "📊", desc: "CSV de empresas → emails, teléfonos, tax IDs (DUNS, EIN, RUC, VAT, CNPJ). 10+ fuentes.", price: "$0.01-0.05/registro", demo: "https://nexus.alicelabs.site" },
  { name: "Traducción Técnica", icon: "🌐", desc: "Traducción ES↔EN de README.md, docs técnicas, comentarios de código, tutoriales.", price: "$0.02-0.05/palabra", demo: null },
  { name: "Code Review / Bug Fix", icon: "🐛", desc: "Revisión de código, finding bugs, PRs a repos open source. TypeScript, Python, Next.js.", price: "$50-200", demo: null },
  { name: "Automatización de Procesos", icon: "⚙️", desc: "Scripts Python/Node, scraping, webhooks, integraciones API. Eliminamos trabajo manual.", price: "$300-1500", demo: null },
  { name: "Asistente de Programación", icon: "👨‍💻", desc: "Code review, refactoring, migraciones (Vue 2→3, Next 14→16), debugging. Por hora.", price: "$30-100/hora", demo: null },
]

export default function ServicesPage() {
  return (
    <main className="bg-surface-base text-on-surface min-h-screen px-4 sm:px-6 lg:px-8 py-24 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-xs uppercase tracking-[0.18em] text-primary font-mono">AliceLabs LLC · Sheridan, Wyoming</span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{fontFamily: "Bodoni Moda, serif"}}>
          Servicios de desarrollo,<br/>automatización y marketing
        </h1>
        <p className="mt-5 text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          8 frentes de trabajo reales. Demostraciones live. Precios transparentes.
          Sin contrato anual. Sin setup fee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {services.map((s, i) => (
          <div key={i} className="luxury-glass rounded-xl p-5 border border-primary/10">
            <div className="text-3xl mb-3">{s.icon}</div>
            <h3 className="text-base font-semibold text-primary mb-1">{s.name}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">{s.desc}</p>
            <div className="text-sm font-bold text-primary mb-2">{s.price}</div>
            {s.demo && (
              <a href={s.demo} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-glow hover:underline">
                Ver demo →
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4" style={{fontFamily: "Bodoni Moda, serif"}}>¿Listo para empezar?</h2>
        <p className="text-on-surface-variant mb-6">
          Escríbenos por WhatsApp o email. Respondemos en menos de 24 horas.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="https://wa.me/593999999999?text=Hola%20AliceLabs%2C%20vi%20su%20página%20de%20servicios%20y%20quiero%20más%20información" 
             target="_blank" className="btn-glow px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider font-mono">
            WhatsApp
          </a>
          <a href="mailto:hello@alicelabs.site?subject=Solicitud%20de%20servicios%20AliceLabs"
             className="px-6 py-3 rounded-xl border border-primary/30 text-secondary text-sm font-bold uppercase tracking-wider font-mono hover:bg-primary/10 transition-colors">
            Email
          </a>
        </div>
      </div>
    </main>
  )
}
