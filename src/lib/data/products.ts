export type Product = {
  id: string
  name: string
  tagline: string
  description: string
  category: string
  status: "live" | "beta" | "enterprise"
  accent: string
  stack: string[]
  metrics: { label: string; value: string }[]
  highlights: string[]
  url: string
  repo: string
  license: string
}

export const products: Product[] = [
  {
    id: "marketnow",
    name: "MarketNow",
    tagline: "Trust root for AI agents",
    description:
      "Infrastructure layer for AI agent security. The Sentinel audit pipeline scans MCP servers across 10 layers (static, dynamic sandbox, runtime interception), issues cryptographic Agent Trust Cards (Ed25519), and anchors everything to a Sigstore transparency log. The free MCP registry (9,248 skills, 68,388 servers) is the funnel; Sentinel enterprise is the product.",
    category: "AI Trust Infrastructure",
    status: "live",
    accent: "emerald",
    stack: ["TypeScript", "gVisor", "semgrep", "YARA", "Ed25519", "MCP", "Sigstore"],
    metrics: [
      { label: "Skills indexed", value: "9,248" },
      { label: "Servers scanned", value: "68,388" },
      { label: "Threats detected", value: "1,030" },
      { label: "Quarantined", value: "80" },
    ],
    highlights: [
      "10-layer Sentinel audit pipeline",
      "Agent Trust Card (ATC) cryptographic identity",
      "Sigstore-anchored transparency log",
      "Cursor IDE plugin + npm packages",
    ],
    url: "https://marketnow.site",
    repo: "eddyflores100-lang/marketnow",
    license: "Dual MIT/Apache",
  },
  {
    id: "vigia-ml",
    name: "Vigia-ML",
    tagline: "Predictive console for gas wells",
    description:
      "Industrial ML platform for natural-gas well fields. Three models train live in the browser (TensorFlow.js/WebGL): LSTM forecasting (6/12/24h), autoencoder anomaly detection, dense classifier for 5 fault classes. Full N1-N5 analytical pipeline with statistical fallback. Synthetic SCADA simulator — production-grade engineering, source-available under AL-1.0 for industrial licensing.",
    category: "Oil & Gas Industrial AI",
    status: "enterprise",
    accent: "amber",
    stack: ["React 18", "TypeScript", "TensorFlow.js", "WebGL", "Vite", "Vitest"],
    metrics: [
      { label: "ML models live", value: "3" },
      { label: "Unit tests", value: "173" },
      { label: "E2E tests", value: "11" },
      { label: "Pipeline stages", value: "5 (N1-N5)" },
    ],
    highlights: [
      "Live in-browser training (no server deploy)",
      "LSTM forecasting + autoencoder anomaly detection",
      "Statistical fallback during training warmup",
      "IEC 62443-ready for OT procurement",
    ],
    url: "https://github.com/eddyflores100-lang/vigia-ml",
    repo: "eddyflores100-lang/vigia-ml",
    license: "AL-1.0 (source-available)",
  },
  {
    id: "memex",
    name: "Memex",
    tagline: "Local-first agent memory (zero-LLM)",
    description:
      "Memory for AI agents that returns verbatim passages — no LLM in the retrieval path. BM25 + dense + reciprocal-rank-fusion produces factual retrieval while competitors (mem0, Zep, Letta) summarize. Cost: $0 vs $2-$4 per 1,000 queries. Vertical packaging for Healthcare (HIPAA), Finance, and Legal (privilege) — industries that cannot ship data to cloud LLMs.",
    category: "AI Memory Infrastructure",
    status: "beta",
    accent: "cyan",
    stack: ["Python", "ChromaDB", "Rust", "Go", "TypeScript", "Ollama"],
    metrics: [
      { label: "Cost / 1K queries", value: "$0" },
      { label: "vs mem0 baseline", value: "49% vs 49%" },
      { label: "vs Zep baseline", value: "63.8%" },
      { label: "PyPI version", value: "0.3.0rc1" },
    ],
    highlights: [
      "Zero-LLM retrieval path = verbatim fidelity",
      "Local-first (ChromaDB + Ollama embeddings)",
      "Enterprise verticals: HIPAA / Finance / Legal",
      "Rust + Go + TS bindings for production",
    ],
    url: "https://memex.alicelabs.site",
    repo: "eddyflores100-lang/memex",
    license: "AL-1.0 (commercial license required)",
  },
  {
    id: "opensam",
    name: "OpenSAM",
    tagline: "Federal contracting agent platform",
    description:
      "Open-source toolkit to find, filter, score, and act on SAM.gov opportunities. Three zero-dependency npm packages (types, SDK, scoring) with deterministic 0-100 viability scoring (NAICS match +25, set-aside +10-15, capability keywords up to +20, deadline penalties). Live at opensam.us — open-core alternative to GovWin ($200-$2,000/mo).",
    category: "GovTech",
    status: "live",
    accent: "rose",
    stack: ["TypeScript SDK", "Vite + React", "Node 18+/Edge", "SAM.gov API"],
    metrics: [
      { label: "npm packages", value: "3" },
      { label: "Runtime deps", value: "0" },
      { label: "Viability score", value: "0-100" },
      { label: "Live site", value: "opensam.us" },
    ],
    highlights: [
      "Deterministic transparent scoring (vs black-box incumbents)",
      "Zero-dependency SDK (Node 18+ / browser / Edge)",
      "8(a) / HUBZone / WOSB / SDVOSB set-aside support",
      "Open-core model (free SDK + hosted premium)",
    ],
    url: "https://opensam.us",
    repo: "eddyflores100-lang/OpenSAM",
    license: "MIT",
  },
  {
    id: "orbita",
    name: "Orbita",
    tagline: "Property content engine for real estate",
    description:
      "PropTech SaaS that turns property photos into cinematic AI video (CogVideoX image-to-video), 3D tours, publishable microsites with QR + analytics. One property in, infinite content out (16:9 / 9:16 Reels / 1:1). Spanish-first, Ecuador-built — fast lane to LATAM brokerages. Local geometric fallback when AI services fail guarantees SLA-grade output.",
    category: "PropTech AI",
    status: "beta",
    accent: "violet",
    stack: ["Next.js 16", "Prisma + SQLite", "z-ai-web-dev-sdk", "ffmpeg", "depth_anything"],
    metrics: [
      { label: "Output formats", value: "3 (16:9, 9:16, 1:1)" },
      { label: "Content types", value: "Video + 3D + Microsite" },
      { label: "Tone profiles", value: "Luxury / Airbnb / Boutique" },
      { label: "Fallback layer", value: "Local geometric" },
    ],
    highlights: [
      "AI Director plans every shot",
      "CogVideoX image-to-video generation",
      "Microsite + QR + analytics in one flow",
      "Local fallback for SLA-grade uptime",
    ],
    url: "https://github.com/eddyflores100-lang/Orbita",
    repo: "eddyflores100-lang/Orbita",
    license: "MIT",
  },
]

