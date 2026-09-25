"use client"

export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden>
      {/* Aurora blobs */}
      <div
        className="absolute top-[-15vw] left-[-5vw] w-[55vw] h-[55vw] rounded-full opacity-60 blur-[140px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.22) 0%, transparent 60%)",
          animation: "aurora-1 22s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute bottom-[-15vw] right-[-5vw] w-[55vw] h-[55vw] rounded-full opacity-60 blur-[140px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.18) 0%, transparent 60%)",
          animation: "aurora-2 26s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute top-[40%] left-[40%] w-[35vw] h-[35vw] rounded-full opacity-40 blur-[140px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.10) 0%, transparent 60%)",
          animation: "float-slow 12s ease-in-out infinite alternate",
        }}
      />
      {/* Cinema mesh grid */}
      <div
        className="absolute inset-0 opacity-50 cinema-mesh"
        style={{
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      {/* Top hairline glow */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-glow/30 to-transparent" />
    </div>
  )
}
