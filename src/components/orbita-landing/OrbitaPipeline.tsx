"use client"

import { motion } from "framer-motion"
import { Upload, Eye, Bot, Film, Music, Mic, Globe, QrCode, BarChart3 } from "lucide-react"

const pipeline = [
  {
    phase: "01 · INGEST",
    title: "Upload your photos",
    description:
      "Drag-and-drop, ZIP or paste a URL. Any format (JPG/PNG/WebP/HEIC/AVIF). Automatic EXIF rotation, sha-256 dedupe, thumbnails at 640px.",
    icon: Upload,
    accent: "violet",
  },
  {
    phase: "02 · ANALYZE",
    title: "AI understands the property",
    description:
      "GLM-4.5v identifies 15 room types, objects, lighting and architectural style. Generates an automatic description for the listing.",
    icon: Eye,
    accent: "fuchsia",
  },
  {
    phase: "03 · DIRECT",
    title: "AI Director plans it",
    description:
      "LLM decides shot order, 11 camera moves, durations (1.4-6s per clip), captions and narrative tone. You can edit any of it.",
    icon: Bot,
    accent: "amber",
  },
  {
    phase: "04 · RENDER",
    title: "CogVideoX-3 generates video",
    description:
      "Each photo → 5s cinematic clip. CogVideoX image-to-video with auto-built prompt (place + camera + atmosphere + quality guards).",
    icon: Film,
    accent: "violet",
  },
  {
    phase: "05 · MONTAGE",
    title: "ffmpeg xfade montage",
    description:
      "Clips concatenated with 0.55s crossfade. Reliable fallback to concat copy if xfade fails. Normalized to 30fps yuv420p +faststart.",
    icon: Film,
    accent: "fuchsia",
  },
  {
    phase: "06 · MUSIC",
    title: "Procedural PCM",
    description:
      "16-bit stereo WAV synthesis with 6 styles (cinematic, ambient, uplifting, minimal, warm, epic). Chord progressions, ADSR, arpeggio panning. No third-party licenses.",
    icon: Music,
    accent: "amber",
  },
  {
    phase: "07 · VOICEOVER",
    title: "TTS + sidechain duck",
    description:
      "LLM writes a script calibrated to 2.6 words/sec. TTS with 4 voices. ffmpeg sidechaincompress for real ducking (music dips under voice).",
    icon: Mic,
    accent: "violet",
  },
  {
    phase: "08 · 3D TOUR",
    title: "Depth Anything V2",
    description:
      "Three.js point cloud with monocular depth via 94MB ONNX. Drag-to-look, wheel/pinch, mobile gyroscope. Labeled hotspots up to 24KB.",
    icon: Globe,
    accent: "fuchsia",
  },
  {
    phase: "09 · MICROSITE",
    title: "Publish + QR + WhatsApp",
    description:
      "SSR microsite at /p/[slug] with hero, video, 3D, gallery, WhatsApp CTA, contact form. Dynamic 640px QR PNG with ?ref=qr for attribution.",
    icon: QrCode,
    accent: "amber",
  },
  {
    phase: "10 · ANALYTICS",
    title: "14 days of tracking",
    description:
      "Events: VIEW, VIDEO_PLAY, CTA, WHATSAPP, SCAN, CONTACT. Daily views + byRef (qr/instagram/whatsapp) + totals. Per property.",
    icon: BarChart3,
    accent: "violet",
  },
]

const accentMap: Record<string, string> = {
  violet: "from-violet-400 to-violet-600 text-violet-400 bg-violet-500/10 border-violet-500/30",
  fuchsia: "from-fuchsia-400 to-fuchsia-600 text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
  amber: "from-amber-400 to-amber-600 text-amber-400 bg-amber-500/10 border-amber-500/30",
}

export function OrbitaPipeline() {
  return (
    <section id="how" className="relative py-24 sm:py-32 bg-zinc-950">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase tracking-[0.18em] text-violet-500 font-medium">
            10-phase pipeline
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-50">
            From photos to a professional listing
            <br />
            <span className="text-zinc-500">in 15 minutes</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400 leading-relaxed">
            Each phase is independent, cached and resumable. If something
            fails, there is a deterministic fallback. If you re-render, cached
            clips come back instantly. Everything runs on your server or on
            Órbita Cloud.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {pipeline.map((p, i) => {
            const Icon = p.icon
            const accent = accentMap[p.accent]
            return (
              <motion.div
                key={p.phase}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 5) * 0.06 }}
                className={`group bg-zinc-950 border ${accent.split(" ").slice(2).join(" ")} rounded-xl p-4 hover:bg-zinc-900/40 transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-9 w-9 rounded-lg ${accent.split(" ").slice(2).join(" ")} border grid place-items-center`}>
                    <Icon className={`h-4 w-4 ${accent.split(" ")[2]}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-mono">
                    {p.phase}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">
                  {p.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {p.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
