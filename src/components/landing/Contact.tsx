"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const interests = [
  "MarketNow (AI agent trust)",
  "Vigia-ML (Oil & Gas)",
  "Memex (regulated memory)",
  "OpenSAM (GovTech)",
  "Orbita (PropTech)",
  "Stack completo / partner",
]

export function Contact() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      company: data.get("company"),
      interest: data.get("interest"),
      message: data.get("message"),
    }

    try {
      // Simulate async submission; in production this would POST to /api/contact
      await new Promise((r) => setTimeout(r, 900))
      console.log("Contact form payload:", payload)
      setSent(true)
      toast({
        title: "Mensaje enviado",
        description:
          "Te responderemos en menos de 24 horas hábiles. Gracias por tu interés en AliceLabs.",
      })
      form.reset()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error al enviar",
        description: "Intenta de nuevo o escríbenos directamente a hello@alicelabs.site",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="absolute inset-0 -z-10 opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: pitch */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-xs uppercase tracking-[0.18em] text-emerald-500 font-medium">
              Conversación comercial
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-50 leading-tight">
              Hablemos de cómo AliceLabs
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
                encaja en tu stack
              </span>
            </h2>
            <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
              Respondemos en menos de 24 horas hábiles. Tipos de conversaciones
              que tenemos:
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Licenciamiento enterprise de MarketNow / Memex / Vigia-ML",
                "Piloto pagado en campo (gasífero, brokerage, contractor federal)",
                "Co-development de agentes verticales sobre el stack AliceLabs",
                "Audit / advisory para evaluar tu stack de confianza IA",
                "Pricing, términos, BAA, SOC2 readiness, ISO 27001 / IEC 62443",
              ].map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className="flex items-start gap-2.5 text-sm text-zinc-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500">
              <Mail className="h-4 w-4 text-emerald-400" />
              <a
                href="mailto:hello@alicelabs.site"
                className="hover:text-zinc-200 transition-colors"
              >
                hello@alicelabs.site
              </a>
              <span className="text-zinc-700">·</span>
              <span>AliceLabs LLC · Sheridan, WY</span>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
          >
            {sent ? (
              <div className="flex flex-col items-center text-center py-12">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 grid place-items-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-1">
                  Mensaje recibido
                </h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                  Te responderemos en menos de 24 horas hábiles. Mientras tanto,
                  revisa los repositorios en GitHub.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-6 border-zinc-700 text-zinc-300"
                  onClick={() => setSent(false)}
                >
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-zinc-300 text-xs">
                      Nombre *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Eddy Flores"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-zinc-300 text-xs">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="eddy@company.com"
                      className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-zinc-300 text-xs">
                    Empresa / Organización
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="AliceLabs LLC"
                    className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interest" className="text-zinc-300 text-xs">
                    Producto de interés
                  </Label>
                  <select
                    id="interest"
                    name="interest"
                    className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Selecciona uno...
                    </option>
                    {interests.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-zinc-300 text-xs">
                    Cuéntanos qué necesitas *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Estamos evaluando agentes IA para nuestro stack federal..."
                    className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/40 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium shadow-lg shadow-emerald-500/25 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar mensaje
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-[10px] text-zinc-600 text-center">
                  Tus datos se usan solo para responder tu solicitud. No spam.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
