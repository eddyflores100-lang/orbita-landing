"use client"

import { motion } from "framer-motion"
import {
  Upload, Eye, Bot, Film, Music, Mic, Globe2, QrCode, BarChart3
} from "lucide-react"

const PHASES = [
  { n: "01", phase: "INGEST", title: "Upload photos", desc: "Drag-drop, ZIP, or paste URL. JPG/PNG/WebP/HEIC/AVIF. EXIF rotation, sha-256 dedupe, thumbnails.", icon: Upload, accent: "primary" },
  { n: "02", phase: "VISION", title: "GLM-4.5v understands", desc: "Detects 15 room types, objects, lighting, architectural style. Returns JSON description.", icon: Eye, accent: "cyan" },
  { n: "03", phase: "DIRECT", title: "AI Director plans", desc: "LLM builds shot plan: 11 camera moves, durations 1.4-6s, captions, tone narrative.", icon: Bot, accent: "champagne" },
  { n: "04", phase: "RENDER", title: "CogVideoX-3 i2v", desc: "Each photo → 5s cinematic clip. CogVideoX-3 image-to-video with auto-built prompts.", icon: Film, accent: "primary" },
  { n: "05", phase: "MONTAGE", title: "ffmpeg xfade", desc: "Crossfade 0.55s montage with concat copy fallback. Normalized 30fps yuv420p +faststart.", icon: Film, accent: "cyan" },
  { n: "06", phase: "MUSIC", title: "Procedural PCM", desc: "WAV 16-bit stereo, 6 styles (cinematic/ambient/uplifting/minimal/warm/epic). No licenses.", icon: Music, accent: "champagne" },
  { n: "07", phase: "VOICEOVER", title: "TTS + sidechain duck", desc: "LLM script @ 2.6 w/s, TTS 4 Spanish-flavored voices, ffmpeg sidechaincompress ducking.", icon: Mic, accent: "primary" },
  { n: "08", phase: "TOUR 3D", title: "Depth Anything V2", desc: "Point-cloud Three.js + ONNX 94MB depth estimation. Drag-look, gyro, hotspots.", icon: Globe2, accent: "cyan" },
  { n: "09", phase: "MICROSITE", title: "Publish + QR + WhatsApp", desc: "SSR /p/[slug] with hero, video, 3D, gallery, WhatsApp CTA, contact form, QR.", icon: QrCode, accent: "champagne" },
  { n: "10", phase: "ANALYTICS", title: "14-day tracking", desc: "VIEW/VIDEO_PLAY/CTA/WHATSAPP/SCAN/CONTACT. Daily + byRef + total per property.", icon: BarChart3, accent: "primary" },
]

const ACCENT_MAP: Record<string, { text: string; bg: string; border: string }> = {
  primary: { text: "text-primary-glow", bg: "bg-primary/10", border: "border-emerald/30" },
  cyan: { text: "text-cyan-light", bg: "bg-cyan/10", border: "border-cyan/30" },
  champagne: { text: "text-champagne-light", bg: "bg-champagne/10", border: "border-champagne/30" },
}

export function PipelineTab() {
  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section className="pt-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-primary-glow font-mono">
          10-phase engine
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-on-surface">
          Photos → Listing in 15 minutes
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant leading-relaxed max-w-3xl">
          Each phase is independent, cached, and resumable. If CogVideoX-3 fails,
          the Python engine3d.py fallback kicks in (Depth Anything V2 + dense
          LDI warp). Re-renders are instant thanks to clip SHA-1 caching.
        </p>
      </section>

      {/* Pipeline as a single connected flow */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PHASES.map((p, i) => {
            const Icon = p.icon
            const accent = ACCENT_MAP[p.accent]
            return (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: (i % 5) * 0.06 }}
                className={`specular-border luxury-glass rounded-xl p-4 border ${accent.border}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-9 w-9 rounded-lg ${accent.bg} ${accent.border} border grid place-items-center`}>
                    <Icon className={`h-4 w-4 ${accent.text}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-mono">
                    {p.n} · {p.phase}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-on-surface mb-1.5">
                  {p.title}
                </h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Time timeline */}
      <section className="rounded-2xl border border-white/[0.06] bg-surface-raised/30 p-5 sm:p-7">
        <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-on-surface-variant mb-4">
          Wall clock — full pipeline
        </div>
        <div className="space-y-3">
          {[
            { t: "0:00", label: "Photo upload starts", accent: "primary" },
            { t: "0:30", label: "Vision analysis complete (GLM-4.5v batch of 3)", accent: "cyan" },
            { t: "1:00", label: "AI Director plan ready (LLM JSON validated)", accent: "champagne" },
            { t: "1:15", label: "Render queue enqueued — 6-9 clips in parallel", accent: "primary" },
            { t: "8:00", label: "All CogVideoX-3 clips done + cached (SHA-1 keyed)", accent: "cyan" },
            { t: "9:00", label: "ffmpeg xfade montage + slow-mo normalization", accent: "champagne" },
            { t: "10:00", label: "Procedural music synthesized (WAV 16-bit stereo)", accent: "primary" },
            { t: "11:00", label: "TTS voiceover mixed with sidechaincompress ducking", accent: "cyan" },
            { t: "12:00", label: "Master ffmpeg +faststart + thumbnail @ 0.6s", accent: "champagne" },
            { t: "13:00", label: "Microsite published at /p/[slug] + QR PNG + analytics live", accent: "primary" },
          ].map((step, i) => {
            const accent = ACCENT_MAP[step.accent]
            return (
              <motion.div
                key={step.t}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="flex items-center gap-3"
              >
                <span className={`text-xs font-mono font-bold tabular-nums w-12 ${accent.text}`}>
                  {step.t}
                </span>
                <div className={`h-2 w-2 rounded-full ${accent.bg.replace("/10", "/80")}`} />
                <span className="text-xs text-on-surface leading-relaxed">{step.label}</span>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Quality modes + formats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { mode: "speed", title: "Speed mode", desc: "Draft quality in 5 minutes. 720p. For rapid iteration.", accent: "cyan" },
          { mode: "quality", title: "Quality mode", desc: "Final master in 12-15 minutes. 1080p. Production-ready.", accent: "primary" },
          { mode: "formats", title: "3 native formats", desc: "16:9 landscape (1280×720/1920×1080), 9:16 vertical (Reels/TikTok), 1:1 square (Instagram feed).", accent: "champagne" },
        ].map((m) => {
          const accent = ACCENT_MAP[m.accent]
          return (
            <div key={m.mode} className={`p-4 rounded-xl bg-surface-raised/40 border ${accent.border}`}>
              <div className={`text-[10px] uppercase tracking-wider font-mono ${accent.text} mb-1.5`}>
                {m.mode}
              </div>
              <div className="text-sm font-semibold text-on-surface mb-1">{m.title}</div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">{m.desc}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}