export const companyStats = [
  { label: "Public repositories", value: "42" },
  { label: "Live products", value: "5" },
  { label: "npm packages", value: "14" },
  { label: "MCP servers indexed", value: "68,388" },
  { label: "Verticals served", value: "8+" },
  { label: "Founded", value: "2026" },
]

export const industries = [
  {
    name: "AI Agent Trust & Security",
    products: ["MarketNow", "UTA", "MarketNow-MCP"],
    description: "The trust root for the agentic web — credentials, audits, transparency logs.",
    icon: "ShieldCheck",
  },
  {
    name: "Oil & Gas / Industrial",
    products: ["Vigia-ML"],
    description: "Edge-AI predictive maintenance for gas wells, pipelines, and SCADA fields.",
    icon: "Gauge",
  },
  {
    name: "Regulated AI Memory",
    products: ["Memex", "Bóveda", "Recall-MCP"],
    description: "HIPAA / Finance / Legal — verbatim retrieval, zero data egress.",
    icon: "Database",
  },
  {
    name: "GovTech & Federal",
    products: ["OpenSAM"],
    description: "SAM.gov contracting agent for 8(a) / HUBZone / WOSB / SDVOSB small businesses.",
    icon: "Landmark",
  },
  {
    name: "PropTech & Real Estate",
    products: ["Orbita"],
    description: "Property photos → cinematic video → microsite → analytics. One flow, infinite content.",
    icon: "Home",
  },
  {
    name: "Startup Due Diligence",
    products: ["OpenGravity"],
    description: "Bayesian + Monte Carlo oracle calibrated against 100 historical cases (Airbnb, Stripe, Theranos).",
    icon: "TrendingUp",
  },
]

export const techStack = [
  { name: "Next.js 16", category: "Framework" },
  { name: "TypeScript 5", category: "Language" },
  { name: "Prisma ORM", category: "Database" },
  { name: "TensorFlow.js", category: "ML Runtime" },
  { name: "ChromaDB", category: "Vector DB" },
  { name: "Sigstore Rekor", category: "Transparency Log" },
  { name: "Ed25519", category: "Cryptography" },
  { name: "gVisor", category: "Sandboxing" },
  { name: "semgrep + YARA", category: "Static Analysis" },
  { name: "MCP (Model Context Protocol)", category: "Agent Standard" },
  { name: "CogVideoX", category: "Generative Video" },
  { name: "Rust + Go", category: "Systems Bindings" },
]
