"use client"

import { motion } from "framer-motion"
import { Play, ArrowUpRight, Smartphone, Monitor, Square } from "lucide-react"

const formats = [
  { icon: Monitor, label: "16:9 Landscape", value: "1280×720 / 1920×1080", use: "Web portals, YouTube" },
  { icon: Smartphone, label: "9:16 Vertical", value: "720×1280", use: "Instagram Reels, TikTok, YouTube Shorts" },
  { icon: Square, label: "1:1 Square", value: "720×720", use: "Instagram feed, Facebook" },
]

export function OrbitaDemo() {
  return (
    <section
      id="demo"
      className="relative py-24 sm:py-32 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-amber-500 font-medium">
            Live demo
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            La Floresta 199
            <br />
            <span className="text-zinc-500">Apartment in Quito</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            This is Órbita's seed property: a 199 m² apartment with a terrace
            in La Floresta, Quito. AI-generated video + 3D tour + public
            microsite. Everything you see was produced automatically.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main video */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <video
                  src="/orbita/demo/la-floresta-3d.mp4"
                  poster="/orbita/demo/poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  aria-label="La Floresta demo video"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur border border-zinc-800 text-[10px] uppercase tracking-wider text-violet-300">
                  <Play className="h-3 w-3" />
                  16:9 demo
                </div>
              </div>
            </div>

            {/* Format outputs */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {formats.map((f) => {
                const Icon = f.icon
                return (
                  <div
                    key={f.label}
                    className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 text-center"
                  >
                    <Icon className="h-4 w-4 text-amber-400 mx-auto mb-1.5" />
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500">{f.label}</div>
                    <div className="text-xs text-zinc-200 mt-0.5 font-mono">{f.value}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">{f.use}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Side: microsite link + format outputs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 flex flex-col gap-4"
          >
            {/* Microsite CTA */}
            <a
              href="/p/la-floresta-199"
              className="group relative block bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-500/60 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-violet-400 mb-1">
                    Public microsite
                  </div>
                  <div className="text-lg font-semibold text-zinc-50">
                    /p/la-floresta-199
                  </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-violet-400 group-hover:rotate-12 transition-transform" />
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                The full pipeline output: video player + interactive 3D tour + gallery lightbox + WhatsApp CTA + contact form. SSR page with event tracking.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["3D tour", "WhatsApp CTA", "Dynamic QR", "Analytics", "Lightbox"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>

            {/* Vertical demo */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-28 rounded-md overflow-hidden border border-zinc-800 bg-zinc-900 flex-shrink-0">
                  <video
                    src="https://github.com/eddyflores100-lang/Orbita/releases/download/demo-3d-real/ORBITA_3D_LaFloresta_916_Reels.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    aria-label="Demo 9:16"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400 mb-1">
                    9:16 vertical format
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-100 mb-1">
                    For Instagram Reels
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Native 720×1280 output generated with CogVideoX-3 native size, no crop. Ready to upload to Reels/TikTok with no post-editing.
                  </p>
                </div>
              </div>
            </div>

            {/* Property metadata */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">
                Demo property metadata
              </div>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Tone</dt>
                  <dd className="text-amber-300">luxury</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Neighborhood</dt>
                  <dd className="text-zinc-200">La Floresta, Quito</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Area</dt>
                  <dd className="text-zinc-200">199 m²</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Photos</dt>
                  <dd className="text-zinc-200">9 (AI-generated)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Camera moves</dt>
                  <dd className="text-zinc-200">11 types</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Music</dt>
                  <dd className="text-zinc-200">cinematic · 90 BPM</dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
